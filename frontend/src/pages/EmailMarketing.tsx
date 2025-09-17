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
  Progress,
  message,
  Tabs,
  List,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  MailOutlined,
  SendOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Campaign {
  id: string;
  name: string;
  type: 'welcome' | 'promotional' | 'abandoned_cart' | 'newsletter';
  status: 'draft' | 'active' | 'paused' | 'completed';
  sentCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  targetAudience: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  previewText: string;
}

const EmailMarketing: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'camp_001',
      name: '春季促销活动',
      type: 'promotional',
      status: 'active',
      sentCount: 1250,
      openRate: 28.5,
      clickRate: 4.2,
      createdAt: '2024-01-20',
      targetAudience: '高价值客户'
    },
    {
      id: 'camp_002', 
      name: '新用户欢迎系列',
      type: 'welcome',
      status: 'active',
      sentCount: 856,
      openRate: 45.3,
      clickRate: 12.1,
      createdAt: '2024-01-18',
      targetAudience: '新注册用户'
    },
    {
      id: 'camp_003',
      name: '购物车提醒',
      type: 'abandoned_cart',
      status: 'paused',
      sentCount: 432,
      openRate: 22.1,
      clickRate: 8.7,
      createdAt: '2024-01-15',
      targetAudience: '弃购用户'
    }
  ]);

  const [templates] = useState<EmailTemplate[]>([
    {
      id: 'tpl_001',
      name: '欢迎邮件模板',
      type: 'welcome',
      subject: '欢迎加入 {brand_name}！',
      previewText: '感谢您选择我们，开启美好购物体验...'
    },
    {
      id: 'tpl_002',
      name: '促销活动模板',
      type: 'promotional',
      subject: '🎉 限时优惠 - {discount}% 折扣等您来抢！',
      previewText: '专属优惠活动现已开始，不要错过...'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [form] = Form.useForm();

  const campaignColumns = [
    {
      title: '活动名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Campaign) => (
        <Space>
          <strong>{text}</strong>
          <Tag color="blue">{getCampaignTypeText(record.type)}</Tag>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          draft: { color: 'default', text: '草稿' },
          active: { color: 'green', text: '活跃' },
          paused: { color: 'orange', text: '暂停' },
          completed: { color: 'blue', text: '已完成' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '发送数量',
      dataIndex: 'sentCount',
      key: 'sentCount',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '打开率',
      dataIndex: 'openRate',
      key: 'openRate',
      render: (rate: number) => `${rate}%`,
      sorter: (a: Campaign, b: Campaign) => a.openRate - b.openRate,
    },
    {
      title: '点击率',
      dataIndex: 'clickRate',
      key: 'clickRate',
      render: (rate: number) => `${rate}%`,
      sorter: (a: Campaign, b: Campaign) => a.clickRate - b.clickRate,
    },
    {
      title: '目标受众',
      dataIndex: 'targetAudience',
      key: 'targetAudience',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Campaign) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>
            查看
          </Button>
          <Button size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button size="small" icon={<BarChartOutlined />}>
            分析
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const getCampaignTypeText = (type: string) => {
    const typeMap = {
      welcome: '欢迎邮件',
      promotional: '促销活动',
      abandoned_cart: '购物车提醒',
      newsletter: '邮件通讯'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const handleCreateCampaign = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newCampaign: Campaign = {
        id: `camp_${Date.now()}`,
        name: values.name,
        type: values.type,
        status: 'draft',
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        createdAt: new Date().toISOString().split('T')[0],
        targetAudience: values.targetAudience
      };
      
      setCampaigns([...campaigns, newCampaign]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('邮件活动创建成功！');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const getOverallStats = () => {
    const totalSent = campaigns.reduce((sum, camp) => sum + camp.sentCount, 0);
    const avgOpenRate = campaigns.reduce((sum, camp) => sum + camp.openRate, 0) / campaigns.length;
    const avgClickRate = campaigns.reduce((sum, camp) => sum + camp.clickRate, 0) / campaigns.length;
    
    return {
      totalCampaigns: campaigns.length,
      totalSent,
      avgOpenRate: avgOpenRate.toFixed(1),
      avgClickRate: avgClickRate.toFixed(1)
    };
  };

  const stats = getOverallStats();

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-wrapper">
          <div className="page-title-content">
            <h1 className="page-title">邮件营销</h1>
            <p className="page-description">AI驱动的智能邮件营销活动管理</p>
          </div>
          <div className="page-title-actions">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateCampaign}
            >
              创建活动
            </Button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总活动数"
              value={stats.totalCampaigns}
              prefix={<MailOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总发送量"
              value={stats.totalSent}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="平均打开率"
              value={stats.avgOpenRate}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
            <Progress 
              percent={parseFloat(stats.avgOpenRate)} 
              showInfo={false} 
              strokeColor="#faad14"
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="平均点击率"
              value={stats.avgClickRate}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress 
              percent={parseFloat(stats.avgClickRate) * 5} 
              showInfo={false} 
              strokeColor="#722ed1"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="营销活动" key="campaigns">
            <Table
              columns={campaignColumns}
              dataSource={campaigns}
              rowKey="id"
              pagination={{
                total: campaigns.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 个活动`,
              }}
            />
          </TabPane>
          
          <TabPane tab="邮件模板" key="templates">
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }}
              dataSource={templates}
              renderItem={template => (
                <List.Item>
                  <Card
                    size="small"
                    actions={[
                      <EyeOutlined key="view" />,
                      <EditOutlined key="edit" />,
                      <DeleteOutlined key="delete" />
                    ]}
                  >
                    <Card.Meta
                      avatar={<Avatar icon={<MailOutlined />} />}
                      title={template.name}
                      description={
                        <div>
                          <p><strong>主题:</strong> {template.subject}</p>
                          <p style={{ color: '#666', fontSize: '12px' }}>
                            {template.previewText}
                          </p>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </TabPane>
          
          <TabPane tab="受众分群" key="segments">
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <h3>受众分群功能</h3>
              <p>智能客户分群和定向功能开发中...</p>
              <Button type="primary">创建分群</Button>
            </div>
          </TabPane>
          
          <TabPane tab="A/B测试" key="abtest">
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <h3>A/B测试功能</h3>
              <p>邮件内容A/B测试和效果优化功能开发中...</p>
              <Button type="primary">创建测试</Button>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* 创建活动模态框 */}
      <Modal
        title="创建邮件营销活动"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="活动名称"
            rules={[{ required: true, message: '请输入活动名称' }]}
          >
            <Input placeholder="请输入活动名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="活动类型"
            rules={[{ required: true, message: '请选择活动类型' }]}
          >
            <Select placeholder="请选择活动类型">
              <Option value="welcome">欢迎邮件</Option>
              <Option value="promotional">促销活动</Option>
              <Option value="abandoned_cart">购物车提醒</Option>
              <Option value="newsletter">邮件通讯</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="targetAudience"
            label="目标受众"
            rules={[{ required: true, message: '请选择目标受众' }]}
          >
            <Select placeholder="请选择目标受众">
              <Option value="all_customers">所有客户</Option>
              <Option value="new_customers">新客户</Option>
              <Option value="high_value_customers">高价值客户</Option>
              <Option value="inactive_customers">不活跃客户</Option>
              <Option value="abandoned_cart_users">弃购用户</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="活动描述"
          >
            <TextArea 
              rows={3}
              placeholder="请输入活动描述（可选）"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmailMarketing;
