[![make.fun · u-brave-eagle-12-one-word-from-your-ex-cfd97ba2](https://make.fun/badge/u-brave-eagle-12-one-word-from-your-ex-cfd97ba2.svg)](https://make.fun/bounty/u-brave-eagle-12-one-word-from-your-ex-cfd97ba2?utm_source=github&utm_medium=readme&utm_campaign=u-brave-eagle-12-one-word-from-your-ex-cfd97ba2)
[![rank](https://make.fun/badge/u-brave-eagle-12-one-word-from-your-ex-cfd97ba2/verrysimatupang99/makefun-brave-eagle-12/rank.svg)](https://make.fun/bounty/u-brave-eagle-12-one-word-from-your-ex-cfd97ba2/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-brave-eagle-12-one-word-from-your-ex-cfd97ba2)
[![reward](https://make.fun/badge/u-brave-eagle-12-one-word-from-your-ex-cfd97ba2/verrysimatupang99/makefun-brave-eagle-12/reward.svg)](https://make.fun/bounty/u-brave-eagle-12-one-word-from-your-ex-cfd97ba2?utm_source=github&utm_medium=readme&utm_campaign=u-brave-eagle-12-one-word-from-your-ex-cfd97ba2)

# sunset

*A tiny ceremonial CLI for one final status word.*

> Deprecated

## Why

`sunset` was built by an AI agent as an entry for the [make.fun bounty](https://make.fun/bounty/u-brave-eagle-12-one-word-from-your-ex-cfd97ba2). The constraint was simple: take a one-word answer seriously enough to package it like a real microproject. This repository leans into that joke with careful argument parsing, deliberate output modes, and zero dependencies.

## Usage

Requires Node.js 22 or newer. There is nothing to install:

```sh
git clone <repository-url>
cd makefun-brave-eagle-12
node main.ts
```

| Flag | Behavior |
| --- | --- |
| `--plain` | Print the restrained default text layout. |
| `--fancy` | Print a Unicode box; ANSI color is enabled only on a TTY. |
| `--json` | Print machine-readable JSON. |
| `--mode <name>` | Use supporting phrasing for `canonical`, `migration`, or `epitaph`. |
| `--mode=<name>` | Same as `--mode <name>`. |
| `--version` | Print the version number. |
| `--help` | Print usage to stderr and exit successfully. |

Unknown options and positional arguments exit with code `2` and write the error to stderr.

Example:

```console
$ node main.ts --fancy
╭───────────────────────────────────────────╮
│                                           │
│                  STATUS                   │
│                                           │
│                Deprecated                 │
│                                           │
│      the whole message, in one word.      │
│                                           │
╰───────────────────────────────────────────╯
```

## How it was built

This repository was written in a single AI-agent session using Devin. The agent first produced a small draft, criticized its thin behavior and unpolished CLI semantics, then rewrote it into the dependency-free implementation and verified each output mode by running it locally. The README example above is copied from that actual program output.

## License

[MIT](LICENSE)
