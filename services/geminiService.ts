
import { GoogleGenAI, Type } from "@google/genai";
import { ChallengeType, ChallengeData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts participant names from a text block.
 */
export async function extractPlayers(context: string): Promise<string[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extrae una lista de nombres de las personas/participantes mencionados en el siguiente texto que van a jugar juntos. Devuelve ÚNICAMENTE un array JSON de strings con los nombres. El texto está en español. Texto: "${context}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse extracted players", e);
    return [];
  }
}

export async function generateChallenge(
  type: ChallengeType,
  context: string,
  players: string[],
  history: string[]
): Promise<ChallengeData> {
  const model = type === ChallengeType.IMAGE_GUESS ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview';
  const avoidPrompt = history.length > 0 ? `\n\nIMPORTANTE: No repitas ni uses temas similares a estos que ya han salido: ${history.join(', ')}.` : '';
  const languagePrompt = "Responde siempre en ESPAÑOL DE ESPAÑA, usando expresiones naturales de España.";

  if (type === ChallengeType.IMAGE_GUESS) {
    const promptResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Basándote en este contexto sobre estas personas: "${context}", elige UN dato específico e interesante sobre UNO de estos participantes: ${players.join(', ')}. 
      Describe una escena visual que represente este dato SIN usar texto ni mostrar caras reconocibles. ${avoidPrompt} ${languagePrompt}
      Devuelve un JSON con los campos: 'relatedPlayer', 'description' (explicación del dato en español de España), 'visualPrompt' (en inglés para el generador de imágenes).`,
      config: { responseMimeType: "application/json" }
    });
    
    const parsed = JSON.parse(promptResponse.text || '{}');
    
    const imageRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `A vibrant, fun, flat-design illustration for a party game showing: ${parsed.visualPrompt}` }] }
    });

    let imageUrl = '';
    for (const part of imageRes.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    const distractors = players.filter(p => p !== parsed.relatedPlayer).slice(0, 3);

    return {
      imageUrl,
      relatedPlayerName: parsed.relatedPlayer,
      distractors,
      description: parsed.description
    } as any;
  }

  const mcSchema = {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.STRING },
      explanation: { type: Type.STRING }
    },
    required: ["question", "options", "correctAnswer", "explanation"]
  };

  const schemaMap: Record<ChallengeType, any> = {
    [ChallengeType.MULTIPLE_CHOICE]: mcSchema,
    [ChallengeType.PLAYER_TRIVIA]: mcSchema,
    [ChallengeType.HANGMAN]: {
      type: Type.OBJECT,
      properties: {
        word: { type: Type.STRING },
        hint: { type: Type.STRING }
      },
      required: ["word", "hint"]
    },
    [ChallengeType.MATCH_PAIRS]: {
      type: Type.OBJECT,
      properties: {
        pairs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              left: { type: Type.STRING },
              right: { type: Type.STRING }
            },
            required: ["left", "right"]
          }
        }
      },
      required: ["pairs"]
    },
    [ChallengeType.IMAGE_GUESS]: {}
  };

  const prompts: Record<ChallengeType, string> = {
    [ChallengeType.MULTIPLE_CHOICE]: `Crea una pregunta de cultura general o curiosidades basada en este texto: "${context}". ${avoidPrompt} ${languagePrompt}`,
    [ChallengeType.PLAYER_TRIVIA]: `Crea una pregunta divertida de elección múltiple sobre los participantes (${players.join(', ')}) usando este texto: "${context}". La pregunta debe ser sobre algo que uno de ellos haya hecho o un dato personal. ${avoidPrompt} ${languagePrompt}`,
    [ChallengeType.HANGMAN]: `Elige una palabra o frase corta específica de este texto: "${context}" que se refiera a uno de los participantes (${players.join(', ')}). Proporciona una pista. ${avoidPrompt} ${languagePrompt}`,
    [ChallengeType.MATCH_PAIRS]: `Crea 4 parejas de elementos para unir (ej: Persona - Dato, Persona - Afición) basándote en este texto: "${context}" para los participantes ${players.join(', ')}. ${avoidPrompt} ${languagePrompt}`,
    [ChallengeType.IMAGE_GUESS]: ""
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompts[type],
    config: {
      responseMimeType: "application/json",
      responseSchema: schemaMap[type]
    }
  });

  return JSON.parse(response.text || '{}');
}
