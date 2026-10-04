type DistanceUnitLabels = {
  metersShort: string;
  kilometersShort: string;
};

export function formatDistanceMeters(
  meters: number,
  units: DistanceUnitLabels,
): string {
  if (meters < 1000) {
    return `${Math.round(meters)} ${units.metersShort}`;
  }
  return `${(meters / 1000).toFixed(1)} ${units.kilometersShort}`;
}
