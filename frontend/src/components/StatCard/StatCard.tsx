import "./StatCard.css";

type StatCardProps = {
  title?: string;
  value?: string;
  change?: string;
};

function StatCard({
  title = "Metric",
  value = "0",
  change = "+0%"
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>

      <div className="stat-value">{value}</div>

      <div className="stat-change">{change}</div>
    </div>
  );
}

export default StatCard;