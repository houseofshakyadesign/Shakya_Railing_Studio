import { animate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { groupIndian } from "@/utils/currency";

export function AnimatedTotal({ value, currency = "NPR" }: { value: number; currency?: string }) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, mv]);

  return (
    <span className="tabular-nums">
      <span className="text-[0.5em] align-middle font-normal tracking-[0.16em] text-muted-foreground">
        {currency}{" "}
      </span>
      {groupIndian(display)}
    </span>
  );
}
