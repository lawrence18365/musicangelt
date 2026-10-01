#!/bin/zsh
# Deploy musicangel.ie to Cloudflare Pages from a clean dist/ copy.
#
# Never deploy the repo root: Pages uploads every file in the output dir,
# ignoring .gitignore, which once published .env and .tokens/ publicly.
# Functions still compile from ./functions in the repo root.

set -eu
cd "$(dirname "$0")/.."

rm -rf dist
rsync -a --exclude='.*' --exclude='node_modules' --exclude='dist' ./ dist/

if find dist -name '.*' | grep -q .; then
    echo "Refusing to deploy: dotfiles found in dist/" >&2
    exit 1
fi

npx wrangler pages deploy --project-name musicangelt --branch main \
    --commit-hash "$(git rev-parse --short HEAD)" "$@"
