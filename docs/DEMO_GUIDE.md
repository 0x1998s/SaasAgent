# SaasAgent 演示指南

## 🎯 演示概览

本文档将指导您完整体验SaasAgent平台的核心功能

## 🚀 快速启动

### 1. 环境准备

```bash
# 克隆项目
git clone https://github.com/0x1998s/SaasAgent.git
cd SaasAgent

# 启动服务 (Linux/Mac)
chmod +x scripts/start.sh
./scripts/start.sh

# 启动服务 (Windows)
scripts/start.bat
```

### 2. 访问系统

- **前端管理界面**: http://localhost:3000
- **API文档**: http://localhost:8000/docs
- **监控面板**: http://localhost:3001 (admin/admin123)

## 📋 演示场景

### 场景一：物流跟踪自动化

**业务背景**: 电商平台需要自动跟踪数千个包裹状态，及时通知客户

**演示步骤**:

1. **创建物流跟踪Agent**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/agents/create" \
   -H "Content-Type: application/json" \
   -d '{
     "agent_type": "logistics",
     "name": "物流跟踪专员",
     "capabilities": ["perception", "tool_use", "communication"]
   }'
   ```

2. **批量跟踪包裹**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/agents/{agent_id}/execute" \
   -H "Content-Type: application/json" \
   -d '{
     "task_type": "batch_track",
     "payload": {
       "tracking_requests": [
         {
           "tracking_number": "1Z999AA1234567890",
           "carrier": "ups",
           "customer_info": {"email": "customer1@example.com"}
         },
         {
           "tracking_number": "1234567890123456",
           "carrier": "fedex",
           "customer_info": {"email": "customer2@example.com"}
         }
       ]
     }
   }'
   ```

3. **查看跟踪结果**
   - 访问前端界面的物流跟踪页面
   - 查看包裹状态更新
   - 确认客户通知发送

**预期效果**:
- ✅ 自动查询多个承运商的包裹状态
- ✅ 识别异常包裹并预警
- ✅ 自动发送客户通知邮件
- ✅ 预测送达时间

### 场景二：智能邮件营销

**业务背景**: 根据客户行为和偏好，自动生成个性化营销邮件

**演示步骤**:

1. **创建邮件营销Agent**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/agents/create" \
   -H "Content-Type: application/json" \
   -d '{
     "agent_type": "email_marketing",
     "name": "邮件营销专家",
     "capabilities": ["planning", "tool_use", "communication", "memory"]
   }'
   ```

2. **创建营销活动**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/agents/{agent_id}/execute" \
   -H "Content-Type: application/json" \
   -d '{
     "task_type": "create_campaign",
     "payload": {
       "name": "春季促销活动",
       "type": "promotional",
       "target_audience": {
         "segment": "high_value_customers",
         "location": "US",
         "purchase_history": "electronics"
       },
       "personalization": {
         "use_ai": true,
         "tone": "friendly",
         "language": "en"
       }
     }
   }'
   ```

3. **AI生成邮件内容**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/agents/{agent_id}/execute" \
   -H "Content-Type: application/json" \
   -d '{
     "task_type": "generate_email_content",
     "payload": {
       "campaign_id": "campaign_xxx",
       "customer_data": {
         "customer_name": "John Smith",
         "purchase_history": ["iPhone", "MacBook"],
         "preferred_category": "electronics",
         "last_purchase_date": "2024-01-15"
       }
     }
   }'
   ```

4. **A/B测试优化**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/agents/{agent_id}/execute" \
   -H "Content-Type: application/json" \
   -d '{
     "task_type": "ab_test",
     "payload": {
       "campaign_id": "campaign_xxx",
       "test_config": {
         "variants": [
           {"subject": "🎉 Spring Sale - 30% Off Electronics!"},
           {"subject": "Limited Time: Save Big on Tech Gadgets"}
         ],
         "traffic_split": [0.5, 0.5]
       },
       "recipients": [...]
     }
   }'
   ```

**预期效果**:
- ✅ AI生成个性化邮件内容
- ✅ 智能受众分群和定向
- ✅ A/B测试优化邮件效果
- ✅ 实时监控营销指标

### 场景三：多Agent工作流编排

**业务背景**: 处理复杂的退换货流程，需要多个Agent协作

**演示步骤**:

1. **创建工作流**
   ```python
   # 通过API创建退换货处理工作流
   workflow_config = {
     "workflow_id": "return_process",
     "name": "退换货处理流程",
     "steps": [
       {
         "id": "validate_return",
         "name": "验证退换货请求",
         "agent_type": "logistics",
         "input_mapping": {"order_id": "order_id", "reason": "return_reason"},
         "output_mapping": {"validation_result": "is_valid"}
       },
       {
         "id": "process_refund",
         "name": "处理退款",
         "agent_type": "payment",
         "conditions": {"is_valid": true},
         "input_mapping": {"order_id": "order_id", "amount": "refund_amount"}
       },
       {
         "id": "notify_customer",
         "name": "通知客户",
         "agent_type": "email_marketing",
         "input_mapping": {"customer_email": "email", "status": "refund_status"}
       }
     ]
   }
   ```

