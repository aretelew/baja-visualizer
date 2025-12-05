import { useEffect, useRef, useState } from "react";

/**
 * Controls Recharts animation so it only plays on the first view load and
 * whenever the underlying data changes. Useful for avoiding replays when a
 * tab is revisited without new data.
 */
export function useChartAnimation(dataKey: string, suppressInitialAnimation: boolean) {
  const [isAnimationActive, setIsAnimationActive] = useState(!suppressInitialAnimation);
  const lastDataKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const lastKey = lastDataKeyRef.current;
    const isFirstDataLoad = lastKey === null;

    lastDataKeyRef.current = dataKey;

    if (isFirstDataLoad) {
      setIsAnimationActive(!suppressInitialAnimation);
      return;
    }

    if (lastKey !== dataKey) {
      setIsAnimationActive(true);
    }
  }, [dataKey, suppressInitialAnimation]);

  return isAnimationActive;
}

