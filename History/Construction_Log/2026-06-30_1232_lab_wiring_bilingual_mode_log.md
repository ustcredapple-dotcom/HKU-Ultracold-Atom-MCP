# Construction Log: Lab Wiring Editor 中英双语模式

时间: 2026-06-30 12:32:54 +08:00

## 操作目标

为实验室接线网页编辑器提供中英双语模式。

## 修改文件

```text
Speaker/Lab_Wiring_Editor/web/index.html
Speaker/Lab_Wiring_Editor/web/styles.css
Speaker/Lab_Wiring_Editor/web/app.js
Speaker/Lab_Wiring_Editor/README.md
Teacher/Subprojects/Lab_Wiring_Connector.md
History/Chat_History/2026-06-30_1232_lab_wiring_bilingual_mode.md
History/Construction_Log/2026-06-30_1232_lab_wiring_bilingual_mode_log.md
```

## 实现内容

- 在顶部加入 `中文 / EN` 语言切换控件。
- 语言偏好保存到浏览器 `localStorage`。
- 界面标题、按钮、表单标签、弹窗、toast、端口默认名、校验标题和 AI 摘要支持中英双语。
- 新增器件时，默认端口名会跟随当前语言，例如 `Input 1` 或 `输入 1`。
- 已有工程文件内容不自动翻译，避免破坏实验室真实记录。
- 调整顶栏布局，避免语言按钮在窄视口下被主画布覆盖。

## 验证记录

执行:

```powershell
C:\Users\ustcr\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check Speaker/Lab_Wiring_Editor/web/app.js
```

结果: JS 语法检查通过。

浏览器验证:

- 页面可加载，无 console error/warn。
- 中文界面显示 `实验室接线编辑器`、`新建`、`新增`。
- 英文界面显示 `Lab Wiring Editor`、`New`、`Add`。
- `中文 / EN` active 状态正确切换。
- AI 摘要可在中文和英文之间切换标题与结构文本。
- 英文模式新增器件成功，默认端口为 `Input 1`、`Input 2`、`Output 1`、`Output 2`。
- 页面最终切回中文显示。

## 未执行事项

- 未读取 `Key`。
- 未连接实验硬件。
- 未改变 `.labwire.json` schema。
