/**
 * Follow-up scheduling for HAIRWEB CRM.
 * All calendar math uses Europe/Prague. Holidays can be plugged into isHoliday later.
 */

export const PRAGUE_TZ = "Europe/Prague";

/** Optional holiday YYYY-MM-DD (Prague calendar). Empty for now. */
export type HolidaySet = ReadonlySet<string> | readonly string[];

export type ContactType =
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "instagram"
  | "other";

export const CONTACT_TYPES = [
  "email",
  "phone",
  "sms",
  "whatsapp",
  "instagram",
  "other",
] as const satisfies readonly ContactType[];

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  email: "E-mail",
  phone: "Telefon",
  sms: "SMS",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  other: "Jiné",
};

/** Derived UI status — next_followup_at is source of truth for due/overdue. */
export type FollowupDerivedStatus =
  | "NOT_STARTED"
  | "SCHEDULED"
  | "DUE"
  | "OVERDUE"
  | "COMPLETED"
  | "PAUSED"
  | "STOPPED";

export type CalculateNextFollowupInput = {
  lastContactAt: Date | string;
  /** Count of completed follow-ups AFTER this contact was recorded. */
  followupCount: number;
  holidays?: HolidaySet;
};

function holidaySet(holidays?: HolidaySet): ReadonlySet<string> {
  if (!holidays) return new Set();
  return holidays instanceof Set ? holidays : new Set(holidays);
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Prague calendar Y-M-D + weekday (0=Sun … 6=Sat) for an instant. */
export function getPragueParts(date: Date): {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
  second: number;
  dateKey: string;
} {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: PRAGUE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value]),
  ) as Record<string, string>;

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);

  return {
    year,
    month,
    day,
    weekday: weekdayMap[parts.weekday] ?? 0,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    dateKey: `${year}-${pad2(month)}-${pad2(day)}`,
  };
}

/** Offset of Europe/Prague from UTC at this instant (ms). */
function pragueOffsetMs(instant: Date): number {
  const p = getPragueParts(instant);
  const asUtc = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    p.hour,
    p.minute,
    p.second,
  );
  return asUtc - instant.getTime();
}

/** Convert Prague wall-clock to UTC Date. */
export function pragueWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour = 9,
  minute = 0,
  second = 0,
): Date {
  let utc = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  let offset = pragueOffsetMs(utc);
  utc = new Date(Date.UTC(year, month - 1, day, hour, minute, second) - offset);
  const offset2 = pragueOffsetMs(utc);
  if (offset2 !== offset) {
    utc = new Date(
      Date.UTC(year, month - 1, day, hour, minute, second) - offset2,
    );
  }
  return utc;
}

export function startOfPragueDay(date: Date | string): Date {
  const d = typeof date === "string" ? new Date(date) : date;
  const p = getPragueParts(d);
  return pragueWallTimeToUtc(p.year, p.month, p.day, 0, 0, 0);
}

export function endOfPragueDay(date: Date | string): Date {
  const d = typeof date === "string" ? new Date(date) : date;
  const p = getPragueParts(d);
  return pragueWallTimeToUtc(p.year, p.month, p.day, 23, 59, 59);
}

export function pragueTodayParts(now = new Date()) {
  return getPragueParts(now);
}

export function isWeekendPrague(date: Date): boolean {
  const { weekday } = getPragueParts(date);
  return weekday === 0 || weekday === 6;
}

export function isHoliday(
  date: Date,
  holidays: HolidaySet = [],
): boolean {
  const key = getPragueParts(date).dateKey;
  return holidaySet(holidays).has(key);
}

/** True if Saturday, Sunday, or listed holiday (Prague calendar). */
export function isNonWorkingDay(
  date: Date,
  holidays: HolidaySet = [],
): boolean {
  return isWeekendPrague(date) || isHoliday(date, holidays);
}

function addCalendarDaysPrague(from: Date, days: number): Date {
  const p = getPragueParts(from);
  const utcNoon = pragueWallTimeToUtc(p.year, p.month, p.day, 12, 0, 0);
  const shifted = new Date(utcNoon.getTime() + days * 24 * 60 * 60 * 1000);
  const sp = getPragueParts(shifted);
  // Preserve original Prague time-of-day when possible; default 09:00 for schedules.
  return pragueWallTimeToUtc(sp.year, sp.month, sp.day, 9, 0, 0);
}

/**
 * Add N working days (Mon–Fri, excluding holidays). Weekends do not count.
 * Result is 09:00 Europe/Prague on the target day.
 */
export function addBusinessDays(
  from: Date | string,
  days: number,
  holidays: HolidaySet = [],
): Date {
  if (days < 0) throw new Error("days must be >= 0");
  const start = typeof from === "string" ? new Date(from) : from;
  if (days === 0) {
    const p = getPragueParts(start);
    return pragueWallTimeToUtc(p.year, p.month, p.day, 9, 0, 0);
  }

  let cursor = startOfPragueDay(start);
  let remaining = days;

  while (remaining > 0) {
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    // Normalize to Prague midnight after hop
    const p = getPragueParts(cursor);
    cursor = pragueWallTimeToUtc(p.year, p.month, p.day, 12, 0, 0);
    if (!isNonWorkingDay(cursor, holidays)) {
      remaining -= 1;
    }
  }

  const p = getPragueParts(cursor);
  return pragueWallTimeToUtc(p.year, p.month, p.day, 9, 0, 0);
}

