# Construction Log: 端口种类细分与自动整理

时间: 2026-06-30 13:14:44 +08:00

## 操作目标

改进实验室接线编辑器:

- 细分输入/输出口种类，例如 DAC、TTL、RF。
- 支持用户自定义端口种类。
- 优化连线视觉风格。
- 增加自动整理功能。

## 修改文件

```text
linker/Lab_Wiring_Connector/src/wiring_engine.js
linker/Lab_Wiring_Connector/schema/lab_wiring_project.schema.json
linker/Lab_Wiring_Connector/projects/example_lab_wiring.labwire.json
Speaker/Lab_Wiring_Editor/web/index.html
Speaker/Lab_Wiring_Editor/web/styles.css
Speaker/Lab_Wiring_Editor/web/app.js
Speaker/Lab_Wiring_Editor/README.md
Teacher/Subprojects/Lab_Wiring_Connector.md
History/Chat_History/2026-06-30_1314_lab_wiring_ports_and_arrange.md
History/Construction_Log/2026-06-30_1314_lab_wiring_ports_and_arrange_log.md
```

## linker 引擎改动

- 新增默认 `portTypes`:
  - TTL
  - DAC
  - ADC
  - RF
  - Analog
  - Digital
  - Optical
  - Ethernet
  - USB
  - Power
  - Custom
- 新增 `port.portType` 字段。
- 新增 `createPortType()`，用于把自定义端口种类保存进工程文件。
- 旧工程打开时会自动补齐默认 `portTypes`，并根据端口名称、信号类型、接头类型推断缺失的 `portType`。
- AI 摘要中加入端口种类。

## 网页编辑器改动

- 顶部新增 `整理 / Arrange` 按钮。
- 端口属性编辑行新增端口种类下拉。
- 新增 `添加类型 / Add Type` 弹窗，可输入自定义端口种类名称和颜色。
- 端口按钮显示端口种类徽标，并用类型颜色做侧边提示。
- 连线从较自由的曲线改为圆角正交折线。
- 每条连接线增加浅色底线，提高复杂画布中的可读性。
- 自动整理会按连接方向分层布局器件，无连接器件则按网格排列。

## 验证记录

执行:

```powershell
python -m json.tool linker/Lab_Wiring_Connector/schema/lab_wiring_project.schema.json
python -m json.tool linker/Lab_Wiring_Connector/projects/example_lab_wiring.labwire.json
C:\Users\ustcr\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check linker/Lab_Wiring_Connector/src/wiring_engine.js
C:\Users\ustcr\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check Speaker/Lab_Wiring_Editor/web/app.js
```

结果: JSON 与 JS 校验通过。

浏览器验证:

- 示例工程可加载。
- 示例中的两个端口显示 `TTL` 端口种类徽标。
- AI 摘要包含端口种类，例如 `TTL0 [输出, TTL, TTL trigger, electrical, SMA]`。
- 连接线生成圆角折线路径，并存在浅色 backing path。
- `整理 / Arrange` 按钮可触发，示例工程布局保持清晰。
- `添加类型 / Add Type` 弹窗可打开，标题与按钮双语显示正常。

引擎层验证:

```text
createPortType(project, { name: "PLL Lock", color: "#b45309" })
```

结果: 自定义端口种类成功写入工程对象，id 为 `porttype_pll_lock`。

## 未执行事项

- 未读取 `Key`。
- 未连接实验硬件。
- 未修改任何真实实验配置。
