"""
Agent管理API
Agent的创建、监控和管理
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.agents.agent_orchestrator import orchestrator
from app.agents.base_agent import AgentCapability, AgentTask
from app.agents.logistics_agent import LogisticsAgent
from app.agents.email_marketing_agent import EmailMarketingAgent
from app.utils.logger import logger

router = APIRouter()


class CreateAgentRequest(BaseModel):
    """创建Agent请求"""
    agent_type: str = Field(description="Agent类型")
    name: str = Field(description="Agent名称")
    capabilities: List[str] = Field(default_factory=list, description="能力列表")
    config: Optional[Dict[str, Any]] = Field(default=None, description="配置参数")


class ExecuteTaskRequest(BaseModel):
    """执行任务请求"""
    task_type: str = Field(description="任务类型")
    payload: Dict[str, Any] = Field(description="任务数据")
    priority: int = Field(default=1, description="优先级")


# 注册Agent类型
@router.on_event("startup")
async def register_agent_types():
    """注册Agent类型"""
    orchestrator.register_agent_type("logistics", LogisticsAgent)
    orchestrator.register_agent_type("email_marketing", EmailMarketingAgent)
    logger.info("Agent类型注册完成")


@router.post("/create")
async def create_agent(request: CreateAgentRequest) -> Dict[str, Any]:
    """创建Agent"""
    try:
        # 转换能力枚举
        capabilities = []
        for cap_str in request.capabilities:
            try:
                capabilities.append(AgentCapability(cap_str))
            except ValueError:
                logger.warning(f"未知的Agent能力: {cap_str}")
        
        # 生成Agent ID
        agent_id = f"{request.agent_type}_{len(orchestrator.agents) + 1}"
        
        # 创建Agent
        agent = await orchestrator.create_agent(
            agent_id=agent_id,
            agent_type=request.agent_type,
            name=request.name,
            capabilities=capabilities,
            config=request.config
        )
        
        return {
            "success": True,
            "agent_id": agent_id,
            "message": f"Agent {request.name} 创建成功"
        }
        
    except Exception as e:
        logger.error(f"创建Agent失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
async def list_agents() -> Dict[str, Any]:
    """获取Agent列表"""
    try:
        summary = await orchestrator.get_agent_status_summary()
        return summary
    except Exception as e:
        logger.error(f"获取Agent列表失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{agent_id}/status")
async def get_agent_status(agent_id: str) -> Dict[str, Any]:
    """获取Agent状态"""
    try:
        agent = await orchestrator.get_agent(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent不存在: {agent_id}")
        
        status = await agent.get_status()
        return status
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取Agent状态失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{agent_id}/execute")
async def execute_agent_task(agent_id: str, request: ExecuteTaskRequest) -> Dict[str, Any]:
    """执行Agent任务"""
    try:
        agent = await orchestrator.get_agent(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent不存在: {agent_id}")
        
        # 创建任务
        task = AgentTask(
            id=f"{agent_id}_{request.task_type}_{len(agent.state.task_queue) + 1}",
            type=request.task_type,
            priority=request.priority,
            payload=request.payload
        )
        
        # 添加任务到队列
        await agent.add_task(task)
        
        return {
            "success": True,
            "task_id": task.id,
            "message": f"任务已添加到Agent {agent_id}的队列"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"执行Agent任务失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{agent_id}")
async def remove_agent(agent_id: str) -> Dict[str, Any]:
    """移除Agent"""
    try:
        agent = await orchestrator.get_agent(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent不存在: {agent_id}")
        
        await orchestrator.remove_agent(agent_id)
        
        return {
            "success": True,
            "message": f"Agent {agent_id} 已移除"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"移除Agent失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{agent_id}/memory")
async def get_agent_memory(
    agent_id: str,
    memory_type: str = Query(default="all", description="记忆类型")
) -> Dict[str, Any]:
    """获取Agent记忆"""
    try:
        agent = await orchestrator.get_agent(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent不存在: {agent_id}")
        
        memory = await agent.get_memory(memory_type)
        return memory
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取Agent记忆失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/types")
async def get_agent_types() -> Dict[str, Any]:
    """获取支持的Agent类型"""
    return {
        "agent_types": list(orchestrator.agent_types.keys()),
        "total_types": len(orchestrator.agent_types)
    }


@router.get("/capabilities")
async def get_agent_capabilities() -> Dict[str, Any]:
    """获取Agent能力列表"""
    capabilities = [cap.value for cap in AgentCapability]
    return {
        "capabilities": capabilities,
        "descriptions": {
            "perception": "感知能力 - 处理多模态输入",
            "planning": "规划能力 - 任务分解和调度",
            "tool_use": "工具使用 - 调用外部API和服务",
            "knowledge": "知识检索 - 访问知识库和文档",
            "memory": "记忆管理 - 存储和检索历史信息",
            "communication": "通信交流 - 与用户和其他Agent交互"
        }
    }
