import {
  CABLE_TYPES,
  canConnect,
  createConnection,
  createDevice,
  createEmptyProject,
  createPort,
  createPortType,
  deleteConnection,
  deleteDevice,
  describeEndpoint,
  getPortType,
  parseProjectJson,
  summarizeProject,
  touchProject,
  validateProject
} from "../../../linker/Lab_Wiring_Connector/src/wiring_engine.js";

const $ = (selector) => document.querySelector(selector);
const svgNS = "http://www.w3.org/2000/svg";
const LANGUAGE_STORAGE_KEY = "hku.labWiringEditor.language";
const BACKUP_ENDPOINT = "/api/lab-wiring/backups";
const DEFAULT_PROJECT_ENDPOINT = "/api/lab-wiring/projects/default";
const ACTUAL_LAB_ENDPOINT = "/api/lab-wiring/actual";
const AUTO_SAVE_INTERVAL_MS = 60_000;

const translations = {
  en: {
    appTitle: "Lab Wiring Editor",
    untitled: "Untitled lab wiring",
    unsavedPrefix: "Unsaved - ",
    projectActions: "Project actions",
    new: "New",
    newTitle: "New project",
    open: "Open",
    openTitle: "Open .labwire.json",
    save: "Save",
    saveTitle: "Save current project. Unsaved projects go to the default project folder.",
    saveAs: "Save As",
    saveAsTitle: "Save as new project",
    loadActual: "Load Lab",
    loadActualTitle: "Read the actual lab wiring state",
    publishActual: "Update Lab",
    publishActualTitle: "Update the actual lab wiring state with this project",
    rollbackActual: "Rollback",
    rollbackActualTitle: "Rollback actual lab wiring to the selected version",
    actualVersionPlaceholder: "Lab versions",
    actualLoaded: "Actual lab wiring loaded: {file}",
    actualUpdated: "Actual lab wiring updated: {file}",
    actualRolledBack: "Actual lab wiring rolled back to {version}",
    actualUnavailable: "Actual lab wiring library is unavailable. Start the Lab Wiring Editor launcher.",
    noActualVersions: "No actual lab wiring versions yet.",
    rollbackConfirm: "Rollback actual lab wiring to selected version?",
    example: "Example",
    exampleTitle: "Load example",
    validate: "Validate",
    validateTitle: "Validate project",
    arrange: "Arrange",
    arrangeTitle: "Auto arrange devices",
    autoSaveOn: "Auto Save: On",
    autoSaveOff: "Auto Save: Off",
    autoSaveTitle: "Toggle automatic save and backup",
    project: "Project",
    title: "Title",
    description: "Description",
    devices: "Devices",
    add: "Add",
    search: "Search",
    searchPlaceholder: "Device, port, signal...",
    canvas: "Canvas",
    canvasHint: "Drag devices by their header. Drag empty canvas to pan.",
    wiringCanvas: "Wiring canvas",
    interactionDefault: "Click a port, then click another port to create a connection.",
    inspector: "Inspector",
    aiView: "AI View",
    summaryView: "Summary",
    codeView: "Code",
    applyCode: "Apply",
    applyCodeTitle: "Apply JSON code to the graph",
    copy: "Copy",
    addDeviceBlock: "Add Device Block",
    close: "Close",
    name: "Name",
    kind: "Kind",
    instrument: "Instrument",
    controlSystem: "Control system",
    laser: "Laser",
    opticalComponent: "Optical component",
    electronics: "Electronics",
    vacuum: "Vacuum component",
    computer: "Computer/server",
    custom: "Custom",
    interfaces: "Interfaces",
    inputs: "Inputs",
    outputs: "Outputs",
    location: "Location",
    locationPlaceholder: "rack, optical table, shelf...",
    notes: "Notes",
    cancel: "Cancel",
    create: "Create",
    createConnection: "Create Connection",
    lineType: "Line type",
    label: "Label",
    connectionLabelPlaceholder: "TTL trigger, RF, 780 nm beam...",
    signalType: "Signal type",
    signalPlaceholder: "TTL, analog, optical, RF...",
    connect: "Connect",
    noInputs: "No inputs",
    noOutputs: "No outputs",
    noLocation: "no location",
    portsTitle: "Ports",
    ports: "ports",
    port: "Port",
    input: "Input",
    output: "Output",
    interface: "Interface",
    manufacturer: "Manufacturer",
    model: "Model",
    addPort: "Add Port",
    addPortType: "Add Type",
    portType: "Port type",
    addPortTypeTitle: "Add Port Type",
    color: "Color",
    customPortTypePrompt: "Name of the new port type:",
    customPortTypeCreated: "Port type added: {name}",
    customPortTypeEmpty: "Port type name cannot be empty.",
    autoArranged: "Devices arranged.",
    delete: "Delete",
    deleteDevice: "Delete Device",
    deleteConnection: "Delete Connection",
    inspectorEmpty: "Select a device, connection, or port. Device properties and named ports are edited here.",
    portNameTitle: "Port name",
    directionTitle: "Direction",
    signalPlaceholderShort: "signal",
    connectorPlaceholder: "connector",
    from: "From",
    to: "To",
    connectionSelected: "Connection selected.",
    selectedPort: "Selected {device} / {port}. Click another port to connect.",
    portSelectionCleared: "Port selection cleared.",
    invalidConnection: "Invalid connection. Check port direction and endpoints.",
    openedFile: "Opened {file}",
    savedFile: "Saved {file}",
    exampleLoaded: "Example loaded. Use Save As to keep a copy.",
    failedLoadExample: "Failed to load example: {status}",
    validProject: "Project file is valid.",
    validWithWarnings: "Valid with {count} warning(s).",
    validationFailed: "Validation failed: {message}",
    backupSaved: "Backup saved: {file}",
    backupUnavailable: "Backup server is unavailable. Start the Lab Wiring Editor launcher for backups.",
    savedDefaultFile: "Saved to default folder: {file}",
    defaultSaveUnavailable: "Default save is unavailable. Falling back to Save As.",
    autosavedFile: "Autosaved {file}",
    autosavedDraft: "Autosaved draft backup.",
    codeApplied: "Code applied to graph.",
    codeApplyFailed: "Cannot apply code: {message}",
    newProjectCreated: "New project created.",
    viewCopied: "View copied.",
    connectionCreated: "Connection created.",
    filePickerDesc: "Lab wiring project",
    newInstrument: "New instrument",
    newPort: "New port",
    defaultInterface: "Interface {index}",
    defaultInput: "Input {index}",
    defaultOutput: "Output {index}",
    validationOk: "Validation: OK",
    validationErrors: "Validation: {count} error(s)",
    warnings: "Warnings",
    errors: "Errors",
    summaryProject: "Project",
    summaryDescription: "Description",
    summaryDevices: "Devices",
    summaryConnections: "Connections",
    summaryDeviceLine: "- {name} ({kind}, id={id})",
    summaryPortLine: "  - {name} [{details}]",
    summaryConnectionLine: "- {label}: {fromDevice}.{fromPort} -> {toDevice}.{toPort} ({cable})",
    portDetailsFallback: "port",
    portTypeTtl: "TTL",
    portTypeDac: "DAC",
    portTypeAdc: "ADC",
    portTypeRf: "RF",
    portTypeAnalog: "Analog",
    portTypeDigital: "Digital",
    portTypeLaser: "Laser",
    portTypeCameraImage: "Camera image",
    portTypeOptical: "Optical",
    portTypeEthernet: "Ethernet",
    portTypeUsb: "USB",
    portTypePower: "Power",
    portTypeCustom: "Custom",
    cableBnc: "BNC",
    cableSma: "SMA/RF",
    cableTtl: "TTL trigger",
    cableFiber: "Optical fiber",
    cableFreeSpace: "Free-space beam",
    cableEthernet: "Ethernet",
    cableUsb: "USB",
    cablePower: "Power",
    cableCustom: "Custom"
  },
  zh: {
    appTitle: "实验室接线编辑器",
    untitled: "未命名接线工程",
    unsavedPrefix: "未保存 - ",
    projectActions: "工程操作",
    new: "新建",
    newTitle: "新建工程",
    open: "打开",
    openTitle: "打开 .labwire.json",
    save: "保存",
    saveTitle: "保存当前工程。未另存的工程会保存到默认工程文件夹。",
    saveAs: "另存为",
    saveAsTitle: "另存为新工程",
    loadActual: "读取现状",
    loadActualTitle: "读取实验室当前连线情况",
    publishActual: "更新现状",
    publishActualTitle: "用当前工程更新实验室当前连线情况",
    rollbackActual: "回滚",
    rollbackActualTitle: "把实验室当前连线回滚到所选版本",
    actualVersionPlaceholder: "现状版本",
    actualLoaded: "已读取实验室当前连线: {file}",
    actualUpdated: "已更新实验室当前连线: {file}",
    actualRolledBack: "实验室当前连线已回滚到 {version}",
    actualUnavailable: "实验室当前连线版本库不可用。请用 Lab Wiring Editor 启动脚本打开网页。",
    noActualVersions: "还没有实验室当前连线版本。",
    rollbackConfirm: "确认把实验室当前连线回滚到所选版本？",
    example: "示例",
    exampleTitle: "加载示例",
    validate: "校验",
    validateTitle: "校验工程",
    arrange: "整理",
    arrangeTitle: "自动整理器件位置",
    autoSaveOn: "自动保存：开",
    autoSaveOff: "自动保存：关",
    autoSaveTitle: "切换自动保存与备份",
    project: "工程",
    title: "标题",
    description: "描述",
    devices: "器件",
    add: "新增",
    search: "搜索",
    searchPlaceholder: "器件、接口、信号...",
    canvas: "画布",
    canvasHint: "拖动器件标题移动方块。拖动画布空白处平移。",
    wiringCanvas: "接线画布",
    interactionDefault: "点击一个接口，再点击另一个接口来创建连接。",
    inspector: "属性",
    aiView: "AI 视图",
    summaryView: "摘要",
    codeView: "代码",
    applyCode: "应用",
    applyCodeTitle: "把 JSON 代码应用到图",
    copy: "复制",
    addDeviceBlock: "新增器件方块",
    close: "关闭",
    name: "名称",
    kind: "类型",
    instrument: "仪器",
    controlSystem: "控制系统",
    laser: "激光器",
    opticalComponent: "光学器件",
    electronics: "电子学",
    vacuum: "真空器件",
    computer: "电脑/服务器",
    custom: "自定义",
    interfaces: "通用接口",
    inputs: "输入",
    outputs: "输出",
    location: "位置",
    locationPlaceholder: "机架、光学平台、架子...",
    notes: "备注",
    cancel: "取消",
    create: "创建",
    createConnection: "创建连接",
    lineType: "线型",
    label: "标签",
    connectionLabelPlaceholder: "TTL 触发、RF、780 nm 光束...",
    signalType: "信号类型",
    signalPlaceholder: "TTL、模拟、光、RF...",
    connect: "连接",
    noInputs: "无输入",
    noOutputs: "无输出",
    noLocation: "未填写位置",
    portsTitle: "接口",
    ports: "个接口",
    port: "接口",
    input: "输入",
    output: "输出",
    interface: "通用接口",
    manufacturer: "厂家",
    model: "型号",
    addPort: "添加接口",
    addPortType: "添加类型",
    portType: "端口种类",
    addPortTypeTitle: "添加端口种类",
    color: "颜色",
    customPortTypePrompt: "请输入新的端口种类名称:",
    customPortTypeCreated: "已添加端口种类: {name}",
    customPortTypeEmpty: "端口种类名称不能为空。",
    autoArranged: "已自动整理器件位置。",
    delete: "删除",
    deleteDevice: "删除器件",
    deleteConnection: "删除连接",
    inspectorEmpty: "请选择器件、连接或接口。这里可以编辑器件属性和接口名称。",
    portNameTitle: "接口名称",
    directionTitle: "方向",
    signalPlaceholderShort: "信号",
    connectorPlaceholder: "接头",
    from: "起点",
    to: "终点",
    connectionSelected: "已选中连接。",
    selectedPort: "已选中 {device} / {port}。请点击另一个接口来连接。",
    portSelectionCleared: "已清除接口选择。",
    invalidConnection: "连接无效。请检查接口方向和端点。",
    openedFile: "已打开 {file}",
    savedFile: "已保存 {file}",
    exampleLoaded: "示例已加载。请用“另存为”保存副本。",
    failedLoadExample: "加载示例失败: {status}",
    validProject: "工程文件校验通过。",
    validWithWarnings: "校验通过，但有 {count} 个警告。",
    validationFailed: "校验失败: {message}",
    backupSaved: "已保存备份: {file}",
    backupUnavailable: "备份服务器不可用。请用 Lab Wiring Editor 启动脚本打开网页以启用备份。",
    savedDefaultFile: "已保存到默认文件夹: {file}",
    defaultSaveUnavailable: "默认保存不可用，将改用另存为。",
    autosavedFile: "已自动保存 {file}",
    autosavedDraft: "已自动保存草稿备份。",
    codeApplied: "代码已应用到图。",
    codeApplyFailed: "代码无法应用: {message}",
    newProjectCreated: "已创建新工程。",
    viewCopied: "视图已复制。",
    connectionCreated: "连接已创建。",
    filePickerDesc: "实验室接线工程",
    newInstrument: "新器件",
    newPort: "新接口",
    defaultInterface: "通用接口 {index}",
    defaultInput: "输入 {index}",
    defaultOutput: "输出 {index}",
    validationOk: "校验：通过",
    validationErrors: "校验：{count} 个错误",
    warnings: "警告",
    errors: "错误",
    summaryProject: "工程",
    summaryDescription: "描述",
    summaryDevices: "器件",
    summaryConnections: "连接",
    summaryDeviceLine: "- {name}（{kind}，id={id}）",
    summaryPortLine: "  - {name} [{details}]",
    summaryConnectionLine: "- {label}: {fromDevice}.{fromPort} -> {toDevice}.{toPort}（{cable}）",
    portDetailsFallback: "接口",
    portTypeTtl: "TTL",
    portTypeDac: "DAC",
    portTypeAdc: "ADC",
    portTypeRf: "RF",
    portTypeAnalog: "模拟",
    portTypeDigital: "数字",
    portTypeLaser: "激光",
    portTypeCameraImage: "相机照片",
    portTypeOptical: "光学",
    portTypeEthernet: "以太网",
    portTypeUsb: "USB",
    portTypePower: "电源",
    portTypeCustom: "自定义",
    cableBnc: "BNC",
    cableSma: "SMA/RF",
    cableTtl: "TTL 触发",
    cableFiber: "光纤",
    cableFreeSpace: "自由空间光束",
    cableEthernet: "以太网",
    cableUsb: "USB",
    cablePower: "电源",
    cableCustom: "自定义"
  }
};

