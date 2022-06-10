#!/bin/bash

ip=$(hostname  -I | cut -f1 -d' ')

sudo apt install libnss3-tools -y

wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64

sudo mv mkcert-v1.4.3-linux-amd64 /usr/local/bin/mkcert

sudo chmod +x /usr/local/bin/mkcert

mkdir -p $HOME/web-certs

mkcert -key-file $HOME/web-certs/localhost-key.pem -cert-file $HOME/web-certs/localhost-cert.pem localhost 127.0.0.1 $ip

cd $HOME/web-certs

mkcert -install
