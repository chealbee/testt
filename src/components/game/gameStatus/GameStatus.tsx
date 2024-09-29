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

export default renderGameStatus;
