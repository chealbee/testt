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

  //   отримуєсо дані і статртуємо
  const startGameIfFormValid = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !difficulty) {
      setIsFormValid(false);
    } else {
      setGameStatus("loading");
      setIsFormValid(true);
      setScore(0);
      setSpeed(100);
      setTimer(0);
      moveDrone("base");
      handleCloseModal();
      resetWallCoords();

      startGame(
        { difficulty, name },
        () => {
          //  починаємо відразу але требе тільки після 10 повідомлень
          //  setGameStatus("goin");
          //  if (wallCoordinats.left.length >= gameHight / wallHight) {
          //    setGameStatus("goin");
          //  }
        },
        undefined
      );
    }
  };
  // стартуємо коли є достатньо стіни і ставим дрон
  useEffect(() => {
    if (wallCoordinats.left.length == Math.ceil(gameHight / wallHight)) {
      setGameStatus("goin");
    }
    // ставимо дрон почсеред печери якщо початок не по середині екрану
    if (wallCoordinats.left.length == 2) {
      setDronePosition((wallCoordinats.left[0] + wallCoordinats.right[0]) / 2);
    }
  }, [
    gameHight,
    wallCoordinats.left,
    wallHight,
    moveDrone,
    wallCoordinats.right,
    setDronePosition,
  ]);
  // стартуємо коли є достатньо стіни і ставим дрон

  //   отримуєсо дані і статртуємо

  // перевіряємо чи не врізались
  const checkIsColibed = useCallback(() => {
    // алгротним простий ми перевіряємо при кожному рендері
    // чи координати країв дрона, ніс дрона та боки не дорівньоють координатам  стіни
    //  також ми перевірямо чи координати днона не більші або менші томущо при натискані ми рухаємо
    // умовно на 5 пікселів у ліво і позиція стіни можу бути більшою за позицію лівої задньої частини дрона
    //  томущо умовно задньої частини дрона 190px а стіни 189px і ми рухаємо на 5px в ліво при настику і отримуємо 185
    // цими перевіряємо зіткнення передом та зайдніми краями
    if (gameStatus == "goin") {
      // для перевірки зіткнення переду
      if (
        wallCoordinats.left[Math.floor(droneSize / wallHight) + timer] >=
        dronePosition
      ) {
        console.log("nose colibe left");
        clearInterval(timerId.current);
        setGameStatus("loss");
      }
      if (
        wallCoordinats.right[Math.floor(droneSize / wallHight) + timer] <=
        dronePosition
      ) {
        console.log("nose colibe right");
        clearInterval(timerId.current);
        setGameStatus("loss");
      }
      // для перевірки зіткнення задніх частин
      if (
        // замінити перевірку яка точка щоб учитовало висоту стіни
        wallCoordinats.right[
          timer + Math.floor(droneOffsettoTop / wallHight)
        ] <=
        dronePosition + (droneSize - droneOffsettoTop) / 2
      ) {
        console.log("right colibe right");
        clearInterval(timerId.current);
        setGameStatus("loss");
      }
      if (
        wallCoordinats.left[timer + Math.floor(droneOffsettoTop / wallHight)] >=
        dronePosition - (droneSize - droneOffsettoTop) / 2
      ) {
        console.log("left colibe left");
        clearInterval(timerId.current);
        setGameStatus("loss");
      }
      // для перевірки зіткнення боком
      if (
        wallCoordinats.left[
          Math.ceil((droneSize - droneOffsettoTop) / wallHight) + timer
        ] >=
        dronePosition - Math.ceil((droneSize - droneOffsettoTop) / 2) / 2
      ) {
        console.log("left side colibe left");
        clearInterval(timerId.current);
        setGameStatus("loss");
      }
      if (
        wallCoordinats.right[
          Math.ceil((droneSize - droneOffsettoTop) / wallHight) + timer
        ] <=
        dronePosition + Math.ceil((droneSize - droneOffsettoTop) / 2) / 2
      ) {
        console.log("right side colibe right");
        clearInterval(timerId.current);
        setGameStatus("loss");
      }
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

  useEffect(() => {
    checkIsColibed();
  }, [timer, dronePosition, speed, checkIsColibed]);
  // перевіряємо чи не врізались

  // рухаємо дрон
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (gameStatus == "goin")
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveDrone(-7);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          moveDrone(7);
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          setSpeed((prev) => Math.max(20, prev - 10));
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setSpeed((prev) => Math.min(100, prev + 10));
        }
    },
    [gameStatus, moveDrone, setSpeed]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStatus, handleKeyDown]);
  // рухаємо дрон

  // таймер
  useEffect(() => {
    if (gameStatus == "goin") {
      timerId.current = setInterval(() => {
        //додємо счет гравця
        setScore((prev) => {
          const multi = speed / 100;
          const multi2 = difficulty / multi;

          return Math.floor(prev + multi2);
        });

        // встановлюємо таймер в стейт
        setTimer((prev) => {
          const newValue = prev + 1;
          return newValue;
        });
      }, speed);

      return () => {
        clearInterval(timerId.current);
      };
    }
  }, [gameStatus, speed, difficulty]);
  // таймер

  // зупиняємо якщо все пролетіли (ми вигралм)
  useEffect(() => {
    if (wallCoordinats.left.length > gameHight / wallHight)
      if (timer >= wallCoordinats.left.length) {
        setGameStatus("win");
        clearInterval(timerId.current);
      }
  }, [wallCoordinats.left, timer, gameHight, wallHight]);
  // зупиняємо якщо все пролетіли (ми вигралм)

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
            {gameStatus === "loading" ? <p>loading the game...</p> : null}
            {gameStatus === "loss" ? (
              <p className="loseScreen">
                opps you loss <br />
                <br />
                your result:{score}
              </p>
            ) : null}
            {gameStatus === "win" ? (
              <p className="winScreen">
                congratulations you won <br />
                <br />
                your result:{score}
              </p>
            ) : null}
            {gameStatus === "not started" ? <p>start the game</p> : null}
          </div>
          {/* переробити умовні відмалювання */}
          {gameStatus == "goin" ? (
            <GameDataScreen
              score={score}
              speedY={(Math.floor((100 / speed) * 100) / 100) * 100}
            />
          ) : null}

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
          {/* в планах зробити зміну висоти стін */}
          {/* <p>висота стін: </p> */}
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
