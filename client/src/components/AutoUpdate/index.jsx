import React, { useEffect, useState } from "react";

// this is meant to listen to props that dont normally fire re-renders!
// originally used for timers (that relied on doing math with timestamps)

function AutoUpdate({
  intervalTime, value, enabled, onChange, noDisplay
}) {
  const [immediate, setImmediate] = useState(true);
  const [displayValue, setDisplayValue] = useState(value);

  const updateDisplayValue = () => {
    if (enabled) {
      const newVal = value();
      setDisplayValue((oldVal) => {
        if ((oldVal != newVal || immediate) && onChange) {
          onChange(newVal);
          setImmediate(false);
        }
        return newVal;
      });
    }
  }

  useEffect(() => {
    updateDisplayValue();
    const interval = setInterval(updateDisplayValue, intervalTime);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <>{!noDisplay && displayValue}</>
  );
}

export default AutoUpdate;