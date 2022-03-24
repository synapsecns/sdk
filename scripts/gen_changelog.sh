#!/usr/bin/env bash

source .env

USERNAME="$GITHUB_USERNAME"
API_KEY="$GITHUB_API_KEY"

BASE_ENDPOINT="https://api.github.com"
REPO_ENDPOINT="$BASE_ENDPOINT/repos/synapsecns/sdk"
PULLS_ENDPOINT="$REPO_ENDPOINT/pulls"

pr_body_filename () {
  PR_NUM="$1"
  echo "pr_${PR_NUM}_body.md"
}

fetch_pr_text () {
  PR_NUM="$1"

  DATA=$(curl -H 'Accept: application/vnd.github.v3.full+json' -u $USERNAME:$API_KEY "$PULLS_ENDPOINT/$PR_NUM")
  echo "$DATA" | jq -r '.body' > $(pr_body_filename $PR_NUM)
}

PULL_REQUEST="$1"
PACKAGE_VERSION="$2"

fetch_pr_text "${PULL_REQUEST}"

FILENAME=$(pr_body_filename "${PULL_REQUEST}")

HEADER="# @synapsecns/sdk v${PACKAGE_VERSION} Changelog/Release notes"

echo -e "$HEADER\n\n\n$(cat $FILENAME)" > "$FILENAME"

mv "$FILENAME" "CHANGELOG.md"

rm -rf "$FILENAME"

git add CHANGELOG.md
git commit -m "Changelog for v${PACKAGE_VERSION}"