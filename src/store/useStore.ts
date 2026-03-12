import { create } from 'zustand';

export type Role = 'admin' | 'user';

export interface User {
  id: string; // The Firebase Auth UID
  name: string;
  role: Role;
}

export interface Challenge {
  id: string; // Firestore document ID
  category: string;
  points: number;
  text: string;
  isActive: boolean;
}

export interface UserCompletion {
  id: string; // Firestore document ID
  userId: string;
  challengeId: string;
  completedAt: number;
}

export interface Question {
  id: string;
  text: string;
  isActive: boolean;
}

export interface BoardSquare {
  questionId: string;
  isChecked: boolean;
}

export interface Board {
  id: string;
  userId: string;
  boardState: BoardSquare[];
}

interface AppState {
  currentUser: User | null;
  users: User[]; // For leaderboard and admin
  challenges: Challenge[];
  completions: UserCompletion[];
  questions: Question[];
  boards: Board[];
  
  // Auth
  setCurrentUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  
  // Challenges
  setChallenges: (challenges: Challenge[]) => void;
  
  // Completions
  setCompletions: (completions: UserCompletion[]) => void;

  // Questions
  addQuestion: (text: string) => void;
  updateQuestion: (id: string, text: string) => void;
  deleteQuestion: (id: string) => void;
  toggleQuestionActive: (id: string) => void;

  // Boards
  initializeBoard: (userId: string) => void;
  toggleBoardSquare: (userId: string, questionId: string) => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  users: [],
  challenges: [],
  completions: [],
  questions: [],
  boards: [],

  setCurrentUser: (user) => set({ currentUser: user }),
  setUsers: (users) => set({ users }),
  setChallenges: (challenges) => set({ challenges }),
  setCompletions: (completions) => set({ completions }),

  // Questions
  addQuestion: (text) => set((state) => ({
    questions: [
      ...state.questions,
      { id: crypto.randomUUID(), text, isActive: true }
    ]
  })),
  updateQuestion: (id, text) => set((state) => ({
    questions: state.questions.map((q) => q.id === id ? { ...q, text } : q)
  })),
  deleteQuestion: (id) => set((state) => ({
    questions: state.questions.filter((q) => q.id !== id)
  })),
  toggleQuestionActive: (id) => set((state) => ({
    questions: state.questions.map((q) => q.id === id ? { ...q, isActive: !q.isActive } : q)
  })),

  // Boards
  initializeBoard: (userId) => set((state) => {
    if (state.boards.find(b => b.userId === userId)) return state;

    // Generate a new board from active questions
    const activeQuestions = state.questions.filter(q => q.isActive);
    const shuffled = [...activeQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 24); // we need 24, center is free
    
    const boardState: BoardSquare[] = [];
    let qIndex = 0;
    
    for (let i = 0; i < 25; i++) {
        if (i === 12) {
            boardState.push({ questionId: 'FREE_SPACE', isChecked: true });
        } else {
            // handle case when there are less than 24 active questions
            const q = selected[qIndex];
            boardState.push({ questionId: q ? q.id : `BLANK_${i}`, isChecked: false });
            if (q) qIndex++;
        }
    }

    return {
        boards: [...state.boards, { id: crypto.randomUUID(), userId, boardState }]
    };
  }),
  toggleBoardSquare: (userId, questionId) => set((state) => ({
    boards: state.boards.map(b => b.userId === userId ? {
        ...b,
        boardState: b.boardState.map(sq => sq.questionId === questionId && questionId !== 'FREE_SPACE' ? { ...sq, isChecked: !sq.isChecked } : sq)
    } : b)
  }))
}));
