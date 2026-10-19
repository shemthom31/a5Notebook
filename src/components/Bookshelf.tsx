import React, { useState } from 'react';
import { Notebook } from '../types';
import { Trash2, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface BookshelfProps {
  notebooks: Notebook[];
  onCreate: (title: string, color: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  isCreating: boolean;
  setIsCreating: (v: boolean) => void;
}

const COLORS = [
  'bg-[#4a5d4e]', 'bg-[#7d4a4a]', 'bg-[#4a587d]', 'bg-[#c4a45a]',
  'bg-[#2a2a28]', 'bg-[#6b5b53]', 'bg-[#405461]', 'bg-[#684756]',
  'bg-emerald-800', 'bg-teal-800', 'bg-cyan-800', 'bg-blue-800',
  'bg-indigo-800', 'bg-violet-800', 'bg-purple-800', 'bg-neutral-800',
];

export function Bookshelf({ notebooks, onCreate, onOpen, onDelete, isCreating, setIsCreating }: BookshelfProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onCreate(newTitle.trim(), newColor);
      setNewTitle('');
      setNewColor(COLORS[0]);
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* Library header */}
      <div className="flex items-baseline justify-between mb-6">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">The Library</span>
        {notebooks.length > 0 && (
          <span className="text-[10px] text-white/20">{notebooks.length}</span>
        )}
      </div>

      {/* Notebook spines */}
      {notebooks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <BookOpen className="w-8 h-8 text-white/10" />
          <p className="text-[10px] text-white/20 leading-relaxed tracking-wide">
            No notebooks yet.<br />Create your first one.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 sm:gap-3 items-end">
          <AnimatePresence>
            {notebooks.map((notebook, i) => {
              const height = 260 + ((i * 17) % 40);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -16, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  key={notebook.id}
                  className="relative group cursor-pointer"
                >
                  {/* Book spine */}
                  <button
                    onClick={() => onOpen(notebook.id)}
                    className={cn(
                      "w-9 sm:w-10 border-l-4 rounded-sm relative shadow-md transition-all duration-200",
                      "hover:brightness-110 hover:-translate-y-1 hover:shadow-lg",
                      "ring-0 hover:ring-1 hover:ring-white/15",
                      notebook.color,
                      notebook.color === 'bg-[#2a2a28]' ? 'border-white/5 border-r border-r-white/5' : 'border-black/25'
                    )}
                    style={{ height: `${height}px` }}
                    title={notebook.title}
                  >
                    <span className={cn(
                      "absolute top-4 left-1/2 -translate-x-1/2 [writing-mode:vertical-rl] rotate-180 text-[9px] uppercase tracking-widest whitespace-nowrap overflow-hidden",
                      notebook.color === 'bg-[#c4a45a]' ? 'text-black/60 font-black' :
                      notebook.color === 'bg-[#2a2a28]' ? 'text-white/25 font-bold' : 'text-white/75 font-semibold'
                    )}>
                      {notebook.title}
                    </span>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this notebook and all its pages?')) {
                        onDelete(notebook.id);
                      }
                    }}
                    className="absolute -top-2.5 -right-2.5 bg-[#3a1a1a] text-red-400 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow z-10 hover:bg-red-900 hover:text-white"
                    title="Delete notebook"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom quote */}
      <div className="mt-auto pt-8">
        <div className="p-3.5 bg-white/4 rounded-lg border border-white/5">
          <p className="text-[10px] text-white/30 leading-relaxed italic">
            "A blank page is a playground for the mind."
          </p>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.18 }}
              className="bg-[#1e1e1c] border border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-sm text-[#e0e0d8]"
            >
              <h2 className="text-lg font-serif font-bold mb-1">New Notebook</h2>
              <p className="text-[11px] text-white/30 mb-5">Give it a title and pick a spine color.</p>
              <form onSubmit={handleCreate}>
                <div className="mb-5">
                  <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#161614] border border-white/10 rounded-md focus:outline-none focus:border-white/25 text-sm text-white placeholder-white/20 transition-colors"
                    placeholder="e.g. Field Notes, Ideas, Journal…"
                    autoFocus
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-3">Spine Color</label>
                  <div className="grid grid-cols-8 gap-2">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewColor(color)}
                        className={cn(
                          "w-7 h-7 sm:w-8 sm:h-8 rounded-full focus:outline-none transition-all border border-black/20",
                          color,
                          newColor === color
                            ? "scale-115 ring-2 ring-white/40 ring-offset-2 ring-offset-[#1e1e1c]"
                            : "opacity-60 hover:opacity-90 hover:scale-105"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsCreating(false); setNewTitle(''); }}
                    className="px-4 py-2 text-white/30 hover:text-white/60 text-xs font-medium tracking-widest uppercase transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newTitle.trim()}
                    className="px-5 py-2 bg-white text-[#1e1e1c] text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
