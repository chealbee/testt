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

function App() {
  const timerId = useRef<number>();
  const [wallHight, setWallHight] = useState(20);
  const [gameHight, setGameHight] = useState(500);
  //   const [gameWidth, setGameWidth] = useState(500);
  const [gameStatus, setGameStatus] = useState<
    "goin" | "not started" | "loading" | "win" | "loss"
  >("not started");
  const [timer, setTimer] = useState(0);
  const [speed, setSpeed] = useState(200);
  const [score, setScore] = useState(0);

  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const { handleCloseModal, handleOpenModal, isModalOpen } = useModal();
  const { difficulty, name, setFormData } = useForm();
  const { wallCoordinats, startGame, resetWallCoords } = useStartGame();
  const {
    dronePosition,
    droneOffsettoTop,
    droneWidth,
    droneSize,
    moveDrone,
    setDroneSize,
    setDronePosition,
  } = useDrone();

  // отримуєсо дані і статртуємо
  const startGameIfFormValid = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isValid = !!name && !!difficulty;
    setIsFormValid(isValid);

    setGameStatus("loading");
    setScore(0);
    setSpeed(200);
    setTimer(0);
    handleCloseModal();
    resetWallCoords();
    startGame({ difficulty, name });
  };

  // стартуємо коли є достатньо стіни і ставим дрон
  useEffect(() => {
    if (wallCoordinats.left.length == Math.ceil(gameHight / wallHight)) {
      setGameStatus("goin");
    }
    // ставимо дрон посеред печери якщо початок не по середині екрану
    if (wallCoordinats.left.length == 2) {
      setDronePosition((wallCoordinats.left[1] + wallCoordinats.right[1]) / 2);
    }
  }, [
    gameHight,
    wallCoordinats.left,
    wallHight,
    moveDrone,
    wallCoordinats.right,
    setDronePosition,
  ]);

  // перевіряємо чи не врізались в стіну
  const checkIsColibed = useCallback(() => {
    if (gameStatus !== "goin") return;
    // алгротним переврки простий ми перевіряємо при "кожному" рендері
    // чи координати країв дрона, ніс дрона та боки не дорівньоють або більші\менші координатам  стіни
    // також ми перевірямо чи координати дрона не більші або менші томущо при натискані ми рухаємо
    // томущо умовно задньої частини дрона 190px а стіни 189px і ми рухаємо на 5px в ліво при настику і отримуємо 185

    const stopGame = (massage: string) => {
      clearInterval(timerId.current);
      setGameStatus("loss");
      console.log(massage);
    };

    // ніс дрона
    const topCoordsOfDroneByY = Math.floor(droneSize / wallHight);

    // задня бокова частина  (підходить для лівої і права)
    const leftOrRightCoordsOfDroneByY = Math.floor(
      droneOffsettoTop / wallHight
    );

    // координати від середини дрона по x (задня(верхня) бокова частина)
    const leftOrRightCoordsOfDroneByX = (droneSize - droneOffsettoTop) / 2;

    // координати від середини дрона по x (середина боку дрона)
    const midleCoordsOfDroneByY = Math.ceil((droneSize - droneOffsettoTop) / 4);

    // середня частина половини дрона по X (середня частина біку)
    const midleCoordsOfDroneByx = Math.floor(
      (Math.floor(droneSize / wallHight) +
        Math.floor(droneOffsettoTop / wallHight)) /
        2
    );

    if (wallCoordinats.left[topCoordsOfDroneByY + timer] >= dronePosition) {
      stopGame("drone nose colibe left wall");
    }

    if (wallCoordinats.right[topCoordsOfDroneByY + timer] <= dronePosition) {
      stopGame("drone nose colibe right wall");
    }

    if (
      wallCoordinats.right[timer + leftOrRightCoordsOfDroneByY] <=
      dronePosition + leftOrRightCoordsOfDroneByX
    ) {
      stopGame("drone right back colibe right wall");
    }

    if (
      wallCoordinats.left[timer + leftOrRightCoordsOfDroneByY] >=
      dronePosition - leftOrRightCoordsOfDroneByX
    ) {
      stopGame("drone left back colibe left wall");
    }

    if (
      wallCoordinats.left[midleCoordsOfDroneByx + timer] >=
      dronePosition - midleCoordsOfDroneByY
    ) {
      stopGame("drone left side colibe left wall");
    }

    if (
      wallCoordinats.right[midleCoordsOfDroneByx + timer] <=
      dronePosition + midleCoordsOfDroneByY
    ) {
      stopGame("drone right side colibe right wall");
    }
  }, [
    dronePosition,
    droneOffsettoTop,
    droneSize,
    gameStatus,
    timer,
    wallCoordinats.left,
    wallCoordinats.right,
    wallHight,
  ]);

  // викликаємо перевірку чи не врізались
  useEffect(() => {
    checkIsColibed();
  }, [timer, dronePosition, speed, checkIsColibed]);

  // рухаємо дрон
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (gameStatus !== "goin") return;
      event.preventDefault();

      switch (event.key) {
        case "ArrowLeft":
          moveDrone(-7);
          break;
        case "ArrowRight":
          moveDrone(7);
          break;
        case "ArrowDown":
          setSpeed((prev) => Math.max(20, prev - 10));
          break;
        case "ArrowUp":
          setSpeed((prev) => Math.min(100, prev + 10));
          break;
      }
    },
    [gameStatus, moveDrone, setSpeed]
  );

  // рухаємо дрон
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStatus, handleKeyDown]);

  // таймер
  useEffect(() => {
    if (gameStatus !== "goin") return;

    timerId.current = setInterval(() => {
      setScore((prev) => Math.floor(prev + difficulty / (speed / 100)));
      setTimer((prev) => prev + 1);
    }, speed);

    return () => {
      clearInterval(timerId.current);
    };
  }, [gameStatus, speed, difficulty]);

  // зупиняємо якщо все пролетіли (ми вигралм)
  useEffect(() => {
    if (wallCoordinats.left.length > gameHight / wallHight) return;
    if (timer >= wallCoordinats.left.length) return;

    setGameStatus("win");
    clearInterval(timerId.current);
  }, [wallCoordinats.left, timer, gameHight, wallHight]);

  return (
    <>
      <div className="game">
        <h2 className="gameHeading">drone game</h2>
        <div className="gameWraper">
          <div className="screen">
            {gameStatus === "goin" || gameStatus === "loss" ? (
              <svg width={500} height={500}>
                <polyline
                  points={createWalls(wallCoordinats, timer, wallHight)}
                  fill="white"
                />
                <Drone
                  dronePosition={dronePosition}
                  droneWidth={droneWidth}
                  droneSize={droneSize}
                  droneOffsettoTop={droneOffsettoTop}
                />
              </svg>
            ) : null}
            {renderGameStatus(gameStatus, score)}
          </div>
          {/* переробити умовні відмалювання */}
          {gameStatus === "goin" && (
            <GameDataScreen
              score={score}
              speedY={(Math.floor((100 / speed) * 100) / 100) * 100}
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
        <form
          className="gameStartingform"
          onSubmit={(e) => startGameIfFormValid(e)}
        >
          {!isFormValid && <p className="errText">form unvalid</p>}
          <p>Enter player name: {name}</p>
          <input
            type="text"
            className="gameStartingform__input"
            placeholder="Name"
            value={name}
            onChange={(e) => setFormData(e.target.value, difficulty)}
          />
          <p>Select game difficulty: {difficulty}</p>
          <input
            value={difficulty}
            onChange={(e) => setFormData(name, +e.target.value)}
            type="range"
            max={10}
            min={1}
            defaultValue={1}
            step={1}
            placeholder="enter name"
          />
          <p>size of the drone: {droneSize}</p>
          <input
            value={droneSize}
            onChange={(e) => setDroneSize(+e.target.value)}
            type="range"
            max={100}
            min={30}
            defaultValue={40}
            step={10}
          />
          <p>size of the walls: {wallHight}</p>
          <input
            value={wallHight}
            onChange={(e) => setWallHight(+e.target.value)}
            type="range"
            max={15}
            min={3}
            defaultValue={10}
            step={1}
          />
          <button>start game</button>
        </form>
      </Modal>
    </>
  );
}

export default App;

// статуси гри на екрані
const renderGameStatus = (
  gameStatus: "goin" | "not started" | "loading" | "win" | "loss",
  score: number
) => {
  switch (gameStatus) {
    case "loading":
      return <p>Loading the game...</p>;
    case "loss":
      return (
        <p className="loseScreen">
          Opps, you lost <br /> Your result: {score}
        </p>
      );
    case "win":
      return (
        <p className="winScreen">
          Congratulations, you won! <br /> Your result: {score}
        </p>
      );
    case "not started":
      return <p>Start the game</p>;
    default:
      return null;
  }
};
