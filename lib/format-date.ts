const turkishDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

export function formatDate(date: string | Date) {
  return turkishDateFormatter.format(
    date instanceof Date ? date : new Date(`${date}T12:00:00Z`),
  );
}

const turkishDateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

export function formatDateTime(date: string | Date) {
  return turkishDateTimeFormatter.format(new Date(date));
}
