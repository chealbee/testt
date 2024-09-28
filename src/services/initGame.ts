import { IgetUserId } from "../interfaces/initGame";
import { getUserId } from "./initGame/getuserId";
import { getUserToken } from "./initGame/getUserToken";

interface IFormData {
  name: string;
  difficulty: number;
}

export const initGame = async ({ name, difficulty }: IgetUserId) => {
  const userId = await getUserId({ name, difficulty });
  if (userId) {
    const userToken = await getUserToken(userId);
    if (userToken) return { userToken, userId };
  }
};

export const startGame = async (
  formData: IFormData,
  onMasage: (left: string, right: string) => void,
  onSoketClose: () => void
) => {
  const userinfo = await initGame(formData);

  const socket = new WebSocket("wss://cave-drone-server.shtoa.xyz/cave");
  socket.onopen = () => {
    socket.send(`player:${userinfo?.userId}-${userinfo?.userToken}`);
  };

  socket.onmessage = (event) => {
    const receivedData = event.data as string;
    const [left, right] = receivedData.split(",");

    if (!isNaN(Number(left)) || !isNaN(Number(right))) {
      onMasage(left, right);
    }
  };

  socket.onclose = () => {
    onSoketClose();
  };
};
