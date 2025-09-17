import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Tabs, 
  Divider,
  Row,
  Col,
  message,
  Space,
  Alert,
  Table,
  Tag,
  Modal
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  KeyOutlined,
  DatabaseOutlined,
  BellOutlined,
  UserOutlined,
  LockOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastUsed: string;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [apiKeyForm] = Form.useForm();
  const [isApiKeyModalVisible, setIsApiKeyModalVisible] = useState(false);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'key_001',
      name: 'Production API Key',
      key: 'sk-...abc123',
      status: 'active',
      createdAt: '2024-01-20',
      lastUsed: '2024-01-25 14:30'
    },
    {
      id: 'key_002',
      name: 'Development API Key',
      key: 'sk-...def456',
      status: 'active',
      createdAt: '2024-01-22',
      lastUsed: '2024-01-25 10:15'
    }
  ]);

  const handleSaveGeneral = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 模拟保存
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('设置已保存');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (type: string) => {
    message.loading(`测试${type}连接中...`, 2);
    
    // 模拟测试连接
    setTimeout(() => {
      message.success(`${type}连接测试成功！`);
    }, 2000);
  };

  const handleCreateApiKey = async () => {
    try {
      const values = await apiKeyForm.validateFields();
      
      const newApiKey: ApiKey = {
        id: `key_${Date.now()}`,
        name: values.name,
        key: `sk-...${Math.random().toString(36).substr(2, 6)}`,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastUsed: '-'
      };
      
      setApiKeys([...apiKeys, newApiKey]);
      setIsApiKeyModalVisible(false);
      apiKeyForm.resetFields();
      message.success('API密钥创建成功');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
    message.success('API密钥已删除');
  };

  const apiKeyColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'API密钥',
      dataIndex: 'key',
      key: 'key',
      render: (key: string) => <code>{key}</code>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '最后使用',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: ApiKey) => (
        <Space>
          <Button 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteApiKey(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-wrapper">
          <div className="page-title-content">
            <h1 className="page-title">系统设置</h1>
            <p className="page-description">配置系统参数和集成设置</p>
          </div>
        </div>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本设置" key="general" icon={<UserOutlined />}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                systemName: 'SaasAgent',
                systemDescription: '国际电商AI Agent智能平台',
                defaultLanguage: 'zh-CN',
                timezone: 'Asia/Shanghai',
                enableLogging: true,
                enableNotifications: true
              }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="systemName"
                    label="系统名称"
                    rules={[{ required: true, message: '请输入系统名称' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="defaultLanguage"
                    label="默认语言"
                  >
                    <Select>
                      <Option value="zh-CN">中文(简体)</Option>
                      <Option value="en-US">English</Option>
                      <Option value="ja-JP">日本語</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="timezone"
                    label="时区"
                  >
                    <Select>
                      <Option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</Option>
                      <Option value="America/New_York">America/New_York (UTC-5)</Option>
                      <Option value="Europe/London">Europe/London (UTC+0)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxConcurrentAgents"
                    label="最大并发Agent数"
                  >
                    <Input type="number" min={1} max={100} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="systemDescription"
                label="系统描述"
              >
                <TextArea rows={3} />
              </Form.Item>

              <Divider>功能开关</Divider>

              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="enableLogging"
                    label="启用日志记录"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="enableNotifications"
                    label="启用通知"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="enableMetrics"
                    label="启用性能监控"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    loading={loading}
                    onClick={handleSaveGeneral}
                  >
                    保存设置
                  </Button>
                  <Button icon={<ReloadOutlined />}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="API集成" key="api" icon={<KeyOutlined />}>
            <Alert
              message="API密钥管理"
              description="管理系统中使用的各种API密钥，确保安全性"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setIsApiKeyModalVisible(true)}
              >
                创建API密钥
              </Button>
            </div>

            <Table
              columns={apiKeyColumns}
              dataSource={apiKeys}
              rowKey="id"
              pagination={false}
            />

            <Divider>第三方服务配置</Divider>

            <Form layout="vertical">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="OpenAI API Key">
                    <Input.Password 
                      placeholder="sk-..." 
                      suffix={
                        <Button 
                          size="small" 
                          type="link"
                          onClick={() => handleTestConnection('OpenAI')}
                        >
                          测试连接
                        </Button>
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Anthropic API Key">
                    <Input.Password 
                      placeholder="sk-ant-..." 
                      suffix={
                        <Button 
                          size="small" 
                          type="link"
                          onClick={() => handleTestConnection('Anthropic')}
                        >
                          测试连接
                        </Button>
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="AfterShip API Key">
                    <Input.Password 
                      placeholder="aftership-api-key" 
                      suffix={
                        <Button 
                          size="small" 
                          type="link"
                          onClick={() => handleTestConnection('AfterShip')}
                        >
                          测试连接
                        </Button>
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="SendGrid API Key">
                    <Input.Password 
                      placeholder="SG...." 
                      suffix={
                        <Button 
                          size="small" 
                          type="link"
                          onClick={() => handleTestConnection('SendGrid')}
                        >
                          测试连接
                        </Button>
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </TabPane>

          <TabPane tab="数据库配置" key="database" icon={<DatabaseOutlined />}>
            <Form layout="vertical">
              <Alert
                message="数据库连接配置"
                description="配置系统使用的各种数据库连接"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="PostgreSQL连接">
                    <Input 
                      placeholder="postgresql://user:pass@host:port/db" 
                      suffix={
                        <Button 
                          size="small" 
                          type="link"
                          onClick={() => handleTestConnection('PostgreSQL')}
                        >
                          测试连接
                        </Button>
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Redis连接">
                    <Input 
                      placeholder="redis://host:port/db" 
                      suffix={
                        <Button 
                          size="small" 
                          type="link"
                          onClick={() => handleTestConnection('Redis')}
                        >
                          测试连接
                        </Button>
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="MongoDB连接">
                    <Input 
                      placeholder="mongodb://host:port/db" 
                      suffix={
                        <Button 
                          size="small" 
                          type="link"
                          onClick={() => handleTestConnection('MongoDB')}
                        >
                          测试连接
                        </Button>
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="ChromaDB连接">
                    <Input 
                      placeholder="http://host:port" 
                      suffix={
                        <Button 
                          size="small" 
                          type="link"
                          onClick={() => handleTestConnection('ChromaDB')}
                        >
                          测试连接
                        </Button>
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </TabPane>

          <TabPane tab="通知设置" key="notifications" icon={<BellOutlined />}>
            <Form layout="vertical">
              <Alert
                message="通知配置"
                description="配置系统通知和告警设置"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item label="邮件通知">
                    <Switch defaultChecked />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="短信通知">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="微信通知">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>通知规则</Divider>

              <Form.Item label="Agent故障通知">
                <Switch defaultChecked />
                <p style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
                  当Agent出现故障时立即发送通知
                </p>
              </Form.Item>

              <Form.Item label="工作流异常通知">
                <Switch defaultChecked />
                <p style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
                  当工作流执行异常时发送通知
                </p>
              </Form.Item>

              <Form.Item label="系统资源告警">
                <Switch defaultChecked />
                <p style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
                  当系统资源使用率过高时发送告警
                </p>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="安全设置" key="security" icon={<LockOutlined />}>
            <Alert
              message="安全配置"
              description="管理系统安全相关设置"
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form layout="vertical">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="会话超时时间(分钟)">
                    <Input type="number" defaultValue={30} min={5} max={1440} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="密码强度要求">
                    <Select defaultValue="medium">
                      <Option value="low">低</Option>
                      <Option value="medium">中</Option>
                      <Option value="high">高</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item label="启用双因素认证">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="启用API限流">
                    <Switch defaultChecked />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="启用访问日志">
                    <Switch defaultChecked />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="允许的IP地址">
                <TextArea 
                  rows={3}
                  placeholder="输入允许访问的IP地址，每行一个"
                />
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>

      {/* 创建API密钥模态框 */}
      <Modal
        title="创建API密钥"
        open={isApiKeyModalVisible}
        onOk={handleCreateApiKey}
        onCancel={() => setIsApiKeyModalVisible(false)}
        okText="创建"
        cancelText="取消"
      >
        <Form form={apiKeyForm} layout="vertical">
          <Form.Item
            name="name"
            label="密钥名称"
            rules={[{ required: true, message: '请输入密钥名称' }]}
          >
            <Input placeholder="请输入密钥名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea 
              rows={3}
              placeholder="请输入密钥用途描述（可选）"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;
