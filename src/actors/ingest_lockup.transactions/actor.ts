/* implements rabbi actor protocol */

require('dotenv').config();

import { Actor, log } from 'rabbi';

export async function start(){

    Actor.create({

        exchange: 'sapience',

        routingkey: 'lockup.transaction.discovered',

        queue: 'ingest_lockup_transaction'

    })
    .start(async (channel, msg, json) => {
        
        console.log("lockup.actor.started")
        
        const { txid, lockup, hex } = json
        
    })
}

if (require.main === module) {

    start();
  
}