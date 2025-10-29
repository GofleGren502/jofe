import { format as formatDate, parseISO } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { ru, kk } from "date-fns/locale";

const TIMEZONE = "Asia/Almaty";

// Get locale based on language
const getLocale = (language: string) => {
  return language === "kk" ? kk : ru;
};

// Format currency in KZT (1 234 567 ₸)
export function formatCurrency(amount: number | string, language: string = "ru"): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  // Format with space as thousand separator
  const formatted = new Intl.NumberFormat(language === "kk" ? "kk-KZ" : "ru-RU", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
  
  return `${formatted} ₸`;
}

// Format date in Asia/Almaty timezone
export function formatDateInAlmaty(
  date: Date | string,
  formatString: string = "dd.MM.yyyy",
  language: string = "ru"
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const locale = getLocale(language);
  
  return formatInTimeZone(dateObj, TIMEZONE, formatString, { locale });
}

// Format time in Asia/Almaty timezone
export function formatTimeInAlmaty(
  date: Date | string,
  formatString: string = "HH:mm",
  language: string = "ru"
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const locale = getLocale(language);
  
  return formatInTimeZone(dateObj, TIMEZONE, formatString, { locale });
}

// Format date and time together
export function formatDateTimeInAlmaty(
  date: Date | string,
  formatString: string = "dd.MM.yyyy HH:mm",
  language: string = "ru"
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const locale = getLocale(language);
  
  return formatInTimeZone(dateObj, TIMEZONE, formatString, { locale });
}

// Relative time (e.g., "2 hours ago", "yesterday")
export function formatRelativeTime(date: Date | string, language: string = "ru"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const now = new Date();
  const almatyDate = toZonedTime(dateObj, TIMEZONE);
  const almatyNow = toZonedTime(now, TIMEZONE);
  
  const diffMs = almatyNow.getTime() - almatyDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) {
    return language === "kk" ? "дәл қазір" : "только что";
  } else if (diffMins < 60) {
    return language === "kk" ? `${diffMins} минут бұрын` : `${diffMins} мин назад`;
  } else if (diffHours < 24) {
    return language === "kk" ? `${diffHours} сағат бұрын` : `${diffHours} ч назад`;
  } else if (diffDays === 1) {
    return language === "kk" ? "кеше" : "вчера";
  } else if (diffDays < 7) {
    return language === "kk" ? `${diffDays} күн бұрын` : `${diffDays} дн назад`;
  } else {
    return formatDateInAlmaty(almatyDate, "dd.MM.yyyy", language);
  }
}

// Get current date/time in Almaty timezone
export function getNowInAlmaty(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

// Format duration in minutes to human-readable format
export function formatDuration(minutes: number, language: string = "ru"): string {
  if (minutes < 60) {
    return language === "kk" ? `${minutes} мин` : `${minutes} мин`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return language === "kk" ? `${hours} сағ` : `${hours} ч`;
  }
  
  return language === "kk" ? `${hours} сағ ${mins} мин` : `${hours} ч ${mins} мин`;
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value}%`;
}
