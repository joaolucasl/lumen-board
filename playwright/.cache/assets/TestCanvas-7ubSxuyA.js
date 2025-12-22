import { g as getDefaultExportFromCjs, r as reactExports, R as React } from './index-Bwt6JDL4.js';

var jsxRuntime$2 = {exports: {}};

var reactJsxRuntime_production = {};

/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production;

function requireReactJsxRuntime_production () {
	if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
	hasRequiredReactJsxRuntime_production = 1;
	"use strict";
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
	  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
	  var key = null;
	  void 0 !== maybeKey && (key = "" + maybeKey);
	  void 0 !== config.key && (key = "" + config.key);
	  if ("key" in config) {
	    maybeKey = {};
	    for (var propName in config)
	      "key" !== propName && (maybeKey[propName] = config[propName]);
	  } else maybeKey = config;
	  config = maybeKey.ref;
	  return {
	    $$typeof: REACT_ELEMENT_TYPE,
	    type: type,
	    key: key,
	    ref: void 0 !== config ? config : null,
	    props: maybeKey
	  };
	}
	reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
	reactJsxRuntime_production.jsx = jsxProd;
	reactJsxRuntime_production.jsxs = jsxProd;
	return reactJsxRuntime_production;
}

var jsxRuntime$1 = jsxRuntime$2.exports;

var hasRequiredJsxRuntime;

function requireJsxRuntime () {
	if (hasRequiredJsxRuntime) return jsxRuntime$2.exports;
	hasRequiredJsxRuntime = 1;
	"use strict";
	if (true) {
	  jsxRuntime$2.exports = requireReactJsxRuntime_production();
	} else {
	  module.exports = require("./cjs/react-jsx-runtime.development.js");
	}
	return jsxRuntime$2.exports;
}

var jsxRuntimeExports = requireJsxRuntime();
const jsxRuntime = /*@__PURE__*/getDefaultExportFromCjs(jsxRuntimeExports);

const INITIAL_STATE = {
  version: 1,
  view: { x: 0, y: 0, zoom: 1 },
  elements: {},
  connections: []
};
const GRID_SIZE = 20;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 1.05;
const WHEEL_ZOOM_STEP = 1e-3;
const DEFAULT_ELEMENT_WIDTH = 150;
const DEFAULT_ELEMENT_HEIGHT = 100;
const DEFAULT_TEXT_WIDTH = 200;
const DEFAULT_TEXT_HEIGHT = 40;
const DEFAULT_CUSTOM_WIDTH = 180;
const DEFAULT_CUSTOM_HEIGHT = 120;
const MIN_ELEMENT_SIZE = 20;
const MAX_ELEMENT_SIZE = 5e3;
const MAX_COORDINATE = 1e5;
const DEFAULTS = {
  backgroundColor: "#ffffff",
  strokeColor: "#000000",
  strokeWidth: 2,
  opacity: 1,
  rotation: 0,
  connectionWidth: 2,
  connectionCurvature: 0.5
};

function createId({ prefix, includeRandomSuffix = false }) {
  const ts = Date.now();
  if (!includeRandomSuffix) return `${prefix}_${ts}`;
  return `${prefix}_${ts}_${Math.random().toString(36).substr(2, 9)}`;
}
function createElementId(includeRandomSuffix = false) {
  return createId({ prefix: "el", includeRandomSuffix });
}
function createConnectionId(includeRandomSuffix = false) {
  return createId({ prefix: "conn", includeRandomSuffix });
}

function getDefaultElementSize(type) {
  if (type === "text") {
    return { width: DEFAULT_TEXT_WIDTH, height: DEFAULT_TEXT_HEIGHT };
  }
  if (type === "custom") {
    return { width: DEFAULT_CUSTOM_WIDTH, height: DEFAULT_CUSTOM_HEIGHT };
  }
  return { width: DEFAULT_ELEMENT_WIDTH, height: DEFAULT_ELEMENT_HEIGHT };
}

function screenToWorldPoint(clientX, clientY, rect, view) {
  return {
    x: (clientX - rect.left - view.x) / view.zoom,
    y: (clientY - rect.top - view.y) / view.zoom
  };
}
function worldToScreenPoint(worldX, worldY, rect, view) {
  return {
    x: worldX * view.zoom + view.x + rect.left,
    y: worldY * view.zoom + view.y + rect.top
  };
}
function clampZoom(level, min, max) {
  return Math.min(max, Math.max(min, level));
}

function deleteElementsFromMap(elements, ids) {
  if (ids.length === 0) return elements;
  const next = { ...elements };
  for (const id of ids) {
    delete next[id];
  }
  return next;
}
function updateElementsInMap(elements, updates) {
  if (updates.length === 0) return { elements, updated: [] };
  const next = { ...elements };
  const updated = [];
  for (const update of updates) {
    const { id, ...changes } = update;
    const existing = next[id];
    if (!existing) continue;
    const merged = { ...existing, ...changes };
    next[id] = merged;
    updated.push(merged);
  }
  return { elements: next, updated };
}

function deleteConnectionsForElements(connections, elementIds) {
  if (elementIds.length === 0) return connections;
  const idSet = new Set(elementIds);
  return connections.filter((c) => !idSet.has(c.sourceId) && !idSet.has(c.targetId));
}

