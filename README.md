# Hertfordshire Climbing Club website

Build-free, mobile-first website for Hertfordshire Climbing Club.

## Structure

- `index.html` — homepage and club summary
- `about.html` — club information
- `join.html` — first-visit guide and FAQ
- `sessions.html` — regular meeting and location details
- `contact.html` — verified contact options
- `styles.css` — shared responsive design
- `site.js` — accessible mobile navigation and copyright year
- `_headers` — Cloudflare security and caching headers
- `_redirects` — friendly path aliases

## Local preview

Serve the repository root with any static web server, for example:

```sh
npx serve .
```

Then open `http://127.0.0.1:3000/` or the URL printed by the server.

## Cloudflare deployment

The site is build-free. In Cloudflare Workers & Pages, connect this repository and use `/` as the build output directory with no build command. Workers Static Assets automatically exposes files such as `about.html` at clean paths such as `/about`.

### Cloudflare Web Analytics

Enable Web Analytics for the production Worker in the Cloudflare dashboard. The security policy in `_headers` already permits Cloudflare's analytics beacon. No site token is committed to this public repository.

### Legacy hostname redirect

The former hostname `herfordshireclimbingclub.org.uk` cannot be matched in `_redirects`, because static-asset redirects only match paths. If that zone remains in the Cloudflare account, create a Cloudflare Single Redirect from:

```text
https://herfordshireclimbingclub.org.uk/*
```

to:

```text
https://hertfordshireclimbingclub.org.uk/${1}
```

Use a permanent `301` redirect and preserve the path and query string.
