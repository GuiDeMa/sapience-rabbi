require("dotenv").config()

import { Actor, log } from "rabbi"
import {stream} from "../../server/handlers/sse"

export async function start() {

    Actor.create({
        exchange: 'sapience',
        routingkey: 'spv.block.synced',
        queue: 'sse_block_synced'
    })
    .start(async (channel, msg, json) => {
        const {
            header, 
            txCount,
            size,
            height,
            startDate
        } = json
        stream.write({ data:{
            header, 
            txCount,
            size,
            height,
            startDate
          }} )
    })
}

if (require.main === module) {

    start();
  
}