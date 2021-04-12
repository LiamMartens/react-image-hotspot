export const multiplyPoint = (point: [number, number], factor: [number, number]): [number, number] => {
  return [point[0] * factor[0], point[1] * factor[1]];
}