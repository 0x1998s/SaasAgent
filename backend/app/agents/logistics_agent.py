"""
物流跟踪Agent
自动化包裹状态查询、异常预警和客户通知
"""

from typing import Any, Dict, List, Optional
import asyncio
from datetime import datetime, timedelta
from enum import Enum

from pydantic import BaseModel, Field
import httpx

from app.agents.base_agent import BaseAgent, AgentTask, AgentCapability
from app.core.config import settings
from app.utils.logger import logger


class ShipmentStatus(str, Enum):
    """包裹状态枚举"""
    PENDING = "pending"
    IN_TRANSIT = "in_transit"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    EXCEPTION = "exception"
    RETURNED = "returned"
    CANCELLED = "cancelled"


class TrackingInfo(BaseModel):
    """跟踪信息模型"""
    tracking_number: str = Field(description="跟踪号")
    carrier: str = Field(description="承运商")
    status: ShipmentStatus = Field(description="包裹状态")
    current_location: Optional[str] = Field(default=None, description="当前位置")
    estimated_delivery: Optional[datetime] = Field(default=None, description="预计送达时间")
    actual_delivery: Optional[datetime] = Field(default=None, description="实际送达时间")
    tracking_events: List[Dict[str, Any]] = Field(default_factory=list, description="跟踪事件")
    exception_info: Optional[str] = Field(default=None, description="异常信息")
    last_updated: datetime = Field(default_factory=datetime.now, description="最后更新时间")


