export const leftWallCoords = (messages: number[], position: number) => {
  const filtered = messages.map((el, i) => {
    console.log("leftWallCoords");
    console.log(position);
    return [el, i * 10 - position * 10];
  });
  const filteredAnd = filtered.map((el) => el.join(","));
  return filteredAnd;
};
export const rightWallCoords = (messages: number[]) => {
  const filtered = messages.map((el, i) => {
    return [el, i * 10];
  });
  const filteredAnd = filtered.map((el) => el.join(","));

  return filteredAnd;
};
