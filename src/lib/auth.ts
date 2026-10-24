import { createRemoteJWKSet, jwtVerify } from "jose";
import { isLocalDevelopment } from "./runtime";

export interface MemberIdentity {
  email: string;
}

const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export async function getMemberIdentity(request: Request, env: Env): Promise<MemberIdentity | null> {
  if (isLocalDevelopment(env) && env.DEV_MEMBER_EMAIL) {
    return { email: env.DEV_MEMBER_EMAIL.trim().toLowerCase() };
  }

  const domain = normaliseTeamDomain(env.CF_ACCESS_TEAM_DOMAIN);
  const audience = env.CF_ACCESS_AUDIENCE?.trim();
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!domain || !audience || !token) return null;

  try {
    let keySet = keySets.get(domain);
    if (!keySet) {
      keySet = createRemoteJWKSet(new URL(`https://${domain}/cdn-cgi/access/certs`));
      keySets.set(domain, keySet);
    }
    const { payload } = await jwtVerify(token, keySet, {
      issuer: `https://${domain}`,
      audience,
    });
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    return email ? { email } : null;
  } catch {
    return null;
  }
}

export function accessIsConfigured(env: Env): boolean {
  return Boolean(normaliseTeamDomain(env.CF_ACCESS_TEAM_DOMAIN) && env.CF_ACCESS_AUDIENCE?.trim());
}

function normaliseTeamDomain(value?: string): string {
  return (value ?? "").trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
}
