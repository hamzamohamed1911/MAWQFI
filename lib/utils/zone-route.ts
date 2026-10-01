/** Numeric zone id from `/z/[qr]` (e.g. `z/1` → `1`). */
export function zoneIdFromQrRoute(qrRouteSegment: string): number | undefined {
  const id = Number(qrRouteSegment.trim());
  if (!Number.isInteger(id) || id <= 0) {
    return undefined;
  }
  return id;
}
