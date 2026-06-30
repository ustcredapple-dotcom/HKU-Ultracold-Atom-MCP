# Artiq_Project 迁移归档

最后更新: 2026-06-30

## 来源与目标

源项目:

```text
Z:\Wang Junjie\Artiq_Project
```

迁移目标:

```text
Z:\Wang Junjie\HKU_Ultracold_Agent_Architect\Worker\Artiq_Project
```

迁移策略: 原样保留源项目结构，不打散相对路径。这样原 README、示例、离线包、安装脚本和工具脚本仍能按原逻辑工作，只需要把文档里的入口路径换成新架构路径。

## 当前子项目

### remote

用途: 从当前电脑远程控制 Linux 工控机上的 ARTIQ。

关键文件:

```text
Worker/Artiq_Project/remote/remote_artiq.py
Worker/Artiq_Project/remote/config.example.json
Worker/Artiq_Project/remote/run_core_reset.bat
Worker/Artiq_Project/remote/examples/core_reset.py
Worker/Artiq_Project/remote/examples/ttl_blink.py
Worker/Artiq_Project/remote/docs/网络部署检查表.md
Worker/Artiq_Project/remote/docs/故障排查.md
```

能力:

- `init-config`: 生成 `config.local.json`。
- `check`: 检查 SSH、SCP、ARTIQ master 端口和本机可选 ARTIQ 客户端。
- `check --deep`: 通过 SSH 检查远端 `artiq_run`、`artiq_client`、`artiq_master`。
- `shell`: 在 Linux 工控机执行一条 bash 命令。
- `run`: 上传实验 Python 文件并在工控机执行 `artiq_run`。
- `client-submit`: 用本机 `artiq_client` 提交到远端 `artiq_master`。
- `dashboard`: 打开连接远端 master 的 `artiq_dashboard`。

默认示例 IP 和端口:

```text
Linux 工控机: 192.168.10.2
SSH: 22
ARTIQ master control: 3251
ARTIQ master notify: 3250
```

### observer/moku

用途: 管理 Moku:Go 的 API 安装、MokuCLI、设备发现和只读示波器测试。

关键文件:

```text
Worker/Artiq_Project/observer/moku/moku_tools.py
Worker/Artiq_Project/observer/moku/moku_config.example.json
Worker/Artiq_Project/observer/moku/requirements.txt
Worker/Artiq_Project/observer/moku/install_from_downloads.bat
Worker/Artiq_Project/observer/moku/install_from_downloads_linux.sh
Worker/Artiq_Project/observer/moku/examples/oscilloscope_snapshot.py
Worker/Artiq_Project/observer/moku/packages
Worker/Artiq_Project/observer/moku/installers
```

能力:

- `init-config`: 生成 `moku_config.local.json`。
- `check`: 检查 Python `moku` 包、MokuCLI、ping 和 `mokucli list`。
- `discover`: 调用 `mokucli list` 发现局域网设备。
- `download-instruments`: 下载当前 MokuOS 对应的 instrument definitions。
- `scope-read`: 连接 Moku:Go，部署 Oscilloscope，读取一帧输入数据，然后释放 ownership。

已下载离线资源:

- `moku==4.2.2.1`
- Windows Python 3.11 相关 wheel。
- MokuCLI Windows installer。
- MokuCLI Linux tar.gz。

注意: `packages/` 里的部分 wheel 是 Windows CPython 3.11 版本。如果换 Linux 或不同 Python 版本，优先在线安装 `moku`，或重新下载匹配 wheel。

## 迁移后建议

- 在 `Worker/Artiq_Project` 增加 `.gitignore`，排除 `.local` 配置、缓存和运行输出。
- 确认实际实验室 IP 后，把固定 IP 表写入 `linker`，不要直接覆盖 example 配置。
- 把 Linux 工控机上的 ARTIQ 版本、Python 版本、conda/venv 启动方式写入 `Teacher/Environment_Setup`。
- 后续每次改动工具时，把旧版本归档到 `History/Tool_History`。
