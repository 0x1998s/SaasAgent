"""
Agent编排器
基于LangGraph实现的多Agent协调和工作流编排
"""

from typing import Any, Dict, List, Optional, Callable, Type
import asyncio
from datetime import datetime
from enum import Enum

from langgraph.graph import StateGraph, END
from langgraph.graph.state import CompiledStateGraph
from pydantic import BaseModel, Field

from app.agents.base_agent import BaseAgent, AgentTask, AgentStatus, AgentCapability
from app.utils.logger import logger, LoggerMixin


class WorkflowStatus(str, Enum):
    """工作流状态枚举"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class WorkflowStep(BaseModel):
    """工作流步骤模型"""
    id: str = Field(description="步骤ID")
    name: str = Field(description="步骤名称")
    agent_type: str = Field(description="Agent类型")
    input_mapping: Dict[str, str] = Field(default_factory=dict, description="输入映射")
    output_mapping: Dict[str, str] = Field(default_factory=dict, description="输出映射")
    conditions: Dict[str, Any] = Field(default_factory=dict, description="执行条件")
    retry_count: int = Field(default=0, description="重试次数")
    max_retries: int = Field(default=3, description="最大重试次数")
    timeout_seconds: int = Field(default=300, description="超时时间")


class WorkflowState(BaseModel):
    """工作流状态模型"""
    workflow_id: str = Field(description="工作流ID")
    name: str = Field(description="工作流名称")
    status: WorkflowStatus = Field(default=WorkflowStatus.PENDING, description="状态")
    current_step: Optional[str] = Field(default=None, description="当前步骤")
    completed_steps: List[str] = Field(default_factory=list, description="已完成步骤")
    failed_steps: List[str] = Field(default_factory=list, description="失败步骤")
    context: Dict[str, Any] = Field(default_factory=dict, description="上下文数据")
    results: Dict[str, Any] = Field(default_factory=dict, description="步骤结果")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    started_at: Optional[datetime] = Field(default=None, description="开始时间")
    completed_at: Optional[datetime] = Field(default=None, description="完成时间")
    error: Optional[str] = Field(default=None, description="错误信息")


class AgentOrchestrator(LoggerMixin):
    """Agent编排器"""
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.agent_types: Dict[str, Type[BaseAgent]] = {}
        self.workflows: Dict[str, CompiledStateGraph] = {}
        self.workflow_states: Dict[str, WorkflowState] = {}
        self.running_workflows: Dict[str, asyncio.Task] = {}
        
        self.logger.info("Agent编排器已初始化")
    
    def register_agent_type(self, agent_type: str, agent_class: Type[BaseAgent]) -> None:
        """注册Agent类型"""
        self.agent_types[agent_type] = agent_class
        self.logger.info(f"Agent类型已注册: {agent_type}")
    
    async def create_agent(
        self,
        agent_id: str,
        agent_type: str,
        name: str,
        capabilities: List[AgentCapability],
        config: Optional[Dict[str, Any]] = None
    ) -> BaseAgent:
        """创建Agent实例"""
        if agent_type not in self.agent_types:
            raise ValueError(f"未知的Agent类型: {agent_type}")
        
        if agent_id in self.agents:
            raise ValueError(f"Agent ID已存在: {agent_id}")
        
        agent_class = self.agent_types[agent_type]
        agent = agent_class(
            agent_id=agent_id,
            name=name,
            capabilities=capabilities,
            config=config
        )
        
        self.agents[agent_id] = agent
        await agent.start()
        
        self.logger.info(
            f"Agent已创建并启动",
            agent_id=agent_id,
            agent_type=agent_type,
            name=name
        )
        
        return agent
    
    async def get_agent(self, agent_id: str) -> Optional[BaseAgent]:
        """获取Agent实例"""
        return self.agents.get(agent_id)
    
    async def remove_agent(self, agent_id: str) -> None:
        """移除Agent实例"""
        if agent_id not in self.agents:
            self.logger.warning(f"Agent不存在: {agent_id}")
            return
        
        agent = self.agents[agent_id]
        await agent.stop()
        del self.agents[agent_id]
        
        self.logger.info(f"Agent已移除: {agent_id}")
    
    def create_workflow(
        self,
        workflow_id: str,
        name: str,
        steps: List[WorkflowStep],
        connections: Dict[str, List[str]]
    ) -> None:
        """创建工作流"""
        if workflow_id in self.workflows:
            raise ValueError(f"工作流ID已存在: {workflow_id}")
        
        # 创建LangGraph状态图
        graph = StateGraph(WorkflowState)
        
        # 添加节点(步骤)
        for step in steps:
            graph.add_node(step.id, self._create_step_function(step))
        
        # 添加边(连接)
        for from_step, to_steps in connections.items():
            if not to_steps:  # 结束节点
                graph.add_edge(from_step, END)
            else:
                for to_step in to_steps:
                    graph.add_edge(from_step, to_step)
        
        # 设置入口点
        if steps:
            graph.set_entry_point(steps[0].id)
        
        # 编译图
        compiled_graph = graph.compile()
        self.workflows[workflow_id] = compiled_graph
        
        # 初始化工作流状态
        self.workflow_states[workflow_id] = WorkflowState(
            workflow_id=workflow_id,
            name=name
        )
        
        self.logger.info(
            f"工作流已创建",
            workflow_id=workflow_id,
            name=name,
            steps_count=len(steps)
        )
    
    def _create_step_function(self, step: WorkflowStep) -> Callable:
        """创建步骤执行函数"""
        async def step_function(state: WorkflowState) -> WorkflowState:
            """执行工作流步骤"""
            try:
                self.logger.info(
                    f"开始执行步骤",
                    workflow_id=state.workflow_id,
                    step_id=step.id,
                    step_name=step.name
                )
                
                state.current_step = step.id
                
                # 检查执行条件
                if not self._check_conditions(step.conditions, state.context):
                    self.logger.info(
                        f"步骤条件不满足，跳过执行",
                        workflow_id=state.workflow_id,
                        step_id=step.id
                    )
                    state.completed_steps.append(step.id)
                    return state
                
                # 准备输入数据
                input_data = self._prepare_input(step.input_mapping, state.context)
                
                # 查找或创建Agent
                agent = await self._get_or_create_agent(step.agent_type, step.id)
                
                # 创建任务
                task = AgentTask(
                    id=f"{state.workflow_id}_{step.id}",
                    type=step.name,
                    payload=input_data
                )
                
                # 执行任务
                result = await agent.process_task(task)
                
                # 处理输出
                output_data = self._process_output(step.output_mapping, result)
                state.context.update(output_data)
                state.results[step.id] = result
                state.completed_steps.append(step.id)
                
                self.logger.info(
                    f"步骤执行完成",
                    workflow_id=state.workflow_id,
                    step_id=step.id,
                    execution_time=result.get("execution_time", 0)
                )
                
            except Exception as e:
                self.logger.error(
                    f"步骤执行失败",
                    workflow_id=state.workflow_id,
                    step_id=step.id,
                    error=str(e),
                    exc_info=True
                )
                
                step.retry_count += 1
                
                if step.retry_count <= step.max_retries:
                    self.logger.info(
                        f"重试步骤执行",
                        workflow_id=state.workflow_id,
                        step_id=step.id,
                        retry_count=step.retry_count
                    )
                    return await step_function(state)
                else:
                    state.failed_steps.append(step.id)
                    state.status = WorkflowStatus.FAILED
                    state.error = str(e)
            
            return state
        
        return step_function
    
    def _check_conditions(self, conditions: Dict[str, Any], context: Dict[str, Any]) -> bool:
        """检查执行条件"""
        if not conditions:
            return True
        
        for key, expected_value in conditions.items():
            if key not in context or context[key] != expected_value:
                return False
        
        return True
    
    def _prepare_input(self, input_mapping: Dict[str, str], context: Dict[str, Any]) -> Dict[str, Any]:
        """准备输入数据"""
        input_data = {}
        
        for output_key, context_key in input_mapping.items():
            if context_key in context:
                input_data[output_key] = context[context_key]
        
        return input_data
    
    def _process_output(self, output_mapping: Dict[str, str], result: Dict[str, Any]) -> Dict[str, Any]:
        """处理输出数据"""
        output_data = {}
        
        for result_key, context_key in output_mapping.items():
            if result_key in result:
                output_data[context_key] = result[result_key]
        
        return output_data
    
    async def _get_or_create_agent(self, agent_type: str, step_id: str) -> BaseAgent:
        """获取或创建Agent"""
        agent_id = f"{agent_type}_{step_id}"
        
        if agent_id in self.agents:
            return self.agents[agent_id]
        
        # 创建新Agent
        return await self.create_agent(
            agent_id=agent_id,
            agent_type=agent_type,
            name=f"{agent_type} for {step_id}",
            capabilities=[],  # 从Agent类型推断
            config={}
        )
    
    async def execute_workflow(
        self,
        workflow_id: str,
        input_data: Dict[str, Any]
    ) -> WorkflowState:
        """执行工作流"""
        if workflow_id not in self.workflows:
            raise ValueError(f"工作流不存在: {workflow_id}")
        
        if workflow_id in self.running_workflows:
            raise ValueError(f"工作流正在运行: {workflow_id}")
        
        workflow = self.workflows[workflow_id]
        state = self.workflow_states[workflow_id]
        
        # 重置状态
        state.status = WorkflowStatus.RUNNING
        state.started_at = datetime.now()
        state.context = input_data.copy()
        state.results = {}
        state.completed_steps = []
        state.failed_steps = []
        state.error = None
        
        self.logger.info(
            f"开始执行工作流",
            workflow_id=workflow_id,
            name=state.name
        )
        
        try:
            # 创建执行任务
            task = asyncio.create_task(self._run_workflow(workflow, state))
            self.running_workflows[workflow_id] = task
            
            # 等待完成
            final_state = await task
            
            final_state.status = WorkflowStatus.COMPLETED
            final_state.completed_at = datetime.now()
            
            self.logger.info(
                f"工作流执行完成",
                workflow_id=workflow_id,
                execution_time=(final_state.completed_at - final_state.started_at).total_seconds()
            )
            
        except Exception as e:
            state.status = WorkflowStatus.FAILED
            state.error = str(e)
            state.completed_at = datetime.now()
            
            self.logger.error(
                f"工作流执行失败",
                workflow_id=workflow_id,
                error=str(e),
                exc_info=True
            )
            
        finally:
            if workflow_id in self.running_workflows:
                del self.running_workflows[workflow_id]
        
        return state
    
    async def _run_workflow(
        self,
        workflow: CompiledStateGraph,
        state: WorkflowState
    ) -> WorkflowState:
        """运行工作流"""
        # 使用LangGraph执行工作流
        result = await workflow.ainvoke(state)
        return result
    
    async def get_workflow_status(self, workflow_id: str) -> Optional[WorkflowState]:
        """获取工作流状态"""
        return self.workflow_states.get(workflow_id)
    
    async def cancel_workflow(self, workflow_id: str) -> None:
        """取消工作流执行"""
        if workflow_id not in self.running_workflows:
            self.logger.warning(f"工作流未在运行: {workflow_id}")
            return
        
        task = self.running_workflows[workflow_id]
        task.cancel()
        
        state = self.workflow_states[workflow_id]
        state.status = WorkflowStatus.CANCELLED
        state.completed_at = datetime.now()
        
        self.logger.info(f"工作流已取消: {workflow_id}")
    
    async def get_agent_status_summary(self) -> Dict[str, Any]:
        """获取所有Agent状态摘要"""
        summary = {
            "total_agents": len(self.agents),
            "running_agents": 0,
            "idle_agents": 0,
            "failed_agents": 0,
            "agent_details": []
        }
        
        for agent in self.agents.values():
            status = await agent.get_status()
            summary["agent_details"].append(status)
            
            if status["status"] == "running":
                summary["running_agents"] += 1
            elif status["status"] == "idle":
                summary["idle_agents"] += 1
            elif status["status"] == "failed":
                summary["failed_agents"] += 1
        
        return summary
    
    async def get_workflow_summary(self) -> Dict[str, Any]:
        """获取工作流状态摘要"""
        summary = {
            "total_workflows": len(self.workflows),
            "running_workflows": len(self.running_workflows),
            "workflow_details": []
        }
        
        for workflow_id, state in self.workflow_states.items():
            summary["workflow_details"].append({
                "workflow_id": workflow_id,
                "name": state.name,
                "status": state.status.value,
                "current_step": state.current_step,
                "completed_steps": len(state.completed_steps),
                "failed_steps": len(state.failed_steps),
                "created_at": state.created_at.isoformat(),
                "started_at": state.started_at.isoformat() if state.started_at else None,
                "completed_at": state.completed_at.isoformat() if state.completed_at else None
            })
        
        return summary
    
    async def shutdown(self) -> None:
        """关闭编排器"""
        self.logger.info("开始关闭Agent编排器")
        
        # 取消所有运行中的工作流
        for workflow_id in list(self.running_workflows.keys()):
            await self.cancel_workflow(workflow_id)
        
        # 停止所有Agent
        for agent_id in list(self.agents.keys()):
            await self.remove_agent(agent_id)
        
        self.logger.info("Agent编排器已关闭")


# 全局编排器实例
orchestrator = AgentOrchestrator()
