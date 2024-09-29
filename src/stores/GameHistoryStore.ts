import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export const useGamehistory = create(
  persist<state & actions>(
    (set) => ({
      historyList: [],
      addGameHistory: (name, score, difficulty) =>
        set((state) => ({
          historyList: [...state.historyList, { name, score, difficulty }],
        })),
    }),
    {
      name: "hostory-of-games",
    }
  )
);