function initialLanguage() {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === "en" || saved === "zh") return saved;
  return navigator.language?.toLowerCase().startsWith("zh") ? "zh" : "en";
}

let activeLanguage = initialLanguage();

function t(key, values = {}) {
  const table = translations[activeLanguage] || translations.en;
  const template = table[key] || translations.en[key] || key;
  return template.replaceAll(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
}

function kindLabel(kind) {
  return {
    instrument: t("instrument"),
    control_system: t("controlSystem"),
    laser: t("laser"),
    optical_component: t("opticalComponent"),
    electronics: t("electronics"),
    vacuum: t("vacuum"),
    computer: t("computer"),
    custom: t("custom")
  }[kind] || kind || t("port");
}

function cableLabel(cableType) {
  const key = {
    bnc: "cableBnc",
    sma: "cableSma",
    ttl: "cableTtl",
    fiber: "cableFiber",
    "free-space": "cableFreeSpace",
    ethernet: "cableEthernet",
    usb: "cableUsb",
    power: "cablePower",
    custom: "cableCustom"
  }[cableType];
  return key ? t(key) : cableType;
}

function portTypeLabel(project, portTypeId) {
  const key = {
    ttl: "portTypeTtl",
    dac: "portTypeDac",
    adc: "portTypeAdc",
    rf: "portTypeRf",
    analog: "portTypeAnalog",
    digital: "portTypeDigital",
    laser: "portTypeLaser",
    camera_image: "portTypeCameraImage",
    optical: "portTypeOptical",
    ethernet: "portTypeEthernet",
    usb: "portTypeUsb",
    power: "portTypePower",
    custom: "portTypeCustom"
  }[portTypeId];
  if (key) return t(key);
  return getPortType(project, portTypeId)?.name || portTypeId || t("portTypeCustom");
}

function portTypeColor(project, portTypeId) {
  return getPortType(project, portTypeId)?.color || "#64748b";
}

const els = {
  fileStatus: $("#fileStatus"),
  newProjectBtn: $("#newProjectBtn"),
  openProjectBtn: $("#openProjectBtn"),
  saveProjectBtn: $("#saveProjectBtn"),
  saveAsProjectBtn: $("#saveAsProjectBtn"),
  loadActualBtn: $("#loadActualBtn"),
  publishActualBtn: $("#publishActualBtn"),
  actualVersionSelect: $("#actualVersionSelect"),
  rollbackActualBtn: $("#rollbackActualBtn"),
  loadExampleBtn: $("#loadExampleBtn"),
  validateBtn: $("#validateBtn"),
  arrangeBtn: $("#arrangeBtn"),
  autoSaveToggleBtn: $("#autoSaveToggleBtn"),
  addDeviceBtn: $("#addDeviceBtn"),
  projectTitleInput: $("#projectTitleInput"),
  projectDescriptionInput: $("#projectDescriptionInput"),
  searchInput: $("#searchInput"),
  deviceList: $("#deviceList"),
  canvasViewport: $("#canvasViewport"),
  world: $("#world"),
  connectionLayer: $("#connectionLayer"),
  deviceLayer: $("#deviceLayer"),
  connectionQuickActions: $("#connectionQuickActions"),
  interactionStatus: $("#interactionStatus"),
  zoomStatus: $("#zoomStatus"),
  zoomOutBtn: $("#zoomOutBtn"),
  zoomResetBtn: $("#zoomResetBtn"),
  zoomInBtn: $("#zoomInBtn"),
  inspector: $("#inspector"),
  summaryOutput: $("#summaryOutput"),
  summaryModeBtn: $("#summaryModeBtn"),
  codeModeBtn: $("#codeModeBtn"),
  applyCodeBtn: $("#applyCodeBtn"),
  copySummaryBtn: $("#copySummaryBtn"),
  deviceDialog: $("#deviceDialog"),
  deviceForm: $("#deviceForm"),
  connectionDialog: $("#connectionDialog"),
  connectionForm: $("#connectionForm"),
  connectionEndpoints: $("#connectionEndpoints"),
  cableTypeSelect: $("#cableTypeSelect"),
  portTypeDialog: $("#portTypeDialog"),
  portTypeForm: $("#portTypeForm"),
  fallbackFileInput: $("#fallbackFileInput"),
  toast: $("#toast"),
  languageButtons: document.querySelectorAll("[data-lang]")
};

const state = {
  project: createEmptyProject(t("untitled")),
  language: activeLanguage,
  fileHandle: null,
  fileName: "",
  dirty: false,
  selectedDeviceId: null,
  selectedConnectionId: null,
  connectionQuickPoint: null,
  pendingPort: null,
  connectionDraft: null,
  search: "",
  zoom: 1,
  pan: { x: 20, y: 20 },
  drag: null,
  panDrag: null,
  rightView: "summary",
  codeDraftDirty: false,
  autoSaveEnabled: true,
  autoSaveTimer: null,
  lastSavedText: "",
  lastAutoSaveText: "",
  defaultProjectFileName: "",
  defaultProjectPath: "",
  actualLabFileName: "ZZLab.labwire.json",
  actualLabVersions: [],
  backupWarningShown: false
};

function setElementText(selector, key) {
  const element = $(selector);
  if (element) element.textContent = t(key);
}

function setElementTitle(selector, key) {
  const element = $(selector);
  if (element) element.title = t(key);
}

function setElementPlaceholder(selector, key) {
  const element = $(selector);
  if (element) element.placeholder = t(key);
}

function setInputLabel(inputSelector, key) {
  const input = $(inputSelector);
  const label = input?.closest("label");
  const span = label?.querySelector("span");
  if (span) span.textContent = t(key);
}

function applyStaticTranslations() {
  document.documentElement.lang = activeLanguage === "zh" ? "zh-CN" : "en";
  document.title = t("appTitle");
  setElementText(".brand h1", "appTitle");
  const toolbar = $(".toolbar");
  if (toolbar) toolbar.setAttribute("aria-label", t("projectActions"));

  const buttonMap = [
    ["#newProjectBtn", "new", "newTitle"],
    ["#openProjectBtn", "open", "openTitle"],
    ["#saveProjectBtn", "save", "saveTitle"],
    ["#saveAsProjectBtn", "saveAs", "saveAsTitle"],
    ["#loadActualBtn", "loadActual", "loadActualTitle"],
    ["#publishActualBtn", "publishActual", "publishActualTitle"],
    ["#rollbackActualBtn", "rollbackActual", "rollbackActualTitle"],
    ["#loadExampleBtn", "example", "exampleTitle"],
    ["#validateBtn", "validate", "validateTitle"],
    ["#arrangeBtn", "arrange", "arrangeTitle"],
    ["#addDeviceBtn", "add", null],
    ["#summaryModeBtn", "summaryView", null],
    ["#codeModeBtn", "codeView", null],
    ["#applyCodeBtn", "applyCode", "applyCodeTitle"],
    ["#copySummaryBtn", "copy", null],
    ["#createDeviceBtn", "create", null],
    ["#createConnectionBtn", "connect", null],
    ["#createPortTypeBtn", "create", null]
  ];
  for (const [selector, textKey, titleKey] of buttonMap) {
    setElementText(selector, textKey);
    if (titleKey) setElementTitle(selector, titleKey);
  }
  setElementTitle("#autoSaveToggleBtn", "autoSaveTitle");
  setElementTitle("#actualVersionSelect", "actualVersionPlaceholder");

  const headings = [
    [".left-panel .panel-section:nth-of-type(1) h2", "project"],
    [".left-panel .panel-section:nth-of-type(2) h2", "devices"],
    [".left-panel .panel-section:nth-of-type(3) h2", "canvas"],
    [".right-panel .panel-section:nth-of-type(1) h2", "inspector"],
    [".right-panel .panel-section:nth-of-type(2) h2", "aiView"],
    ["#deviceDialog h2", "addDeviceBlock"],
    ["#connectionDialog h2", "createConnection"],
    ["#portTypeDialog h2", "addPortTypeTitle"]
  ];
  for (const [selector, key] of headings) setElementText(selector, key);

  setInputLabel("#projectTitleInput", "title");
  setInputLabel("#projectDescriptionInput", "description");
  setInputLabel("#searchInput", "search");
  setInputLabel("#deviceForm input[name='name']", "name");
  setInputLabel("#deviceForm select[name='kind']", "kind");
  setInputLabel("#deviceForm input[name='genericCount']", "interfaces");
  setInputLabel("#deviceForm input[name='inputCount']", "inputs");
  setInputLabel("#deviceForm input[name='outputCount']", "outputs");
  setInputLabel("#deviceForm input[name='location']", "location");
  setInputLabel("#deviceForm textarea[name='notes']", "notes");
  setInputLabel("#connectionForm select[name='cableType']", "lineType");
  setInputLabel("#connectionForm input[name='label']", "label");
  setInputLabel("#connectionForm input[name='signalType']", "signalType");
  setInputLabel("#connectionForm textarea[name='notes']", "notes");
  setInputLabel("#portTypeForm input[name='name']", "name");
  setInputLabel("#portTypeForm input[name='color']", "color");

  setElementPlaceholder("#searchInput", "searchPlaceholder");
  setElementPlaceholder("#deviceForm input[name='location']", "locationPlaceholder");
  setElementPlaceholder("#connectionForm input[name='label']", "connectionLabelPlaceholder");
  setElementPlaceholder("#connectionForm input[name='signalType']", "signalPlaceholder");
  setElementText(".left-panel .panel-section:nth-of-type(3) .hint", "canvasHint");
  $(".canvas-panel")?.setAttribute("aria-label", t("wiringCanvas"));

  const deviceKindSelect = $("#deviceForm select[name='kind']");
  if (deviceKindSelect) {
    const optionLabels = {
      instrument: "instrument",
      control_system: "controlSystem",
      laser: "laser",
      optical_component: "opticalComponent",
      electronics: "electronics",
      vacuum: "vacuum",
      computer: "computer",
      custom: "custom"
    };
    for (const option of deviceKindSelect.options) {
      option.textContent = t(optionLabels[option.value] || "custom");
    }
  }

  const dialogButtons = document.querySelectorAll("dialog button[value='cancel']");
  for (const button of dialogButtons) {
    if (button.classList.contains("icon-button")) {
      button.title = t("close");
    } else {
      button.textContent = t("cancel");
    }
  }

  for (const button of els.languageButtons) {
    const active = button.dataset.lang === activeLanguage;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  updateAutoSaveButton();
}

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

function currentProjectText() {
  return `${JSON.stringify(state.project, null, 2)}\n`;
}

function currentProjectFileName() {
  const raw = state.defaultProjectFileName || state.fileName || state.project.metadata?.title || "lab_wiring";
  return String(raw).toLowerCase().endsWith(".json") ? String(raw) : `${raw}.labwire.json`;
}

async function writeBackup(reason, content = currentProjectText(), { quiet = true } = {}) {
  if (!content) return null;
  try {
    const response = await fetch(BACKUP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: currentProjectFileName(),
        reason,
        content
      })
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    state.backupWarningShown = false;
    if (!quiet) {
      showToast(t("backupSaved", { file: result.fileName || "backup" }));
    }
    return result;
  } catch (error) {
    console.warn("Lab wiring backup failed", error);
    if (!quiet || !state.backupWarningShown) {
      showToast(t("backupUnavailable"));
      state.backupWarningShown = true;
    }
    return null;
  }
}

async function writeDefaultProject(content = currentProjectText(), { quiet = true, mode = "manual" } = {}) {
  try {
    const response = await fetch(DEFAULT_PROJECT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: currentProjectFileName(),
        reason: mode,
        content
      })
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    state.defaultProjectFileName = result.fileName || currentProjectFileName();
    state.defaultProjectPath = result.relativePath || "";
    state.fileName = state.defaultProjectFileName;
    state.fileHandle = null;
    if (!quiet) {
      showToast(t("savedDefaultFile", { file: result.relativePath || state.defaultProjectFileName }));
    }
    return result;
  } catch (error) {
    console.warn("Lab wiring default save failed", error);
    if (!quiet) showToast(t("defaultSaveUnavailable"));
    return null;
  }
}

