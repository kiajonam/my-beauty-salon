const TIME_ZONE = 'Europe/Berlin';

function parts(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date).reduce((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});
}

export function getBerlinDate(date = new Date()) {
  const value = parts(date);
  return `${value.year}-${value.month}-${value.day}`;
}

export function getBerlinMinutes(date = new Date()) {
  const value = parts(date);
  return Number(value.hour) * 60 + Number(value.minute);
}

export function getBerlinMonthStart(date = new Date()) {
  return `${getBerlinDate(date).slice(0, 7)}-01`;
}

export { TIME_ZONE };
