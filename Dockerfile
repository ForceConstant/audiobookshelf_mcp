FROM node:20-alpine AS builder
WORKDIR /app
# Copy the audiobookshelf_mcp project into the image
COPY audiobookshelf_mcp/ ./

# Install dependencies and build the TypeScript code
RUN npm install
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only the built output and necessary runtime files
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Run in StreamableHTTP mode as requested
CMD ["node", "build/index.js", "--transport=streamable-http"]