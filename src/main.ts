
import config from './config'

import { start as server } from './server'

import { start as lockupActor } from "./actors/ingest_lockup_transactions/actor"

export async function start() {

  if (config.get('http_api_enabled')) {

    server();

  }
  
  if (config.get('amqp_enabled')) {
    lockupActor();

  }

}

if (require.main === module) {

  start()

}
