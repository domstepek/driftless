# Security Policy

## Supported Versions

| Version | Supported         |
| ------- | ----------------- |
| 1.x     | ✅ Active support |
| < 1.0   | ❌ Not supported  |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them responsibly by emailing **[INSERT CONTACT EMAIL]**.

Include as much of the following as possible:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### What to Expect

- **Acknowledgment** within 48 hours of your report
- **Assessment** and initial response within 5 business days
- **Fix timeline** communicated once the issue is confirmed

We will work with you to understand the issue and coordinate disclosure. We appreciate responsible disclosure and will credit reporters (unless you prefer to remain anonymous).

## Scope

This policy applies to:

- `@driftless-ai/cli`
- `@driftless-ai/core`
- GitHub Actions workflows shipped with the project
- The `driftless init` interactive setup flow

## General Security Notes

- Driftless spawns AI agent subprocesses to generate documentation. These processes have access to the local filesystem within the project directory.
- Generated documentation is written to the configured `outputDir`. Review generated content before publishing.
- No credentials or API keys are stored in driftless config files. Agent harness authentication is handled by the harness itself (e.g., Claude Code's own auth).
