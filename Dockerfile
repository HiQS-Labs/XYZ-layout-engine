# XYZ Layout Engine containers: Node + Playwright Chromium + pre-baked engine dependencies.
#   docker compose up --build                              # default studio stage -> http://localhost:4173
#   docker build --target renderer -t xyz-renderer .       # lean headless renderer (tools/ only, no examples/)
# The base image tag must match the playwright version in pnpm-lock.yaml (its browsers are preinstalled).
FROM mcr.microsoft.com/playwright:v1.64.0-noble AS base

WORKDIR /app
RUN npm install -g pnpm@10 && chown pwuser:pwuser /app && chmod 755 /app
USER pwuser

COPY --chown=pwuser:pwuser package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts && chmod -R a+rX /app/package.json /app/node_modules

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Lean headless renderer: pre-baked node_modules + tools/ only (~4.8 MB app payload, zero examples/).
# World-readable /app so consumers mounting /work can run with --user "$(id -u):$(id -g)" -e HOME=/tmp.
FROM base AS renderer

COPY --chown=pwuser:pwuser tools ./tools
RUN chmod -R a+rX /app/tools

CMD ["node", "/app/tools/render.mjs"]

# Default stage: XYZ Studio local browser front end with bundled examples/ on port 4173.
FROM renderer AS studio

COPY --chown=pwuser:pwuser examples ./examples
RUN mkdir -p .relay-scratch temp

# Bind inside the container; compose publishes the port on the host's 127.0.0.1 only.
ENV STUDIO_HOST=0.0.0.0 STUDIO_PORT=4173
EXPOSE 4173
CMD ["node", "tools/studio.mjs"]
