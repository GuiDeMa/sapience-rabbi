require("dotenv").config()

import { Actor, log } from "rabbi"
import {stream} from "../../server/handlers/locks"

export async function start() {

    Actor.create({
        exchange: 'sapience',
        routingkey: 'mempool.lockup.transaction.discovered',
        queue: 'sse_lockup_transaction'
    })
    .start(async (channel, msg, json) => {
        const { txid, lockup, lock_vout, hex } = json
        stream.write({ data:{ txid, lockup, lock_vout, hex }} )
    })
}

if (require.main === module) {

    start();
  
}