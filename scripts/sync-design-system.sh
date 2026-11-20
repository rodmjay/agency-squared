#!/usr/bin/env bash
# Refreshes src/design-system with a stripped public copy of the shared design system: comments and package headers
# removed, only the agency brand kept. The design system is installed outside this repo; DS_COPY points at its copy script.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DS_COPY:?set DS_COPY to the design system copy script (installed outside this repo)}"
node "$DS_COPY" --public --brand agency src/design-system brands/agency/tokens.css brands/agency/tailwind.css i18n.js check-i18n.mjs confirm.js
echo '{ "type": "module" }' > src/design-system/package.json
