# GodoPlay

A platform for discovering cross-platform and cross-play games across PC, PlayStation, Xbox, and Nintendo Switch.

> [!NOTE]
> This is a hobby project. I occasionally update it when I have time.

## How It Works

GodoPlay helps gamers find multiplayer and cooperative games they can play with friends across different platforms. The app fetches game metadata from the IGDB API (Twitch) and stores curated cross-play information in a PostgreSQL database. An admin panel allows managing game entries, tags, and platform support details.

## Tech Stack

| Layer              | Technology                                                                  |
| ------------------ | --------------------------------------------------------------------------- |
| **Framework**      | [Nuxt 3](https://nuxt.com/) (Vue.js) with TypeScript                        |
| **Database**       | PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)                    |
| **Authentication** | [Supabase Auth](https://supabase.com/auth)                                  |
| **CMS**            | [Prismic](https://prismic.io/) for blog/content pages                       |
| **Caching**        | Redis via [ioredis](https://github.com/redis/ioredis)                       |
| **Game Data**      | [IGDB API](https://api-docs.igdb.com/) (Twitch)                             |
| **Styling**        | [Tailwind CSS](https://tailwindcss.com/) v4 + SCSS                          |
| **UI Components**  | [Headless UI](https://headlessui.com/), [Reka UI](https://reka-ui.com/)     |
| **Forms**          | [VeeValidate](https://vee-validate.logaretm.com/) + [Zod](https://zod.dev/) |
| **SEO**            | Sitemap, Robots.txt, Schema.org structured data                             |
| **Analytics**      | Google Analytics, Microsoft Clarity                                         |

## Project Structure

```
├── app/                  # Frontend (pages, components, composables)
├── server/               # Backend API routes and database
│   ├── api/              # REST API endpoints
│   ├── db/               # Drizzle schema, migrations, seeds
│   └── utils/            # Server utilities (IGDB client, auth)
├── shared/               # Shared types and utilities
└── public/               # Static assets
```

## Development Setup

### Requirements

- Node.js >= 22
- pnpm 9
- Docker (for local PostgreSQL)

### Local SSL (Required)

The dev server requires HTTPS. Install [mkcert](https://github.com/FiloSottile/mkcert) and generate certificates:

```bash
# Install mkcert (macOS)
brew install mkcert && mkcert -install

# Generate certificates
mkcert localhost 127.0.0.1 ::1
```

### Getting Started

```bash
# Install pnpm if needed
corepack enable

# Copy environment variables
cp .env.example .env

# Install dependencies
pnpm install

# Start dev server (includes Docker PostgreSQL)
pnpm dev
```

### Database Scripts

Shell scripts in `scripts/` for managing PostgreSQL backups:

| Script              | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `dev-setup.sh`      | Start Docker, run migrations, optionally restore from backup |
| `dump-local.sh`     | Dump local database to `backups/local/`                      |
| `dump-remote.sh`    | Dump production database to `backups/remote/`                |
| `restore-local.sh`  | Restore a backup file to local Docker database               |
| `restore-remote.sh` | Restore a backup file to production database                 |

```bash
# Example: dump and restore
./scripts/dump-local.sh
./scripts/restore-local.sh  # prompts for backup file path
```
