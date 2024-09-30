import { create } from "zustand";
import { initGame } from "../services/initGame/initGame";
interface IFormData {
  name: string;
  difficulty: number;
}

interface IuseStartGame {
  wallCoordinats: {
    left: number[];
    right: number[];
  };
  startGame: (
    formData: IFormData,
    onMasage?: (left: string, right: string) => void,
    onSoketClose?: () => void
  ) => void;
  resetWallCoords: () => void;
}

export const useStartGame = create<IuseStartGame>((set, get) => ({
  wallCoordinats: {
    left: [],
    right: [],
  },
  startGame: async (formData, onMasage, onSoketClose) => {
    set({ wallCoordinats: { left: [], right: [] } });
    const userinfo = await initGame(formData);

    const socket = new WebSocket("wss://cave-drone-server.shtoa.xyz/cave");
    socket.onopen = () => {
      socket.send(`player:${userinfo?.userId}-${userinfo?.userToken}`);
    };

    socket.onmessage = (event) => {
      const receivedData = event.data as string;
      const [left, right] = receivedData.split(",");

      if (!isNaN(Number(left)) || !isNaN(Number(right))) {
        if (onMasage) onMasage(left, right);
        set({
          wallCoordinats: {
            left: [...get().wallCoordinats.left, Number(left) + 250],
            right: [...get().wallCoordinats.right, Number(right) + 250],
          },
        });
      }
    };

    socket.onclose = () => {
      if (onSoketClose) onSoketClose();
    };
  },
  resetWallCoords: () => {
    set({ wallCoordinats: { left: [], right: [] } });
  },
}));
