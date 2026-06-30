# ARTIQ 与 Moku:Go 环境配置教学

最后更新: 2026-06-30

## 总体网络假设

当前规划是当前电脑、Linux 工控机、ARTIQ 设备和 Moku:Go 都接入同一个实验室局域网 `hku_ultracold`。

```text
当前电脑
  |
  | hku_ultracold
  |
  +-- Linux 工控机，运行 ARTIQ host/master
  +-- ARTIQ core device / Kasli / 控制硬件
  +-- Moku:Go
```

ARTIQ 实验推荐由 Linux 工控机执行。当前电脑负责写实验、提交实验和查看结果。Moku:Go 可以由当前电脑直接控制，也可以放到 Linux 工控机侧控制，但 Moku API 是普通网络控制，不属于 ARTIQ RTIO 硬实时链路。

## 一、ARTIQ 远程控制配置

工具目录:

```powershell
cd /d "Z:\Wang Junjie\HKU_Ultracold_Agent_Architect\Worker\Artiq_Project\remote"
```

生成本地配置:

```powershell
python remote_artiq.py init-config --output config.local.json
notepad config.local.json
```

需要按实际情况填写:

```json
{
  "linux_host": "192.168.10.2",
  "linux_user": "artiq",
  "ssh_port": 22,
  "ssh_identity_file": "",
  "remote_project_dir": "~/artiq_remote_jobs",
  "remote_env_setup": "",
  "remote_artiq_run": "artiq_run",
  "artiq_master_host": "",
  "artiq_master_control_port": 3251,
  "artiq_master_notify_port": 3250,
  "local_artiq_client": "artiq_client",
  "local_artiq_dashboard": "artiq_dashboard"
}
```

本机基础检查:

```powershell
python --version
ssh -V
scp
python remote_artiq.py check --config config.local.json
```

远端 ARTIQ 检查:

```powershell
python remote_artiq.py check --config config.local.json --deep
```

如果 `--deep` 找不到 `artiq_run`，通常是 SSH 非交互 shell 没有加载 ARTIQ 环境。根据工控机环境在 `config.local.json` 中设置:

```json
"remote_env_setup": "source ~/miniconda3/etc/profile.d/conda.sh && conda activate artiq"
```

或者:

```json
"remote_env_setup": "source ~/artiq-venv/bin/activate"
```

最小实验测试:

```powershell
python remote_artiq.py run --config config.local.json examples\core_reset.py
```

TTL 闪烁示例需要先确认 `device_db.py` 中存在 `ttl0`，否则要把示例里的设备名改成实际名称:

```powershell
python remote_artiq.py run --config config.local.json examples\ttl_blink.py -c TTLBlink count=5 pulse_ms=100
```

## 二、Moku:Go 配置

工具目录:

```powershell
cd /d "Z:\Wang Junjie\HKU_Ultracold_Agent_Architect\Worker\Artiq_Project\observer\moku"
```

Windows 安装 MokuCLI:

```powershell
.\installers\mokucli-windows.exe
```

安装 Python API。若当前电脑是 Windows CPython 3.11，可先尝试离线安装:

```powershell
.\install_from_downloads.bat
```

如果离线安装失败，改用在线安装:

```powershell
python -m pip install --upgrade moku
```

生成 Moku 本地配置:

```powershell
python moku_tools.py init-config --output moku_config.local.json
notepad moku_config.local.json
```

需要填写实际 Moku:Go 信息:

```json
{
  "moku_ip": "192.168.10.100",
  "moku_serial": "",
  "moku_os_version": "",
  "force_connect": false,
  "timebase_start_s": -0.001,
  "timebase_end_s": 0.001
}
```

发现设备:

```powershell
mokucli list
python moku_tools.py discover
```

完整检查:

```powershell
python moku_tools.py check --config moku_config.local.json
```

下载 instrument definitions:

```powershell
python moku_tools.py download-instruments --config moku_config.local.json
```

只读示波器测试:

```powershell
python moku_tools.py scope-read --config moku_config.local.json
```

只查看计划动作，不连接设备:

```powershell
python moku_tools.py scope-read --config moku_config.local.json --dry-run
```

## 三、安全提醒

- `core_reset.py` 只复位 ARTIQ core device，不操作外设，但仍应确认连接对象正确。
- `ttl_blink.py` 会操作 TTL 输出，运行前必须确认接线安全和设备名正确。
- `scope-read` 只读 Moku:Go 输入，不默认打开输出。
- 不要在未确认阻抗、电压范围、接线方向之前运行任何波形输出或 RF 输出脚本。
- `force_connect=true` 会强制接管 Moku:Go，可能影响其他用户，默认保持 `false`。

## 四、排错入口

优先阅读:

```text
Worker/Artiq_Project/remote/docs/网络部署检查表.md
Worker/Artiq_Project/remote/docs/故障排查.md
Worker/Artiq_Project/remote/README_中文.md
Worker/Artiq_Project/observer/moku/README_中文.md
```
