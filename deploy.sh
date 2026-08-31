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

AHEAD=$(git rev-list --count "$REMOTE/main..HEAD" 2>/dev/null || echo "all")
echo "==> Pushing $AHEAD commits to '$REMOTE'..."
git push -u "$REMOTE" main

echo
echo "==> Pushed. GitHub Pages takes 30-90s to build (longer on the very first"
echo "    deploy, and it only starts once Pages is switched on in Settings)."

# This file exists only in the new work, so seeing it proves the live site
# actually rebuilt rather than serving a cached older copy.
PROBE="$SITE/music/kml-angevin-edit.m4a"
for i in $(seq 1 45); do
    CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$PROBE?cb=$RANDOM" || echo 000)
    if [ "$CODE" = "200" ]; then
        echo
        echo "==> LIVE with the newest work:"
        echo "    $SITE/"
        echo "    password: druCyCrze8T6AY%1"
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