const clampCoordinate = (val) => Math.min(Math.max(-MAX_COORDINATE, val), MAX_COORDINATE);
const clampDimension = (val) => Math.min(Math.max(MIN_ELEMENT_SIZE, val), MAX_ELEMENT_SIZE);
function useInfiniteCanvasApi({
  sceneRef,
  selectedIdsRef,
  containerRef,
  updateScene,
  handleSelection
}) {
  return reactExports.useMemo(() => {
    const screenToWorld = (screenX, screenY) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return screenToWorldPoint(screenX, screenY, rect, sceneRef.current.view);
    };
    const worldToScreen = (worldX, worldY) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return worldToScreenPoint(worldX, worldY, rect, sceneRef.current.view);
    };
    return {
      exportJson: () => sceneRef.current,
      importJson: (data) => updateScene(() => data),
      zoomIn: (amount = ZOOM_STEP) => updateScene((s) => ({
        ...s,
        view: { ...s.view, zoom: clampZoom(s.view.zoom * amount, MIN_ZOOM, MAX_ZOOM) }
      })),
      zoomOut: (amount = ZOOM_STEP) => updateScene((s) => ({
        ...s,
        view: { ...s.view, zoom: clampZoom(s.view.zoom / amount, MIN_ZOOM, MAX_ZOOM) }
      })),
      fitView: () => {
        updateScene((s) => ({ ...s, view: { x: 0, y: 0, zoom: 1 } }));
      },
      selectElements: (ids) => handleSelection(ids),
      createElement: (options) => {
        const defaults = getDefaultElementSize(options.type);
        const center = (() => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return { x: 0, y: 0 };
          return screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
        })();
        const newElement = {
          id: options.id || createElementId(true),
          type: options.type,
          x: clampCoordinate(options.x ?? center.x - (options.width ?? defaults.width) / 2),
          y: clampCoordinate(options.y ?? center.y - (options.height ?? defaults.height) / 2),
          width: clampDimension(options.width ?? defaults.width),
          height: clampDimension(options.height ?? defaults.height),
          rotation: options.rotation ?? DEFAULTS.rotation,
          opacity: options.opacity ?? DEFAULTS.opacity,
          backgroundColor: options.backgroundColor ?? DEFAULTS.backgroundColor,
          strokeColor: options.strokeColor ?? DEFAULTS.strokeColor,
          strokeWidth: options.strokeWidth ?? DEFAULTS.strokeWidth,
          text: options.text,
          componentType: options.componentType,
          props: options.props,
          locked: options.locked ?? false
        };
        updateScene((prev) => ({
          ...prev,
          elements: { ...prev.elements, [newElement.id]: newElement }
        }));
        return newElement;
      },
      createElements: (optionsList) => {
        const rect = containerRef.current?.getBoundingClientRect();
        const center = rect ? screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2) : { x: 0, y: 0 };
        const newElements = optionsList.map((options) => {
          const defaults = getDefaultElementSize(options.type);
          return {
            id: options.id || createElementId(true),
            type: options.type,
            x: clampCoordinate(options.x ?? center.x - (options.width ?? defaults.width) / 2),
            y: clampCoordinate(options.y ?? center.y - (options.height ?? defaults.height) / 2),
            width: clampDimension(options.width ?? defaults.width),
            height: clampDimension(options.height ?? defaults.height),
            rotation: options.rotation ?? DEFAULTS.rotation,
            opacity: options.opacity ?? DEFAULTS.opacity,
            backgroundColor: options.backgroundColor ?? DEFAULTS.backgroundColor,
            strokeColor: options.strokeColor ?? DEFAULTS.strokeColor,
            strokeWidth: options.strokeWidth ?? DEFAULTS.strokeWidth,
            text: options.text,
            componentType: options.componentType,
            props: options.props,
            locked: options.locked ?? false
          };
        });
        updateScene((prev) => {
          const nextElements = { ...prev.elements };
          newElements.forEach((el) => {
            nextElements[el.id] = el;
          });
          return { ...prev, elements: nextElements };
        });
        return newElements;
      },
      updateElement: (id, updates) => {
        let updatedElement;
        updateScene((prev) => {
          const element = prev.elements[id];
          if (!element) {
            if (false) {
              console.warn(`[LumenBoard] updateElement: Element with id '${id}' not found`);
            }
            return prev;
          }
          const newWidth = updates.width !== void 0 ? clampDimension(updates.width) : element.width;
          const newHeight = updates.height !== void 0 ? clampDimension(updates.height) : element.height;
          const newX = updates.x !== void 0 ? clampCoordinate(updates.x) : element.x;
          const newY = updates.y !== void 0 ? clampCoordinate(updates.y) : element.y;
          updatedElement = { ...element, ...updates, x: newX, y: newY, width: newWidth, height: newHeight };
          return {
            ...prev,
            elements: { ...prev.elements, [id]: updatedElement }
          };
        });
        return updatedElement || sceneRef.current.elements[id];
      },
      updateElements: (updates) => {
        let updatedElements = [];
        updateScene((prev) => {
          const result = updateElementsInMap(prev.elements, updates);
          updatedElements = result.updated;
          return { ...prev, elements: result.elements };
        });
        return updatedElements;
      },
      deleteElement: (id) => {
        if (!sceneRef.current.elements[id]) {
          if (false) {
            console.warn(`[LumenBoard] deleteElement: Element with id '${id}' not found`);
          }
          return false;
        }
        updateScene((prev) => {
          const nextElements = deleteElementsFromMap(prev.elements, [id]);
          const nextConnections = deleteConnectionsForElements(prev.connections, [id]);
          return { ...prev, elements: nextElements, connections: nextConnections };
        });
        if (selectedIdsRef.current.includes(id)) {
          handleSelection(selectedIdsRef.current.filter((sid) => sid !== id));
        }
        return true;
      },
      deleteElements: (ids) => {
        const existingIds = ids.filter((id) => Boolean(sceneRef.current.elements[id]));
        if (existingIds.length === 0) return false;
        updateScene((prev) => {
          const nextElements = deleteElementsFromMap(prev.elements, existingIds);
          const nextConnections = deleteConnectionsForElements(prev.connections, existingIds);
          return { ...prev, elements: nextElements, connections: nextConnections };
        });
        handleSelection(selectedIdsRef.current.filter((sid) => !existingIds.includes(sid)));
        return true;
      },
      getElement: (id) => sceneRef.current.elements[id],
      getElements: (ids) => {
        if (!ids) return Object.values(sceneRef.current.elements);
        return ids.map((id) => sceneRef.current.elements[id]).filter(Boolean);
      },
      createConnection: (options) => {
        const newConnection = {
          id: options.id || createConnectionId(true),
          sourceId: options.sourceId,
          targetId: options.targetId,
          sourceHandle: options.sourceHandle === "auto" ? void 0 : options.sourceHandle,
          targetHandle: options.targetHandle === "auto" ? void 0 : options.targetHandle,
          style: {
            strokeColor: options.style?.strokeColor ?? DEFAULTS.strokeColor,
            width: options.style?.width ?? DEFAULTS.connectionWidth,
            curvature: options.style?.curvature ?? DEFAULTS.connectionCurvature
          }
        };
        updateScene((prev) => ({
          ...prev,
          connections: [...prev.connections, newConnection]
        }));
        return newConnection;
      },
      createConnections: (optionsList) => {
        const newConnections = optionsList.map((options) => ({
          id: options.id || createConnectionId(true),
          sourceId: options.sourceId,
          targetId: options.targetId,
          sourceHandle: options.sourceHandle === "auto" ? void 0 : options.sourceHandle,
          targetHandle: options.targetHandle === "auto" ? void 0 : options.targetHandle,
          style: {
            strokeColor: options.style?.strokeColor ?? DEFAULTS.strokeColor,
            width: options.style?.width ?? DEFAULTS.connectionWidth,
            curvature: options.style?.curvature ?? DEFAULTS.connectionCurvature
          }
        }));
        updateScene((prev) => ({
          ...prev,
          connections: [...prev.connections, ...newConnections]
        }));
        return newConnections;
      },
      updateConnection: (id, updates) => {
        let updatedConnection;
        updateScene((prev) => {
          const idx = prev.connections.findIndex((c) => c.id === id);
          if (idx === -1) {
            if (false) {
              console.warn(`[LumenBoard] updateConnection: Connection with id '${id}' not found`);
            }
            return prev;
          }
          updatedConnection = { ...prev.connections[idx], ...updates };
          const newConnections = [...prev.connections];
          newConnections[idx] = updatedConnection;
          return { ...prev, connections: newConnections };
        });
        return updatedConnection || sceneRef.current.connections.find((c) => c.id === id);
      },
      deleteConnection: (id) => {
        const exists = sceneRef.current.connections.some((c) => c.id === id);
        if (!exists) {
          if (false) {
            console.warn(`[LumenBoard] deleteConnection: Connection with id '${id}' not found`);
          }
          return false;
        }
        updateScene((prev) => ({
          ...prev,
          connections: prev.connections.filter((c) => c.id !== id)
        }));
        return true;
      },
      deleteConnections: (ids) => {
        const existingIds = ids.filter((id) => sceneRef.current.connections.some((c) => c.id === id));
        if (existingIds.length === 0) return false;
        updateScene((prev) => ({
          ...prev,
          connections: prev.connections.filter((c) => !existingIds.includes(c.id))
        }));
        return true;
      },
      getConnection: (id) => sceneRef.current.connections.find((c) => c.id === id),
      getConnections: (elementId) => {
        if (!elementId) return sceneRef.current.connections;
        return sceneRef.current.connections.filter((c) => c.sourceId === elementId || c.targetId === elementId);
      },
      getConnectionsBetween: (sourceId, targetId) => {
        return sceneRef.current.connections.filter((c) => c.sourceId === sourceId && c.targetId === targetId);
      },
      getViewportCenter: () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
      },
      getViewportBounds: () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0, width: 0, height: 0 };
        const tl = screenToWorld(rect.left, rect.top);
        const br = screenToWorld(rect.right, rect.bottom);
        return {
          x: tl.x,
          y: tl.y,
          width: br.x - tl.x,
          height: br.y - tl.y
        };
      },
      screenToWorld,
      worldToScreen,
      panTo: (x, y) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        updateScene((s) => ({
          ...s,
          view: {
            ...s.view,
            x: centerX - x * s.view.zoom,
            y: centerY - y * s.view.zoom
          }
        }));
      },
      panToElement: (id) => {
        const el = sceneRef.current.elements[id];
        if (!el) {
          if (false) {
            console.warn(`[LumenBoard] panToElement: Element with id '${id}' not found`);
          }
          return false;
        }
        const centerX = el.x + el.width / 2;
        const centerY = el.y + el.height / 2;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return false;
        const viewCX = rect.width / 2;
        const viewCY = rect.height / 2;
        updateScene((s) => ({
          ...s,
          view: {
            ...s.view,
            x: viewCX - centerX * s.view.zoom,
            y: viewCY - centerY * s.view.zoom
          }
        }));
        return true;
      },
      setZoom: (level, focalPoint) => {
        updateScene((s) => {
          const newZoom = clampZoom(level, MIN_ZOOM, MAX_ZOOM);
          if (!focalPoint) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return { ...s, view: { ...s.view, zoom: newZoom } };
            const viewCX = rect.width / 2;
            const viewCY = rect.height / 2;
            const worldCX = (viewCX - s.view.x) / s.view.zoom;
            const worldCY = (viewCY - s.view.y) / s.view.zoom;
            const newViewX = viewCX - worldCX * newZoom;
            const newViewY = viewCY - worldCY * newZoom;
            return { ...s, view: { x: newViewX, y: newViewY, zoom: newZoom } };
          }
          return { ...s, view: { ...s.view, zoom: newZoom } };
        });
      },
      selectAll: () => handleSelection(Object.keys(sceneRef.current.elements)),
      clearSelection: () => handleSelection([]),
      getSelectedIds: () => selectedIdsRef.current,
      focusElement: (id, options = {}) => {
        const el = sceneRef.current.elements[id];
        if (!el) {
          if (false) {
            console.warn(`[LumenBoard] focusElement: Element with id '${id}' not found`);
          }
          return false;
        }
        handleSelection([id]);
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return false;
        updateScene((s) => {
          const zoom = options.zoom ?? s.view.zoom;
          const centerX = el.x + el.width / 2;
          const centerY = el.y + el.height / 2;
          return {
            ...s,
            view: {
              x: rect.width / 2 - centerX * zoom,
              y: rect.height / 2 - centerY * zoom,
              zoom
            }
          };
        });
        return true;
      },
      focusElements: (ids, options = {}) => {
        if (ids.length === 0) return false;
        handleSelection(ids);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let found = false;
        ids.forEach((id) => {
          const el = sceneRef.current.elements[id];
          if (el) {
            found = true;
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + el.width);
            maxY = Math.max(maxY, el.y + el.height);
          }
        });
        if (!found) {
          if (false) {
            console.warn(`[LumenBoard] focusElements: No elements found for ids: ${ids.join(", ")}`);
          }
          return false;
        }
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return false;
        const padding = options.padding ?? 50;
        const contentW = maxX - minX + padding * 2;
        const contentH = maxY - minY + padding * 2;
        const zoomW = rect.width / contentW;
        const zoomH = rect.height / contentH;
        const zoom = Math.min(Math.min(zoomW, zoomH), MAX_ZOOM);
        const centerX = minX + (maxX - minX) / 2;
        const centerY = minY + (maxY - minY) / 2;
        updateScene((s) => ({
          ...s,
          view: {
            x: rect.width / 2 - centerX * zoom,
            y: rect.height / 2 - centerY * zoom,
            zoom
          }
        }));
        return true;
      }
    };
  }, [containerRef, handleSelection, sceneRef, selectedIdsRef, updateScene]);
}

