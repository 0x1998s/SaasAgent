/**
 * API服务层
 * 统一管理所有API请求
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { message } from 'antd';

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          message.error('未授权，请重新登录');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          message.error('权限不足');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        default:
          message.error(data?.message || '请求失败');
      }
    } else if (error.request) {
      message.error('网络连接失败');
    } else {
      message.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

// API接口定义
export const agentAPI = {
  // 获取Agent列表
  getAgents: () => api.get('/v1/agents/list'),
  
  // 创建Agent
  createAgent: (data: any) => api.post('/v1/agents/create', data),
  
  // 获取Agent状态
  getAgentStatus: (agentId: string) => api.get(`/v1/agents/${agentId}/status`),
  
  // 执行Agent任务
  executeAgentTask: (agentId: string, data: any) => api.post(`/v1/agents/${agentId}/execute`, data),
  
  // 删除Agent
  removeAgent: (agentId: string) => api.delete(`/v1/agents/${agentId}`),
  
  // 获取Agent记忆
  getAgentMemory: (agentId: string, memoryType?: string) => 
    api.get(`/v1/agents/${agentId}/memory`, { params: { memory_type: memoryType } }),
  
  // 获取Agent类型
  getAgentTypes: () => api.get('/v1/agents/types'),
  
  // 获取Agent能力
  getAgentCapabilities: () => api.get('/v1/agents/capabilities'),
};

export const logisticsAPI = {
  // 跟踪包裹
  trackShipment: (data: any) => api.post('/v1/logistics/track', data),
  
  // 批量跟踪
  batchTrack: (data: any) => api.post('/v1/logistics/batch-track', data),
  
  // 检查异常
  checkExceptions: (data: any) => api.post('/v1/logistics/check-exceptions', data),
  
  // 通知客户
  notifyCustomer: (data: any) => api.post('/v1/logistics/notify-customer', data),
  
  // 预测送达时间
  predictDelivery: (data: any) => api.post('/v1/logistics/predict-delivery', data),
};

export const marketingAPI = {
  // 创建营销活动
  createCampaign: (data: any) => api.post('/v1/marketing/create-campaign', data),
  
  // 生成邮件内容
  generateEmailContent: (data: any) => api.post('/v1/marketing/generate-content', data),
  
  // 发送营销活动
  sendCampaign: (data: any) => api.post('/v1/marketing/send-campaign', data),
  
  // 分析营销表现
  analyzePerformance: (data: any) => api.post('/v1/marketing/analyze-performance', data),
  
  // 优化营销活动
  optimizeCampaign: (data: any) => api.post('/v1/marketing/optimize-campaign', data),
  
  // 受众分群
  segmentAudience: (data: any) => api.post('/v1/marketing/segment-audience', data),
  
  // A/B测试
  runAbTest: (data: any) => api.post('/v1/marketing/ab-test', data),
};

export const analyticsAPI = {
  // 获取销售数据
  getSalesData: (params: any) => api.get('/v1/analytics/sales-data', { params }),
  
  // 获取产品数据
  getProductData: (params: any) => api.get('/v1/analytics/product-data', { params }),
  
  // 获取客户数据
  getCustomerData: (params: any) => api.get('/v1/analytics/customer-data', { params }),
  
  // ChatBI查询
  chatBIQuery: (data: any) => api.post('/v1/analytics/chatbi-query', data),
  
  // 生成报告
  generateReport: (data: any) => api.post('/v1/analytics/generate-report', data),
};

export const workflowAPI = {
  // 获取工作流列表
  getWorkflows: () => api.get('/v1/workflows/list'),
  
  // 创建工作流
  createWorkflow: (data: any) => api.post('/v1/workflows/create', data),
  
  // 执行工作流
  executeWorkflow: (workflowId: string, data: any) => 
    api.post(`/v1/workflows/${workflowId}/execute`, data),
  
  // 获取工作流状态
  getWorkflowStatus: (workflowId: string) => api.get(`/v1/workflows/${workflowId}/status`),
  
  // 取消工作流
  cancelWorkflow: (workflowId: string) => api.post(`/v1/workflows/${workflowId}/cancel`),
  
  // 获取执行记录
  getExecutions: (params: any) => api.get('/v1/workflows/executions', { params }),
};

export const systemAPI = {
  // 健康检查
  healthCheck: () => api.get('/v1/health'),
  
  // 详细健康检查
  detailedHealthCheck: () => api.get('/v1/health/detailed'),
  
  // 数据库健康检查
  databaseHealth: () => api.get('/v1/health/databases'),
  
  // 获取系统信息
  getSystemInfo: () => api.get('/v1/system/info'),
  
  // 获取系统配置
  getSystemConfig: () => api.get('/v1/system/config'),
  
  // 更新系统配置
  updateSystemConfig: (data: any) => api.put('/v1/system/config', data),
};

export default api;
