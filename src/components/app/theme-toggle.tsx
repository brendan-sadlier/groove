import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTheme } from '../theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="text-muted-foreground"
    >
      {theme === 'light' ? (
        <div className="flex items-center gap-2">
          <Moon className="size-4" aria-hidden />
          Dark Mode
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Sun className="size-4" aria-hidden />
          Light Mode
        </div>
      )}
    </Button>
  )
}
