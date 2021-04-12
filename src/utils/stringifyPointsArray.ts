export const stringifyPointsArray = (arr: [number, number][]) => (
  arr.map(v => v.join(',')).join(',')
);