# HKU Ultracold Agent Architect 入口文档

最后更新: 2026-06-30

## 项目目标

本项目的目标是搭建一个可以由 AI 协助控制超冷原子实验仪器的工程架构。AI 不直接假设实验室状态，而是通过文档、工具、日志和安全检查逐步理解实验系统，再把用户需求转译成可执行、可追踪、可回滚的操作。

## 新 AI 的推荐阅读顺序

1. 先读本文件，理解项目目录角色和当前状态。
2. 读 `Teacher/Architecture/Project_Architecture.md`，理解总体架构。
3. 读 `Teacher/Subprojects/Artiq_Project_Migration.md`，理解第一批已迁移工具。
4. 读 `Teacher/Subprojects/Lab_Wiring_Connector.md`，理解实验室接线工程文件和网页编辑器。
5. 读 `Teacher/Environment_Setup/ARTIQ_Moku_Setup.md`，理解 ARTIQ 与 Moku:Go 的环境配置方式。
6. 再去 `Worker/Artiq_Project`、`linker/Lab_Wiring_Connector` 和 `Speaker/Lab_Wiring_Editor` 阅读实际工具代码和 README。
7. 如果需要了解历史决策，读 `History/Chat_History` 和 `History/Construction_Log`。

## 目录角色

- `Teacher`: 项目总文档、架构记录、子项目说明、环境配置教学。其他 AI 接手时应先读这里。
- `Worker`: 可执行工具、server、仪器控制脚本、离线安装包和工程文件。
- `leader`: 未来的总调度者，把用户需求转译成具体操作计划。
- `linker`: 未来的实验理解层，记录接线、光路、设备拓扑、物理含义和实验语义。
- `Speaker`: 未来的翻译层，把工程文件、中间文件和机器输出转换成人类可读格式。
- `History/Chat_History`: 保存用户需求、对话摘要、设计约束和每次修改说明。
- `History/Construction_Log`: 保存实际操作记录、调试日志、验证结果。
- `History/Tool_History`: 保存日后每个 tool 的旧版本或快照。
- `Key`: 存放 API key、token、外部链接等敏感配置。只有确实需要时才读取，不应把密钥内容写进文档或 git。
- `Checker` 与 `Safer`: 目录已存在，具体职责尚待用户定义。暂时保留。

## 当前已完成的第一步

已将 `Z:\Wang Junjie\Artiq_Project` 原样迁移到:

```text
Z:\Wang Junjie\HKU_Ultracold_Agent_Architect\Worker\Artiq_Project
```

当前包含两个子项目:

- `remote`: 通过 SSH/SCP 或 `artiq_client` 远程控制 Linux 工控机上的 ARTIQ。
- `observer/moku`: Moku:Go 的 API、MokuCLI、设备发现、离线安装包和只读示波器测试工具。

已建立第一版实验室接线连接器:

- `linker/Lab_Wiring_Connector`: 接线工程文件格式、schema、校验和 AI 摘要。
- `Speaker/Lab_Wiring_Editor`: 人类可交互网页，调用 linker 引擎，读写 `.labwire.json`。

## 安全工作原则

- 默认不直接运行会改变实验硬件状态的命令，除非用户明确要求并且配置已经确认。
- 优先使用只读检查命令，例如 `check`、`discover`、`--dry-run`。
- `config.local.json`、`moku_config.local.json` 等本地配置不应提交到公开仓库。
- Moku 输出、ARTIQ TTL 输出、RF/光路相关操作必须先确认接线、电压、阻抗和实验状态。
- 任何读取 `Key` 目录的行为都应在日志中说明用途，但不要复制密钥内容。

## GitHub

用户提供的 GitHub 仓库地址:

```text
https://github.com/ustcredapple-dotcom/HKU-Ultracold-Atom-MCP
```

本地目录初始并不是 git 仓库。后续如需提交，需要先初始化 git、设置 remote，并确认是否有推送权限。
