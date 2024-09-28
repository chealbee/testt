import { create } from "zustand";

interface IUseGame {
  wall: {
    left: string[];
    right: string[];
    wall: string[];
  };
  setWall: (wall: { left: string[]; right: string[]; wall: string[] }) => void;
}
export const useGame = create<IUseGame>((set) => ({
  wall: { left: [], right: [], wall: [] },
  setWall: (wall: { left: string[]; right: string[]; wall: string[] }) => {
    set({ wall: wall });
  },
}));
