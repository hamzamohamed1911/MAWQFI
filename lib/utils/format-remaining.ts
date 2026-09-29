type RemainingLabels = {
  hoursShort: string;
  minutesShort: string;
  remainingJoin: string;
};

export function formatRemainingDuration(
  msLeft: number,
  labels: RemainingLabels,
): string {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (hours > 0) {
    return `${hours} ${labels.hoursShort} ${labels.remainingJoin} ${minutes} ${labels.minutesShort}`;
  }

  return `${minutes} ${labels.minutesShort}`;
}
