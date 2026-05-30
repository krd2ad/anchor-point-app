import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface CommandPaletteState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteState>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <CommandPaletteContext.Provider value={{ isOpen, open, close }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette(): CommandPaletteState {
  return useContext(CommandPaletteContext);
}
