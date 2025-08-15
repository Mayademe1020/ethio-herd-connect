
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  value?: string | number
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  loading?: boolean
  hover?: boolean
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    className, 
    title, 
    subtitle, 
    icon: Icon, 
    iconColor = "text-primary",
    value, 
    trend,
    trendValue,
    loading = false,
    hover = true,
    children,
    ...props 
  }, ref) => {
    return (
      <Card 
        ref={ref} 
        className={cn(
          "transition-all duration-300 border-0 shadow-sm bg-card/50 backdrop-blur-sm",
          hover && "hover:shadow-lg hover:scale-[1.02] cursor-pointer",
          "hover:bg-card/80",
          className
        )} 
        {...props}
      >
        {(title || Icon) && (
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="space-y-1">
              {title && (
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {title}
                </CardTitle>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground/80">{subtitle}</p>
              )}
            </div>
            {Icon && (
              <div className={cn("p-2 rounded-lg bg-primary/10", iconColor)}>
                <Icon className="h-4 w-4" />
              </div>
            )}
          </CardHeader>
        )}
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
            </div>
          ) : (
            <>
              {value && (
                <div className="flex items-baseline space-x-2">
                  <div className="text-2xl font-bold text-foreground">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                  {trend && trendValue && (
                    <div className={cn(
                      "flex items-center text-xs font-medium",
                      trend === "up" && "text-green-600",
                      trend === "down" && "text-red-600",
                      trend === "neutral" && "text-muted-foreground"
                    )}>
                      {trend === "up" && "↗"}
                      {trend === "down" && "↘"}
                      {trend === "neutral" && "→"}
                      <span className="ml-1">{trendValue}</span>
                    </div>
                  )}
                </div>
              )}
              {children}
            </>
          )}
        </CardContent>
      </Card>
    )
  }
)
EnhancedCard.displayName = "EnhancedCard"

export { EnhancedCard }
