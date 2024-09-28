import { TokenResponse } from "../../interfaces/initGame";

export const getUserToken = async (userId: string) => {
  try {
    const responses = await Promise.all([
      fetch(`https://cave-drone-server.shtoa.xyz/token/1?id=${userId}`),
      fetch(`https://cave-drone-server.shtoa.xyz/token/2?id=${userId}`),
      fetch(`https://cave-drone-server.shtoa.xyz/token/3?id=${userId}`),
      fetch(`https://cave-drone-server.shtoa.xyz/token/4?id=${userId}`),
    ]);

    const data: TokenResponse[] = await Promise.all(
      responses.map((response) => response.json())
    );

    return data.map((el) => el.chunk).join("");
  } catch (error) {
    console.error("Error fetching tokens:", error);
  }
};
