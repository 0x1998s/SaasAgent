# SaasAgent - 国际电商AI Agent智能平台

<div align="center">

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**🚀 基于多Agent协同的国际电商AI智能平台**

**作者：Jemmy | 微信：Joeng_Jimmy**

</div>

## 🎯 项目概述

SaasAgent 是一个面向国际电商的AI Agent Demo，专为跨境电商SaaS场景设计。该平台集成了物流跟踪、邮件营销、退换货处理、数据洞察等核心业务场景的智能化解决方案。

### 🌟 核心特性

- 🤖 **智能Agent管理**: 多Agent协同工作，支持物流跟踪、邮件营销、数据分析
- 📦 **物流智能跟踪**: 实时包裹跟踪、异常检测、智能客户通知
- 📧 **AI邮件营销**: 智能内容生成、A/B测试、受众分群、效果分析
- 📊 **数据洞察分析**: ChatBI对话式查询、可视化报表、业务指标监控
- 🔄 **工作流编排**: LangGraph驱动的智能工作流自动化
- 🧠 **知识库系统**: RAG检索增强生成、向量数据库、智能问答
- 💾 **记忆管理**: 多层次记忆系统，支持会话记忆和长期记忆
- 🔌 **第三方集成**: 支持主流电商平台、物流商、支付网关API

### 🏆 技术亮点

- **企业级架构**: 微服务 + 多Agent + 容器化部署
- **AI原生设计**: LangGraph + LangChain + 多LLM支持
- **生产就绪**: 完整监控 + 日志 + Docker容器化
- **现代化前端**: React 18 + TypeScript + Ant Design

## 🏗️ 技术架构

### 🚀 后端技术栈

#### 核心框架
- **FastAPI** - 高性能异步API服务
- **LangGraph** - 多Agent协同工作流编排
- **LangChain** - LLM应用开发框架
- **SQLAlchemy** - 异步数据库ORM
- **Pydantic** - 数据验证和序列化

#### AI/LLM集成
- **OpenAI API** - GPT系列模型集成
- **Anthropic Claude** - Claude模型支持
- **Ollama** - 本地大模型推理
- **Transformers** - Hugging Face模型库

#### 数据存储
- **PostgreSQL** - 主数据库（生产环境）
- **Redis** - 缓存和会话存储
- **ChromaDB** - 向量数据库
- **MongoDB** - 文档数据库

#### 数据处理
- **Pandas** - 数据分析和处理
- **NumPy** - 科学计算
- **Scikit-learn** - 机器学习算法

### 🎨 前端技术栈
- **React 18** - 现代前端框架
- **TypeScript** - 类型安全开发
- **Ant Design** - 企业级UI组件库
- **ECharts** - 专业数据可视化
- **React Query** - 状态管理和缓存
- **Zustand** - 轻量级状态管理
- **Axios** - HTTP客户端

### 🔧 基础设施
- **Docker** - 容器化部署
- **Docker Compose** - 多容器编排
- **Nginx** - 反向代理和负载均衡
- **Prometheus** - 监控指标收集
- **Grafana** - 监控数据可视化

## 📁 项目结构

