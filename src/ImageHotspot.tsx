import React from 'react';
import styles from './ImageHotspot.module.css';
import { nanoid } from 'nanoid';
import { useDrawingState } from './hooks';
import { ImageHotspotSpot } from './ImageHotspotSpot';
import { TValueType } from './typings';
import { convertStartEndToPoints } from './utils';

type Props = {
  src?: string;
  value?: TValueType[];
  onChange?: (value: TValueType[]) => void;
}

export const ImageHotspot: React.FunctionComponent<Props> = ({ src, value, onChange }) => {
  const [wrapRect, setWrapRect] = React.useState<DOMRect>();
  const [drawingState, drawingStateControl] = useDrawingState();

  const onWrapMouseDown = React.useCallback((event: React.SyntheticEvent<HTMLDivElement, MouseEvent>) => {
    if (!drawingState.active && !(event.target instanceof SVGElement)) {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      const relativePosition: [number, number] = [
        (event.nativeEvent.clientX - rect.x) / rect.width,
        (event.nativeEvent.clientY - rect.y) / rect.height,
      ];
      drawingStateControl.setStartPosition(relativePosition);
      drawingStateControl.setEndPosition(relativePosition);
      drawingStateControl.setActive(true);
      setWrapRect(rect);
    }
  }, [drawingState, drawingStateControl, wrapRect]);

  const onWrapMouseMove = React.useCallback((event: React.SyntheticEvent<HTMLDivElement, MouseEvent>) => {
    if (wrapRect && drawingState.active) {
      event.preventDefault();
      const relativePosition: [number, number] = [
        (event.nativeEvent.clientX - wrapRect.x) / wrapRect.width,
        (event.nativeEvent.clientY - wrapRect.y) / wrapRect.height,
      ];
      drawingStateControl.setEndPosition(relativePosition);
    }
  }, [drawingState, drawingStateControl, wrapRect]);

  const onWrapMouseUpOrLeave = React.useCallback((event: React.SyntheticEvent<HTMLDivElement, MouseEvent>) => {
    if (wrapRect && drawingState.active) {
      event.preventDefault();
      const endPosition: [number, number] = [
        (event.nativeEvent.clientX - wrapRect.x) / wrapRect.width,
        (event.nativeEvent.clientY - wrapRect.y) / wrapRect.height,
      ];
      const selectionWidth = Math.abs(endPosition[0] - drawingState.start[0]) * wrapRect.width;
      const selectionheight = Math.abs(endPosition[1] - drawingState.start[1]) * wrapRect.height;
      drawingStateControl.setActive(false);
      if (onChange && selectionWidth > 5 && selectionheight > 5) {
        onChange([
          ...(value ?? []),
          {
            key: nanoid(),
            value: convertStartEndToPoints(drawingState.start, endPosition),
          },
        ]);
      }
    }
  }, [drawingState, drawingStateControl, wrapRect]);

  const onSpotUpdate = React.useCallback((points: TValueType) => {
    if (onChange) {
      const next = (value ?? []).map(v => {
        if (v.key === points.key) return points;
        return v;
      });
      onChange(next);
    }
  }, [value]);

  const onSpotDelete = React.useCallback((points: TValueType) => {
    if (onChange) {
      const next = (value ?? []).filter(v => (v.key !== points.key));
      onChange(next);
    }
  }, [value]);

  if (!src) return null;
  return (
    <div className={styles.container}>
      <div
        className={styles.wrap}
        onMouseDown={onWrapMouseDown}
        onMouseMove={onWrapMouseMove}
        onMouseLeave={onWrapMouseUpOrLeave}
        onMouseUp={onWrapMouseUpOrLeave}
      >
        <img src={src} />
        {!!(wrapRect && value) && value.map(k => {
          return (
            <ImageHotspotSpot
              key={k.key}
              wrapRect={wrapRect}
              points={k}
              disabled={drawingState.active}
              onUpdate={onSpotUpdate}
              onDelete={onSpotDelete}
            />
          );
        })}
        {(wrapRect && drawingState.active) && (
          <ImageHotspotSpot
            active
            disabled
            wrapRect={wrapRect}
            points={{
              key: 'active',
              value: convertStartEndToPoints(drawingState.start, drawingState.end),
            }}
          />
        )}
      </div>
    </div>
  )
}