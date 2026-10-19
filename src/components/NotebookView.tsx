import React, { useRef, useEffect, useState } from 'react';
import { Notebook } from '../types';
import { ChevronLeft, ChevronRight, Download, Trash2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useSettings } from '../hooks/useSettings';

// ─── Page tone configs ──────────────────────────────────────────────────────
const TONES = {
  cream: { bg: '#fdfbf7', ruling: '#a09c94', border: '#e0dbd0' },
  white: { bg: '#ffffff', ruling: '#a8a8a8', border: '#e8e8e8' },
  sepia: { bg: '#f4ead2', ruling: '#b09070', border: '#d8c8a0' },
} as const;

// Font size → [px value, line-height px]
const FONT_SIZES = {
  sm: { size: '13px', lh: 28 },
  md: { size: '15px', lh: 32 },
  lg: { size: '18px', lh: 36 },
} as const;

const FONT_FAMILIES = {
  serif: '"Playfair Display", Georgia, serif',
  sans:  '"Inter", system-ui, sans-serif',
} as const;

// ─── Reusable toolbar button ─────────────────────────────────────────────────
function TBtn({
  onClick, title, active = false, danger = false, children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'h-9 w-9 flex items-center justify-center border rounded transition-all active:scale-95 select-none text-sm font-medium',
        active
          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
          : danger
          ? 'text-red-500 border-[#ddd] hover:bg-red-600 hover:text-white hover:border-red-600'
          : 'text-[#555] border-[#bbb] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a]',
      )}
    >
      {children}
    </button>
  );
}

// ─── Settings pill toggle ────────────────────────────────────────────────────
function SettingsPill({
  active, onClick, children, danger = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 text-[10px] uppercase tracking-wider border transition-colors rounded-sm',
        active && danger  ? 'bg-red-600   text-white border-red-600' :
        active            ? 'bg-[#333]    text-white border-[#333]'  :
                            'text-[#888] border-[#ccc] hover:border-[#888]',
      )}
    >
      {children}
    </button>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
