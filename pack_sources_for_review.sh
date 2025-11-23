#!/bin/bash

zip -r build/sources.zip . -x \
"node_modules/*" \
"build/*" \
"design/*" \
"pack_sources_for_review.sh" \
".github/*" \
".git/*" \
".idea/*" \
".DS_Store" \
".gitignore"