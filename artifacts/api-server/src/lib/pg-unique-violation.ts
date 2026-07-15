interface PgErrorShape {
  code?: string;
  constraint?: string;
}

const MAX_CAUSE_DEPTH = 12;

function asPgError(value: unknown): PgErrorShape | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as PgErrorShape;
  if (candidate.code != null || candidate.constraint != null) return candidate;
  return null;
}

/** Unwrap DrizzleQueryError and other wrappers to the underlying pg error. */
export function findPgError(err: unknown): PgErrorShape | null {
  let current: unknown = err;

  for (let depth = 0; depth < MAX_CAUSE_DEPTH && current != null; depth += 1) {
    const pg = asPgError(current);
    if (pg?.code === "23505") return pg;

    const cause =
      current && typeof current === "object" && "cause" in current
        ? (current as { cause?: unknown }).cause
        : undefined;

    if (cause == null || cause === current) break;
    current = cause;
  }

  return null;
}

export function isPgUniqueViolation(err: unknown): boolean {
  return findPgError(err)?.code === "23505";
}

export function getPgUniqueConstraint(err: unknown): string | undefined {
  return findPgError(err)?.constraint;
}