function updateAutoSaveButton() {
  if (!els.autoSaveToggleBtn) return;
  els.autoSaveToggleBtn.textContent = t(state.autoSaveEnabled ? "autoSaveOn" : "autoSaveOff");
  els.autoSaveToggleBtn.classList.toggle("active", state.autoSaveEnabled);
  els.autoSaveToggleBtn.setAttribute("aria-pressed", String(state.autoSaveEnabled));
}

function renderActualVersionSelect() {
  if (!els.actualVersionSelect) return;
  const versions = [...(state.actualLabVersions || [])].reverse();
  if (!versions.length) {
    els.actualVersionSelect.innerHTML = `<option value="">${escapeHtml(t("actualVersionPlaceholder"))}</option>`;
    els.actualVersionSelect.disabled = true;
    els.rollbackActualBtn.disabled = true;
    return;
  }
  els.actualVersionSelect.disabled = false;
  els.rollbackActualBtn.disabled = false;
  els.actualVersionSelect.innerHTML = versions
    .map((version) => {
      const label = `${version.timestamp || ""} / ${version.reason || "version"} / ${version.contentSha256?.slice(0, 8) || ""}`;
      return `<option value="${escapeHtml(version.versionId)}">${escapeHtml(label)}</option>`;
    })
    .join("");
}

