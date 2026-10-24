# Hertfordshire Climbing Club website

The club site is a server-rendered Astro application running on Cloudflare Workers. EmDash provides the CMS at `/_emdash/admin`, D1 stores CMS content and private member details, R2 supports CMS media, Cloudflare Turnstile protects the public application form, and Cloudflare Access authenticates `/members`.

## Public and private routes

- `/` — club introduction
- `/sessions` — regular session information
- `/join` — protected membership application form
- `/members` — authenticated member profile; names are read-only
- `/_emdash/admin` — EmDash content administration

The public page copy is seeded from `seed/seed.json` and can then be edited in EmDash. Shared presentation remains in `styles.css`; rotating illustrations remain separate in `artwork.css`.

## Local development

```sh
npm install
npm run dev
```

Open `http://localhost:4321`. The ignored `.dev.vars` uses Cloudflare's official Turnstile test keys and `member@example.org` as the local member identity. Submit `/join` once with that email before opening `/members`.

Run validation with:

```sh
npm run typecheck
npm run build
```

## Cloudflare resources

`wrangler.jsonc` names separate production and preview D1 databases and R2 buckets. Cloudflare can provision named resources during the initial deployment. Preview data must remain separate from production data.

Configure these production Worker variables/secrets in Cloudflare before enabling the form and member area:

- `EMDASH_ENCRYPTION_KEY` — a long random secret
- `TURNSTILE_SITE_KEY` — public key for a Turnstile widget restricted to the live hostname
- `TURNSTILE_SECRET_KEY` — corresponding Turnstile secret
- `CF_ACCESS_TEAM_DOMAIN` — for example `club.cloudflareaccess.com`
- `CF_ACCESS_AUDIENCE` — the Access application's audience tag

Do not commit real values. With Wrangler authentication, secrets can be added using `npx wrangler secret put NAME`. Non-secret variables can be set in the Worker dashboard. The checked-in preview configuration deliberately uses Cloudflare's public test Turnstile keys; replace them with a preview-specific widget before sharing a preview broadly.

Create a Cloudflare Access self-hosted application for `hertfordshireclimbingclub.org.uk/members*`. That single path covers both the page and its update endpoint. Allow only approved member email addresses or an approved identity-provider group. The Worker verifies the signed Access JWT as well as relying on the edge policy.

On the first EmDash admin visit, complete its setup wizard and create the administrator passkey. Consider adding a separate Access policy for `/_emdash/*` as an additional outer layer.

## Deployment

- `main` remains the production branch.
- `dev` is the development branch and deploys with `npm run deploy:preview`.
- Production deploys with `npm run deploy`.

The Cloudflare Git build needs `npm run build` as its build command before either Wrangler deploy command. After first deployment, verify `/`, `/join`, `/members`, and `/_emdash/admin` on the relevant hostname.

Member records contain emergency contact information. Restrict D1 access, keep logs free of submitted form bodies, define a retention/deletion policy, and document who in the club can access this data before accepting real applications.
