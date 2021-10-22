#!/bin/bash
# set -x
set -o errexit

# Delete old builds.
rm -rf ./dist
rm -rf ./tmp


# Build the projects.
PROJECTS=(
    "core"
    "mappings-common-mappings"
    "orchestrators-kubernetes"
    "query-backends-prometheus"
    "metrics-cost-efficiency"
    "openapi-gen"
    "polaris-nx"
    "cli-polaris-cli"
)

for proj in ${PROJECTS[@]}; do
    npx nx build $proj
done


# Publish the npm packages.
NPM_PKGS=(
    "./libs/core"
    "./libs/mappings/common-mappings"
    "./libs/orchestrators/kubernetes"
    "./libs/query-backends/prometheus"
    "./libs/metrics/cost-efficiency"
    "./libs/openapi-gen"
    "./libs/polaris-nx"
    "./apps/cli/polaris-cli"
)

cd ./dist
for pkg in ${NPM_PKGS[@]}; do
    npm publish $pkg
done

echo "All packages published successfully."
