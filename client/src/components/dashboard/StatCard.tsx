import { FC, ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
}

const StatCard: FC<StatCardProps> = ({ 
  title, 
  value, 
  trend, 
  icon, 
  iconBgColor, 
  iconColor 
}) => {
  return (
    <div className="bg-card text-card-foreground shadow-sm rounded-lg p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {trend && (
            <p className={cn(
              "text-sm mt-1 flex items-center",
              trend.positive 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            )}>
              {trend.positive ? (
                <ArrowUp className="mr-1 h-4 w-4" />
              ) : (
                <ArrowDown className="mr-1 h-4 w-4" />
              )}
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-full", iconBgColor)}>
          <div className={cn("h-5 w-5", iconColor)}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
