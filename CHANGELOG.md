# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2026-04-14

### Added

- Initial release of `unpm` — UNified Package Manager for Node.js.
- `unpm` binary and `unpx` companion binary (`unpx` = `unpm dlx`).
- **`add` (alias: `a`)** — Install packages to the project or globally, with support for `-d/--dev`, `--optional`, `--peer`, `--exact`, and `-g/--global` flags.
- **`remove` (alias: `rm`)** — Remove packages from the project or globally.
- **`install` (alias: `i`)** — Install project dependencies with support for `-p/--prod`, `--no-optional`, `--no-peer`, and `--frozen` (lockfile-frozen install) flags.
- **`update` (alias: `up`)** — Update installed packages with support for `-g/--global`, `-p/--prod`, `-i/--interactive`, `--no-optional`, and `--no-peer` flags.
- **`list` (alias: `ls`)** — List installed packages with support for `-g/--global`, `-p/--prod`, `-d/--dev`, `--no-optional`, and `--no-peer` flags.
- **`exec` (alias: `x`)** — Execute a command in the project context via the local package manager's `exec`.
- **`dlx`** — Execute a package command without installing, using the global package manager.
- **`run`** — Run a script defined in `package.json`.
- **`pm`** — Pass arguments directly to the underlying package manager.
- Support for **npm**, **pnpm**, **Yarn Classic**, **Yarn Berry**, and **Bun**.
- Package manager **auto-detection** from lockfiles via `package-manager-detector`.
- **Pass-through** of unknown options to the underlying package manager.
- `--` separator support to disambiguate package manager options from package names.
- **Global options**: `--pm`, `--runner`, `--no-auto-detect`, `--no-prompt-select`, `--dry-run`, `-c/--config`.
- **Configuration file** (`unpmrc`) in XDG config directories using INI format.
- **Environment variables**: `UNPM_CONFIG_FILE`, `UNPM_LOCAL_PM`, `UNPM_GLOBAL_PM`, `UNPM_RUNNER`, `UNPM_AUTO_DETECT`, `UNPM_PROMPT_SELECT`.
- Priority-based resolution: CLI option → environment variable → config file → auto-detection → prompt-selection.

[Unreleased]: https://github.com/your-username/unpm/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/your-username/unpm/releases/tag/v0.0.1
