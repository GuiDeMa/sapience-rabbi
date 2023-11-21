
import config from './config'

import { start as server } from './server'

import { start as junglebus } from "./actors/junglebus/actor"

export async function start() {

  if (config.get('http_api_enabled')) {

    server();

  }
  
  junglebus()

}

if (require.main === module) {

  start()

}
