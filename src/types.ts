export interface Page {
  id: string;
  content: string;
  createdAt: number;
  lastEditedAt: number;
}

export interface Notebook {
  id: string;
  title: string;
  color: string;
  pages: Page[];
  createdAt: number;
  lastOpenedAt: number;
}
