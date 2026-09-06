/**
 * Recursively sanitizes objects before saving to Firestore.
 * - Removes keys with `undefined` values (Firestore throws an error on `undefined`).
 * - Sanitizes nested objects and arrays.
 * - Ensures numbers are finite numbers.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }

  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(data as Record<string, any>)) {
      if (val !== undefined) {
        if (typeof val === 'number') {
          cleaned[key] = isNaN(val) ? 0 : val;
        } else {
          cleaned[key] = sanitizeForFirestore(val);
        }
      }
    }
    return cleaned as T;
  }

  return data;
}