```
SaasAgent/
├── backend/                          # 🚀 后端服务
│   ├── app/                         # 应用主目录
│   │   ├── agents/                  # 🤖 AI Agent实现
│   │   │   ├── base_agent.py       # Agent基类
│   │   │   ├── agent_orchestrator.py # Agent编排器
│   │   │   ├── logistics_agent.py   # 物流跟踪Agent
│   │   │   └── email_marketing_agent.py # 邮件营销Agent
│   │   ├── api/                     # 🌐 API接口层
│   │   │   ├── routes.py           # 路由配置
│   │   │   └── v1/                 # API版本
│   │   │       ├── health.py       # 健康检查
│   │   │       └── agents.py       # Agent接口
│   │   ├── core/                    # 🏗️ 核心功能
│   │   │   ├── config.py           # 配置管理
│   │   │   └── database.py         # 数据库连接
│   │   ├── models/                  # 📊 数据模型
│   │   ├── services/                # 🔧 业务服务层
│   │   └── utils/                   # 🛠️ 工具函数
│   ├── main.py                      # 应用入口
│   ├── requirements.txt             # Python依赖
│   └── Dockerfile                   # 后端容器构建
├── frontend/                        # 🎨 前端应用
│   ├── src/
│   │   ├── components/             # React组件
│   │   │   └── Layout.tsx          # 布局组件
│   │   ├── pages/                  # 页面组件
│   │   │   ├── Dashboard.tsx       # 仪表盘
│   │   │   ├── AgentManagement.tsx # Agent管理
│   │   │   ├── LogisticsTracking.tsx # 物流跟踪
│   │   │   ├── EmailMarketing.tsx  # 邮件营销
│   │   │   ├── DataAnalytics.tsx   # 数据分析
│   │   │   ├── WorkflowManagement.tsx # 工作流管理
│   │   │   └── Settings.tsx        # 系统设置
│   │   ├── services/               # API服务
│   │   │   └── api.ts              # API客户端
│   │   ├── types/                  # TypeScript类型
│   │   │   └── index.ts            # 类型定义
│   │   └── utils/                  # 工具函数
│   │       └── index.ts            # 通用工具
│   ├── public/                     # 静态资源
│   ├── package.json               # 前端依赖
│   ├── tsconfig.json              # TypeScript配置
│   └── Dockerfile                 # 前端容器构建
├── docs/                           # 📚 项目文档
│   └── DEMO_GUIDE.md              # 演示指南
├── scripts/                        # 📜 脚本文件
│   ├── start.sh                   # Linux/Mac启动脚本
│   └── start.bat                  # Windows启动脚本
├── docker-compose.yml             # 🐳 容器编排
├── env.example                    # 环境变量示例
├── 简介.md                        # 项目简介
└── README.md                      # 📖 项目说明
```

## 🎯 核心功能模块

### 1. 🤖 多Agent协同框架
- **BaseAgent**: 统一Agent基类，提供核心能力抽象
- **AgentOrchestrator**: LangGraph驱动的工作流编排引擎
- **LogisticsAgent**: 物流跟踪和异常检测专业Agent
- **EmailMarketingAgent**: AI驱动的邮件营销Agent
- **能力系统**: 感知、规划、工具使用、知识检索、记忆、通信

### 2. 📦 智能物流跟踪
- **多承运商支持**: UPS、FedEx、DHL、顺丰等主流物流商
- **实时跟踪**: 包裹状态实时更新和推送
- **异常检测**: 智能识别配送异常和延误
- **客户通知**: 多渠道自动通知和状态同步
- **预测分析**: 送达时间预测和路径优化

### 3. 📧 AI邮件营销系统
- **智能内容生成**: 基于用户画像的个性化内容
- **A/B测试**: 完整的A/B测试流程和统计分析
- **受众分群**: 智能用户分群和精准投放
- **效果追踪**: 开信率、点击率、转化率全链路分析
- **自动化营销**: 基于用户行为的触发式营销

### 4. 📊 数据洞察平台
- **ChatBI**: 自然语言查询数据库
- **可视化报表**: ECharts驱动的交互式图表
- **业务指标**: 关键指标监控和趋势分析
- **自动报告**: 定时生成和分发业务报告
- **异常监控**: 智能异常检测和告警

### 5. 🔄 工作流自动化
- **可视化编排**: 拖拽式工作流设计器
- **条件分支**: 复杂业务逻辑的条件处理
- **错误处理**: 完整的异常处理和重试机制
- **执行监控**: 实时工作流执行状态监控
- **模板库**: 预置的行业工作流模板

### 6. 🧠 知识库系统
- **RAG检索**: 检索增强生成技术
- **向量数据库**: ChromaDB向量存储和检索
- **文档管理**: 多格式文档解析和索引
- **智能问答**: 基于知识库的智能问答
- **知识图谱**: 实体关系抽取和推理

### 7. 💾 记忆管理系统
- **短期记忆**: 会话级别的上下文记忆
- **长期记忆**: 持久化的用户偏好学习
- **情节记忆**: 重要事件和交互历史
- **语义记忆**: 结构化知识和概念理解
- **记忆压缩**: 智能遗忘和重要性评估

### 8. 🔌 第三方集成
- **电商平台**: AfterShip
- **支付网关**: Stripe、PayPal、支付宝等
- **通信服务**: SendGrid、Twilio、企业微信等
- **数据源**: MySQL、PostgreSQL、MongoDB等
- **监控服务**: Prometheus、Grafana、DataDog等

## 🚀 快速开始

### 📋 环境要求
- **Python 3.9+** - 后端开发语言
- **Node.js 18+** - 前端开发环境
- **Docker & Docker Compose** - 容器化部署
- **PostgreSQL 13+** - 主数据库
- **Redis 6+** - 缓存服务