class LogisticsAgent(BaseAgent):
    """物流跟踪Agent"""
    
    def __init__(self, agent_id: str, name: str, config: Optional[Dict[str, Any]] = None):
        super().__init__(
            agent_id=agent_id,
            name=name,
            capabilities=[
                AgentCapability.PERCEPTION,
                AgentCapability.TOOL_USE,
                AgentCapability.COMMUNICATION
            ],
            config=config
        )
        
        self.supported_carriers = {
            "aftership": self._track_aftership,
            "fedex": self._track_fedex,
            "ups": self._track_ups,
            "dhl": self._track_dhl,
            "usps": self._track_usps
        }
        
        self.tracking_cache = {}  # 跟踪信息缓存
    
    async def initialize(self) -> None:
        """初始化Agent"""
        self.logger.info("物流跟踪Agent初始化中...")
        
        # 验证API密钥配置
        api_keys = {
            "aftership": settings.AFTERSHIP_API_KEY,
            "fedex": settings.FEDEX_API_KEY,
            "ups": settings.UPS_API_KEY
        }
        
        for carrier, api_key in api_keys.items():
            if api_key:
                self.logger.info(f"{carrier} API已配置")
            else:
                self.logger.warning(f"{carrier} API未配置")
        
        self.logger.info("物流跟踪Agent初始化完成")
    
    async def process_task(self, task: AgentTask) -> Dict[str, Any]:
        """处理任务"""
        task_type = task.type
        payload = task.payload
        
        self.logger.info(f"处理物流任务: {task_type}", task_id=task.id)
        
        if task_type == "track_shipment":
            return await self._track_shipment(payload)
        elif task_type == "batch_track":
            return await self._batch_track(payload)
        elif task_type == "check_exceptions":
            return await self._check_exceptions(payload)
        elif task_type == "notify_customer":
            return await self._notify_customer(payload)
        elif task_type == "predict_delivery":
            return await self._predict_delivery(payload)
        else:
            raise ValueError(f"不支持的任务类型: {task_type}")
    
    async def cleanup(self) -> None:
        """清理资源"""
        self.tracking_cache.clear()
        self.logger.info("物流跟踪Agent清理完成")
    
    async def _track_shipment(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """跟踪单个包裹"""
        tracking_number = payload.get("tracking_number")
        carrier = payload.get("carrier", "aftership")
        force_refresh = payload.get("force_refresh", False)
        
        if not tracking_number:
            raise ValueError("缺少跟踪号")
        
        # 检查缓存
        cache_key = f"{carrier}_{tracking_number}"
        if not force_refresh and cache_key in self.tracking_cache:
            cached_info = self.tracking_cache[cache_key]
            if (datetime.now() - cached_info.last_updated).seconds < 300:  # 5分钟缓存
                self.logger.info(f"返回缓存的跟踪信息: {tracking_number}")
                return {"tracking_info": cached_info.dict(), "source": "cache"}
        
        # 调用对应承运商API
        if carrier not in self.supported_carriers:
            raise ValueError(f"不支持的承运商: {carrier}")
        
        tracking_func = self.supported_carriers[carrier]
        tracking_info = await tracking_func(tracking_number)
        
        # 更新缓存
        self.tracking_cache[cache_key] = tracking_info
        
        # 检查是否需要发送通知
        if tracking_info.status in [ShipmentStatus.DELIVERED, ShipmentStatus.EXCEPTION]:
            await self._auto_notify_customer(tracking_info, payload.get("customer_info"))
        
        return {
            "tracking_info": tracking_info.dict(),
            "source": "api",
            "carrier": carrier
        }
    
    async def _batch_track(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """批量跟踪包裹"""
        tracking_requests = payload.get("tracking_requests", [])
        
        if not tracking_requests:
            raise ValueError("缺少跟踪请求")
        
        results = []
        
        # 并发处理多个跟踪请求
        tasks = []
        for request in tracking_requests:
            task = self._track_shipment(request)
            tasks.append(task)
        
        # 等待所有任务完成
        tracking_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, result in enumerate(tracking_results):
            if isinstance(result, Exception):
                results.append({
                    "tracking_number": tracking_requests[i].get("tracking_number"),
                    "error": str(result),
                    "success": False
                })
            else:
                results.append({
                    **result,
                    "tracking_number": tracking_requests[i].get("tracking_number"),
                    "success": True
                })
        
        return {
            "results": results,
            "total_requests": len(tracking_requests),
            "successful_requests": sum(1 for r in results if r.get("success")),
            "failed_requests": sum(1 for r in results if not r.get("success"))
        }
    
    async def _check_exceptions(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """检查异常包裹"""
        time_range = payload.get("time_range", 24)  # 小时
        
        exceptions = []
        current_time = datetime.now()
        
        # 遍历缓存中的跟踪信息
        for cache_key, tracking_info in self.tracking_cache.items():
            # 检查是否在时间范围内
            if (current_time - tracking_info.last_updated).total_seconds() > time_range * 3600:
                continue
            
            # 检查异常状态
            if tracking_info.status == ShipmentStatus.EXCEPTION:
                exceptions.append({
                    "tracking_number": tracking_info.tracking_number,
                    "carrier": tracking_info.carrier,
                    "exception_info": tracking_info.exception_info,
                    "last_updated": tracking_info.last_updated.isoformat()
                })
            
            # 检查延误情况
            if (tracking_info.estimated_delivery and 
                current_time > tracking_info.estimated_delivery and
                tracking_info.status not in [ShipmentStatus.DELIVERED]):
                exceptions.append({
                    "tracking_number": tracking_info.tracking_number,
                    "carrier": tracking_info.carrier,
                    "exception_info": "包裹延误",
                    "estimated_delivery": tracking_info.estimated_delivery.isoformat(),
                    "delay_hours": (current_time - tracking_info.estimated_delivery).total_seconds() / 3600
                })
        
        return {
            "exceptions": exceptions,
            "total_exceptions": len(exceptions),
            "check_time": current_time.isoformat()
        }
    
    async def _notify_customer(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """通知客户"""
        tracking_number = payload.get("tracking_number")
        customer_email = payload.get("customer_email")
        notification_type = payload.get("notification_type", "status_update")
        
        if not tracking_number or not customer_email:
            raise ValueError("缺少跟踪号或客户邮箱")
        
        # 获取跟踪信息
        tracking_info = await self._get_tracking_info(tracking_number)
        
        # 生成通知内容
        notification_content = await self._generate_notification_content(
            tracking_info, notification_type
        )
        
        # 发送通知 (这里模拟发送，实际需要集成邮件服务)
        self.logger.info(
            f"发送客户通知",
            tracking_number=tracking_number,
            customer_email=customer_email,
            notification_type=notification_type
        )
        
        return {
            "notification_sent": True,
            "tracking_number": tracking_number,
            "customer_email": customer_email,
            "notification_type": notification_type,
            "content": notification_content,
            "sent_at": datetime.now().isoformat()
        }
    
    async def _predict_delivery(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """预测送达时间"""
        tracking_number = payload.get("tracking_number")
        
        if not tracking_number:
            raise ValueError("缺少跟踪号")
        
        # 获取跟踪信息
        tracking_info = await self._get_tracking_info(tracking_number)
        
        # 简单的预测逻辑 (实际应用中可以使用机器学习模型)
        prediction = await self._calculate_delivery_prediction(tracking_info)
        
        return {
            "tracking_number": tracking_number,
            "current_status": tracking_info.status.value,
            "predicted_delivery": prediction["estimated_delivery"],
            "confidence": prediction["confidence"],
            "factors": prediction["factors"]
        }
    
    async def _track_aftership(self, tracking_number: str) -> TrackingInfo:
        """使用AfterShip API跟踪包裹"""
        if not settings.AFTERSHIP_API_KEY:
            raise ValueError("AfterShip API密钥未配置")
        
        headers = {
            "aftership-api-key": settings.AFTERSHIP_API_KEY,
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.aftership.com/v4/trackings/{tracking_number}",
                headers=headers
            )
            
            if response.status_code != 200:
                raise Exception(f"AfterShip API错误: {response.status_code}")
            
            data = response.json()["data"]["tracking"]
            
            # 解析响应数据
            status_map = {
                "Pending": ShipmentStatus.PENDING,
                "InfoReceived": ShipmentStatus.PENDING,
                "InTransit": ShipmentStatus.IN_TRANSIT,
                "OutForDelivery": ShipmentStatus.OUT_FOR_DELIVERY,
                "Delivered": ShipmentStatus.DELIVERED,
                "Exception": ShipmentStatus.EXCEPTION,
                "AttemptFail": ShipmentStatus.EXCEPTION,
                "Expired": ShipmentStatus.EXCEPTION
            }
            
            return TrackingInfo(
                tracking_number=tracking_number,
                carrier=data.get("slug", "unknown"),
                status=status_map.get(data.get("tag"), ShipmentStatus.PENDING),
                current_location=data.get("origin_country_iso3"),
                estimated_delivery=self._parse_datetime(data.get("expected_delivery")),
                tracking_events=data.get("checkpoints", []),
                last_updated=datetime.now()
            )
    
    async def _track_fedex(self, tracking_number: str) -> TrackingInfo:
        """使用FedEx API跟踪包裹 (模拟实现)"""
        # 这里是模拟实现，实际需要集成FedEx API
        self.logger.info(f"模拟FedEx跟踪: {tracking_number}")
        
        return TrackingInfo(
            tracking_number=tracking_number,
            carrier="fedex",
            status=ShipmentStatus.IN_TRANSIT,
            current_location="Memphis, TN",
            estimated_delivery=datetime.now() + timedelta(days=2),
            tracking_events=[
                {
                    "status": "Picked up",
                    "location": "Origin facility",
                    "timestamp": (datetime.now() - timedelta(days=1)).isoformat()
                },
                {
                    "status": "In transit",
                    "location": "Memphis, TN",
                    "timestamp": datetime.now().isoformat()
                }
            ]
        )
    
    async def _track_ups(self, tracking_number: str) -> TrackingInfo:
        """使用UPS API跟踪包裹 (模拟实现)"""
        # 这里是模拟实现，实际需要集成UPS API
        self.logger.info(f"模拟UPS跟踪: {tracking_number}")
        
        return TrackingInfo(
            tracking_number=tracking_number,
            carrier="ups",
            status=ShipmentStatus.OUT_FOR_DELIVERY,
            current_location="Local facility",
            estimated_delivery=datetime.now() + timedelta(hours=8),
            tracking_events=[
                {
                    "status": "Out for delivery",
                    "location": "Local facility",
                    "timestamp": datetime.now().isoformat()
                }
            ]
        )
    
    async def _track_dhl(self, tracking_number: str) -> TrackingInfo:
        """使用DHL API跟踪包裹 (模拟实现)"""
        self.logger.info(f"模拟DHL跟踪: {tracking_number}")
        
        return TrackingInfo(
            tracking_number=tracking_number,
            carrier="dhl",
            status=ShipmentStatus.DELIVERED,
            current_location="Destination",
            actual_delivery=datetime.now() - timedelta(hours=2),
            tracking_events=[
                {
                    "status": "Delivered",
                    "location": "Front door",
                    "timestamp": (datetime.now() - timedelta(hours=2)).isoformat()
                }
            ]
        )
    
    async def _track_usps(self, tracking_number: str) -> TrackingInfo:
        """使用USPS API跟踪包裹 (模拟实现)"""
        self.logger.info(f"模拟USPS跟踪: {tracking_number}")
        
        return TrackingInfo(
            tracking_number=tracking_number,
            carrier="usps",
            status=ShipmentStatus.EXCEPTION,
            current_location="Distribution center",
            exception_info="Address needs to be corrected",
            tracking_events=[
                {
                    "status": "Exception",
                    "location": "Distribution center",
                    "timestamp": datetime.now().isoformat(),
                    "description": "Address needs to be corrected"
                }
            ]
        )
    
    async def _get_tracking_info(self, tracking_number: str) -> TrackingInfo:
        """获取跟踪信息"""
        # 首先尝试从缓存获取
        for cache_key, tracking_info in self.tracking_cache.items():
            if tracking_info.tracking_number == tracking_number:
                return tracking_info
        
        # 如果缓存中没有，尝试跟踪
        result = await self._track_shipment({"tracking_number": tracking_number})
        return TrackingInfo(**result["tracking_info"])
    
    async def _auto_notify_customer(self, tracking_info: TrackingInfo, customer_info: Optional[Dict[str, Any]]):
        """自动通知客户"""
        if not customer_info or not customer_info.get("email"):
            return
        
        notification_type = "delivery" if tracking_info.status == ShipmentStatus.DELIVERED else "exception"
        
        await self._notify_customer({
            "tracking_number": tracking_info.tracking_number,
            "customer_email": customer_info["email"],
            "notification_type": notification_type
        })
    
    async def _generate_notification_content(self, tracking_info: TrackingInfo, notification_type: str) -> str:
        """生成通知内容"""
        if notification_type == "delivery":
            return f"您的包裹 {tracking_info.tracking_number} 已成功送达！"
        elif notification_type == "exception":
            return f"您的包裹 {tracking_info.tracking_number} 出现异常：{tracking_info.exception_info}"
        elif notification_type == "status_update":
            return f"您的包裹 {tracking_info.tracking_number} 状态更新：{tracking_info.status.value}"
        else:
            return f"您的包裹 {tracking_info.tracking_number} 有新的更新"
    
    async def _calculate_delivery_prediction(self, tracking_info: TrackingInfo) -> Dict[str, Any]:
        """计算送达预测"""
        # 简单的预测逻辑
        base_time = datetime.now()
        
        if tracking_info.status == ShipmentStatus.DELIVERED:
            return {
                "estimated_delivery": tracking_info.actual_delivery.isoformat(),
                "confidence": 1.0,
                "factors": ["已送达"]
            }
        elif tracking_info.status == ShipmentStatus.OUT_FOR_DELIVERY:
            estimated = base_time + timedelta(hours=8)
            return {
                "estimated_delivery": estimated.isoformat(),
                "confidence": 0.9,
                "factors": ["正在派送中", "预计当日送达"]
            }
        elif tracking_info.status == ShipmentStatus.IN_TRANSIT:
            estimated = base_time + timedelta(days=2)
            return {
                "estimated_delivery": estimated.isoformat(),
                "confidence": 0.7,
                "factors": ["运输中", "基于历史数据预测"]
            }
        else:
            estimated = base_time + timedelta(days=5)
            return {
                "estimated_delivery": estimated.isoformat(),
                "confidence": 0.5,
                "factors": ["状态不明确", "保守估计"]
            }
    
    def _parse_datetime(self, date_str: Optional[str]) -> Optional[datetime]:
        """解析日期时间字符串"""
        if not date_str:
            return None
        
        try:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
            return None
