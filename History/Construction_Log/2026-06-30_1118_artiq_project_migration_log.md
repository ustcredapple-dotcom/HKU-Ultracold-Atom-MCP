# Construction Log: Artiq_Project 迁移与文档初始化

时间: 2026-06-30 11:18:29 +08:00

## 操作目标

理解并迁移:

```text
Z:\Wang Junjie\Artiq_Project
```

迁移到:

```text
Z:\Wang Junjie\HKU_Ultracold_Agent_Architect
```

要求:

- 工具进入 `Worker`。
- 环境配置教学进入 `Teacher`。
- 对话历史进入 `History/Chat_History`。
- 操作和验证日志进入 `History/Construction_Log`。

## 初始检查

源项目顶层目录:

```text
Z:\Wang Junjie\Artiq_Project\observer
Z:\Wang Junjie\Artiq_Project\remote
```

目标项目已有顶层目录:

```text
Checker
History
Key
leader
linker
Safer
Speaker
Teacher
Worker
```

检查结果:

- 目标目录初始不是 git 仓库。
- `Teacher` 初始为空。
- `History` 下已有 `Chat_History`、`Construction_Log`、`Tool_History`。
- `Worker/Artiq_Project` 初始不存在。

## 源项目归档理解

源项目文件数与体积:

```text
Count: 30
Size: 74714726 bytes
```

核心工具:

- `remote/remote_artiq.py`: 远程 ARTIQ helper。
- `observer/moku/moku_tools.py`: Moku:Go helper。

关键文档:

- `remote/README_中文.md`
- `remote/docs/网络部署检查表.md`
- `remote/docs/故障排查.md`
- `observer/moku/README_中文.md`

关键示例:

- `remote/examples/core_reset.py`
- `remote/examples/ttl_blink.py`
- `observer/moku/examples/oscilloscope_snapshot.py`

离线资源:

- Moku Python 包与依赖 wheel。
- MokuCLI Windows installer。
- MokuCLI Linux tar.gz。

## 文件迁移

创建目标目录:

```text
Z:\Wang Junjie\HKU_Ultracold_Agent_Architect\Worker\Artiq_Project
```

复制内容:

```text
Z:\Wang Junjie\Artiq_Project\remote
  -> Z:\Wang Junjie\HKU_Ultracold_Agent_Architect\Worker\Artiq_Project\remote

Z:\Wang Junjie\Artiq_Project\observer
  -> Z:\Wang Junjie\HKU_Ultracold_Agent_Architect\Worker\Artiq_Project\observer
```

迁移后校验:

```text
Count: 30
Size: 74714726 bytes
```

说明: 中途执行 Python 语法编译时生成过 `__pycache__`，随后已删除，最终文件数和源项目一致。

## 语法验证

执行基础语法编译，未连接任何实验设备:

```powershell
python -m py_compile `
  "Z:\Wang Junjie\HKU_Ultracold_Agent_Architect\Worker\Artiq_Project\remote\remote_artiq.py" `
  "Z:\Wang Junjie\HKU_Ultracold_Agent_Architect\Worker\Artiq_Project\observer\moku\moku_tools.py" `
  "Z:\Wang Junjie\HKU_Ultracold_Agent_Architect\Worker\Artiq_Project\remote\examples\core_reset.py" `
  "Z:\Wang Junjie\HKU_Ultracold_Agent_Architect\Worker\Artiq_Project\remote\examples\ttl_blink.py" `
  "Z:\Wang Junjie\HKU_Ultracold_Agent_Architect\Worker\Artiq_Project\observer\moku\examples\oscilloscope_snapshot.py"
```

结果:

```text
通过，无 Python 语法错误。
```

## 新增文档

新增根目录文档:

```text
README.md
```

新增 Teacher 文档:

```text
Teacher/README.md
Teacher/Architecture/Project_Architecture.md
Teacher/Subprojects/Artiq_Project_Migration.md
Teacher/Environment_Setup/ARTIQ_Moku_Setup.md
```

文档内容:

- 项目目标。
- 新 AI 推荐阅读顺序。
- 各目录职责。
- ARTIQ/Moku 子项目迁移说明。
- Windows 和 Linux 工控机环境配置教程。
- 安全提醒。
- GitHub 仓库地址记录。

## 新增 git 保护规则

新增:

```text
.gitignore
```

主要排除:

- `Key/`
- `config.local.json`
- `moku_config.local.json`
- `*.local.json`
- Python cache。
- 虚拟环境。
- 实验运行输出和常见本地噪声文件。

新增:

```text
.gitattributes
```

用于固定常见文本文件和脚本换行策略，并把 wheel、tar.gz、exe 作为二进制文件处理。

## Git 初始化与目录占位

已执行本地 git 初始化:

```text
git init -b main
```

由于项目位于映射盘，Git 将路径识别为 UNC 网络路径并触发 `dubious ownership` 保护。处理方式: 没有写入全局 git 配置，只在后续 git 命令中临时传入该仓库路径的 `safe.directory` 参数。

已设置远端:

```text
origin https://github.com/ustcredapple-dotcom/HKU-Ultracold-Atom-MCP.git
```

已确认 `Key/` 会被 `.gitignore` 忽略，不会进入 git。

为了让 GitHub 上保留初始架构的空目录，新增以下占位说明:

```text
leader/README.md
linker/README.md
Speaker/README.md
Checker/README.md
Safer/README.md
History/README.md
History/Tool_History/README.md
```

`History/Tool_History` 未复制整份初始工具快照，因为当前 `Worker/Artiq_Project` 是原样迁移，尚未修改工具代码。未来修改前再保存旧版本。

## 未执行事项

- 未连接 ARTIQ 硬件。
- 未连接 Moku:Go。
- 未读取 `Key` 目录内容。
- 尚未在本日志此处记录最终 commit/push 结果。

## 后续建议

1. 用户确认是否要初始化 git 并连接 GitHub remote。
2. 用户提供或确认实际实验室 IP 和 ARTIQ 工控机用户名。
3. 建立 `linker` 的设备映射文档，包括网络拓扑、接线、光路和 `device_db.py` 对应关系。
4. 建立 `Safer` 的危险动作规则，例如 TTL/RF/光路相关输出前置检查。
5. 每次修改 `Worker` 工具前，将旧版本快照放入 `History/Tool_History`。
