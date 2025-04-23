import { useState, useCallback } from 'react';

/**
 * Custom hook to handle popover state with automatic closing
 * @returns An object containing open state and handlers
 */
export function usePopoverClose() {
  const [open, setOpen] = useState(false);

  const onOpenChange = useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  const onSelect = useCallback((callback?: () => void) => {
    return () => {
      setOpen(false);
      if (callback) callback();
    };
  }, []);

  return {
    open,
    onOpenChange,
    onSelect
  };
}
