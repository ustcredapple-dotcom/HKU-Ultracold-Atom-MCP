# 项目架构记录

最后更新: 2026-06-30

## 一句话架构

用户给出实验目标或操作意图，`leader` 把意图拆成安全、具体、可验证的步骤；`linker` 提供实验室真实世界模型；`Worker` 执行工具；`Speaker` 把结果讲清楚；`Teacher` 记录所有架构、环境和子项目知识。

## 信息流

```text
用户需求
  -> leader: 需求理解、任务拆解、操作选择
  -> linker: 查询接线、光路、设备拓扑、实验语义
  -> Safer/Checker: 安全约束与状态检查，职责待细化
  -> Worker: 调用实际工具、server、仪器 API
  -> Speaker: 把工程结果转换成人类可读说明
  -> Teacher/History: 记录文档、对话、构建日志
```

## 模块说明

### leader

未来的总调度层。它不应直接硬编码实验细节，而应调用 `linker` 理解当前实验系统，再选择 `Worker` 中的工具执行。

### linker

未来的实验知识层。应按子项目拆分记录:

- 实验室接线方式。
- 光路搭建方式。
- 仪器 IP、触发关系、时序关系。
- ARTIQ device_db 与物理设备之间的映射。
- Moku、锁相放大器、示波器、信号源等设备与实验目标之间的关系。

### Worker

执行层。当前第一批工具位于:

```text
Worker/Artiq_Project
```

其中 `remote` 控制 ARTIQ 工控机，`observer/moku` 负责 Moku:Go 观测工具。

### Speaker

翻译层。未来可以把 raw log、HDF5、CSV、ARTIQ 输出、仪器截图、server 状态等整理为人类可读报告。

### Teacher

文档层。所有架构和环境说明都放这里，让另一个 AI 接手时先读 `Teacher/README.md`。

### History

历史层。分三类:

- `Chat_History`: 用户要求和对话摘要。
- `Construction_Log`: 文件操作、调试、验证记录。
- `Tool_History`: 工具版本快照，未来保存旧版本。

### Key

敏感配置层。只在需要 API、token 或外部链接时读取，读取后不得把密钥内容写入普通文档。

## 当前边界

当前已完成的是把既有 ARTIQ/Moku 工具纳入架构，还没有实现 `leader` 的自动调度，也没有建立 `linker` 的实验室知识库。下一阶段建议优先补齐:

1. ARTIQ `device_db.py` 与实际硬件的映射文档。
2. 实验室网络拓扑和固定 IP 表。
3. 光路与接线的 `linker` 子项目。
4. `Safer` 的危险动作白名单/黑名单。
5. `Worker` 工具的本地配置模板和 git 忽略规则。
