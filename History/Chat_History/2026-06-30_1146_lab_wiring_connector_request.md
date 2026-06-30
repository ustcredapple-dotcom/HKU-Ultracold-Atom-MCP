# Chat History: 实验室接线连接器

时间: 2026-06-30 11:46:55 +08:00

## 用户需求

用户要求在:

```text
Z:\Wang Junjie\HKU_Ultracold_Agent_Architect\linker
```

构建一个实验室接线连接器。打开后应出现网页，用户可以:

1. 插入新的方块，方块是实际仪器或器件的抽象。
2. 设置方块上有多少接口、多少输入、多少输出。
3. 给每个接口命名。
4. 点击两个接口，选择一种线把它们连起来。

网页需要产生工程文件，工程文件要能被 AI 读取理解，因为目标是教会 AI 实验室如何接线。用户也要能通过工程文件重新打开上一版接线并修改。

保存逻辑要求类似 Word:

- 保存: 直接修改当前工程文件。
- 另存为: 保存为新的工程文件。

画面要求美观，并考虑未来实验室器件会非常非常多。工程文件也要写得清晰。

## 架构要求

用户明确补充:

```text
linker是HKU_Ultracold_Agent_Architect与现实链接的引擎。可交互部分请放在speaker里面，speaker调用这个引擎，输入输出工程文件这样
```

因此设计边界为:

- `linker/Lab_Wiring_Connector`: 数据格式、schema、校验、AI 摘要。
- `Speaker/Lab_Wiring_Editor`: 网页交互编辑器，调用 linker 引擎，读写 `.labwire.json` 工程文件。

## 实现方向

使用纯 HTML/CSS/JavaScript 和浏览器 File System Access API。需要通过本地 `localhost` 服务打开页面，以便:

- 加载 linker 中的 ES module。
- 使用浏览器的 `Open`、`Save`、`Save As` 文件句柄能力。

若浏览器不支持直接保存，则降级为下载 JSON 文件。
