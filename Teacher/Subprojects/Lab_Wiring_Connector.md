# Lab Wiring Connector 与 Editor

最后更新: 2026-06-30

## 目标

建立一个实验室接线连接器，用于把真实实验室中的仪器、器件、接口和线缆关系写成 AI 可读的工程文件。用户可以通过网页进行编辑，AI 可以通过工程文件理解实验室接线。

## 架构边界

引擎位于:

```text
linker/Lab_Wiring_Connector
```

交互网页位于:

```text
Speaker/Lab_Wiring_Editor
```

原因:

- `linker` 是项目与现实实验室连接的引擎，负责表达真实接线知识。
- `Speaker` 是人机交互层，负责打开网页、编辑图形、读写工程文件。

## 用户功能

网页编辑器支持:

- 中英双语界面切换。
- 插入新的方块，方块代表实际仪器或器件。
- 设置方块的接口数量、输入数量、输出数量。
- 给每个接口命名，并设置方向、信号类型、连接器类型等。
- 点击两个端口后选择线型，创建连接。
- 打开已有 `.labwire.json` 工程文件。
- `Save`: 修改当前打开的工程文件。
- `Save As`: 另存为新的工程文件。
- 加载示例工程。
- 校验工程文件。
- 查看 AI 摘要。

双语模式说明:

- 顶部 `中文 / EN` 可切换界面语言。
- 语言设置会保存在浏览器本地，下次打开仍使用上次选择。
- UI、弹窗、状态提示、默认端口命名、校验标题和 AI 摘要会跟随语言变化。
- 已有工程文件中的器件名、端口名和备注不会被自动翻译，因为这些是实验室记录本身。

## 工程文件格式

推荐扩展名:

```text
.labwire.json
```

工程文件是普通 JSON，核心字段:

- `metadata`: 工程标题、描述、创建时间、更新时间。
- `devices`: 器件列表。每个器件包含 `id`、`name`、`kind`、位置、备注和端口。
- `ports`: 每个器件下的接口，包含 `name`、`direction`、`signalType`、`medium`、`connectorType`、`notes`。
- `connections`: 两个端口之间的线，包含 `from`、`to`、`cableType`、`signalType`、`label`、`notes`。
- `canvas`: 画布布局信息，方便人类重新打开工程继续编辑。

schema 位于:

```text
linker/Lab_Wiring_Connector/schema/lab_wiring_project.schema.json
```

示例工程位于:

```text
linker/Lab_Wiring_Connector/projects/example_lab_wiring.labwire.json
```

## 打开网页

双击:

```text
Speaker/Lab_Wiring_Editor/launch_lab_wiring_editor.bat
```

或者在项目根目录运行本地服务器后打开:

```text
http://127.0.0.1:8765/Speaker/Lab_Wiring_Editor/web/index.html
```

本地服务器是必要的，因为网页需要读取 `linker` 中的 ES module，并使用浏览器的文件保存能力。

## 安全边界

当前工具只记录和编辑接线知识，不控制硬件。任何未来从 `.labwire.json` 自动生成实验动作的功能，必须先进入 `Safer` 检查，并由用户确认。

## 后续扩展建议

- 增加器件模板库，例如 ARTIQ Kasli、Moku:Go、AOM driver、laser、photodiode、camera。
- 增加端口类型库，例如 SMA、BNC、DB9、fiber FC/APC、free-space beam。
- 增加 connection 规则提示，例如 output-to-output 高风险、RF/laser/power 需要确认。
- 支持把 `.labwire.json` 自动转换成 Mermaid、Markdown 或实验室拓扑报告。
