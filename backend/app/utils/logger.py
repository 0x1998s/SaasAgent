"""
日志配置模块
使用structlog提供结构化日志
"""

import sys
import logging
from typing import Any, Dict
import structlog
from structlog.stdlib import LoggerFactory

from app.core.config import settings


def configure_logging():
    """配置日志系统"""
    
    # 配置标准库日志
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.LOG_LEVEL.upper())
    )
    
    # 配置structlog
    structlog.configure(
        processors=[
            # 添加时间戳
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            # 在开发环境使用彩色输出
            structlog.dev.ConsoleRenderer() if settings.DEBUG 
            else structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )


# 配置日志
configure_logging()

# 创建logger实例
logger = structlog.get_logger("saasagent")


class LoggerMixin:
    """日志混入类，为其他类提供日志功能"""
    
    @property
    def logger(self):
        """获取带有类名上下文的logger"""
        return logger.bind(class_name=self.__class__.__name__)


def log_function_call(func_name: str, args: Dict[str, Any] = None, 
                     result: Any = None, error: Exception = None):
    """记录函数调用日志"""
    log_data = {"function": func_name}
    
    if args:
        log_data["args"] = args
        
    if error:
        logger.error("函数调用失败", **log_data, error=str(error))
    else:
        if result is not None:
            log_data["result_type"] = type(result).__name__
        logger.info("函数调用成功", **log_data)


def log_agent_activity(agent_name: str, action: str, status: str, 
                      details: Dict[str, Any] = None):
    """记录Agent活动日志"""
    log_data = {
        "agent": agent_name,
        "action": action,
        "status": status
    }
    
    if details:
        log_data.update(details)
        
    if status == "success":
        logger.info("Agent活动完成", **log_data)
    elif status == "error":
        logger.error("Agent活动失败", **log_data)
    else:
        logger.info("Agent活动进行中", **log_data)


def log_api_request(method: str, path: str, status_code: int, 
                   duration: float, user_id: str = None):
    """记录API请求日志"""
    log_data = {
        "method": method,
        "path": path,
        "status_code": status_code,
        "duration_ms": round(duration * 1000, 2)
    }
    
    if user_id:
        log_data["user_id"] = user_id
        
    if status_code >= 400:
        logger.warning("API请求异常", **log_data)
    else:
        logger.info("API请求完成", **log_data)
