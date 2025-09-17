"""
数据库连接和管理
支持PostgreSQL、Redis、MongoDB、ChromaDB
"""

from typing import Optional, AsyncGenerator
import asyncio
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker
)
from sqlalchemy.orm import DeclarativeBase
import redis.asyncio as redis
from motor.motor_asyncio import AsyncIOMotorClient
import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.config import settings, DatabaseConfig
from app.utils.logger import logger


class Base(DeclarativeBase):
    """SQLAlchemy基础模型类"""
    pass


class DatabaseManager:
    """数据库连接管理器"""
    
    def __init__(self):
        self.postgres_engine = None
        self.postgres_session_maker = None
        self.redis_client = None
        self.mongodb_client = None
        self.mongodb_db = None
        self.chroma_client = None
        
    async def init_postgres(self):
        """初始化PostgreSQL连接"""
        try:
            self.postgres_engine = create_async_engine(
                DatabaseConfig.get_postgres_url(),
                echo=settings.DEBUG,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True,
                pool_recycle=3600
            )
            
            self.postgres_session_maker = async_sessionmaker(
                self.postgres_engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            # 测试连接
            async with self.postgres_engine.begin() as conn:
                await conn.run_sync(lambda _: None)
                
            logger.info("✅ PostgreSQL连接已建立")
            
        except Exception as e:
            logger.error(f"❌ PostgreSQL连接失败: {e}")
            raise
    
    async def init_redis(self):
        """初始化Redis连接"""
        try:
            self.redis_client = redis.from_url(
                DatabaseConfig.get_redis_url(),
                encoding="utf-8",
                decode_responses=True,
                max_connections=20
            )
            
            # 测试连接
            await self.redis_client.ping()
            logger.info("✅ Redis连接已建立")
            
        except Exception as e:
            logger.error(f"❌ Redis连接失败: {e}")
            raise
    
    async def init_mongodb(self):
        """初始化MongoDB连接"""
        try:
            self.mongodb_client = AsyncIOMotorClient(
                DatabaseConfig.get_mongodb_url(),
                maxPoolSize=10,
                minPoolSize=1,
                maxIdleTimeMS=30000
            )
            
            # 获取数据库
            db_name = DatabaseConfig.get_mongodb_url().split("/")[-1]
            self.mongodb_db = self.mongodb_client[db_name]
            
            # 测试连接
            await self.mongodb_client.admin.command('ping')
            logger.info("✅ MongoDB连接已建立")
            
        except Exception as e:
            logger.error(f"❌ MongoDB连接失败: {e}")
            raise
    
    def init_chromadb(self):
        """初始化ChromaDB连接"""
        try:
            self.chroma_client = chromadb.HttpClient(
                host=DatabaseConfig.get_chromadb_url().replace("http://", "").split(":")[0],
                port=int(DatabaseConfig.get_chromadb_url().split(":")[-1]),
                settings=ChromaSettings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # 测试连接
            self.chroma_client.heartbeat()
            logger.info("✅ ChromaDB连接已建立")
            
        except Exception as e:
            logger.error(f"❌ ChromaDB连接失败: {e}")
            raise
    
    async def close_all(self):
        """关闭所有数据库连接"""
        tasks = []
        
        if self.postgres_engine:
            tasks.append(self.postgres_engine.dispose())
            
        if self.redis_client:
            tasks.append(self.redis_client.close())
            
        if self.mongodb_client:
            self.mongodb_client.close()
            
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
            
        logger.info("✅ 所有数据库连接已关闭")


# 全局数据库管理器实例
db_manager = DatabaseManager()


async def init_db():
    """初始化所有数据库连接"""
    try:
        await db_manager.init_postgres()
        await db_manager.init_redis()
        await db_manager.init_mongodb()
        db_manager.init_chromadb()
        logger.info("🎉 所有数据库连接初始化完成")
        
    except Exception as e:
        logger.error(f"💥 数据库初始化失败: {e}")
        raise


async def close_db():
    """关闭所有数据库连接"""
    await db_manager.close_all()


# PostgreSQL会话依赖
@asynccontextmanager
async def get_postgres_session() -> AsyncGenerator[AsyncSession, None]:
    """获取PostgreSQL会话"""
    if not db_manager.postgres_session_maker:
        raise RuntimeError("PostgreSQL未初始化")
        
    async with db_manager.postgres_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Redis客户端依赖
def get_redis_client() -> redis.Redis:
    """获取Redis客户端"""
    if not db_manager.redis_client:
        raise RuntimeError("Redis未初始化")
    return db_manager.redis_client


# MongoDB数据库依赖
def get_mongodb() -> AsyncIOMotorClient:
    """获取MongoDB数据库"""
    if not db_manager.mongodb_db:
        raise RuntimeError("MongoDB未初始化")
    return db_manager.mongodb_db


# ChromaDB客户端依赖
def get_chromadb() -> chromadb.HttpClient:
    """获取ChromaDB客户端"""
    if not db_manager.chroma_client:
        raise RuntimeError("ChromaDB未初始化")
    return db_manager.chroma_client


# 数据库健康检查
async def check_database_health() -> dict:
    """检查所有数据库连接状态"""
    health_status = {
        "postgres": False,
        "redis": False,
        "mongodb": False,
        "chromadb": False
    }
    
    # 检查PostgreSQL
    try:
        if db_manager.postgres_engine:
            async with db_manager.postgres_engine.begin() as conn:
                await conn.run_sync(lambda _: None)
            health_status["postgres"] = True
    except Exception as e:
        logger.warning(f"PostgreSQL健康检查失败: {e}")
    
    # 检查Redis
    try:
        if db_manager.redis_client:
            await db_manager.redis_client.ping()
            health_status["redis"] = True
    except Exception as e:
        logger.warning(f"Redis健康检查失败: {e}")
    
    # 检查MongoDB
    try:
        if db_manager.mongodb_client:
            await db_manager.mongodb_client.admin.command('ping')
            health_status["mongodb"] = True
    except Exception as e:
        logger.warning(f"MongoDB健康检查失败: {e}")
    
    # 检查ChromaDB
    try:
        if db_manager.chroma_client:
            db_manager.chroma_client.heartbeat()
            health_status["chromadb"] = True
    except Exception as e:
        logger.warning(f"ChromaDB健康检查失败: {e}")
    
    return health_status