class ErrorBoundary extends reactExports.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.props.onError?.(error, errorInfo);
    if (false) {
      console.error("[LumenBoard] Error in custom component:", error, errorInfo);
    }
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: "lb-error-boundary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "rect",
          {
            width: "100%",
            height: "100%",
            fill: "#fee2e2",
            stroke: "#ef4444",
            strokeWidth: 1,
            rx: 4
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "text",
          {
            x: "50%",
            y: "50%",
            textAnchor: "middle",
            dominantBaseline: "middle",
            fill: "#dc2626",
            fontSize: 12,
            children: "Component Error"
          }
        )
      ] });
    }
    return this.props.children;
  }
}

const ElementRenderer = ({ element, isSelected, customComponent: CustomComp, cursor }) => {
  const { id, type, x, y, width, height, rotation, backgroundColor, strokeColor, strokeWidth, opacity, text } = element;
  const commonProps = {
    "data-element-id": id,
    fill: backgroundColor || "#ffffff",
    stroke: strokeColor || "#000000",
    strokeWidth: strokeWidth || 2,
    style: { cursor, opacity }
  };
  const transform = `rotate(${rotation}, ${x + width / 2}, ${y + height / 2})`;
  const renderShape = () => {
    switch (type) {
      case "rectangle":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x, y, width, height, rx: 4, ry: 4, ...commonProps });
      case "ellipse":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: x + width / 2, cy: y + height / 2, rx: width / 2, ry: height / 2, ...commonProps });
      case "diamond":
        const points = `${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points, ...commonProps });
      case "text":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform, "data-element-id": id, style: { cursor, opacity }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "text",
            {
              x: x + width / 2,
              y: y + height / 2,
              textAnchor: "middle",
              dominantBaseline: "middle",
              className: "lb-element-text",
              style: { fontSize: 16, fill: strokeColor },
              children: text
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x, y, width, height, fill: "transparent", stroke: isSelected ? "#3b82f6" : "transparent", strokeWidth: 1 })
        ] });
      case "custom":
        if (!CustomComp) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("foreignObject", { x, y, width, height, transform, "data-element-id": id, style: { cursor, opacity }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `lb-element-container ${isSelected ? "lb-element-container--selected" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomComp, { width, height, data: element.props }) }) }) });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: type !== "text" ? transform : "", children: [
    renderShape(),
    isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "rect",
      {
        x: x - 4,
        y: y - 4,
        width: width + 8,
        height: height + 8,
        className: "lb-selection-rect"
      }
    )
  ] });
};
const ElementRenderer$1 = React.memo(ElementRenderer);

