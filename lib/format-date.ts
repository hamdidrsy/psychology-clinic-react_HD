const turkishDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

export function formatDate(date: string) {
  return turkishDateFormatter.format(new Date(`${date}T12:00:00Z`));
}
