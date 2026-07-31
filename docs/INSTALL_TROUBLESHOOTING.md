# MoneyOS npm install troubleshooting

If `npm install` fails with `ERR_SOCKET_TIMEOUT` or `ENOTEMPTY`, use the clean install flow below.

## Recommended install command

Because this repo includes a `package-lock.json`, use:

```bash
npm ci
```

`npm ci` is more predictable than `npm install` for a cloned project.

## Full clean reset

Run these from the project folder:

```bash
cd ~/Documents/Money-os-

# Stop any running Next/npm process first if needed.
# Then clean the broken partial install.
rm -rf node_modules

# Restore the lock file if you deleted it.
git restore package-lock.json

# Repair npm cache metadata.
npm cache verify

# Pull the latest repo settings, including .npmrc timeout settings.
git pull

# Install exactly from package-lock.json.
npm ci

# Start the app.
npm run dev
```

Open:

```txt
http://localhost:3000
```

## If your network is still weak

Use a longer one-off timeout:

```bash
npm ci --fetch-timeout=900000 --fetch-retries=8 --prefer-offline
```

## If npm says ENOTEMPTY

That means a previous failed install left a damaged folder inside `node_modules`. Fix with:

```bash
rm -rf node_modules
npm cache verify
npm ci
```

## If install succeeded silently

Sometimes npm returns to the prompt without much output. Test with:

```bash
npm run dev
```

If it starts Next.js, installation is okay.