interface NotebookViewProps {
  notebook: Notebook;
  onBack: () => void;
  onUpdatePage: (pageId: string, content: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
}

export function NotebookView({ notebook, onBack, onUpdatePage, onAddPage, onDeletePage }: NotebookViewProps) {
  const { settings, updateSetting } = useSettings();
  const [currentPageIndex, setCurrentPageIndex] = useState(notebook.pages.length - 1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Guard out-of-bounds index after page deletion
  useEffect(() => {
    if (currentPageIndex >= notebook.pages.length) {
      setCurrentPageIndex(Math.max(0, notebook.pages.length - 1));
    }
  }, [notebook.pages.length, currentPageIndex]);

  const currentPage = notebook.pages[currentPageIndex] || notebook.pages[0];

  const handleInput = () => {
    if (editorRef.current && currentPage) {
      onUpdatePage(currentPage.id, editorRef.current.innerHTML);
    }
  };

  // ── Formatting helpers ──────────────────────────────────────────────────
  const insertFormat = (command: string) => {
    document.execCommand(command, false, undefined);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInsertCheckbox = () => {
    document.execCommand(
      'insertHTML',
      false,
      '<input type="checkbox" style="width:13px;height:13px;margin-right:5px;vertical-align:middle;cursor:pointer;accent-color:#333;"> ',
    );
    editorRef.current?.focus();
    handleInput();
  };

  // ── PDF export ──────────────────────────────────────────────────────────
  const exportToPDF = async () => {
    // Close settings panel so it doesn't appear in the export
    setSettingsOpen(false);
    await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    const element = document.getElementById('a5-page-export-container');
    if (!element) return;

    // @ts-ignore — lazy-loaded to keep the initial bundle small
    const { default: html2pdf } = await import('html2pdf.js');

    html2pdf().set({
      margin: 0,
      filename: `${notebook.title.replace(/\s+/g, '_')}_Page_${currentPageIndex + 1}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' },
    }).from(element).save();
  };

  // ── Navigation ──────────────────────────────────────────────────────────
  const handleNextPage = () => {
    if (currentPageIndex < notebook.pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else {
      onAddPage();
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) setCurrentPageIndex(prev => prev - 1);
  };

  const handleDeletePage = () => {
    if (notebook.pages.length <= 1) return;
    if (confirm('Delete this page?')) onDeletePage(currentPage.id);
  };

  // ── Date formatting ─────────────────────────────────────────────────────
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date(currentPage?.createdAt || Date.now()));

  const lastEditedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: 'numeric',
  }).format(new Date(currentPage?.lastEditedAt || Date.now()));

  // Reset innerHTML when switching pages
  useEffect(() => {
    if (editorRef.current && currentPage && editorRef.current.innerHTML !== currentPage.content) {
      editorRef.current.innerHTML = currentPage.content;
    }
  }, [currentPage?.id]);

  if (!currentPage) return null;

  // ── Derived style values ────────────────────────────────────────────────
  const tone  = TONES[settings.pageTone as keyof typeof TONES];
  const fsObj = FONT_SIZES[settings.fontSize];
  const ruling = settings.showRuling
    ? `repeating-linear-gradient(transparent, transparent ${fsObj.lh - 1}px, ${tone.ruling} ${fsObj.lh - 1}px, ${tone.ruling} ${fsObj.lh}px)`
    : 'transparent';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">

      {/* ── Stage ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center relative w-full h-full">

        {/* Left nav — desktop */}
        <div className="absolute left-4 sm:left-8 z-10 hidden sm:block">
          <button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            className="p-3 rounded-full text-white/30 hover:text-white/70 disabled:opacity-20 transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        </div>

        {/* ── The Page ──────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage.id}
            initial={{ opacity: 0, rotateY: 8, scale: 0.96 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -8, scale: 0.96 }}
            transition={{ duration: 0.28, type: 'spring', stiffness: 160, damping: 22 }}
            className="rounded-r-md relative flex flex-col overflow-hidden"
            style={{
              backgroundColor: tone.bg,
              width: '520px',
              height: '640px',
              maxWidth: 'min(520px, calc(100vw - 40px))',
              maxHeight: 'min(640px, calc(min(520px, calc(100vw - 40px)) * 1.231), calc(100dvh - 96px))',
              boxShadow: '4px 8px 32px rgba(0,0,0,0.35), 16px 16px 48px rgba(0,0,0,0.25)',
            }}
          >
            {/* ── Export target ──────────────────────────────────────────── */}
            <div id="a5-page-export-container" className="flex-1 flex flex-col h-full relative">

              {/* Spine */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-r from-[#d0ccbc] to-[#e0dcd0] border-r border-[#c8c4b4] z-20 pointer-events-none" />

              {/* Margin line */}
              {settings.showMargin && (
                <div
                  className="absolute top-0 bottom-0 w-px pointer-events-none z-10"
                  style={{ left: '44px', backgroundColor: 'rgba(200,60,60,0.55)' }}
                />
              )}

              {/* ── Header ─────────────────────────────────────────────── */}
              <header
                className="pt-7 sm:pt-9 px-8 sm:px-12 pb-3 flex flex-col border-b z-10 shrink-0"
                style={{ backgroundColor: tone.bg, borderBottomColor: tone.border }}
              >
                {/* Title + date */}
                <div className="flex justify-between items-baseline mb-3">
                  <h2 className="text-[#1a1a1a] font-serif text-xl sm:text-2xl italic tracking-tight truncate pr-4">
                    {notebook.title}
                  </h2>
                  <span className="text-xs sm:text-sm text-[#333] font-sans shrink-0 font-medium">
                    {formattedDate}
                  </span>
                </div>

                {/* ── Toolbar ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                  {/* Formatting group */}
                  <div className="flex gap-1.5">
                    <TBtn onClick={() => insertFormat('insertOrderedList')} title="Ordered list">
                      1.
                    </TBtn>
                    <TBtn onClick={() => insertFormat('insertUnorderedList')} title="Bullet list">
                      •
                    </TBtn>
                    <TBtn onClick={handleInsertCheckbox} title="Insert checkbox">
                      ☐
                    </TBtn>
                  </div>

                  {/* Action group */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-[#777] font-sans mr-1 hidden sm:block">
                      {lastEditedTime}
                    </span>
                    <TBtn onClick={exportToPDF} title="Export page as PDF">
                      <Download className="w-4 h-4" />
                    </TBtn>
                    <TBtn
                      onClick={() => setSettingsOpen(prev => !prev)}
                      title="Page settings"
                      active={settingsOpen}
                    >
                      <Settings className="w-4 h-4" />
                    </TBtn>
                    {notebook.pages.length > 1 && (
                      <TBtn onClick={handleDeletePage} title="Delete this page" danger>
                        <Trash2 className="w-4 h-4" />
                      </TBtn>
                    )}
                  </div>
                </div>
              </header>

              {/* ── Settings panel ─────────────────────────────────────── */}
              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden shrink-0 border-b z-10"
                    style={{ backgroundColor: tone.bg, borderBottomColor: tone.border }}
                  >
                    <div className="px-8 sm:px-12 py-4 grid grid-cols-2 gap-4">

                      {/* Font size */}
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-[#aaa] mb-2">Size</p>
                        <div className="flex gap-1">
                          {(['sm', 'md', 'lg'] as const).map(s => (
                            <button
                              key={s}
                              onClick={() => updateSetting('fontSize', s)}
                              className={cn(
                                'flex-1 py-1.5 text-[10px] uppercase tracking-wider border transition-colors',
                                settings.fontSize === s
                                  ? 'bg-[#333] text-white border-[#333]'
                                  : 'text-[#888] border-[#ccc] hover:border-[#888]',
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font family */}
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-[#aaa] mb-2">Font</p>
                        <div className="flex gap-1">
                          {(['serif', 'sans'] as const).map(f => (
                            <button
                              key={f}
                              onClick={() => updateSetting('fontFamily', f)}
                              className={cn(
                                'flex-1 py-1.5 text-[10px] border transition-colors',
                                settings.fontFamily === f
                                  ? 'bg-[#333] text-white border-[#333]'
                                  : 'text-[#888] border-[#ccc] hover:border-[#888]',
                              )}
                              style={{
                                fontFamily: f === 'serif' ? 'Georgia, serif' : '"Inter", sans-serif',
                              }}
                            >
                              {f === 'serif' ? 'Serif' : 'Sans'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Page tone */}
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-[#aaa] mb-2">Page</p>
                        <div className="flex gap-2 items-center">
                          {(
                            [
                              { v: 'cream', bg: '#fdfbf7', label: 'Cream' },
                              { v: 'white', bg: '#ffffff', label: 'White' },
                              { v: 'sepia', bg: '#f4ead2', label: 'Sepia' },
                            ] as const
                          ).map(({ v, bg, label }) => (
                            <button
                              key={v}
                              onClick={() => updateSetting('pageTone', v)}
                              title={label}
                              className={cn(
                                'w-6 h-6 rounded-full border-2 transition-all',
                                settings.pageTone === v
                                  ? 'border-[#555] scale-125 shadow'
                                  : 'border-[#ccc] hover:border-[#888]',
                              )}
                              style={{ backgroundColor: bg }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Lines toggles */}
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-[#aaa] mb-2">Lines</p>
                        <div className="flex gap-1.5">
                          <SettingsPill
                            active={settings.showRuling}
                            onClick={() => updateSetting('showRuling', !settings.showRuling)}
                          >
                            Ruled
                          </SettingsPill>
                          <SettingsPill
                            active={settings.showMargin}
                            danger
                            onClick={() => updateSetting('showMargin', !settings.showMargin)}
                          >
                            Margin
                          </SettingsPill>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Content area ───────────────────────────────────────── */}
              <div
                className="flex-1 relative px-8 sm:px-12 py-6 sm:py-8 overflow-y-auto page-scrollbar"
              >
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleInput}
                  className="w-full min-h-full outline-none text-[#2a2a2a] relative z-20"
                  data-placeholder="Start writing…"
                  style={{
                    fontSize: fsObj.size,
                    lineHeight: `${fsObj.lh}px`,
                    fontFamily: FONT_FAMILIES[settings.fontFamily],
                    background: ruling,
                  }}
                />
              </div>

              {/* ── Footer ─────────────────────────────────────────────── */}
              <footer
                className="py-4 px-6 flex justify-between items-center border-t shrink-0 z-10"
                style={{ backgroundColor: tone.bg, borderTopColor: tone.border }}
              >
                <span className="text-[9px] text-[#bbb] font-sans uppercase tracking-widest truncate max-w-[40%]">
                  {notebook.title}
                </span>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-black/35" />
                  <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                </div>
                <span className="text-[9px] text-[#bbb] font-sans">
                  {currentPageIndex + 1} / {notebook.pages.length}
                </span>
              </footer>

            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right nav — desktop */}
        <div className="absolute right-4 sm:right-8 z-10 hidden sm:block">
          <button
            onClick={handleNextPage}
            className="p-3 rounded-full text-white/30 hover:text-white/70 transition-all hover:scale-105 active:scale-95"
            title={currentPageIndex === notebook.pages.length - 1 ? 'Add new page' : 'Next page'}
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>

      </div>

      {/* ── Mobile nav bar ────────────────────────────────────────────────── */}
      <div className="sm:hidden flex items-center justify-center gap-8 py-4 shrink-0">
        <button
          onClick={handlePrevPage}
          disabled={currentPageIndex === 0}
          className="p-2 text-white/30 disabled:opacity-20 hover:text-white/60 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[10px] text-white/20 uppercase tracking-widest">
          {currentPageIndex + 1} / {notebook.pages.length}
        </span>
        <button
          onClick={handleNextPage}
          className="p-2 text-white/30 hover:text-white/60 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
