import { create } from "zustand";

interface IUseDrone {
  droneOffsettoTop: number;

  droneSize: number;
  dronePosition: number;
  moveDrone: (position: number) => void;
  setDroneSize: (size: number) => void;
  setDronePosition: (position: number) => void;
}
export const useDrone = create<IUseDrone>((set) => ({
  droneOffsettoTop: 20,
  dronePosition: 250,
  droneSize: 40,

  moveDrone: (position: number) => {
    set((state) => {
      return {
        dronePosition: Math.max(
          Math.min(
            state.dronePosition + position,
            500 - (state.droneSize - 20) / 2
          ),
          (state.droneSize - 20) / 2
        ),
      };
    });
  },
  setDroneSize: (size: number) => {
    set({ droneSize: size });
  },
  setDronePosition: (position: number) => set({ dronePosition: position }),
}));
