FROM oven/bun:1.4.2-alpine AS base

WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun run build

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules

# Copy the Vite build output directory
COPY --from=prerelease /usr/src/app/dist ./dist

# Copy the Hono server script
COPY --from=prerelease /usr/src/app/server.ts .
COPY --from=prerelease /usr/src/app/package.json .

RUN bun add hono
ENV PORT=8080
EXPOSE 8080
CMD ["bun", "run", "server.ts"]
