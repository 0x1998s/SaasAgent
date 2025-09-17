"""
邮件营销Agent
AI驱动的个性化邮件内容生成和发送策略优化
"""

from typing import Any, Dict, List, Optional, Union
import asyncio
from datetime import datetime, timedelta
from enum import Enum
import json

from pydantic import BaseModel, Field, EmailStr
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
import httpx

from app.agents.base_agent import BaseAgent, AgentTask, AgentCapability
from app.core.config import settings
from app.utils.logger import logger


class CampaignType(str, Enum):
    """营销活动类型"""
    WELCOME = "welcome"
    PROMOTIONAL = "promotional"
    ABANDONED_CART = "abandoned_cart"
    PRODUCT_RECOMMENDATION = "product_recommendation"
    REACTIVATION = "reactivation"
    NEWSLETTER = "newsletter"
    TRANSACTIONAL = "transactional"


class EmailTemplate(BaseModel):
    """邮件模板模型"""
    template_id: str = Field(description="模板ID")
    name: str = Field(description="模板名称")
    campaign_type: CampaignType = Field(description="活动类型")
    subject_template: str = Field(description="主题模板")
    content_template: str = Field(description="内容模板")
    variables: List[str] = Field(default_factory=list, description="变量列表")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")


class EmailCampaign(BaseModel):
    """邮件活动模型"""
    campaign_id: str = Field(description="活动ID")
    name: str = Field(description="活动名称")
    campaign_type: CampaignType = Field(description="活动类型")
    target_audience: Dict[str, Any] = Field(description="目标受众")
    template_id: str = Field(description="使用的模板ID")
    schedule: Dict[str, Any] = Field(description="发送计划")
    personalization: Dict[str, Any] = Field(default_factory=dict, description="个性化设置")
    a_b_test: Optional[Dict[str, Any]] = Field(default=None, description="A/B测试配置")
    status: str = Field(default="draft", description="活动状态")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")


class EmailMetrics(BaseModel):
    """邮件指标模型"""
    campaign_id: str = Field(description="活动ID")
    sent_count: int = Field(default=0, description="发送数量")
    delivered_count: int = Field(default=0, description="送达数量")
    opened_count: int = Field(default=0, description="打开数量")
    clicked_count: int = Field(default=0, description="点击数量")
    unsubscribed_count: int = Field(default=0, description="取消订阅数量")
    bounced_count: int = Field(default=0, description="退信数量")
    open_rate: float = Field(default=0.0, description="打开率")
    click_rate: float = Field(default=0.0, description="点击率")
    conversion_rate: float = Field(default=0.0, description="转换率")
    updated_at: datetime = Field(default_factory=datetime.now, description="更新时间")