/**
 * Default next follow-up from contact time + completed follow-up count.
 */
export function calculateNextFollowup(
  input: CalculateNextFollowupInput,
): Date | null {
  const count = input.followupCount;
  if (count >= 3) return null;

  const last =
    typeof input.lastContactAt === "string"
      ? new Date(input.lastContactAt)
      : input.lastContactAt;

  if (Number.isNaN(last.getTime())) {
    throw new Error("Invalid lastContactAt");
  }

  if (count === 0) {
    return addBusinessDays(last, 4, input.holidays);
  }
  if (count === 1) {
    return addBusinessDays(last, 7, input.holidays);
  }
  // count === 2 → +14 calendar days
  return addCalendarDaysPrague(last, 14);
}

export function isTerminalLeadStatus(status: string): boolean {
  return status === "won" || status === "lost" || status === "skip";
}

export function deriveFollowupStatus(input: {
  nextFollowupAt: string | Date | null;
  followupCount: number;
  followupPaused?: boolean;
  followupStopped?: boolean;
  leadStatus?: string;
  now?: Date;
}): FollowupDerivedStatus {
  if (input.followupStopped || (input.leadStatus && isTerminalLeadStatus(input.leadStatus))) {
    return "STOPPED";
  }
  if (input.followupPaused) return "PAUSED";
  if (!input.nextFollowupAt) {
    return input.followupCount >= 3 ? "COMPLETED" : "NOT_STARTED";
  }

  const now = input.now ?? new Date();
  const next =
    typeof input.nextFollowupAt === "string"
      ? new Date(input.nextFollowupAt)
      : input.nextFollowupAt;
  const todayStart = startOfPragueDay(now);
  const todayEnd = endOfPragueDay(now);

  if (next.getTime() < todayStart.getTime()) return "OVERDUE";
  if (next.getTime() <= todayEnd.getTime()) return "DUE";
  return "SCHEDULED";
}

/** Human badge text for lead list. */
export function followupBadgeLabel(
  nextFollowupAt: string | null,
  options?: {
    followupPaused?: boolean;
    followupStopped?: boolean;
    leadStatus?: string;
    now?: Date;
  },
): { label: string; tone: "danger" | "warning" | "neutral" | "muted" } {
  if (
    options?.followupStopped ||
    (options?.leadStatus && isTerminalLeadStatus(options.leadStatus))
  ) {
    return { label: "—", tone: "muted" };
  }
  if (options?.followupPaused) {
    return { label: "Pozastaveno", tone: "muted" };
  }
  if (!nextFollowupAt) {
    return { label: "—", tone: "muted" };
  }

  const now = options?.now ?? new Date();
  const next = new Date(nextFollowupAt);
  const todayStart = startOfPragueDay(now);
  const nextStart = startOfPragueDay(next);
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(
    (nextStart.getTime() - todayStart.getTime()) / dayMs,
  );

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    return {
      label:
        overdue === 1 ? "1 den po termínu" : `${overdue} dny po termínu`,
      tone: "danger",
    };
  }
  if (diffDays === 0) return { label: "Dnes", tone: "warning" };
  if (diffDays === 1) return { label: "Zítra", tone: "neutral" };
  return { label: `Za ${diffDays} dny`, tone: "neutral" };
}

export function daysOverdue(
  nextFollowupAt: string | Date,
  now = new Date(),
): number {
  const next = typeof nextFollowupAt === "string" ? new Date(nextFollowupAt) : nextFollowupAt;
  const diff = Math.round(
    (startOfPragueDay(now).getTime() - startOfPragueDay(next).getTime()) /
      (24 * 60 * 60 * 1000),
  );
  return Math.max(0, diff);
}

/** Snooze presets relative to now (Prague). */
export function snoozeNextFollowup(
  preset: "tomorrow" | "plus3" | "plus7" | Date | string,
  now = new Date(),
): Date {
  if (preset instanceof Date || (typeof preset === "string" && preset.includes("T"))) {
    const d = typeof preset === "string" ? new Date(preset) : preset;
    const p = getPragueParts(d);
    return pragueWallTimeToUtc(p.year, p.month, p.day, 9, 0, 0);
  }
  if (preset === "tomorrow") return addCalendarDaysPrague(now, 1);
  if (preset === "plus3") return addCalendarDaysPrague(now, 3);
  return addCalendarDaysPrague(now, 7);
}

export function formatPragueDate(value: string | Date | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: PRAGUE_TZ,
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatPragueDateTime(value: string | Date | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: PRAGUE_TZ,
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
