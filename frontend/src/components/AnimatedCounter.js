import { useEffect, useState } from "react";

function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = Number.parseInt(value, 10);

    if (Number.isNaN(target)) {
      setCount(value);
      return undefined;
    }

    if (target <= 0) {
      setCount(0);
      return undefined;
    }

    let current = 0;
    const duration = 1200;
    const stepMs = Math.max(20, Math.ceil(duration / target));
    const delta = Math.max(1, Math.floor(target / 40));

    const timer = setInterval(() => {
      current += delta;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, stepMs);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="kpi-value">
      {count}
      {suffix}
    </span>
  );
}

export default AnimatedCounter;
