FROM node:22-alpine

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json appsscript.json ./
COPY src ./src
COPY local ./local

ENV NODE_ENV=development
ENV PORT=8787
EXPOSE 8787

CMD ["node", "local/dev-server.mjs"]
