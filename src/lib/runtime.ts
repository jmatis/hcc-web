import { env } from "cloudflare:workers";

export function getRuntimeEnv(): Env {
  return env as Env;
}

export function isLocalDevelopment(env: Env): boolean {
  return env.APP_ENV !== "production" && env.APP_ENV !== "preview";
}
