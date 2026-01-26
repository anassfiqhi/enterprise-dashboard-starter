import * as React from "react"

const LG_BREAKPOINT = 1024

export function useCollapsibleMode(): "icon" | "offcanvas" {
  const [mode, setMode] = React.useState<"icon" | "offcanvas">("icon")

  React.useEffect(() => {
    const updateMode = () => {
      setMode(window.innerWidth >= LG_BREAKPOINT ? "icon" : "offcanvas")
    }

    const mql = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`)
    mql.addEventListener("change", updateMode)
    updateMode()

    return () => mql.removeEventListener("change", updateMode)
  }, [])

  return mode
}
