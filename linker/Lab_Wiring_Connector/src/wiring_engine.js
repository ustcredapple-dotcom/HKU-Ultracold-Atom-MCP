export const PROJECT_KIND = "hku.ultracold.lab_wiring_project";
export const SCHEMA_VERSION = 1;

export const CABLE_TYPES = [
  { id: "bnc", name: "BNC", color: "#2563eb", stroke: 3, dash: "" },
  { id: "sma", name: "SMA/RF", color: "#dc2626", stroke: 3, dash: "" },
  { id: "ttl", name: "TTL trigger", color: "#15803d", stroke: 3, dash: "" },
  { id: "fiber", name: "Optical fiber", color: "#9333ea", stroke: 3, dash: "2 5" },
  { id: "free-space", name: "Free-space beam", color: "#ea580c", stroke: 4, dash: "10 6" },
  { id: "ethernet", name: "Ethernet", color: "#0f766e", stroke: 3, dash: "" },
  { id: "usb", name: "USB", color: "#475569", stroke: 3, dash: "" },
  { id: "power", name: "Power", color: "#111827", stroke: 4, dash: "" },
  { id: "custom", name: "Custom", color: "#64748b", stroke: 3, dash: "4 4" }
];

export const DEFAULT_PORT_TYPES = [
  { id: "ttl", name: "TTL", color: "#15803d", description: "Digital trigger/control port." },
  { id: "dac", name: "DAC", color: "#2563eb", description: "Digital-to-analog output." },
  { id: "adc", name: "ADC", color: "#0284c7", description: "Analog-to-digital input." },
  { id: "rf", name: "RF", color: "#dc2626", description: "Radio-frequency signal port." },
  { id: "analog", name: "Analog", color: "#7c3aed", description: "General analog signal port." },
  { id: "digital", name: "Digital", color: "#16a34a", description: "General digital signal port." },
  { id: "laser", name: "Laser", color: "#f97316", description: "Laser beam or laser-control topology port." },
  { id: "camera_image", name: "Camera image", color: "#0891b2", description: "Camera frame, photo, or image-data topology port." },
  { id: "optical", name: "Optical", color: "#ea580c", description: "Optical beam or fiber interface." },
  { id: "ethernet", name: "Ethernet", color: "#0f766e", description: "Network interface." },
  { id: "usb", name: "USB", color: "#475569", description: "USB interface." },
  { id: "power", name: "Power", color: "#111827", description: "Power input or output." },
  { id: "custom", name: "Custom", color: "#64748b", description: "User-defined or unspecified port type." }
];

export function nowIso() {
  return new Date().toISOString();
}

