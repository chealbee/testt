import { IgetUserId, InitApiResponse } from "../../interfaces/initGame";

export const getUserId = async ({ name, difficulty }: IgetUserId) => {
  try {
    const response = await fetch("https://cave-drone-server.shtoa.xyz/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        complexity: difficulty,
        name: name,
      }),
    });

    const data: InitApiResponse = await response.json();

    return data.id;
  } catch (error) {
    console.error("Error during geting user id:", error);
  }
};
