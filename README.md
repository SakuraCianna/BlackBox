# 黑匣子剧场

航空事故调查互动解谜游戏 Demo。玩家扮演事故调查员，通过 CVR 片段、残骸线索、维护记录、飞行数据和天气信息，识别事故直接原因、促成因素与根本原因，并提交调查报告获得评分反馈。

## 技术栈

- 前端：Vite + React + Tailwind CSS + Framer Motion
- 后端：Python 3.12 + FastAPI + SQLite + SQLAlchemy
- 虚拟环境：使用 uv，位置为 `backend/.venv`
- Node：按需求使用 Node 24

## 项目结构

```text
backend/
  main.py
  database.py
  models.py
  schemas.py
  seed_data.py
  routes/
  requirements.txt
frontend/
  src/
    components/
    services/
    App.jsx
    styles.css
  package.json
  vite.config.js
  tailwind.config.js
需求文档.md
```

## 后端启动

```powershell
uv venv "backend/.venv" --python 3.12
uv pip install -r "backend/requirements.txt" --python "backend/.venv/Scripts/python.exe"
& "backend/.venv/Scripts/python.exe" "backend/main.py"
```

后端默认地址：`http://127.0.0.1:8000`

启动时会自动创建 `backend/blackbox.db`，并写入 3 个扩展后的示例事故档案。

## 前端启动

```powershell
npm install --prefix "frontend"
npm start --prefix "frontend"
```

前端默认地址：`http://127.0.0.1:5173`

## API

- `GET /health`：健康检查
- `GET /accidents`：获取事故档案列表
- `GET /accidents/{id}`：获取事故详情、线索、因果链、历史案例和候选因素
- `POST /submit-report`：提交调查报告并返回评分

## Demo 内容

- 阿拉斯加航空 261 号事故推演
- 喷气客机涡轮失效模拟
- 无人机失控任务模拟

图片和音频使用占位路径，前端会以占位证据卡展示，不依赖真实媒体文件。
