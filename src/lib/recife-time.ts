export const RECIFE_TIME_ZONE = 'America/Recife';

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: RECIFE_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const dateKeyFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: RECIFE_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
});

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: RECIFE_TIME_ZONE,
  weekday: 'short',
});

const datePartsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: RECIFE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatRecifeDateTime(date: Date | string | number) {
  return dateTimeFormatter.format(new Date(date));
}

export function formatRecifeDateKey(date: Date | string | number) {
  return dateKeyFormatter.format(new Date(date));
}

export function formatRecifeWeekday(date: Date | string | number) {
  return weekdayFormatter.format(new Date(date)).replace('.', '');
}

export function getRecifeTodayStartDate() {
  const parts = datePartsFormatter.formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);

  return new Date(Date.UTC(year, month - 1, day, 3, 0, 0));
}

export function getRecifePeriodStartDate(period: string | number) {
  const days = Number(period);

  if (days === 1) {
    return getRecifeTodayStartDate();
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (Number.isFinite(days) ? days : 7));
  return startDate;
}
