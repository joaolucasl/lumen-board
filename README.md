<div align="center">

![LumenBoard Logo](logo.png)

# LumenBoard

**A lightweight, zero-dependency infinite canvas component for React.**

Build interactive whiteboards, flowcharts, diagrams, and visual editors with a simple, declarative API.

[![npm version](https://badge.fury.io/js/lumen-board.svg)](https://badge.fury.io/js/lumen-board)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## Table of Contents

- [Why LumenBoard?](#why-lumenboard)
- [Core Concepts](#core-concepts)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Common Patterns](#common-patterns)
- [API Overview](#api-overview)
- [Best Practices](#best-practices)
- [Common Mistakes & Gotchas](#common-mistakes--gotchas)
- [Advanced Usage](#advanced-usage)
- [FAQ](#faq)
- [Contributing](#contributing)

---

## Why LumenBoard?

Building an infinite canvas from scratch is hard. You need to handle:

- **Coordinate systems** — converting between screen pixels and world coordinates
- **Pan and zoom** — smooth interactions that feel natural
- **Element rendering** — efficiently drawing shapes at any scale
- **Hit testing** — knowing what the user clicked on
- **Selection and manipulation** — moving, resizing, and rotating elements
- **Connections** — drawing lines between elements that update when elements move

LumenBoard handles all of this for you. It provides:

- A single `<InfiniteCanvas>` component that renders your scene
- An imperative API for programmatic control
- Built-in support for shapes, text, and custom React components
- Connections between elements with automatic routing
- Optional built-in UI (toolbar, properties panel, zoom controls)

**When to use LumenBoard:**

- You need a whiteboard or diagramming feature in your React app
- You want to build a visual editor (flowcharts, mind maps, org charts)
- You need an infinite canvas with pan/zoom and element manipulation

**When NOT to use LumenBoard:**

- You need pixel-perfect drawing or freehand sketching (consider Excalidraw)
- You need complex graph layouts with automatic positioning (consider React Flow)
- You need 3D rendering (consider Three.js or React Three Fiber)

---

## Core Concepts

LumenBoard is built around a few simple concepts. Understanding these will help you use the library effectively.

### The Scene

The **scene** is the complete state of your canvas. It contains:

- **View** — the current pan position and zoom level
- **Elements** — the shapes, text, and custom components on the canvas
- **Connections** — the lines connecting elements together

The scene is a plain JavaScript object that you can serialize to JSON, store in a database, or pass between components.

```
Scene
├── view: { x, y, zoom }
├── elements: { [id]: Element, ... }
└── connections: [ Connection, ... ]
```

### Elements

An **element** is anything you place on the canvas. Each element has:

- A unique `id`
- A `type` (rectangle, ellipse, diamond, text, or custom)
- Position (`x`, `y`) in world coordinates
- Size (`width`, `height`)
- Visual properties (colors, opacity, rotation)

Elements are positioned in **world coordinates** — an infinite 2D space where (0, 0) is the origin. The canvas automatically handles converting these to screen pixels based on the current pan and zoom.

### Connections

A **connection** is a line between two elements. Connections automatically update when their connected elements move. Each connection specifies:

- A source element and optional handle position (top, right, bottom, left)
- A target element and optional handle position
- Visual styling (color, width, curvature)

### The Imperative API

While you can control LumenBoard declaratively through props, most interactions happen through the **imperative API**. You access this API via a React ref:

```tsx
const canvasRef = useRef<InfiniteCanvasRef>(null);

// Later...
canvasRef.current.createElement({ type: 'rectangle' });
canvasRef.current.zoomIn();
canvasRef.current.panTo(100, 200);
```

This pattern is similar to how you might use `ref` to control a video element or a form input.

---

## Installation

```bash
# npm
npm install lumen-board

# pnpm
pnpm add lumen-board

# yarn
yarn add lumen-board
```

**Peer dependencies:** React 18 or 19.

**Important:** You must import the CSS file for the canvas to render correctly:

```tsx
// In your app's entry point (e.g., main.tsx or App.tsx)
import 'lumen-board/style.css';
```

---

## Basic Usage

Here's the simplest possible example — an empty canvas you can pan and zoom:

```tsx
import { useRef } from 'react';
import { InfiniteCanvas } from 'lumen-board';
import type { InfiniteCanvasRef } from 'lumen-board';
import 'lumen-board/style.css';

function App() {
  const canvasRef = useRef<InfiniteCanvasRef>(null);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <InfiniteCanvas ref={canvasRef} />
    </div>
  );
}
```

**Key points:**

1. The canvas fills its container — make sure the container has explicit dimensions.
2. Use `ref` to access the imperative API.
3. The built-in toolbar and zoom controls appear by default.

### Adding Elements Programmatically

```tsx
function App() {
  const canvasRef = useRef<InfiniteCanvasRef>(null);

  const addRectangle = () => {
    canvasRef.current?.createElement({
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      backgroundColor: '#3b82f6',
      strokeColor: '#1d4ed8',
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <button onClick={addRectangle}>Add Rectangle</button>
      <InfiniteCanvas ref={canvasRef} />
    </div>
  );
}
```

---

## Common Patterns

### 1. Persisting and Restoring State

Save the canvas state to localStorage or a database:

```tsx
function App() {
  const canvasRef = useRef<InfiniteCanvasRef>(null);

  // Load saved state on mount
  const savedState = localStorage.getItem('canvas');
  const initialData = savedState ? JSON.parse(savedState) : undefined;

  // Save state on every change
  const handleChange = (scene: SceneState) => {
    localStorage.setItem('canvas', JSON.stringify(scene));
  };

  return (
    <InfiniteCanvas
      ref={canvasRef}
      initialData={initialData}
      onChange={handleChange}
    />
  );
}
```

### 2. Creating Connected Diagrams

Build a simple flowchart:

```tsx
const buildFlowchart = () => {
  const api = canvasRef.current;
  if (!api) return;

  // Create nodes
  const start = api.createElement({
    type: 'ellipse',
    x: 200,
    y: 50,
    text: 'Start',
    backgroundColor: '#22c55e',
  });

  const process = api.createElement({
    type: 'rectangle',
    x: 175,
    y: 200,
    text: 'Process',
  });

  const end = api.createElement({
    type: 'ellipse',
    x: 200,
    y: 350,
    text: 'End',
    backgroundColor: '#ef4444',
  });

  // Connect them
  api.createConnection({ sourceId: start.id, targetId: process.id });
  api.createConnection({ sourceId: process.id, targetId: end.id });

  // Focus on the diagram
  api.focusElements([start.id, process.id, end.id], { padding: 50 });
};
```

### 3. Custom Components

Render your own React components inside elements:

```tsx
// Define your custom component
const UserCard: React.FC<{ width: number; height: number; data: any }> = ({
  width,
  height,
  data,
}) => (
  <div style={{ padding: 16, background: '#fff', height: '100%' }}>
    <h3>{data?.name || 'User'}</h3>
    <p>{data?.role || 'Role'}</p>
  </div>
);

// Register it with the canvas
<InfiniteCanvas
  ref={canvasRef}
  components={{
    'user-card': UserCard,
  }}
/>

// Create an element using your component
canvasRef.current?.createElement({
  type: 'custom',
  componentType: 'user-card',
  props: { name: 'Alice', role: 'Engineer' },
  width: 200,
  height: 120,
});
```

Custom components receive `width`, `height`, and `data` (your `props` object) as props.

#### Interactive Elements in Custom Components

When your custom component contains interactive elements (buttons, inputs, links), you may want clicks on those elements to not trigger element selection. Use the `data-lumen-no-select` attribute:

```tsx
const InteractiveCard: React.FC<{ width: number; height: number; data: any }> = ({
  width,
  height,
  data,
}) => (
  <div style={{ padding: 16, background: '#fff', height: '100%' }}>
    <h3>{data?.name || 'User'}</h3>
    
    {/* This button won't select the element when clicked */}
    <button 
      data-lumen-no-select
      onClick={() => alert('Button clicked!')}
      style={{ padding: '8px 16px' }}
    >
      Action
    </button>
    
    {/* This input also won't trigger selection */}
    <input 
      data-lumen-no-select
      type="text"
      placeholder="Type here..."
    />
    
    {/* Clicking this text WILL select the element */}
    <p onClick={() => console.log('This selects the element')}>
      Click me to select the card
    </p>
  </div>
);
```

- Add `data-lumen-no-select` to any interactive element that shouldn't trigger selection
- The element remains selectable when clicking on other parts of the component
- The interactive element's native behavior (onClick, onChange, etc.) still works normally
- This works with any HTML element (buttons, inputs, anchors, divs, etc.)

### 4. Read-Only Mode

Display a canvas that users can pan and zoom but not edit:

```tsx
<InfiniteCanvas
  initialData={savedDiagram}
  config={{ readonly: true }}
  uiConfig={{
    showToolbar: false,
    showPropertiesPanel: false,
  }}
/>
```

---

## API Overview

### `<InfiniteCanvas>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ref` | `Ref<InfiniteCanvasRef>` | — | Access to the imperative API |
| `initialData` | `SceneState` | Empty scene | Initial scene state |
| `config` | `object` | `{}` | Canvas behavior options |
| `uiConfig` | `object` | All enabled | Control built-in UI visibility |
| `components` | `Record<string, React.FC>` | `{}` | Custom component registry |
| `onChange` | `(scene: SceneState) => void` | — | Called when scene changes |
| `onSelectionChange` | `(ids: string[]) => void` | — | Called when selection changes |
| `onElementAdd` | `(element: CanvasElement) => void` | — | Called when element is added |

**Config options:**

```tsx
config={{
  readonly: false,      // Disable all editing
  grid: true,           // Show background grid
  snapToGrid: false,    // Snap elements to grid
  keepToolActive: false // Keep tool selected after use
}}
```

**UI config options:**

```tsx
uiConfig={{
  showToolbar: true,        // Top toolbar with tools
  showZoomControls: true,   // Bottom-left zoom buttons
  showPropertiesPanel: true // Right panel when element selected
}}
```

### Imperative API (`InfiniteCanvasRef`)

Access via `ref.current`. All methods are synchronous.

#### Element Operations

| Method | Description |
|--------|-------------|
| `createElement(options)` | Create a single element. Returns the created element. |
| `createElements(options[])` | Create multiple elements. Returns array of elements. |
| `updateElement(id, updates)` | Update an element's properties. Returns updated element. |
| `updateElements(updates[])` | Batch update multiple elements. |
| `deleteElement(id)` | Delete an element. Returns `true` if deleted. |
| `deleteElements(ids)` | Delete multiple elements. |
| `getElement(id)` | Get an element by ID. |
| `getElements(ids?)` | Get elements. Pass no args for all elements. |

#### Connection Operations

| Method | Description |
|--------|-------------|
| `createConnection(options)` | Create a connection between two elements. |
| `createConnections(options[])` | Create multiple connections. |
| `updateConnection(id, updates)` | Update a connection's properties. |
| `deleteConnection(id)` | Delete a connection. |
| `deleteConnections(ids)` | Delete multiple connections. |
| `getConnection(id)` | Get a connection by ID. |
| `getConnections(elementId?)` | Get connections. Filter by element if ID provided. |
| `getConnectionsBetween(sourceId, targetId)` | Get connections between two specific elements. |

#### Viewport Operations

| Method | Description |
|--------|-------------|
| `zoomIn(amount?)` | Zoom in. Default step is 1.05x. |
| `zoomOut(amount?)` | Zoom out. |
| `setZoom(level, focalPoint?)` | Set exact zoom level (0.1 to 5). |
| `fitView()` | Reset to origin at zoom 1. |
| `panTo(x, y)` | Center viewport on world coordinates. |
| `panToElement(id)` | Center viewport on an element. |
| `getViewportCenter()` | Get center point in world coordinates. |
| `getViewportBounds()` | Get visible area in world coordinates. |
| `screenToWorld(x, y)` | Convert screen pixels to world coordinates. |
| `worldToScreen(x, y)` | Convert world coordinates to screen pixels. |

#### Selection Operations

| Method | Description |
|--------|-------------|
| `selectElements(ids)` | Select specific elements. |
| `selectAll()` | Select all elements. |
| `clearSelection()` | Deselect all elements. |
| `getSelectedIds()` | Get IDs of selected elements. |
| `focusElement(id, options?)` | Select and center on an element. |
| `focusElements(ids, options?)` | Select and fit view to multiple elements. |

#### Import/Export

| Method | Description |
|--------|-------------|
| `exportJson()` | Get current scene as a JSON-serializable object. |
| `importJson(scene)` | Replace current scene with provided data. |

### Types

```tsx
import type {
  InfiniteCanvasRef,  // The imperative API interface
  SceneState,         // Complete scene state
  CanvasElement,      // A single element
  Connection,         // A connection between elements
  CreateElementOptions,
  CreateConnectionOptions,
  ElementType,        // 'rectangle' | 'ellipse' | 'diamond' | 'text' | 'custom'
  Tool,               // 'pointer' | 'hand' | 'rectangle' | etc.
  ViewState,          // { x, y, zoom }
  HandleType,         // 'top' | 'right' | 'bottom' | 'left'
} from 'lumen-board';
```

---

## Best Practices

### 1. Always Give the Container Explicit Dimensions

The canvas fills its container. If the container has no height, the canvas won't be visible.

```tsx
// ✅ Good
<div style={{ width: '100%', height: '600px' }}>
  <InfiniteCanvas ref={canvasRef} />
</div>

// ❌ Bad — canvas will have zero height
<div>
  <InfiniteCanvas ref={canvasRef} />
</div>
```

### 2. Use `onChange` for State Synchronization

If you need to sync the canvas state with external state (Redux, Zustand, etc.), use the `onChange` callback rather than trying to control the canvas declaratively.

```tsx
const [scene, setScene] = useState<SceneState>();

<InfiniteCanvas
  initialData={scene}
  onChange={setScene}
/>
```

### 3. Batch Operations When Possible

When creating or updating many elements, use the batch methods:

```tsx
// ✅ Good — single state update
canvasRef.current?.createElements([
  { type: 'rectangle', x: 0, y: 0 },
  { type: 'rectangle', x: 100, y: 0 },
  { type: 'rectangle', x: 200, y: 0 },
]);

// ❌ Less efficient — three state updates
canvasRef.current?.createElement({ type: 'rectangle', x: 0, y: 0 });
canvasRef.current?.createElement({ type: 'rectangle', x: 100, y: 0 });
canvasRef.current?.createElement({ type: 'rectangle', x: 200, y: 0 });
```

### 4. Use `focusElements` After Creating Diagrams

After programmatically creating a diagram, use `focusElements` to ensure it's visible:

```tsx
const ids = elements.map(el => el.id);
canvasRef.current?.focusElements(ids, { padding: 50 });
```

---

## Common Mistakes & Gotchas

### Forgetting to Import CSS

**Symptom:** Canvas renders but looks broken or unstyled.

**Fix:** Import the CSS file in your app's entry point:

```tsx
import 'lumen-board/style.css';
```

### Container Has No Height

**Symptom:** Canvas doesn't appear or has zero height.

**Fix:** Ensure the parent container has explicit dimensions:

```tsx
<div style={{ height: '100vh' }}>
  <InfiniteCanvas ref={canvasRef} />
</div>
```

### Accessing Ref Before Mount

**Symptom:** `canvasRef.current` is `null`.

**Fix:** Always check that the ref exists before using it:

```tsx
const addElement = () => {
  if (!canvasRef.current) return;
  canvasRef.current.createElement({ type: 'rectangle' });
};
```

### Expecting Controlled Component Behavior

**Symptom:** Passing new `initialData` doesn't update the canvas.

**Explanation:** `initialData` sets the *initial* state. The canvas manages its own state internally. To update the canvas programmatically, use `importJson()`:

```tsx
// To reset the canvas to new data:
canvasRef.current?.importJson(newSceneData);
```

### Creating Connections to Non-Existent Elements

**Symptom:** Connection doesn't appear or throws an error.

**Fix:** Ensure both source and target elements exist before creating a connection:

```tsx
const el1 = canvasRef.current?.createElement({ type: 'rectangle' });
const el2 = canvasRef.current?.createElement({ type: 'rectangle', x: 200 });

// Both elements now exist
canvasRef.current?.createConnection({
  sourceId: el1.id,
  targetId: el2.id,
});
```

---

## Advanced Usage

### Coordinate Conversion

When integrating with external UI (like context menus or overlays), you'll need to convert between screen and world coordinates:

```tsx
const handleCanvasClick = (e: React.MouseEvent) => {
  const api = canvasRef.current;
  if (!api) return;

  // Convert click position to world coordinates
  const worldPos = api.screenToWorld(e.clientX, e.clientY);
  console.log(`Clicked at world position: (${worldPos.x}, ${worldPos.y})`);
};
```

### Programmatic Viewport Control

Build a minimap or navigation UI:

```tsx
// Get what's currently visible
const bounds = canvasRef.current?.getViewportBounds();
// { x: -500, y: -300, width: 1000, height: 600 }

// Jump to a specific location
canvasRef.current?.panTo(1000, 500);

// Zoom to a specific level, keeping a point fixed
canvasRef.current?.setZoom(2, { x: 100, y: 100 });
```

### Custom Element Styling

Elements support various visual properties:

```tsx
canvasRef.current?.createElement({
  type: 'rectangle',
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  backgroundColor: '#fef3c7',
  strokeColor: '#d97706',
  strokeWidth: 3,
  opacity: 0.9,
  rotation: 15, // degrees
  text: 'Rotated box',
});
```

### Locking Elements

Prevent users from selecting or moving specific elements:

```tsx
// Create a locked element
canvasRef.current?.createElement({
  type: 'rectangle',
  locked: true,
  // ...
});

// Lock an existing element
canvasRef.current?.updateElement(elementId, { locked: true });
```

---

## FAQ

### Can I use LumenBoard with Next.js?

Yes. LumenBoard is a client-side component, so you'll need to use dynamic imports or ensure it only renders on the client:

```tsx
'use client';

import { InfiniteCanvas } from 'lumen-board';
import 'lumen-board/style.css';
```

### How do I style the built-in UI?

LumenBoard uses CSS custom properties. Override them in your CSS:

```css
:root {
  --lb-color-primary: #8b5cf6;
  --lb-color-background: #1f2937;
  --lb-panel-background: rgba(31, 41, 55, 0.9);
}
```

### Can I hide the built-in UI and use my own?

Yes. Disable all built-in UI and build your own:

```tsx
<InfiniteCanvas
  ref={canvasRef}
  uiConfig={{
    showToolbar: false,
    showZoomControls: false,
    showPropertiesPanel: false,
  }}
/>

{/* Your custom UI */}
<MyCustomToolbar onAddRectangle={() => canvasRef.current?.createElement({ type: 'rectangle' })} />
```

### What's the maximum canvas size?

Elements can be positioned from -100,000 to +100,000 on each axis. Element dimensions are clamped between 20 and 5,000 pixels. Zoom ranges from 0.1x to 5x.

### Does LumenBoard support undo/redo?

This is on our roadmap, but still not implemented. However, since `exportJson()` returns the complete state and `importJson()` restores it, you can implement undo/redo by maintaining a history stack:

```tsx
const history = useRef<SceneState[]>([]);

const handleChange = (scene: SceneState) => {
  history.current.push(scene);
};

const undo = () => {
  history.current.pop();
  const previous = history.current[history.current.length - 1];
  if (previous) {
    canvasRef.current?.importJson(previous);
  }
};
```

### Why not use React Flow / Excalidraw / tldraw?

Each tool has different strengths:

- **React Flow** — Optimized for node-based graphs with automatic layouts. Better if you need complex graph algorithms.
- **Excalidraw** — Focused on freehand drawing and sketching. Better for whiteboarding with hand-drawn aesthetics. Does not support custom components.
- **tldraw** — Full-featured drawing app, but not under an OSI-approved license. If you need a complete drawing solution out of the box and don't mind the license fee, this might be more polished.

---

## Contributing

LumenBoard is in active development. Contributions are welcome!

**Project status:** Early stage / evolving API. Breaking changes may occur in minor versions until 1.0.

**To contribute:**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

**Development setup:**

```bash
git clone https://github.com/joaolucasl/lumen-board.git
cd lumen-board
pnpm install
pnpm dev
```

---

## License

MIT © [João Lucas Lucchetta](https://github.com/joaolucasl)
