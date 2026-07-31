# Test MoneyOS without npm install

If `npm install` or `npm ci` is failing because of slow internet, you can still test the MoneyOS flow immediately with the standalone HTML test page.

## Option A: Open the file directly

From the project folder, run:

```bash
xdg-open public/test.html
```

If `xdg-open` is not available, open this file manually in your browser:

```txt
public/test.html
```

## Option B: Use Python's tiny local server

Most Linux systems already have Python installed:

```bash
cd ~/Documents/Money-os-
python3 -m http.server 8080
```

Then open:

```txt
http://localhost:8080/public/test.html
```

## What this tests

The no-install page lets you test:

- mission input
- AI CEO planning simulation
- task generation
- approval request
- approve/reject controls
- task execution simulation
- business loop progress
- graph engineering display
- event log

This is not the full Next.js/Vercel app, but it proves the core flow on any weak device without downloading npm packages.
