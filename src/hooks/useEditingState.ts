import React from 'react';

export enum EditAction {
  MOVE = 'move',
  RESIZE_TOP_LEFT = 'resize_top_left',
  RESIZE_TOP_RIGHT = 'resize_top_right',
  RESIZE_BOTTOM_RIGHT = 'resize_bottom_right',
  RESIZE_BOTTOM_LEFT = 'resize_bottom_left',
}

export const useEditingState = () => {
  const [active, setActive] = React.useState(false);
  const [action, setAction] = React.useState<EditAction>();
  const [position, setPosition] = React.useState<[number, number]>([0, 0]);

  const editingState = React.useMemo(() => ({ active, action, position }), [active, action, position]);
  const editingStateControl = React.useMemo(() => ({ setActive, setAction, setPosition }), [active, action, position, setActive, setAction, setPosition]);
  return [editingState, editingStateControl] as [typeof editingState, typeof editingStateControl];
}