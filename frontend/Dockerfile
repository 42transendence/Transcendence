FROM alpine:3.19

RUN apk add --no-cache nodejs npm dumb-init

WORKDIR /app

COPY package*.json .

RUN npm install

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

#CMD ["npm", "run", "dev"]

CMD ["npm", "run", "build"]
