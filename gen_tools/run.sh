#!/bin/bash
set -x
docker run -it --rm -w /workspace -v /mnt/volume/devel/audiobookshelf_mcp:/workspace openapi-mcp-generator openapi-mcp-generator --input external/audiobookshelf/docs/openapi.json --output /workspace/audiobookshelf_mcp --force -b http://audiobookshelf/ --transport=streamable-http --port=3000
# docker run -it --rm -v `realpath .`:/workspace -w /workspace openapi-mcp-generator openapi-mcp-generator --input external/audiobookshelf/docs/openapi.json --output audiobookshelf_mcp --transport=streamable-http --port=3000
# docker run -it --rm -v /mnt/volume/devel/audiobookshelf_mcp:/workspace -w /workspace openapi-mcp-generator sh -c "pwd && ls"