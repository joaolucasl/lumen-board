
import React, { useRef } from 'react';
import InfiniteCanvas from './components/InfiniteCanvas';
import { InfiniteCanvasRef } from './types';

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

  const handleExport = () => {
    const data = canvasRef.current?.exportJson();
    console.log('Exported Scene:', data);
    alert('Scene state logged to console!');
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            <i className="fas fa-infinity"></i>
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">LumenBoard <span className="text-blue-500 font-medium">SDK</span></h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 text-xs text-gray-500 space-x-4">
            <span><i className="fas fa-keyboard mr-2"></i>Space + Drag: Pan</span>
            <span><i className="fas fa-mouse mr-2"></i>Scroll: Zoom</span>
          </div>
          <button 
            onClick={handleExport}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
          >
            Export JSON
          </button>
        </div>
      </header>

      {/* Main SDK Area */}
      <main className="flex-1 relative">
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
      </main>

      {/* Footer Info */}
      <footer className="absolute bottom-6 right-6 pointer-events-none">
        <div className="bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/40 text-[10px] text-gray-400 font-medium">
          v0.0.1
        </div>
      </footer>
    </div>
  );
};

export default App;
