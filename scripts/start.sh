#!/bin/bash

# SaasAgent启动脚本
# 用于快速启动开发环境

echo "🚀 启动SaasAgent开发环境..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 检查.env文件
if [ ! -f ".env" ]; then
    echo "📝 创建.env配置文件..."
    cp env.example .env
    echo "⚠️  请编辑.env文件，填入必要的API密钥和配置"
    echo "📖 参考文档: https://github.com/0x1998s/SaasAgent#配置说明"
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/mongodb
mkdir -p data/redis
mkdir -p data/chromadb

# 设置权限
chmod +x scripts/*.sh

# 启动服务
echo "🔧 启动Docker服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动完成..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 检查API健康状态
echo "🩺 检查API健康状态..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ 后端API服务正常"
else
    echo "⚠️  后端API服务可能未完全启动，请稍等片刻"
fi

# 检查前端状态
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 前端服务正常"
else
    echo "⚠️  前端服务可能未完全启动，请稍等片刻"
fi

echo ""
echo "🎉 SaasAgent启动完成！"
echo ""
echo "📱 访问地址:"
echo "   前端管理界面: http://localhost:3000"
echo "   API文档:     http://localhost:8000/docs"
echo "   监控面板:     http://localhost:3001 (admin/admin123)"
echo ""
echo "🛠️  管理命令:"
echo "   查看日志:     docker-compose logs -f"
echo "   停止服务:     docker-compose down"
echo "   重启服务:     docker-compose restart"
echo ""
echo "📚 更多信息请查看: README.md"
