import { create } from "zustand";

interface state {
  historyList: {
    name: string;
    score: number;
    difficulty: number;
  }[];
}
interface actions {
  addGameHistory: (name: string, score: number, difficulty: number) => void;
}

export const useGamehistory = create<state & actions>((set) => ({
  historyList: [
    { name: "zakharii", score: 123, difficulty: 5 },
    { name: "ivan", score: 13, difficulty: 10 },
  ],
  addGameHistory: (name, score, difficulty) =>
    set((state) => ({
      historyList: [...state.historyList, { name, score, difficulty }],
    })),
}));
