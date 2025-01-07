# GōdōPlay - The Ultimate Fusion for Co-Op and Multiplayer Gaming

Find the best cross-platform games for PC, PlayStation, Xbox, and Nintendo Switch. Discover multiplayer, cooperative, and competitive games to play together or against friends, no matter your platform.

## Requirements

- Node.js >=22
- Package Manager: pnpm 9.15.3

## SSL Setup with mkcert

#### 1. Install mkcert

For macOS (using Homebrew):

```bash
brew install mkcert
brew install nss # if you use Firefox
```

For Windows (using Chocolatey):

```bash
choco install mkcert
```

For Linux:

```bash
sudo apt install libnss3-tools
sudo apt install mkcert
```

#### 2. Install local CA

```bash
mkcert -install
```

#### 3. Generate certificates

```bash
mkcert localhost 127.0.0.1 ::1
```

This will create `localhost+2.pem` and `localhost+2-key.pem` files in your project root.

### Development

If you don't have `pnpm` installed, you can install it with the following command:

```bash
corepack enable
# or
npm install -g pnpm
```

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Clean and start dev server
pnpm dev:clean

# Lint code
pnpm lint

# Format code
pnpm format

# Build for production
pnpm build

# Preview production build
pnpm preview
```