function markDirty() {
  state.dirty = true;
  touchProject(state.project);
  updateStatus();
}

function setProject(project, {
  fileName = "",
  fileHandle = null,
  dirty = false,
  sourceText = "",
  keepSavedText = false,
  defaultProjectFileName = "",
  defaultProjectPath = ""
} = {}) {
  state.project = project;
  state.fileName = fileName;
  state.fileHandle = fileHandle;
  state.dirty = dirty;
  state.selectedDeviceId = null;
  state.selectedConnectionId = null;
  state.connectionQuickPoint = null;
  state.pendingPort = null;
  state.connectionDraft = null;
  state.zoom = project.canvas?.zoom || 1;
  state.pan = project.canvas?.pan || { x: 20, y: 20 };
  state.codeDraftDirty = false;
  state.defaultProjectFileName = defaultProjectFileName;
  state.defaultProjectPath = defaultProjectPath;
  render();
  if (!keepSavedText) {
    state.lastSavedText = sourceText || (dirty ? "" : currentProjectText());
    state.lastAutoSaveText = currentProjectText();
  }
}

function updateStatus() {
  const label = state.fileName || state.project.metadata.title || t("untitled");
  els.fileStatus.textContent = `${state.dirty ? t("unsavedPrefix") : ""}${label}`;
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
    input: t("input"),
    output: t("output"),
    bidirectional: t("interface")
  }[direction] || t("port");
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
      port.portType,
      portTypeLabel(state.project, port.portType),
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

function roundedPolylinePath(points, radius = 14) {
  const uniquePoints = [];
  for (const point of points) {
    const previous = uniquePoints.at(-1);
    if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > 1) {
      uniquePoints.push(point);
    }
  }
  const cleanPoints = [];
  for (const point of uniquePoints) {
    const previous = cleanPoints.at(-1);
    const next = uniquePoints[uniquePoints.indexOf(point) + 1];
    if (previous && next) {
      const sameHorizontal = Math.abs(previous.y - point.y) < 1 && Math.abs(point.y - next.y) < 1;
      const sameVertical = Math.abs(previous.x - point.x) < 1 && Math.abs(point.x - next.x) < 1;
      if (sameHorizontal || sameVertical) continue;
    }
    cleanPoints.push(point);
  }
  if (cleanPoints.length < 2) return "";
  const parts = [`M ${cleanPoints[0].x} ${cleanPoints[0].y}`];
  for (let index = 1; index < cleanPoints.length - 1; index += 1) {
    const previous = cleanPoints[index - 1];
    const current = cleanPoints[index];
    const next = cleanPoints[index + 1];
    const inDistance = Math.hypot(current.x - previous.x, current.y - previous.y);
    const outDistance = Math.hypot(next.x - current.x, next.y - current.y);
    if (inDistance < 1 || outDistance < 1) continue;
    const cornerRadius = Math.min(radius, inDistance / 2, outDistance / 2);
    if (cornerRadius <= 0) {
      parts.push(`L ${current.x} ${current.y}`);
      continue;
    }
    const before = {
      x: current.x + ((previous.x - current.x) / inDistance) * cornerRadius,
      y: current.y + ((previous.y - current.y) / inDistance) * cornerRadius
    };
    const after = {
      x: current.x + ((next.x - current.x) / outDistance) * cornerRadius,
      y: current.y + ((next.y - current.y) / outDistance) * cornerRadius
    };
    parts.push(`L ${before.x} ${before.y}`);
    parts.push(`Q ${current.x} ${current.y} ${after.x} ${after.y}`);
  }
  const last = cleanPoints.at(-1);
  parts.push(`L ${last.x} ${last.y}`);
  return parts.join(" ");
}

function segmentIntersectsRect(a, b, rect) {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  if (Math.abs(a.y - b.y) < 1) {
    return a.y >= rect.top && a.y <= rect.bottom && maxX >= rect.left && minX <= rect.right;
  }
  if (Math.abs(a.x - b.x) < 1) {
    return a.x >= rect.left && a.x <= rect.right && maxY >= rect.top && minY <= rect.bottom;
  }
  return maxX >= rect.left && minX <= rect.right && maxY >= rect.top && minY <= rect.bottom;
}

function pathCollides(points, obstacles) {
  if (!obstacles.length) return false;
  for (let index = 1; index < points.length; index += 1) {
    for (const rect of obstacles) {
      if (segmentIntersectsRect(points[index - 1], points[index], rect)) return true;
    }
  }
  return false;
}

function connectionObstacles(connection) {
  const endpointDevices = new Set([connection.from.deviceId, connection.to.deviceId]);
  return state.project.devices
    .filter((device) => !endpointDevices.has(device.id))
    .map((device) => {
      ensureDeviceSize(device);
      const padding = 28;
      return {
        left: device.position.x - padding,
        right: device.position.x + (device.size?.width || 240) + padding,
        top: device.position.y - padding,
        bottom: device.position.y + (device.size?.height || 150) + padding
      };
    });
}

