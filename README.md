# unpm

> UNified Package Manager for Node.js

English | [中文](#中文)

---

## English

`unpm` (**un-pm**, short for **Unified Package Manager**) is a unified command-line wrapper for Node.js package managers. Write one command and it runs the right thing — no matter whether your project uses **npm**, **pnpm**, **yarn (v1)**, **yarn (v2+)**, or **bun**.

It also ships a companion binary **`unpx`**, which is a shorthand alias for `unpm dlx`.

> Inspired by [unjs/nypm](https://github.com/unjs/nypm) and [antfu/ni](https://github.com/antfu-collective/ni).

### Features

- **Auto-detection** — detects the package manager from lockfiles automatically.
- **Unified API** — a single set of commands across all supported package managers.
- **Pass-through options** — unknown flags are forwarded directly to the underlying package manager.
- **Flexible configuration** — CLI options, environment variables, and a config file are all supported.
- **Dry-run mode** — preview the exact command that would be executed without running it.

### Supported Package Managers

| Package Manager | Identifier     |
| --------------- | -------------- |
| npm             | `npm`          |
| pnpm            | `pnpm`         |
| yarn (v1)       | `yarn-classic` |
| yarn (v2+)      | `yarn-berry`   |
| bun             | `bun`          |

### Installation

```bash
npm install -g unpm
# or
pnpm add -g unpm
# or
bun add -g unpm
```

### Usage

```
unpm [options] <command> [arguments]
unpx <command> [arguments]          # equivalent to: unpm dlx <command>
```

### Global Options

| Option                   | Env Variable         | Description                                                    |
| ------------------------ | -------------------- | -------------------------------------------------------------- |
| `-c, --config <path>`    | `UNPM_CONFIG_FILE`   | Path to the configuration file.                                |
| `--pm <package-manager>` | —                    | Override the package manager to use.                           |
| `--runner <runner>`      | `UNPM_RUNNER`        | Override the script runner (`node`).                           |
| `--no-auto-detect`       | `UNPM_AUTO_DETECT`   | Disable auto-detection of the package manager.                 |
| `--no-prompt-select`     | `UNPM_PROMPT_SELECT` | Disable prompt-selection when no package manager is specified. |
| `--dry-run`              | —                    | Print the resolved command without executing it.               |
| `-h, --help`             | —                    | Display help.                                                  |
| `-V, --version`          | —                    | Display version.                                               |

### Commands

#### `add` (alias: `a`)

Install packages to the project or globally.

```bash
unpm add <package...> [options]
```

| Option         | Description                                    |
| -------------- | ---------------------------------------------- |
| `-g, --global` | Install as a global package.                   |
| `-d, --dev`    | Install as a dev dependency.                   |
| `--optional`   | Install as an optional dependency.             |
| `--peer`       | Install as a peer dependency.                  |
| `--exact`      | Install exact versions without version ranges. |

```bash
unpm add lodash@latest
unpm add -d typescript @types/node
unpm add --optional --os linux -- lodash    # '--os linux' forwarded to pm; 'lodash' as package name
```

#### `remove` (alias: `rm`)

Remove packages from the project or globally.

```bash
unpm remove <package...> [options]
```

| Option         | Description                  |
| -------------- | ---------------------------- |
| `-g, --global` | Remove from global packages. |

```bash
unpm remove lodash
unpm remove -g typescript
```

#### `install` (alias: `i`)

Install all project dependencies.

```bash
unpm install [options]
```

| Option          | Description                           |
| --------------- | ------------------------------------- |
| `-p, --prod`    | Install production dependencies only. |
| `--no-optional` | Exclude optional dependencies.        |
| `--no-peer`     | Exclude peer dependencies.            |
| `--frozen`      | Disallow lockfile modifications.      |

```bash
unpm install
unpm install --frozen
unpm install -p --ignore-scripts       # '--ignore-scripts' forwarded to pm
```

#### `update` (alias: `up`)

Update installed packages.

```bash
unpm update [package...] [options]
```

| Option              | Description                          |
| ------------------- | ------------------------------------ |
| `-g, --global`      | Update global packages.              |
| `-p, --prod`        | Update production dependencies only. |
| `--no-optional`     | Exclude optional dependencies.       |
| `--no-peer`         | Exclude peer dependencies.           |
| `-i, --interactive` | Use interactive mode.                |

```bash
unpm update lodash
unpm update -p
unpm update -i
```

#### `list` (alias: `ls`)

List installed packages.

```bash
unpm list [package...] [options]
```

| Option          | Description                        |
| --------------- | ---------------------------------- |
| `-g, --global`  | List global packages.              |
| `-p, --prod`    | List production dependencies only. |
| `-d, --dev`     | List dev dependencies only.        |
| `--no-optional` | Exclude optional dependencies.     |
| `--no-peer`     | Exclude peer dependencies.         |

```bash
unpm list
unpm list -g
unpm list --no-peer -- --json lodash   # '--json' forwarded to pm; 'lodash' to filter
```

#### `exec` (alias: `x`)

Execute a command in the project context (using the local package manager's `exec`).

```bash
unpm exec <command> [arguments...]
```

```bash
unpm exec prettier --write .
unpm exec eslint --fix src/
unpm exec --parallel -- tsc --noEmit   # '--parallel' forwarded to pm
```

#### `dlx`

Execute a package command without installing it first. The companion binary `unpx` is an alias for this command.

```bash
unpm dlx <command> [arguments...]
unpx <command> [arguments...]
```

```bash
unpm dlx prettier --write .
unpx eslint --fix src/
```

#### `run`

Run a script defined in `package.json`.

```bash
unpm run <script> [arguments...]
```

```bash
unpm run dev
unpm run build --watch
unpm run --parallel -- test --coverage   # '--parallel' forwarded to pm
```

#### `pm`

Pass arguments directly to the underlying package manager.

```bash
unpm pm [arguments...]
```

| Option         | Description                     |
| -------------- | ------------------------------- |
| `-g, --global` | Use the global package manager. |

```bash
unpm pm audit
unpm pm -g -- outdated -g   # 'outdated -g' forwarded to global pm
```

### Configuration

`unpm` resolves the package manager in the following priority order:

1. **CLI option** `--pm <package-manager>` (highest priority)
2. **Environment variables** `UNPM_LOCAL_PM` / `UNPM_GLOBAL_PM`
3. **Config file** (`unpmrc`)
4. **Auto-detection** from lockfiles
5. **Prompt-selection** when no package manager can be determined (lowest priority)

#### Config File

The config file is looked up from XDG config directories (e.g., `~/.config/unpm/unpmrc` on Linux).
You can also specify a custom path via `-c` / `UNPM_CONFIG_FILE`.

The file uses INI format:

```ini
LOCAL_PM=pnpm
GLOBAL_PM=npm
RUNNER=node
AUTO_DETECT=true
PROMPT_SELECT=true
```

#### Environment Variables

| Variable             | Description                                         |
| -------------------- | --------------------------------------------------- |
| `UNPM_CONFIG_FILE`   | Path to the configuration file.                     |
| `UNPM_LOCAL_PM`      | Default local package manager.                      |
| `UNPM_GLOBAL_PM`     | Default global package manager.                     |
| `UNPM_RUNNER`        | Script runner (`node`).                             |
| `UNPM_AUTO_DETECT`   | Enable/disable auto-detection (`true` / `false`).   |
| `UNPM_PROMPT_SELECT` | Enable/disable prompt-selection (`true` / `false`). |

### Pass-through Arguments

For most commands, unknown options are automatically forwarded to the underlying package manager. When package names could be confused with option values, you can use `--` as a separator:

- **Before `--`**: options for the package manager
- **After `--`**: package names / script arguments

```bash
unpm add --optional --os linux -- lodash   # '--os linux' → pm, 'lodash' → package name
```

---

## 中文

`unpm`（**un-pm**，即 **Unified Package Manager** 的简写）是一个统一的 Node.js 包管理器命令行封装工具。无论你的项目使用 **npm**、**pnpm**、**yarn (v1)**、**yarn (v2+)** 还是 **bun**，只需一套命令即可。

同时附带伴侣命令 **`unpx`**，它是 `unpm dlx` 的快捷别名。

> 本项目受 [unjs/nypm](https://github.com/unjs/nypm) 和 [antfu/ni](https://github.com/antfu-collective/ni) 启发而来。

### 特性

- **自动检测** — 通过 lockfile 自动识别当前项目使用的包管理器。
- **统一 API** — 所有受支持的包管理器共用同一套命令。
- **透传选项** — 未知选项会被直接转发给底层包管理器。
- **灵活配置** — 支持 CLI 选项、环境变量和配置文件三种方式。
- **演习模式** — 使用 `--dry-run` 预览将要执行的命令，而不实际运行。

### 支持的包管理器

| 包管理器   | 标识符         |
| ---------- | -------------- |
| npm        | `npm`          |
| pnpm       | `pnpm`         |
| yarn (v1)  | `yarn-classic` |
| yarn (v2+) | `yarn-berry`   |
| bun        | `bun`          |

### 安装

```bash
npm install -g unpm
# 或
pnpm add -g unpm
# 或
bun add -g unpm
```

### 用法

```
unpm [选项] <命令> [参数]
unpx <命令> [参数]          # 等同于：unpm dlx <命令>
```

### 全局选项

| 选项                     | 环境变量             | 说明                                 |
| ------------------------ | -------------------- | ------------------------------------ |
| `-c, --config <path>`    | `UNPM_CONFIG_FILE`   | 指定配置文件路径。                   |
| `--pm <package-manager>` | —                    | 覆盖要使用的包管理器。               |
| `--runner <runner>`      | `UNPM_RUNNER`        | 覆盖脚本运行器（`node`）。           |
| `--no-auto-detect`       | `UNPM_AUTO_DETECT`   | 禁用包管理器自动检测。               |
| `--no-prompt-select`     | `UNPM_PROMPT_SELECT` | 禁用当无法确定包管理器时的提示选择。 |
| `--dry-run`              | —                    | 打印将要执行的命令，但不实际执行。   |
| `-h, --help`             | —                    | 显示帮助信息。                       |
| `-V, --version`          | —                    | 显示版本号。                         |

### 命令

#### `add`（别名：`a`）

向项目或全局安装包。

```bash
unpm add <包名...> [选项]
```

| 选项           | 说明                           |
| -------------- | ------------------------------ |
| `-g, --global` | 安装为全局包。                 |
| `-d, --dev`    | 安装为开发依赖。               |
| `--optional`   | 安装为可选依赖。               |
| `--peer`       | 安装为对等依赖。               |
| `--exact`      | 安装精确版本，不使用版本范围。 |

```bash
unpm add lodash@latest
unpm add -d typescript @types/node
unpm add --optional --os linux -- lodash    # '--os linux' 传给包管理器；'lodash' 为包名
```

#### `remove`（别名：`rm`）

从项目或全局移除包。

```bash
unpm remove <包名...> [选项]
```

| 选项           | 说明             |
| -------------- | ---------------- |
| `-g, --global` | 从全局包中移除。 |

```bash
unpm remove lodash
unpm remove -g typescript
```

#### `install`（别名：`i`）

安装项目的所有依赖。

```bash
unpm install [选项]
```

| 选项            | 说明                |
| --------------- | ------------------- |
| `-p, --prod`    | 仅安装生产依赖。    |
| `--no-optional` | 排除可选依赖。      |
| `--no-peer`     | 排除对等依赖。      |
| `--frozen`      | 禁止修改 lockfile。 |

```bash
unpm install
unpm install --frozen
unpm install -p --ignore-scripts       # '--ignore-scripts' 传给包管理器
```

#### `update`（别名：`up`）

更新已安装的包。

```bash
unpm update [包名...] [选项]
```

| 选项                | 说明             |
| ------------------- | ---------------- |
| `-g, --global`      | 更新全局包。     |
| `-p, --prod`        | 仅更新生产依赖。 |
| `--no-optional`     | 排除可选依赖。   |
| `--no-peer`         | 排除对等依赖。   |
| `-i, --interactive` | 使用交互模式。   |

```bash
unpm update lodash
unpm update -p
unpm update -i
```

#### `list`（别名：`ls`）

列出已安装的包。

```bash
unpm list [包名...] [选项]
```

| 选项            | 说明             |
| --------------- | ---------------- |
| `-g, --global`  | 列出全局包。     |
| `-p, --prod`    | 仅列出生产依赖。 |
| `-d, --dev`     | 仅列出开发依赖。 |
| `--no-optional` | 排除可选依赖。   |
| `--no-peer`     | 排除对等依赖。   |

```bash
unpm list
unpm list -g
unpm list --no-peer -- --json lodash   # '--json' 传给包管理器；'lodash' 用于过滤
```

#### `exec`（别名：`x`）

在项目上下文中执行命令（使用本地包管理器的 `exec`）。

```bash
unpm exec <命令> [参数...]
```

```bash
unpm exec prettier --write .
unpm exec eslint --fix src/
unpm exec --parallel -- tsc --noEmit   # '--parallel' 传给包管理器
```

#### `dlx`

临时执行包命令，无需安装。伴侣命令 `unpx` 是本命令的别名。

```bash
unpm dlx <命令> [参数...]
unpx <命令> [参数...]
```

```bash
unpm dlx prettier --write .
unpx eslint --fix src/
```

#### `run`

运行 `package.json` 中定义的脚本。

```bash
unpm run <脚本> [参数...]
```

```bash
unpm run dev
unpm run build --watch
unpm run --parallel -- test --coverage   # '--parallel' 传给包管理器
```

#### `pm`

将参数直接转发给底层包管理器。

```bash
unpm pm [参数...]
```

| 选项           | 说明               |
| -------------- | ------------------ |
| `-g, --global` | 使用全局包管理器。 |

```bash
unpm pm audit
unpm pm -g -- outdated -g   # 'outdated -g' 传给全局包管理器
```

### 配置

`unpm` 按以下优先级顺序解析包管理器：

1. **CLI 选项** `--pm <package-manager>`（最高优先级）
2. **环境变量** `UNPM_LOCAL_PM` / `UNPM_GLOBAL_PM`
3. **配置文件** (`unpmrc`)
4. **自动检测** 通过 lockfile
5. **提示选择** 当无法确定包管理器时（最低优先级）

#### 配置文件

配置文件从 XDG 配置目录中查找（Linux 下如 `~/.config/unpm/unpmrc`）。
也可以通过 `-c` 选项或 `UNPM_CONFIG_FILE` 环境变量指定自定义路径。

配置文件使用 INI 格式：

```ini
LOCAL_PM=pnpm
GLOBAL_PM=npm
RUNNER=node
AUTO_DETECT=true
PROMPT_SELECT=true
```

#### 环境变量

| 变量                 | 说明                                    |
| -------------------- | --------------------------------------- |
| `UNPM_CONFIG_FILE`   | 配置文件路径。                          |
| `UNPM_LOCAL_PM`      | 默认本地包管理器。                      |
| `UNPM_GLOBAL_PM`     | 默认全局包管理器。                      |
| `UNPM_RUNNER`        | 脚本运行器（`node`）。                  |
| `UNPM_AUTO_DETECT`   | 启用/禁用自动检测（`true` / `false`）。 |
| `UNPM_PROMPT_SELECT` | 启用/禁用提示选择（`true` / `false`）。 |

### 参数透传

大多数命令中，未知选项会自动转发给底层包管理器。当包名可能与选项值产生歧义时，可使用 `--` 作为分隔符：

- **`--` 之前**：传给包管理器的选项
- **`--` 之后**：包名 / 脚本参数

```bash
unpm add --optional --os linux -- lodash   # '--os linux' → 包管理器，'lodash' → 包名
```

### 许可证

[MIT](LICENSE)
