export const ANNOTATION_CATEGORIES = [
  'Plants & Trees',
  'Mulch & Rocks', 
  'Hardscape',
  'Other'
] as const;

export type AnnotationCategory = (typeof ANNOTATION_CATEGORIES)[number];

export const CATEGORY_COLORS: Record<AnnotationCategory, string> = {
  'Plants & Trees': '#22c55e',
  'Mulch & Rocks': '#a855f7',
  'Hardscape': '#3b82f6',
  'Other': '#f59e0b'
};

export const CATEGORY_SHORTCUTS: Record<AnnotationCategory, string> = {
  'Plants & Trees': '1',
  'Mulch & Rocks': '2',
  'Hardscape': '3',
  'Other': '4'
};