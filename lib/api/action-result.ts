/** Serializable API error body (DRF-style field errors, `detail`, etc.). */
export type ApiErrorBody = Record<string, unknown>;

export type ApiActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiErrorBody };

export function apiSuccess<T>(data: T): ApiActionResult<T> {
  return { ok: true, data };
}

export function apiFailure(error: ApiErrorBody): ApiActionResult<never> {
  return { ok: false, error };
}
