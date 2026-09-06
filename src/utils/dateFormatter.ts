/**
 * Utility functions for formatting order dates, times, relative times,
 * and completion durations in Bengali & English.
 */

export function formatOrderDateTime(isoString?: string): string {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return isoString;
  }
}

export function formatOrderTime(isoString?: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
}

export function getOrderDuration(startIso?: string, endIso?: string): string {
  if (!startIso || !endIso) return '';
  try {
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    if (isNaN(start) || isNaN(end) || end < start) return '';

    const diffMs = end - start;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return '১ মিনিটের কম (Just now)';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} মিনিট (${diffMinutes} mins)`;
    }
    const hours = Math.floor(diffMinutes / 60);
    const remainingMins = diffMinutes % 60;
    if (remainingMins === 0) {
      return `${hours} ঘণ্টা (${hours}h)`;
    }
    return `${hours} ঘণ্টা ${remainingMins} মিনিট (${hours}h ${remainingMins}m)`;
  } catch {
    return '';
  }
}

export function getRelativeElapsed(isoString?: string): string {
  if (!isoString) return '';
  try {
    const now = Date.now();
    const past = new Date(isoString).getTime();
    if (isNaN(past)) return '';

    const diffMs = Math.max(0, now - past);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'এইমাত্র (Just now)';
    if (diffMinutes < 60) return `${diffMinutes} মিনিট আগে (${diffMinutes}m ago)`;
    const hours = Math.floor(diffMinutes / 60);
    if (hours < 24) return `${hours} ঘণ্টা আগে (${hours}h ago)`;
    const days = Math.floor(hours / 24);
    return `${days} দিন আগে (${days}d ago)`;
  } catch {
    return '';
  }
}
