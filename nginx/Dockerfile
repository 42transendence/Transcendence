FROM alpine:3.19

RUN apk add --no-cache nginx dumb-init openssl curl

COPY ./server.conf /etc/nginx/http.d/default.conf

COPY ./init.sh /home/init.sh

RUN #chmod +x /home/init.sh

ENTRYPOINT [ "/usr/bin/dumb-init", "--", "/bin/sh", "/home/init.sh" ]

#ENTRYPOINT [ "/usr/bin/dumb-init", "--", "nginx", "-g", "daemon off;"]
