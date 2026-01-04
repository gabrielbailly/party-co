
export enum ChallengeType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  HANGMAN = 'HANGMAN',
  MATCH_PAIRS = 'MATCH_PAIRS',
  IMAGE_GUESS = 'IMAGE_GUESS',
  PLAYER_TRIVIA = 'PLAYER_TRIVIA'
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface MultipleChoiceChallenge {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface HangmanChallenge {
  word: string;
  hint: string;
}

export interface MatchPairsChallenge {
  pairs: { left: string; right: string }[];
}

export interface ImageGuessChallenge {
  imageUrl: string;
  relatedPlayerName: string;
  distractors: string[];
  description: string;
}

export type ChallengeData = 
  | MultipleChoiceChallenge 
  | HangmanChallenge 
  | MatchPairsChallenge 
  | ImageGuessChallenge;

export interface GameState {
  players: Player[];
  contextData: string;
  currentTurn: number;
  currentChallengeType: ChallengeType | null;
  currentChallenge: ChallengeData | null;
  isSpinning: boolean;
  gameStarted: boolean;
  history: string[]; // Added to track used topics/questions
}
