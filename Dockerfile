<<<<<<< HEAD
=======

>>>>>>> upgrade-v3
# שלב 1: בניית הלקוח (React)
FROM node:20-alpine AS client-build
WORKDIR /repo
COPY client/package*.json client/
RUN npm install --prefix client
COPY client/ client/
RUN npm run build --prefix client

# שלב 2: השרת + הבילד המוכן של הלקוח
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json server/
RUN npm install --prefix server --omit=dev
COPY server/ server/
COPY --from=client-build /repo/client/dist /app/client/dist

EXPOSE 3000
<<<<<<< HEAD
CMD ["node", "server/src/index.js"]
=======
CMD ["node", "server/src/index.js"]
>>>>>>> upgrade-v3
