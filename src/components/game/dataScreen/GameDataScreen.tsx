import { FC } from "react";
import "./styles.scss";

interface IGameDataScreen {
  score: number;
  speedY: number;
  speedX: number;
}

const GameDataScreen: FC<IGameDataScreen> = ({ score, speedY, speedX }) => {
  return (
    <div className="gameInfoDataScreen">
      <p>Score: {score}</p>
      <p>Speed Y: {speedY}</p>
      <p>Speed X: {speedX}</p>
    </div>
  );
};

export default GameDataScreen;
