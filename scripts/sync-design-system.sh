#!/usr/bin/env bash
# Copies the built design system into src/design-system as a stripped public copy:
# no comments or package headers, and only the agency brand. Run with DS_DIR set to the design system checkout.
set -euo pipefail
: "${DS_DIR:?set DS_DIR to the design system checkout}"
cd "$(dirname "$0")/.."
node scripts/strip-design-system.mjs "$DS_DIR/dist" src/design-system
echo '{ "type": "module" }' > src/design-system/package.json
