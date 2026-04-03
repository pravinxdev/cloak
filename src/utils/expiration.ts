// ⏰ Parse expiration string to timestamp
export function parseExpiration(expireStr: string): number | null {
  if (!expireStr) return null;

  // Format 1: relative like "30d", "7d", "1h"
  if (/^\d+[dhms]$/i.test(expireStr)) {
    const match = expireStr.match(/^(\d+)([dhms])$/i);
    if (!match) return null;

    const amount = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    const now = Date.now();
    const msPerUnit = {
      'd': 24 * 60 * 60 * 1000,
      'h': 60 * 60 * 1000,
      'm': 60 * 1000,
      's': 1000
    };

    return now + (amount * (msPerUnit[unit as keyof typeof msPerUnit] || 0));
  }

  // Format 2: ISO date like "2026-12-31"
  if (/^\d{4}-\d{2}-\d{2}$/.test(expireStr)) {
    const date = new Date(expireStr);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }
  }

  // Format 3: Full ISO like "2026-12-31T23:59:59Z"
  if (/^\d{4}-\d{2}-\d{2}T/.test(expireStr)) {
    const date = new Date(expireStr);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }
  }

  return null;
}

// 📅 Format timestamp to readable string
export function formatExpiration(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

// ⏱️ Get relative time until expiration
export function getTimeUntilExpiry(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;

  if (diff < 0) return 'Expired';

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

// 🎨 Get expiration status for CLI display
export function getExpirationStatus(timestamp?: number): string {
  if (!timestamp) return '';
  
  const now = Date.now();
  const diff = timestamp - now;
  const daysLeft = diff / (1000 * 60 * 60 * 24);

  if (daysLeft < 0) {
    return '🔴 EXPIRED';
  }

  if (daysLeft < 1) {
    return '🟠 EXPIRES TODAY';
  }

  if (daysLeft < 7) {
    return `🟡 Expires in ${Math.ceil(daysLeft)}d`;
  }

  return '';
}
