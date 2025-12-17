
import React, { useRef, useState } from 'react';
import { InfiniteCanvas } from '../src';
import type { InfiniteCanvasRef, CanvasElement, Connection } from '../src';

// Example custom component for the SDK
const UserCard: React.FC<{ width: number; height: number; data: any }> = ({ width, height, data }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full flex flex-col justify-between">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
        <i className="fas fa-user"></i>
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-800">{data?.name || 'User Name'}</h4>
        <p className="text-[10px] text-gray-400">{data?.role || 'Lead Engineer'}</p>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
       <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-600 text-[10px] font-bold">ACTIVE</span>
       <button className="text-xs text-blue-500 font-medium">View Profile</button>
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
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            <i className="fas fa-infinity"></i>
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">LumenBoard <span className="text-blue-500 font-medium">API Playground</span></h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
            Last: {lastAction || 'No action'}
          </div>
          <button 
            onClick={handleExport}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
          >
            Export JSON
          </button>
        </div>
      </header>

      {/* Main Content - 30/70 Split */}
      <main className="flex-1 flex">
        {/* Controls Panel - 30% */}
        <aside className="w-[30%] bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Element Operations */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-shapes mr-2 text-blue-500"></i>
                Element Operations
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={createRectangle} className="px-3 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">Rectangle</button>
                <button onClick={createEllipse} className="px-3 py-2 bg-green-500 text-white rounded text-xs hover:bg-green-600">Ellipse</button>
                <button onClick={createText} className="px-3 py-2 bg-purple-500 text-white rounded text-xs hover:bg-purple-600">Text</button>
                <button onClick={createCustom} className="px-3 py-2 bg-orange-500 text-white rounded text-xs hover:bg-orange-600">Custom</button>
                <button onClick={createBatch} className="col-span-2 px-3 py-2 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600">Create Batch</button>
                <button onClick={updateSelected} className="px-3 py-2 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600">Update Selected</button>
                <button onClick={deleteSelected} className="px-3 py-2 bg-red-500 text-white rounded text-xs hover:bg-red-600">Delete Selected</button>
              </div>
            </section>

            {/* Connection Operations */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-link mr-2 text-blue-500"></i>
                Connection Operations
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={createConnection} className="col-span-2 px-3 py-2 bg-teal-500 text-white rounded text-xs hover:bg-teal-600">Connect First Two</button>
              </div>
            </section>

            {/* Viewport Operations */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-eye mr-2 text-blue-500"></i>
                Viewport Operations
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={zoomIn} className="px-3 py-2 bg-gray-700 text-white rounded text-xs hover:bg-gray-800">Zoom In</button>
                <button onClick={zoomOut} className="px-3 py-2 bg-gray-700 text-white rounded text-xs hover:bg-gray-800">Zoom Out</button>
                <button onClick={fitView} className="px-3 py-2 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">Fit View</button>
                <button onClick={panToCenter} className="px-3 py-2 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">Center View</button>
              </div>
            </section>

            {/* Selection Operations */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-mouse-pointer mr-2 text-blue-500"></i>
                Selection Operations
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={selectAll} className="px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Select All</button>
                <button onClick={clearSelection} className="px-3 py-2 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">Clear Selection</button>
                <button onClick={focusRandom} className="col-span-2 px-3 py-2 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">Focus Random</button>
              </div>
            </section>
          </div>
        </aside>

        {/* Canvas Area - 70% */}
        <div className="flex-1 relative">
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
