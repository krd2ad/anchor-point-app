import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/print.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { CommandPaletteProvider } from './context/CommandPaletteContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <CommandPaletteProvider>
        <App />
      </CommandPaletteProvider>
    </ThemeProvider>
  </StrictMode>,
)