function makeConnectionPath(from, to, laneOffset = 0, obstacles = []) {
  const sameY = Math.abs(from.y - to.y) < 6;
  const horizontalGap = Math.abs(to.x - from.x);
  if (sameY && horizontalGap > 80) {
    const straight = [{ x: from.x, y: from.y }, { x: to.x, y: to.y }];
    if (!pathCollides(straight, obstacles)) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  const preferredGap = Math.max(70, Math.min(180, horizontalGap / 2));
  const fromLead = from.side === "left" ? -preferredGap : from.side === "right" ? preferredGap : 0;
  const toLead = to.side === "left" ? -preferredGap : to.side === "right" ? preferredGap : 0;
  const start = { x: from.x, y: from.y };
  const end = { x: to.x, y: to.y };
  const startLead = {
    x: from.side === "bottom" ? from.x : from.x + fromLead,
    y: from.side === "bottom" ? from.y + preferredGap : from.y
  };
  const endLead = {
    x: to.side === "bottom" ? to.x : to.x + toLead,
    y: to.side === "bottom" ? to.y + preferredGap : to.y
  };
  const bottomLeadVariants = (anchor, side, directLead, primaryDirection) => {
    if (side !== "bottom") return [[anchor, directLead]];
    const direction = primaryDirection || 1;
    const exitY = anchor.y + 34;
    const sideStep = preferredGap + 70 + Math.abs(laneOffset);
    return [
      [anchor, directLead],
      [
        anchor,
        { x: anchor.x, y: exitY },
        { x: anchor.x + direction * sideStep, y: exitY },
        { x: anchor.x + direction * sideStep, y: directLead.y }
      ],
      [
        anchor,
        { x: anchor.x, y: exitY },
        { x: anchor.x - direction * sideStep, y: exitY },
        { x: anchor.x - direction * sideStep, y: directLead.y }
      ]
    ];
  };
  const startVariants = bottomLeadVariants(start, from.side, startLead, from.x <= to.x ? 1 : -1);
  const endVariants = bottomLeadVariants(end, to.side, endLead, to.x <= from.x ? 1 : -1);
  const composeMidPath = (startPath, endPath) => {
    const startAnchor = startPath.at(-1);
    const endAnchor = endPath.at(-1);
    const midX = Math.round((startAnchor.x + endAnchor.x) / 2 + laneOffset);
    return [
      ...startPath,
      { x: midX, y: startAnchor.y },
      { x: midX, y: endAnchor.y },
      ...[...endPath].reverse()
    ];
  };
  for (const startPath of startVariants) {
    for (const endPath of endVariants) {
      const candidate = composeMidPath(startPath, endPath);
      if (!pathCollides(candidate, obstacles)) return roundedPolylinePath(candidate, 16);
    }
  }

  const obstacleBounds = obstacles.length ? {
    left: Math.min(...obstacles.map((rect) => rect.left)),
    right: Math.max(...obstacles.map((rect) => rect.right)),
    top: Math.min(...obstacles.map((rect) => rect.top)),
    bottom: Math.max(...obstacles.map((rect) => rect.bottom))
  } : null;
  const outsideX = from.x <= to.x
    ? (obstacleBounds?.right ?? Math.max(from.x, to.x)) + 90 + Math.abs(laneOffset)
    : (obstacleBounds?.left ?? Math.min(from.x, to.x)) - 90 - Math.abs(laneOffset);
  const lowerBusY = Math.max(start.y, end.y, obstacleBounds?.bottom ?? 0) + 110 + Math.abs(laneOffset);
  const upperBusY = Math.min(start.y, end.y, obstacleBounds?.top ?? 0) - 110 - Math.abs(laneOffset);
  const fallbackStart = startVariants[1] || startVariants[0];
  const fallbackEnd = endVariants[1] || endVariants[0];
  const fallbackStartLead = fallbackStart.at(-1);
  const fallbackEndLead = fallbackEnd.at(-1);
  const fallbackEndTail = [...fallbackEnd].reverse();
  const candidates = [
    [...fallbackStart, { x: outsideX, y: fallbackStartLead.y }, { x: outsideX, y: fallbackEndLead.y }, ...fallbackEndTail],
    [...fallbackStart, { x: fallbackStartLead.x, y: lowerBusY }, { x: fallbackEndLead.x, y: lowerBusY }, ...fallbackEndTail],
    [...fallbackStart, { x: fallbackStartLead.x, y: upperBusY }, { x: fallbackEndLead.x, y: upperBusY }, ...fallbackEndTail]
  ];
  const clean = candidates.find((points) => !pathCollides(points, obstacles)) || candidates[1];
  return roundedPolylinePath(clean, 16);
}

function portButtonHtml(port) {
  const pending = state.pendingPort?.portId === port.id ? "pending" : "";
  const typeName = portTypeLabel(state.project, port.portType);
  const typeColor = portTypeColor(state.project, port.portType);
  const dot = '<span class="port-dot"></span>';
  const label = `<span class="port-name">${escapeHtml(port.name)}</span>`;
  const badge = `<span class="port-type-badge">${escapeHtml(typeName)}</span>`;
  const inner = port.direction === "output" ? `${badge}${label}${dot}` : `${dot}${label}${badge}`;
  return `
    <button class="port-button ${port.direction} ${pending}" type="button"
      data-device-id="${escapeHtml(state.renderingDeviceId)}"
      data-port-id="${escapeHtml(port.id)}"
      style="--port-color:${escapeHtml(typeColor)}"
      title="${escapeHtml(port.name)} - ${escapeHtml(directionLabel(port.direction))} - ${escapeHtml(typeName)}">
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
        <span>${escapeHtml(kindLabel(device.kind || "custom"))}${device.location ? ` / ${escapeHtml(device.location)}` : ""}</span>
      </header>
      <div class="port-columns">
        <div class="port-column">
          <div class="port-group-title">${escapeHtml(t("inputs"))}</div>
          ${groups.inputs.map(portButtonHtml).join("") || `<span class="hint">${escapeHtml(t("noInputs"))}</span>`}
        </div>
        <div class="port-column">
          <div class="port-group-title">${escapeHtml(t("outputs"))}</div>
          ${groups.outputs.map(portButtonHtml).join("") || `<span class="hint">${escapeHtml(t("noOutputs"))}</span>`}
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
  renderConnectionQuickActions();
  for (const [index, connection] of state.project.connections.entries()) {
    const from = endpointPosition(connection.from);
    const to = endpointPosition(connection.to);
    const laneOffset = ((index % 5) - 2) * 10;
    const pathData = makeConnectionPath(from, to, laneOffset, connectionObstacles(connection));
    const cable = CABLE_TYPES.find((item) => item.id === connection.cableType) || CABLE_TYPES.at(-1);

    const hit = document.createElementNS(svgNS, "path");
    hit.setAttribute("d", pathData);
    hit.setAttribute("class", "connection-hit");
    hit.dataset.connectionId = connection.id;
    hit.addEventListener("click", (event) => selectConnection(connection.id, event));
    els.connectionLayer.append(hit);

    const backdrop = document.createElementNS(svgNS, "path");
    backdrop.setAttribute("d", pathData);
    backdrop.setAttribute("class", "connection-backdrop");
    backdrop.setAttribute("stroke-width", String((cable.stroke || 3) + 6));
    els.connectionLayer.append(backdrop);

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("class", `connection-path ${state.selectedConnectionId === connection.id ? "selected" : ""}`);
    path.setAttribute("stroke", connection.color || cable.color);
    path.setAttribute("stroke-width", cable.stroke || 3);
    if (cable.dash) path.setAttribute("stroke-dasharray", cable.dash);
    path.dataset.connectionId = connection.id;
    path.addEventListener("click", (event) => selectConnection(connection.id, event));
    els.connectionLayer.append(path);

    const label = connection.label || connection.name;
    if (label) {
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", String((from.x + to.x) / 2));
      text.setAttribute("y", String((from.y + to.y) / 2 - 8));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("class", "connection-label");
      text.textContent = label;
      text.addEventListener("click", (event) => selectConnection(connection.id, event));
      els.connectionLayer.append(text);
    }
  }
}

function renderConnectionQuickActions() {
  const panel = els.connectionQuickActions;
  if (!panel) return;
  const connection = state.project.connections.find((item) => item.id === state.selectedConnectionId);
  if (!connection || !state.connectionQuickPoint) {
    panel.hidden = true;
    panel.innerHTML = "";
    return;
  }

  const rect = els.canvasViewport.getBoundingClientRect();
  const safeX = Math.min(Math.max(state.connectionQuickPoint.x, 96), Math.max(96, rect.width - 96));
  const safeY = Math.min(Math.max(state.connectionQuickPoint.y, 54), Math.max(54, rect.height - 18));
  panel.style.left = `${safeX}px`;
  panel.style.top = `${safeY}px`;
  panel.innerHTML = `
    <select id="quickConnectionTypeSelect" title="${escapeHtml(t("lineType"))}">
      ${CABLE_TYPES.map((type) => `<option value="${type.id}" ${connection.cableType === type.id ? "selected" : ""}>${escapeHtml(cableLabel(type.id))}</option>`).join("")}
    </select>
    <button id="quickDeleteConnectionBtn" class="danger" type="button">${escapeHtml(t("delete"))}</button>
  `;
  panel.hidden = false;
  $("#quickConnectionTypeSelect")?.addEventListener("change", (event) => {
    connection.cableType = event.target.value;
    const cable = CABLE_TYPES.find((item) => item.id === event.target.value);
    if (cable) connection.color = cable.color;
    markDirty();
    render();
  });
  $("#quickDeleteConnectionBtn")?.addEventListener("click", () => {
    deleteConnection(state.project, connection.id);
    state.selectedConnectionId = null;
    state.connectionQuickPoint = null;
    markDirty();
    render();
  });
}

function renderDeviceList() {
  els.deviceList.innerHTML = state.project.devices
    .map((device) => {
      const active = state.selectedDeviceId === device.id ? "active" : "";
      const match = deviceMatchesSearch(device);
      return `
        <button type="button" class="device-list-item ${active}" data-device-id="${escapeHtml(device.id)}" ${match ? "" : "hidden"}>
          <strong>${escapeHtml(device.name)}</strong>
          <span>${escapeHtml(kindLabel(device.kind || "custom"))} / ${(device.ports || []).length} ${escapeHtml(t("ports"))} / ${escapeHtml(device.location || t("noLocation"))}</span>
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
      ${escapeHtml(t("inspectorEmpty"))}
    </div>
  `;
}

function deviceInspectorHtml(device) {
  const portTypeOptions = (selected) => {
    return (state.project.portTypes || [])
      .map((type) => `<option value="${escapeHtml(type.id)}" ${selected === type.id ? "selected" : ""}>${escapeHtml(portTypeLabel(state.project, type.id))}</option>`)
      .join("");
  };
  return `
    <label class="field"><span>${escapeHtml(t("name"))}</span><input data-field="name" value="${escapeHtml(device.name)}"></label>
    <div class="mini-grid">
      <label class="field"><span>${escapeHtml(t("kind"))}</span><input data-field="kind" value="${escapeHtml(device.kind || "")}"></label>
      <label class="field"><span>${escapeHtml(t("location"))}</span><input data-field="location" value="${escapeHtml(device.location || "")}"></label>
    </div>
    <div class="mini-grid">
      <label class="field"><span>${escapeHtml(t("manufacturer"))}</span><input data-field="manufacturer" value="${escapeHtml(device.manufacturer || "")}"></label>
      <label class="field"><span>${escapeHtml(t("model"))}</span><input data-field="model" value="${escapeHtml(device.model || "")}"></label>
    </div>
    <label class="field"><span>${escapeHtml(t("notes"))}</span><textarea data-field="notes" rows="3">${escapeHtml(device.notes || "")}</textarea></label>
    <div class="section-title"><h2>${escapeHtml(t("portsTitle"))}</h2><div class="inline-actions"><button id="addPortBtn" type="button">${escapeHtml(t("addPort"))}</button><button id="addPortTypeBtn" type="button">${escapeHtml(t("addPortType"))}</button></div></div>
    <div>
      ${(device.ports || []).map((port) => `
        <div class="port-editor-row" data-port-id="${escapeHtml(port.id)}">
          <input data-port-field="name" value="${escapeHtml(port.name)}" title="${escapeHtml(t("portNameTitle"))}">
          <select data-port-field="direction" title="${escapeHtml(t("directionTitle"))}">
            <option value="input" ${port.direction === "input" ? "selected" : ""}>${escapeHtml(t("input"))}</option>
            <option value="output" ${port.direction === "output" ? "selected" : ""}>${escapeHtml(t("output"))}</option>
            <option value="bidirectional" ${port.direction === "bidirectional" ? "selected" : ""}>${escapeHtml(t("interface"))}</option>
          </select>
          <select data-port-field="portType" title="${escapeHtml(t("portType"))}">
            ${portTypeOptions(port.portType || "custom")}
          </select>
          <input data-port-field="signalType" value="${escapeHtml(port.signalType || "")}" placeholder="${escapeHtml(t("signalPlaceholderShort"))}">
          <input data-port-field="connectorType" value="${escapeHtml(port.connectorType || "")}" placeholder="${escapeHtml(t("connectorPlaceholder"))}">
          <button class="danger" data-delete-port="${escapeHtml(port.id)}" type="button">${escapeHtml(t("delete"))}</button>
        </div>
      `).join("")}
    </div>
    <div class="inspector-actions">
      <button id="deleteDeviceBtn" class="danger" type="button">${escapeHtml(t("deleteDevice"))}</button>
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
    device.ports.push(createPort({ name: t("newPort"), direction: "bidirectional" }));
    markDirty();
    render();
  });
  $("#addPortTypeBtn")?.addEventListener("click", () => {
    els.portTypeForm.reset();
    els.portTypeDialog.showModal();
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
      <div><strong>${escapeHtml(t("from"))}:</strong> ${escapeHtml(from.deviceName)} / ${escapeHtml(from.portName)}</div>
      <div><strong>${escapeHtml(t("to"))}:</strong> ${escapeHtml(to.deviceName)} / ${escapeHtml(to.portName)}</div>
    </div>
    <label class="field"><span>${escapeHtml(t("name"))}</span><input data-field="name" value="${escapeHtml(connection.name || "")}"></label>
    <label class="field"><span>${escapeHtml(t("label"))}</span><input data-field="label" value="${escapeHtml(connection.label || "")}"></label>
    <label class="field"><span>${escapeHtml(t("lineType"))}</span><select data-field="cableType">
      ${CABLE_TYPES.map((type) => `<option value="${type.id}" ${connection.cableType === type.id ? "selected" : ""}>${escapeHtml(cableLabel(type.id))}</option>`).join("")}
    </select></label>
    <label class="field"><span>${escapeHtml(t("signalType"))}</span><input data-field="signalType" value="${escapeHtml(connection.signalType || "")}"></label>
    <label class="field"><span>${escapeHtml(t("notes"))}</span><textarea data-field="notes" rows="4">${escapeHtml(connection.notes || "")}</textarea></label>
    <div class="inspector-actions">
      <button id="deleteConnectionBtn" class="danger" type="button">${escapeHtml(t("deleteConnection"))}</button>
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
    state.connectionQuickPoint = null;
    markDirty();
    render();
  });
}

