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
  const timerId = useRef<number>();
  const addGameHistory = useGamehistory((state) => state.addGameHistory);
  const [gameHight] = useState(500);
  const [gameStatus, setGameStatus] = useState<
    "goin" | "not started" | "loading" | "win" | "loss"
  >("not started");
  const [timer, setTimer] = useState(0);
  const [speed, setSpeed] = useState(100);
  const [score, setScore] = useState(0);

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

  // отримуєсо дані і статртуємо
  const startGameIfFormValid = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.difficulty) {
      setIsFormValid(false);
    } else {
      setIsFormValid(true);
      setGameStatus("loading");
      setScore(0);
      setSpeed(100);
      setTimer(0);
      handleCloseModal();
      resetWallCoords();
      startGame({ difficulty: formData.difficulty, name: formData.name });
    }
  };

  // стартуємо коли є достатньо стіни і ставим дрон
  useEffect(() => {
    if (
      wallCoordinats.left.length == Math.ceil(gameHight / formData.wallHight)
    ) {
      setGameStatus("goin");
    }
    // ставимо дрон посеред печери якщо початок не по середині екрану
    if (wallCoordinats.left.length == 2) {
      setDronePosition((wallCoordinats.left[1] + wallCoordinats.right[1]) / 2);
    }
  }, [
    gameHight,
    wallCoordinats.left,
    formData,
    moveDrone,
    wallCoordinats.right,
    setDronePosition,
  ]);

  // перевіряємо чи не врізались в стіну
  const checkCollision = useCallback(() => {
    if (gameStatus != "goin") return;
    // алгротним переврки простий ми перевіряємо при "кожному" рендері
    // чи координати країв дрона, ніс дрона та боки не дорівньоють або більші\менші координатам  стіни
    // також ми перевірямо чи координати дрона не більші або менші томущо при натискані ми рухаємо
    // томущо умовно задньої частини дрона 190px а стіни 189px і ми рухаємо на 5px в ліво при настику і отримуємо 185

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
        clearInterval(timerId.current);
        setGameStatus("loss");
        console.log(`${text} collision`);
      }
    };

    checkCollision(
      wallCoordinats.left[topCoordsOfDroneByY + timer] >= dronePosition,
      "drone nose colibe left wall"
    );
    checkCollision(
      wallCoordinats.right[topCoordsOfDroneByY + timer] <= dronePosition,
      "drone nose colibe right wall"
    );
    checkCollision(
      wallCoordinats.right[timer + leftOrRightCoordsOfDroneByY] <=
        dronePosition + leftOrRightCoordsOfDroneByX,
      "drone right back colibe right wall"
    );
    checkCollision(
      wallCoordinats.left[timer + leftOrRightCoordsOfDroneByY] >=
        dronePosition - leftOrRightCoordsOfDroneByX,
      "drone left back colibe left wall"
    );
    checkCollision(
      wallCoordinats.left[midleCoordsOfDroneByx + timer] >=
        dronePosition - midleCoordsOfDroneByY,
      "drone left side colibe left wall"
    );
    checkCollision(
      wallCoordinats.right[midleCoordsOfDroneByx + timer] <=
        dronePosition + midleCoordsOfDroneByY,
      "drone right side colibe right wall"
    );
  }, [
    gameStatus,
    droneSize,
    formData.wallHight,
    droneOffsettoTop,
    wallCoordinats.left,
    wallCoordinats.right,
    timer,
    dronePosition,
  ]);

  // викликаємо перевірку чи не врізались
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
          moveDrone(-formData.droneSpeed);
          break;
        case "ArrowRight":
          moveDrone(formData.droneSpeed);
          break;
        case "ArrowDown":
          setSpeed((prev) => Math.max(20, prev - 10));
          break;
        case "ArrowUp":
          setSpeed((prev) => Math.min(100, prev + 10));
          break;
      }
    },
    [gameStatus, moveDrone, setSpeed, formData]
  );

  // рухаємо дрон
  useEffect(() => {
    console.log("FFFF");

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // таймер
  useEffect(() => {
    if (gameStatus !== "goin") return;

    timerId.current = setInterval(() => {
      setScore((prev) =>
        Math.floor(prev + formData.difficulty / (speed / 500))
      );
      setTimer((prev) => prev + 1);
    }, speed);

    return () => {
      clearInterval(timerId.current);
    };
  }, [gameStatus, speed, formData]);

  // зупиняємо якщо все пролетіли (ми вигралм)
  useEffect(() => {
    if (
      wallCoordinats.left.length > gameHight / formData.wallHight &&
      timer >= wallCoordinats.left.length
    ) {
      setGameStatus("win");
      clearInterval(timerId.current);
      if (gameStatus !== "win")
        addGameHistory(formData.name, score, formData.difficulty);
    }
  }, [
    wallCoordinats.left,
    timer,
    gameHight,
    formData,
    addGameHistory,
    score,
    gameStatus,
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
                    timer,
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
              speedY={Math.floor((100 / speed) * 100)}
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

// переробити рух
