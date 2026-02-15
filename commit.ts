import { $ } from "bun";

const commitPrompt = `Given the current git state, do this:

1. Check for uncommitted changes:
   * Run git status --porcelain
   * If empty, inform the user and exit

2. Determine atomic change groups:
   * Run git diff --name-status
   * Group files into small, logically coherent sets
   * Do not mix unrelated changes

3. For each change group:
   * Stage only relevant files (git add <files> or git add -p)
   * Run git diff --cached --name-status
   * Determine commit type:
     - feat for new behavior or APIs
     - fix for bug fixes
     - refactor, test, or chore when applicable
   * Determine scope:
     - frontend for frontend/
     - backend for backend/
     - misc otherwise
   * Generate Conventional Commit message:
     type(scope): concise summary

     - specific change
     - specific change
   * Commit with git commit -m "generated_message"

4. Push all commits:
   * Run git push
   * On failure, run git pull --rebase and retry
   * If conflicts occur, stop and inform the user

5. Report outcome:
   * Success: list commit messages
   * Failure: show error and next steps`;

console.log("Generating commits...");
await $`claude -p ${commitPrompt} --allowedTools "Read, Bash(git *)"`
  .quiet()
  .nothrow();
