import { useState, useEffect, useCallback } from 'react';
import { Notebook, Page } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORE_KEY = 'a5_notebooks_store';

const DEFAULT_NOTEBOOKS: Notebook[] = [
  {
    id: 'default-journal-001',
    title: 'Journal',
    color: 'bg-blue-800',
    createdAt: 1700000000000,
    lastOpenedAt: 1700000000000,
    pages: [
      {
        id: 'default-journal-page-001',
        content: 'Welcome to my daily journal.<br>Today something fantastic happened!',
        createdAt: 1700000000000,
        lastEditedAt: 1700000000000,
      },
    ],
  },
];

export function useStore() {
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load notebooks from local storage', e);
    }
    return DEFAULT_NOTEBOOKS;
  });

  // Persist whenever notebooks change
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(notebooks));
  }, [notebooks]);

  const createNotebook = useCallback((title: string, color: string) => {
    const newNotebook: Notebook = {
      id: uuidv4(),
      title,
      color,
      pages: [
        {
          id: uuidv4(),
          content: '',
          createdAt: Date.now(),
          lastEditedAt: Date.now(),
        }
      ],
      createdAt: Date.now(),
      lastOpenedAt: Date.now(),
    };
    setNotebooks((prev) => [newNotebook, ...prev]);
    return newNotebook;
  }, []);

  const deleteNotebook = useCallback((id: string) => {
    setNotebooks((prev) => prev.filter(n => n.id !== id));
  }, []);

  const openNotebook = useCallback((id: string) => {
    setNotebooks((prev) => 
      prev.map(n => n.id === id ? { ...n, lastOpenedAt: Date.now() } : n)
    );
  }, []);

  const addPage = useCallback((notebookId: string) => {
    setNotebooks((prev) => prev.map(n => {
      if (n.id === notebookId) {
        return {
          ...n,
          pages: [...n.pages, {
            id: uuidv4(),
            content: '',
            createdAt: Date.now(),
            lastEditedAt: Date.now(),
          }]
        };
      }
      return n;
    }));
  }, []);

  const updatePage = useCallback((notebookId: string, pageId: string, content: string) => {
    setNotebooks((prev) => prev.map(n => {
      if (n.id === notebookId) {
        return {
          ...n,
          pages: n.pages.map(p => {
            if (p.id === pageId) {
              return {
                ...p,
                content,
                lastEditedAt: Date.now()
              };
            }
            return p;
          })
        };
      }
      return n;
    }));
  }, []);
  
  const deletePage = useCallback((notebookId: string, pageId: string) => {
     setNotebooks((prev) => prev.map(n => {
      if (n.id === notebookId) {
        return {
          ...n,
          pages: n.pages.filter(p => p.id !== pageId)
        };
      }
      return n;
    }));
  }, []);

  return {
    notebooks,
    createNotebook,
    deleteNotebook,
    openNotebook,
    addPage,
    updatePage,
    deletePage
  };
}
