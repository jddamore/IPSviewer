#!/bin/sh
sed -i '/2\.11\.6/a \ \ "type": "module",' node_modules/@popperjs/core/package.json