function summarizeProjectForLanguage(project) {
  if (activeLanguage === "en") return summarizeProject(project);

  const lines = [];
  lines.push(`${t("summaryProject")}: ${project.metadata?.title || t("untitled")}`);
  if (project.metadata?.description) lines.push(`${t("summaryDescription")}: ${project.metadata.description}`);
  lines.push(`${t("summaryDevices")}: ${project.devices.length}`);
  for (const device of project.devices) {
    lines.push(t("summaryDeviceLine", {
      name: device.name,
      kind: kindLabel(device.kind || "custom"),
      id: device.id
    }));
    for (const port of device.ports || []) {
      const details = [
        directionLabel(port.direction),
        portTypeLabel(project, port.portType),
        port.signalType,
        port.medium,
        port.connectorType
      ].filter(Boolean).join(", ");
      lines.push(t("summaryPortLine", {
        name: port.name,
        details: details || t("portDetailsFallback")
      }));
    }
  }
  lines.push(`${t("summaryConnections")}: ${project.connections.length}`);
  for (const connection of project.connections) {
    const from = describeEndpoint(project, connection.from);
    const to = describeEndpoint(project, connection.to);
    lines.push(t("summaryConnectionLine", {
      label: connection.label || connection.name || cableLabel(connection.cableType),
      fromDevice: from.deviceName,
      fromPort: from.portName,
      toDevice: to.deviceName,
      toPort: to.portName,
      cable: cableLabel(connection.cableType)
    }));
  }
  return lines.join("\n");
}

function renderSummary() {
  const isCodeView = state.rightView === "code";
  els.summaryModeBtn.classList.toggle("active", !isCodeView);
  els.codeModeBtn.classList.toggle("active", isCodeView);
  els.applyCodeBtn.hidden = !isCodeView;
  els.summaryOutput.readOnly = !isCodeView;
  els.summaryOutput.classList.toggle("code-mode", isCodeView);

  if (isCodeView) {
    if (!state.codeDraftDirty) {
      els.summaryOutput.value = currentProjectText();
    }
    return;
  }

  const validation = validateProject(state.project);
  const header = validation.ok
    ? t("validationOk")
    : t("validationErrors", { count: validation.errors.length });
  const warnings = validation.warnings.length ? `\n${t("warnings")}:\n- ${validation.warnings.join("\n- ")}` : "";
  const errors = validation.errors.length ? `\n${t("errors")}:\n- ${validation.errors.join("\n- ")}` : "";
  els.summaryOutput.value = `${header}${errors}${warnings}\n\n${summarizeProjectForLanguage(state.project)}`;
}

function setRightView(view) {
  state.rightView = view === "code" ? "code" : "summary";
  state.codeDraftDirty = false;
  renderSummary();
}

async function applyCodeToProject() {
  if (state.rightView !== "code") return;
  const previousText = currentProjectText();
  const savedText = state.lastSavedText;
  const { fileName, fileHandle, defaultProjectFileName, defaultProjectPath } = state;
  try {
    const parsed = parseProjectJson(els.summaryOutput.value);
    await writeBackup("before-code-apply", previousText, { quiet: true });
    setProject(parsed, {
      fileName,
      fileHandle,
      dirty: true,
      keepSavedText: true,
      defaultProjectFileName,
      defaultProjectPath
    });
    state.lastSavedText = savedText;
    state.lastAutoSaveText = "";
    state.rightView = "code";
    state.codeDraftDirty = false;
    render();
    showToast(t("codeApplied"));
  } catch (error) {
    showToast(t("codeApplyFailed", { message: error.message }));
  }
}

function setLanguage(language) {
  if (!["en", "zh"].includes(language)) return;
  activeLanguage = language;
  state.language = language;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  if (!state.pendingPort && !state.selectedConnectionId) {
    els.interactionStatus.textContent = t("interactionDefault");
  }
  render();
}

function render() {
  applyStaticTranslations();
  if (!state.pendingPort && !state.selectedConnectionId) {
    els.interactionStatus.textContent = t("interactionDefault");
  }
  els.projectTitleInput.value = state.project.metadata.title || "";
  els.projectDescriptionInput.value = state.project.metadata.description || "";
  renderConnections();
  renderDeviceLayer();
  renderDeviceList();
  renderInspector();
  renderSummary();
  renderActualVersionSelect();
  applyWorldTransform();
}

function selectDevice(deviceId) {
  state.selectedDeviceId = deviceId;
  state.selectedConnectionId = null;
  state.connectionQuickPoint = null;
  render();
}

function selectConnection(connectionId, event = null) {
  state.selectedConnectionId = connectionId;
  state.selectedDeviceId = null;
  state.pendingPort = null;
  if (event) {
    const rect = els.canvasViewport.getBoundingClientRect();
    state.connectionQuickPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  } else {
    state.connectionQuickPoint = null;
  }
  els.interactionStatus.textContent = t("connectionSelected");
  render();
}

