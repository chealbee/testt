import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import "./styles/null.scss";
import "./styles/styles.scss";
import Modal from "./components/ui/modal/Modal";
import BaseButton from "./components/ui/button/BaseButton";
import GameHistory from "./components/game/gameHistory/GameHistory";
import GameDataScreen from "./components/game/dataScreen/GameDataScreen";
import { useModal } from "./hooks/useModal";
import Drone from "./components/game/drone/Drone";
import { useStartGame } from "./stores/StartGame";
import { useDrone } from "./stores/Drone";
import { useForm } from "./stores/Form";
import { createWalls } from "./utils/wall/createWall";
import renderGameStatus from "./components/game/gameStatus/GameStatus";
import GameForm from "./components/game/form/GameForm";
import { useGamehistory } from "./stores/GameHistoryStore";

function App() {
  const animationFrameId = useRef<number>();
  const addGameHistory = useGamehistory((state) => state.addGameHistory);
  const [gameHight] = useState(500);
  const [gameStatus, setGameStatus] = useState<
    "goin" | "not started" | "loading" | "win" | "loss"
  >("not started");
  const [timer, setTimer] = useState(0);
  const [timerMulti] = useState(5);
  const [score, setScore] = useState(0);
  const [verticalSpeed, setVerticalSpeed] = useState(0);
  const [horizontallSpeed, setHorizontallSpeed] = useState(1);

  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const { handleCloseModal, handleOpenModal, isModalOpen } = useModal();
  const formData = useForm((state) => state.formData);
  const { wallCoordinats, startGame, resetWallCoords } = useStartGame();
  const {
    dronePosition,
    droneOffsettoTop,
    droneSize,
    moveDrone,
    setDronePosition,
  } = useDrone();

  // отримуєсо дані для гри
  const startGameIfFormValid = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.difficulty) {
      setIsFormValid(false);
    } else {
      setIsFormValid(true);
      setGameStatus("loading");
      setScore(0);
      setHorizontallSpeed(0);
      setVerticalSpeed(1);
      setTimer(0);
      handleCloseModal();
      resetWallCoords();
      startGame({ difficulty: formData.difficulty, name: formData.name });
    }
  };

  // починаємо гру якщо є достатньо стіни
  useEffect(() => {
    if (
      wallCoordinats.left.length == Math.ceil(gameHight / formData.wallHight)
    ) {
      setGameStatus("goin");
    }
    if (wallCoordinats.left.length == 2) {
      setDronePosition((wallCoordinats.left[1] + wallCoordinats.right[1]) / 2);
    }
  }, [
    gameHight,
    wallCoordinats.left,
    formData,
    wallCoordinats.right,
    setDronePosition,
  ]);

  // перевіряємо заткнення
  const checkCollision = useCallback(() => {
    // алгротним переврки ми перевіряємо
    // чи координати країв дрона, ніс дрона та боки не дорівньоють або більші\менші координатам  стіни
    // умовно координати задньої частини дрона 190px а стіни 189px і ми рухаємо на 5px в ліво при настику і отримуємо 185

    if (gameStatus !== "goin") return;

    // ніс дрона
    const topCoordsOfDroneByY = Math.floor(droneSize / formData.wallHight);

    // задня бокова частина  (підходить для лівої і права)
    const leftOrRightCoordsOfDroneByY = Math.floor(
      droneOffsettoTop / formData.wallHight
    );

    // координати від середини дрона по x (задня(верхня) бокова частина)
    const leftOrRightCoordsOfDroneByX = (droneSize - droneOffsettoTop) / 2;

    // координати від середини дрона по x (середина боку дрона)
    const midleCoordsOfDroneByY = Math.ceil((droneSize - droneOffsettoTop) / 4);

    // середня частина половини дрона по X (середня частина біку)
    const midleCoordsOfDroneByx = Math.floor(
      (Math.floor(droneSize / formData.wallHight) +
        Math.floor(droneOffsettoTop / formData.wallHight)) /
        2
    );

    const checkCollision = (condition: boolean, text: string) => {
      if (condition) {
        if (animationFrameId.current)
          cancelAnimationFrame(animationFrameId.current);
        setGameStatus("loss");
        console.log(`${text} collision`);
      }
    };

    checkCollision(
      wallCoordinats.left[
        topCoordsOfDroneByY + Math.floor(timer / timerMulti)
      ] >= dronePosition,
      "drone nose collide left wall"
    );
    checkCollision(
      wallCoordinats.right[
        topCoordsOfDroneByY + Math.floor(timer / timerMulti)
      ] <= dronePosition,
      "drone nose collide right wall"
    );
    checkCollision(
      wallCoordinats.right[
        Math.floor(timer / timerMulti) + leftOrRightCoordsOfDroneByY
      ] <=
        dronePosition + leftOrRightCoordsOfDroneByX,
      "drone right back collide right wall"
    );
    checkCollision(
      wallCoordinats.left[
        Math.floor(timer / timerMulti) + leftOrRightCoordsOfDroneByY
      ] >=
        dronePosition - leftOrRightCoordsOfDroneByX,
      "drone left back collide left wall"
    );
    checkCollision(
      wallCoordinats.left[
        midleCoordsOfDroneByx + Math.floor(timer / timerMulti)
      ] >=
        dronePosition - midleCoordsOfDroneByY,
      "drone left side collide left wall"
    );
    checkCollision(
      wallCoordinats.right[
        midleCoordsOfDroneByx + Math.floor(timer / timerMulti)
      ] <=
        dronePosition + midleCoordsOfDroneByY,
      "drone right side collide right wall"
    );
  }, [
    gameStatus,
    droneSize,
    formData,
    droneOffsettoTop,
    wallCoordinats,
    timer,
    timerMulti,
    dronePosition,
  ]);

  useEffect(() => {
    checkCollision();
  }, [timer, dronePosition, checkCollision]);

  // рухаємо дрон
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (gameStatus !== "goin") return;
      event.preventDefault();

      switch (event.key) {
        case "ArrowLeft":
          setHorizontallSpeed((prev) => {
            if (prev > 0) return -0.1;
            return Math.max(prev - 0.1, -2);
          });
          break;
        case "ArrowRight":
          setHorizontallSpeed((prev) => {
            if (prev < 0) return 0.1;
            return Math.min(prev + 0.1, 2);
          });
          break;
        case "ArrowDown":
          setVerticalSpeed((prev) => Math.max(0, prev - 0.1));
          break;
        case "ArrowUp":
          setVerticalSpeed((prev) => Math.min(1, prev + 0.1));
          break;
      }
    },
    [gameStatus]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // анімація і розрахунок рахунку
  const gameLoop = useCallback(() => {
    if (gameStatus !== "goin") return;
    setScore((prev) =>
      parseFloat((prev + (1 - verticalSpeed) * formData.difficulty).toFixed(2))
    );

    moveDrone(horizontallSpeed);
    setTimer((prev) => {
      return prev + 1 - verticalSpeed;
    });

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [
    gameStatus,
    moveDrone,
    horizontallSpeed,
    formData.difficulty,
    verticalSpeed,
  ]);

  // заупуск анімації
  useEffect(() => {
    if (gameStatus === "goin") {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameStatus, gameLoop]);

  // якщо все пройшли (виграли гру)
  useEffect(() => {
    if (
      wallCoordinats.left.length > gameHight / formData.wallHight &&
      Math.floor(timer / timerMulti) >= wallCoordinats.left.length
    ) {
      setGameStatus("win");
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
      if (gameStatus !== "win") {
        addGameHistory(formData.name, score, formData.difficulty);
      }
    }
  }, [
    wallCoordinats.left,
    timer,
    gameHight,
    formData,
    addGameHistory,
    score,
    gameStatus,
    timerMulti,
  ]);

  return (
    <>
      <div className="game">
        <h2 className="gameHeading">drone game</h2>
        <div className="gameWraper">
          <div className="screen">
            {gameStatus === "goin" || gameStatus === "loss" ? (
              <svg width={500} height={500}>
                <polyline
                  points={createWalls(
                    wallCoordinats,
                    Math.floor(timer / timerMulti),
                    formData.wallHight
                  )}
                  fill="white"
                />
                <Drone
                  dronePosition={dronePosition}
                  droneSize={droneSize}
                  droneOffsettoTop={droneOffsettoTop}
                />
              </svg>
            ) : null}
            {renderGameStatus(gameStatus, score)}
          </div>
          {gameStatus === "goin" && (
            <GameDataScreen
              score={score}
              speedY={Math.ceil((1 - verticalSpeed) * 10) / 10}
              speedX={Math.ceil(horizontallSpeed * 10) / 10}
            />
          )}
          {gameStatus == "not started" ||
          gameStatus == "loss" ||
          gameStatus == "win" ? (
            <BaseButton onClick={handleOpenModal}>start</BaseButton>
          ) : null}
          <GameHistory />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <GameForm isFormValid={isFormValid} onSubmit={startGameIfFormValid} />
      </Modal>
    </>
  );
}

export default App;
