import React from 'react';

type DrawingState = {
  start: [number, number];
  end: [number, number];
  active: boolean;
}

export const useDrawingState = () => {
  const [active, setActive] = React.useState(false);
  const [start, setStart] = React.useState<[number, number]>([0, 0]);
  const [end, setEnd] = React.useState<[number, number]>([0, 0]);
  const setStartPosition = React.useCallback((pos: [number, number]) => { setStart(pos); }, [start]);
  const setEndPosition = React.useCallback((pos: [number, number]) => { setEnd(pos); }, [setEnd]);

  const drawingState = React.useMemo(
    () => ({ active, start, end, }),
    [active, start, end]
  );
  const drawingStateControl = React.useMemo(() => ({
    setActive,
    setStartPosition,
    setEndPosition,
  }), [active, start, end, setActive, setStartPosition, setEndPosition]);

  return [drawingState, drawingStateControl] as [DrawingState, typeof drawingStateControl];
}