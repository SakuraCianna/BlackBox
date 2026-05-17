# AGENTS.md - 黑匣子剧场

## 语言要求
- **始终使用中文回复用户**

## 项目概述
航空事故调查互动解谜游戏 Demo。玩家扮演事故调查员，通过分析 CVR 片段、残骸线索等证据，识别事故原因并提交调查报告获得评分。

## 技术栈
- 前端：Vite + React + Tailwind CSS + Framer Motion
- 后端：Python 3.12 + FastAPI + SQLite + SQLAlchemy
- 虚拟环境管理：`uv`（非 pip/venv），位置 `backend/.venv`
- TTS：`edge-tts`（Python 包，使用 Microsoft Edge 在线 TTS 服务，无需 API Key）

## 关键命令

### 后端
```powershell
# 创建虚拟环境（仅首次）
uv venv "backend/.venv" --python 3.12

# 安装依赖（使用 uv，不要用 pip）
uv pip install -r "backend/requirements.txt" --python "backend/.venv/Scripts/python.exe"

# 安装额外包也用 uv
uv pip install <package> --python "backend/.venv/Scripts/python.exe"

# 启动后端
& "backend/.venv/Scripts/python.exe" "backend/main.py"
```

### 前端
```powershell
npm install --prefix "frontend"
npm start --prefix "frontend"
```

### 一键启动
```powershell
.\快速启动.bat
```

## 重要约定

### 虚拟环境操作
- **永远用 `uv pip`**，不要直接用 `pip`。该 venv 没有独立 pip 模块。
- Python 解释器路径：`backend/.venv/Scripts/python.exe`
- 安装新包时用：`uv pip install <pkg> --python "backend/.venv/Scripts/python.exe"`

### 后端架构
- 入口：`backend/main.py`（FastAPI + uvicorn）
- 路由：`backend/routes/accidents.py`（唯一路由文件）
- AI 评审：`backend/ai_review.py`（调用 GLM-4V API，Key 从 `GLM_API_KEY` 环境变量读取）
- 数据库：SQLite，启动时自动创建 `backend/blackbox.db` 并 seed 5 个事故
- CORS 已配置允许 `localhost:5173`

### 前端架构
- 入口：`frontend/src/main.jsx` → `frontend/src/App.jsx`
- 组件在 `frontend/src/components/`
- API 调用在 `frontend/src/services/api.js`（通过 Vite 代理，无需硬编码后端地址）
- 开发服务器端口：5173，自动代理 `/accidents`、`/submit-report`、`/health` 到后端
- 3D 场景：`CrashScene.jsx` 使用 Three.js，每个事故有独立场景构建

### API 端点
- `GET /health` - 健康检查
- `GET /accidents` - 事故列表
- `GET /accidents/{id}` - 事故详情（含线索、因果链、候选因素）
- `POST /submit-report` - 提交报告并返回评分（含 AI 评审）

### 数据库
- SQLite 文件：`backend/blackbox.db`
- 自动初始化，启动时 seed 5 个示例事故
- 删除 `.db` 文件重启即可重置数据

## edge-tts 使用参考
- 文档：https://github.com/rany2/edge-tts
- 命令行：`edge-tts --text "文本" --write-media output.mp3`
- Python API：`import edge_tts`
- 常用中文语音：`zh-CN-XiaoxiaoNeural`（女声）、`zh-CN-YunxiNeural`（男声）
- 支持调节语速（`--rate`）、音高（`--pitch`）、音量（`--volume`）
- 可生成字幕：`--write-subtitles output.srt`

## 注意事项
- 项目无测试套件、无 lint/typecheck 配置
- 无 CI/CD 流程
- 图片和音频使用占位路径，前端以占位证据卡展示
- `ai_review.py` 中包含硬编码的 API Key（GLM-4V），修改时注意
- 音频生成脚本：`scripts/generate_audio.py`（需在 backend venv 中运行）
