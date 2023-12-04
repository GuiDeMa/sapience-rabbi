
require('dotenv').config()

import config from './config'

import { Server } from '@hapi/hapi'

import { log } from './log'

import { join } from 'path'

import { ApolloServer, BaseContext } from "@apollo/server";

import hapiApollo from "@as-integrations/hapi";


const Joi = require('joi')

const Pack = require('../package');

import { load } from './server/handlers'

const handlers = load(join(__dirname, './server/handlers'))

import { schema } from './schema'

import { context } from "./context"
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'

export const server = new Server({
  host: config.get('host'),
  port: config.get('port'),
  routes: {
    cors: true,
    validate: {
      options: {
        stripUnknown: true
      }
    }
  }
});

if (config.get('prometheus_enabled')) {

  log.info('server.metrics.prometheus', { path: '/metrics' })

  const { register: prometheus } = require('./metrics')

  server.route({
    method: 'GET',
    path: '/metrics',
    handler: async (req, h) => {
      return h.response(await prometheus.metrics())
    },
    options: {
      description: 'Prometheus Metrics about Node.js Process & Business-Level Metrics',
      tags: ['system']
    }
  })

}

server.route({
  method: 'GET', path: '/api/v0/status',
  handler: handlers.Status.index,
  options: {
    description: 'Simply check to see that the server is online and responding',
    tags: ['api', 'system'],
    response: {
      failAction: 'log',
      schema: Joi.object({
        status: Joi.string().valid('OK', 'ERROR').required(),
        error: Joi.string().optional()
      }).label('ServerStatus')
    }
  }
})

server.route({
  method: 'GET',
  path: '/bsv/mempool',
  handler: handlers.Bsv.mempool
});

server.route({
  method: 'GET',
  path: '/bsv/block',
  handler: handlers.Bsv.block
});

server.route({
  method: 'GET',
  path: '/bsv/reorg',
  handler: handlers.Bsv.reorg
});

server.route({
  method: 'GET',
  path: '/btc/mempool',
  handler: handlers.Btc.mempool
});

server.route({
  method: 'GET',
  path: '/btc/block',
  handler: handlers.Btc.block
});

server.route({
  method: 'GET',
  path: '/btc/reorg',
  handler: handlers.Btc.reorg
});

var started = false

export async function start() {

  if (started) return;

  started = true

  if (config.get('swagger_enabled')) {

    const swaggerOptions = {
      info: {
        title: 'API Docs',
        version: Pack.version,
        description: 'Developer API Documentation \n\n *** DEVELOPERS *** \n\n Edit this file under `swaggerOptions` in `src/server.ts` to better describe your service.'
      },
      schemes: ['http', 'https'],
      host: 'localhost:5200',
      documentationPath: '/api',
      grouping: 'tags'
    }

    const Inert = require('@hapi/inert');

    const Vision = require('@hapi/vision');

    const HapiSwagger = require('hapi-swagger');

    const Susie = require("susie")

    /* const apolloServer = new ApolloServer({
      schema,
      introspection: true,
    }) */
  
    //await apolloServer.start()

    await server.register([
        Inert,
        Vision,
        Susie,
        {
          plugin: HapiSwagger,
          options: swaggerOptions
        }, 
        /* { 
          plugin: hapiApollo,
          options: {
            plugins: [ApolloServerPluginLandingPageLocalDefault()],
            context: async ({ request }) => {
              return context({ req:request })
            },
            apolloServer,
            path: '/graphql'
          }
        } */
    ]);

    log.info('server.api.documentation.swagger', swaggerOptions)
  }


  await server.start();

  log.info(server.info)

  return server;

}

if (require.main === module) {

  start()

}
