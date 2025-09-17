"""
应用配置管理
使用Pydantic Settings管理环境变量和配置
"""

from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用设置类"""
    
    # 基础配置
    ENVIRONMENT: str = Field(default="development", description="运行环境")
    DEBUG: bool = Field(default=True, description="调试模式")
    SECRET_KEY: str = Field(default="your-secret-key", description="应用密钥")
    
    # 服务器配置
    HOST: str = Field(default="0.0.0.0", description="服务器地址")
    PORT: int = Field(default=8000, description="服务器端口")
    
    # 数据库配置
    DATABASE_URL: str = Field(
        default="postgresql://saasagent:saasagent123@localhost:5432/saasagent",
        description="PostgreSQL数据库连接URL"
    )
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis连接URL"
    )
    MONGODB_URL: str = Field(
        default="mongodb://saasagent:saasagent123@localhost:27017/saasagent",
        description="MongoDB连接URL"
    )
    CHROMADB_URL: str = Field(
        default="http://localhost:8001",
        description="ChromaDB向量数据库URL"
    )
    
    # AI模型配置
    OPENAI_API_KEY: Optional[str] = Field(default=None, description="OpenAI API密钥")
    OPENAI_API_BASE: str = Field(
        default="https://api.openai.com/v1",
        description="OpenAI API基础URL"
    )
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, description="Anthropic API密钥")
    OLLAMA_BASE_URL: str = Field(
        default="http://localhost:11434",
        description="Ollama本地模型服务URL"
    )
    
    # 默认模型配置
    DEFAULT_LLM_MODEL: str = Field(default="gpt-4-turbo-preview", description="默认LLM模型")
    DEFAULT_EMBEDDING_MODEL: str = Field(
        default="text-embedding-ada-002",
        description="默认嵌入模型"
    )
    
    # 第三方服务API密钥
    AFTERSHIP_API_KEY: Optional[str] = Field(default=None, description="AfterShip API密钥")
    SHIPSTATION_API_KEY: Optional[str] = Field(default=None, description="ShipStation API密钥")
    FEDEX_API_KEY: Optional[str] = Field(default=None, description="FedEx API密钥")
    UPS_API_KEY: Optional[str] = Field(default=None, description="UPS API密钥")
    
    # 电商平台API
    SHOPIFY_API_KEY: Optional[str] = Field(default=None, description="Shopify API密钥")
    SHOPIFY_SECRET_KEY: Optional[str] = Field(default=None, description="Shopify Secret密钥")
    EBAY_API_KEY: Optional[str] = Field(default=None, description="eBay API密钥")
    AMAZON_API_KEY: Optional[str] = Field(default=None, description="Amazon API密钥")
    
    # 邮件服务配置
    SMTP_HOST: str = Field(default="smtp.gmail.com", description="SMTP服务器地址")
    SMTP_PORT: int = Field(default=587, description="SMTP端口")
    SMTP_USERNAME: Optional[str] = Field(default=None, description="SMTP用户名")
    SMTP_PASSWORD: Optional[str] = Field(default=None, description="SMTP密码")
    SENDGRID_API_KEY: Optional[str] = Field(default=None, description="SendGrid API密钥")
    
    # 支付网关
    STRIPE_API_KEY: Optional[str] = Field(default=None, description="Stripe API密钥")
    PAYPAL_CLIENT_ID: Optional[str] = Field(default=None, description="PayPal客户端ID")
    PAYPAL_CLIENT_SECRET: Optional[str] = Field(default=None, description="PayPal客户端密钥")
    
    # 云服务配置
    GCP_PROJECT_ID: Optional[str] = Field(default=None, description="GCP项目ID")
    GCP_CREDENTIALS_PATH: Optional[str] = Field(default=None, description="GCP凭证文件路径")
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None, description="AWS访问密钥ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None, description="AWS秘密访问密钥")
    AWS_REGION: str = Field(default="us-west-2", description="AWS区域")
    AWS_S3_BUCKET: Optional[str] = Field(default=None, description="AWS S3存储桶")
    
    # 监控和日志
    SENTRY_DSN: Optional[str] = Field(default=None, description="Sentry DSN")
    LOG_LEVEL: str = Field(default="INFO", description="日志级别")
    PROMETHEUS_ENABLED: bool = Field(default=True, description="启用Prometheus监控")
    
    # 安全配置
    JWT_SECRET_KEY: str = Field(default="your-jwt-secret", description="JWT密钥")
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT算法")
    JWT_EXPIRATION_HOURS: int = Field(default=24, description="JWT过期时间(小时)")
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "https://localhost:3000"],
        description="允许的CORS源"
    )
    
    # 缓存配置
    CACHE_TTL: int = Field(default=3600, description="缓存TTL(秒)")
    CACHE_MAX_SIZE: int = Field(default=1000, description="缓存最大大小")
    
    # Agent配置
    MAX_CONCURRENT_AGENTS: int = Field(default=10, description="最大并发Agent数")
    AGENT_TIMEOUT_SECONDS: int = Field(default=300, description="Agent超时时间(秒)")
    MEMORY_RETENTION_DAYS: int = Field(default=30, description="记忆保留天数")
    
    # 速率限制
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = Field(
        default=100,
        description="每分钟请求限制"
    )
    RATE_LIMIT_BURST: int = Field(default=20, description="突发请求限制")
    
    # Vector数据库配置
    VECTOR_DIMENSION: int = Field(default=1536, description="向量维度")
    SIMILARITY_THRESHOLD: float = Field(default=0.7, description="相似度阈值")
    
    # 文件上传配置
    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024, description="最大文件大小(字节)")
    ALLOWED_FILE_TYPES: List[str] = Field(
        default=["pdf", "docx", "txt", "csv", "xlsx"],
        description="允许的文件类型"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# 创建全局设置实例
settings = Settings()


# 数据库配置类
class DatabaseConfig:
    """数据库连接配置"""
    
    @staticmethod
    def get_postgres_url() -> str:
        """获取PostgreSQL连接URL"""
        return settings.DATABASE_URL
    
    @staticmethod
    def get_redis_url() -> str:
        """获取Redis连接URL"""
        return settings.REDIS_URL
    
    @staticmethod
    def get_mongodb_url() -> str:
        """获取MongoDB连接URL"""
        return settings.MONGODB_URL
    
    @staticmethod
    def get_chromadb_url() -> str:
        """获取ChromaDB连接URL"""
        return settings.CHROMADB_URL


# AI模型配置类
class AIConfig:
    """AI模型配置"""
    
    @staticmethod
    def get_openai_config() -> dict:
        """获取OpenAI配置"""
        return {
            "api_key": settings.OPENAI_API_KEY,
            "api_base": settings.OPENAI_API_BASE,
            "model": settings.DEFAULT_LLM_MODEL,
            "embedding_model": settings.DEFAULT_EMBEDDING_MODEL
        }
    
    @staticmethod
    def get_anthropic_config() -> dict:
        """获取Anthropic配置"""
        return {
            "api_key": settings.ANTHROPIC_API_KEY,
            "model": "claude-3-sonnet-20240229"
        }
    
    @staticmethod
    def get_ollama_config() -> dict:
        """获取Ollama配置"""
        return {
            "base_url": settings.OLLAMA_BASE_URL,
            "model": "llama2:7b"
        }