const ConnectionRenderer = ({ connection, elements, isSelected = false, cursor }) => {
  const source = elements[connection.sourceId];
  const target = elements[connection.targetId];
  if (!source || !target) {
    if (false) {
      console.warn(
        `[LumenBoard] Connection ${connection.id} has missing ${!source ? "source" : "target"} element (source: ${connection.sourceId}, target: ${connection.targetId})`
      );
    }
    return null;
  }
  const getCenter = (el) => ({
    x: el.x + el.width / 2,
    y: el.y + el.height / 2
  });
  const p1 = getCenter(source);
  const p2 = getCenter(target);
  const curvature = connection.style?.curvature ?? 0.5;
  const dx = Math.abs(p2.x - p1.x) * curvature;
  const dy = Math.abs(p2.y - p1.y) * curvature;
  const cp1 = { x: p1.x + (p2.x > p1.x ? dx : -dx), y: p1.y };
  const cp2 = { x: p2.x + (p2.x > p1.x ? -dx : dx), y: p2.y };
  const path = `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p2.x} ${p2.y}`;
  const strokeColor = connection.style?.strokeColor || "#000";
  const strokeWidth = connection.style?.width || 2;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        d: path,
        fill: "none",
        stroke: "transparent",
        strokeWidth: Math.max(12, strokeWidth + 10),
        strokeLinecap: "round",
        pointerEvents: "stroke",
        "data-connection-id": connection.id,
        style: { cursor }
      }
    ),
    isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        d: path,
        fill: "none",
        stroke: "#3b82f6",
        strokeOpacity: 0.35,
        strokeWidth: strokeWidth + 6,
        strokeLinecap: "round",
        pointerEvents: "none"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        d: path,
        fill: "none",
        stroke: isSelected ? "#3b82f6" : strokeColor,
        strokeWidth: isSelected ? strokeWidth + 1 : strokeWidth,
        strokeLinecap: "round",
        className: "lb-connection",
        pointerEvents: "none"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: p2.x, cy: p2.y, r: 4, fill: strokeColor, pointerEvents: "none" })
  ] });
};
const ConnectionRenderer$1 = React.memo(ConnectionRenderer);

const clampSize = (value) => Math.min(Math.max(MIN_ELEMENT_SIZE, value), MAX_ELEMENT_SIZE);
const snapValue = (value, enabled) => enabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : value;
function computeResize(handle, initial, delta, options) {
  const { dx, dy } = delta;
  const { snapToGrid } = options;
  const aspect = initial.height === 0 ? 1 : initial.width / initial.height;
  let x = initial.x;
  let y = initial.y;
  let width = initial.width;
  let height = initial.height;
  switch (handle) {
    case "top-left": {
      width = clampSize(initial.width - dx);
      height = clampSize(initial.height - dy);
      x = initial.x + (initial.width - width);
      y = initial.y + (initial.height - height);
      break;
    }
    case "top-right": {
      width = clampSize(initial.width + dx);
      height = clampSize(initial.height - dy);
      y = initial.y + (initial.height - height);
      break;
    }
    case "bottom-left": {
      width = clampSize(initial.width - dx);
      height = clampSize(initial.height + dy);
      x = initial.x + (initial.width - width);
      break;
    }
    case "bottom-right": {
      width = clampSize(initial.width + dx);
      height = clampSize(initial.height + dy);
      break;
    }
    case "left-center": {
      width = clampSize(initial.width - dx);
      x = initial.x + (initial.width - width);
      break;
    }
    case "right-center": {
      width = clampSize(initial.width + dx);
      break;
    }
    case "top-center": {
      height = clampSize(initial.height - dy);
      y = initial.y + (initial.height - height);
      break;
    }
    case "bottom-center": {
      height = clampSize(initial.height + dy);
      break;
    }
  }
  if (handle === "top-left" || handle === "top-right" || handle === "bottom-left" || handle === "bottom-right") {
    const targetHeight = width / aspect;
    const targetWidth = height * aspect;
    const lockToWidth = Math.abs(width - initial.width) >= Math.abs(height - initial.height);
    if (lockToWidth) {
      height = clampSize(targetHeight);
    } else {
      width = clampSize(targetWidth);
    }
    switch (handle) {
      case "top-left":
        x = initial.x + (initial.width - width);
        y = initial.y + (initial.height - height);
        break;
      case "top-right":
        y = initial.y + (initial.height - height);
        break;
      case "bottom-left":
        x = initial.x + (initial.width - width);
        break;
      case "bottom-right":
        break;
    }
  }
  const snappedX = snapValue(x, snapToGrid);
  const snappedY = snapValue(y, snapToGrid);
  const snappedWidth = snapValue(width, snapToGrid);
  const snappedHeight = snapValue(height, snapToGrid);
  return {
    x: snappedX,
    y: snappedY,
    width: snappedWidth,
    height: snappedHeight
  };
}

