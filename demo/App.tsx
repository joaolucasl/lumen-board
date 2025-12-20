
import React, { useRef, useState } from 'react';
import { InfiniteCanvas } from '../src';
import type { InfiniteCanvasRef, CanvasElement, Connection } from '../src';

// Example custom component for the SDK
const UserCard: React.FC<{ width: number; height: number; data: any }> = ({ width, height, data }) => (
  <div className="user-card">
    <div className="user-header">
      <div className="user-avatar">
        <i className="fas fa-user"></i>
      </div>
      <div>
        <h4 className="user-name">{data?.name || 'User Name'}</h4>
        <p className="user-role">{data?.role || 'Lead Engineer'}</p>
      </div>
    </div>
    <div className="user-footer">
       <span className="user-badge">ACTIVE</span>
       <button className="user-action">View Profile</button>
    </div>
  </div>
);

const App: React.FC = () => {
  const canvasRef = useRef<InfiniteCanvasRef>(null);
  const [lastAction, setLastAction] = useState<string>('');

  const handleExport = () => {
    const data = canvasRef.current?.exportJson();
    console.log('Exported Scene:', data);
    alert('Scene state logged to console!');
  };

  // Element Operations
  const createRectangle = () => {
    const rect = canvasRef.current?.createElement({ type: 'rectangle' });
    setLastAction(`Created rectangle: ${rect?.id}`);
  };

  const createEllipse = () => {
    const ellipse = canvasRef.current?.createElement({ 
      type: 'ellipse',
      backgroundColor: '#fde68a',
      strokeColor: '#d97706'
    });
    setLastAction(`Created ellipse: ${ellipse?.id}`);
  };

  const createText = () => {
    const text = canvasRef.current?.createElement({ 
      type: 'text',
      text: 'Hello World!'
    });
    setLastAction(`Created text: ${text?.id}`);
  };

  const createCustom = () => {
    const custom = canvasRef.current?.createElement({
      type: 'custom',
      componentType: 'user-card',
      props: { name: 'John Doe', role: 'Developer' }
    });
    setLastAction(`Created custom component: ${custom?.id}`);
  };

  const createBatch = () => {
    const elements = canvasRef.current?.createElements([
      { type: 'rectangle', x: 100, y: 100 },
      { type: 'ellipse', x: 300, y: 100 },
      { type: 'rectangle', x: 200, y: 250, text: 'Process' }
    ]);
    setLastAction(`Created batch: ${elements?.length} elements`);
  };

  const updateSelected = () => {
    const selectedIds = canvasRef.current?.getSelectedIds();
    if (selectedIds && selectedIds.length > 0) {
      const updated = canvasRef.current?.updateElement(selectedIds[0], {
        backgroundColor: '#fbbf24',
        rotation: 45
      });
      setLastAction(`Updated element: ${updated?.id}`);
    } else {
      setLastAction('No element selected');
    }
  };

  const deleteSelected = () => {
    const selectedIds = canvasRef.current?.getSelectedIds();
    if (selectedIds && selectedIds.length > 0) {
      canvasRef.current?.deleteElements(selectedIds);
      setLastAction(`Deleted ${selectedIds.length} elements`);
    } else {
      setLastAction('No element selected');
    }
  };

  // Connection Operations
  const createConnection = () => {
    const elements = canvasRef.current?.getElements();
    if (elements && elements.length >= 2) {
      const conn = canvasRef.current?.createConnection({
        sourceId: elements[0].id,
        targetId: elements[1].id
      });
      setLastAction(`Created connection: ${conn?.id}`);
    } else {
      setLastAction('Need at least 2 elements');
    }
  };

  // Viewport Operations
  const zoomIn = () => {
    canvasRef.current?.zoomIn();
    setLastAction('Zoomed in');
  };

  const zoomOut = () => {
    canvasRef.current?.zoomOut();
    setLastAction('Zoomed out');
  };

  const fitView = () => {
    canvasRef.current?.fitView();
    setLastAction('Fit to view');
  };

  const panToCenter = () => {
    canvasRef.current?.panTo(0, 0);
    setLastAction('Panned to origin');
  };

  // Selection Operations
  const selectAll = () => {
    canvasRef.current?.selectAll();
    setLastAction('Selected all elements');
  };

  const clearSelection = () => {
    canvasRef.current?.clearSelection();
    setLastAction('Cleared selection');
  };

  const focusRandom = () => {
    const elements = canvasRef.current?.getElements();
    if (elements && elements.length > 0) {
      const random = elements[Math.floor(Math.random() * elements.length)];
      canvasRef.current?.focusElement(random.id, { zoom: 1.5 });
      setLastAction(`Focused on: ${random.id}`);
    } else {
      setLastAction('No elements to focus');
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">
            <i className="fas fa-infinity"></i>
          </div>
          <h1 className="app-title">LumenBoard <span>API Playground</span></h1>
        </div>
        
        <div className="header-controls">
          <div className="last-action">
            Last: {lastAction || 'No action'}
          </div>
          <button 
            onClick={handleExport}
            className="export-btn"
          >
            Export JSON
          </button>
        </div>
      </header>

      {/* Main Content - 30/70 Split */}
      <main className="main-content">
        {/* Controls Panel - 30% */}
        <aside className="sidebar">
          <div className="sidebar-content">
            {/* Element Operations */}
            <section>
              <h3 className="section-title">
                <i className="fas fa-shapes section-icon"></i>
                Element Operations
              </h3>
              <div className="button-grid">
                <button onClick={createRectangle} className="action-btn btn-blue">Rectangle</button>
                <button onClick={createEllipse} className="action-btn btn-green">Ellipse</button>
                <button onClick={createText} className="action-btn btn-purple">Text</button>
                <button onClick={createCustom} className="action-btn btn-orange">Custom</button>
                <button onClick={createBatch} className="action-btn btn-indigo col-span-2">Create Batch</button>
                <button onClick={updateSelected} className="action-btn btn-yellow">Update Selected</button>
                <button onClick={deleteSelected} className="action-btn btn-red">Delete Selected</button>
              </div>
            </section>

            {/* Connection Operations */}
            <section>
              <h3 className="section-title">
                <i className="fas fa-link section-icon"></i>
                Connection Operations
              </h3>
              <div className="button-grid">
                <button onClick={createConnection} className="action-btn btn-teal col-span-2">Connect First Two</button>
              </div>
            </section>

            {/* Viewport Operations */}
            <section>
              <h3 className="section-title">
                <i className="fas fa-eye section-icon"></i>
                Viewport Operations
              </h3>
              <div className="button-grid">
                <button onClick={zoomIn} className="action-btn btn-gray">Zoom In</button>
                <button onClick={zoomOut} className="action-btn btn-gray">Zoom Out</button>
                <button onClick={fitView} className="action-btn btn-light-gray">Fit View</button>
                <button onClick={panToCenter} className="action-btn btn-light-gray">Center View</button>
              </div>
            </section>

            {/* Selection Operations */}
            <section>
              <h3 className="section-title">
                <i className="fas fa-mouse-pointer section-icon"></i>
                Selection Operations
              </h3>
              <div className="button-grid">
                <button onClick={selectAll} className="action-btn btn-blue-dark">Select All</button>
                <button onClick={clearSelection} className="action-btn btn-secondary">Clear Selection</button>
                <button onClick={focusRandom} className="action-btn btn-purple col-span-2">Focus Random</button>
              </div>
            </section>
          </div>
        </aside>

        {/* Canvas Area - 70% */}
        <div className="canvas-area">
          <InfiniteCanvas 
            ref={canvasRef}
            components={{
              'user-card': UserCard
            }}
            config={{
              grid: true,
              snapToGrid: true,
              theme: 'light'
            }}
            onChange={(scene) => {
              // Persist scene to local storage if needed
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
