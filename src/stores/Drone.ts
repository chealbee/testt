import { create } from "zustand";

interface IUseDrone {
  droneOffsettoTop: number; //max 20
  droneWidth: number;
  droneSize: number;
  dronePosition: number;
  setDronePosition: (position: number | "base") => void;
  setDroneSize: (size: number) => void;
}
export const useDrone = create<IUseDrone>((set) => ({
  droneOffsettoTop: 20,
  droneWidth: 20,
  dronePosition: 250,
  droneSize: 50,

  setDronePosition: (position: number | "base") => {
    set((state) => {
      if (position == "base") {
        return {
          dronePosition: 250,
        };
      } else {
        return {
          dronePosition: Math.max(
            Math.min(
              state.dronePosition + position,
              500 - (state.droneSize - 20) / 2
            ),
            (state.droneSize - 20) / 2
          ),
        };
      }
    });
  },
  setDroneSize: (size: number) => {
    set({ droneSize: size });
  },
}));

/* drone pos dots left: ${dronePos - droneWidth / 2},${20}
                right: ${dronePos + droneWidth / 2},${20}
                nose: ${dronePos},${droneSize} */

//  const DroneRightBack = [dronePosition + droneWidth / 2, droneToTop];
//  const DroneLeftBack = [dronePosition - droneWidth / 2, droneToTop];
// const DroneNose = [dronePosition, droneSize];
// console.log(meseges.left[droneSize / 10] >= DroneNose[0]);
