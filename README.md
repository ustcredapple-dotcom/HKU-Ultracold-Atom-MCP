# HKU Ultracold Agent Architect

这是一个面向超冷原子实验的 AI 仪器控制架构。项目文档入口在:

```text
Teacher/README.md
```

新 AI 或新开发者接手时，请先阅读 `Teacher`，再进入 `Worker` 查看实际工具。

当前第一批迁移工具:

```text
Worker/Artiq_Project
```

包含:

- `remote`: 通过 SSH/SCP 或 `artiq_client` 远程控制 Linux 工控机上的 ARTIQ。
- `observer/moku`: Moku:Go API、MokuCLI、设备发现和只读示波器测试工具。

敏感信息位于 `Key`，默认不应提交到 git。
