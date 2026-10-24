/// <reference types="astro/client" />
/// <reference types="emdash/locals" />

interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  APP_ENV?: string;
  EMDASH_ENCRYPTION_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUDIENCE?: string;
  DEV_MEMBER_EMAIL?: string;
}

declare namespace App {
  interface Locals {
    cspNonce: string;
  }
}
