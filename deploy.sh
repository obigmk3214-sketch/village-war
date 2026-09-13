#!/bin/bash
# Publish Village War to GitHub Pages.
#
# Publishes to the `mine` remote (github.com/obigmk3214-sketch/village-war),
# because the original ObiGMK account is no longer accessible. `origin` still
# points at the old repo in case that account is ever recovered.
#
# Auth: a Personal Access Token from the obigmk3214-sketch account, stored in
# the macOS Keychain. See the "Paste token" command in the chat, or:
#   https://github.com/settings/tokens -> classic -> tick "repo"

set -e
cd "$(dirname "$0")"

REMOTE="${1:-mine}"
SITE="https://obigmk3214-sketch.github.io/village-war"

# Stamp a cache-busting version onto every script/stylesheet tag. Without this,
# browsers keep serving an old cached copy after a deploy — which once left the
# game running a stale config.js and silently rejecting a correct password.
STAMP=$(git rev-parse --short HEAD)
if grep -q 'v=VWV' index.html || ! grep -q "v=$STAMP" index.html; then
    sed -i '' -E "s/(\.js|\.css)\?v=[A-Za-z0-9]+/\1?v=$STAMP/g" index.html
    if ! git diff --quiet index.html; then
        git add index.html
        git commit -q -m "Cache-bust assets for deploy $STAMP"
        STAMP=$(git rev-parse --short HEAD)
        sed -i '' -E "s/(\.js|\.css)\?v=[A-Za-z0-9]+/\1?v=$STAMP/g" index.html
        git add index.html && git commit -q --amend --no-edit
    fi
fi

AHEAD=$(git rev-list --count "$REMOTE/main..HEAD" 2>/dev/null || echo "all")
echo "==> Pushing $AHEAD commits to '$REMOTE'..."
git push -u "$REMOTE" main

echo
echo "==> Pushed. GitHub Pages takes 30-90s to build (longer on the very first"
echo "    deploy, and it only starts once Pages is switched on in Settings)."

# Probe for THIS deploy's version stamp in index.html. Checking that some file
# merely exists is useless — it was already there from the previous deploy and
# reports success immediately (which it did, misleadingly).
STAMP=$(git rev-parse --short HEAD)
for i in $(seq 1 45); do
    if curl -s --max-time 10 "$SITE/?cb=$RANDOM" | grep -q "v=$STAMP"; then
        echo
        echo "==> LIVE with the newest work:"
        echo "    $SITE/"
        # Deliberately does not print the password: this script is committed
        # to a public repo, and echoing it here published it in plaintext.
        exit 0
    fi
    printf '.'
    sleep 8
done

echo
echo "==> Push worked, but the site isn't serving the new files yet."
echo "    Turn Pages on: https://github.com/obigmk3214-sketch/village-war/settings/pages"
echo "    Source = 'Deploy from a branch', Branch = 'main', Folder = '/ (root)', Save."
echo "    Then re-run this script."
