import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message,
  Popconfirm,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Option } = Select;

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'idle' | 'failed';
  capabilities: string[];
  tasksCompleted: number;
  lastActive: string;
  description?: string;
}

const AgentManagement: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'logistics_1',
      name: '物流跟踪专员',
      type: 'logistics',
      status: 'running',
      capabilities: ['perception', 'tool_use', 'communication'],
      tasksCompleted: 156,
      lastActive: '2分钟前',
      description: '负责物流包裹跟踪和客户通知'
    },
    {
      id: 'marketing_1',
      name: '邮件营销助手',
      type: 'email_marketing',
      status: 'idle',
      capabilities: ['planning', 'tool_use', 'communication', 'memory'],
      tasksCompleted: 89,
      lastActive: '15分钟前',
      description: '负责邮件营销活动创建和管理'
    },
    {
      id: 'analytics_1',
      name: '数据分析师',
      type: 'data_analytics',
      status: 'failed',
      capabilities: ['knowledge', 'tool_use'],
      tasksCompleted: 23,
      lastActive: '1小时前',
      description: '负责数据分析和报告生成'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Agent名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Agent) => (
        <Space>
          <strong>{text}</strong>
          <Tag color="blue">{record.type}</Tag>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          running: { color: 'green', text: '运行中' },
          idle: { color: 'default', text: '空闲' },
          failed: { color: 'red', text: '故障' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '能力',
      dataIndex: 'capabilities',
      key: 'capabilities',
      render: (capabilities: string[]) => (
        <Space>
          {capabilities.slice(0, 2).map(cap => (
            <Tag key={cap} color="processing">{cap}</Tag>
          ))}
          {capabilities.length > 2 && (
            <Tooltip title={capabilities.slice(2).join(', ')}>
              <Tag color="processing">+{capabilities.length - 2}</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '完成任务',
      dataIndex: 'tasksCompleted',
      key: 'tasksCompleted',
      sorter: (a: Agent, b: Agent) => a.tasksCompleted - b.tasksCompleted,
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActive',
      key: 'lastActive',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Agent) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleViewAgent(record.id)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'running' ? '暂停' : '启动'}>
            <Button 
              type="text" 
              icon={record.status === 'running' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleToggleAgent(record.id)}
            />
          </Tooltip>
          <Tooltip title="配置">
            <Button 
              type="text" 
              icon={<SettingOutlined />}
              onClick={() => handleConfigAgent(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个Agent吗？"
            onConfirm={() => handleDeleteAgent(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button 
                type="text" 
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleCreateAgent = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newAgent: Agent = {
        id: `${values.type}_${Date.now()}`,
        name: values.name,
        type: values.type,
        status: 'idle',
        capabilities: values.capabilities || [],
        tasksCompleted: 0,
        lastActive: '刚刚创建',
        description: values.description
      };
      
      setAgents([...agents, newAgent]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Agent创建成功！');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleViewAgent = (agentId: string) => {
    message.info(`查看Agent: ${agentId}`);
  };

  const handleToggleAgent = (agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: agent.status === 'running' ? 'idle' : 'running' as const }
        : agent
    ));
    message.success('Agent状态已更新');
  };

  const handleConfigAgent = (agentId: string) => {
    message.info(`配置Agent: ${agentId}`);
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents(agents.filter(agent => agent.id !== agentId));
    message.success('Agent已删除');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-wrapper">
          <div className="page-title-content">
            <h1 className="page-title">Agent管理</h1>
            <p className="page-description">管理和监控所有AI Agent的状态和性能</p>
          </div>
          <div className="page-title-actions">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateAgent}
            >
              创建Agent
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={agents}
          rowKey="id"
          pagination={{
            total: agents.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个Agent`,
          }}
        />
      </Card>

      <Modal
        title="创建新Agent"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            capabilities: ['perception', 'tool_use']
          }}
        >
          <Form.Item
            name="name"
            label="Agent名称"
            rules={[{ required: true, message: '请输入Agent名称' }]}
          >
            <Input placeholder="请输入Agent名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Agent类型"
            rules={[{ required: true, message: '请选择Agent类型' }]}
          >
            <Select placeholder="请选择Agent类型">
              <Option value="logistics">物流跟踪</Option>
              <Option value="email_marketing">邮件营销</Option>
              <Option value="data_analytics">数据分析</Option>
              <Option value="customer_service">客户服务</Option>
              <Option value="workflow">工作流管理</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="capabilities"
            label="Agent能力"
          >
            <Select
              mode="multiple"
              placeholder="请选择Agent能力"
            >
              <Option value="perception">感知能力</Option>
              <Option value="planning">规划能力</Option>
              <Option value="tool_use">工具使用</Option>
              <Option value="knowledge">知识检索</Option>
              <Option value="memory">记忆管理</Option>
              <Option value="communication">通信交流</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea 
              rows={3}
              placeholder="请输入Agent描述（可选）"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentManagement;
