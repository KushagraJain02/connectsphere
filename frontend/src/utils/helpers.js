import { formatDistanceToNow, format, parseISO } from 'date-fns';

// Parse any date format Spring Boot might return
const parseDate = (date) => {
  if (!date) return null;

  // Array format: [2026, 5, 30, 14, 30, 0] (Java LocalDateTime)
  if (Array.isArray(date)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = date;
    return new Date(year, month - 1, day, hour, minute, second);
  }

  // ISO string format: "2026-05-30T14:30:00"
  if (typeof date === 'string') {
    // Add Z if no timezone info to treat as UTC
    if (date.includes('T') && !date.includes('Z') && !date.includes('+')) {
      return parseISO(date + 'Z');
    }
    return parseISO(date);
  }

  // Already a Date object
  if (date instanceof Date) return date;

  return new Date(date);
};

export const timeAgo = (date) => {
  if (!date) return '';
  const d = parseDate(date);
  if (!d || isNaN(d.getTime())) return '';
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = parseDate(date);
  if (!d || isNaN(d.getTime())) return '';
  return format(d, 'MMM d, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = parseDate(date);
  if (!d || isNaN(d.getTime())) return '';
  return format(d, 'MMM d, yyyy · h:mm a');
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};