class EmailMarketingAgent(BaseAgent):
    """邮件营销Agent"""
    
    def __init__(self, agent_id: str, name: str, config: Optional[Dict[str, Any]] = None):
        super().__init__(
            agent_id=agent_id,
            name=name,
            capabilities=[
                AgentCapability.PLANNING,
                AgentCapability.TOOL_USE,
                AgentCapability.COMMUNICATION,
                AgentCapability.MEMORY
            ],
            config=config
        )
        
        self.llm = None
        self.templates = {}
        self.campaigns = {}
        self.metrics = {}
        
        # 预定义邮件模板
        self.default_templates = {
            "welcome": EmailTemplate(
                template_id="welcome_001",
                name="欢迎邮件模板",
                campaign_type=CampaignType.WELCOME,
                subject_template="欢迎加入 {brand_name}！",
                content_template="""
                亲爱的 {customer_name}，

                欢迎加入 {brand_name} 大家庭！我们很高兴您选择了我们。

                作为新用户，您可以享受：
                - 首次购买9折优惠
                - 免费配送服务
                - 专属客服支持

                立即开始购物：{shop_url}

                如有任何问题，请随时联系我们。

                祝好，
                {brand_name} 团队
                """,
                variables=["customer_name", "brand_name", "shop_url"]
            ),
            "abandoned_cart": EmailTemplate(
                template_id="cart_001",
                name="购物车提醒模板",
                campaign_type=CampaignType.ABANDONED_CART,
                subject_template="您的购物车还有商品等待结算",
                content_template="""
                亲爱的 {customer_name}，

                您在 {brand_name} 的购物车中还有以下商品：

                {cart_items}

                总价值：{cart_total}

                现在完成购买还可享受：
                - 限时优惠码：{discount_code}
                - 免费配送

                完成购买：{checkout_url}

                此优惠仅限24小时内有效。

                {brand_name} 团队
                """,
                variables=["customer_name", "brand_name", "cart_items", "cart_total", "discount_code", "checkout_url"]
            )
        }
    
    async def initialize(self) -> None:
        """初始化Agent"""
        self.logger.info("邮件营销Agent初始化中...")
        
        # 初始化LLM
        if settings.OPENAI_API_KEY:
            self.llm = ChatOpenAI(
                api_key=settings.OPENAI_API_KEY,
                model=settings.DEFAULT_LLM_MODEL,
                temperature=0.7
            )
            self.logger.info("OpenAI LLM已初始化")
        else:
            self.logger.warning("OpenAI API密钥未配置，将使用预设模板")
        
        # 加载默认模板
        for template_id, template in self.default_templates.items():
            self.templates[template_id] = template
        
        self.logger.info("邮件营销Agent初始化完成")
    
    async def process_task(self, task: AgentTask) -> Dict[str, Any]:
        """处理任务"""
        task_type = task.type
        payload = task.payload
        
        self.logger.info(f"处理邮件营销任务: {task_type}", task_id=task.id)
        
        if task_type == "create_campaign":
            return await self._create_campaign(payload)
        elif task_type == "generate_email_content":
            return await self._generate_email_content(payload)
        elif task_type == "send_campaign":
            return await self._send_campaign(payload)
        elif task_type == "analyze_performance":
            return await self._analyze_performance(payload)
        elif task_type == "optimize_campaign":
            return await self._optimize_campaign(payload)
        elif task_type == "segment_audience":
            return await self._segment_audience(payload)
        elif task_type == "ab_test":
            return await self._run_ab_test(payload)
        else:
            raise ValueError(f"不支持的任务类型: {task_type}")
    
    async def cleanup(self) -> None:
        """清理资源"""
        self.templates.clear()
        self.campaigns.clear()
        self.metrics.clear()
        self.logger.info("邮件营销Agent清理完成")
    
    async def _create_campaign(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """创建邮件活动"""
        campaign_name = payload.get("name")
        campaign_type = payload.get("type")
        target_audience = payload.get("target_audience", {})
        
        if not campaign_name or not campaign_type:
            raise ValueError("缺少活动名称或类型")
        
        campaign_id = f"campaign_{datetime.now().timestamp()}"
        
        # 选择合适的模板
        template_id = await self._select_template(campaign_type, payload.get("template_preferences"))
        
        # 创建活动
        campaign = EmailCampaign(
            campaign_id=campaign_id,
            name=campaign_name,
            campaign_type=CampaignType(campaign_type),
            target_audience=target_audience,
            template_id=template_id,
            schedule=payload.get("schedule", {}),
            personalization=payload.get("personalization", {}),
            a_b_test=payload.get("a_b_test")
        )
        
        self.campaigns[campaign_id] = campaign
        
        # 初始化指标
        self.metrics[campaign_id] = EmailMetrics(campaign_id=campaign_id)
        
        self.logger.info(f"邮件活动已创建: {campaign_name}", campaign_id=campaign_id)
        
        return {
            "campaign_id": campaign_id,
            "campaign": campaign.dict(),
            "template": self.templates[template_id].dict() if template_id in self.templates else None
        }
    
    async def _generate_email_content(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """生成邮件内容"""
        campaign_id = payload.get("campaign_id")
        customer_data = payload.get("customer_data", {})
        
        if not campaign_id:
            raise ValueError("缺少活动ID")
        
        if campaign_id not in self.campaigns:
            raise ValueError(f"活动不存在: {campaign_id}")
        
        campaign = self.campaigns[campaign_id]
        template = self.templates.get(campaign.template_id)
        
        if not template:
            raise ValueError(f"模板不存在: {campaign.template_id}")
        
        # 使用AI生成个性化内容
        if self.llm and campaign.personalization.get("use_ai", False):
            content = await self._generate_ai_content(campaign, template, customer_data)
        else:
            content = await self._generate_template_content(template, customer_data)
        
        return {
            "campaign_id": campaign_id,
            "subject": content["subject"],
            "content": content["content"],
            "personalized": campaign.personalization.get("use_ai", False),
            "customer_data": customer_data
        }
    
    async def _send_campaign(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """发送邮件活动"""
        campaign_id = payload.get("campaign_id")
        recipients = payload.get("recipients", [])
        
        if not campaign_id:
            raise ValueError("缺少活动ID")
        
        if campaign_id not in self.campaigns:
            raise ValueError(f"活动不存在: {campaign_id}")
        
        campaign = self.campaigns[campaign_id]
        
        # 批量发送邮件
        results = await self._batch_send_emails(campaign, recipients)
        
        # 更新指标
        metrics = self.metrics[campaign_id]
        metrics.sent_count += len(recipients)
        metrics.delivered_count += results["delivered"]
        metrics.bounced_count += results["bounced"]
        metrics.updated_at = datetime.now()
        
        # 更新活动状态
        campaign.status = "sent"
        
        self.logger.info(
            f"邮件活动发送完成",
            campaign_id=campaign_id,
            sent_count=len(recipients),
            delivered=results["delivered"],
            bounced=results["bounced"]
        )
        
        return {
            "campaign_id": campaign_id,
            "sent_count": len(recipients),
            "results": results,
            "metrics": metrics.dict()
        }
    
    async def _analyze_performance(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """分析活动表现"""
        campaign_id = payload.get("campaign_id")
        time_range = payload.get("time_range", 7)  # 天数
        
        if not campaign_id:
            raise ValueError("缺少活动ID")
        
        if campaign_id not in self.metrics:
            raise ValueError(f"活动指标不存在: {campaign_id}")
        
        metrics = self.metrics[campaign_id]
        
        # 计算关键指标
        if metrics.sent_count > 0:
            metrics.open_rate = metrics.opened_count / metrics.sent_count
            metrics.click_rate = metrics.clicked_count / metrics.sent_count
        
        # 生成分析报告
        analysis = await self._generate_performance_analysis(metrics, time_range)
        
        return {
            "campaign_id": campaign_id,
            "metrics": metrics.dict(),
            "analysis": analysis,
            "recommendations": await self._generate_recommendations(metrics)
        }
    
    async def _optimize_campaign(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """优化邮件活动"""
        campaign_id = payload.get("campaign_id")
        optimization_goals = payload.get("goals", ["open_rate", "click_rate"])
        
        if not campaign_id:
            raise ValueError("缺少活动ID")
        
        if campaign_id not in self.campaigns:
            raise ValueError(f"活动不存在: {campaign_id}")
        
        campaign = self.campaigns[campaign_id]
        metrics = self.metrics.get(campaign_id)
        
        # 基于历史数据和AI分析生成优化建议
        optimizations = await self._generate_optimizations(campaign, metrics, optimization_goals)
        
        return {
            "campaign_id": campaign_id,
            "current_performance": metrics.dict() if metrics else None,
            "optimizations": optimizations
        }
    
    async def _segment_audience(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """受众分群"""
        customers = payload.get("customers", [])
        segmentation_criteria = payload.get("criteria", {})
        
        if not customers:
            raise ValueError("缺少客户数据")
        
        # 基于不同标准进行分群
        segments = {
            "high_value": [],
            "new_customers": [],
            "inactive_customers": [],
            "frequent_buyers": [],
            "price_sensitive": []
        }
        
        for customer in customers:
            # 高价值客户
            if customer.get("lifetime_value", 0) > 1000:
                segments["high_value"].append(customer)
            
            # 新客户
            if customer.get("days_since_signup", 0) < 30:
                segments["new_customers"].append(customer)
            
            # 不活跃客户
            if customer.get("days_since_last_purchase", 0) > 90:
                segments["inactive_customers"].append(customer)
            
            # 频繁购买客户
            if customer.get("purchase_frequency", 0) > 5:
                segments["frequent_buyers"].append(customer)
            
            # 价格敏感客户
            if customer.get("avg_discount_used", 0) > 0.15:
                segments["price_sensitive"].append(customer)
        
        # 为每个分群推荐营销策略
        recommendations = {}
        for segment_name, segment_customers in segments.items():
            if segment_customers:
                recommendations[segment_name] = await self._recommend_strategy_for_segment(
                    segment_name, segment_customers
                )
        
        return {
            "segments": {k: len(v) for k, v in segments.items()},
            "segment_details": segments,
            "recommendations": recommendations
        }
    
    async def _run_ab_test(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """运行A/B测试"""
        campaign_id = payload.get("campaign_id")
        test_config = payload.get("test_config", {})
        
        if not campaign_id:
            raise ValueError("缺少活动ID")
        
        # 创建A/B测试变体
        variants = test_config.get("variants", [])
        if len(variants) < 2:
            raise ValueError("A/B测试需要至少2个变体")
        
        # 分配测试流量
        traffic_split = test_config.get("traffic_split", [0.5, 0.5])
        recipients = payload.get("recipients", [])
        
        # 随机分配受众
        import random
        random.shuffle(recipients)
        
        split_point = int(len(recipients) * traffic_split[0])
        group_a = recipients[:split_point]
        group_b = recipients[split_point:]
        
        # 发送测试邮件
        results_a = await self._send_test_variant(campaign_id, variants[0], group_a, "A")
        results_b = await self._send_test_variant(campaign_id, variants[1], group_b, "B")
        
        return {
            "campaign_id": campaign_id,
            "test_config": test_config,
            "group_a": {
                "size": len(group_a),
                "variant": variants[0],
                "results": results_a
            },
            "group_b": {
                "size": len(group_b),
                "variant": variants[1],
                "results": results_b
            }
        }
    
    async def _select_template(self, campaign_type: str, preferences: Optional[Dict[str, Any]]) -> str:
        """选择邮件模板"""
        # 根据活动类型选择合适的模板
        for template_id, template in self.templates.items():
            if template.campaign_type.value == campaign_type:
                return template_id
        
        # 如果没有找到匹配的模板，返回默认模板
        return list(self.templates.keys())[0] if self.templates else "default"
    
    async def _generate_ai_content(
        self,
        campaign: EmailCampaign,
        template: EmailTemplate,
        customer_data: Dict[str, Any]
    ) -> Dict[str, str]:
        """使用AI生成个性化内容"""
        if not self.llm:
            return await self._generate_template_content(template, customer_data)
        
        # 构建提示词
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=f"""
            你是一个专业的邮件营销专家。请根据以下信息生成个性化的邮件内容：
            
            活动类型：{campaign.campaign_type.value}
            客户信息：{json.dumps(customer_data, ensure_ascii=False)}
            
            要求：
            1. 内容要个性化且吸引人
            2. 语调要友好专业
            3. 包含明确的行动号召
            4. 适合中国用户的表达习惯
            """),
            HumanMessage(content=f"请基于模板生成邮件主题和内容：\n主题模板：{template.subject_template}\n内容模板：{template.content_template}")
        ])
        
        try:
            response = await self.llm.ainvoke(prompt.format_messages())
            content = response.content
            
            # 解析AI生成的内容
            lines = content.strip().split('\n')
            subject = lines[0].replace('主题：', '').strip()
            email_content = '\n'.join(lines[1:]).replace('内容：', '').strip()
            
            return {
                "subject": subject,
                "content": email_content
            }
            
        except Exception as e:
            self.logger.error(f"AI内容生成失败: {e}")
            return await self._generate_template_content(template, customer_data)
    
    async def _generate_template_content(
        self,
        template: EmailTemplate,
        customer_data: Dict[str, Any]
    ) -> Dict[str, str]:
        """基于模板生成内容"""
        # 填充模板变量
        subject = template.subject_template
        content = template.content_template
        
        for variable in template.variables:
            value = customer_data.get(variable, f"{{{variable}}}")
            subject = subject.replace(f"{{{variable}}}", str(value))
            content = content.replace(f"{{{variable}}}", str(value))
        
        return {
            "subject": subject,
            "content": content
        }
    
    async def _batch_send_emails(
        self,
        campaign: EmailCampaign,
        recipients: List[Dict[str, Any]]
    ) -> Dict[str, int]:
        """批量发送邮件"""
        delivered = 0
        bounced = 0
        
        # 模拟发送过程
        for recipient in recipients:
            try:
                # 生成个性化内容
                content = await self._generate_email_content({
                    "campaign_id": campaign.campaign_id,
                    "customer_data": recipient
                })
                
                # 模拟发送邮件
                success = await self._send_single_email(
                    recipient.get("email"),
                    content["subject"],
                    content["content"]
                )
                
                if success:
                    delivered += 1
                else:
                    bounced += 1
                    
            except Exception as e:
                self.logger.error(f"发送邮件失败: {e}", recipient_email=recipient.get("email"))
                bounced += 1
        
        return {
            "delivered": delivered,
            "bounced": bounced
        }
    
    async def _send_single_email(self, email: str, subject: str, content: str) -> bool:
        """发送单封邮件 (模拟实现)"""
        # 这里是模拟实现，实际需要集成邮件服务提供商API
        self.logger.info(f"发送邮件", email=email, subject=subject)
        
        # 模拟90%的成功率
        import random
        return random.random() > 0.1
    
    async def _generate_performance_analysis(
        self,
        metrics: EmailMetrics,
        time_range: int
    ) -> Dict[str, Any]:
        """生成性能分析"""
        analysis = {
            "overall_performance": "良好" if metrics.open_rate > 0.2 else "需要改进",
            "key_insights": [],
            "trends": {}
        }
        
        # 分析关键指标
        if metrics.open_rate > 0.25:
            analysis["key_insights"].append("打开率表现优秀")
        elif metrics.open_rate < 0.15:
            analysis["key_insights"].append("打开率偏低，建议优化主题行")
        
        if metrics.click_rate > 0.05:
            analysis["key_insights"].append("点击率表现良好")
        elif metrics.click_rate < 0.02:
            analysis["key_insights"].append("点击率偏低，建议优化邮件内容和CTA")
        
        return analysis
    
    async def _generate_recommendations(self, metrics: EmailMetrics) -> List[str]:
        """生成改进建议"""
        recommendations = []
        
        if metrics.open_rate < 0.2:
            recommendations.append("优化邮件主题行，增加个性化元素")
            recommendations.append("测试不同的发送时间")
        
        if metrics.click_rate < 0.03:
            recommendations.append("改进邮件内容布局和视觉设计")
            recommendations.append("使用更明确的行动号召按钮")
        
        if metrics.unsubscribed_count > metrics.sent_count * 0.01:
            recommendations.append("检查邮件频率，避免过度发送")
            recommendations.append("提供更多价值内容")
        
        return recommendations
    
    async def _generate_optimizations(
        self,
        campaign: EmailCampaign,
        metrics: Optional[EmailMetrics],
        goals: List[str]
    ) -> Dict[str, Any]:
        """生成优化建议"""
        optimizations = {
            "subject_line": [],
            "content": [],
            "timing": [],
            "targeting": []
        }
        
        # 基于目标生成优化建议
        if "open_rate" in goals:
            optimizations["subject_line"].extend([
                "使用更具吸引力的主题行",
                "添加紧迫感或稀缺性元素",
                "个性化主题行内容"
            ])
        
        if "click_rate" in goals:
            optimizations["content"].extend([
                "优化邮件布局和视觉层次",
                "使用更突出的CTA按钮",
                "添加社会证明元素"
            ])
        
        return optimizations
    
    async def _recommend_strategy_for_segment(
        self,
        segment_name: str,
        customers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """为分群推荐营销策略"""
        strategies = {
            "high_value": {
                "campaign_type": "exclusive_offers",
                "messaging": "VIP专享优惠和提前访问权",
                "frequency": "每月1-2次"
            },
            "new_customers": {
                "campaign_type": "welcome_series",
                "messaging": "产品介绍和使用指南",
                "frequency": "前30天内5-6封邮件"
            },
            "inactive_customers": {
                "campaign_type": "reactivation",
                "messaging": "特别优惠和新品推荐",
                "frequency": "每周1次，持续4周"
            },
            "frequent_buyers": {
                "campaign_type": "loyalty_program",
                "messaging": "积分奖励和会员专属活动",
                "frequency": "每月2-3次"
            },
            "price_sensitive": {
                "campaign_type": "promotional",
                "messaging": "折扣优惠和促销活动",
                "frequency": "每周1次"
            }
        }
        
        return strategies.get(segment_name, {
            "campaign_type": "general",
            "messaging": "通用营销内容",
            "frequency": "每月1次"
        })
    
    async def _send_test_variant(
        self,
        campaign_id: str,
        variant: Dict[str, Any],
        recipients: List[Dict[str, Any]],
        group_name: str
    ) -> Dict[str, Any]:
        """发送测试变体"""
        # 模拟发送测试邮件
        sent_count = len(recipients)
        
        # 模拟不同变体的表现差异
        base_open_rate = 0.2
        base_click_rate = 0.03
        
        # 变体A通常表现稍好
        if group_name == "A":
            open_rate = base_open_rate + 0.02
            click_rate = base_click_rate + 0.005
        else:
            open_rate = base_open_rate
            click_rate = base_click_rate
        
        opened = int(sent_count * open_rate)
        clicked = int(opened * (click_rate / open_rate))
        
        return {
            "sent": sent_count,
            "opened": opened,
            "clicked": clicked,
            "open_rate": open_rate,
            "click_rate": click_rate
        }