function useSvgCanvasInteractions({
  svgRef,
  scene,
  selectedIds,
  activeTool,
  keepToolActive,
  snapToGrid,
  onUpdateScene,
  onSelect,
  onToolChange
}) {
  const { view, elements } = scene;
  const [dragState, setDragState] = reactExports.useState(null);
  const [pendingConnection, setPendingConnection] = reactExports.useState(null);
  const rafIdRef = reactExports.useRef(null);
  const pendingMoveEventRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);
  const screenToWorld = reactExports.useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return screenToWorldPoint(clientX, clientY, rect, view);
    },
    [svgRef, view]
  );
  const handlePointerDown = reactExports.useCallback(
    (e) => {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const target = e.target;
      const elementId = target.closest("[data-element-id]")?.getAttribute("data-element-id");
      const connectionId = target.closest("[data-connection-id]")?.getAttribute("data-connection-id");
      const resizeHandle = target.closest("[data-resize-handle]")?.getAttribute("data-resize-handle");
      const resizeTargetId = target.closest("[data-resize-target]")?.getAttribute("data-resize-target");
      if (activeTool === "pointer" && resizeHandle && resizeTargetId) {
        const el = elements[resizeTargetId];
        if (el && !el.locked) {
          setDragState({
            type: "resize",
            startPos: worldPos,
            initialElements: { ...elements },
            targetId: resizeTargetId,
            resizeHandle,
            initialDimensions: { x: el.x, y: el.y, width: el.width, height: el.height }
          });
          try {
            e.target.setPointerCapture(e.pointerId);
          } catch {
          }
          return;
        }
      }
      if (activeTool === "pointer" && !elementId && connectionId) {
        if (!selectedIds.includes(connectionId)) {
          onSelect(e.shiftKey ? [...selectedIds, connectionId] : [connectionId]);
        }
      } else if (activeTool === "hand" || activeTool === "pointer" && !elementId && !connectionId) {
        if (activeTool === "pointer") {
          onSelect([]);
        }
        setDragState({ type: "pan", startPos: { x: e.clientX, y: e.clientY } });
      } else if (activeTool === "pointer" && elementId) {
        if (!selectedIds.includes(elementId)) {
          onSelect(e.shiftKey ? [...selectedIds, elementId] : [elementId]);
        }
        setDragState({
          type: "element",
          startPos: worldPos,
          initialElements: { ...elements }
        });
      } else if (["rectangle", "ellipse", "diamond", "text"].includes(activeTool)) {
        const id = createElementId(false);
        const newElement = {
          id,
          type: activeTool,
          x: snapToGrid ? Math.round(worldPos.x / GRID_SIZE) * GRID_SIZE : worldPos.x,
          y: snapToGrid ? Math.round(worldPos.y / GRID_SIZE) * GRID_SIZE : worldPos.y,
          width: 10,
          height: 10,
          rotation: 0,
          opacity: 1,
          locked: false,
          backgroundColor: "#ffffff",
          strokeColor: "#000000",
          strokeWidth: 2,
          text: activeTool === "text" ? "Double click to edit" : ""
        };
        onUpdateScene((s) => ({ ...s, elements: { ...s.elements, [id]: newElement } }));
        onSelect([id]);
        setDragState({ type: "create", startPos: worldPos, targetId: id });
      } else if (activeTool === "connection") {
        if (elementId) {
          if (pendingConnection) {
            if (elementId !== pendingConnection.sourceId) {
              const id = createConnectionId(false);
              onUpdateScene((s) => ({
                ...s,
                connections: [
                  ...s.connections,
                  {
                    id,
                    sourceId: pendingConnection.sourceId,
                    targetId: elementId,
                    style: { strokeColor: "#000000", width: 2, curvature: 0.5 }
                  }
                ]
              }));
              if (!keepToolActive && onToolChange) {
                onToolChange("pointer");
              }
            }
            setPendingConnection(null);
          } else {
            setPendingConnection({ sourceId: elementId, currentPos: worldPos });
          }
        } else {
          setPendingConnection(null);
        }
        return;
      } else if (activeTool === "eraser" && (elementId || connectionId)) {
        if (elementId) {
          onUpdateScene((s) => {
            const newElements = deleteElementsFromMap(s.elements, [elementId]);
            return {
              ...s,
              elements: newElements,
              connections: deleteConnectionsForElements(s.connections, [elementId])
            };
          });
        } else if (connectionId) {
          onUpdateScene((s) => ({
            ...s,
            connections: s.connections.filter((c) => c.id !== connectionId)
          }));
        }
        if (!keepToolActive && onToolChange) {
          onToolChange("pointer");
        }
      }
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {
      }
    },
    [
      activeTool,
      elements,
      keepToolActive,
      onSelect,
      onUpdateScene,
      onToolChange,
      pendingConnection,
      screenToWorld,
      selectedIds,
      snapToGrid
    ]
  );
  const handlePointerMove = reactExports.useCallback(
    (e) => {
      pendingMoveEventRef.current = e;
      if (rafIdRef.current !== null) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const event = pendingMoveEventRef.current;
        if (!event) return;
        if (pendingConnection) {
          const worldPos = screenToWorld(event.clientX, event.clientY);
          setPendingConnection({ ...pendingConnection, currentPos: worldPos });
        }
        if (!dragState) return;
        if (dragState.type === "pan") {
          const dx = event.clientX - dragState.startPos.x;
          const dy = event.clientY - dragState.startPos.y;
          onUpdateScene((s) => ({
            ...s,
            view: { ...s.view, x: s.view.x + dx, y: s.view.y + dy }
          }));
          setDragState({ ...dragState, startPos: { x: event.clientX, y: event.clientY } });
        } else if (dragState.type === "element") {
          const worldPos = screenToWorld(event.clientX, event.clientY);
          const dx = worldPos.x - dragState.startPos.x;
          const dy = worldPos.y - dragState.startPos.y;
          onUpdateScene((s) => {
            const nextElements = { ...s.elements };
            selectedIds.forEach((id) => {
              const initial = dragState.initialElements?.[id];
              if (initial) {
                let nx = initial.x + dx;
                let ny = initial.y + dy;
                if (snapToGrid) {
                  nx = Math.round(nx / GRID_SIZE) * GRID_SIZE;
                  ny = Math.round(ny / GRID_SIZE) * GRID_SIZE;
                }
                nextElements[id] = { ...nextElements[id], x: nx, y: ny };
              }
            });
            return { ...s, elements: nextElements };
          });
        } else if (dragState.type === "create" && dragState.targetId) {
          const worldPos = screenToWorld(event.clientX, event.clientY);
          const width = Math.max(20, worldPos.x - dragState.startPos.x);
          const height = Math.max(20, worldPos.y - dragState.startPos.y);
          onUpdateScene((s) => ({
            ...s,
            elements: {
              ...s.elements,
              [dragState.targetId]: {
                ...s.elements[dragState.targetId],
                width,
                height
              }
            }
          }));
        } else if (dragState.type === "resize" && dragState.targetId && dragState.resizeHandle && dragState.initialDimensions) {
          const worldPos = screenToWorld(event.clientX, event.clientY);
          const dx = worldPos.x - dragState.startPos.x;
          const dy = worldPos.y - dragState.startPos.y;
          onUpdateScene((s) => {
            const nextElements = { ...s.elements };
            const initial = dragState.initialElements?.[dragState.targetId];
            if (!initial) {
              return s;
            }
            const updated = computeResize(
              dragState.resizeHandle,
              dragState.initialDimensions,
              { dx, dy },
              { snapToGrid: false }
            );
            nextElements[dragState.targetId] = { ...nextElements[dragState.targetId], ...updated };
            return { ...s, elements: nextElements };
          });
        }
      });
    },
    [dragState, onUpdateScene, pendingConnection, screenToWorld, selectedIds, snapToGrid]
  );
  const handlePointerUp = reactExports.useCallback(
    (e) => {
      if (dragState?.type === "create" && onToolChange && !keepToolActive) {
        onToolChange("pointer");
      }
      if (dragState?.type === "resize" && dragState.targetId && dragState.resizeHandle && dragState.initialDimensions) {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        const dx = worldPos.x - dragState.startPos.x;
        const dy = worldPos.y - dragState.startPos.y;
        onUpdateScene((s) => {
          const nextElements = { ...s.elements };
          const initial = dragState.initialElements?.[dragState.targetId];
          if (!initial) {
            return s;
          }
          const updated = computeResize(
            dragState.resizeHandle,
            dragState.initialDimensions,
            { dx, dy },
            { snapToGrid: Boolean(snapToGrid) }
          );
          nextElements[dragState.targetId] = { ...nextElements[dragState.targetId], ...updated };
          return { ...s, elements: nextElements };
        });
      }
      setDragState(null);
    },
    [dragState, keepToolActive, onToolChange, onUpdateScene, screenToWorld, snapToGrid]
  );
  const handleWheel = reactExports.useCallback((e) => {
    e.preventDefault();
  }, []);
  return {
    dragState,
    pendingConnection,
    setPendingConnection,
    screenToWorld,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel
  };
}

