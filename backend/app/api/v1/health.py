"""
健康检查API
系统状态监控和诊断
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from app.core.database import check_database_health
from app.agents.agent_orchestrator import orchestrator
from app.utils.logger import logger

router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """基础健康检查"""
    return {
        "status": "healthy",
        "service": "SaasAgent API",
        "version": "1.0.0"
    }


@router.get("/health/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """详细健康检查"""
    try:
        # 检查数据库连接
        db_health = await check_database_health()
        
        # 检查Agent状态
        agent_summary = await orchestrator.get_agent_status_summary()
        
        # 检查工作流状态
        workflow_summary = await orchestrator.get_workflow_summary()
        
        overall_status = "healthy"
        if not all(db_health.values()):
            overall_status = "degraded"
        
        return {
            "status": overall_status,
            "timestamp": "2024-01-01T00:00:00Z",
            "databases": db_health,
            "agents": {
                "total": agent_summary["total_agents"],
                "running": agent_summary["running_agents"],
                "failed": agent_summary["failed_agents"]
            },
            "workflows": {
                "total": workflow_summary["total_workflows"],
                "running": workflow_summary["running_workflows"]
            }
        }
        
    except Exception as e:
        logger.error(f"健康检查失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="健康检查失败")


@router.get("/health/databases")
async def database_health() -> Dict[str, Any]:
    """数据库健康检查"""
    try:
        db_health = await check_database_health()
        return {
            "status": "healthy" if all(db_health.values()) else "degraded",
            "databases": db_health
        }
    except Exception as e:
        logger.error(f"数据库健康检查失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="数据库健康检查失败")
