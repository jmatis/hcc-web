# Hertfordshire Climbing Club website

Simple, build-free website for Hertfordshire Climbing Club.

## Pages

- `index.html` — club introduction
- `sessions.html` — regular session information
- `join.html` — members and joining information

Shared presentation is in `styles.css`. Cloudflare headers and redirects are defined in `_headers` and `_redirects`.

## Local preview

Serve the repository root with any static web server, for example:

```sh
npx serve .
```

## Cloudflare deployment

Use `/` as the build output directory with no build command. Workers Static Assets exposes `sessions.html` and `join.html` at `/sessions` and `/join`.

Enable Cloudflare Web Analytics in the production Worker dashboard. To redirect the former `herfordshireclimbingclub.org.uk` hostname, create a permanent Cloudflare Single Redirect to the correctly spelled domain while preserving the path and query string.
