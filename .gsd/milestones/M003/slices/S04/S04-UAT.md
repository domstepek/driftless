# S04: CLI Auto-Update — UAT

**Milestone:** M003
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: All logic branches are covered by 46 unit tests with mocked fetch/execSync. Live registry was already proven in S01. No new runtime integration surfaces to manually verify.

## Preconditions

- Repository cloned at latest with S04 changes
- `pnpm install` completed
- `pnpm run build` succeeds (both packages)

## Smoke Test

Run `pnpm run test` — all 268 tests pass across 14 files. Run `node packages/cli/dist/index.mjs --version` — returns `driftless v1.0.0` in under 100ms.

## Test Cases

### 1. Version check — newer version available

1. Call `checkForUpdate("1.0.0")` with a mock registry returning `{ "version": "1.1.0" }`
2. **Expected:** Returns `{ current: "1.0.0", latest: "1.1.0", isNewer: true, isMajor: false }`

### 2. Version check — same version

1. Call `checkForUpdate("1.0.0")` with a mock registry returning `{ "version": "1.0.0" }`
2. **Expected:** Returns `{ current: "1.0.0", latest: "1.0.0", isNewer: false, isMajor: false }`

### 3. Version check — major version jump

1. Call `checkForUpdate("1.0.0")` with a mock registry returning `{ "version": "2.0.0" }`
2. **Expected:** Returns `{ current: "1.0.0", latest: "2.0.0", isNewer: true, isMajor: true }`

### 4. Version check — network timeout

1. Call `checkForUpdate("1.0.0")` with a registry URL that does not respond within 5s
2. **Expected:** Returns `{ current: "1.0.0", latest: "1.0.0", isNewer: false, isMajor: false }` (safe default)

### 5. Version check — HTTP 404

1. Call `checkForUpdate("1.0.0")` with a registry returning 404
2. **Expected:** Returns safe default with `isNewer: false`

### 6. Version check — malformed JSON

1. Call `checkForUpdate("1.0.0")` with a registry returning `{ "name": "pkg" }` (no `version` field)
2. **Expected:** Returns safe default with `isNewer: false`

### 7. Package manager detection — npm user agent

1. Set `process.env.npm_config_user_agent = "npm/10.0.0 node/20.0.0 darwin arm64"`
2. Call `detectPackageManager()`
3. **Expected:** Returns `"npm"`

### 8. Package manager detection — pnpm user agent

1. Set `process.env.npm_config_user_agent = "pnpm/8.0.0 node/20.0.0 darwin arm64"`
2. Call `detectPackageManager()`
3. **Expected:** Returns `"pnpm"`

### 9. Package manager detection — fallback to config

1. Unset `npm_config_user_agent`
2. Call `detectPackageManager({ packageManager: "yarn" })`
3. **Expected:** Returns `"yarn"`

### 10. Package manager detection — fallback to npm

1. Unset `npm_config_user_agent`, pass no config
2. Call `detectPackageManager()`
3. **Expected:** Returns `"npm"`

### 11. Global install commands

1. Call `getGlobalInstallCommand("npm", "@driftless-ai/cli@latest")`
2. **Expected:** `"npm install -g @driftless-ai/cli@latest"`
3. Call `getGlobalInstallCommand("pnpm", "@driftless-ai/cli@latest")`
4. **Expected:** `"pnpm install -g @driftless-ai/cli@latest"`
5. Call `getGlobalInstallCommand("yarn", "@driftless-ai/cli@latest")`
6. **Expected:** `"yarn global add @driftless-ai/cli@latest"`
7. Call `getGlobalInstallCommand("bun", "@driftless-ai/cli@latest")`
8. **Expected:** `"bun install -g @driftless-ai/cli@latest"`

### 12. npx context detection

1. Set `process.env.npm_execpath` to a path containing `npx-cli`
2. Call `isNpxContext()`
3. **Expected:** Returns `true`
4. Clear that env var, set `process.env._` to `/usr/local/bin/npx`
5. Call `isNpxContext()`
6. **Expected:** Returns `true`
7. Clear both env vars
8. Call `isNpxContext()`
9. **Expected:** Returns `false`

### 13. performUpdate — CI environment skip

