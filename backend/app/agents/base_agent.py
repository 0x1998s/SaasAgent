"""
基础Agent类
定义所有Agent的通用接口和基础功能
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Union
from datetime import datetime
import asyncio
from enum import Enum

from pydantic import BaseModel, Field
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.runnables import Runnable

from app.utils.logger import logger, LoggerMixin


class AgentStatus(str, Enum):
    """Agent状态枚举"""
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"


class AgentCapability(str, Enum):
    """Agent能力枚举"""
    PERCEPTION = "perception"  # 感知能力
    PLANNING = "planning"      # 规划能力
    TOOL_USE = "tool_use"     # 工具使用
    KNOWLEDGE = "knowledge"    # 知识检索
    MEMORY = "memory"         # 记忆管理
    COMMUNICATION = "communication"  # 通信交流


class AgentTask(BaseModel):
    """Agent任务模型"""
    id: str = Field(description="任务ID")
    type: str = Field(description="任务类型")
    priority: int = Field(default=1, description="优先级(1-10)")
    payload: Dict[str, Any] = Field(default_factory=dict, description="任务数据")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    deadline: Optional[datetime] = Field(default=None, description="截止时间")
    dependencies: List[str] = Field(default_factory=list, description="依赖任务ID")
    status: AgentStatus = Field(default=AgentStatus.IDLE, description="任务状态")
    result: Optional[Dict[str, Any]] = Field(default=None, description="任务结果")
    error: Optional[str] = Field(default=None, description="错误信息")


class AgentMemory(BaseModel):
    """Agent记忆模型"""
    short_term: List[BaseMessage] = Field(default_factory=list, description="短期记忆")
    long_term: Dict[str, Any] = Field(default_factory=dict, description="长期记忆")
    episodic: List[Dict[str, Any]] = Field(default_factory=list, description="情节记忆")
    semantic: Dict[str, Any] = Field(default_factory=dict, description="语义记忆")


class AgentState(BaseModel):
    """Agent状态模型"""
    agent_id: str = Field(description="Agent ID")
    name: str = Field(description="Agent名称")
    status: AgentStatus = Field(default=AgentStatus.IDLE, description="当前状态")
    capabilities: List[AgentCapability] = Field(default_factory=list, description="能力列表")
    current_task: Optional[AgentTask] = Field(default=None, description="当前任务")
    task_queue: List[AgentTask] = Field(default_factory=list, description="任务队列")
    memory: AgentMemory = Field(default_factory=AgentMemory, description="记忆系统")
    context: Dict[str, Any] = Field(default_factory=dict, description="上下文数据")
    metrics: Dict[str, Any] = Field(default_factory=dict, description="性能指标")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    last_active: datetime = Field(default_factory=datetime.now, description="最后活跃时间")


class BaseAgent(ABC, LoggerMixin):
    """基础Agent抽象类"""
    
    def __init__(
        self,
        agent_id: str,
        name: str,
        capabilities: List[AgentCapability],
        config: Optional[Dict[str, Any]] = None
    ):
        self.state = AgentState(
            agent_id=agent_id,
            name=name,
            capabilities=capabilities
        )
        self.config = config or {}
        self._runnable: Optional[Runnable] = None
        self._is_running = False
        
        # 初始化性能指标
        self.state.metrics = {
            "tasks_completed": 0,
            "tasks_failed": 0,
            "total_execution_time": 0.0,
            "average_execution_time": 0.0,
            "success_rate": 0.0
        }
        
        self.logger.info(f"Agent {name} 已初始化", agent_id=agent_id, capabilities=capabilities)
    
    @property
    def agent_id(self) -> str:
        """获取Agent ID"""
        return self.state.agent_id
    
    @property
    def name(self) -> str:
        """获取Agent名称"""
        return self.state.name
    
    @property
    def status(self) -> AgentStatus:
        """获取Agent状态"""
        return self.state.status
    
    @property
    def is_running(self) -> bool:
        """检查Agent是否正在运行"""
        return self._is_running
    
    @abstractmethod
    async def initialize(self) -> None:
        """初始化Agent - 子类必须实现"""
        pass
    
    @abstractmethod
    async def process_task(self, task: AgentTask) -> Dict[str, Any]:
        """处理任务 - 子类必须实现"""
        pass
    
    @abstractmethod
    async def cleanup(self) -> None:
        """清理资源 - 子类必须实现"""
        pass
    
    async def start(self) -> None:
        """启动Agent"""
        if self._is_running:
            self.logger.warning("Agent已在运行中", agent_id=self.agent_id)
            return
            
        try:
            await self.initialize()
            self._is_running = True
            self.state.status = AgentStatus.RUNNING
            self.state.last_active = datetime.now()
            
            self.logger.info("Agent启动成功", agent_id=self.agent_id)
            
            # 开始处理任务队列
            asyncio.create_task(self._process_task_queue())
            
        except Exception as e:
            self.state.status = AgentStatus.FAILED
            self.logger.error(f"Agent启动失败: {e}", agent_id=self.agent_id, exc_info=True)
            raise
    
    async def stop(self) -> None:
        """停止Agent"""
        if not self._is_running:
            self.logger.warning("Agent未在运行", agent_id=self.agent_id)
            return
            
        try:
            self._is_running = False
            self.state.status = AgentStatus.IDLE
            await self.cleanup()
            
            self.logger.info("Agent停止成功", agent_id=self.agent_id)
            
        except Exception as e:
            self.state.status = AgentStatus.FAILED
            self.logger.error(f"Agent停止失败: {e}", agent_id=self.agent_id, exc_info=True)
            raise
    
    async def add_task(self, task: AgentTask) -> None:
        """添加任务到队列"""
        self.state.task_queue.append(task)
        self.state.task_queue.sort(key=lambda t: t.priority, reverse=True)
        
        self.logger.info(
            "任务已添加到队列",
            agent_id=self.agent_id,
            task_id=task.id,
            task_type=task.type,
            priority=task.priority,
            queue_size=len(self.state.task_queue)
        )
    
    async def _process_task_queue(self) -> None:
        """处理任务队列"""
        while self._is_running:
            if not self.state.task_queue:
                await asyncio.sleep(1)  # 等待新任务
                continue
                
            # 获取下一个任务
            task = self.state.task_queue.pop(0)
            self.state.current_task = task
            task.status = AgentStatus.RUNNING
            
            start_time = datetime.now()
            
            try:
                self.logger.info(
                    "开始处理任务",
                    agent_id=self.agent_id,
                    task_id=task.id,
                    task_type=task.type
                )
                
                # 处理任务
                result = await self.process_task(task)
                
                # 更新任务状态
                task.status = AgentStatus.COMPLETED
                task.result = result
                
                # 更新性能指标
                execution_time = (datetime.now() - start_time).total_seconds()
                self._update_metrics(True, execution_time)
                
                self.logger.info(
                    "任务处理完成",
                    agent_id=self.agent_id,
                    task_id=task.id,
                    execution_time=execution_time
                )
                
            except Exception as e:
                # 任务失败
                task.status = AgentStatus.FAILED
                task.error = str(e)
                
                execution_time = (datetime.now() - start_time).total_seconds()
                self._update_metrics(False, execution_time)
                
                self.logger.error(
                    "任务处理失败",
                    agent_id=self.agent_id,
                    task_id=task.id,
                    error=str(e),
                    exc_info=True
                )
            
            finally:
                self.state.current_task = None
                self.state.last_active = datetime.now()
    
    def _update_metrics(self, success: bool, execution_time: float) -> None:
        """更新性能指标"""
        metrics = self.state.metrics
        
        if success:
            metrics["tasks_completed"] += 1
        else:
            metrics["tasks_failed"] += 1
        
        metrics["total_execution_time"] += execution_time
        
        total_tasks = metrics["tasks_completed"] + metrics["tasks_failed"]
        if total_tasks > 0:
            metrics["average_execution_time"] = metrics["total_execution_time"] / total_tasks
            metrics["success_rate"] = metrics["tasks_completed"] / total_tasks
    
    async def get_status(self) -> Dict[str, Any]:
        """获取Agent详细状态"""
        return {
            "agent_id": self.state.agent_id,
            "name": self.state.name,
            "status": self.state.status.value,
            "capabilities": [cap.value for cap in self.state.capabilities],
            "is_running": self._is_running,
            "current_task": self.state.current_task.dict() if self.state.current_task else None,
            "queue_size": len(self.state.task_queue),
            "metrics": self.state.metrics,
            "created_at": self.state.created_at.isoformat(),
            "last_active": self.state.last_active.isoformat()
        }
    
    async def update_memory(
        self,
        short_term: Optional[List[BaseMessage]] = None,
        long_term: Optional[Dict[str, Any]] = None,
        episodic: Optional[Dict[str, Any]] = None,
        semantic: Optional[Dict[str, Any]] = None
    ) -> None:
        """更新记忆"""
        if short_term is not None:
            self.state.memory.short_term.extend(short_term)
            # 保持短期记忆在合理大小
            if len(self.state.memory.short_term) > 100:
                self.state.memory.short_term = self.state.memory.short_term[-50:]
        
        if long_term is not None:
            self.state.memory.long_term.update(long_term)
        
        if episodic is not None:
            self.state.memory.episodic.append({
                "timestamp": datetime.now().isoformat(),
                **episodic
            })
        
        if semantic is not None:
            self.state.memory.semantic.update(semantic)
    
    async def get_memory(self, memory_type: str = "all") -> Dict[str, Any]:
        """获取记忆内容"""
        memory = self.state.memory
        
        if memory_type == "short_term":
            return {"short_term": [msg.dict() for msg in memory.short_term]}
        elif memory_type == "long_term":
            return {"long_term": memory.long_term}
        elif memory_type == "episodic":
            return {"episodic": memory.episodic}
        elif memory_type == "semantic":
            return {"semantic": memory.semantic}
        else:
            return {
                "short_term": [msg.dict() for msg in memory.short_term],
                "long_term": memory.long_term,
                "episodic": memory.episodic,
                "semantic": memory.semantic
            }
    
    def has_capability(self, capability: AgentCapability) -> bool:
        """检查是否具有特定能力"""
        return capability in self.state.capabilities
    
    async def execute(self, input_data: Union[str, Dict[str, Any]]) -> Dict[str, Any]:
        """执行Agent - 简化的接口"""
        # 创建临时任务
        task = AgentTask(
            id=f"exec_{datetime.now().timestamp()}",
            type="execute",
            payload={"input": input_data}
        )
        
        return await self.process_task(task)
