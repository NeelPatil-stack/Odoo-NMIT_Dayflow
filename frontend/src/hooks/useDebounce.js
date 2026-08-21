import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating the returned value until after `delay` ms
 * have elapsed since the last change to `value`.
 *
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default 400)
 * @returns {*} debounced value
 */
function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
