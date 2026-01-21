/**
 * Calculate days pending and get status color
 * Green: 0-1 day
 * Yellow: 1-2 days  
 * Red: >2 days
 */

export function getDaysPending(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diff = now.getTime() - created.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getStatusColor(daysPending: number): string {
  if (daysPending > 2) return "#ef4444"; // Red
  if (daysPending > 1) return "#f59e0b"; // Yellow/Orange
  return "#10b981"; // Green
}

export function getStatusLabel(daysPending: number): string {
  if (daysPending === 0) return "Today";
  if (daysPending === 1) return "Yesterday";
  return `${daysPending} days ago`;
}
