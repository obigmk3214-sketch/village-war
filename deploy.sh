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
#
# The stamp is a hash of the asset CONTENTS, not of the commit. It used to be
# `git rev-parse --short HEAD`, which cannot work: stamping index.html requires
# a commit, committing changes HEAD, so the script re-stamped and `--amend`ed -
# and amending changed the hash again. The stamp written (the pre-amend hash)
# never matched the post-amend HEAD the verify loop below polled for, so every
# deploy ran the full 90 probes and then claimed the site wasn't serving the new
# files and that Pages needed switching on, when the deploy had in fact worked.
#
# A content hash is known before any commit, so one pass is enough, and it only
# changes when an asset actually changes - which is exactly what cache busting
# wants. index.html is excluded on purpose: it carries the stamp, so including
# it would make the stamp depend on itself.
STAMP=$(cat *.js style.css | shasum | cut -c1-7)
if grep -q 'v=VWV' index.html || ! grep -q "v=$STAMP" index.html; then
    sed -i '' -E "s/(\.js|\.css)\?v=[A-Za-z0-9]+/\1?v=$STAMP/g" index.html
    if ! git diff --quiet index.html; then
        git add index.html
        git commit -q -m "Cache-bust assets to $STAMP"
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
# reports success immediately (which it did, misleadingly). $STAMP is still the
# content hash stamped above, which is what the published index.html contains.
for i in $(seq 1 90); do
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
