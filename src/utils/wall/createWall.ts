// створюємо стіну
export const createWalls = (
  wallCoordinats: { left: number[]; right: number[] },
  timer: number,
  wallHight: number
) => {
  const leftCoords = wallCoordinats.left.map(
    (el, i) => `${el},${i * wallHight - timer * wallHight}`
  );
  const RightCoords = wallCoordinats.right.map(
    (el, i) => `${el},${i * wallHight - timer * wallHight}`
  );

  const stringWall =
    leftCoords.join(" ") + " " + RightCoords.reverse().join(" ");

  return stringWall;
};
