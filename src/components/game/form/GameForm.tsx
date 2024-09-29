import { FormEvent } from "react";
import { useForm } from "../../../stores/Form";
import { useDrone } from "../../../stores/Drone";

const GameForm = ({
  onSubmit,
  isFormValid,
}: {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isFormValid: boolean;
}) => {
  const { formData, setFormData } = useForm();
  const droneSize = useDrone((state) => state.droneSize);
  const setDroneSize = useDrone((state) => state.setDroneSize);
  return (
    <form className="gameStartingform" onSubmit={(e) => onSubmit(e)}>
      {!isFormValid && <p className="errText">form unvalid</p>}
      <p>Enter player name: {formData.name}</p>
      <input
        type="text"
        className="gameStartingform__input"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <p>Select game difficulty: {formData.difficulty}</p>
      <input
        value={formData.difficulty}
        onChange={(e) =>
          setFormData({ ...formData, difficulty: +e.target.value })
        }
        type="range"
        max={10}
        min={1}
        defaultValue={1}
        step={1}
        placeholder="enter name"
      />
      <div className="separator"></div>
      <p className="PopuHeading">parameters for fun:</p>
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
      <p>size of the walls: {formData.wallHight}</p>
      <input
        value={formData.wallHight}
        onChange={(e) =>
          setFormData({ ...formData, wallHight: +e.target.value })
        }
        type="range"
        max={15}
        min={3}
        defaultValue={10}
        step={1}
      />
      <p>speed of drone: {formData.droneSpeed}</p>
      <input
        value={formData.droneSpeed}
        onChange={(e) =>
          setFormData({ ...formData, droneSpeed: +e.target.value })
        }
        type="range"
        max={15}
        min={1}
        defaultValue={7}
        step={1}
      />
      {/* <div className="separator"></div>
      <div className="row">
        <p>save lost games for history?</p>
        <input
          type="checkbox"
          checked={formData.saveLost}
          onChange={(e) =>
            setFormData({ ...formData, saveLost: e.target.checked })
          }
        />
      </div> */}
      <button>start game</button>
    </form>
  );
};

export default GameForm;
