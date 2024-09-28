import { SVGProps } from "react";

interface IDrone extends SVGProps<SVGPolygonElement> {
  dronePosition: number;
  droneSize: number;
  droneWidth: number;
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
        dronePosition - (droneSize - 20) / 2
        //   dronePosition - droneSize / 2 / 2
      },${droneOffsettoTop} ${
        dronePosition + (droneSize - 20) / 2
      },${droneOffsettoTop}`}
      fill="black"
      // stroke="black"
      // strokeWidth="2"
      {...props}
    />
    //  <polygon
    //    points={`${dronePosition},${droneSize} ${
    //      dronePosition - droneWidth / 2
    //      //   dronePosition - droneSize / 2 / 2
    //    },${droneToTop} ${dronePosition + droneWidth / 2},${droneToTop}`}
    //    fill="black"
    //    // stroke="black"
    //    // strokeWidth="2"
    //    {...props}
    //  />
  );
};

export default Drone;
//droneWidth = droneSize /2
