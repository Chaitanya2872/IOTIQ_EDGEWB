import React from "react";
import { Layout, Row, Col, Card, Typography } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const { Title } = Typography;
const { Content } = Layout;

// Dummy data for charts
const lineData = [
  { day: "Mon", meals: 40 },
  { day: "Tue", meals: 30 },
  { day: "Wed", meals: 20 },
  { day: "Thu", meals: 27 },
  { day: "Fri", meals: 18 },
  { day: "Sat", meals: 23 },
  { day: "Sun", meals: 34 },
];

const barData = [
  { category: "Breakfast", count: 120 },
  { category: "Lunch", count: 98 },
  { category: "Snacks", count: 86 },
  { category: "Dinner", count: 99 },
];

const MealForecastDashboard: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh", padding: "20px", background: "#f5f7fa" }}>
      <Content>
        <Title level={2} style={{ marginBottom: 20 }}>
          🍽️ Meal Forecasting Dashboard
        </Title>

        {/* Top Graphs */}
        <Row gutter={[20, 20]}>
          <Col span={12}>
            <Card title="Weekly Meal Forecast" bordered={false} style={{ borderRadius: 10 }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="meals" stroke="#1890ff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Meal Distribution" bordered={false} style={{ borderRadius: 10 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#52c41a" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Bottom 4 Containers */}
        <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
          <Col span={6}>
            <Card title="Total Meals" bordered={false} style={{ borderRadius: 10 }}>
              <Title level={3}>650</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Avg. Per Day" bordered={false} style={{ borderRadius: 10 }}>
              <Title level={3}>92</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Most Ordered" bordered={false} style={{ borderRadius: 10 }}>
              <Title level={3}>Lunch</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Least Ordered" bordered={false} style={{ borderRadius: 10 }}>
              <Title level={3}>Snacks</Title>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default MealForecastDashboard;
