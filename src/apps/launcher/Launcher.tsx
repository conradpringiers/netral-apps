/**
 * Netral Launcher
 * Gallery view to select between different Netral tools
 */

import { useRef, useState } from 'react';
import { Layers, Presentation, Upload, FileText } from 'lucide-react';

export type NetralMode = 'block' | 'deck' | null;

interface LauncherProps {
  onSelectMode: (mode: NetralMode, content?: string) => void;
}

const tools = [
  {
    id: 'block' as const,
    name: 'Netral Block',
    description: 'Create websites with simple, intuitive syntax',
    icon: Layers,
    color: 'bg-blue-500',
  },
  {
    id: 'deck' as const,
    name: 'Netral Deck',
    description: 'Create elegant presentations with interactive slides',
    icon: Presentation,
    color: 'bg-purple-500',
  },
];

export function Launcher({ onSelectMode }: LauncherProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileLoad = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'netdeck') {
        onSelectMode('deck', content);
      } else {
        onSelectMode('block', content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileLoad(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileLoad(file);
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Netral<span className="text-blue-500">.</span>
          </h1>
          <p className="text-slate-500">
            Choose your creation tool
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onSelectMode(tool.id)}
              className="group bg-white border border-slate-200 rounded-xl p-5 text-left transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-lg ${tool.color} mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <tool.icon className="h-5 w-5 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-lg font-semibold text-slate-900 mb-1 transition-colors duration-300 group-hover:text-blue-600">{tool.name}</h2>
              <p className="text-slate-500 text-sm">{tool.description}</p>
            </button>
          ))}
        </div>

        {/* Drag & Drop Area */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".netblock,.netdeck,.txt"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className={`p-2 rounded-full ${isDragOver ? 'bg-blue-100' : 'bg-slate-100'}`}>
              {isDragOver ? (
                <FileText className="h-5 w-5 text-blue-500" />
              ) : (
                <Upload className="h-5 w-5 text-slate-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                {isDragOver ? 'Drop file here' : 'Drop a file or click to open'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                .netblock or .netdeck
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default Launcher;
