import type { LucideIcon } from "lucide-react";
import "./AppIcon.css";

interface AppIconProps {
  icon: LucideIcon;
  size?: number;
}

function AppIcon({
  icon: Icon,
  size = 20,
}: AppIconProps) {
  return (
    <Icon
      size={size}
      strokeWidth={2.2}
      className="app-icon"
    />
  );
}

export default AppIcon;