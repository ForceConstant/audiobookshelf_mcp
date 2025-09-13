# audiobookshelf_mcp
MCP for Audiobookshelf, based on its OpenAPI
From https://github.com/advplyr/audiobookshelf

## Generated using openapi-mcp-generator
https://github.com/harsha-iiiv/openapi-mcp-generator
* `npm install -g openapi-mcp-generator`
* `openapi-mcp-generator --input external/audiobookshelf/docs/openapi.json --output audiobookshelf_mcp --transport=streamable-http --port=3000`

## Running with Docker

To run the `openapi-mcp-generator` without installing local npm modules, you can use Docker:

1. **Build the Docker image:**
   ```bash
   ./build.sh
   ```

2. **Run the generator in a Docker container:**
   ```bash
   ./run.sh
   ```
   This will start the generator, and the generated files will be available in your current directory. The server will be accessible on port 3000.