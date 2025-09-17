import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Select, 
  DatePicker, 
  Button,
  Table,
  Tag,
  Space,
  Tabs,
  Input,
  message
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface SalesData {
  date: string;
  sales: number;
  orders: number;
  customers: number;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  category: string;
}

const DataAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [activeTab, setActiveTab] = useState('overview');
  const [chatQuery, setChatQuery] = useState('');

  // 模拟数据
  const salesData: SalesData[] = [
    { date: '2024-01-19', sales: 12500, orders: 89, customers: 76 },
    { date: '2024-01-20', sales: 15600, orders: 102, customers: 89 },
    { date: '2024-01-21', sales: 18200, orders: 125, customers: 108 },
    { date: '2024-01-22', sales: 14800, orders: 95, customers: 82 },
    { date: '2024-01-23', sales: 22100, orders: 156, customers: 134 },
    { date: '2024-01-24', sales: 19800, orders: 134, customers: 115 },
    { date: '2024-01-25', sales: 25300, orders: 178, customers: 152 }
  ];

  const topProducts: TopProduct[] = [
    { id: 'p001', name: 'iPhone 15 Pro', sales: 156, revenue: 156000, category: '电子产品' },
    { id: 'p002', name: 'MacBook Air M2', sales: 89, revenue: 89000, category: '电子产品' },
    { id: 'p003', name: 'AirPods Pro', sales: 234, revenue: 46800, category: '电子产品' },
    { id: 'p004', name: 'Nike Air Max', sales: 167, revenue: 25050, category: '运动鞋' },
    { id: 'p005', name: 'Adidas Ultraboost', sales: 134, revenue: 20100, category: '运动鞋' }
  ];

  // 销售趋势图配置
  const salesTrendOption = {
    title: {
      text: '销售趋势分析',
      left: 'left'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['销售额', '订单数', '客户数'],
      right: 'right'
    },
    xAxis: {
      type: 'category',
      data: salesData.map(item => item.date.split('-')[2])
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '数量',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        yAxisIndex: 0,
        data: salesData.map(item => item.sales),
        smooth: true,
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        data: salesData.map(item => item.orders),
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '客户数',
        type: 'line',
        yAxisIndex: 1,
        data: salesData.map(item => item.customers),
        smooth: true,
        itemStyle: { color: '#faad14' }
      }
    ]
  };

  // 产品销售分布图
  const productDistributionOption = {
    title: {
      text: '产品销售分布',
      left: 'left'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 'right'
    },
    series: [
      {
        name: '销售额',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        data: topProducts.map(product => ({
          value: product.revenue,
          name: product.name
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  // 客户分析图
  const customerAnalysisOption = {
    title: {
      text: '客户分析',
      left: 'left'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新客户', '回购客户', '流失客户'],
      right: 'right'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新客户',
        type: 'bar',
        stack: 'total',
        data: [20, 25, 30, 22, 35, 40, 45],
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '回购客户',
        type: 'bar',
        stack: 'total',
        data: [15, 18, 22, 20, 28, 32, 35],
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '流失客户',
        type: 'bar',
        stack: 'total',
        data: [5, 8, 6, 9, 7, 8, 10],
        itemStyle: { color: '#ff4d4f' }
      }
    ]
  };

  const topProductColumns = [
    {
      title: '排名',
      key: 'rank',
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales',
      sorter: (a: TopProduct, b: TopProduct) => a.sales - b.sales,
    },
    {
      title: '收入',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => `¥${revenue.toLocaleString()}`,
      sorter: (a: TopProduct, b: TopProduct) => a.revenue - b.revenue,
    },
  ];

  const handleChatQuery = () => {
    if (!chatQuery.trim()) {
      message.warning('请输入查询内容');
      return;
    }
    
    message.info(`正在分析: "${chatQuery}"`);
    // 这里可以集成实际的ChatBI功能
  };

  const handleExportReport = () => {
    message.success('报告导出功能开发中...');
  };

  const getTotalStats = () => {
    const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
    const totalCustomers = salesData.reduce((sum, item) => sum + item.customers, 0);
    const avgOrderValue = totalSales / totalOrders;

    return {
      totalSales,
      totalOrders,
      totalCustomers,
      avgOrderValue
    };
  };

  const stats = getTotalStats();

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-wrapper">
          <div className="page-title-content">
            <h1 className="page-title">数据分析</h1>
            <p className="page-description">智能数据分析和商业洞察</p>
          </div>
          <div className="page-title-actions">
            <Space>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
              >
                <Option value="7days">近7天</Option>
                <Option value="30days">近30天</Option>
                <Option value="90days">近90天</Option>
              </Select>
              <RangePicker />
              <Button icon={<ReloadOutlined />}>
                刷新
              </Button>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleExportReport}
              >
                导出报告
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总销售额"
              value={stats.totalSales}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
              formatter={(value) => `¥${value?.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总客户数"
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="平均订单价值"
              value={stats.avgOrderValue}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => `¥${Number(value).toFixed(2)}`}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="概览分析" key="overview">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card title="销售趋势">
                  <ReactECharts option={salesTrendOption} style={{ height: '400px' }} />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="产品销售分布">
                  <ReactECharts option={productDistributionOption} style={{ height: '400px' }} />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="产品分析" key="products">
            <Card title="热销产品排行">
              <Table
                columns={topProductColumns}
                dataSource={topProducts}
                rowKey="id"
                pagination={false}
                size="middle"
              />
            </Card>
          </TabPane>

          <TabPane tab="客户分析" key="customers">
            <Card title="客户行为分析">
              <ReactECharts option={customerAnalysisOption} style={{ height: '400px' }} />
            </Card>
          </TabPane>

          <TabPane tab="ChatBI" key="chatbi">
            <Card title="智能数据问答">
              <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
                <TextArea
                  placeholder="请输入您的数据分析问题，例如：最近7天销量最好的产品是什么？"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  rows={2}
                />
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />}
                  onClick={handleChatQuery}
                >
                  分析
                </Button>
              </Space.Compact>
              
              <div style={{ 
                background: '#f5f5f5', 
                padding: '20px', 
                borderRadius: '6px',
                textAlign: 'center',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div>
                  <BarChartOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                  <p style={{ marginTop: '16px', color: '#666' }}>
                    ChatBI智能分析功能开发中...
                  </p>
                  <p style={{ color: '#999', fontSize: '12px' }}>
                    未来将支持自然语言查询数据库，生成智能分析报告
                  </p>
                </div>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DataAnalytics;