const ConnectionPreview = ({ source, currentPos }) => {
  const p1 = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
  const p2 = currentPos;
  const curvature = 0.5;
  const dx = Math.abs(p2.x - p1.x) * curvature;
  const cp1 = { x: p1.x + (p2.x > p1.x ? dx : -dx), y: p1.y };
  const cp2 = { x: p2.x + (p2.x > p1.x ? -dx : dx), y: p2.y };
  const path = `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p2.x} ${p2.y}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { pointerEvents: "none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        d: path,
        fill: "none",
        stroke: "#3b82f6",
        strokeWidth: 2,
        strokeDasharray: "4 2",
        className: "lb-connection-preview"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: p2.x, cy: p2.y, r: 4, fill: "#3b82f6" })
  ] });
};

const HANDLE_SIZE = 8;
const SELECTION_PADDING = 4;
const HANDLES = [
  {
    type: "top-left",
    cursor: "nwse-resize",
    getPosition: (el) => ({ x: el.x - SELECTION_PADDING, y: el.y - SELECTION_PADDING })
  },
  {
    type: "top-center",
    cursor: "ns-resize",
    getPosition: (el) => ({ x: el.x + el.width / 2, y: el.y - SELECTION_PADDING })
  },
  {
    type: "top-right",
    cursor: "nesw-resize",
    getPosition: (el) => ({ x: el.x + el.width + SELECTION_PADDING, y: el.y - SELECTION_PADDING })
  },
  {
    type: "right-center",
    cursor: "ew-resize",
    getPosition: (el) => ({ x: el.x + el.width + SELECTION_PADDING, y: el.y + el.height / 2 })
  },
  {
    type: "bottom-right",
    cursor: "nwse-resize",
    getPosition: (el) => ({ x: el.x + el.width + SELECTION_PADDING, y: el.y + el.height + SELECTION_PADDING })
  },
  {
    type: "bottom-center",
    cursor: "ns-resize",
    getPosition: (el) => ({ x: el.x + el.width / 2, y: el.y + el.height + SELECTION_PADDING })
  },
  {
    type: "bottom-left",
    cursor: "nesw-resize",
    getPosition: (el) => ({ x: el.x - SELECTION_PADDING, y: el.y + el.height + SELECTION_PADDING })
  },
  {
    type: "left-center",
    cursor: "ew-resize",
    getPosition: (el) => ({ x: el.x - SELECTION_PADDING, y: el.y + el.height / 2 })
  }
];
const ResizeHandles = ({ element, onPointerDown }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: HANDLES.map((handle) => {
    const pos = handle.getPosition(element);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "rect",
      {
        "data-resize-handle": handle.type,
        "data-resize-target": element.id,
        x: pos.x - HANDLE_SIZE / 2,
        y: pos.y - HANDLE_SIZE / 2,
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        rx: 1,
        ry: 1,
        className: "lb-resize-handle",
        style: { cursor: handle.cursor },
        onPointerDown: (e) => {
          onPointerDown?.(handle.type, e);
        }
      },
      handle.type
    );
  }) });
};
const ResizeHandles$1 = React.memo(ResizeHandles);

const SVGCanvas = ({
  scene,
  selectedIds,
  activeTool,
  keepToolActive,
  onUpdateScene,
  onSelect,
  customComponents,
  snapToGrid,
  onToolChange
}) => {
  const { view, elements, connections } = scene;
  const svgRef = reactExports.useRef(null);
  const {
    dragState,
    pendingConnection,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel
  } = useSvgCanvasInteractions({
    svgRef,
    scene,
    selectedIds,
    activeTool,
    keepToolActive,
    snapToGrid,
    onUpdateScene,
    onSelect,
    onToolChange
  });
  const transform = `translate(${view.x}, ${view.y}) scale(${view.zoom})`;
  const singleSelectedElement = reactExports.useMemo(
    () => selectedIds.length === 1 ? elements[selectedIds[0]] : void 0,
    [selectedIds, elements]
  );
  const visibleElements = reactExports.useMemo(() => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return Object.values(elements);
    const padding = 200;
    const minX = (-view.x - padding) / view.zoom;
    const minY = (-view.y - padding) / view.zoom;
    const maxX = (rect.width - view.x + padding) / view.zoom;
    const maxY = (rect.height - view.y + padding) / view.zoom;
    return Object.values(elements).filter((el) => {
      const elRight = el.x + el.width;
      const elBottom = el.y + el.height;
      return !(el.x > maxX || elRight < minX || el.y > maxY || elBottom < minY);
    });
  }, [elements, view, svgRef]);
  const isDragging = Boolean(dragState);
  const canvasCursor = isDragging ? "grabbing" : activeTool === "hand" ? "grab" : "default";
  const hoverCursor = isDragging ? "grabbing" : activeTool === "pointer" ? "pointer" : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "svg",
    {
      ref: svgRef,
      className: "lb-svg-canvas",
      style: { cursor: canvasCursor },
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onWheel: handleWheel,
      onContextMenu: (e) => e.preventDefault(),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform, children: [
        connections.map((conn) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          ConnectionRenderer$1,
          {
            connection: conn,
            elements,
            isSelected: selectedIds.includes(conn.id),
            cursor: hoverCursor
          },
          conn.id
        )),
        visibleElements.map((el) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          ElementRenderer$1,
          {
            element: el,
            isSelected: selectedIds.includes(el.id),
            customComponent: el.componentType ? customComponents[el.componentType] : void 0,
            cursor: hoverCursor
          },
          el.id
        )),
        singleSelectedElement && !singleSelectedElement.locked && /* @__PURE__ */ jsxRuntimeExports.jsx(ResizeHandles$1, { element: singleSelectedElement }),
        pendingConnection && elements[pendingConnection.sourceId] && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ConnectionPreview,
          {
            source: elements[pendingConnection.sourceId],
            currentPos: pendingConnection.currentPos
          }
        )
      ] })
    }
  );
};

const GridLayer = ({ view }) => {
  const size = GRID_SIZE * view.zoom;
  const offsetX = view.x % size;
  const offsetY = view.y % size;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "lb-grid-layer",
      style: {
        backgroundImage: `radial-gradient(circle, #4b5563 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`
      }
    }
  );
};
const GridLayer$1 = React.memo(GridLayer);

