#!/bin/bash
# Publish Village War to https://obigmk.github.io/village-war/
#
# First run only: git will ask for your GitHub username (ObiGMK) and a password.
# The "password" must be a Personal Access Token, not your account password —
# GitHub stopped accepting account passwords for git in 2021.
#   Make one at: https://github.com/settings/tokens
#   -> Generate new token (classic) -> tick the "repo" box -> Generate -> copy
# macOS Keychain stores it after this, so you only ever do it once.

set -e
cd "$(dirname "$0")"

echo "==> Pushing $(git log --oneline origin/main..HEAD | wc -l | tr -d ' ') new commits..."
git push origin main

echo
echo "==> Pushed. GitHub Pages usually takes 30-90s to rebuild. Waiting..."

# kml-angevin-edit.m4a only exists in the new work, so its presence proves the
# live site has actually rebuilt rather than served a cached old copy.
PROBE="https://obigmk.github.io/village-war/music/kml-angevin-edit.m4a"
for i in $(seq 1 40); do
    CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$PROBE?cb=$RANDOM" || echo 000)
    if [ "$CODE" = "200" ]; then
        echo
        echo "==> LIVE. The site now has the newest work."
        echo "    https://obigmk.github.io/village-war/"
        echo "    password: druCyCrze8T6AY%1"
        exit 0
    fi
    printf '.'
    sleep 8
done

echo
echo "==> Push succeeded, but the site hasn't picked it up after ~5 minutes."
echo "    Check the build at https://github.com/ObiGMK/village-war/actions"
echo "    (and that Pages is set to deploy from branch 'main' in repo Settings > Pages)."
