import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select,
  Row,
  Col,
  Statistic,
  Timeline,
  Progress,
  message,
  Tabs,
  List,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  BranchesOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  totalSteps: number;
  completedSteps: number;
  executionTime: number;
  lastRun: string;
  successRate: number;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed';
  currentStep: string;
  progress: number;
  startTime: string;
  endTime?: string;
  logs: Array<{
    timestamp: string;
    step: string;
    status: 'success' | 'error' | 'info';
    message: string;
  }>;
}

const WorkflowManagement: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'wf_001',
      name: '订单处理流程',
      description: '自动化订单验证、支付确认、库存扣减、发货通知',
      status: 'active',
      totalSteps: 5,
      completedSteps: 4,
      executionTime: 125,
      lastRun: '2024-01-25 14:30',
      successRate: 98.5
    },
    {
      id: 'wf_002',
      name: '客户服务流程',
      description: '智能客服响应、问题分类、人工转接、满意度调查',
      status: 'active',
      totalSteps: 4,
      completedSteps: 4,
      executionTime: 89,
      lastRun: '2024-01-25 15:15',
      successRate: 95.2
    },
    {
      id: 'wf_003',
      name: '退换货处理',
      description: '退换货申请审核、物流安排、退款处理、库存更新',
      status: 'paused',
      totalSteps: 6,
      completedSteps: 3,
      executionTime: 256,
      lastRun: '2024-01-24 10:20',
      successRate: 92.8
    }
  ]);

  const [executions] = useState<WorkflowExecution[]>([
    {
      id: 'exec_001',
      workflowId: 'wf_001',
      workflowName: '订单处理流程',
      status: 'running',
      currentStep: '库存扣减',
      progress: 60,
      startTime: '2024-01-25 16:00',
      logs: [
        {
          timestamp: '2024-01-25 16:00:05',
          step: '订单验证',
          status: 'success',
          message: '订单信息验证通过'
        },
        {
          timestamp: '2024-01-25 16:00:15',
          step: '支付确认',
          status: 'success',
          message: '支付状态确认成功'
        },
        {
          timestamp: '2024-01-25 16:00:25',
          step: '库存检查',
          status: 'info',
          message: '正在检查商品库存...'
        }
      ]
    },
    {
      id: 'exec_002',
      workflowId: 'wf_002',
      workflowName: '客户服务流程',
      status: 'completed',
      currentStep: '满意度调查',
      progress: 100,
      startTime: '2024-01-25 15:30',
      endTime: '2024-01-25 15:35',
      logs: [
        {
          timestamp: '2024-01-25 15:35:00',
          step: '满意度调查',
          status: 'success',
          message: '工作流执行完成'
        }
      ]
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [isLogModalVisible, setIsLogModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('workflows');
  const [form] = Form.useForm();

  const workflowColumns = [
    {
      title: '工作流名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Workflow) => (
        <div>
          <strong>{text}</strong>
          <br />
          <span style={{ color: '#666', fontSize: '12px' }}>{record.description}</span>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          draft: { color: 'default', text: '草稿' },
          active: { color: 'green', text: '运行中' },
          paused: { color: 'orange', text: '暂停' },
          completed: { color: 'blue', text: '已完成' },
          failed: { color: 'red', text: '失败' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '进度',
      key: 'progress',
      render: (_: any, record: Workflow) => (
        <div>
          <Progress 
            percent={Math.round((record.completedSteps / record.totalSteps) * 100)} 
            size="small"
            status={record.status === 'failed' ? 'exception' : 'active'}
          />
          <span style={{ fontSize: '12px', color: '#666' }}>
            {record.completedSteps}/{record.totalSteps} 步骤
          </span>
        </div>
      ),
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => `${rate}%`,
      sorter: (a: Workflow, b: Workflow) => a.successRate - b.successRate,
    },
    {
      title: '平均执行时间',
      dataIndex: 'executionTime',
      key: 'executionTime',
      render: (time: number) => `${time}s`,
    },
    {
      title: '最后运行',
      dataIndex: 'lastRun',
      key: 'lastRun',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Workflow) => (
        <Space>
          <Button 
            size="small" 
            icon={<PlayCircleOutlined />}
            type="primary"
            disabled={record.status === 'active'}
          >
            执行
          </Button>
          <Button 
            size="small" 
            icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          >
            {record.status === 'active' ? '暂停' : '启动'}
          </Button>
          <Button size="small" icon={<EyeOutlined />}>
            查看
          </Button>
          <Button size="small" icon={<EditOutlined />}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const executionColumns = [
    {
      title: '执行ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <code>{id}</code>,
    },
    {
      title: '工作流',
      dataIndex: 'workflowName',
      key: 'workflowName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          running: { color: 'blue', text: '运行中', icon: <ClockCircleOutlined /> },
          completed: { color: 'green', text: '已完成', icon: <CheckCircleOutlined /> },
          failed: { color: 'red', text: '失败', icon: <ExclamationCircleOutlined /> }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      },
    },
    {
      title: '当前步骤',
      dataIndex: 'currentStep',
      key: 'currentStep',
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress 
          percent={progress} 
          size="small"
          status={progress === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: WorkflowExecution) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewLogs(record)}
          >
            查看日志
          </Button>
          {record.status === 'running' && (
            <Button 
              size="small" 
              icon={<StopOutlined />}
              danger
            >
              停止
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleCreateWorkflow = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newWorkflow: Workflow = {
        id: `wf_${Date.now()}`,
        name: values.name,
        description: values.description,
        status: 'draft',
        totalSteps: 0,
        completedSteps: 0,
        executionTime: 0,
        lastRun: '-',
        successRate: 0
      };
      
      setWorkflows([...workflows, newWorkflow]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('工作流创建成功！');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleViewLogs = (execution: WorkflowExecution) => {
    setSelectedExecution(execution);
    setIsLogModalVisible(true);
  };

  const getOverallStats = () => {
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.status === 'active').length;
    const avgSuccessRate = workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length;
    const totalExecutions = executions.length;

    return {
      totalWorkflows,
      activeWorkflows,
      avgSuccessRate: avgSuccessRate.toFixed(1),
      totalExecutions
    };
  };

  const stats = getOverallStats();

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-wrapper">
          <div className="page-title-content">
            <h1 className="page-title">工作流管理</h1>
            <p className="page-description">智能工作流编排和执行监控</p>
          </div>
          <div className="page-title-actions">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateWorkflow}
            >
              创建工作流
            </Button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总工作流"
              value={stats.totalWorkflows}
              prefix={<BranchesOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="运行中"
              value={stats.activeWorkflows}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="平均成功率"
              value={stats.avgSuccessRate}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总执行次数"
              value={stats.totalExecutions}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="工作流列表" key="workflows">
            <Table
              columns={workflowColumns}
              dataSource={workflows}
              rowKey="id"
              pagination={{
                total: workflows.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 个工作流`,
              }}
            />
          </TabPane>
          
          <TabPane tab="执行记录" key="executions">
            <Table
              columns={executionColumns}
              dataSource={executions}
              rowKey="id"
              pagination={{
                total: executions.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条执行记录`,
              }}
            />
          </TabPane>
          
          <TabPane tab="工作流模板" key="templates">
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
              dataSource={[
                {
                  title: '电商订单处理',
                  description: '完整的订单处理流程，包括验证、支付、发货等步骤',
                  category: '电商'
                },
                {
                  title: '客户服务自动化',
                  description: '智能客服响应和问题处理流程',
                  category: '客服'
                },
                {
                  title: '数据分析报告',
                  description: '定期生成数据分析报告和发送',
                  category: '数据'
                }
              ]}
              renderItem={item => (
                <List.Item>
                  <Card
                    size="small"
                    actions={[
                      <EyeOutlined key="view" />,
                      <PlusOutlined key="use" />
                    ]}
                  >
                    <Card.Meta
                      avatar={<Avatar icon={<BranchesOutlined />} />}
                      title={item.title}
                      description={
                        <div>
                          <Tag color="blue">{item.category}</Tag>
                          <p style={{ marginTop: 8, fontSize: '12px' }}>
                            {item.description}
                          </p>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 创建工作流模态框 */}
      <Modal
        title="创建工作流"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="工作流名称"
            rules={[{ required: true, message: '请输入工作流名称' }]}
          >
            <Input placeholder="请输入工作流名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入工作流描述' }]}
          >
            <TextArea 
              rows={3}
              placeholder="请输入工作流描述"
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
          >
            <Select placeholder="请选择工作流分类">
              <Option value="ecommerce">电商</Option>
              <Option value="customer_service">客服</Option>
              <Option value="data_analysis">数据分析</Option>
              <Option value="marketing">营销</Option>
              <Option value="logistics">物流</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 执行日志模态框 */}
      <Modal
        title="执行日志"
        open={isLogModalVisible}
        onCancel={() => setIsLogModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedExecution && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <p><strong>执行ID:</strong> {selectedExecution.id}</p>
              </Col>
              <Col span={8}>
                <p><strong>工作流:</strong> {selectedExecution.workflowName}</p>
              </Col>
              <Col span={8}>
                <p><strong>状态:</strong> 
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {selectedExecution.status}
                  </Tag>
                </p>
              </Col>
            </Row>
            
            <Progress 
              percent={selectedExecution.progress} 
              style={{ marginBottom: 16 }}
            />

            <Timeline>
              {selectedExecution.logs.map((log, index) => (
                <Timeline.Item
                  key={index}
                  color={log.status === 'success' ? 'green' : log.status === 'error' ? 'red' : 'blue'}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>
                      {log.step}
                      <Tag 
                        color={log.status === 'success' ? 'green' : log.status === 'error' ? 'red' : 'blue'}
                        style={{ marginLeft: 8 }}
                      >
                        {log.status}
                      </Tag>
                    </p>
                    <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                      {log.timestamp}
                    </p>
                    <p style={{ margin: 0 }}>{log.message}</p>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WorkflowManagement;