function handlePortClick(deviceId, portId) {
  const endpoint = { deviceId, portId };
  state.selectedDeviceId = deviceId;
  state.selectedConnectionId = null;
  state.connectionQuickPoint = null;
  if (!state.pendingPort) {
    state.pendingPort = endpoint;
    const info = describeEndpoint(state.project, endpoint);
    els.interactionStatus.textContent = t("selectedPort", { device: info.deviceName, port: info.portName });
    render();
    return;
  }
  const first = state.pendingPort;
  if (first.deviceId === endpoint.deviceId && first.portId === endpoint.portId) {
    state.pendingPort = null;
    els.interactionStatus.textContent = t("portSelectionCleared");
    render();
    return;
  }
  const check = canConnect(state.project, first, endpoint);
  if (!check.ok) {
    showToast(activeLanguage === "zh" ? t("invalidConnection") : check.errors.join(" "));
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
    <div><strong>${escapeHtml(t("from"))}:</strong> ${escapeHtml(fromInfo.deviceName)} / ${escapeHtml(fromInfo.portName)}</div>
    <div><strong>${escapeHtml(t("to"))}:</strong> ${escapeHtml(toInfo.deviceName)} / ${escapeHtml(toInfo.portName)}</div>
  `;
  els.cableTypeSelect.innerHTML = CABLE_TYPES
    .map((type) => `<option value="${type.id}">${escapeHtml(cableLabel(type.id))}</option>`)
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
  if (event.target.closest(".device-node") || event.target.closest(".connection-hit") || event.target.closest(".connection-path") || event.target.closest(".connection-quick-actions")) return;
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

function zoomAt(clientX, clientY, nextZoom) {
  const rect = els.canvasViewport.getBoundingClientRect();
  const before = screenToWorld(clientX, clientY);
  state.zoom = Math.min(2.5, Math.max(0.28, nextZoom));
  state.pan.x = clientX - rect.left - before.x * state.zoom;
  state.pan.y = clientY - rect.top - before.y * state.zoom;
  applyWorldTransform();
}

function onCanvasWheel(event) {
  event.preventDefault();
  const factor = Math.exp(-event.deltaY * 0.0012);
  zoomAt(event.clientX, event.clientY, state.zoom * factor);
}

function centerOnDevice(deviceId) {
  const device = state.project.devices.find((item) => item.id === deviceId);
  if (!device) return;
  const rect = els.canvasViewport.getBoundingClientRect();
  state.pan.x = rect.width / 2 - (device.position.x + (device.size?.width || 240) / 2) * state.zoom;
  state.pan.y = rect.height / 2 - (device.position.y + (device.size?.height || 150) / 2) * state.zoom;
  applyWorldTransform();
}

async function backupPreviousVersion(reason, nextText = currentProjectText()) {
  if (!state.lastSavedText || state.lastSavedText === nextText) return null;
  return writeBackup(reason, state.lastSavedText, { quiet: true });
}

async function downloadProject(mode = "manual") {
  const nextText = currentProjectText();
  await backupPreviousVersion(mode === "autosave" ? "before-autosave-download" : "before-download-save", nextText);
  const blob = new Blob([nextText], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = state.fileName || `${state.project.metadata.title || "lab_wiring"}.labwire.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  state.lastSavedText = nextText;
  state.lastAutoSaveText = nextText;
  state.dirty = false;
  updateStatus();
}

async function openProject() {
  if ("showOpenFilePicker" in window) {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: t("filePickerDesc"), accept: { "application/json": [".json"] } }],
      multiple: false
    });
    const file = await handle.getFile();
    const text = await file.text();
    setProject(parseProjectJson(text), { fileName: file.name, fileHandle: handle, dirty: false, sourceText: text });
    await writeBackup("opened", text, { quiet: true });
    showToast(t("openedFile", { file: file.name }));
    return;
  }
  els.fallbackFileInput.click();
}

async function saveProject(mode = "manual") {
  const nextText = currentProjectText();
  if (state.fileHandle?.createWritable) {
    await backupPreviousVersion(mode === "autosave" ? "before-autosave" : "before-manual-save", nextText);
    const writable = await state.fileHandle.createWritable();
    await writable.write(nextText);
    await writable.close();
    state.lastSavedText = nextText;
    state.lastAutoSaveText = nextText;
    state.dirty = false;
    updateStatus();
    showToast(mode === "autosave" ? t("autosavedFile", { file: state.fileName }) : t("savedFile", { file: state.fileName }));
    return;
  }
  if (mode === "autosave") {
    if (state.defaultProjectFileName) {
      await backupPreviousVersion("before-autosave-default", nextText);
      const result = await writeDefaultProject(nextText, { quiet: true, mode });
      if (result) {
        state.lastSavedText = nextText;
        state.lastAutoSaveText = nextText;
        state.dirty = false;
        updateStatus();
        showToast(t("autosavedFile", { file: state.fileName }));
        return;
      }
    }
    await writeBackup("autosave-draft", nextText, { quiet: true });
    state.lastAutoSaveText = nextText;
    showToast(t("autosavedDraft"));
    return;
  }
  await backupPreviousVersion("before-default-save", nextText);
  const defaultResult = await writeDefaultProject(nextText, { quiet: false, mode });
  if (defaultResult) {
    state.lastSavedText = nextText;
    state.lastAutoSaveText = nextText;
    state.dirty = false;
    updateStatus();
    return;
  }
  if ("showSaveFilePicker" in window) {
    await saveProjectAs(mode);
    return;
  }
  await downloadProject(mode);
}

async function saveProjectAs(mode = "manual") {
  if ("showSaveFilePicker" in window) {
    const suggestedName = state.fileName || `${state.project.metadata.title || "lab_wiring"}.labwire.json`;
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{ description: t("filePickerDesc"), accept: { "application/json": [".json"] } }]
    });
    state.fileHandle = handle;
    state.fileName = handle.name;
    state.defaultProjectFileName = "";
    state.defaultProjectPath = "";
    await saveProject(mode);
    return;
  }
  await downloadProject(mode);
}

async function loadExample() {
  const response = await fetch("../../../linker/Lab_Wiring_Connector/projects/example_lab_wiring.labwire.json");
  if (!response.ok) throw new Error(t("failedLoadExample", { status: response.status }));
  const text = await response.text();
  const project = parseProjectJson(text);
  setProject(project, { fileName: "example_lab_wiring.labwire.json", fileHandle: null, dirty: true, sourceText: text });
  showToast(t("exampleLoaded"));
}

async function refreshActualVersions(fileName = state.actualLabFileName || currentProjectFileName()) {
  try {
    const url = `${ACTUAL_LAB_ENDPOINT}/versions?fileName=${encodeURIComponent(fileName)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = await response.json();
    state.actualLabFileName = data.fileName || fileName;
    state.actualLabVersions = data.versions || [];
    renderActualVersionSelect();
    return data;
  } catch (error) {
    console.warn("Actual lab versions failed", error);
    state.actualLabVersions = [];
    renderActualVersionSelect();
    return null;
  }
}

async function loadActualLabWiring() {
  let fileName = state.actualLabFileName || currentProjectFileName();
  let response = await fetch(`${ACTUAL_LAB_ENDPOINT}/current?fileName=${encodeURIComponent(fileName)}`);
  if (!response.ok) {
    const listResponse = await fetch(`${ACTUAL_LAB_ENDPOINT}/list`);
    if (!listResponse.ok) throw new Error(t("actualUnavailable"));
    const listData = await listResponse.json();
    fileName = listData.files?.[0]?.fileName || "";
    if (!fileName) throw new Error(t("noActualVersions"));
    response = await fetch(`${ACTUAL_LAB_ENDPOINT}/current?fileName=${encodeURIComponent(fileName)}`);
  }
  if (!response.ok) throw new Error(t("actualUnavailable"));
  const data = await response.json();
  const project = parseProjectJson(data.content);
  setProject(project, {
    fileName: data.fileName,
    fileHandle: null,
    dirty: false,
    sourceText: data.content
  });
  state.actualLabFileName = data.fileName;
  state.actualLabVersions = data.versions || [];
  renderActualVersionSelect();
  showToast(t("actualLoaded", { file: data.fileName }));
}

async function publishActualLabWiring() {
  const content = currentProjectText();
  const fileName = currentProjectFileName();
  const response = await fetch(`${ACTUAL_LAB_ENDPOINT}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName,
      reason: "editor-update",
      note: "Updated from Lab Wiring Editor",
      content
    })
  });
  if (!response.ok) throw new Error(t("actualUnavailable"));
  const data = await response.json();
  state.actualLabFileName = data.fileName;
  state.fileName = data.fileName;
  state.fileHandle = null;
  state.lastSavedText = content;
  state.lastAutoSaveText = content;
  state.dirty = false;
  await refreshActualVersions(data.fileName);
  updateStatus();
  showToast(t("actualUpdated", { file: data.fileName }));
}

