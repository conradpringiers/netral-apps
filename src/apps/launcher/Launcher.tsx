/**
 * Netral Launcher
 * Gallery view to select between different Netral tools
 */

import { Layers, Presentation } from 'lucide-react';

export type NetralMode = 'block' | 'deck' | null;

interface LauncherProps {
  onSelectMode: (mode: NetralMode) => void;
}

const tools = [
  {
    id: 'block' as const,
    name: 'Netral Block',
    description: 'Créez des sites web avec une syntaxe simple et intuitive',
    icon: Layers,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'deck' as const,
    name: 'Netral Deck',
    description: 'Créez des présentations élégantes avec des slides interactives',
    icon: Presentation,
    color: 'from-purple-500 to-pink-600',
  },
];

export function Launcher({ onSelectMode }: LauncherProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Netral<span className="text-blue-400">.</span>
          </h1>
          <p className="text-xl text-slate-400">
            Choisissez votre outil de création
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onSelectMode(tool.id)}
              className="group relative bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-left transition-all duration-300 hover:border-slate-500 hover:bg-slate-800/80 hover:scale-[1.02] hover:shadow-2xl"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${tool.color} mb-6`}>
                <tool.icon className="h-8 w-8 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-white mb-2">{tool.name}</h2>
              <p className="text-slate-400">{tool.description}</p>

              {/* Arrow indicator */}
              <div className="absolute bottom-8 right-8 text-slate-600 group-hover:text-white group-hover:translate-x-2 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <p className="text-center text-slate-500 mt-12 text-sm">
          Vous pouvez aussi charger un fichier .netblock ou .netdeck pour ouvrir directement le bon outil
        </p>
      </div>
    </div>
  );
}

export default Launcher;
