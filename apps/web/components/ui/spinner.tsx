import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps extends React.HTMLAttributes<SVGSVGElement> {
  size?: number
}

function Spinner({ className, size = 24, ...props }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin", className)}
      size={size}
      {...props}
    />
  )
}

export { Spinner }
