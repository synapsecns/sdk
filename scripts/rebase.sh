#!/usr/bin/env bash

BRANCH="dev"
if [[ -n "$1" ]]; then BRANCH="$1"; fi


git rebase "$BRANCH" --committer-date-is-author-date --ignore-whitespace
