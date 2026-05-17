from sqlalchemy.orm import Session

from models import Accident, CausalFactor, Clue, HistoricalCase, Submission, TimelineEntry


ACCIDENTS = [
    {
        "title": "阿拉斯加航空 261 号事故推演",
        "description": "一架客机在巡航后段出现俯仰配平异常，机组多次尝试恢复控制，最终失控坠海。",
        "aircraft": "MD-83 客机",
        "location": "美国加州外海",
        "flight_phase": "巡航至下降准备",
        "year": 2000,
        "dossier": "本档案以真实航空安全教训为基础进行教学化改编。调查重点不是追责，而是还原机械磨损、维修决策、机组判断之间如何连接成事故链。",
        "causal_chain": [
            {
                "factor": "尾翼配平丝杠润滑不足",
                "impact": "水平安定面传动机构磨损加剧并卡滞",
                "result": "飞机俯仰控制能力快速下降",
                "explanation": "残骸中丝杠螺纹出现异常磨耗，润滑记录与磨损程度不匹配，说明机械系统在事故前已长期处于高风险状态。",
                "severity": "直接原因",
            },
            {
                "factor": "维修检查间隔过长",
                "impact": "关键磨损未在早期被发现",
                "result": "单点机械故障被放大为不可恢复失控",
                "explanation": "维护策略把经济性和放行效率置于保守安全余量之前，使原本可通过停场检修发现的隐患继续累积。",
                "severity": "根本原因",
            },
            {
                "factor": "机组误判配平异常等级",
                "impact": "早期未立即转入最保守处置方案",
                "result": "故障发展窗口被进一步压缩",
                "explanation": "CVR 显示机组意识到配平异常，但一度将其视为可控故障，未能在最早阶段完成就近备降。",
                "severity": "促成因素",
            },
        ],
        "clues": [
            {
                "type": "text",
                "title": "CVR 片段 14:09:32",
                "content": "机长：配平又卡住了，别再动它。副驾驶：升降舵压力越来越重。",
                "detail": "语音记录显示，机组最先感知到的是俯仰配平异常，而不是发动机或导航问题。",
                "related_factor": "机组误判配平异常等级",
                "reliability": "高",
            },
            {
                "type": "image",
                "title": "尾翼作动机构残骸照片",
                "content": "wreckage_beach_fuselage.jpg",
                "detail": "图像占位：丝杠螺纹区域有明显磨损和金属碎屑沉积，提示长期润滑或检查问题。",
                "related_factor": "尾翼配平丝杠润滑不足",
                "reliability": "高",
            },
            {
                "type": "text",
                "title": "维修记录摘录",
                "content": "最近两次 A 检均记录配平系统轻微阻滞，但未触发停场拆检。",
                "detail": "维护记录把异常归类为可观察项目，说明组织层面的检查阈值可能过于宽松。",
                "related_factor": "维修检查间隔过长",
                "reliability": "中",
            },
            {
                "type": "audio",
                "title": "驾驶舱告警音频",
                "content": "placeholder/alaska261_trim_warning.mp3",
                "detail": "音频占位：连续配平告警与人工操作口令交替出现，说明故障并非瞬间发生。",
                "related_factor": "机组误判配平异常等级",
                "reliability": "中",
            },
            {
                "type": "text",
                "title": "雷达高度曲线",
                "content": "高度在 31,000 英尺附近短暂稳定，随后出现两次剧烈俯仰波动并快速下降。",
                "detail": "曲线支持控制面或配平系统失效的推断，而非单纯天气扰动。",
                "related_factor": "尾翼配平丝杠润滑不足",
                "reliability": "高",
            },
            {
                "type": "image",
                "title": "残骸分布与回收编号图",
                "content": "wreckage_beach_fuselage.jpg",
                "detail": "图像占位：尾翼部件和机身碎片分布显示飞机在撞击前已处于高能量失控状态，而不是水面迫降失败。",
                "related_factor": "尾翼配平丝杠润滑不足",
                "reliability": "中",
            },
            {
                "type": "text",
                "title": "签派沟通记录",
                "content": "机组询问是否继续飞往计划目的地，签派建议结合机组判断，但未强制就近备降。",
                "detail": "这条线索显示异常处置不只发生在驾驶舱，也受到地面沟通和运营决策影响。",
                "related_factor": "机组误判配平异常等级",
                "reliability": "中",
            },
        ],
        "historical_cases": [
            {
                "trigger_factor": "尾翼配平丝杠润滑不足",
                "title": "真实教训：阿拉斯加航空 261 号",
                "content": "真实事故调查指出，水平安定面配平丝杠组件严重磨损，导致飞机最终失去俯仰控制。",
                "lesson": "安全关键部件的润滑、磨损检测和检查间隔不能只按最低合规线设计。",
            },
            {
                "trigger_factor": "维修检查间隔过长",
                "title": "维护制度的隐藏风险",
                "content": "多起事故表明，维护延期本身未必违法，但会降低系统对异常的吸收能力。",
                "lesson": "根本原因常常藏在排班、成本、检查阈值和组织沟通之中。",
            },
            {
                "trigger_factor": "机组误判配平异常等级",
                "title": "机组资源管理 CRM",
                "content": "现代训练强调在不确定情况下快速升级风险等级，并分工处理操纵、通讯和备降决策。",
                "lesson": "正确的技术判断需要被清晰沟通和及时决策放大。",
            },
        ],
        "timeline": [
            {"time": "13:48", "speaker": "机长", "text": "配平系统有点不对劲，先观察一下。", "is_key_moment": 0},
            {"time": "14:02", "speaker": "副驾驶", "text": "配平又卡住了，升降舵越来越重。", "is_key_moment": 1},
            {"time": "14:05", "speaker": "机长", "text": "别再动配平了，我们联系签派讨论备降方案。", "is_key_moment": 0},
            {"time": "14:09", "speaker": "签派", "text": "建议结合机组判断决定是否继续。", "is_key_moment": 0},
            {"time": "14:13", "speaker": "机长", "text": "我们继续飞往目的地，保持监控。", "is_key_moment": 1},
            {"time": "15:21", "speaker": "机长", "text": "配平完全失效！升降舵控制不住了！", "is_key_moment": 1},
            {"time": "15:22", "speaker": "副驾驶", "text": "飞机在俯仰振荡！全力拉杆！", "is_key_moment": 1},
            {"time": "15:23", "speaker": "CVR", "text": "[连续告警音 + 操纵杆受力声]", "is_key_moment": 1},
        ],
    },
    {
        "title": "喷气客机涡轮失效模拟",
        "description": "一架双发喷气客机起飞滑跑后段出现发动机剧烈振动，机组中止起飞并冲出跑道末端。",
        "aircraft": "窄体双发喷气客机",
        "location": "沿海机场 18 号跑道",
        "flight_phase": "起飞滑跑",
        "year": 2019,
        "dossier": "本案关注发动机健康监测、起飞决策速度和跑道风险控制。玩家需要区分发动机直接故障与决策延迟造成的损伤扩大。",
        "causal_chain": [
            {
                "factor": "风扇叶片疲劳裂纹漏检",
                "impact": "高转速下叶片断裂并造成非包容性损伤风险",
                "result": "一号发动机推力快速丧失",
                "explanation": "发动机内窥检查照片存在细小裂纹迹象，但维护记录未将其升级为更高级别缺陷。",
                "severity": "直接原因",
            },
            {
                "factor": "发动机振动趋势被低估",
                "impact": "连续三次航段的异常振动未触发停飞排查",
                "result": "故障在起飞高负荷阶段暴露",
                "explanation": "趋势监测数据早有轻微异常，但被解释为传感器漂移，错过了预防性检修窗口。",
                "severity": "根本原因",
            },
            {
                "factor": "中止起飞决策偏晚",
                "impact": "剩余跑道不足以安全停止",
                "result": "飞机冲出跑道并前起落架受损",
                "explanation": "FDR 显示中止指令接近决断速度后才发出，制动距离已经非常紧张。",
                "severity": "促成因素",
            },
        ],
        "clues": [
            {
                "type": "text",
                "title": "起飞前维护放行单",
                "content": "一号发动机振动值略高，签注为'监控观察，允许放行'。",
                "detail": "放行单说明异常已经进入系统，但没有形成停飞或深入检查决策。",
                "related_factor": "发动机振动趋势被低估",
                "reliability": "高",
            },
            {
                "type": "image",
                "title": "风扇叶片断口显微照片",
                "content": "wreckage_runway_crash.png",
                "detail": "图像占位：断口呈贝壳纹，符合疲劳裂纹长期扩展特征。",
                "related_factor": "风扇叶片疲劳裂纹漏检",
                "reliability": "高",
            },
            {
                "type": "audio",
                "title": "驾驶舱告警录音",
                "content": "placeholder/turbine_alarm.mp3",
                "detail": "音频占位：机组先听到砰响，随后出现主警告和发动机火警提示。",
                "related_factor": "风扇叶片疲劳裂纹漏检",
                "reliability": "中",
            },
            {
                "type": "text",
                "title": "FDR 速度记录",
                "content": "V1 前 1.8 秒出现剧烈振动，推力手柄收回发生在 V1 后约 0.6 秒。",
                "detail": "速度记录提示中止起飞指令出现偏晚，是损伤扩大的关键节点。",
                "related_factor": "中止起飞决策偏晚",
                "reliability": "高",
            },
            {
                "type": "text",
                "title": "跑道环境报告",
                "content": "跑道末端安全区可用长度有限，且雨后道面摩擦系数下降。",
                "detail": "环境条件不是发动机故障原因，但放大了延迟中止起飞的后果。",
                "related_factor": "中止起飞决策偏晚",
                "reliability": "中",
            },
            {
                "type": "image",
                "title": "跑道冲出现场复原图",
                "content": "wreckage_runway_crash.png",
                "detail": "图像占位：轮胎痕迹、跑道末端位置和前起落架损伤方向支持高速中止后的冲出判断。",
                "related_factor": "中止起飞决策偏晚",
                "reliability": "中",
            },
            {
                "type": "text",
                "title": "发动机健康监控趋势",
                "content": "过去三段航班一号发动机 N1 振动逐步上升，但单次读数均未超过硬性停飞阈值。",
                "detail": "趋势数据说明风险不是突然出现，而是在'每次都差一点'的解释中累积。",
                "related_factor": "发动机振动趋势被低估",
                "reliability": "高",
            },
        ],
        "historical_cases": [
            {
                "trigger_factor": "风扇叶片疲劳裂纹漏检",
                "title": "类似教训：非包容性发动机故障",
                "content": "真实航空史中，多起发动机叶片疲劳导致的故障推动了内窥检查、材料追踪和寿命件管理改进。",
                "lesson": "肉眼难见的疲劳裂纹需要靠制度化检测和趋势数据共同识别。",
            },
            {
                "trigger_factor": "发动机振动趋势被低估",
                "title": "健康监测不是摆设",
                "content": "发动机健康监控的价值在于识别缓慢偏离，而不是等到告警灯亮起。",
                "lesson": "低强度异常连续出现时，应按趋势风险处理，而不是孤立解释。",
            },
            {
                "trigger_factor": "中止起飞决策偏晚",
                "title": "V1 决策速度的意义",
                "content": "起飞决策速度用于划分继续起飞和中止起飞的风险边界，越界后的迟疑会迅速侵蚀安全裕度。",
                "lesson": "训练要让机组在高压下用标准口令快速做出一致动作。",
            },
        ],
        "timeline": [
            {"time": "08:15", "speaker": "机务", "text": "一号发动机振动值略高，签注：监控观察，允许放行。", "is_key_moment": 0},
            {"time": "08:42", "speaker": "机长", "text": "V1。", "is_key_moment": 0},
            {"time": "08:42:02", "speaker": "副驾驶", "text": "砰！一号发动机剧烈振动！", "is_key_moment": 1},
            {"time": "08:42:03", "speaker": "机长", "text": "中断起飞！最大刹车！", "is_key_moment": 1},
            {"time": "08:42:04", "speaker": "系统", "text": "主警告 — 发动机火警 — 起落架过载", "is_key_moment": 1},
            {"time": "08:42:08", "speaker": "副驾驶", "text": "跑道不够了！冲出去了！", "is_key_moment": 1},
            {"time": "08:42:10", "speaker": "CVR", "text": "[金属撞击声 + 飞机滑停声]", "is_key_moment": 1},
        ],
    },
    {
        "title": "无人机失控任务模拟",
        "description": "一架物流无人机在山区投送任务中突遇风切变，偏离航线后失去姿态控制并坠落。",
        "aircraft": "中型垂直起降物流无人机",
        "location": "西南山区峡谷航线",
        "flight_phase": "自主巡航与投送前转弯",
        "year": 2024,
        "dossier": "本案把传统航空事故调查方法迁移到无人系统：天气、软件配置、链路延迟和任务压力共同构成事故链。",
        "causal_chain": [
            {
                "factor": "天气预报未及时更新",
                "impact": "峡谷风切变未被任务系统识别",
                "result": "无人机进入超出任务规划的扰动环境",
                "explanation": "任务站使用的是 90 分钟前的格点天气，未加载山区短时风场更新。",
                "severity": "根本原因",
            },
            {
                "factor": "自动抗风模式未启用",
                "impact": "飞控未切换到高增益姿态保持逻辑",
                "result": "横滚角持续扩大并偏离航线",
                "explanation": "飞控日志显示抗风模式配置为手动触发，但当班操作员以为它会自动启用。",
                "severity": "直接原因",
            },
            {
                "factor": "备用链路延迟过高",
                "impact": "人工接管指令到达时已错过恢复窗口",
                "result": "无人机坠落并造成任务失败",
                "explanation": "主链路短暂丢包后切到备用链路，遥控指令延迟从 120ms 上升到 1.8s。",
                "severity": "促成因素",
            },
        ],
        "clues": [
            {
                "type": "text",
                "title": "飞控日志 10:42:18",
                "content": "ROLL_HOLD_LIMIT exceeded; WIND_ASSIST=false; operator override pending. ",
                "detail": "日志明确显示姿态限制被突破时，自动抗风模式仍未启用。",
                "related_factor": "自动抗风模式未启用",
                "reliability": "高",
            },
            {
                "type": "image",
                "title": "任务航迹叠加图",
                "content": "wreckage_forest_hillside.png",
                "detail": "图像占位：航迹在峡谷转弯点突然向背风坡漂移，符合风切变影响。",
                "related_factor": "天气预报未及时更新",
                "reliability": "高",
            },
            {
                "type": "text",
                "title": "天气服务缓存记录",
                "content": "最后一次天气包更新时间 09:12，任务起飞时间 10:31。",
                "detail": "缓存时间与事故时刻相差较大，说明任务系统未同步最新短临天气。",
                "related_factor": "天气预报未及时更新",
                "reliability": "高",
            },
            {
                "type": "audio",
                "title": "地面站语音记录",
                "content": "placeholder/drone_ground_station.mp3",
                "detail": "音频占位：操作员连续两次喊出'接管无响应'，随后画面冻结。",
                "related_factor": "备用链路延迟过高",
                "reliability": "中",
            },
            {
                "type": "text",
                "title": "通信链路遥测",
                "content": "主链路丢包率峰值 42%，备用链路 RTT 峰值 1.8 秒。",
                "detail": "遥测说明人工接管失败不是单纯操作迟缓，而是链路性能不足。",
                "related_factor": "备用链路延迟过高",
                "reliability": "高",
            },
            {
                "type": "image",
                "title": "地面站告警界面截图",
                "content": "wreckage_mountain_valley.png",
                "detail": "图像占位：告警窗口同时显示风场超限、链路降级和接管等待，体现多告警叠加带来的认知负荷。",
                "related_factor": "备用链路延迟过高",
                "reliability": "中",
            },
            {
                "type": "image",
                "title": "坠落点残骸照片",
                "content": "wreckage_forest_hillside.png",
                "detail": "图像占位：机臂折断方向和载荷散落位置显示无人机以横滚姿态撞击山坡。",
                "related_factor": "自动抗风模式未启用",
                "reliability": "中",
            },
        ],
        "historical_cases": [
            {
                "trigger_factor": "天气预报未及时更新",
                "title": "无人系统与微气象",
                "content": "多起无人机任务失败与局地阵风、峡谷风和热对流有关，传统机场天气并不足以覆盖低空航线。",
                "lesson": "无人机运行需要更密集、更实时的低空气象数据。",
            },
            {
                "trigger_factor": "自动抗风模式未启用",
                "title": "自动化模式意识",
                "content": "飞行自动化事故常见问题不是没有功能，而是操作者误解当前模式。",
                "lesson": "界面必须清楚告诉操作者系统现在处于什么模式，以及下一步会不会自动发生。",
            },
            {
                "trigger_factor": "备用链路延迟过高",
                "title": "远程驾驶的控制闭环",
                "content": "链路延迟会让人工接管从救命手段变成滞后指令，尤其在低空和高速姿态变化时。",
                "lesson": "备用链路不能只保证'连得上'，还要满足控制闭环的实时性。",
            },
        ],
        "timeline": [
            {"time": "10:31", "speaker": "操作员", "text": "起飞，航向 270，投送点预计 10:55。", "is_key_moment": 0},
            {"time": "10:38", "speaker": "系统", "text": "天气缓存时间 09:12，已过期 86 分钟。", "is_key_moment": 0},
            {"time": "10:42:15", "speaker": "系统", "text": "风场超限告警 — 横滚角超过限制。", "is_key_moment": 1},
            {"time": "10:42:18", "speaker": "系统", "text": "WIND_ASSIST=false — 抗风模式未启用。", "is_key_moment": 1},
            {"time": "10:42:22", "speaker": "操作员", "text": "手动接管！切换抗风模式！", "is_key_moment": 0},
            {"time": "10:42:24", "speaker": "系统", "text": "主链路丢包 42%，切换备用链路。", "is_key_moment": 1},
            {"time": "10:42:26", "speaker": "操作员", "text": "接管无响应！接管无响应！", "is_key_moment": 1},
            {"time": "10:42:28", "speaker": "系统", "text": "备用链路 RTT 1.8s — 信号丢失。", "is_key_moment": 1},
            {"time": "10:42:30", "speaker": "系统", "text": "[画面冻结 — 遥测中断]", "is_key_moment": 1},
        ],
    },
    {
        "title": "法航 447 号高空失速调查",
        "description": "一架空客 A330 夜间穿越热带辐合带后空速指示异常，自动驾驶脱开，机组未能识别并改出高空失速。",
        "aircraft": "Airbus A330-203",
        "location": "南大西洋 TASIL 航路点附近",
        "flight_phase": "夜间巡航",
        "year": 2009,
        "dossier": "本档案基于法航 447 号事故公开调查结论进行教学化改编。调查重点是自动化降级、空速不一致、失速识别和机组协同如何在数分钟内叠加成不可恢复的事故链。",
        "causal_chain": [
            {
                "factor": "皮托管冰晶堵塞",
                "impact": "空速数据短暂不一致并触发自动驾驶脱开",
                "result": "飞机从自动化巡航转入人工操纵和备用法则",
                "explanation": "ACARS 与 FDR 迹象显示，事故开始于空速测量异常，而不是发动机失效或结构破坏。",
                "severity": "直接诱因",
            },
            {
                "factor": "机组未识别高空失速",
                "impact": "持续拉杆使迎角增大，飞机进入深度失速",
                "result": "高度持续丧失且无法恢复升力",
                "explanation": "记录显示飞机保持机头上仰却快速下降，典型地指向失速未被正确理解。",
                "severity": "直接原因",
            },
            {
                "factor": "自动化模式意识不足",
                "impact": "备用法则、失速警告和双侧杆输入没有被快速整合",
                "result": "驾驶舱形成相互矛盾的操纵和判断",
                "explanation": "机组面对异常时未建立共同态势图，说明训练和人机界面理解存在短板。",
                "severity": "根本原因",
            },
        ],
        "clues": [
            {
                "type": "text",
                "title": "ACARS 自动维护报文",
                "content": "02:10 至 02:15 连续发送空速、飞控、自动驾驶相关故障信息。",
                "detail": "自动报文把调查起点锁定在空速不一致和自动化降级，而非爆炸、火灾或发动机停车。",
                "related_factor": "皮托管冰晶堵塞",
                "reliability": "高",
            },
            {
                "type": "text",
                "title": "FDR 姿态记录",
                "content": "飞机爬升至约 38,000 英尺后持续下降，迎角长期保持异常高位。",
                "detail": "高迎角、机头上仰、垂直速度下沉三者同时出现，是失速判断的关键组合。",
                "related_factor": "机组未识别高空失速",
                "reliability": "高",
            },
            {
                "type": "audio",
                "title": "CVR 关键口令片段",
                "content": "placeholder/af447_cvr_stall_warning.mp3",
                "detail": "音频占位：驾驶舱中出现自动驾驶脱开、失速警告、双输入提示和混乱口令。",
                "related_factor": "自动化模式意识不足",
                "reliability": "中",
            },
            {
                "type": "image",
                "title": "热带辐合带云团卫星图",
                "content": "wreckage_mountain_valley.png",
                "detail": "图像占位：航路穿越强对流云系附近，冰晶环境为皮托管短时堵塞提供条件。",
                "related_factor": "皮托管冰晶堵塞",
                "reliability": "中",
            },
            {
                "type": "text",
                "title": "操纵输入摘要",
                "content": "右座驾驶员多次拉杆，另一侧杆输入未能形成稳定一致的俯仰恢复动作。",
                "detail": "侧杆输入不联动显示增加了协同难度，错误操纵没有被及时识别和打断。",
                "related_factor": "自动化模式意识不足",
                "reliability": "高",
            },
            {
                "type": "image",
                "title": "搜寻残骸回收记录",
                "content": "wreckage_mountain_valley.png",
                "detail": "图像占位：深海搜寻后回收的机身和垂尾碎片，帮助调查组还原飞机撞击姿态。",
                "related_factor": "机组未识别高空失速",
                "reliability": "中",
            },
        ],
        "historical_cases": [
            {
                "trigger_factor": "皮托管冰晶堵塞",
                "title": "真实教训：法航 447 号",
                "content": "BEA 最终报告指出，冰晶导致的空速不一致使自动驾驶脱开，随后错误操纵让飞机进入高空失速。",
                "lesson": "传感器短时失效不应直接导致灾难，关键在于系统降级后的训练、提示和人工接管。",
            },
            {
                "trigger_factor": "机组未识别高空失速",
                "title": "高空失速训练改革",
                "content": "事故推动航空界重新强调高空失速识别、迎角意识和非正常姿态恢复训练。",
                "lesson": "机头上仰并不等于飞机在爬升，推理必须同时看姿态、迎角、空速和垂直速度。",
            },
            {
                "trigger_factor": "自动化模式意识不足",
                "title": "自动化不是共同态势图",
                "content": "复杂飞控模式降低了日常工作负荷，也可能在异常时让机组误判系统边界。",
                "lesson": "人机界面设计必须让'系统现在还能保护什么、不能保护什么'足够清楚。",
            },
        ],
        "timeline": [
            {"time": "02:10", "speaker": "系统", "text": "自动驾驶脱开 — 飞行法则降级为备用。", "is_key_moment": 1},
            {"time": "02:10:15", "speaker": "副驾驶", "text": "我有操纵。", "is_key_moment": 0},
            {"time": "02:10:50", "speaker": "系统", "text": "失速警告 — STALL STALL STALL。", "is_key_moment": 1},
            {"time": "02:11:00", "speaker": "副驾驶", "text": "我在拉杆……", "is_key_moment": 1},
            {"time": "02:11:30", "speaker": "机长", "text": "你们在干什么？", "is_key_moment": 0},
            {"time": "02:11:45", "speaker": "副驾驶", "text": "我一直在拉杆到底……", "is_key_moment": 1},
            {"time": "02:12", "speaker": "系统", "text": "双侧杆输入提示 — DUAL INPUT。", "is_key_moment": 1},
            {"time": "02:13", "speaker": "机长", "text": "爬升……不，下降！", "is_key_moment": 1},
            {"time": "02:14", "speaker": "副驾驶", "text": "可是我一直拉杆到底了啊……", "is_key_moment": 1},
            {"time": "02:14:30", "speaker": "系统", "text": "高度 9,000 英尺 — 接近海面。", "is_key_moment": 1},
        ],
    },
    {
        "title": "特内里费跑道相撞调查",
        "description": "两架波音 747 因机场改降、浓雾、跑道滑行和无线电误解，在同一跑道上发生灾难性相撞。",
        "aircraft": "Boeing 747-200 / Boeing 747-100",
        "location": "西班牙洛斯罗迪欧斯机场",
        "flight_phase": "跑道滑行与起飞",
        "year": 1977,
        "dossier": "本档案基于特内里费空难公开资料进行教学化改编。调查重点是单跑道拥堵、浓雾、非标准无线电用语、权威梯度和地面雷达缺失如何共同制造航空史上最严重事故。",
        "causal_chain": [
            {
                "factor": "KLM 未获起飞许可即开始滑跑",
                "impact": "起飞滑跑与仍在跑道上的 Pan Am 飞机产生冲突",
                "result": "两架 747 在浓雾中相撞",
                "explanation": "CVR 与塔台录音显示，KLM 机组把航路许可和起飞许可混淆，且已经开始推力增加。",
                "severity": "直接原因",
            },
            {
                "factor": "非标准无线电用语与通话重叠",
                "impact": "关键的'等待起飞'和'仍在跑道上'信息未被完整接收",
                "result": "双方对跑道占用状态形成不同理解",
                "explanation": "无线电干扰和含糊用词让本可中断滑跑的最后机会消失。",
                "severity": "促成因素",
            },
            {
                "factor": "浓雾与地面雷达缺失",
                "impact": "塔台和机组都无法可靠确认跑道上飞机位置",
                "result": "跑道侵入未被外部系统及时发现",
                "explanation": "低能见度机场如果缺乏地面监视系统，只靠语音报告会显著增加风险。",
                "severity": "系统因素",
            },
            {
                "factor": "权威梯度抑制质疑",
                "impact": "飞行工程师对 Pan Am 是否脱离跑道的疑问未改变机长决策",
                "result": "机组内部没有形成有效制衡",
                "explanation": "资深机长权威过强，使关键质疑没有转化为明确复核或停止动作。",
                "severity": "根本原因",
            },
        ],
        "clues": [
            {
                "type": "text",
                "title": "塔台通话摘录",
                "content": "塔台：Stand by for takeoff, I will call you. Pan Am：We are still taxiing down the runway. ",
                "detail": "两段关键通话几乎同时发生，KLM 驾驶舱未能清楚听到完整信息。",
                "related_factor": "非标准无线电用语与通话重叠",
                "reliability": "高",
            },
            {
                "type": "text",
                "title": "KLM 驾驶舱语音",
                "content": "飞行工程师：那架 Pan American 不在跑道上了吗？机长：是的，已经不在了。",
                "detail": "这条线索揭示了机组内存在疑问，但疑问被快速压下，没有形成有效交叉检查。",
                "related_factor": "权威梯度抑制质疑",
                "reliability": "高",
            },
            {
                "type": "image",
                "title": "跑道与滑行道简图",
                "content": "wreckage_runway_crash.png",
                "detail": "图像占位：平行滑行道被停机堵塞，出港飞机必须沿跑道反向滑行。",
                "related_factor": "浓雾与地面雷达缺失",
                "reliability": "高",
            },
            {
                "type": "text",
                "title": "气象能见度记录",
                "content": "漂移云雾使跑道局部能见度快速下降，塔台无法目视确认两机相对位置。",
                "detail": "能见度不是唯一原因，但它让所有语音误解变得更危险。",
                "related_factor": "浓雾与地面雷达缺失",
                "reliability": "高",
            },
            {
                "type": "audio",
                "title": "无线电重叠模拟",
                "content": "placeholder/tenerife_radio_overlap.mp3",
                "detail": "音频占位：异频啸叫覆盖了最关键的后半句，展示无线电半双工通信的限制。",
                "related_factor": "非标准无线电用语与通话重叠",
                "reliability": "中",
            },
            {
                "type": "text",
                "title": "起飞滑跑记录",
                "content": "KLM 飞机在未确认跑道净空的情况下加推力，超过 V1 后才发现前方飞机。",
                "detail": "一旦超过决断速度，停止起飞不再现实，错误进入不可逆阶段。",
                "related_factor": "KLM 未获起飞许可即开始滑跑",
                "reliability": "高",
            },
        ],
        "historical_cases": [
            {
                "trigger_factor": "KLM 未获起飞许可即开始滑跑",
                "title": "真实教训：特内里费空难",
                "content": "1977 年两架 747 在特内里费机场跑道相撞，造成 583 人遇难，是航空史上死亡人数最多的事故。",
                "lesson": "任何情况下，起飞许可必须明确、标准、不可被航路许可替代。",
            },
            {
                "trigger_factor": "非标准无线电用语与通话重叠",
                "title": "标准通话的制度化",
                "content": "事故后，航空无线电通话更强调标准术语，避免用含糊词替代明确许可。",
                "lesson": "通信系统里的一个词，可能就是系统安全边界。",
            },
            {
                "trigger_factor": "浓雾与地面雷达缺失",
                "title": "跑道入侵防护",
                "content": "低能见度机场运行推动了地面监视雷达、跑道状态灯和更严格滑行程序的发展。",
                "lesson": "当人看不见时，系统必须提供第二套'眼睛'。",
            },
            {
                "trigger_factor": "权威梯度抑制质疑",
                "title": "CRM 训练兴起",
                "content": "特内里费事故常被视为机组资源管理训练发展的关键案例之一。",
                "lesson": "驾驶舱安全不是服从权威，而是让质疑能被听见并改变行动。",
            },
        ],
        "timeline": [
            {"time": "16:56", "speaker": "塔台", "text": "KLM 和 Pan Am 滑行至跑道头等待。", "is_key_moment": 0},
            {"time": "17:02", "speaker": "KLM机长", "text": "我们准备起飞了。", "is_key_moment": 0},
            {"time": "17:04", "speaker": "塔台", "text": "KLM 请等待起飞，我会通知你。", "is_key_moment": 1},
            {"time": "17:04:05", "speaker": "Pan Am", "text": "我们还在跑道上滑行。", "is_key_moment": 1},
            {"time": "17:04:06", "speaker": "KLM", "text": "[啸叫覆盖了后半句]", "is_key_moment": 1},
            {"time": "17:05", "speaker": "KLM工程师", "text": "那架 Pan American 不在跑道上了吗？", "is_key_moment": 1},
            {"time": "17:05:05", "speaker": "KLM机长", "text": "是的，已经不在了。", "is_key_moment": 1},
            {"time": "17:05:10", "speaker": "KLM机长", "text": "起飞推力设定。", "is_key_moment": 1},
            {"time": "17:05:30", "speaker": "副驾驶", "text": "等等！跑道上有……", "is_key_moment": 1},
            {"time": "17:05:35", "speaker": "CVR", "text": "[碰撞声 — 录音结束]", "is_key_moment": 1},
        ],
    },
]


