#!/bin/bash

openssl req -newkey rsa:4096 -nodes -x509 -days 365 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt -subj "/C=KR/ST=Seoul/L=Seoul/O=42/OU=transcendence/CN=localhost"

chmod 600 /etc/ssl/certs/nginx-selfsigned.crt /etc/ssl/private/nginx-selfsigned.key

exec nginx -g 'daemon off;'
