/** Official upload categories (aligned with server). */
export const DOCUMENT_CATEGORY_OPTIONS = [
  'Guideline',
  'Circular / Notice',
  'SOP / Procedure',
  'Form / Template',
  'Compliance Document',
];

/** Admin list filter: current + legacy-only buckets. */
export const DOCUMENT_CATEGORY_FILTER_OPTIONS = [...DOCUMENT_CATEGORY_OPTIONS, 'Report', 'Other'];

/** Friendly labels for legacy stored values. */
export function displayDocumentCategory(c) {
  const map = {
    Circular: 'Circular / Notice',
    Form: 'Form / Template',
  };
  return map[c] || c || '—';
}

/** Shown when the document was modified after creation (e.g. archived/unarchived). */
export function documentShowsUpdatedBadge(doc) {
  if (!doc?.createdAt || !doc?.updatedAt) return false;
  return new Date(doc.updatedAt) - new Date(doc.createdAt) > 60000;
}