1. Set `process.env.CI = "true"`
2. Call `performUpdate({ currentVersion: "1.0.0" })` with a mock registry returning newer version
3. **Expected:** Returns `null`, no fetch or install attempted

### 14. performUpdate — npx notification

1. Set npx context env vars, mock registry returns `{ "version": "1.1.0" }`
2. Call `performUpdate({ currentVersion: "1.0.0" })`
3. **Expected:** Writes notification to stderr including "newer version" and the install command. Does NOT call `execSync`.

### 15. performUpdate — major version warning

1. Mock registry returns `{ "version": "2.0.0" }`, not in npx context
2. Call `performUpdate({ currentVersion: "1.0.0" })`
3. **Expected:** Writes "major version change" warning to stderr before running install

### 16. performUpdate — permission error hint

1. Mock `execSync` to throw an error (simulating EACCES)
2. Call `performUpdate({ currentVersion: "1.0.0" })` with newer version available
3. **Expected:** Writes "Auto-update failed" hint to stderr with the manual command

### 17. CLI hook — --version fast path

1. Run `node packages/cli/dist/index.mjs --version`
2. **Expected:** Returns version string in under 100ms. No network calls made.

### 18. CLI hook — config with autoUpdate: true

1. Mock `configExists` returning true, `readConfig` returning `{ autoUpdate: true }`, `performUpdate` mocked
2. Run `main(["init"])` (with init command also mocked)
3. **Expected:** `performUpdate` was called before init command

### 19. CLI hook — config with autoUpdate: false

1. Mock `configExists` returning true, `readConfig` returning `{ autoUpdate: false }`
2. Run `main(["init"])`
3. **Expected:** `performUpdate` was NOT called

### 20. CLI hook — no config file

1. Mock `configExists` returning false
2. Run `main(["init"])`
3. **Expected:** `performUpdate` was NOT called, no error

### 21. Init wizard — auto-update prompt

1. Mock `p.confirm()` to return true for auto-update
2. Run `gatherConfig()` through the init wizard
3. **Expected:** Returned config object includes `autoUpdate: true`

### 22. Init wizard — auto-update declined

1. Mock `p.confirm()` to return false for auto-update
2. Run `gatherConfig()` through the init wizard
3. **Expected:** Returned config object includes `autoUpdate: false`

## Edge Cases

### json() method throws

1. Mock fetch to return `{ ok: true }` but `json()` throws
2. Call `checkForUpdate("1.0.0")`
3. **Expected:** Returns safe default, no exception propagated

### AbortController fires (slow network)

1. Mock fetch to delay beyond 5s
2. Call `checkForUpdate("1.0.0")`
3. **Expected:** Returns safe default after timeout, no hanging

### Hook error swallowed

1. Mock `import("@driftless-ai/core")` to throw
2. Run `main(["init"])` with init command mocked
3. **Expected:** Init runs normally despite hook failure

### Older version on registry

1. Mock registry returns `{ "version": "0.9.0" }` when current is `1.0.0`
2. Call `checkForUpdate("1.0.0")`
3. **Expected:** `isNewer: false` — no downgrade

## Failure Signals

- Any test failure in `auto-update.test.ts` or `package-manager.test.ts` — core logic broken
- `--version` takes >200ms — hook may be running on fast path
- `performUpdate` throws instead of returning — violates never-throw contract
- Init wizard doesn't ask about auto-update — prompt not wired
- `.driftless.json` missing `autoUpdate` field after init — config threading broken

## Requirements Proved By This UAT

- R036 — CLI auto-update: version check against registry, PM detection, auto-install, npx notification instead of install, network failure silent skip, major version warning, CI skip, init wizard preference prompt, config persistence

## Not Proven By This UAT

- Live registry version check against the real npmjs.org endpoint (proven by S01's registry verification)
- Actual `execSync` running a real global install (tested with mock — real install would modify the system)
- End-to-end flow of: user runs `driftless init` → answers auto-update prompt → runs `driftless init` again → version check fires (would require published newer version)

## Notes for Tester

- All 22 test cases above are already automated in the test suite (268 tests). Running `pnpm run test` exercises every case.
- The `registryUrl` parameter on `checkForUpdate()` and `performUpdate()` exists specifically for test injection — use it to point at a local HTTP server if manual verification is desired.
- The hook is intentionally invisible on success — no stdout/stderr when update check passes and version is current. This is by design.
