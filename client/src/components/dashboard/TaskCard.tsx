import { FC } from "react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignedTo: {
    name: string;
    avatar: string;
  };
}

const TaskCard: FC<TaskCardProps> = ({
  title,
  description,
  priority,
  dueDate,
  assignedTo
}) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Bassa";
      default:
        return "Normal";
    }
  };

  return (
    <div className="bg-card text-card-foreground border border-border rounded-md p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium">{title}</h4>
        <div className={cn("text-xs px-2 py-0.5 rounded", getPriorityStyles(priority))}>
          {getPriorityLabel(priority)}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">Scadenza: {dueDate}</div>
        <div className="flex items-center space-x-2">
          <img src={assignedTo.avatar} alt={assignedTo.name} className="w-6 h-6 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
