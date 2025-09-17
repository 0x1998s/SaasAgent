"""
API路由注册
统一管理所有API端点
"""

from fastapi import APIRouter

from app.api.v1 import (
    agents,
    logistics,
    marketing,
    analytics,
    workflows,
    health
)

# 创建主路由
api_router = APIRouter()

# 注册v1版本的路由
api_router.include_router(
    health.router,
    prefix="/v1",
    tags=["健康检查"]
)

api_router.include_router(
    agents.router,
    prefix="/v1/agents",
    tags=["Agent管理"]
)

api_router.include_router(
    logistics.router,
    prefix="/v1/logistics",
    tags=["物流跟踪"]
)

api_router.include_router(
    marketing.router,
    prefix="/v1/marketing",
    tags=["邮件营销"]
)

api_router.include_router(
    analytics.router,
    prefix="/v1/analytics",
    tags=["数据分析"]
)

api_router.include_router(
    workflows.router,
    prefix="/v1/workflows",
    tags=["工作流管理"]
)