const Icons = {
  Pointer: (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m13 13 6 6" })
  ] }),
  Hand: (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" })
  ] }),
  Square: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }) }),
  Circle: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }) }),
  Diamond: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0l-7.59 7.59Z" }) }),
  Type: (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "4 7 4 4 20 4 20 7" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "9", x2: "15", y1: "20", y2: "20" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", x2: "12", y1: "4", y2: "20" })
  ] }),
  ArrowRight: (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m12 5 7 7-7 7" })
  ] }),
  Eraser: (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 21H7" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m5 11 9 9" })
  ] }),
  Lock: (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
  ] }),
  Unlock: (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 11V7a5 5 0 0 1 9.9-1" })
  ] }),
  Layers: (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" })
  ] }),
  Plus: (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 5v14" })
  ] }),
  Minus: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14" }) })
};

const Toolbar = ({ activeTool, onToolSelect, keepToolActive, onToggleKeepToolActive }) => {
  const tools = [
    { id: "pointer", icon: Icons.Pointer, label: "Select" },
    { id: "hand", icon: Icons.Hand, label: "Pan" },
    { id: "rectangle", icon: Icons.Square, label: "Rectangle" },
    { id: "ellipse", icon: Icons.Circle, label: "Ellipse" },
    { id: "diamond", icon: Icons.Diamond, label: "Diamond" },
    { id: "text", icon: Icons.Type, label: "Text" },
    { id: "connection", icon: Icons.ArrowRight, label: "Connect" },
    { id: "eraser", icon: Icons.Eraser, label: "Eraser" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lb-toolbar", children: [
    tools.map((tool) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => onToolSelect(tool.id),
        className: `lb-tool-button ${activeTool === tool.id ? "lb-tool-button--active" : ""}`,
        title: tool.label,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(tool.icon, { width: 20, height: 20 })
      },
      tool.id
    )),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lb-toolbar__separator" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: onToggleKeepToolActive,
        className: `lb-tool-button ${keepToolActive ? "lb-tool-button--active" : ""}`,
        title: "Keep selected tool active after use",
        children: keepToolActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icons.Lock, { width: 18, height: 18 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Icons.Unlock, { width: 18, height: 18 })
      }
    )
  ] });
};

const PropertiesPanel = ({ elements, onUpdate }) => {
  if (elements.length === 0) return null;
  const isText = elements.every((el) => el.type === "text");
  const first = elements[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lb-properties-panel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "lb-properties-panel__title", children: "Properties" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      !isText && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lb-property-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "lb-property-label", children: "Background" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lb-color-grid", children: ["#ffffff", "#fecaca", "#fde68a", "#bbf7d0", "#bfdbfe", "#ddd6fe"].map((color) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onUpdate({ backgroundColor: color }),
            className: "lb-color-swatch",
            style: { backgroundColor: color }
          },
          color
        )) })
      ] }),
      isText && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lb-property-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "lb-property-label", children: "Text Value" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: first.text || "",
            onChange: (e) => onUpdate({ text: e.target.value }),
            className: "lb-input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lb-property-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "lb-property-label", children: "Stroke" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lb-color-grid", children: ["#000000", "#dc2626", "#d97706", "#059669", "#2563eb", "#7c3aed"].map((color) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onUpdate({ strokeColor: color }),
            className: "lb-color-swatch",
            style: { backgroundColor: color }
          },
          color
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lb-property-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "lb-property-label", children: "Opacity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "range",
            min: "0",
            max: "1",
            step: "0.1",
            value: first.opacity ?? 1,
            onChange: (e) => onUpdate({ opacity: parseFloat(e.target.value) }),
            className: "lb-slider"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lb-panel-footer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "lb-text-button", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lb-icon-mr", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icons.Layers, { width: 14, height: 14 }) }),
          " Bring Forward"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "lb-text-button", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lb-icon-mr", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icons.Lock, { width: 12, height: 12 }) }),
          " Lock"
        ] })
      ] })
    ] })
  ] });
};