export function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}_${globalThis.crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function slugifyId(value, prefix = "custom") {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return slug ? `${prefix}_${slug}` : makeId(prefix);
}

export function defaultPortTypes() {
  return DEFAULT_PORT_TYPES.map((item) => ({ ...item, builtin: true }));
}

export function ensurePortTypes(project) {
  const merged = new Map();
  for (const item of defaultPortTypes()) merged.set(item.id, item);
  for (const item of project.portTypes || []) {
    if (!item?.id) continue;
    merged.set(item.id, {
      name: item.name || item.id,
      color: item.color || "#64748b",
      description: item.description || "",
      builtin: Boolean(item.builtin),
      ...item
    });
  }
  project.portTypes = [...merged.values()];
  return project.portTypes;
}

export function getPortType(project, portTypeId) {
  ensurePortTypes(project);
  return project.portTypes.find((item) => item.id === portTypeId) || project.portTypes.find((item) => item.id === "custom");
}

export function createPortType(project, spec = {}) {
  ensurePortTypes(project);
  const id = spec.id || slugifyId(spec.name, "porttype");
  const existing = project.portTypes.find((item) => item.id === id);
  if (existing) return existing;
  const portType = {
    id,
    name: String(spec.name || "Custom").trim(),
    color: spec.color || "#64748b",
    description: spec.description || "",
    builtin: false
  };
  project.portTypes.push(portType);
  touchProject(project);
  return portType;
}

function inferPortType(port) {
  const text = [port.name, port.signalType, port.medium, port.connectorType, port.notes].join(" ").toLowerCase();
  if (text.includes("ttl")) return "ttl";
  if (text.includes("dac")) return "dac";
  if (text.includes("adc")) return "adc";
  if (text.includes("rf") || text.includes("sma")) return "rf";
  if (text.includes("analog")) return "analog";
  if (text.includes("digital")) return "digital";
  if (text.includes("laser")) return "laser";
  if (text.includes("camera") || text.includes("image") || text.includes("photo") || text.includes("frame")) return "camera_image";
  if (text.includes("optical") || text.includes("fiber") || text.includes("beam")) return "optical";
  if (text.includes("ethernet")) return "ethernet";
  if (text.includes("usb")) return "usb";
  if (text.includes("power")) return "power";
  return "custom";
}

export function createEmptyProject(title = "Untitled lab wiring") {
  const timestamp = nowIso();
  return {
    kind: PROJECT_KIND,
    schemaVersion: SCHEMA_VERSION,
    metadata: {
      projectId: makeId("labwire"),
      title,
      description: "",
      author: "",
      tags: [],
      createdAt: timestamp,
      updatedAt: timestamp
    },
    portTypes: defaultPortTypes(),
    devices: [],
    connections: [],
    canvas: {
      zoom: 1,
      pan: { x: 0, y: 0 }
    }
  };
}

export function touchProject(project) {
  project.metadata = project.metadata || {};
  project.metadata.updatedAt = nowIso();
  return project;
}

export function createPort({ name, direction, portType = "custom", signalType = "", medium = "", connectorType = "", notes = "" }) {
  return {
    id: makeId("port"),
    name: String(name || "Port").trim(),
    direction,
    portType,
    signalType,
    medium,
    connectorType,
    notes
  };
}

export function createDefaultPorts({ genericCount = 0, inputCount = 0, outputCount = 0 }) {
  const ports = [];
  for (let index = 1; index <= Number(genericCount || 0); index += 1) {
    ports.push(createPort({ name: `Interface ${index}`, direction: "bidirectional", portType: "custom" }));
  }
  for (let index = 1; index <= Number(inputCount || 0); index += 1) {
    ports.push(createPort({ name: `Input ${index}`, direction: "input", portType: "custom" }));
  }
  for (let index = 1; index <= Number(outputCount || 0); index += 1) {
    ports.push(createPort({ name: `Output ${index}`, direction: "output", portType: "custom" }));
  }
  return ports;
}

export function createDevice(project, spec = {}) {
  const ports = spec.ports || createDefaultPorts(spec);
  const device = {
    id: spec.id || makeId("device"),
    name: String(spec.name || "New device").trim(),
    kind: spec.kind || "instrument",
    manufacturer: spec.manufacturer || "",
    model: spec.model || "",
    serialNumber: spec.serialNumber || "",
    location: spec.location || "",
    notes: spec.notes || "",
    position: {
      x: Number(spec.x ?? spec.position?.x ?? 160),
      y: Number(spec.y ?? spec.position?.y ?? 120)
    },
    size: {
      width: Number(spec.width ?? spec.size?.width ?? 240),
      height: Number(spec.height ?? spec.size?.height ?? Math.max(150, 88 + ports.length * 22))
    },
    ports
  };
  project.devices.push(device);
  touchProject(project);
  return device;
}

export function getDevice(project, deviceId) {
  return project.devices.find((device) => device.id === deviceId) || null;
}

export function getPort(project, deviceId, portId) {
  const device = getDevice(project, deviceId);
  if (!device) return null;
  return device.ports.find((port) => port.id === portId) || null;
}

export function describeEndpoint(project, endpoint) {
  const device = getDevice(project, endpoint.deviceId);
  const port = getPort(project, endpoint.deviceId, endpoint.portId);
  return {
    deviceId: endpoint.deviceId,
    portId: endpoint.portId,
    deviceName: device?.name || endpoint.deviceId,
    portName: port?.name || endpoint.portId,
    direction: port?.direction || "unknown"
  };
}

export function canConnect(project, from, to) {
  const errors = [];
  const fromPort = getPort(project, from.deviceId, from.portId);
  const toPort = getPort(project, to.deviceId, to.portId);

  if (!fromPort) errors.push("First endpoint does not exist.");
  if (!toPort) errors.push("Second endpoint does not exist.");
  if (from.deviceId === to.deviceId && from.portId === to.portId) {
    errors.push("A port cannot connect to itself.");
  }
  if (fromPort && toPort) {
    const invalidOutputToOutput = fromPort.direction === "output" && toPort.direction === "output";
    const invalidInputToInput = fromPort.direction === "input" && toPort.direction === "input";
    if (invalidOutputToOutput || invalidInputToInput) {
      errors.push("Connecting two pure inputs or two pure outputs is allowed only after changing one port to bidirectional.");
    }
  }

  return { ok: errors.length === 0, errors };
}

export function createConnection(project, spec = {}) {
  const check = canConnect(project, spec.from, spec.to);
  if (!check.ok) {
    throw new Error(check.errors.join(" "));
  }

  const cable = CABLE_TYPES.find((item) => item.id === spec.cableType) || CABLE_TYPES.at(-1);
  const connection = {
    id: spec.id || makeId("connection"),
    name: String(spec.name || "").trim(),
    from: { deviceId: spec.from.deviceId, portId: spec.from.portId },
    to: { deviceId: spec.to.deviceId, portId: spec.to.portId },
    cableType: spec.cableType || cable.id,
    signalType: spec.signalType || "",
    color: spec.color || cable.color,
    label: spec.label || "",
    notes: spec.notes || ""
  };
  project.connections.push(connection);
  touchProject(project);
  return connection;
}

export function deleteDevice(project, deviceId) {
  project.devices = project.devices.filter((device) => device.id !== deviceId);
  project.connections = project.connections.filter((connection) => {
    return connection.from.deviceId !== deviceId && connection.to.deviceId !== deviceId;
  });
  touchProject(project);
}

export function deleteConnection(project, connectionId) {
  project.connections = project.connections.filter((connection) => connection.id !== connectionId);
  touchProject(project);
}

export function validateProject(project) {
  const errors = [];
  const warnings = [];

  if (!project || typeof project !== "object") {
    return { ok: false, errors: ["Project is not an object."], warnings };
  }
  if (project.kind !== PROJECT_KIND) errors.push(`Unknown project kind: ${project.kind || "(missing)"}`);
  if (!Array.isArray(project.devices)) errors.push("devices must be an array.");
  if (!Array.isArray(project.connections)) errors.push("connections must be an array.");

  const deviceIds = new Set();
  const endpointKeys = new Set();
  for (const device of project.devices || []) {
    if (!device.id) errors.push(`Device "${device.name || "(unnamed)"}" has no id.`);
    if (deviceIds.has(device.id)) errors.push(`Duplicate device id: ${device.id}`);
    deviceIds.add(device.id);
    if (!Array.isArray(device.ports)) errors.push(`Device ${device.id} ports must be an array.`);
    const portIds = new Set();
    for (const port of device.ports || []) {
      if (!port.portType) port.portType = inferPortType(port);
      if (!port.id) errors.push(`Device ${device.id} has a port without id.`);
      if (portIds.has(port.id)) errors.push(`Duplicate port id on ${device.id}: ${port.id}`);
      if (!["input", "output", "bidirectional"].includes(port.direction)) {
        errors.push(`Port ${device.id}.${port.id} has invalid direction: ${port.direction}`);
      }
      if (port.portType && !getPortType(project, port.portType)) {
        warnings.push(`Port ${device.id}.${port.id} references an unknown port type: ${port.portType}`);
      }
      portIds.add(port.id);
      endpointKeys.add(`${device.id}.${port.id}`);
    }
  }

  const connectionIds = new Set();
  for (const connection of project.connections || []) {
    if (!connection.id) errors.push("A connection has no id.");
    if (connectionIds.has(connection.id)) errors.push(`Duplicate connection id: ${connection.id}`);
    connectionIds.add(connection.id);
    for (const side of ["from", "to"]) {
      const endpoint = connection[side];
      if (!endpoint || !endpoint.deviceId || !endpoint.portId) {
        errors.push(`Connection ${connection.id || "(unknown)"} has an invalid ${side} endpoint.`);
        continue;
      }
      if (!endpointKeys.has(`${endpoint.deviceId}.${endpoint.portId}`)) {
        errors.push(`Connection ${connection.id} references missing endpoint ${endpoint.deviceId}.${endpoint.portId}.`);
      }
    }
    if (!connection.label && !connection.name) {
      warnings.push(`Connection ${connection.id} has no label or name.`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function normalizeProject(project) {
  if (project.kind !== PROJECT_KIND) {
    throw new Error("This is not a HKU lab wiring project file.");
  }
  project.schemaVersion = Number(project.schemaVersion || SCHEMA_VERSION);
  project.metadata = {
    title: "Untitled lab wiring",
    description: "",
    author: "",
    tags: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...project.metadata
  };
  project.devices = Array.isArray(project.devices) ? project.devices : [];
  project.connections = Array.isArray(project.connections) ? project.connections : [];
  ensurePortTypes(project);
  for (const device of project.devices) {
    for (const port of device.ports || []) {
      if (!port.portType) port.portType = inferPortType(port);
    }
  }
  project.canvas = {
    zoom: 1,
    pan: { x: 0, y: 0 },
    ...(project.canvas || {})
  };
  return project;
}

export function parseProjectJson(text) {
  return normalizeProject(JSON.parse(text));
}

export function stringifyProject(project) {
  touchProject(project);
  return `${JSON.stringify(project, null, 2)}\n`;
}

export function summarizeProject(project) {
  const lines = [];
  lines.push(`Project: ${project.metadata?.title || "Untitled"}`);
  if (project.metadata?.description) lines.push(`Description: ${project.metadata.description}`);
  lines.push(`Devices: ${project.devices.length}`);
  for (const device of project.devices) {
    lines.push(`- ${device.name} (${device.kind || "device"}, id=${device.id})`);
    for (const port of device.ports || []) {
      const portType = getPortType(project, port.portType);
      const details = [port.direction, portType?.name, port.signalType, port.medium, port.connectorType].filter(Boolean).join(", ");
      lines.push(`  - ${port.name} [${details || "port"}]`);
    }
  }
  lines.push(`Connections: ${project.connections.length}`);
  for (const connection of project.connections) {
    const from = describeEndpoint(project, connection.from);
    const to = describeEndpoint(project, connection.to);
    const label = connection.label || connection.name || connection.cableType;
    lines.push(`- ${label}: ${from.deviceName}.${from.portName} -- ${to.deviceName}.${to.portName} (${connection.cableType})`);
  }
  return lines.join("\n");
}
