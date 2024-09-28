import { FC } from "react";
import "./styles.scss";

interface IGameDataScreen {
  score: number;
  speedY: number;
}

const GameDataScreen: FC<IGameDataScreen> = ({ score, speedY }) => {
  return (
    <div className="gameInfoDataScreen">
      <p>Score: {score}</p>
      <p>Speed: {speedY}</p>
    </div>
  );
};

export default GameDataScreen;
