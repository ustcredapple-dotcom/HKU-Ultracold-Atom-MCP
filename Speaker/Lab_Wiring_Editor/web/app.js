import {
  CABLE_TYPES,
  canConnect,
  createConnection,
  createDevice,
  createEmptyProject,
  createPort,
  deleteConnection,
  deleteDevice,
  describeEndpoint,
  parseProjectJson,
  stringifyProject,
  summarizeProject,
  touchProject,
  validateProject
} from "../../../linker/Lab_Wiring_Connector/src/wiring_engine.js";

const $ = (selector) => document.querySelector(selector);
const svgNS = "http://www.w3.org/2000/svg";

const els = {
  fileStatus: $("#fileStatus"),
  newProjectBtn: $("#newProjectBtn"),
  openProjectBtn: $("#openProjectBtn"),
  saveProjectBtn: $("#saveProjectBtn"),
  saveAsProjectBtn: $("#saveAsProjectBtn"),
  loadExampleBtn: $("#loadExampleBtn"),
  validateBtn: $("#validateBtn"),
  addDeviceBtn: $("#addDeviceBtn"),
  projectTitleInput: $("#projectTitleInput"),
  projectDescriptionInput: $("#projectDescriptionInput"),
  searchInput: $("#searchInput"),
  deviceList: $("#deviceList"),
  canvasViewport: $("#canvasViewport"),
  world: $("#world"),
  connectionLayer: $("#connectionLayer"),
  deviceLayer: $("#deviceLayer"),
  interactionStatus: $("#interactionStatus"),
  zoomStatus: $("#zoomStatus"),
  zoomOutBtn: $("#zoomOutBtn"),
  zoomResetBtn: $("#zoomResetBtn"),
  zoomInBtn: $("#zoomInBtn"),
  inspector: $("#inspector"),
  summaryOutput: $("#summaryOutput"),
  copySummaryBtn: $("#copySummaryBtn"),
  deviceDialog: $("#deviceDialog"),
  deviceForm: $("#deviceForm"),
  connectionDialog: $("#connectionDialog"),
  connectionForm: $("#connectionForm"),
  connectionEndpoints: $("#connectionEndpoints"),
  cableTypeSelect: $("#cableTypeSelect"),
  fallbackFileInput: $("#fallbackFileInput"),
  toast: $("#toast")
};

const state = {
  project: createEmptyProject(),
  fileHandle: null,
  fileName: "",
  dirty: false,
  selectedDeviceId: null,
  selectedConnectionId: null,
  pendingPort: null,
  connectionDraft: null,
  search: "",
  zoom: 1,
  pan: { x: 20, y: 20 },
  drag: null,
  panDrag: null
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("visible"), 2600);
}

function markDirty() {
  state.dirty = true;
  touchProject(state.project);
  updateStatus();
}

function setProject(project, { fileName = "", fileHandle = null, dirty = false } = {}) {
  state.project = project;
  state.fileName = fileName;
  state.fileHandle = fileHandle;
  state.dirty = dirty;
  state.selectedDeviceId = null;
  state.selectedConnectionId = null;
  state.pendingPort = null;
  state.connectionDraft = null;
  state.zoom = project.canvas?.zoom || 1;
  state.pan = project.canvas?.pan || { x: 20, y: 20 };
  render();
}

function updateStatus() {
  const label = state.fileName || state.project.metadata.title || "Untitled lab wiring";
  els.fileStatus.textContent = `${state.dirty ? "Unsaved - " : ""}${label}`;
  els.zoomStatus.textContent = `${Math.round(state.zoom * 100)}%`;
  state.project.canvas = {
    ...(state.project.canvas || {}),
    zoom: state.zoom,
    pan: { ...state.pan }
  };
}

function applyWorldTransform() {
  els.world.style.transform = `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`;
  updateStatus();
}

function directionLabel(direction) {
  return {
    input: "Input",
    output: "Output",
    bidirectional: "Interface"
  }[direction] || "Port";
}

