/* implements rabbi actor protocol */

require('dotenv').config();

import { Actor, log } from 'rabbi';
import { prisma } from '../../context';
import { bmapParseTransaction, ingestBmapTransaction } from '../../utils/bmap';
import { bsv } from 'scrypt-ts';
import { fetchTransaction } from '../../utils/whatsonchain';

export async function start(){

    Actor.create({

        exchange: 'sapience',

        routingkey: 'mempool.lockup.transaction.discovered',

        queue: 'ingest_mempool_lockup_transaction'

    })
    .start(async (channel, msg, json) => {
        
        const { txid, address, satoshis, lockUntilHeight, hex } = json

        console.log("mempool.lock.discovered", txid)

        const bsvTx = new bsv.Transaction(hex)
        const bmapTx = await bmapParseTransaction(hex)

        let targetTxid = txid
        if (bmapTx.MAP){
            if (bmapTx.MAP[0].type === "like"){
                targetTxid = bmapTx.MAP[0].tx
                const targetTxHex = await fetchTransaction({ txid: targetTxid})
                const targetBmapTx = await bmapParseTransaction(targetTxHex)
                await ingestBmapTransaction(targetBmapTx)
            } else {
                await ingestBmapTransaction(bmapTx)
            }
        }

        const response = await prisma.lock.upsert({
            where: { txid },
            create: {
                satoshis,
                blockHeight: Number(lockUntilHeight),
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
            },
            update: {}
        })

        console.log("ingest.lock.from.mempool.response", response)
    })
    Actor.create({

        exchange: 'sapience',

        routingkey: 'block.lockup.transaction.discovered',

        queue: 'ingest_block_lockup_transaction'

    })
    .start(async (channel, msg, json) => {
        
        const { txid, address, satoshis, lockUntilHeight, hex, blockHeight, blockHeader } = json

        console.log("block.lock.discovered", txid)

        const bsvTx = new bsv.Transaction(hex)
        const bmapTx = await bmapParseTransaction(hex)

        let targetTxid = txid
        if (bmapTx.MAP){
            if (bmapTx.MAP[0].type === "like"){
                targetTxid = bmapTx.MAP[0].tx
                const targetTxHex = await fetchTransaction({ txid: targetTxid})
                const targetBmapTx = await bmapParseTransaction(targetTxHex)
                await ingestBmapTransaction(targetBmapTx)
            } else {
                await ingestBmapTransaction(bmapTx)
            }
        }

        
        const response = await prisma.lock.upsert({
            where: { txid },
            create: {
                createdAt: bmapTx.blk && new Date(bmapTx.blk.t * 1000).toISOString() ,
                satoshis,
                blockHeight: Number(lockUntilHeight),
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
            },
            update: {}
        })

        console.log(`ingest.lock.from.block.${blockHeight}.response`, response)
    })
}

if (require.main === module) {

    start();
  
}
