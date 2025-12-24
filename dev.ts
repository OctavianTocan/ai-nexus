import { $ } from "bun";

// --Starting development servers--
console.log("Starting development servers...");

// This is a fix for potential issues where the ports are not released.
// Kill ghost processes on ports 3000 (Next.js) and 8000 (FastAPI)
// .nothrow() keeps the script running even if no process is found
await $`fuser -k 3000/tcp 8000/tcp`.quiet().nothrow();
// Remove the Next.js dev lock that causes the "Unable to acquire lock" error
await $`rm -rf frontend/.next/dev/lock`.quiet().nothrow();

// --Here, "--project backend" ensures we use the correct uv.lock file.--
// This starts both dev servers at the same time and combines the output.
await Promise.all([
    $`bun --cwd frontend dev`,
    $`uv run --project backend fastapi dev backend/main.py`
]);