import { SVGProps } from "react";

interface IDrone extends SVGProps<SVGPolygonElement> {
  dronePosition: number;
  droneSize: number;
  droneOffsettoTop: number;
}

const Drone = ({
  dronePosition,
  droneSize,
  droneOffsettoTop,
  ...props
}: IDrone) => {
  return (
    <polygon
      points={`${dronePosition},${droneSize} ${
        dronePosition - (droneSize - droneOffsettoTop) / 2
      },${droneOffsettoTop} ${
        dronePosition + (droneSize - droneOffsettoTop) / 2
      },${droneOffsettoTop}`}
      fill="black"
      {...props}
    />
  );
};

export default Drone;
