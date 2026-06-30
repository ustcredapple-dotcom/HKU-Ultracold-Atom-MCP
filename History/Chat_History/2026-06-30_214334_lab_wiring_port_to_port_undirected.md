# Chat History - Lab Wiring Port-To-Port Undirected Connections

Date: 2026-06-30

## User Requests

The user pointed out that the automatic wiring path was still visually misleading:

1. A line from `Moku_Go_2` to `Artiq.DDS_ch0` was logically connected to the RF port, but because the device block covered part of the line, it looked like the line connected to `输入 1`.
2. The user asked whether the editor could draw channel-to-channel / port-to-port instead of block-to-block.
3. The user also noted that arrows and `from -> to` wording imply direction, but the physical wiring is only a connection between two endpoints.

## Implemented Decisions

- Connection endpoints now prefer the actual DOM position of the visible `.port-dot` circle.
- Rendering order now draws device nodes before connections so the connection layer can read the real port geometry.
- Dragging a device updates the device DOM position before recomputing connection paths.
- The fallback estimated endpoint logic remains for cases where the DOM is not available.
- UI endpoint labels changed from `From` / `To` and `起点` / `终点` to `Port A` / `Port B` and `接口 A` / `接口 B`.
- AI summaries now use `--` instead of `->`.
- The underlying JSON still stores `from` and `to` fields for schema compatibility, but these fields should be interpreted as endpoint A/B rather than physical signal direction.

## Verification Note

Browser verification loaded the current actual lab wiring and measured the RF path ending at `Artiq.DDS_ch0`. The path endpoint was within about `0.00035` canvas units of the `DDS_ch0` port-dot center, confirming the rendered line is anchored to that exact port.
