export interface Template {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
}

export const templates: Template[] = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      background: '#ffffff',
      text: '#1f2937',
      accent: '#f59e0b',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    colors: {
      primary: '#60a5fa',
      secondary: '#a78bfa',
      background: '#111827',
      text: '#f9fafb',
      accent: '#fbbf24',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      background: '#f0f9ff',
      text: '#0c4a6e',
      accent: '#0891b2',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      background: '#f0fdf4',
      text: '#064e3b',
      accent: '#14b8a6',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      background: '#fff7ed',
      text: '#7c2d12',
      accent: '#fb923c',
    },
  },
  {
    id: 'purple',
    name: 'Purple Dream',
    colors: {
      primary: '#a855f7',
      secondary: '#9333ea',
      background: '#faf5ff',
      text: '#581c87',
      accent: '#c084fc',
    },
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    colors: {
      primary: '#f43f5e',
      secondary: '#e11d48',
      background: '#fff1f2',
      text: '#881337',
      accent: '#fb7185',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      background: '#1e1b4b',
      text: '#e0e7ff',
      accent: '#818cf8',
    },
  },
];
