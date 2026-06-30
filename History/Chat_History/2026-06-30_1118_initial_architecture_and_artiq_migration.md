# Chat History: 初始架构说明与 Artiq_Project 迁移

时间: 2026-06-30 11:18:29 +08:00

## 用户原始目标

用户要求协助编写和整理 `HKU_Ultracold_Agent_Architect`，项目位于:

```text
Z:\Wang Junjie\HKU_Ultracold_Agent_Architect
```

总体目标是建立一个由 AI 控制实验仪器的架构，用于超冷原子实验相关自动化。

## 用户指定的目录语义

- `History/Chat_History`: 保存每次修改和对话记录，使用 Markdown，方便迁移给别的 AI。
- `History/Construction_Log`: 保存操作记录和调试日志，要求清晰简练。
- `History/Tool_History`: 保存未来每个 tool 的前序版本。
- `Key`: 保存各种软件工具的 API、token、链接等敏感信息。只有需要 token 或 API 时才查询。
- `leader`: 总领导者，将用户需求转译为具体操作。
- `linker`: 帮助 AI 理解实验具体内容，包括实验室接线、光路搭建等，未来拆成不同子项目。
- `Speaker`: 工具包，用于将工程文件、中间文件翻译成人可读格式。
- `Teacher`: 项目总体记录、架构记录、子项目文档记录。另一个 AI 接手时应先读这里。
- `Worker`: 存放各种工具和 server。

## 本轮明确任务

第一步打开并理解:

```text
Z:\Wang Junjie\Artiq_Project
```

然后将该项目归档并迁移到 `HKU_Ultracold_Agent_Architect` 中:

- 工具放到 `Worker`。
- 环境配置教学放到 `Teacher`。
- 不忘记记录日志和更新文档。
- GitHub 仓库地址为:

```text
https://github.com/ustcredapple-dotcom/HKU-Ultracold-Atom-MCP
```

## 本轮对话中的补充提醒

用户随后提醒:

```text
项目运行的日志和chathistory，你存了吗，没存的话别忘了
```

因此本文件记录本轮对话上下文，另一个文件记录施工日志。

## 助手已理解的源项目内容

`Z:\Wang Junjie\Artiq_Project` 包含两个顶层目录:

```text
remote
observer
```

其中:

- `remote`: ARTIQ 远程控制工具，通过 SSH/SCP 或本机 `artiq_client` 操作 Linux 工控机上的 ARTIQ。
- `observer/moku`: Moku:Go 相关工具，包含 Python API、MokuCLI、离线安装包、设备发现和只读示波器读取测试。

## 本轮采取的迁移策略

采取原样迁移，而不是打散源项目目录。原因:

- 原项目已有 README、示例、安装脚本和相对路径。
- 原样迁移能降低路径破坏风险。
- `Worker/Artiq_Project` 可以作为第一批实际工具集合。
- `Teacher` 负责建立新架构的入口文档、环境配置教学和迁移说明。

## 对后续 AI 的重要提醒

- 先读 `Teacher/README.md`。
- 不要随意读取或公开 `Key` 目录内容。
- `config.local.json` 和 `moku_config.local.json` 是本地配置，不应提交到公开仓库。
- 当前示例 IP 都只是模板，实际实验室 IP 需要用户确认。
- 运行 ARTIQ 或 Moku 真实硬件操作前，要先确认接线、电压、阻抗、设备占用和实验状态。
