import "./styles.scss";
import { useGamehistory } from "../../../stores/GameHistoryStore";

const GameHistory = () => {
  const historyList = useGamehistory((state) => state.historyList);
  return (
    <div className="scorHistory">
      <p>game history:</p>
      {historyList?.map((el, i) => (
        <p key={i}>
          <span>{el.name}</span>
          <span>{el.score} points</span>
          <span>game difficulty: {el.difficulty}</span>
        </p>
      ))}
      {historyList.length ? null : <p>you have no previous games</p>}
    </div>
  );
};

export default GameHistory;
