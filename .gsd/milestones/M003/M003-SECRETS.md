# Secrets Manifest

**Milestone:** M003
**Generated:** 2026-03-14

### NPM_TOKEN

**Service:** npm (npmjs.com)
**Dashboard:** https://www.npmjs.com/settings/~/tokens/granular-access-tokens/new
**Format hint:** `npm_...` (granular access token, ~36 chars)
**Status:** pending
**Destination:** dotenv

1. Log in to https://www.npmjs.com/ with the account that owns the `@driftless` organization
2. Navigate to Access Tokens → Generate New Token → Granular Access Token
3. Set token name: `driftless-ci-publish`
4. Set expiration: 365 days (or custom)
5. Under Packages and scopes, select: Read and write
6. Under Organizations, select: `@driftless` scope only
7. Click Generate Token and copy the value
8. This token will also be added as a GitHub Actions repository secret (`NPM_TOKEN`) for the release workflow in S02
