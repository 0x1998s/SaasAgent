/**
 * TypeScript类型定义
 */

// 基础类型
export interface BaseResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Agent相关类型
export interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'idle' | 'failed' | 'paused';
  capabilities: AgentCapability[];
  tasksCompleted: number;
  tasksRunning: number;
  tasksFailed: number;
  lastActive: string;
  createdAt: string;
  description?: string;
  config?: Record<string, any>;
  metrics?: AgentMetrics;
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  successRate: number;
}

export interface AgentTask {
  id: string;
  type: string;
  priority: number;
  payload: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: Record<string, any>;
  error?: string;
}

export enum AgentCapability {
  PERCEPTION = 'perception',
  PLANNING = 'planning',
  TOOL_USE = 'tool_use',
  KNOWLEDGE = 'knowledge',
  MEMORY = 'memory',
  COMMUNICATION = 'communication'
}

export interface AgentMemory {
  shortTerm: any[];
  longTerm: Record<string, any>;
  episodic: any[];
  semantic: Record<string, any>;
}

// 物流相关类型
export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: ShipmentStatus;
  currentLocation?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  customerEmail?: string;
  events: TrackingEvent[];
  exceptionInfo?: string;
  lastUpdated: string;
}

export enum ShipmentStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  EXCEPTION = 'exception',
  RETURNED = 'returned',
  CANCELLED = 'cancelled'
}

export interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

// 邮件营销相关类型
export interface EmailCampaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetAudience: Record<string, any>;
  templateId: string;
  schedule: Record<string, any>;
  personalization: Record<string, any>;
  abTest?: Record<string, any>;
  metrics?: EmailMetrics;
  createdAt: string;
  updatedAt: string;
}

export enum CampaignType {
  WELCOME = 'welcome',
  PROMOTIONAL = 'promotional',
  ABANDONED_CART = 'abandoned_cart',
  PRODUCT_RECOMMENDATION = 'product_recommendation',
  REACTIVATION = 'reactivation',
  NEWSLETTER = 'newsletter',
  TRANSACTIONAL = 'transactional'
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface EmailMetrics {
  campaignId: string;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  unsubscribedCount: number;
  bouncedCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: CampaignType;
  subject: string;
  content: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

// 工作流相关类型
export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  connections: Record<string, string[]>;
  totalSteps: number;
  completedSteps: number;
  executionTime: number;
  lastRun?: string;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  agentType: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  conditions: Record<string, any>;
  retryCount: number;
  maxRetries: number;
  timeoutSeconds: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  currentStep?: string;
  completedSteps: string[];
  failedSteps: string[];
  context: Record<string, any>;
  results: Record<string, any>;
  progress: number;
  startTime: string;
  endTime?: string;
  error?: string;
  logs: ExecutionLog[];
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export interface ExecutionLog {
  timestamp: string;
  step: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  data?: Record<string, any>;
}

// 数据分析相关类型
export interface SalesData {
  date: string;
  sales: number;
  orders: number;
  customers: number;
  revenue: number;
}

export interface ProductData {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  rating: number;
  reviews: number;
}

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  segment: string;
  lifetimeValue: number;
  lastPurchase: string;
  totalOrders: number;
}

export interface AnalyticsQuery {
  query: string;
  timeRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}

export interface AnalyticsResult {
  query: string;
  data: any;
  visualization?: {
    type: 'table' | 'chart' | 'metric';
    config: Record<string, any>;
  };
  insights?: string[];
  recommendations?: string[];
}

// 系统相关类型
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  databases: Record<string, boolean>;
  services: Record<string, boolean>;
  agents: {
    total: number;
    running: number;
    failed: number;
  };
  workflows: {
    total: number;
    running: number;
  };
}

export interface SystemConfig {
  general: {
    systemName: string;
    systemDescription: string;
    defaultLanguage: string;
    timezone: string;
    maxConcurrentAgents: number;
  };
  features: {
    enableLogging: boolean;
    enableNotifications: boolean;
    enableMetrics: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordStrength: 'low' | 'medium' | 'high';
    enableTwoFactor: boolean;
    enableRateLimit: boolean;
    allowedIPs?: string[];
  };
  integrations: {
    openai?: {
      apiKey: string;
      model: string;
    };
    anthropic?: {
      apiKey: string;
      model: string;
    };
    aftership?: {
      apiKey: string;
    };
    sendgrid?: {
      apiKey: string;
    };
  };
}

// API密钥类型
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'inactive';
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
}

// 通知类型
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  profile?: {
    firstName: string;
    lastName: string;
    avatar?: string;
    timezone: string;
    language: string;
  };
}
