import { Card } from "antd";
import { motion } from "framer-motion";

export interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  index?: number;
}

export default function DashboardCard({ title, value, icon, color = "#1677ff", index = 0 }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="dashboard-card" variant="borderless">
        <div className="dashboard-card-content">
          <div className="dashboard-card-info">
            <div className="dashboard-card-value">{value}</div>
            <div className="dashboard-card-title">{title}</div>
          </div>
          {icon && (
            <div className="dashboard-card-icon" style={{ background: `${color}20`, color }}>
              {icon}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
