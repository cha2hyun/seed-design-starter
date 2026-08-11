#!/bin/sh
# Launches an npm-published MCP server for Cursor.
#
# Cursor spawns MCP servers from the desktop environment, whose PATH on macOS is only
# /usr/bin:/bin:/usr/sbin:/sbin. Node installed by nvm, fnm, Volta or Homebrew lives
# outside that, so a bare `"command": "npx"` fails before the server starts — and the
# server never appears in the MCP list at all. Only /bin/sh is guaranteed to be found,
# so .cursor/mcp.json calls this shim and lets it locate Node.
#
# Usage: /bin/sh .cursor/mcp-node.sh <npm-package@version> [args...]

set -eu

if ! command -v npx >/dev/null 2>&1; then
  # Version managers first: they own the Node the project was set up with.
  # The nvm glob expands in ascending order, so the last match is the newest install.
  nvm_bin=""
  for dir in "$HOME"/.nvm/versions/node/*/bin; do
    [ -x "$dir/npx" ] && nvm_bin="$dir"
  done

  for dir in \
    "$HOME/.volta/bin" \
    "$HOME"/.local/share/fnm/node-versions/*/installation/bin \
    "$nvm_bin" \
    /opt/homebrew/bin \
    /usr/local/bin; do
    if [ -n "$dir" ] && [ -x "$dir/npx" ]; then
      PATH="$dir:$PATH"
      export PATH
      break
    fi
  done
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "seed MCP: no npx on PATH, and none found under nvm, fnm, Volta or Homebrew." >&2
  echo "Install a Node version accepted by package.json, then reload Cursor." >&2
  exit 1
fi

exec npx -y "$@"
