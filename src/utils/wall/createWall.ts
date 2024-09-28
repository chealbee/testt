// створюємо стіну
export const createWalls = (
  wallCoordinats: { left: number[]; right: number[] },
  timer: number
) => {
  // можна зробити висоту між координатами стіни меншими але тоді печера занадто сильно кривою і дрон повинен бути дуже маленьким
  //max 20 мфж точками по y
  const leftCoords = wallCoordinats.left.map(
    (el, i) => `${el},${i * 10 - timer * 10}`
  );
  const RightCoords = wallCoordinats.right.map(
    (el, i) => `${el},${i * 10 - timer * 10}`
  );

  const stringWall =
    leftCoords.join(" ") + " " + RightCoords.reverse().join(" ");

  return stringWall;
};
// створюємо стіну