### 🛠️ 安装步骤

#### 方式一：Docker快速部署（推荐）
```bash
# 1. 克隆项目
git clone https://github.com/0x1998s/SaasAgent.git
cd SaasAgent

# 2. 配置环境变量
cp env.example .env
# 编辑 .env 文件，配置必要的API密钥

# 3. 一键启动所有服务
docker-compose up -d

# 4. 访问应用
# 前端: http://localhost:3000
# 后端API: http://localhost:8000
# API文档: http://localhost:8000/docs
```

#### 方式二：本地开发部署
```bash
# 1. 克隆项目
git clone https://github.com/0x1998s/SaasAgent.git
cd SaasAgent

# 2. 后端设置
cd backend
pip install -r requirements.txt

# 配置环境变量
cp ../env.example .env
# 编辑 .env 文件

# 启动后端服务
uvicorn main:app --reload --port 8000

# 3. 前端设置（新终端）
cd ../frontend
npm install
npm start

# 4. 启动外部服务
# PostgreSQL, Redis, ChromaDB等
```

### 🔧 配置说明

#### 环境变量配置
```bash
# .env文件示例
# 数据库配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/saasagent
REDIS_URL=redis://localhost:6379/0

# AI模型配置
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# 向量数据库
CHROMA_HOST=localhost
CHROMA_PORT=8000

# 邮件服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# 物流API
AFTERSHIP_API_KEY=your_aftership_api_key
TRACKINGMORE_API_KEY=your_trackingmore_api_key

# 第三方集成
SHOPIFY_API_KEY=your_shopify_api_key
STRIPE_API_KEY=your_stripe_api_key
```

### 📖 使用示例

#### API调用示例
```bash
# 健康检查
curl http://localhost:8000/api/v1/health

# Agent状态查询
curl http://localhost:8000/api/v1/agents/list

# 物流跟踪
curl -X POST "http://localhost:8000/api/v1/logistics/track" \
     -H "Content-Type: application/json" \
     -d '{"tracking_number": "1Z999AA1234567890", "carrier": "ups"}'

# 邮件营销活动
curl -X POST "http://localhost:8000/api/v1/marketing/create-campaign" \
     -H "Content-Type: application/json" \
     -d '{"name": "春季促销", "type": "promotional", "audience": "high_value"}'
```

#### 前端功能演示
1. **Agent管理**: 创建、配置、监控AI Agent
2. **物流跟踪**: 实时包裹跟踪和异常处理
3. **邮件营销**: 创建营销活动和效果分析
4. **数据分析**: ChatBI对话式数据查询
5. **工作流管理**: 可视化工作流编排
6. **系统设置**: 集成配置和API管理

## 📊 项目完成度

### ✅ 已完成功能 (80%)
- [x] **项目基础架构** - Docker容器化部署
- [x] **AI Agent框架** - 完整的多Agent协同系统
- [x] **物流跟踪Agent** - 多承运商API集成
- [x] **邮件营销Agent** - AI内容生成和A/B测试
- [x] **前端管理界面** - React Dashboard和监控
- [x] **API接口** - RESTful API和文档
- [x] **数据分析** - 基础图表和ChatBI界面

### 🔄 部分完成功能 (60-80%)
- [ ] **知识库系统** - RAG检索和文档管理
- [ ] **记忆系统** - 多层次记忆管理
- [ ] **工作流自动化** - 高级工作流编排
- [ ] **第三方API集成** - 真实平台API对接

### ⏳ 待完成功能 (0-40%)
- [ ] **监控和部署** - Kubernetes和性能监控
- [ ] **测试覆盖** - 单元测试和集成测试
- [ ] **安全加固** - 完整的安全机制

### 技术特色说明
- **AI原生设计**: LangGraph + LangChain深度集成
- **生产级架构**: 企业级微服务设计模式
- **现代化前端**: React 18 + TypeScript最佳实践
- **容器化部署**: Docker + Docker Compose一键部署

## API文档

启动后端服务后，访问以下地址查看完整API文档：
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📞 联系方式

- **作者**: Jemmy
- **微信**: Joeng_Jimmy  
- **邮箱**: jemmy_yang@yeah.net
- **项目地址**: https://github.com/0x1998s/SaasAgent

---

## 📄 许可证

MIT License

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给个Star支持一下！或者给我发一份offer哈哈哈！**

**这不是一个完美的产品，但是一个技术展示和未来规划的demo！**

**🚀 SaasAgent - 让电商更智能**

</div>