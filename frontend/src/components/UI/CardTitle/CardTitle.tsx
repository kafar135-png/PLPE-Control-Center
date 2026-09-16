import type { LucideIcon } from "lucide-react";
import AppIcon from "../AppIcon/AppIcon";
import "./CardTitle.css";

interface CardTitleProps {
  icon: LucideIcon;
  title: string;
}

function CardTitle({
  icon,
  title,
}: CardTitleProps) {
  return (
    <div className="card-title">

      <AppIcon icon={icon} />

      <h2>{title}</h2>

    </div>
  );
}

export default CardTitle;