async function rollbackActualLabWiring() {
  const versionId = els.actualVersionSelect.value;
  if (!versionId) {
    showToast(t("noActualVersions"));
    return;
  }
  if (!window.confirm(t("rollbackConfirm"))) return;
  const fileName = state.actualLabFileName || currentProjectFileName();
  const response = await fetch(`${ACTUAL_LAB_ENDPOINT}/rollback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName,
      versionId,
      note: "Rollback from Lab Wiring Editor"
    })
  });
  if (!response.ok) throw new Error(t("actualUnavailable"));
  const data = await response.json();
  setProject(parseProjectJson(data.content), {
    fileName: data.fileName,
    fileHandle: null,
    dirty: false,
    sourceText: data.content
  });
  state.actualLabFileName = data.fileName;
  await refreshActualVersions(data.fileName);
  showToast(t("actualRolledBack", { version: data.rolledBackTo }));
}

async function runAutoSave() {
  if (!state.autoSaveEnabled) return;
  const nextText = currentProjectText();
  if (nextText === state.lastAutoSaveText) return;
  await saveProject("autosave");
}

function startAutoSaveTimer() {
  clearInterval(state.autoSaveTimer);
  state.autoSaveTimer = setInterval(() => {
    runAutoSave().catch((error) => {
      console.warn("Lab wiring autosave failed", error);
      showToast(error.message || t("backupUnavailable"));
    });
  }, AUTO_SAVE_INTERVAL_MS);
}

function setAutoSaveEnabled(enabled) {
  state.autoSaveEnabled = Boolean(enabled);
  updateAutoSaveButton();
  if (state.autoSaveEnabled) {
    runAutoSave().catch((error) => console.warn("Lab wiring autosave failed", error));
  }
}

function validateAndReport() {
  const result = validateProject(state.project);
  if (result.ok) {
    showToast(result.warnings.length ? t("validWithWarnings", { count: result.warnings.length }) : t("validProject"));
  } else {
    showToast(t("validationFailed", { message: result.errors[0] }));
  }
  renderSummary();
}

function createLocalizedPorts({ genericCount = 0, inputCount = 0, outputCount = 0 }) {
  const ports = [];
  for (let index = 1; index <= Number(genericCount || 0); index += 1) {
    ports.push(createPort({ name: t("defaultInterface", { index }), direction: "bidirectional", portType: "custom" }));
  }
  for (let index = 1; index <= Number(inputCount || 0); index += 1) {
    ports.push(createPort({ name: t("defaultInput", { index }), direction: "input", portType: "custom" }));
  }
  for (let index = 1; index <= Number(outputCount || 0); index += 1) {
    ports.push(createPort({ name: t("defaultOutput", { index }), direction: "output", portType: "custom" }));
  }
  return ports;
}

function resetDeviceForm() {
  els.deviceForm.reset();
  els.deviceForm.elements.name.value = t("newInstrument");
}

function autoArrangeDevices() {
  const devices = state.project.devices;
  if (!devices.length) return;
  for (const device of devices) ensureDeviceSize(device);

  const deviceById = new Map(devices.map((device) => [device.id, device]));
  const levels = new Map(devices.map((device) => [device.id, 0]));
  for (let pass = 0; pass < devices.length; pass += 1) {
    for (const connection of state.project.connections) {
      if (!deviceById.has(connection.from.deviceId) || !deviceById.has(connection.to.deviceId)) continue;
      const fromLevel = levels.get(connection.from.deviceId) || 0;
      const toLevel = levels.get(connection.to.deviceId) || 0;
      if (connection.from.deviceId !== connection.to.deviceId && toLevel <= fromLevel) {
        levels.set(connection.to.deviceId, fromLevel + 1);
      }
    }
  }

  if (!state.project.connections.length) {
    devices.forEach((device, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      device.position.x = 120 + column * 460;
      device.position.y = 120 + row * 320;
    });
  } else {
    const columns = new Map();
    for (const device of devices) {
      const level = levels.get(device.id) || 0;
      if (!columns.has(level)) columns.set(level, []);
      columns.get(level).push(device);
    }
    for (const [level, columnDevices] of [...columns.entries()].sort((a, b) => a[0] - b[0])) {
      columnDevices.sort((a, b) => a.name.localeCompare(b.name));
      let y = 120;
      for (const device of columnDevices) {
        ensureDeviceSize(device);
        device.position.x = 120 + level * 520;
        device.position.y = y;
        y += Math.max(device.size.height + 130, 310);
      }
    }
  }

  state.zoom = 1;
  state.pan = { x: 30, y: 30 };
  markDirty();
  render();
  showToast(t("autoArranged"));
}

function bindEvents() {
  for (const button of els.languageButtons) {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  }
  els.newProjectBtn.addEventListener("click", () => {
    setProject(createEmptyProject(t("untitled")), { dirty: true });
    showToast(t("newProjectCreated"));
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
  els.loadActualBtn.addEventListener("click", () => loadActualLabWiring().catch((error) => showToast(error.message)));
  els.publishActualBtn.addEventListener("click", () => publishActualLabWiring().catch((error) => showToast(error.message)));
  els.rollbackActualBtn.addEventListener("click", () => rollbackActualLabWiring().catch((error) => showToast(error.message)));
  els.loadExampleBtn.addEventListener("click", () => loadExample().catch((error) => showToast(error.message)));
  els.validateBtn.addEventListener("click", validateAndReport);
  els.arrangeBtn.addEventListener("click", autoArrangeDevices);
  els.autoSaveToggleBtn.addEventListener("click", () => setAutoSaveEnabled(!state.autoSaveEnabled));
  els.summaryModeBtn.addEventListener("click", () => setRightView("summary"));
  els.codeModeBtn.addEventListener("click", () => setRightView("code"));
  els.applyCodeBtn.addEventListener("click", () => applyCodeToProject());
  els.addDeviceBtn.addEventListener("click", () => {
    resetDeviceForm();
    els.deviceDialog.showModal();
  });
  els.projectTitleInput.addEventListener("change", () => {
    state.project.metadata.title = els.projectTitleInput.value.trim() || t("untitled");
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
  els.canvasViewport.addEventListener("wheel", onCanvasWheel, { passive: false });
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  els.summaryOutput.addEventListener("input", () => {
    if (state.rightView === "code") state.codeDraftDirty = true;
  });
  els.copySummaryBtn.addEventListener("click", async () => {
    await navigator.clipboard.writeText(els.summaryOutput.value);
    showToast(t("viewCopied"));
  });
  els.fallbackFileInput.addEventListener("change", async () => {
    const [file] = els.fallbackFileInput.files;
    if (!file) return;
    const text = await file.text();
    setProject(parseProjectJson(text), { fileName: file.name, fileHandle: null, dirty: false, sourceText: text });
    await writeBackup("opened", text, { quiet: true });
    els.fallbackFileInput.value = "";
    showToast(t("openedFile", { file: file.name }));
  });

  for (const button of document.querySelectorAll("[data-dialog-close]")) {
    button.addEventListener("click", () => {
      const dialog = button.closest("dialog");
      if (dialog === els.connectionDialog) {
        state.pendingPort = null;
        state.connectionDraft = null;
        render();
      }
      dialog?.close("cancel");
    });
  }

  els.deviceForm.addEventListener("submit", (event) => {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    const form = new FormData(els.deviceForm);
    const genericCount = Number(form.get("genericCount"));
    const inputCount = Number(form.get("inputCount"));
    const outputCount = Number(form.get("outputCount"));
    const rect = els.canvasViewport.getBoundingClientRect();
    const center = screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const device = createDevice(state.project, {
      name: form.get("name"),
      kind: form.get("kind"),
      ports: createLocalizedPorts({ genericCount, inputCount, outputCount }),
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
      showToast(t("connectionCreated"));
    } catch (error) {
      showToast(activeLanguage === "zh" ? t("invalidConnection") : error.message);
    }
  });

  els.portTypeForm.addEventListener("submit", (event) => {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    const form = new FormData(els.portTypeForm);
    const cleanName = String(form.get("name") || "").trim();
    if (!cleanName) {
      showToast(t("customPortTypeEmpty"));
      return;
    }
    const portType = createPortType(state.project, {
      name: cleanName,
      color: String(form.get("color") || "#64748b")
    });
    els.portTypeDialog.close();
    showToast(t("customPortTypeCreated", { name: portType.name }));
    markDirty();
    render();
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
      state.connectionQuickPoint = null;
      markDirty();
      render();
    }
  });
}

bindEvents();
render();
state.lastSavedText = currentProjectText();
state.lastAutoSaveText = state.lastSavedText;
startAutoSaveTimer();
refreshActualVersions().catch((error) => console.warn("Initial actual lab versions failed", error));
