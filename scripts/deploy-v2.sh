#!/usr/bin/env bash
# Deploy V2 to the deploy-only repository heizen-supply-chain-discovery-v2.
#
# The v2 repo holds built output, not source — the git credential on this
# machine lacks the `workflow` scope, so source history (which contains
# .github/workflows/) cannot be pushed there. Source of truth stays here on
# main; run this script after committing to publish V2.
#
# Each deploy is a normal commit on top of the previous one (plain push,
# never force), so the v2 repo keeps a history of deployments.
set -euo pipefail
cd "$(dirname "$0")/.."

V2_REPO="https://github.com/jbieyashvi/heizen-supply-chain-discovery-v2.git"

npm run build
rm -rf dist/v1   # frozen V1 snapshot (public/v1) belongs to the original site only
touch dist/.nojekyll

STAMP="$(git rev-parse --short HEAD)"
cat > dist/README.md <<EOF
# Heizen Supply Chain Discovery — V2 (deploy-only)

Built output only. Source lives in
https://github.com/jbieyashvi/heizen-supply-chain-discovery (branch main).
This deployment was built from commit ${STAMP}.
Redeploy with: scripts/deploy-v2.sh
EOF

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
git clone -q --depth 1 "$V2_REPO" "$TMP" 2>/dev/null || git -C "$TMP" init -q
cd "$TMP"
git checkout -q -B main
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R "$OLDPWD/dist/." .
git add -A
if git diff --cached --quiet; then
  echo "No changes since last deploy — nothing to push."
else
  git commit -q -m "Deploy V2 (source ${STAMP})"
  git push -q "$V2_REPO" main:main
  echo "Deployed source ${STAMP} to ${V2_REPO%.git} (branch main)"
fi
