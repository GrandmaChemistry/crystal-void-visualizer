import React, { useState } from 'react';
import { Layers, Cuboid, Info, X, Grid3X3, Eye, Pentagon } from 'lucide-react';
import CrystalScene from './components/CrystalScene';
import StarryBackground from './components/StarryBackground';
import { STRUCTURES } from './constants';
import { CrystalType, VoidDisplayMode, SelectedVoidInfo } from './types';

function App() {
  const [currentType, setCurrentType] = useState<CrystalType>(CrystalType.FCC);
  const [showAtoms, setShowAtoms] = useState(true);
  const [showOctahedral, setShowOctahedral] = useState(true);
  const [showTetrahedral, setShowTetrahedral] = useState(false);
  
  // New States
  const [voidDisplayMode, setVoidDisplayMode] = useState<VoidDisplayMode>('dot');
  const [gridSize, setGridSize] = useState<number>(1);
  const [selectedVoid, setSelectedVoid] = useState<SelectedVoidInfo | null>(null);

  const data = STRUCTURES[currentType];
  
  // Stats - using amortized count per unit cell as requested
  const octCount = data.effectiveOctahedralCount;
  const tetCount = data.effectiveTetrahedralCount;

  return (
    <div className="flex h-screen bg-transparent text-slate-100 overflow-hidden font-sans relative">
      <StarryBackground />
      
      {/* Sidebar Controls */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-2xl w-80 max-h-[90vh] overflow-y-auto custom-scrollbar transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cuboid className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              CrystaVoid
            </h1>
          </div>
        </div>

        {/* Structure Selection */}
        <div className="mb-5 space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
             <Layers size={12} /> 晶体结构 (Structure)
          </label>
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => { setCurrentType(CrystalType.FCC); setSelectedVoid(null); }}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentType === CrystalType.FCC 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              FCC
            </button>
            <button
              onClick={() => { setCurrentType(CrystalType.BCC); setSelectedVoid(null); }}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentType === CrystalType.BCC 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              BCC
            </button>
          </div>
        </div>

        {/* View Settings (Grid) */}
        <div className="mb-5 space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                 <Grid3X3 size={12} /> 视图设置 (View)
            </label>
            <div className="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                <span className="text-sm text-slate-300">多晶胞显示 (Multi-cell)</span>
                <div className="flex items-center gap-1 bg-slate-800 rounded p-0.5">
                    <button 
                        onClick={() => setGridSize(1)}
                        className={`px-3 py-1 text-xs rounded ${gridSize === 1 ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >1x1</button>
                    <button 
                         onClick={() => setGridSize(2)}
                         className={`px-3 py-1 text-xs rounded ${gridSize === 2 ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >2x2</button>
                </div>
            </div>
        </div>

        {/* Void Visibility */}
        <div className="space-y-3 mb-5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Eye size={12} /> 显示元素 (Visibility)
          </label>
          
          <button 
            onClick={() => setShowAtoms(!showAtoms)}
            className="flex items-center w-full justify-between group p-1 hover:bg-slate-800/50 rounded"
          >
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]`}></span>
              <span className="text-sm group-hover:text-white transition-colors">原子 (Atoms)</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${showAtoms ? 'bg-indigo-500' : 'bg-slate-700'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${showAtoms ? 'left-4.5' : 'left-0.5'}`}></div>
            </div>
          </button>

          <button 
            onClick={() => setShowOctahedral(!showOctahedral)}
            className="flex items-center w-full justify-between group p-1 hover:bg-slate-800/50 rounded"
          >
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]`}></span>
              <span className="text-sm group-hover:text-white transition-colors">八面体空隙 ({octCount}/晶胞)</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${showOctahedral ? 'bg-indigo-500' : 'bg-slate-700'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${showOctahedral ? 'left-4.5' : 'left-0.5'}`}></div>
            </div>
          </button>

          <button 
            onClick={() => setShowTetrahedral(!showTetrahedral)}
            className="flex items-center w-full justify-between group p-1 hover:bg-slate-800/50 rounded"
          >
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]`}></span>
              <span className="text-sm group-hover:text-white transition-colors">四面体空隙 ({tetCount}/晶胞)</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${showTetrahedral ? 'bg-indigo-500' : 'bg-slate-700'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${showTetrahedral ? 'left-4.5' : 'left-0.5'}`}></div>
            </div>
          </button>
        </div>

        {/* Void Style Selection */}
        <div className="mb-5 space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Pentagon size={12} /> 空隙样式 (Style)
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button 
                   onClick={() => setVoidDisplayMode('dot')}
                   className={`text-xs py-1.5 rounded transition-colors ${voidDisplayMode === 'dot' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >点状</button>
                <button 
                   onClick={() => setVoidDisplayMode('wireframe')}
                   className={`text-xs py-1.5 rounded transition-colors ${voidDisplayMode === 'wireframe' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >框架</button>
                <button 
                   onClick={() => setVoidDisplayMode('solid')}
                   className={`text-xs py-1.5 rounded transition-colors ${voidDisplayMode === 'solid' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >填充</button>
            </div>
        </div>

        {/* Selected Info Panel */}
        {selectedVoid ? (
            <div className="mt-4 p-3 bg-indigo-900/30 border border-indigo-500/30 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                        <Info size={14} /> 选中空隙信息
                    </h3>
                    <button onClick={() => setSelectedVoid(null)} className="text-slate-400 hover:text-white"><X size={14} /></button>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between">
                        <span>类型:</span>
                        <span className={selectedVoid.type === 'oct' ? 'text-red-400' : 'text-green-400'}>
                            {selectedVoid.type === 'oct' ? '八面体 (Oct)' : '四面体 (Tet)'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>坐标:</span>
                        <span className="font-mono">
                            ({selectedVoid.position.map(n => n.toFixed(2)).join(', ')})
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>配位原子数:</span>
                        <span className="font-mono">{selectedVoid.neighbors.length}</span>
                    </div>
                     <p className="mt-2 text-slate-400 italic opacity-80 border-t border-indigo-500/20 pt-2">
                        已高亮显示该空隙及其周围配位原子。
                    </p>
                </div>
            </div>
        ) : (
            <div className="mt-4 p-3 border border-dashed border-slate-700 rounded-lg text-center">
                <p className="text-xs text-slate-500">点击场景中的空隙可查看详情并高亮配位原子</p>
            </div>
        )}

        {/* Structure Stats */}
        <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>理论堆积效率:</span>
            <span className="text-slate-200 font-mono">{data.packingEfficiency}</span>
          </div>
          <div className="flex justify-between">
            <span>原子配位数:</span>
            <span className="text-slate-200 font-mono">{data.coordinationNumber}</span>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <CrystalScene 
          data={data}
          crystalType={currentType}
          showAtoms={showAtoms}
          showOctahedral={showOctahedral}
          showTetrahedral={showTetrahedral}
          voidDisplayMode={voidDisplayMode}
          gridSize={gridSize}
          selectedVoid={selectedVoid}
          onSelectVoid={setSelectedVoid}
        />
      </div>
    </div>
  );
}

export default App;