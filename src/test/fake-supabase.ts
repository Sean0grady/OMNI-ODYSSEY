import { vi } from "vitest";

export interface FakeQueryResult {
  data?: unknown;
  error?: { code?: string; message?: string } | null;
}

/**
 * A minimal stand-in for a Supabase query builder: every chainable method
 * (select/eq/neq/order/limit/or/insert/update/delete) is a no-op that
 * returns itself, and the chain is directly awaitable (thenable) as well as
 * resolvable via .single()/.maybeSingle() — matching how the real
 * supabase-js builder can be terminated either way.
 */
function createFakeQueryBuilder(getNextResult: () => FakeQueryResult) {
  const builder: Record<string, unknown> = {};
  const chainMethods = [
    "select",
    "eq",
    "neq",
    "order",
    "limit",
    "or",
    "insert",
    "update",
    "delete",
  ];

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  builder.maybeSingle = vi.fn(() => Promise.resolve(getNextResult()));
  builder.single = vi.fn(() => Promise.resolve(getNextResult()));
  builder.then = (
    onFulfilled?: (result: FakeQueryResult) => unknown,
    onRejected?: (reason: unknown) => unknown
  ) => Promise.resolve(getNextResult()).then(onFulfilled, onRejected);

  return builder;
}

interface FakeSupabaseConfig {
  user?: { id: string } | null;
  authError?: { message: string } | null;
  /** Queue of responses per table, consumed in call order (FIFO). */
  tables?: Record<string, FakeQueryResult[]>;
}

export function createFakeSupabase({
  user = { id: "user-1" },
  authError = null,
  tables = {},
}: FakeSupabaseConfig = {}) {
  const queues = new Map(
    Object.entries(tables).map(([table, results]) => [table, [...results]])
  );

  return {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: authError ? null : user }, error: authError })
      ),
    },
    from: vi.fn((table: string) =>
      createFakeQueryBuilder(() => {
        const queue = queues.get(table);
        const next = queue?.shift();
        return next ?? { data: null, error: null };
      })
    ),
  };
}
