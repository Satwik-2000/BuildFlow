import { Row, Col, Card, Spin, Typography } from "antd";
import { ProjectOutlined, FileTextOutlined, DollarOutlined, FilePdfOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { motion } from "framer-motion";
import DashboardCard from "../components/common/DashboardCard";
import "./Dashboard.css";

const { Text } = Typography;

const DASHBOARD_STATS = gql`
  query DashboardStats {
    dashboardStats {
      totalProjects
      activeContracts
      pendingBills
      overduePayments
      recentReports
    }
  }
`;

const PROJECT_SUMMARIES = gql`
  query ProjectSummaries {
    projectSummaries {
      id
      name
      code
      status
      budget
      progress
    }
  }
`;

const COLORS = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#fff',
        padding: '12px',
        border: '1px solid #e8e8e8',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#1a1a1a' }}>{`${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { data: stats, loading: statsLoading } = useQuery(DASHBOARD_STATS);
  const { data: summaries, loading: sumLoading } = useQuery(PROJECT_SUMMARIES);

  const s = stats?.dashboardStats;
  const projectData = summaries?.projectSummaries?.map((p: { name: string; progress: number }) => ({
    name: p.name.length > 20 ? p.name.slice(0, 20) + "..." : p.name,
    progress: Math.round(p.progress),
    fullName: p.name,
  })) ?? [];

  if (statsLoading) return <Spin size="large" style={{ display: "block", margin: "48px auto" }} />;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening with your projects.</p>
        </motion.div>
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Active Projects"
            value={s?.totalProjects ?? 0}
            icon={<ProjectOutlined />}
            color="#1677ff"
            index={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Active Contracts"
            value={s?.activeContracts ?? 0}
            icon={<FileTextOutlined />}
            color="#52c41a"
            index={1}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Pending Bills"
            value={s?.pendingBills ?? 0}
            icon={<DollarOutlined />}
            color="#faad14"
            index={2}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Recent Reports (7d)"
            value={s?.recentReports ?? 0}
            icon={<FilePdfOutlined />}
            color="#722ed1"
            index={3}
          />
        </Col>
      </Row>
      
      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        <Col xs={24} lg={14}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="chart-card" title="Project Progress" variant="borderless">
              {sumLoading ? (
                <Spin style={{ display: "block", textAlign: "center", padding: "40px" }} />
              ) : projectData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={projectData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#666', fontSize: 12 }}
                      axisLine={{ stroke: '#e8e8e8' }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fill: '#666', fontSize: 12 }}
                      axisLine={{ stroke: '#e8e8e8' }}
                      label={{ value: 'Progress %', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="progress" 
                      fill="url(#colorGradient)"
                      radius={[8, 8, 0, 0]}
                    >
                      {projectData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1677ff" stopOpacity={1} />
                        <stop offset="100%" stopColor="#69b1ff" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
                  No project data yet
                </div>
              )}
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={10}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="chart-card" title="Overview" variant="borderless">
              {projectData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={projectData}
                      dataKey="progress"
                      nameKey="fullName"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={2}
                      label={(entry) => `${entry.progress}%`}
                      labelLine={false}
                    >
                      {projectData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div style={{
                              backgroundColor: '#fff',
                              padding: '12px',
                              border: '1px solid #e8e8e8',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                              <p style={{ margin: 0, fontWeight: 600, color: '#1a1a1a' }}>
                                {payload[0].payload.fullName}
                              </p>
                              <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                                Progress: {payload[0].value}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry: any) => (
                        <span style={{ color: '#666', fontSize: '12px' }}>
                          {entry.payload.fullName}: {entry.payload.progress}%
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
                  No data
                </div>
              )}
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
}
