# linker

`linker` 是未来的实验知识层，用来帮助 AI 理解实验实际做了什么。

建议按子项目记录:

- 实验室接线方式。
- 光路搭建方式。
- 仪器 IP、端口、触发关系。
- ARTIQ `device_db.py` 与真实硬件的映射。
- 设备输出和实验物理量之间的关系。

当前已建立的子项目:

```text
Lab_Wiring_Connector
```

它定义实验室接线工程文件格式、校验逻辑和 AI 可读摘要能力。人类交互网页位于:

```text
..\Speaker\Lab_Wiring_Editor
```
