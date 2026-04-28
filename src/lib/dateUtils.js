import { format, isToday, isYesterday, addDays, subDays } from 'date-fns';

export function formatDate(date) {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEE, d MMM');
}

export function getDateString(date = new Date()) {
  return format(new Date(date), 'yyyy-MM-dd');
}

export function getNextDate(dateStr) {
  return format(addDays(new Date(dateStr), 1), 'yyyy-MM-dd');
}

export function getPrevDate(dateStr) {
  return format(subDays(new Date(dateStr), 1), 'yyyy-MM-dd');
}