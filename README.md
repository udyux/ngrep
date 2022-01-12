# ngrep

> CLI util to search for a string withing the current directory.

## Install

From the project root directory, run `yarn`.

Add an alias that executes node on the entry file. On MacOS this looks like

```bash
alias ngrep="node ~/path/to/ngrep/index.js"
```

## Usage

When called, your current working directory on the command line will be used as the starting point.

```bash
# single word
> ngrep udyux

5044 files searched in 0.38 seconds
6 files found with matching term
--
.eslintrc.js
package.json
yarn.lock
node_modules/.yarn-integrity
node_modules/eslint-config-udyux/README.md
node_modules/eslint-config-udyux/package.json

# phrase
> ngrep 'Nicolas Udy'

5044 files searched in 0.35 seconds
2 files found with matching term
--
node_modules/eslint-config-udyux/LICENSE
node_modules/eslint-config-udyux/package.json
```
