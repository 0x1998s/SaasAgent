import React from 'react';
import { Card, Row, Col, Statistic, Progress, List, Avatar, Badge, Button, Space } from 'antd';
import {
  RobotOutlined,
  TruckOutlined,
  MailOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const Dashboard: React.FC = () => {
  // 模拟数据
  const systemStats = {
    totalAgents: 12,
    runningAgents: 8,
    totalTasks: 156,
    completedTasks: 142
  };

  const recentActivities = [
    {
      id: 1,
      type: 'agent',
      title: '物流跟踪Agent处理了新的包裹查询',
      description: '跟踪号: 1Z999AA1234567890',
      time: '2分钟前',
      status: 'success'
    },
    {
      id: 2,
      type: 'email',
      title: '邮件营销Agent发送了促销邮件',
      description: '发送给1,250个客户',
      time: '5分钟前',
      status: 'success'
    },
    {
      id: 3,
      type: 'workflow',
      title: '退换货工作流执行完成',
      description: '订单号: ORD-2024-001',
      time: '10分钟前',
      status: 'warning'
    },
    {
      id: 4,
      type: 'analytics',
      title: '数据分析报告生成完成',
      description: '销售趋势分析报告',
      time: '15分钟前',
      status: 'success'
    }
  ];

  // 图表配置
  const taskTrendOption = {
    title: {
      text: '任务执行趋势',
      left: 'left',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['已完成', '失败', '进行中'],
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
        name: '已完成',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true,
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '失败',
        type: 'line',
        data: [5, 8, 3, 6, 4, 12, 8],
        smooth: true,
        itemStyle: { color: '#ff4d4f' }
      },
      {
        name: '进行中',
        type: 'line',
        data: [15, 18, 12, 16, 14, 22, 18],
        smooth: true,
        itemStyle: { color: '#faad14' }
      }
    ]
  };

  const agentStatusOption = {
    title: {
      text: 'Agent状态分布',
      left: 'left',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 'right',
      data: ['运行中', '空闲', '故障']
    },
    series: [
      {
        name: 'Agent状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        data: [
          { value: 8, name: '运行中', itemStyle: { color: '#52c41a' } },
          { value: 3, name: '空闲', itemStyle: { color: '#1890ff' } },
          { value: 1, name: '故障', itemStyle: { color: '#ff4d4f' } }
        ],
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'agent':
        return <RobotOutlined style={{ color: '#1890ff' }} />;
      case 'email':
        return <MailOutlined style={{ color: '#52c41a' }} />;
      case 'workflow':
        return <TruckOutlined style={{ color: '#faad14' }} />;
      case 'analytics':
        return <BarChartOutlined style={{ color: '#722ed1' }} />;
      default:
        return <CheckCircleOutlined />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge status="success" />;
      case 'warning':
        return <Badge status="warning" />;
      case 'error':
        return <Badge status="error" />;
      default:
        return <Badge status="default" />;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">仪表盘</h1>
        <p className="page-description">系统运行状态和关键指标概览</p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="总Agent数"
              value={systemStats.totalAgents}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="运行中"
              value={systemStats.runningAgents}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${systemStats.totalAgents}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="总任务数"
              value={systemStats.totalTasks}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card">
            <Statistic
              title="完成率"
              value={((systemStats.completedTasks / systemStats.totalTasks) * 100).toFixed(1)}
              prefix={<ArrowUpOutlined />}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress
              percent={((systemStats.completedTasks / systemStats.totalTasks) * 100)}
              showInfo={false}
              strokeColor="#52c41a"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card className="dashboard-card">
            <ReactECharts option={taskTrendOption} style={{ height: '300px' }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="dashboard-card">
            <ReactECharts option={agentStatusOption} style={{ height: '300px' }} />
          </Card>
        </Col>
      </Row>

      {/* 活动列表和快速操作 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="最近活动"
            className="dashboard-card"
            extra={
              <Button type="link" size="small">
                查看全部
              </Button>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="small"
                        icon={getActivityIcon(item.type)}
                        style={{ backgroundColor: '#f0f2f5' }}
                      />
                    }
                    title={
                      <Space>
                        {getStatusBadge(item.status)}
                        <span>{item.title}</span>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <span>{item.description}</span>
                        <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          {item.time}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="快速操作" className="dashboard-card">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<RobotOutlined />}
                block
                onClick={() => window.location.href = '/agents'}
              >
                创建新Agent
              </Button>
              <Button
                icon={<TruckOutlined />}
                block
                onClick={() => window.location.href = '/logistics'}
              >
                跟踪包裹
              </Button>
              <Button
                icon={<MailOutlined />}
                block
                onClick={() => window.location.href = '/marketing'}
              >
                创建邮件活动
              </Button>
              <Button
                icon={<BarChartOutlined />}
                block
                onClick={() => window.location.href = '/analytics'}
              >
                查看分析报告
              </Button>
            </Space>
          </Card>

          <Card
            title="系统状态"
            className="dashboard-card"
            style={{ marginTop: 16 }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>API服务</span>
                <Badge status="success" text="正常" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>数据库</span>
                <Badge status="success" text="正常" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>消息队列</span>
                <Badge status="warning" text="警告" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>存储空间</span>
                <Badge status="success" text="充足" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
