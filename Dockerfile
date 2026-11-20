# XYZ Studio in one container: Node + Playwright Chromium + the engine, served on port 4173.
#   docker compose up --build        then open http://localhost:4173
# The base image tag must match the playwright version in pnpm-lock.yaml (its browsers are preinstalled).
FROM mcr.microsoft.com/playwright:v1.64.0-noble

WORKDIR /app
RUN npm install -g pnpm@10 && chown pwuser:pwuser /app
USER pwuser

COPY --chown=pwuser:pwuser package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY --chown=pwuser:pwuser . .
RUN mkdir -p .relay-scratch temp

# Bind inside the container; compose publishes the port on the host's 127.0.0.1 only.
ENV STUDIO_HOST=0.0.0.0 STUDIO_PORT=4173 PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
EXPOSE 4173
CMD ["node", "tools/studio.mjs"]
