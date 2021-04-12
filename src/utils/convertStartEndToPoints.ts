export const convertStartEndToPoints = (start: [number, number], end: [number, number]) => {
  return [
    [start[0], start[1]],
    [end[0], start[1]],
    [end[0], end[1]],
    [start[0], end[1]],
  ] as [
    [number, number],
    [number, number],
    [number, number],
    [number, number],
  ];
}