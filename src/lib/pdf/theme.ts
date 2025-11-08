// Central Tailwind-like color palette for React-PDF (hex values)
export const tw = {
  slate: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
    400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
    800: '#1f2937', 900: '#0f172a',
  },
  gray: {
    50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db',
    400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151',
    800: '#1f2937', 900: '#111827',
  },
  blue: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
    400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
    800: '#1e40af', 900: '#1e3a8a',
  },
  green: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 600: '#059669', 700: '#047857' },
  red:   { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 600: '#dc2626', 700: '#b91c1c' },
  amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 600: '#d97706', 700: '#b45309' },
  violet:{ 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 600: '#7c3aed', 700: '#6d28d9' },
}

export const pdfTheme = {
  text: {
    primary: '#111111',
    muted: tw.gray[500],
  },
  border: tw.gray[200],
  subtleBorder: tw.gray[100],
  tableHeaderBg: tw.gray[100],
  badge: {
    defaultBg: tw.gray[100],
    defaultText: tw.gray[700],
    paidBg: '#dcfce7',
    paidText: '#166534',
    sentBg: tw.blue[100],
    sentText: tw.blue[800],
    overdueBg: tw.red[100],
    overdueText: '#991b1b',
  },
  brand: {
    primary: '#2388ff',
  },
}


