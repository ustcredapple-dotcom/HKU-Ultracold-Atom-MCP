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
- 给每个接口命名，并设置方向、端口种类、信号类型、连接器类型等。
- 使用默认端口种类，例如 TTL、DAC、ADC、RF、模拟、数字、激光、相机照片/图像、光学、以太网、USB、电源。
- 添加工程内自定义端口种类。
- 点击两个端口后选择线型，创建连接。
- 自动整理器件布局。
- 打开已有 `.labwire.json` 工程文件。
- `Save`: 修改当前打开的工程文件。
- `Save As`: 另存为新的工程文件。
- 默认保存目录: `linker/Lab_Wiring_Connector/projects/User_Projects`。当工程没有当前文件句柄时，点击 `Save` 会写入这个目录。
- 真实实验室接线库目录: `linker/Lab_Wiring_Connector/projects/Actual_Lab_Wiring`。顶部工具栏提供 `读取现状`、`更新现状`、版本选择和 `回滚`，用于维护反映现实实验室当前连线的受控版本库。
- 加载示例工程。
- 校验工程文件。
- 查看 AI 摘要。
- 在右下角 `代码 / Code` 视图直接编辑 `.labwire.json`，点击 `应用 / Apply` 后由代码重新生成图。
- 自动保存模式默认开启：打开工程时先备份一次；每 1 分钟自动保存改动；每次正常保存或自动写入当前文件前，先把上一版本备份。
- 点击已经连接的线会选中该连接，右侧属性面板可以修改线型或删除；画布上也会弹出快捷工具条，可直接修改线型或删除连接。
- 鼠标滚轮可以围绕光标位置缩放画布；`整理 / Arrange` 会在底部接口下方存在器件时优先绕开，减少方块压在线上的情况。

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
- `portTypes`: 工程内可用的端口种类目录，包括默认类型和用户自定义类型。
- `connections`: 两个端口之间的线，包含 `from`、`to`、`cableType`、`signalType`、`label`、`notes`。
- `canvas`: 画布布局信息，方便人类重新打开工程继续编辑。

端口对象可以包含:

```json
{
  "id": "port_ttl0",
  "name": "TTL0",
  "direction": "output",
  "portType": "ttl",
  "signalType": "TTL trigger",
  "connectorType": "SMA"
}
```

自定义端口种类会写入 `portTypes`，因此 AI 读取工程文件时可以知道这些类型是用户定义的实验室概念。

schema 位于:

```text
linker/Lab_Wiring_Connector/schema/lab_wiring_project.schema.json
```

示例工程位于:

```text
linker/Lab_Wiring_Connector/projects/example_lab_wiring.labwire.json
```

用户工程默认保存目录:

```text
linker/Lab_Wiring_Connector/projects/User_Projects
```

这个目录用于当前正在维护的 `.labwire.json` 工程文件。历史版本和自动备份仍然放在 `History/Tool_History/Lab_Wiring_Connector_Backups`。

真实实验室当前接线目录:

```text
linker/Lab_Wiring_Connector/projects/Actual_Lab_Wiring
```

这个目录用于保存“现实实验室当前到底怎么连”的受控记录:

- `current/`: 当前有效的真实实验室接线文件。
- `versions/`: 每次通过编辑器更新或回滚时生成的不可变快照。
- `version_index.jsonl`: 版本库索引，包含版本 id、文件名、更新原因、内容 sha256、前一条记录 hash 和快照路径。
- `manifest.json`: 当前文件列表和最新版本的摘要，方便 AI 快速读取。

第一版真实接线文件为 `ZZLab.labwire.json`，来自用户已经保存的 `User_Projects/ZZLab.labwire.json`。后续请通过编辑器的 `更新现状` 写入真实接线库，避免手工覆盖 `current/` 破坏版本链。

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

当前启动脚本会运行:

```text
Speaker/Lab_Wiring_Editor/server.py
```

这个本地服务器同时提供备份 API:

```text
/api/lab-wiring/backups
```

备份归档在:

```text
History/Tool_History/Lab_Wiring_Connector_Backups
```

备份按日期分文件夹，并维护 `backup_index.jsonl`，便于之后追踪每次打开、保存、自动保存和代码应用前的版本。

## 自动整理与连线风格

网页顶部 `整理 / Arrange` 会根据连接方向自动布置器件:

- 有连接关系时，起点器件放在左侧，目标器件放在右侧或更右侧。
- 无连接关系时，按网格排列。
- 大量端口的器件会保留更高的纵向空间。

连接线使用圆角折线和浅色底线，不再使用大幅弯曲线，便于在器件数量很多时阅读。

## 安全边界

当前工具只记录和编辑接线知识，不控制硬件。任何未来从 `.labwire.json` 自动生成实验动作的功能，必须先进入 `Safer` 检查，并由用户确认。

## 后续扩展建议

- 增加器件模板库，例如 ARTIQ Kasli、Moku:Go、AOM driver、laser、photodiode、camera。
- 增加端口类型库，例如 SMA、BNC、DB9、fiber FC/APC、free-space beam。
- 增加 connection 规则提示，例如 output-to-output 高风险、RF/laser/power 需要确认。
- 支持把 `.labwire.json` 自动转换成 Mermaid、Markdown 或实验室拓扑报告。
