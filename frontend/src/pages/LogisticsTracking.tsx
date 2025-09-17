import React, { useState } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Timeline, 
  Row, 
  Col,
  Statistic,
  Select,
  message,
  Modal,
  Form,
  Divider
} from 'antd';
import {
  SearchOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SendOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  currentLocation: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  customerEmail: string;
  events: Array<{
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }>;
}

const LogisticsTracking: React.FC = () => {
  const [trackingData, setTrackingData] = useState<TrackingInfo[]>([
    {
      trackingNumber: '1Z999AA1234567890',
      carrier: 'UPS',
      status: 'out_for_delivery',
      currentLocation: '北京市朝阳区配送中心',
      estimatedDelivery: '2024-01-25 18:00',
      customerEmail: 'customer1@example.com',
      events: [
        {
          status: '已发货',
          location: '深圳市南山区',
          timestamp: '2024-01-22 09:00',
          description: '包裹已从发货仓库发出'
        },
        {
          status: '运输中',
          location: '广州市白云区转运中心',
          timestamp: '2024-01-22 15:30',
          description: '包裹正在转运中心处理'
        },
        {
          status: '运输中',
          location: '北京市朝阳区配送中心',
          timestamp: '2024-01-24 08:00',
          description: '包裹已到达目的地配送中心'
        },
        {
          status: '派送中',
          location: '北京市朝阳区',
          timestamp: '2024-01-25 10:00',
          description: '包裹正在派送途中'
        }
      ]
    },
    {
      trackingNumber: '1234567890123456',
      carrier: 'FedEx',
      status: 'delivered',
      currentLocation: '上海市浦东新区',
      estimatedDelivery: '2024-01-22 16:00',
      actualDelivery: '2024-01-22 15:30',
      customerEmail: 'customer2@example.com',
      events: [
        {
          status: '已签收',
          location: '上海市浦东新区',
          timestamp: '2024-01-22 15:30',
          description: '包裹已成功签收'
        }
      ]
    },
    {
      trackingNumber: 'SF1234567890',
      carrier: '顺丰',
      status: 'exception',
      currentLocation: '杭州市西湖区',
      estimatedDelivery: '2024-01-24 12:00',
      customerEmail: 'customer3@example.com',
      events: [
        {
          status: '异常',
          location: '杭州市西湖区',
          timestamp: '2024-01-23 14:20',
          description: '地址信息需要修正'
        }
      ]
    }
  ]);

  const [selectedTracking, setSelectedTracking] = useState<TrackingInfo | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isNotifyModalVisible, setIsNotifyModalVisible] = useState(false);
  const [form] = Form.useForm();

  const statusConfig = {
    pending: { color: 'default', text: '待处理', icon: <ClockCircleOutlined /> },
    in_transit: { color: 'blue', text: '运输中', icon: <TruckOutlined /> },
    out_for_delivery: { color: 'orange', text: '派送中', icon: <TruckOutlined /> },
    delivered: { color: 'green', text: '已送达', icon: <CheckCircleOutlined /> },
    exception: { color: 'red', text: '异常', icon: <ExclamationCircleOutlined /> }
  };

  const columns = [
    {
      title: '跟踪号',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: '承运商',
      dataIndex: 'carrier',
      key: 'carrier',
      render: (carrier: string) => <Tag color="blue">{carrier}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '当前位置',
      dataIndex: 'currentLocation',
      key: 'currentLocation',
    },
    {
      title: '预计送达',
      dataIndex: 'estimatedDelivery',
      key: 'estimatedDelivery',
    },
    {
      title: '客户邮箱',
      dataIndex: 'customerEmail',
      key: 'customerEmail',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: TrackingInfo) => (
        <Space>
          <Button 
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            查看详情
          </Button>
          <Button 
            size="small"
            icon={<SendOutlined />}
            onClick={() => handleNotifyCustomer(record)}
          >
            通知客户
          </Button>
          <Button 
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => handleRefreshTracking(record.trackingNumber)}
          >
            刷新
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    if (!value.trim()) {
      message.warning('请输入跟踪号');
      return;
    }
    
    // 模拟搜索
    const found = trackingData.find(item => 
      item.trackingNumber.toLowerCase().includes(value.toLowerCase())
    );
    
    if (found) {
      setSelectedTracking(found);
      setIsDetailModalVisible(true);
    } else {
      message.error('未找到相关跟踪信息');
    }
  };

  const handleBatchTrack = () => {
    message.success('批量跟踪功能启动中...');
  };

  const handleViewDetails = (tracking: TrackingInfo) => {
    setSelectedTracking(tracking);
    setIsDetailModalVisible(true);
  };

  const handleNotifyCustomer = (tracking: TrackingInfo) => {
    setSelectedTracking(tracking);
    setIsNotifyModalVisible(true);
  };

  const handleRefreshTracking = (trackingNumber: string) => {
    message.loading('正在刷新跟踪信息...', 1);
    setTimeout(() => {
      message.success('跟踪信息已更新');
    }, 1000);
  };

  const handleSendNotification = async () => {
    try {
      const values = await form.validateFields();
      message.success('客户通知已发送');
      setIsNotifyModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const getStatusStats = () => {
    const stats = trackingData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: trackingData.length,
      delivered: stats.delivered || 0,
      inTransit: (stats.in_transit || 0) + (stats.out_for_delivery || 0),
      exceptions: stats.exception || 0
    };
  };

  const stats = getStatusStats();

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-wrapper">
          <div className="page-title-content">
            <h1 className="page-title">物流跟踪</h1>
            <p className="page-description">智能物流跟踪和客户通知管理</p>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总包裹数"
              value={stats.total}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="已送达"
              value={stats.delivered}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="运输中"
              value={stats.inTransit}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="异常包裹"
              value={stats.exceptions}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="输入跟踪号查询"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} md={12}>
            <Space>
              <Button type="primary" onClick={handleBatchTrack}>
                批量跟踪
              </Button>
              <Button onClick={() => window.location.reload()}>
                刷新全部
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 跟踪列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={trackingData}
          rowKey="trackingNumber"
          pagination={{
            total: trackingData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个包裹`,
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="包裹跟踪详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedTracking && (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <p><strong>跟踪号:</strong> {selectedTracking.trackingNumber}</p>
                <p><strong>承运商:</strong> {selectedTracking.carrier}</p>
                <p><strong>当前状态:</strong> 
                  <Tag color={statusConfig[selectedTracking.status].color} style={{ marginLeft: 8 }}>
                    {statusConfig[selectedTracking.status].text}
                  </Tag>
                </p>
              </Col>
              <Col span={12}>
                <p><strong>当前位置:</strong> {selectedTracking.currentLocation}</p>
                <p><strong>预计送达:</strong> {selectedTracking.estimatedDelivery}</p>
                {selectedTracking.actualDelivery && (
                  <p><strong>实际送达:</strong> {selectedTracking.actualDelivery}</p>
                )}
              </Col>
            </Row>

            <Divider>跟踪记录</Divider>
            
            <Timeline>
              {selectedTracking.events.reverse().map((event, index) => (
                <Timeline.Item
                  key={index}
                  color={index === 0 ? 'green' : 'blue'}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{event.status}</p>
                    <p style={{ margin: 0, color: '#666' }}>{event.location}</p>
                    <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>{event.timestamp}</p>
                    <p style={{ margin: 0 }}>{event.description}</p>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Modal>

      {/* 通知客户模态框 */}
      <Modal
        title="发送客户通知"
        open={isNotifyModalVisible}
        onOk={handleSendNotification}
        onCancel={() => setIsNotifyModalVisible(false)}
        okText="发送"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="客户邮箱"
            initialValue={selectedTracking?.customerEmail}
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item
            name="notificationType"
            label="通知类型"
            rules={[{ required: true, message: '请选择通知类型' }]}
          >
            <Select placeholder="请选择通知类型">
              <Option value="status_update">状态更新</Option>
              <Option value="delivery_reminder">送达提醒</Option>
              <Option value="exception_notice">异常通知</Option>
              <Option value="delivery_confirmation">签收确认</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="message"
            label="自定义消息"
          >
            <Input.TextArea 
              rows={4}
              placeholder="输入自定义通知内容（可选）"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LogisticsTracking;
