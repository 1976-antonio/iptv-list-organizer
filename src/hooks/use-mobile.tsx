
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export interface UseMobileResult {
  isMobile: boolean
  toggleSidebar: () => void
  sidebarOpen: boolean
}

export function useIsMobile(): UseMobileResult {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  const toggleSidebar = React.useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  return {
    isMobile,
    sidebarOpen,
    toggleSidebar
  }
}
