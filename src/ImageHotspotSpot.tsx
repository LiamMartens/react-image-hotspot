import React from 'react';
import { useEditingState } from './hooks';
import styles from './ImageHotspot.module.css';
import { TValueType } from './typings';
import { multiplyPoint, stringifyPointsArray } from './utils';

enum EditAction {
  MOVE = 'move',
  RESIZE_TOP_LEFT = 'resize_top_left',
  RESIZE_TOP_RIGHT = 'resize_top_right',
  RESIZE_BOTTOM_RIGHT = 'resize_bottom_right',
  RESIZE_BOTTOM_LEFT = 'resize_bottom_left',
}

type Props = {
  disabled?: boolean;
  active?: boolean;
  wrapRect?: DOMRect;
  points: TValueType;
  onUpdate?: (value: TValueType) => void;
  onDelete?: (value: TValueType) => void;
}

export const ImageHotspotSpot: React.FunctionComponent<Props> = ({ active, disabled, wrapRect, points, onUpdate, onDelete }) => {
  const ref = React.useRef<SVGSVGElement>(null);
  const [mouseDown, setMouseDown] = React.useState(false);
  const [editingState, editingStateControl] = useEditingState();
  if (!wrapRect) return null;

  const absolutePoints = points.value.map(v => multiplyPoint(v, [wrapRect.width, wrapRect.height]));
  const pointsString = stringifyPointsArray(absolutePoints);

  const onMouseDown = React.useCallback((event: React.SyntheticEvent<SVGElement, MouseEvent>) => {
    if (!disabled && editingState.active) {
      event.preventDefault();
      const position: [number, number] = [
        (event.nativeEvent.clientX - wrapRect.x) / wrapRect.width,
        (event.nativeEvent.clientY - wrapRect.y) / wrapRect.height,
      ];
      setMouseDown(true);
      editingStateControl.setPosition(position)
    }
  }, [mouseDown, disabled, editingState]);

  const onMouseUpOrLeave = React.useCallback((event: React.SyntheticEvent<SVGElement, MouseEvent>) => {
    if (!disabled && editingState.active) {
      event.preventDefault();
      setMouseDown(false);
      window.requestAnimationFrame(() => {
        editingStateControl.setAction(undefined);
      });
    }
  }, [disabled, mouseDown, editingState, editingStateControl]);

  const onMouseMove = React.useCallback((event: React.SyntheticEvent<SVGElement, MouseEvent>) => {
    if (!disabled && editingState.active && mouseDown) {
      let action: EditAction | undefined = editingState.action;
      event.preventDefault();
      if (!action && event.target instanceof SVGElement) {
        if (event.target.tagName.toLowerCase() === 'polygon') { action = EditAction.MOVE; }
        else if (event.target.dataset.handle === 'top_left') { action = EditAction.RESIZE_TOP_LEFT; }
        else if (event.target.dataset.handle === 'top_right') { action = EditAction.RESIZE_TOP_RIGHT; }
        else if (event.target.dataset.handle === 'bottom_right') { action = EditAction.RESIZE_BOTTOM_RIGHT; }
        else if (event.target.dataset.handle === 'bottom_left') { action = EditAction.RESIZE_BOTTOM_LEFT; }
        editingStateControl.setAction(action);
      }

      if (onUpdate) {
        const position: [number, number] = [
          (event.nativeEvent.clientX - wrapRect.x) / wrapRect.width,
          (event.nativeEvent.clientY - wrapRect.y) / wrapRect.height,
        ];
        const dx = position[0] - editingState.position[0];
        const dy = position[1] - editingState.position[1];
        if (action === EditAction.MOVE) {
          onUpdate({
            key: points.key,
            value: points.value.map(v => ([v[0] + dx, v[1] + dy])),
          } as TValueType);
        } else if (!!action) {
          const pointIndexes = {
            [EditAction.RESIZE_TOP_LEFT]: event.nativeEvent.shiftKey ? [[0], [0]] : [[0, 3], [0, 1]],
            [EditAction.RESIZE_TOP_RIGHT]: event.nativeEvent.shiftKey ? [[1], [1]] : [[1, 2], [1, 0]],
            [EditAction.RESIZE_BOTTOM_RIGHT]: event.nativeEvent.shiftKey ? [[2], [2]] : [[2, 1], [2, 3]],
            [EditAction.RESIZE_BOTTOM_LEFT]: event.nativeEvent.shiftKey ? [[3], [3]] : [[3, 0], [3, 2]],
          }[action];

          onUpdate({
            key: points.key,
            value: points.value.map((v, index) => {
              const x = pointIndexes[0].includes(index) ? v[0] + dx : v[0];
              const y = pointIndexes[1].includes(index) ? v[1] + dy : v[1];
              return [x, y];
            })
          } as TValueType);
        }
        editingStateControl.setPosition(position);
      }
    }
  }, [disabled, mouseDown, points, editingState, editingStateControl]);
  const onClick = React.useCallback((event: React.SyntheticEvent<SVGElement, MouseEvent>) => {
    if (!disabled && !editingState.action) {
      event.preventDefault();
      setMouseDown(false);
      editingStateControl.setActive(!editingState.active);
    }
  }, [disabled, mouseDown, editingState, editingStateControl]);

  const onWindowClick = React.useCallback((event: Event) => {
    if (
      editingState.active
      && (
        !ref.current
        || !(event.target instanceof Element)
        || !ref.current.contains(event.target)
      )
    ) {
      editingStateControl.setActive(false);
      editingStateControl.setAction(undefined);
    }
  }, [ref,editingState, editingStateControl]);

  const onWindowKeyup = React.useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete' && onDelete && editingState.active) {
      onDelete(points);
    }
  }, [points, editingState, onDelete]);

  React.useEffect(() => {
    window.addEventListener('click', onWindowClick);
    window.addEventListener('keyup', onWindowKeyup);
    return () => {
      window.removeEventListener('click', onWindowClick);
      window.removeEventListener('keyup', onWindowKeyup);
    }
  }, [ref, points, onWindowClick, onWindowKeyup]);

  return (
    <svg
      ref={ref}
      key={pointsString}
      className={styles.spot}
      width={wrapRect.width}
      height={wrapRect.height}
      viewBox={`0 0 ${wrapRect.width} ${wrapRect.height}`}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUpOrLeave}
      onMouseLeave={onMouseUpOrLeave}
      style={{
        zIndex: editingState.action ? 1 : undefined,
        pointerEvents: editingState.action ? 'all' : undefined,
      }}
    >
      <polygon className={active ? styles.active : undefined} points={pointsString} onClick={onClick} onMouseDown={onMouseDown} />
      {editingState.active && (
        <>
          <rect data-handle="top_left" className={styles.handle} x={absolutePoints[0][0] - 6} y={absolutePoints[0][1] - 6} width={12} height={12} onMouseDown={onMouseDown} />
          <rect data-handle="top_right" className={styles.handle} x={absolutePoints[1][0] - 6} y={absolutePoints[1][1] - 6} width={12} height={12} onMouseDown={onMouseDown} />
          <rect data-handle="bottom_right" className={styles.handle} x={absolutePoints[2][0] - 6} y={absolutePoints[2][1] - 6} width={12} height={12} onMouseDown={onMouseDown} />
          <rect data-handle="bottom_left" className={styles.handle} x={absolutePoints[3][0] - 6} y={absolutePoints[3][1] - 6} width={12} height={12} onMouseDown={onMouseDown} />
        </>
      )}
    </svg>
  );
}