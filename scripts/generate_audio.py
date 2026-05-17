"""使用 edge-tts 为事故线索生成语音音频文件"""

import asyncio
from pathlib import Path

import edge_tts

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "frontend" / "public" / "media"

# 语音配置
VOICE_CAPTAIN = "zh-CN-YunxiNeural"      # 机长 - 男声沉稳
VOICE_COPILOT = "zh-CN-YunjianNeural"     # 副驾驶 - 男声清晰
VOICE_OPERATOR = "zh-CN-YunxiNeural"      # 无人机操作员
VOICE_TOWER = "zh-CN-YunyangNeural"       # 塔台 - 男声播报


async def generate_audio(text: str, output_file: str, voice: str, rate: str = "+0%") -> None:
    """生成单个音频文件"""
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(output_file)
    print(f"  [OK] {output_file}")


async def main() -> None:
    audio_tasks = [
        (
            "配平又卡住了，别再动它。升降舵压力越来越重。",
            f"{OUTPUT_DIR}/alaska261_trim_warning.mp3",
            VOICE_CAPTAIN,
            "-10%",
        ),
        (
            "砰！主警告！一号发动机火警！一号发动机火警！推力手柄收回，中断起飞！中断起飞！",
            f"{OUTPUT_DIR}/turbine_alarm.mp3",
            VOICE_CAPTAIN,
            "+15%",
        ),
        (
            "接管无响应！接管无响应！系统冻结，链路丢失！",
            f"{OUTPUT_DIR}/drone_ground_station.mp3",
            VOICE_OPERATOR,
            "+20%",
        ),
        (
            "自动驾驶脱开！失速警告！失速警告！双输入！我有操纵！你有操纵！速度！速度！速度！",
            f"{OUTPUT_DIR}/af447_cvr_stall_warning.mp3",
            VOICE_CAPTAIN,
            "+10%",
        ),
        (
            "塔台呼叫，等待起飞，我会通知你。泛美仍在跑道上滑行。我们还在跑道上。",
            f"{OUTPUT_DIR}/tenerife_radio_overlap.mp3",
            VOICE_TOWER,
            "+0%",
        ),
    ]

    for text, output_file, voice, rate in audio_tasks:
        try:
            await generate_audio(text, output_file, voice, rate)
        except Exception as e:
            print(f"  [FAIL] {output_file}: {e}")

    print("\nDone.")


if __name__ == "__main__":
    asyncio.run(main())
