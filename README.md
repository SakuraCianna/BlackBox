# 黑匣子剧场

航空事故调查互动解谜游戏 Demo。玩家扮演事故调查员，通过 CVR 片段、残骸线索、维护记录、飞行数据和天气信息，识别事故直接原因、促成因素与根本原因，并提交调查报告获得评分反馈。

## 技术栈

- 前端：Vite + React + Tailwind CSS + Framer Motion + Three.js + GSAP
- 后端：Python 3.12 + FastAPI + SQLite + SQLAlchemy
- 虚拟环境：使用 `uv` 管理，位置 `backend/.venv`
- TTS：`edge-tts`（使用 Microsoft Edge 在线语音合成服务）

## 项目结构

```text
backend/
  main.py              # FastAPI 入口，uvicorn 启动
  database.py          # SQLite 连接与 session 管理
  models.py            # SQLAlchemy ORM 模型
  schemas.py           # Pydantic 请求/响应模型
  seed_data.py         # 5 个示例事故档案
  ai_review.py         # GLM-4V AI 评审（可选）
  routes/
    accidents.py       # 事故 API 路由
  requirements.txt
  .env.example         # 环境变量模板
frontend/
  src/
    main.jsx           # React 入口
    App.jsx            # 主应用与阶段流程
    styles.css         # 全局样式与雷达扫描主题
    components/
      MissionSelect.jsx    # 任务选择首页
      CrashScene.jsx       # Three.js 3D 事故现场重建
      ClueCard.jsx         # 证据卡（文字/图片/音频）
      AnalysisBoard.jsx    # 因果分析板
      ReasoningDesk.jsx    # 思索模式线索整理
      ReportPanel.jsx      # 调查报告提交
      ScorePanel.jsx       # 评分结果展示
      HistoricalModal.jsx  # 历史案例弹窗
    services/
      api.js           # 后端 API 调用
  index.html
  vite.config.js
  tailwind.config.js
scripts/
  generate_audio.py    # edge-tts 音频生成脚本
事故内容.md             # 素材清单与音视频建议
需求文档.md             # 原始需求
快速启动.bat            # Windows 一键启动
```

## 快速启动

### 后端

```powershell
# 创建虚拟环境（仅首次）
uv venv "backend/.venv" --python 3.12

# 安装依赖
uv pip install -r "backend/requirements.txt" --python "backend/.venv/Scripts/python.exe"

# 启动（默认 http://127.0.0.1:8000）
& "backend/.venv/Scripts/python.exe" "backend/main.py"
```

启动时自动创建 `backend/blackbox.db` 并写入 5 个示例事故档案。

### 前端

```powershell
npm install --prefix "frontend"
npm start --prefix "frontend"
```

前端默认 http://127.0.0.1:5173，开发模式下 API 请求自动代理到后端。

### 一键启动（Windows）

```powershell
.\快速启动.bat
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/accidents` | 事故档案列表 |
| GET | `/accidents/{id}` | 事故详情（含线索、因果链、候选因素） |
| POST | `/submit-report` | 提交调查报告，返回评分与 AI 评审 |

## Demo 事故档案

| # | 标题 | 年份 | 关键主题 |
|---|------|------|----------|
| 01 | 阿拉斯加航空 261 号事故推演 | 2000 | 配平丝杠磨损、维修间隔、机组误判 |
| 02 | 喷气客机涡轮失效模拟 | 2019 | 风扇叶片疲劳、振动趋势、V1 决策 |
| 03 | 无人机失控任务模拟 | 2024 | 低空风切变、抗风模式、链路延迟 |
| 04 | 法航 447 号高空失速调查 | 2009 | 皮托管堵塞、失速识别、自动化意识 |
| 05 | 特内里费跑道相撞调查 | 1977 | 跑道侵入、无线电误解、权威梯度 |

## AI 评审（可选）

AI 评审使用 GLM-4V 模型对玩家提交的调查报告进行专业评分。启用方式：

```powershell
$env:GLM_API_KEY = "your-api-key-here"
```

未设置时自动跳过 AI 评审，仅使用规则评分。参考 `backend/.env.example`。

## 音频生成

事故现场的语音线索使用 `edge-tts` 生成，已包含在 `frontend/public/media/` 中。如需重新生成：

```powershell
& "backend/.venv/Scripts/python.exe" "scripts/generate_audio.py"
```

常用中文语音：`zh-CN-YunxiNeural`（男声）、`zh-CN-XiaoxiaoNeural`（女声）。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `GLM_API_KEY` | GLM-4V API Key（AI 评审） | 空（跳过 AI 评审） |
| `VITE_API_BASE` | 前端 API 基地址 | 空（使用 Vite 代理） |

## 注意事项

- 数据库为 SQLite，删除 `backend/blackbox.db` 重启即可重置
- 图片使用占位图，前端以占位证据卡展示
- 无测试套件、无 CI/CD
- 3D 场景基于 Three.js 实时渲染，需浏览器支持 WebGL