def seed_database(db: Session) -> None:
    existing_titles = {title for (title,) in db.query(Accident.title).all()}
    expected_titles = {item["title"] for item in ACCIDENTS}
    if existing_titles == expected_titles:
        return

    db.query(Submission).delete()
    db.query(HistoricalCase).delete()
    db.query(Clue).delete()
    db.query(CausalFactor).delete()
    db.query(TimelineEntry).delete()
    db.query(Accident).delete()
    db.commit()

    for accident_index, item in enumerate(ACCIDENTS, start=1):
        accident = Accident(
            title=item["title"],
            description=item["description"],
            aircraft=item["aircraft"],
            location=item["location"],
            flight_phase=item["flight_phase"],
            year=item["year"],
            dossier=item["dossier"],
        )
        db.add(accident)
        db.flush()

        for sort_order, factor in enumerate(item["causal_chain"], start=1):
            db.add(CausalFactor(accident_id=accident.id, sort_order=sort_order, **factor))

        for sort_order, clue in enumerate(item["clues"], start=1):
            db.add(Clue(accident_id=accident.id, sort_order=sort_order, **clue))

        for sort_order, case in enumerate(item["historical_cases"], start=1):
            db.add(HistoricalCase(accident_id=accident.id, sort_order=sort_order, **case))

        for sort_order, entry in enumerate(item.get("timeline", []), start=1):
            db.add(TimelineEntry(accident_id=accident.id, sort_order=sort_order, **entry))

    db.commit()
