# My Cloudflare Worker

A simple Cloudflare Worker project.

## Project Structure

- `src/index.js`: The main Worker code
- `wrangler.toml`: Configuration file for Wrangler
- `package.json`: Node.js project configuration

## Available Routes

- `/`: Returns a welcome message
- `/api/data`: Returns a sample JSON data array

## Local Development

```bash
# Install dependencies
npm install

# Run locally with Wrangler
npm run dev
```

## Deployment

```bash
# Deploy to Cloudflare
npm run deploy
```

## Environment Variables

The following environment variables are defined in `wrangler.toml`:

- `MY_VARIABLE`: Example environment variable

You can add more environment variables in the `[vars]` section of `wrangler.toml` or use `.dev.vars` for local development.
