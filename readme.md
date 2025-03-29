# Fastify Chatbot

This chatbot is built with [fastify](https://fastify.dev). Fastify is intended to be a fast and low overhead web framework for nodejs.



## Dependencies:
This app requires node.js 23+ to as well as the npm dependencies.

## Starting

### Locally
 
Install dependencies:
`npm install`

Start the server:
`npm start`

### Docker

Build Image: ` docker build -t fastify-app .`

Run Image: `docker run -p 3000:3000 fastify-app`


## App

The server is located in the `server.js` file which configured the routes and runs the server.

The server start listening on the port `3000`. 

### Routes 

`/hello`: Hello world route. Return back "world".

## Configuration | Enviromnent variables

Configuration is done by using enviromnent variables. If the variables are not present suitable default values are used.

`LOG_LEVEL`: Sets the pino log level. Default => info

`FASTIFY_PORT`: Sets the port the server is listening to. Default => 3000



