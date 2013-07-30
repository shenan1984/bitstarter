#!/bin/bash
# setup node and some npm stuff
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install -y nodejs npm

# install express
npm install express