const ZoomControls = ({ zoom, onZoomIn, onZoomOut, onFitView }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lb-zoom-controls", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: onZoomOut,
        className: "lb-zoom-button",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icons.Minus, { width: 12, height: 12 })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "lb-zoom-value", children: [
      Math.round(zoom * 100),
      "%"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: onZoomIn,
        className: "lb-zoom-button",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icons.Plus, { width: 12, height: 12 })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lb-zoom-separator" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: onFitView,
        className: "lb-fit-button",
        children: "Fit View"
      }
    )
  ] });
};

const InfiniteCanvas = reactExports.forwardRef((props, ref) => {
  const {
    initialData = INITIAL_STATE,
    config = {},
    uiConfig = { showToolbar: true, showZoomControls: true, showPropertiesPanel: true },
    components = {},
    onChange,
    onSelectionChange
  } = props;
  const [scene, setScene] = reactExports.useState(initialData);
  const [selectedIds, setSelectedIds] = reactExports.useState([]);
  const containerRef = reactExports.useRef(null);
  const [activeTool, setActiveTool] = reactExports.useState("pointer");
  const keepToolActive = config.keepToolActive ?? false;
  const sceneRef = reactExports.useRef(scene);
  const selectedIdsRef = reactExports.useRef(selectedIds);
  sceneRef.current = scene;
  selectedIdsRef.current = selectedIds;
  reactExports.useEffect(() => {
    let isMounted = true;
    if (initialData && isMounted) {
      setScene(initialData);
    }
    return () => {
      isMounted = false;
    };
  }, [initialData]);
  const updateScene = reactExports.useCallback((updater) => {
    let nextScene;
    setScene((prev) => {
      nextScene = updater(prev);
      return nextScene;
    });
    onChange?.(nextScene);
    return nextScene;
  }, [onChange]);
  const handleSelection = reactExports.useCallback((ids) => {
    setSelectedIds(ids);
    onSelectionChange?.(ids);
  }, [onSelectionChange]);
  reactExports.useEffect(() => {
    const onKeyDown = (e) => {
      if (config.readonly) return;
      if (e.key !== "Backspace" && e.key !== "Delete") return;
      const active = document.activeElement;
      if (active) {
        const tag = active.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || active.isContentEditable) return;
      }
      const ids = selectedIdsRef.current;
      if (ids.length === 0) return;
      e.preventDefault();
      updateScene((prev) => {
        const selectedElements = ids.filter((id) => Boolean(prev.elements[id]));
        const selectedConnections = ids.filter((id) => prev.connections.some((c) => c.id === id));
        const nextElements = selectedElements.length > 0 ? deleteElementsFromMap(prev.elements, selectedElements) : prev.elements;
        let nextConnections = prev.connections;
        if (selectedElements.length > 0) {
          nextConnections = deleteConnectionsForElements(nextConnections, selectedElements);
        }
        if (selectedConnections.length > 0) {
          const idSet = new Set(selectedConnections);
          nextConnections = nextConnections.filter((c) => !idSet.has(c.id));
        }
        return { ...prev, elements: nextElements, connections: nextConnections };
      });
      handleSelection([]);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [config.readonly, handleSelection, updateScene]);
  const api = useInfiniteCanvasApi({
    sceneRef,
    selectedIdsRef,
    containerRef,
    updateScene,
    handleSelection
  });
  reactExports.useImperativeHandle(ref, () => api, [api]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: containerRef,
      className: `lb-canvas-container ${activeTool === "hand" ? "lb-canvas-container--hand" : "lb-canvas-container--default"}`,
      children: [
        config.grid !== false && /* @__PURE__ */ jsxRuntimeExports.jsx(GridLayer$1, { view: scene.view }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ef4444",
          backgroundColor: "#fef2f2"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Something went wrong" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "The canvas encountered an error and cannot be displayed." })
        ] }) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SVGCanvas,
          {
            scene,
            selectedIds,
            activeTool,
            keepToolActive,
            onUpdateScene: updateScene,
            onSelect: handleSelection,
            customComponents: components,
            snapToGrid: config.snapToGrid,
            onToolChange: setActiveTool
          }
        ) }),
        uiConfig.showToolbar && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Toolbar,
          {
            activeTool,
            onToolSelect: setActiveTool,
            keepToolActive,
            onToggleKeepToolActive: () => {
            }
          }
        ),
        uiConfig.showZoomControls && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ZoomControls,
          {
            zoom: scene.view.zoom,
            onZoomIn: () => api.zoomIn(),
            onZoomOut: () => api.zoomOut(),
            onFitView: () => api.fitView()
          }
        ),
        uiConfig.showPropertiesPanel && selectedIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          PropertiesPanel,
          {
            elements: selectedIds.map((id) => scene.elements[id]).filter(Boolean),
            onUpdate: (updates) => {
              updateScene((prev) => {
                const newElements = { ...prev.elements };
                selectedIds.forEach((id) => {
                  if (newElements[id]) {
                    newElements[id] = { ...newElements[id], ...updates };
                  }
                });
                return { ...prev, elements: newElements };
              });
            }
          }
        )
      ]
    }
  );
});

function TestCanvas({
  initialScene = INITIAL_STATE,
  width = 800,
  height = 600,
  onSceneChange,
  onSelectionChange,
  showToolbar = true,
  showZoomControls = true,
  snapToGrid = false
}) {
  const canvasRef = reactExports.useRef(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-testid": "test-canvas-wrapper",
      style: {
        width: `${width}px`,
        height: `${height}px`,
        border: "1px solid #ccc",
        position: "relative"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        InfiniteCanvas,
        {
          ref: canvasRef,
          initialData: initialScene,
          onChange: onSceneChange,
          onSelectionChange,
          config: {
            snapToGrid,
            grid: true
          },
          uiConfig: {
            showToolbar,
            showZoomControls,
            showPropertiesPanel: false
          }
        }
      )
    }
  );
}

export { TestCanvas };
//# sourceMappingURL=TestCanvas-7ubSxuyA.js.map
