# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

RUN apk add --no-cache coreutils

# Install any needed packages
RUN npm install -g openapi-mcp-generator
