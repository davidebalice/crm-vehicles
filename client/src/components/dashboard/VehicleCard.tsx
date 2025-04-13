import { FC } from "react";
import { Link } from "wouter";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  id: number;
  name: string;
  year: number;
  mileage: number;
  price: number;
  condition: "new" | "used";
  image: string;
}

const VehicleCard: FC<VehicleCardProps> = ({
  id,
  name,
  year,
  mileage,
  price,
  condition,
  image
}) => {
  return (
    <Link href={`/vehicles/details/${id}`}>
      <div className="bg-card text-card-foreground flex items-center p-4 hover:bg-opacity-80 border-b border-border cursor-pointer mb-3 transition-all">
        <div 
          className="w-20 h-14 bg-muted rounded mr-4 bg-cover bg-center" 
          style={{ backgroundImage: `url(${image})` }}
        ></div>
        <div className="flex-1">
          <h4 className="font-medium">{name}</h4>
          <div className="flex text-sm text-muted-foreground mt-1">
            <span className="flex items-center mr-3">
              <Calendar className="mr-1 h-4 w-4" /> {year}
            </span>
            <span className="flex items-center">
              <MapPin className="mr-1 h-4 w-4" /> {mileage.toLocaleString()} km
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">€{price.toLocaleString()}</p>
          <span className={cn(
            "inline-block px-2 py-0.5 text-xs rounded-full",
            condition === "new" 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
          )}>
            {condition === "new" ? "Nuovo" : "Usato"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;