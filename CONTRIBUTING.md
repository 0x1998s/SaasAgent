# 🤝 贡献指南

感谢您对 SaasAgent 项目的兴趣！

## 📋 贡献类型

- 🐛 **Bug修复**
- ✨ **新功能开发**
- 📚 **文档改进**
- 🧪 **测试用例**
- 🎨 **UI/UX改进**
- 🔧 **性能优化**

## 🚀 快速开始

### 1. Fork 项目

点击右上角的 "Fork" 按钮，将项目复制到您的GitHub账户。

### 2. 克隆到本地

```bash
git clone https://github.com/YOUR_USERNAME/SaasAgent.git
cd SaasAgent
```

### 3. 创建功能分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b bugfix/your-bugfix-name
```

### 4. 设置开发环境

```bash
# 后端环境
cd backend
pip install -r requirements.txt
cp ../env.example .env  # 配置环境变量

# 前端环境
cd ../frontend
npm install
```

## 📝 开发规范

### 代码风格

#### Python (后端)
- 使用 **PEP 8** 代码风格
- 使用 **Black** 进行代码格式化
- 使用 **isort** 进行导入排序
- 使用 **mypy** 进行类型检查

```bash
# 安装开发工具
pip install black isort mypy flake8

# 格式化代码
black backend/
isort backend/
```

#### TypeScript/React (前端)
- 使用 **Prettier** 进行代码格式化
- 使用 **ESLint** 进行代码检查
- 遵循 **React Hooks** 最佳实践

```bash
# 格式化代码
npm run format
npm run lint
```

### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型 (type):**
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例:**
```
feat(agents): 添加新的数据分析Agent

- 实现ChatBI查询功能
- 添加数据可视化支持
- 更新API接口

Closes #123
```

## 🧪 测试

### 后端测试

```bash
cd backend
pytest tests/ -v --cov=.
```

### 前端测试

```bash
cd frontend
npm test
```

### 集成测试

```bash
docker-compose -f docker-compose.test.yml up --build
```

## 📚 文档

### API文档
- 使用 **FastAPI** 自动生成 OpenAPI 文档
- 访问 `http://localhost:8000/docs`

### 代码文档
- Python: 使用 **Google风格** 的docstring
- TypeScript: 使用 **JSDoc** 注释

**Python示例:**
```python
async def track_shipment(
    self, 
    tracking_number: str, 
    carrier: str = "auto"
) -> Dict[str, Any]:
    """跟踪包裹物流信息.
    
    Args:
        tracking_number: 包裹跟踪号
        carrier: 承运商代码，默认自动识别
        
    Returns:
        包含跟踪信息的字典
        
    Raises:
        ValueError: 当跟踪号格式不正确时
    """
```

**TypeScript示例:**
```typescript
/**
 * 创建邮件营销活动
 * @param campaignData 活动数据
 * @returns 创建的活动信息
 */
async function createCampaign(campaignData: CampaignData): Promise<Campaign> {
    // 实现代码
}
```

## 🔍 代码审查

### Pull Request 流程

1. **创建PR**: 从您的功能分支创建PR到 `main` 分支
2. **填写模板**: 使用PR模板描述您的更改
3. **等待审查**: 维护者会审查您的代码
4. **处理反馈**: 根据反馈修改代码
5. **合并**: 审查通过后合并到主分支

### PR检查清单

- [ ] 代码遵循项目风格指南
- [ ] 添加了必要的测试
- [ ] 所有测试都通过
- [ ] 更新了相关文档
- [ ] 提交信息符合规范
- [ ] 没有合并冲突

## 🐛 Bug报告

使用 [Bug报告模板](.github/ISSUE_TEMPLATE/bug_report.md) 创建Issue，包含：

- 详细的问题描述
- 复现步骤
- 期望行为
- 环境信息
- 错误日志

## ✨ 功能请求

使用 [功能请求模板](.github/ISSUE_TEMPLATE/feature_request.md) 创建Issue，包含：

- 功能描述
- 使用场景
- 实现建议
- 优先级

## 🏗️ 架构指南

### Agent开发规范

1. **继承BaseAgent**: 所有Agent必须继承`BaseAgent`基类
2. **实现核心方法**: 必须实现`execute_task`方法
3. **能力声明**: 明确声明Agent的能力类型
4. **错误处理**: 完善的异常处理机制

```python
from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.base_agent import AgentCapability

class CustomAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="custom_agent",
            name="自定义Agent",
            capabilities=[
                AgentCapability.PERCEPTION,
                AgentCapability.TOOL_USE
            ]
        )
    
    async def execute_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行具体任务逻辑"""
        try:
            # 任务执行逻辑
            result = await self._process_task(task_data)
            return {"success": True, "result": result}
        except Exception as e:
            self.logger.error(f"任务执行失败: {e}")
            return {"success": False, "error": str(e)}
```

### 前端组件规范

1. **TypeScript**: 所有组件必须使用TypeScript
2. **Props接口**: 定义清晰的Props接口
3. **错误边界**: 重要组件添加错误边界
4. **可访问性**: 遵循WCAG可访问性标准

```typescript
interface CustomComponentProps {
  data: DataType[];
  onAction: (action: ActionType) => void;
  loading?: boolean;
}

const CustomComponent: React.FC<CustomComponentProps> = ({
  data,
  onAction,
  loading = false
}) => {
  // 组件实现
};
```

## 🏷️ 发布流程

### 版本号规范

使用 [语义化版本](https://semver.org/lang/zh-CN/)：`MAJOR.MINOR.PATCH`

- **MAJOR**: 不兼容的API更改
- **MINOR**: 向后兼容的功能添加
- **PATCH**: 向后兼容的Bug修复

### 发布步骤

1. 更新版本号
2. 更新CHANGELOG.md
3. 创建Release标签
4. 发布到GitHub Releases

## 🔒 安全指南

### 敏感信息处理
- 不要在代码中硬编码API密钥
- 使用环境变量管理敏感配置
- 定期更换开发和测试密钥

### 依赖安全
- 定期更新依赖包版本
- 使用安全扫描工具检查漏洞
- 审查第三方依赖的安全性

## 📞 获取帮助

如果您有任何问题：

1. 查看 [文档](./docs/)
2. 搜索现有 [Issues](https://github.com/0x1998s/SaasAgent/issues)
3. 创建新的Issue
4. 联系维护者:
   - 微信: Joeng_Jimmy
   - 邮箱: jemmy_yang@yeah.net

## 🎯 开发路线图

### 短期目标 (1-3个月)
- [ ] 完善知识库系统RAG实现
- [ ] 增强记忆系统功能
- [ ] 添加更多第三方API集成
- [ ] 提升测试覆盖率

### 中期目标 (3-6个月)
- [ ] Kubernetes部署支持
- [ ] 性能监控和优化
- [ ] 多租户支持
- [ ] 插件系统扩展

### 长期目标 (6-12个月)
- [ ] 边缘AI部署支持
- [ ] 多模态Agent能力
- [ ] 自动化MLOps流程
- [ ] 商业化SaaS服务

## 🙏 致谢



特别感谢：
- [LangChain](https://github.com/langchain-ai/langchain) - AI应用开发框架
- [FastAPI](https://github.com/tiangolo/fastapi) - 现代Python Web框架
- [Ant Design](https://github.com/ant-design/ant-design) - 企业级UI设计语言

---

<div align="center">

**🚀 让我们一起构建更智能的电商AI平台！**

</div>
