/* implements rabbi actor protocol */

require('dotenv').config();

import { Actor, log } from 'rabbi';
import { prisma } from '../../context';
import { bmapParseTransaction } from '../../utils/bmap';
import { bsv } from 'scrypt-ts';

export async function start(){

    Actor.create({

        exchange: 'sapience',

        routingkey: 'mempool.lockup.transaction.discovered',

        queue: 'ingest_mempool_lockup_transaction'

    })
    .start(async (channel, msg, json) => {
        
        console.log("lockup.actor.started")
        
        const { txid, address, satoshis, lockUntilHeight, hex } = json

        const bsvTx = new bsv.Transaction(hex)
        const bmapTx = await bmapParseTransaction(hex)

        let targetTxid = txid
        if (bmapTx.MAP[0].type === "like"){
            targetTxid = bmapTx.MAP[0].tx
        }

        const response = await prisma.lock.create({
            data: {
                satoshis,
                blockHeight: lockUntilHeight,
                transaction: {
                    connectOrCreate: {
                        where: {
                            hash: txid
                        },
                        create: {
                            hash: txid,
                        }
                    }
                } ,
                lockTarget: {
                    connectOrCreate: {
                        where: {
                            hash: targetTxid
                        },
                        create: {
                            hash: targetTxid
                        }
                    }
                },
                locker: {
                    connectOrCreate: {
                        where: {
                            address: address
                        },
                        create: {
                            address: address,
                        }
                    }
                }
            }
        })
    })
    Actor.create({

        exchange: 'sapience',

        routingkey: 'block.lockup.transaction.discovered',

        queue: 'ingest_block_lockup_transaction'

    })
    .start(async (channel, msg, json) => {
        
        console.log("lockup.actor.started")
        
        const { txid, address, satoshis, lockUntilHeight, hex, blockHeight, blockHeader } = json

        const bsvTx = new bsv.Transaction(hex)
        const bmapTx = await bmapParseTransaction(hex)

        let targetTxid = txid
        if (bmapTx.MAP[0].type === "like"){
            targetTxid = bmapTx.MAP[0].tx
        }

        
        const response = await prisma.lock.create({
            data: {
                createdAt: bmapTx.blk && new Date(bmapTx.blk.t * 1000).toISOString() ,
                satoshis,
                blockHeight: lockUntilHeight,
                transaction: {
                    connectOrCreate: {
                        where: {
                            hash: txid
                        },
                        create: {
                            hash: txid,
                            block: blockHeight
                        }
                    }
                } ,
                lockTarget: {
                    connectOrCreate: {
                        where: {
                            hash: targetTxid
                        },
                        create: {
                            hash: targetTxid
                        }
                    }
                },
                locker: {
                    connectOrCreate: {
                        where: {
                            address: address
                        },
                        create: {
                            address: address,
                        }
                    }
                }
            }
        })
    })
}

if (require.main === module) {

    start();
  
}