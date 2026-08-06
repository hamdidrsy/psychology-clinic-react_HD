import { describe, expect, it } from "vitest";

import { requireServerEnv, type ServerEnv } from "@/server/env";

describe("requireServerEnv", () => {
  it("zorunlu değer mevcutsa hata vermez", () => {
    const env = {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://example.test/db",
    } satisfies ServerEnv;

    expect(() => requireServerEnv(env, ["DATABASE_URL"])).not.toThrow();
  });

  it("zorunlu değer yoksa güvenli hata verir", () => {
    const env = { NODE_ENV: "test" } satisfies ServerEnv;

    expect(() => requireServerEnv(env, ["DATABASE_URL"])).toThrow(
      "DATABASE_URL",
    );
  });
});
