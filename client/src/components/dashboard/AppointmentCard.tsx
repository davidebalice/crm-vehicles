import { FC, ReactNode } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
  type: "test_drive" | "service" | "consultation" | "trade_in";
  title: string;
  customer: string;
  date: string;
  time: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
}

const AppointmentCard: FC<AppointmentCardProps> = ({
  type,
  title,
  customer,
  date,
  time,
  icon,
  iconBgColor,
  iconColor
}) => {
  return (
    <div className="bg-card text-card-foreground flex items-center p-4 hover:bg-opacity-80 border-b border-border">
      <div className={cn("w-12 h-12 flex items-center justify-center rounded-full mr-4", iconBgColor)}>
        <div className={cn("h-5 w-5", iconColor)}>
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <div className="flex text-sm text-muted-foreground mt-1">
          <span className="flex items-center mr-3">
            <User className="mr-1 h-4 w-4" /> {customer}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm">{date}</p>
        <p className="text-sm text-muted-foreground">{time}</p>
      </div>
    </div>
  );
};

export default AppointmentCard;
