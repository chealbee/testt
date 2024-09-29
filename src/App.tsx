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
  const [timerMulti, setTimerMulti] = useState(5);
  const [speed, setSpeed] = useState(1);
  const [score, setScore] = useState(0);
  const [verticalSpeed, setVerticalSpeed] = useState(1);
  const [horizontallSpeed, setHorizontallSpeed] = useState(0);

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

  const checkCollision = useCallback(() => {
    if (gameStatus !== "goin") return;

    const topCoordsOfDroneByY = Math.floor(droneSize / formData.wallHight);
    const leftOrRightCoordsOfDroneByY = Math.floor(
      droneOffsettoTop / formData.wallHight
    );
    const leftOrRightCoordsOfDroneByX = (droneSize - droneOffsettoTop) / 2;
    const midleCoordsOfDroneByY = Math.ceil((droneSize - droneOffsettoTop) / 4);
    const midleCoordsOfDroneByx = Math.floor(
      (Math.floor(droneSize / formData.wallHight) +
        Math.floor(droneOffsettoTop / formData.wallHight)) /
        2
    );

    const checkCollision = (condition: boolean, text: string) => {
      if (condition) {
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
    formData.wallHight,
    droneOffsettoTop,
    wallCoordinats.left,
    wallCoordinats.right,
    timer,
    dronePosition,
  ]);

  useEffect(() => {
    checkCollision();
  }, [timer, dronePosition, checkCollision]);

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
    [gameStatus, moveDrone, setSpeed, formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const gameLoop = useCallback(() => {
    if (gameStatus !== "goin") return;
    moveDrone(horizontallSpeed);
    setTimer((prev) => {
      return prev + 1 - verticalSpeed;
    });

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameStatus, speed, verticalSpeed, horizontallSpeed]);

  useEffect(() => {
    if (gameStatus === "goin") {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameStatus, gameLoop]);

  useEffect(() => {
    if (
      wallCoordinats.left.length > gameHight / formData.wallHight &&
      Math.floor(timer / timerMulti) >= wallCoordinats.left.length
    ) {
      setGameStatus("win");
      cancelAnimationFrame(animationFrameId.current);
      if (gameStatus !== "win") {
        addGameHistory(formData.name, score, formData.difficulty);
      }
    }
  }, [
    speed,
    wallCoordinats.left,
    timer,
    gameHight,
    formData,
    addGameHistory,
    score,
    gameStatus,
    timerMulti,
  ]);
  //
  //
  //
  //
  //
  //

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
