export const formatDateKey = (d: Date) => d.toISOString().split('T')[0];

export const toCustomISOStringKST = (date: Date): string => {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().replace('Z', '').split('.')[0] + '.000000';
};

export const calculateDuration = (startISO: string, endISO: string) => {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const sec = Math.max(0, Math.floor((e.getTime() - s.getTime()) / 1000));
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};
