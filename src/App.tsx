import React, { useState } from 'react';
import { Bookshelf } from './components/Bookshelf';
import { NotebookView } from './components/NotebookView';
import { useStore } from './hooks/useStore';
import { AnimatePresence, motion } from 'motion/react';
import { X, BookOpen } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const { notebooks, createNotebook, deleteNotebook, openNotebook, addPage, updatePage, deletePage } = useStore();
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleOpenNotebook = (id: string) => {
    openNotebook(id);
    setActiveNotebookId(id);
    setMobileSidebarOpen(false);
  };

  const activeNotebook = notebooks.find(n => n.id === activeNotebookId);

  return (
    <div className="h-screen w-full bg-[#1e1e1c] text-[#e0e0d8] font-sans flex flex-col overflow-hidden selection:bg-white/20">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-[#1e1e1c] flex items-center justify-center font-bold text-base rounded-sm shrink-0 select-none">
            A5
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xs font-medium tracking-[0.3em] uppercase text-white/80">Notebooks</h1>
            <p className="text-[10px] text-white/25 tracking-widest">Your digital library</p>
          </div>
          {/* Breadcrumb on desktop when notebook is open */}
          {activeNotebook && (
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <span className="text-white/15 text-xs">/</span>
              <span className="text-xs text-white/40 font-light italic">{activeNotebook.title}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile library toggle */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="sm:hidden p-2 text-white/40 hover:text-white/70 transition-colors rounded"
            aria-label="Open library"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Close active notebook */}
          {activeNotebook && (
            <button
              onClick={() => setActiveNotebookId(null)}
              className="hidden sm:flex p-2 text-white/20 hover:text-white/50 transition-colors rounded"
              title="Close notebook"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsCreating(true)}
            className="px-3 sm:px-4 py-1.5 bg-white text-[#1e1e1c] text-[10px] sm:text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-gray-100 active:scale-95 transition-all shrink-0"
          >
            + New
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile backdrop */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-40 sm:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={cn(
          "bg-[#161614] border-r border-white/5 flex flex-col overflow-y-auto custom-scrollbar shrink-0 transition-transform duration-300",
          // Mobile: fixed drawer
          "fixed top-0 bottom-0 left-0 z-50 w-[280px] p-6",
          // Desktop: static sidebar
          "sm:relative sm:top-auto sm:bottom-auto sm:left-auto sm:z-auto sm:w-[300px] sm:p-8 sm:translate-x-0",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        )}>
          {/* Mobile drawer header */}
          <div className="flex items-center justify-between mb-6 sm:hidden">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">Library</span>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="text-white/40 hover:text-white/70 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Bookshelf
            notebooks={notebooks}
            onCreate={createNotebook}
            onOpen={handleOpenNotebook}
            onDelete={deleteNotebook}
            isCreating={isCreating}
            setIsCreating={setIsCreating}
          />
        </aside>

        {/* Main stage */}
        <main className="flex-1 bg-[#252523] flex flex-col items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeNotebook ? (
              <motion.div
                key="notebook"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <NotebookView
                  notebook={activeNotebook}
                  onBack={() => setActiveNotebookId(null)}
                  onUpdatePage={(pageId, content) => updatePage(activeNotebook.id, pageId, content)}
                  onAddPage={() => addPage(activeNotebook.id)}
                  onDeletePage={(pageId) => deletePage(activeNotebook.id, pageId)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 text-center px-8"
              >
                <div className="w-10 h-10 border border-white/8 rounded-sm flex items-center justify-center mb-1">
                  <span className="text-white/15 font-bold text-sm select-none">A5</span>
                </div>
                <p className="text-white/20 text-[10px] tracking-[0.25em] uppercase font-medium">
                  Select a notebook
                </p>
                <p className="text-white/10 text-[10px] tracking-wider hidden sm:block">
                  Choose from the library, or create a new one
                </p>
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="sm:hidden mt-2 text-white/20 text-[10px] tracking-wider flex items-center gap-1.5 hover:text-white/40 transition-colors"
                >
                  <BookOpen className="w-3 h-3" />
                  Open library
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