function deviceMatchesSearch(device) {
  const query = state.search.trim().toLowerCase();
  if (!query) return true;
  const haystack = [
    device.name,
    device.kind,
    device.location,
    device.notes,
    ...(device.ports || []).flatMap((port) => [
      port.name,
      port.direction,
      port.signalType,
      port.medium,
      port.connectorType,
      port.notes
    ])
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function splitPorts(device) {
  const ports = device.ports || [];
  return {
    inputs: ports.filter((port) => port.direction === "input"),
    outputs: ports.filter((port) => port.direction === "output"),
    interfaces: ports.filter((port) => port.direction === "bidirectional")
  };
}

function ensureDeviceSize(device) {
  const groups = splitPorts(device);
  const verticalRows = Math.max(groups.inputs.length, groups.outputs.length, 1);
  const interfaceRows = Math.ceil(groups.interfaces.length / 2);
  const requiredHeight = 78 + verticalRows * 31 + (groups.interfaces.length ? 22 + interfaceRows * 31 : 0);
  device.size = device.size || {};
  device.size.width = Math.max(Number(device.size.width || 240), 220);
  device.size.height = Math.max(Number(device.size.height || 150), requiredHeight);
}

function endpointPosition(endpoint) {
  const device = state.project.devices.find((item) => item.id === endpoint.deviceId);
  if (!device) return { x: 0, y: 0, side: "right" };
  ensureDeviceSize(device);
  const port = device.ports.find((item) => item.id === endpoint.portId);
  if (!port) return { x: device.position.x, y: device.position.y, side: "right" };
  const groups = splitPorts(device);
  const width = device.size.width;
  const height = device.size.height;
  const baseY = device.position.y + 76;

  if (port.direction === "output") {
    const index = Math.max(0, groups.outputs.findIndex((item) => item.id === port.id));
    return { x: device.position.x + width, y: baseY + index * 31 + 12, side: "right" };
  }
  if (port.direction === "input") {
    const index = Math.max(0, groups.inputs.findIndex((item) => item.id === port.id));
    return { x: device.position.x, y: baseY + index * 31 + 12, side: "left" };
  }
  const index = Math.max(0, groups.interfaces.findIndex((item) => item.id === port.id));
  const count = Math.max(1, groups.interfaces.length);
  const usable = Math.max(80, width - 60);
  return {
    x: device.position.x + 30 + ((index + 0.5) * usable) / count,
    y: device.position.y + height,
    side: "bottom"
  };
}

function makeConnectionPath(from, to) {
  const distance = Math.max(80, Math.abs(to.x - from.x) * 0.45);
  const c1x = from.side === "left" ? from.x - distance : from.side === "right" ? from.x + distance : from.x;
  const c1y = from.side === "bottom" ? from.y + distance * 0.55 : from.y;
  const c2x = to.side === "left" ? to.x - distance : to.side === "right" ? to.x + distance : to.x;
  const c2y = to.side === "bottom" ? to.y + distance * 0.55 : to.y;
  return `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`;
}

function portButtonHtml(port) {
  const pending = state.pendingPort?.portId === port.id ? "pending" : "";
  const dot = '<span class="port-dot"></span>';
  const label = `<span class="port-name">${escapeHtml(port.name)}</span>`;
  const inner = port.direction === "output" ? `${label}${dot}` : `${dot}${label}`;
  return `
    <button class="port-button ${port.direction} ${pending}" type="button"
      data-device-id="${escapeHtml(state.renderingDeviceId)}"
      data-port-id="${escapeHtml(port.id)}"
      title="${escapeHtml(port.name)} - ${escapeHtml(directionLabel(port.direction))}">
      ${inner}
    </button>
  `;
}

function renderDevice(device) {
  ensureDeviceSize(device);
  state.renderingDeviceId = device.id;
  const groups = splitPorts(device);
  const selected = state.selectedDeviceId === device.id ? "selected" : "";
  const filtered = deviceMatchesSearch(device) ? "" : "filtered-out";
  const html = `
    <article class="device-node ${selected} ${filtered}" data-device-id="${escapeHtml(device.id)}"
      style="left:${device.position.x}px; top:${device.position.y}px; width:${device.size.width}px; min-height:${device.size.height}px;">
      <header class="device-header" data-drag-handle="true">
        <strong>${escapeHtml(device.name)}</strong>
        <span>${escapeHtml(device.kind || "device")}${device.location ? ` / ${escapeHtml(device.location)}` : ""}</span>
      </header>
      <div class="port-columns">
        <div class="port-column">
          <div class="port-group-title">Inputs</div>
          ${groups.inputs.map(portButtonHtml).join("") || '<span class="hint">No inputs</span>'}
        </div>
        <div class="port-column">
          <div class="port-group-title">Outputs</div>
          ${groups.outputs.map(portButtonHtml).join("") || '<span class="hint">No outputs</span>'}
        </div>
      </div>
      ${groups.interfaces.length ? `<div class="interface-row">${groups.interfaces.map(portButtonHtml).join("")}</div>` : ""}
    </article>
  `;
  delete state.renderingDeviceId;
  return html;
}

function renderDeviceLayer() {
  els.deviceLayer.innerHTML = state.project.devices.map(renderDevice).join("");

  for (const node of els.deviceLayer.querySelectorAll(".device-node")) {
    node.addEventListener("click", (event) => {
      if (event.target.closest(".port-button")) return;
      selectDevice(node.dataset.deviceId);
    });
  }

  for (const header of els.deviceLayer.querySelectorAll(".device-header")) {
    header.addEventListener("pointerdown", startDeviceDrag);
  }

  for (const portButton of els.deviceLayer.querySelectorAll(".port-button")) {
    portButton.addEventListener("click", (event) => {
      event.stopPropagation();
      handlePortClick(portButton.dataset.deviceId, portButton.dataset.portId);
    });
  }
}

function renderConnections() {
  els.connectionLayer.replaceChildren();
  for (const connection of state.project.connections) {
    const from = endpointPosition(connection.from);
    const to = endpointPosition(connection.to);
    const pathData = makeConnectionPath(from, to);
    const cable = CABLE_TYPES.find((item) => item.id === connection.cableType) || CABLE_TYPES.at(-1);

    const hit = document.createElementNS(svgNS, "path");
    hit.setAttribute("d", pathData);
    hit.setAttribute("class", "connection-hit");
    hit.dataset.connectionId = connection.id;
    hit.addEventListener("click", () => selectConnection(connection.id));
    els.connectionLayer.append(hit);

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("class", `connection-path ${state.selectedConnectionId === connection.id ? "selected" : ""}`);
    path.setAttribute("stroke", connection.color || cable.color);
    path.setAttribute("stroke-width", cable.stroke || 3);
    if (cable.dash) path.setAttribute("stroke-dasharray", cable.dash);
    path.dataset.connectionId = connection.id;
    path.addEventListener("click", () => selectConnection(connection.id));
    els.connectionLayer.append(path);

    const label = connection.label || connection.name;
    if (label) {
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", String((from.x + to.x) / 2));
      text.setAttribute("y", String((from.y + to.y) / 2 - 8));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("class", "connection-label");
      text.textContent = label;
      text.addEventListener("click", () => selectConnection(connection.id));
      els.connectionLayer.append(text);
    }
  }
}

function renderDeviceList() {
  els.deviceList.innerHTML = state.project.devices
    .map((device) => {
      const active = state.selectedDeviceId === device.id ? "active" : "";
      const match = deviceMatchesSearch(device);
      return `
        <button type="button" class="device-list-item ${active}" data-device-id="${escapeHtml(device.id)}" ${match ? "" : "hidden"}>
          <strong>${escapeHtml(device.name)}</strong>
          <span>${escapeHtml(device.kind || "device")} / ${(device.ports || []).length} ports / ${escapeHtml(device.location || "no location")}</span>
        </button>
      `;
    })
    .join("");
  for (const item of els.deviceList.querySelectorAll(".device-list-item")) {
    item.addEventListener("click", () => {
      selectDevice(item.dataset.deviceId);
      centerOnDevice(item.dataset.deviceId);
    });
  }
}

function renderInspector() {
  const device = state.project.devices.find((item) => item.id === state.selectedDeviceId);
  const connection = state.project.connections.find((item) => item.id === state.selectedConnectionId);
  if (device) {
    els.inspector.innerHTML = deviceInspectorHtml(device);
    bindDeviceInspector(device);
    return;
  }
  if (connection) {
    els.inspector.innerHTML = connectionInspectorHtml(connection);
    bindConnectionInspector(connection);
    return;
  }
  els.inspector.innerHTML = `
    <div class="inspector-empty">
      Select a device, connection, or port. Device properties and named ports are edited here.
    </div>
  `;
}

function deviceInspectorHtml(device) {
  return `
    <label class="field"><span>Name</span><input data-field="name" value="${escapeHtml(device.name)}"></label>
    <div class="mini-grid">
      <label class="field"><span>Kind</span><input data-field="kind" value="${escapeHtml(device.kind || "")}"></label>
      <label class="field"><span>Location</span><input data-field="location" value="${escapeHtml(device.location || "")}"></label>
    </div>
    <div class="mini-grid">
      <label class="field"><span>Manufacturer</span><input data-field="manufacturer" value="${escapeHtml(device.manufacturer || "")}"></label>
      <label class="field"><span>Model</span><input data-field="model" value="${escapeHtml(device.model || "")}"></label>
    </div>
    <label class="field"><span>Notes</span><textarea data-field="notes" rows="3">${escapeHtml(device.notes || "")}</textarea></label>
    <div class="section-title"><h2>Ports</h2><button id="addPortBtn" type="button">Add Port</button></div>
    <div>
      ${(device.ports || []).map((port) => `
        <div class="port-editor-row" data-port-id="${escapeHtml(port.id)}">
          <input data-port-field="name" value="${escapeHtml(port.name)}" title="Port name">
          <select data-port-field="direction" title="Direction">
            <option value="input" ${port.direction === "input" ? "selected" : ""}>Input</option>
            <option value="output" ${port.direction === "output" ? "selected" : ""}>Output</option>
            <option value="bidirectional" ${port.direction === "bidirectional" ? "selected" : ""}>Interface</option>
          </select>
          <input data-port-field="signalType" value="${escapeHtml(port.signalType || "")}" placeholder="signal">
          <input data-port-field="connectorType" value="${escapeHtml(port.connectorType || "")}" placeholder="connector">
          <button class="danger" data-delete-port="${escapeHtml(port.id)}" type="button">Delete</button>
        </div>
      `).join("")}
    </div>
    <div class="inspector-actions">
      <button id="deleteDeviceBtn" class="danger" type="button">Delete Device</button>
    </div>
  `;
}

function bindDeviceInspector(device) {
  for (const input of els.inspector.querySelectorAll("[data-field]")) {
    input.addEventListener("change", () => {
      device[input.dataset.field] = input.value;
      markDirty();
      render();
    });
  }
  for (const row of els.inspector.querySelectorAll("[data-port-id]")) {
    const port = device.ports.find((item) => item.id === row.dataset.portId);
    if (!port) continue;
    for (const input of row.querySelectorAll("[data-port-field]")) {
      input.addEventListener("change", () => {
        port[input.dataset.portField] = input.value;
        markDirty();
        render();
      });
    }
  }
  for (const button of els.inspector.querySelectorAll("[data-delete-port]")) {
    button.addEventListener("click", () => {
      const portId = button.dataset.deletePort;
      device.ports = device.ports.filter((port) => port.id !== portId);
      state.project.connections = state.project.connections.filter((connection) => {
        return !(connection.from.deviceId === device.id && connection.from.portId === portId)
          && !(connection.to.deviceId === device.id && connection.to.portId === portId);
      });
      markDirty();
      render();
    });
  }
  $("#addPortBtn")?.addEventListener("click", () => {
    device.ports.push(createPort({ name: "New port", direction: "bidirectional" }));
    markDirty();
    render();
  });
  $("#deleteDeviceBtn")?.addEventListener("click", () => {
    deleteDevice(state.project, device.id);
    state.selectedDeviceId = null;
    markDirty();
    render();
  });
}

function connectionInspectorHtml(connection) {
  const from = describeEndpoint(state.project, connection.from);
  const to = describeEndpoint(state.project, connection.to);
  return `
    <div class="connection-endpoints">
      <div><strong>From:</strong> ${escapeHtml(from.deviceName)} / ${escapeHtml(from.portName)}</div>
      <div><strong>To:</strong> ${escapeHtml(to.deviceName)} / ${escapeHtml(to.portName)}</div>
    </div>
    <label class="field"><span>Name</span><input data-field="name" value="${escapeHtml(connection.name || "")}"></label>
    <label class="field"><span>Label</span><input data-field="label" value="${escapeHtml(connection.label || "")}"></label>
    <label class="field"><span>Line type</span><select data-field="cableType">
      ${CABLE_TYPES.map((type) => `<option value="${type.id}" ${connection.cableType === type.id ? "selected" : ""}>${escapeHtml(type.name)}</option>`).join("")}
    </select></label>
    <label class="field"><span>Signal type</span><input data-field="signalType" value="${escapeHtml(connection.signalType || "")}"></label>
    <label class="field"><span>Notes</span><textarea data-field="notes" rows="4">${escapeHtml(connection.notes || "")}</textarea></label>
    <div class="inspector-actions">
      <button id="deleteConnectionBtn" class="danger" type="button">Delete Connection</button>
    </div>
  `;
}

function bindConnectionInspector(connection) {
  for (const input of els.inspector.querySelectorAll("[data-field]")) {
    input.addEventListener("change", () => {
      connection[input.dataset.field] = input.value;
      if (input.dataset.field === "cableType") {
        const cable = CABLE_TYPES.find((item) => item.id === input.value);
        if (cable) connection.color = cable.color;
      }
      markDirty();
      render();
    });
  }
  $("#deleteConnectionBtn")?.addEventListener("click", () => {
    deleteConnection(state.project, connection.id);
    state.selectedConnectionId = null;
    markDirty();
    render();
  });
}

function renderSummary() {
  const validation = validateProject(state.project);
  const header = validation.ok
    ? "Validation: OK"
    : `Validation: ${validation.errors.length} error(s)`;
  const warnings = validation.warnings.length ? `\nWarnings:\n- ${validation.warnings.join("\n- ")}` : "";
  const errors = validation.errors.length ? `\nErrors:\n- ${validation.errors.join("\n- ")}` : "";
  els.summaryOutput.value = `${header}${errors}${warnings}\n\n${summarizeProject(state.project)}`;
}

function render() {
  els.projectTitleInput.value = state.project.metadata.title || "";
  els.projectDescriptionInput.value = state.project.metadata.description || "";
  renderConnections();
  renderDeviceLayer();
  renderDeviceList();
  renderInspector();
  renderSummary();
  applyWorldTransform();
}

function selectDevice(deviceId) {
  state.selectedDeviceId = deviceId;
  state.selectedConnectionId = null;
  render();
}

function selectConnection(connectionId) {
  state.selectedConnectionId = connectionId;
  state.selectedDeviceId = null;
  state.pendingPort = null;
  els.interactionStatus.textContent = "Connection selected.";
  render();
}

function handlePortClick(deviceId, portId) {
  const endpoint = { deviceId, portId };
  state.selectedDeviceId = deviceId;
  state.selectedConnectionId = null;
  if (!state.pendingPort) {
    state.pendingPort = endpoint;
    const info = describeEndpoint(state.project, endpoint);
    els.interactionStatus.textContent = `Selected ${info.deviceName} / ${info.portName}. Click another port to connect.`;
    render();
    return;
  }
  const first = state.pendingPort;
  if (first.deviceId === endpoint.deviceId && first.portId === endpoint.portId) {
    state.pendingPort = null;
    els.interactionStatus.textContent = "Port selection cleared.";
    render();
    return;
  }
  const check = canConnect(state.project, first, endpoint);
  if (!check.ok) {
    showToast(check.errors.join(" "));
    state.pendingPort = null;
    render();
    return;
  }
  openConnectionDialog(first, endpoint);
}

function openConnectionDialog(from, to) {
  const fromInfo = describeEndpoint(state.project, from);
  const toInfo = describeEndpoint(state.project, to);
  state.connectionDraft = { from, to };
  els.connectionEndpoints.innerHTML = `
    <div><strong>From:</strong> ${escapeHtml(fromInfo.deviceName)} / ${escapeHtml(fromInfo.portName)}</div>
    <div><strong>To:</strong> ${escapeHtml(toInfo.deviceName)} / ${escapeHtml(toInfo.portName)}</div>
  `;
  els.cableTypeSelect.innerHTML = CABLE_TYPES
    .map((type) => `<option value="${type.id}">${escapeHtml(type.name)}</option>`)
    .join("");
  els.connectionForm.reset();
  els.cableTypeSelect.value = "bnc";
  els.connectionDialog.showModal();
}

function screenToWorld(clientX, clientY) {
  const rect = els.canvasViewport.getBoundingClientRect();
  return {
    x: (clientX - rect.left - state.pan.x) / state.zoom,
    y: (clientY - rect.top - state.pan.y) / state.zoom
  };
}

function startDeviceDrag(event) {
  const node = event.currentTarget.closest(".device-node");
  const device = state.project.devices.find((item) => item.id === node.dataset.deviceId);
  if (!device) return;
  event.preventDefault();
  event.stopPropagation();
  const point = screenToWorld(event.clientX, event.clientY);
  state.drag = {
    deviceId: device.id,
    offsetX: point.x - device.position.x,
    offsetY: point.y - device.position.y
  };
  selectDevice(device.id);
}

function startPan(event) {
  if (event.button !== 0) return;
  if (event.target.closest(".device-node") || event.target.closest(".connection-hit") || event.target.closest(".connection-path")) return;
  state.panDrag = {
    x: event.clientX,
    y: event.clientY,
    panX: state.pan.x,
    panY: state.pan.y
  };
  els.canvasViewport.classList.add("dragging");
}

function onPointerMove(event) {
  if (state.drag) {
    const device = state.project.devices.find((item) => item.id === state.drag.deviceId);
    if (!device) return;
    const point = screenToWorld(event.clientX, event.clientY);
    device.position.x = Math.max(0, Math.round(point.x - state.drag.offsetX));
    device.position.y = Math.max(0, Math.round(point.y - state.drag.offsetY));
    renderConnections();
    const node = els.deviceLayer.querySelector(`[data-device-id="${CSS.escape(device.id)}"]`);
    if (node) {
      node.style.left = `${device.position.x}px`;
      node.style.top = `${device.position.y}px`;
    }
    state.dirty = true;
    updateStatus();
  }
  if (state.panDrag) {
    state.pan.x = state.panDrag.panX + event.clientX - state.panDrag.x;
    state.pan.y = state.panDrag.panY + event.clientY - state.panDrag.y;
    applyWorldTransform();
  }
}

function onPointerUp() {
  if (state.drag || state.panDrag) {
    markDirty();
  }
  state.drag = null;
  state.panDrag = null;
  els.canvasViewport.classList.remove("dragging");
}

function setZoom(nextZoom) {
  state.zoom = Math.min(2.5, Math.max(0.28, nextZoom));
  applyWorldTransform();
}

function centerOnDevice(deviceId) {
  const device = state.project.devices.find((item) => item.id === deviceId);
  if (!device) return;
  const rect = els.canvasViewport.getBoundingClientRect();
  state.pan.x = rect.width / 2 - (device.position.x + (device.size?.width || 240) / 2) * state.zoom;
  state.pan.y = rect.height / 2 - (device.position.y + (device.size?.height || 150) / 2) * state.zoom;
  applyWorldTransform();
}

function downloadProject() {
  const blob = new Blob([stringifyProject(state.project)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = state.fileName || `${state.project.metadata.title || "lab_wiring"}.labwire.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  state.dirty = false;
  updateStatus();
}

async function openProject() {
  if ("showOpenFilePicker" in window) {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: "Lab wiring project", accept: { "application/json": [".json"] } }],
      multiple: false
    });
    const file = await handle.getFile();
    const text = await file.text();
    setProject(parseProjectJson(text), { fileName: file.name, fileHandle: handle, dirty: false });
    showToast(`Opened ${file.name}`);
    return;
  }
  els.fallbackFileInput.click();
}

async function saveProject() {
  if (state.fileHandle?.createWritable) {
    const writable = await state.fileHandle.createWritable();
    await writable.write(stringifyProject(state.project));
    await writable.close();
    state.dirty = false;
    updateStatus();
    showToast(`Saved ${state.fileName}`);
    return;
  }
  if ("showSaveFilePicker" in window) {
    await saveProjectAs();
    return;
  }
  downloadProject();
}

async function saveProjectAs() {
  if ("showSaveFilePicker" in window) {
    const suggestedName = state.fileName || `${state.project.metadata.title || "lab_wiring"}.labwire.json`;
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{ description: "Lab wiring project", accept: { "application/json": [".json"] } }]
    });
    state.fileHandle = handle;
    state.fileName = handle.name;
    await saveProject();
    return;
  }
  downloadProject();
}

async function loadExample() {
  const response = await fetch("../../../linker/Lab_Wiring_Connector/projects/example_lab_wiring.labwire.json");
  if (!response.ok) throw new Error(`Failed to load example: ${response.status}`);
  const project = parseProjectJson(await response.text());
  setProject(project, { fileName: "example_lab_wiring.labwire.json", fileHandle: null, dirty: true });
  showToast("Example loaded. Use Save As to keep a copy.");
}

function validateAndReport() {
  const result = validateProject(state.project);
  if (result.ok) {
    showToast(result.warnings.length ? `Valid with ${result.warnings.length} warning(s).` : "Project file is valid.");
  } else {
    showToast(`Validation failed: ${result.errors[0]}`);
  }
  renderSummary();
}

function bindEvents() {
  els.newProjectBtn.addEventListener("click", () => {
    setProject(createEmptyProject(), { dirty: true });
    showToast("New project created.");
  });
  els.openProjectBtn.addEventListener("click", () => openProject().catch((error) => {
    if (error.name !== "AbortError") showToast(error.message);
  }));
  els.saveProjectBtn.addEventListener("click", () => saveProject().catch((error) => {
    if (error.name !== "AbortError") showToast(error.message);
  }));
  els.saveAsProjectBtn.addEventListener("click", () => saveProjectAs().catch((error) => {
    if (error.name !== "AbortError") showToast(error.message);
  }));
  els.loadExampleBtn.addEventListener("click", () => loadExample().catch((error) => showToast(error.message)));
  els.validateBtn.addEventListener("click", validateAndReport);
  els.addDeviceBtn.addEventListener("click", () => {
    els.deviceForm.reset();
    els.deviceDialog.showModal();
  });
  els.projectTitleInput.addEventListener("change", () => {
    state.project.metadata.title = els.projectTitleInput.value.trim() || "Untitled lab wiring";
    markDirty();
    render();
  });
  els.projectDescriptionInput.addEventListener("change", () => {
    state.project.metadata.description = els.projectDescriptionInput.value;
    markDirty();
    renderSummary();
  });
  els.searchInput.addEventListener("input", () => {
    state.search = els.searchInput.value;
    renderDeviceList();
    renderDeviceLayer();
  });
  els.zoomOutBtn.addEventListener("click", () => setZoom(state.zoom / 1.16));
  els.zoomResetBtn.addEventListener("click", () => setZoom(1));
  els.zoomInBtn.addEventListener("click", () => setZoom(state.zoom * 1.16));
  els.canvasViewport.addEventListener("pointerdown", startPan);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  els.copySummaryBtn.addEventListener("click", async () => {
    await navigator.clipboard.writeText(els.summaryOutput.value);
    showToast("AI summary copied.");
  });
  els.fallbackFileInput.addEventListener("change", async () => {
    const [file] = els.fallbackFileInput.files;
    if (!file) return;
    setProject(parseProjectJson(await file.text()), { fileName: file.name, fileHandle: null, dirty: false });
    els.fallbackFileInput.value = "";
  });

  els.deviceForm.addEventListener("submit", (event) => {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    const form = new FormData(els.deviceForm);
    const rect = els.canvasViewport.getBoundingClientRect();
    const center = screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const device = createDevice(state.project, {
      name: form.get("name"),
      kind: form.get("kind"),
      genericCount: Number(form.get("genericCount")),
      inputCount: Number(form.get("inputCount")),
      outputCount: Number(form.get("outputCount")),
      location: form.get("location"),
      notes: form.get("notes"),
      x: Math.max(20, Math.round(center.x - 120)),
      y: Math.max(20, Math.round(center.y - 80))
    });
    state.selectedDeviceId = device.id;
    state.selectedConnectionId = null;
    markDirty();
    els.deviceDialog.close();
    render();
  });

  els.connectionForm.addEventListener("submit", (event) => {
    if (event.submitter?.value === "cancel") {
      state.pendingPort = null;
      state.connectionDraft = null;
      render();
      return;
    }
    event.preventDefault();
    const form = new FormData(els.connectionForm);
    try {
      const cable = CABLE_TYPES.find((item) => item.id === form.get("cableType"));
      const connection = createConnection(state.project, {
        from: state.connectionDraft.from,
        to: state.connectionDraft.to,
        cableType: form.get("cableType"),
        label: form.get("label"),
        signalType: form.get("signalType"),
        notes: form.get("notes"),
        color: cable?.color
      });
      state.selectedConnectionId = connection.id;
      state.selectedDeviceId = null;
      state.pendingPort = null;
      state.connectionDraft = null;
      markDirty();
      els.connectionDialog.close();
      render();
      showToast("Connection created.");
    } catch (error) {
      showToast(error.message);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      state.pendingPort = null;
      state.connectionDraft = null;
      render();
    }
    if (event.key === "Delete" && state.selectedConnectionId) {
      deleteConnection(state.project, state.selectedConnectionId);
      state.selectedConnectionId = null;
      markDirty();
      render();
    }
  });
}

bindEvents();
render();
