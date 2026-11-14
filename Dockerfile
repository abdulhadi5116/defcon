FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node package.json server.mjs ./
COPY --chown=node:node public ./public
COPY --chown=node:node server ./server
COPY --chown=node:node drizzle ./drizzle
RUN mkdir /app/data && chown node:node /app/data
ENV HOST=0.0.0.0 PORT=5186 DATA_DIR=/app/data
USER node
VOLUME ["/app/data"]
EXPOSE 5186
CMD ["node", "server.mjs"]
