import dayjs, { type ConfigType } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export type DateUnit = "minute" | "hour" | "day" | "month" | "year";

export function getUserTimezone() {
  return dayjs.tz.guess();
}

function createDateUnitFn(unit: DateUnit, timezone = "utc") {
  return {
    diff: (end: ConfigType, start: ConfigType) =>
      dayjs(end).tz(timezone).diff(start, unit),
    add: (date: ConfigType, n: number) => dayjs(date).tz(timezone).add(n, unit),
    normalize: (date: ConfigType) => dayjs(date).tz(timezone).startOf(unit),
  };
}

export function formatDate(val: ConfigType, timezone = "utc") {
  return dayjs(val).tz(timezone).format("YYYY-MM-DD HH:mm:ss");
}

/**
 * generate a date array from start to end date
 */
export function getDateArray<T extends { date: ConfigType }>(
  data: T[],
  startDate: ConfigType,
  endDate: ConfigType,
  unit: DateUnit,
  timezone = "utc",
): T[] {
  if (data.length === 0) {
    return [];
  }

  // @ts-ignore
  const defaultItem: Omit<T, "date"> = Object.keys(data[0]).reduce(
    (acc: unknown, key) => {
      if (key === "date") {
        return acc;
      }

      // @ts-ignore
      acc[key] = 0;

      return acc;
    },
    {},
  );

  const arr: T[] = [];
  const { diff, add, normalize } = createDateUnitFn(unit, timezone);
  const n = diff(endDate, startDate) + 1;

  function findData(date: dayjs.Dayjs) {
    const target = data.find((item) => {
      return normalize(dayjs(item.date)).unix() === date.unix();
    });

    return { ...defaultItem, ...target };
  }

  for (let i = 0; i < n; i++) {
    const t = normalize(add(startDate, i));
    const item = findData(t);

    arr.push({ ...item, date: formatDate(t, timezone) } as T);
  }

  return arr;
}