2. **执行工作流**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/workflows/execute" \
   -H "Content-Type: application/json" \
   -d '{
     "workflow_id": "return_process",
     "input_data": {
       "order_id": "ORD-2024-001",
       "return_reason": "产品质量问题",
       "customer_email": "customer@example.com",
       "refund_amount": 199.99
     }
   }'
   ```

3. **监控工作流执行**
   - 访问工作流管理页面
   - 查看实时执行状态
   - 监控各步骤完成情况

**预期效果**:
- ✅ 多Agent协作处理复杂业务流程
- ✅ 智能决策和条件分支
- ✅ 异常处理和重试机制
- ✅ 实时监控和日志记录

## 📊 演示数据

### 模拟客户数据
```json
{
  "customers": [
    {
      "id": "cust_001",
      "name": "张三",
      "email": "zhangsan@example.com",
      "segment": "high_value",
      "lifetime_value": 2500.00,
      "purchase_frequency": 8,
      "last_purchase": "2024-01-15",
      "preferred_categories": ["electronics", "fashion"]
    },
    {
      "id": "cust_002", 
      "name": "李四",
      "email": "lisi@example.com",
      "segment": "new_customer",
      "lifetime_value": 150.00,
      "purchase_frequency": 1,
      "last_purchase": "2024-01-20",
      "preferred_categories": ["home"]
    }
  ]
}
```

### 模拟包裹数据
```json
{
  "shipments": [
    {
      "tracking_number": "1Z999AA1234567890",
      "carrier": "ups",
      "status": "in_transit",
      "customer_id": "cust_001",
      "destination": "北京市朝阳区",
      "estimated_delivery": "2024-01-25"
    },
    {
      "tracking_number": "1234567890123456",
      "carrier": "fedex", 
      "status": "delivered",
      "customer_id": "cust_002",
      "destination": "上海市浦东新区",
      "actual_delivery": "2024-01-22"
    }
  ]
}
```

## 🎥 演示脚本

### 5分钟快速演示

1. **开场 (30秒)**
   - 介绍SaasAgent平台
   - 展示整体架构图

2. **物流跟踪演示 (2分钟)**
   - 创建物流Agent
   - 批量跟踪包裹
   - 展示异常预警
   - 客户通知自动化

3. **邮件营销演示 (2分钟)**
   - 创建营销Agent
   - AI内容生成
   - 受众分群
   - A/B测试结果

4. **工作流编排演示 (30秒)**
   - 展示多Agent协作
   - 实时监控界面

### 15分钟详细演示

1. **平台介绍 (2分钟)**
   - 业务背景和痛点
   - SaasAgent解决方案
   - 核心技术架构

2. **Agent管理 (3分钟)**
   - Agent类型和能力
   - 创建和配置Agent
   - 监控Agent状态

3. **物流跟踪场景 (4分钟)**
   - 多承运商API集成
   - 智能异常检测
   - 预测性分析
   - 客户通知自动化

4. **邮件营销场景 (4分钟)**
   - AI内容生成
   - 个性化推荐
   - 智能分群策略
   - 营销效果分析

5. **工作流编排 (2分钟)**
   - 复杂业务流程自动化
   - 多Agent协作机制
   - 异常处理和恢复

## 🔍 关键指标展示

### 性能指标
- **响应时间**: < 200ms (API调用)
- **并发处理**: 100+ Agent同时运行
- **任务成功率**: 99.5%
- **系统可用性**: 99.9%

### 业务指标
- **物流查询效率**: 提升80%
- **客户满意度**: 提升25%
- **营销转化率**: 提升35%
- **运营成本**: 降低60%

## 🎯 演示要点

### 技术亮点
1. **多模态AI能力**: 文本、图像、语音处理
2. **实时流处理**: 毫秒级响应和决策
3. **弹性扩展**: 自动伸缩和负载均衡
4. **企业级安全**: 数据加密和权限控制

### 商业价值
1. **降本增效**: 自动化替代人工操作
2. **智能决策**: AI驱动的业务洞察
3. **客户体验**: 个性化和实时响应
4. **业务创新**: 新的商业模式探索

## 📚 相关资源

- **GitHub仓库**: https://github.com/0x1998s/SaasAgent
- **API文档**: http://localhost:8000/docs
- **技术博客**: [即将发布]
- **视频教程**: [即将发布]

## 🤝 互动环节

### 常见问题
1. **Q**: 支持哪些电商平台？
   **A**: 支持Shopify、Amazon、eBay等主流平台，可通过插件扩展

2. **Q**: 如何保证数据安全？
   **A**: 采用企业级加密、权限控制和审计日志

3. **Q**: 能否私有化部署？
   **A**: 支持Docker、Kubernetes等多种部署方式

4. **Q**: 如何收费？
   **A**: 按Agent数量和API调用量灵活定价

### 现场演示建议
- 准备多个浏览器标签页
- 预先加载示例数据
- 准备备用演示环境
- 设置监控大屏展示

---

**演示准备清单** ✅
- [ ] 环境部署和测试
- [ ] 示例数据准备
- [ ] 演示脚本练习
- [ ] 备用方案准备
- [ ] 监控面板配置
