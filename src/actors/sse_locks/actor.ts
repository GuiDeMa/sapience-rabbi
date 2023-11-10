require("dotenv").config()

import { Actor, log } from "rabbi"
import {stream} from "../../server/handlers/sse"

export async function start() {

    Actor.create({
        exchange: 'sapience',
        routingkey: 'mempool.lockup.transaction.discovered',
        queue: 'sse_lockup_transaction'
    })
    .start(async (channel, msg, json) => {
        const { txid, address, satoshis, lockUntilHeight, hex } = json
        stream.write({ data: { txid, address, satoshis, lockUntilHeight, hex }} )
    })
}

if (require.main === module) {

    start();
  
}