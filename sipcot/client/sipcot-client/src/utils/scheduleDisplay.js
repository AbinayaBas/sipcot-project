/** Shared labels for schedule items (admin + industry UIs). */
export function displayScheduleType(t) {
  if (t === 'Deadline') return 'Submission Deadline';
  return t || '—';
}

export function scheduleTypeBadgeClass(t) {
  if (t === 'Inspection' || t === 'Compliance Check') return 'badge-info';
  if (t === 'Submission Deadline' || t === 'Deadline') return 'badge-warning';
  return 'badge-muted';
}

export function scheduleEventStatusBadgeClass(s) {
  const v = s || 'upcoming';
  if (v === 'completed') return 'badge-success';
  if (v === 'cancelled') return 'badge-danger';
  return 'badge-info';
}

export function scheduleEventStatusLabel(s) {
  const v = s || 'upcoming';
  if (v === 'completed') return 'Completed';
  if (v === 'cancelled') return 'Cancelled';
  return 'Upcoming';
}
