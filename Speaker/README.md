# Speaker

`Speaker` 是未来的人类可读翻译层，用来把工程文件、中间文件、运行日志和仪器输出整理成人能快速理解的格式。

可能的后续能力:

- 把 ARTIQ 输出和错误日志整理成排错报告。
- 把 Moku、示波器或数据文件转换成简洁图表和说明。
- 把 server 状态、实验参数和运行结果生成日报或实验记录。

当前已建立的交互工具:

```text
Lab_Wiring_Editor
```

这是实验室接线编辑器。它调用 `linker/Lab_Wiring_Connector` 引擎，读写 `.labwire.json` 工程文件。
