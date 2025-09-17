@echo off
chcp 65001 >nul

REM SaasAgent Windows启动脚本

echo 🚀 启动SaasAgent开发环境...

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker未安装，请先安装Docker Desktop
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose未安装，请先安装Docker Compose
    pause
    exit /b 1
)

REM 检查.env文件
if not exist ".env" (
    echo 📝 创建.env配置文件...
    copy env.example .env
    echo ⚠️  请编辑.env文件，填入必要的API密钥和配置
    echo 📖 参考文档: https://github.com/0x1998s/SaasAgent#配置说明
)

REM 创建必要的目录
echo 📁 创建必要的目录...
if not exist "logs" mkdir logs
if not exist "data\postgres" mkdir data\postgres
if not exist "data\mongodb" mkdir data\mongodb
if not exist "data\redis" mkdir data\redis
if not exist "data\chromadb" mkdir data\chromadb

REM 启动服务
echo 🔧 启动Docker服务...
docker-compose up -d

REM 等待服务启动
echo ⏳ 等待服务启动完成...
timeout /t 30 /nobreak >nul

REM 检查服务状态
echo 🔍 检查服务状态...
docker-compose ps

REM 检查API健康状态
echo 🩺 检查API健康状态...
curl -f http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  后端API服务可能未完全启动，请稍等片刻
) else (
    echo ✅ 后端API服务正常
)

REM 检查前端状态
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ⚠️  前端服务可能未完全启动，请稍等片刻
) else (
    echo ✅ 前端服务正常
)

echo.
echo 🎉 SaasAgent启动完成！
echo.
echo 📱 访问地址:
echo    前端管理界面: http://localhost:3000
echo    API文档:     http://localhost:8000/docs
echo    监控面板:     http://localhost:3001 (admin/admin123)
echo.
echo 🛠️  管理命令:
echo    查看日志:     docker-compose logs -f
echo    停止服务:     docker-compose down
echo    重启服务:     docker-compose restart
echo.
echo 📚 更多信息请查看: README.md

pause
