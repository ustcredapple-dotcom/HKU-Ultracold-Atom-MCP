# Chat History: Lab Wiring Editor 中英双语模式

时间: 2026-06-30 12:32:54 +08:00

## 用户需求

用户要求:

```text
提供中英双语模式
```

上下文是上一轮已完成的实验室接线连接器:

```text
linker/Lab_Wiring_Connector
Speaker/Lab_Wiring_Editor
```

## 设计理解

需要让可交互网页支持中文和英文两种语言。语言切换应覆盖主要交互界面，而不是只翻译少数按钮。

实现边界:

- 双语功能属于 `Speaker/Lab_Wiring_Editor` 的人机交互层。
- `linker/Lab_Wiring_Connector` 的工程文件格式不因界面语言而改变。
- 已有工程文件里的器件名、端口名、备注不自动翻译，因为这些内容代表用户实际实验室记录。

## 实现方向

- 顶部加入 `中文 / EN` 切换控件。
- 语言偏好写入浏览器 `localStorage`。
- UI 文案、弹窗、toast、校验标题、AI 摘要和默认端口名跟随语言。
- 浏览器验证后保持页面为中文显示，方便用户继续使用。
