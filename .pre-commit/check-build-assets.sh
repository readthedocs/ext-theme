#!/bin/sh

# If the working tree already has unstaged changes from earlier
# auto-fix hooks, don't both running this check and just report fail
if tree_before=$(git status --porcelain); then
    cat <<EOF
Working tree is already dirty before asset build.

% git status --porcelain
${tree_before}
EOF
    exit 1
fi

npm run build

if tree_after=$(git diff readthedocsext/); then
then
    cat <<EOF
Assets are out of date. Make sure to run 'npm run build' on your branch.

% git diff readthedocsext/ 
${tree_after}
EOF
    exit 1
fi
