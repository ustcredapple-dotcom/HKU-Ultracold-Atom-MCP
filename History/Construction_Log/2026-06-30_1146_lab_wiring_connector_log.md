# Construction Log: Lab Wiring Connector 与网页编辑器

时间: 2026-06-30 11:46:55 +08:00

## 操作目标

构建一个实验室接线连接器，让用户可以通过网页创建仪器/器件方块、设置端口、命名接口、点击两个接口并选择线型连接，最终输出 AI 可读的工程文件。

## 新增 linker 引擎

新增目录:

```text
linker/Lab_Wiring_Connector
```

新增文件:

```text
linker/Lab_Wiring_Connector/README.md
linker/Lab_Wiring_Connector/schema/lab_wiring_project.schema.json
linker/Lab_Wiring_Connector/src/wiring_engine.js
linker/Lab_Wiring_Connector/projects/example_lab_wiring.labwire.json
```

引擎能力:

- 创建空工程。
- 创建设备和默认端口。
- 创建连接。
- 校验工程文件。
- 输出 AI 可读摘要。
- 定义线型: BNC、SMA/RF、TTL trigger、Optical fiber、Free-space beam、Ethernet、USB、Power、Custom。

## 新增 Speaker 网页编辑器

新增目录:

```text
Speaker/Lab_Wiring_Editor
```

新增文件:

```text
Speaker/Lab_Wiring_Editor/README.md
Speaker/Lab_Wiring_Editor/launch_lab_wiring_editor.bat
Speaker/Lab_Wiring_Editor/web/index.html
Speaker/Lab_Wiring_Editor/web/styles.css
Speaker/Lab_Wiring_Editor/web/app.js
```

网页功能:

- 新建工程。
- 打开 `.labwire.json`。
- 保存当前工程文件。
- 另存为新工程文件。
- 加载示例工程。
- 新增器件方块。
- 设置接口、输入、输出数量。
- 编辑器件信息和端口名称。
- 点击两个端口后选择线型并创建连接。
- 拖动器件。
- 画布平移和缩放。
- 搜索设备/端口/信号。
- 校验工程。
- 输出 AI 摘要。

## 文档更新

更新:

```text
README.md
linker/README.md
Speaker/README.md
Teacher/Architecture/Project_Architecture.md
```

新增:

```text
Teacher/Subprojects/Lab_Wiring_Connector.md
History/Chat_History/2026-06-30_1146_lab_wiring_connector_request.md
History/Construction_Log/2026-06-30_1146_lab_wiring_connector_log.md
```

## 验证记录

已执行:

```powershell
python -m json.tool linker/Lab_Wiring_Connector/schema/lab_wiring_project.schema.json
python -m json.tool linker/Lab_Wiring_Connector/projects/example_lab_wiring.labwire.json
```

结果: JSON 校验通过。

系统 `node.exe` 权限拒绝，因此改用 Codex bundled Node:

```powershell
C:\Users\ustcr\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check linker/Lab_Wiring_Connector/src/wiring_engine.js
C:\Users\ustcr\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check Speaker/Lab_Wiring_Editor/web/app.js
```

结果: JS 语法检查通过。

已启动本地服务:

```text
http://127.0.0.1:8765/Speaker/Lab_Wiring_Editor/web/index.html
```

浏览器验证结果:

- 页面标题正常: `Lab Wiring Editor`。
- 无控制台 error/warn。
- 首屏存在画布、Add/Open/Save 按钮。
- 新增测试设备成功，生成 1 个设备和 3 个端口。
- 示例工程加载成功，显示 2 个设备、2 个端口、1 条连接。
- AI 摘要显示 `Validation: OK`。
- 点击两个端口后连接弹窗出现。
- 选择 TTL 线型并创建连接成功，工程中连接数增加到 2。

## 未执行事项

- 未读取 `Key`。
- 未连接任何实验硬件。
- 未从工程文件生成真实硬件动作。

## 后续建议

1. 建立常用器件模板库。
2. 建立实验室真实固定 IP、物理位置、端口命名规范。
3. 给 connection 增加安全规则提示，例如 RF、laser、power、output-to-output。
4. 增加导出 Markdown/Mermaid 拓扑报告功能，让 `Speaker` 更好地向人解释工程文件。
