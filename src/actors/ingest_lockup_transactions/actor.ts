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
        let targetBmapTx = bmapTx
        if (bmapTx.MAP){
            if (bmapTx.MAP[0].type === "like"){
                targetTxid = bmapTx.MAP[0].tx
                const targetTxHex = await fetchTransaction({ txid: targetTxid})
                targetBmapTx = await bmapParseTransaction(targetTxHex)
                await ingestBmapTransaction(targetBmapTx)
            } else {
                await ingestBmapTransaction(bmapTx)
            }
        }

        const response = await prisma.lock.upsert({
            where: { txid },
            create: {
                satoshis,
                blockHeight: BigInt(Number(lockUntilHeight.toString())),
                vibes: satoshis * Math.log10(lockUntilHeight),
                unixtime: new Date().getTime() / 1000,
                transaction: {
                    connectOrCreate: {
                        where: {
                            hash: txid
                        },
                        create: {
                            hash: txid,
                        }
                    }
                },
                app: bmapTx.MAP[0].app,
                postLockTarget: {
                    connectOrCreate: {
                      where: {
                        txid: targetTxid
                      },
                      create: {
                        txid: targetTxid,
                        unixtime: new Date().getTime() / 1000,
                        content: targetBmapTx.B[0].content,
                        contentType: targetBmapTx.B[0]["content-type"],
                        inReplyToTx: targetBmapTx.MAP[0].context === "tx" ? targetBmapTx.MAP[0].tx : null,
                        app: targetBmapTx.MAP[0].app,
                        postedByUserAddress: targetBmapTx.in[0].e.a,
                      }
                    }
                },
                messageLockTarget: {
                    connectOrCreate: {
                        where: {
                            txid: targetTxid
                        },
                        create: {
                            txid: targetTxid,
                            unixtime: new Date().getTime() / 1000,
                            content: targetBmapTx.B[0].content,
                            contentType: targetBmapTx.B[0]["content-type"],
                            inReplyToTx: targetBmapTx.MAP[0].context === "tx" ? targetBmapTx.MAP[0].tx : null,
                            app: targetBmapTx.MAP[0].app,
                            channel: targetBmapTx.MAP[0].channel,
                            sentByUserAddress: targetBmapTx.in[0].e.a,
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
                            paymail: bmapTx.MAP[0].paymail
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
        let targetBmapTx = bmapTx
        if (bmapTx.MAP){
            if (bmapTx.MAP[0].type === "like"){
                targetTxid = bmapTx.MAP[0].tx
                const targetTxHex = await fetchTransaction({ txid: targetTxid})
                targetBmapTx = await bmapParseTransaction(targetTxHex)
                await ingestBmapTransaction(targetBmapTx)
            } else {
                await ingestBmapTransaction(bmapTx)
            }
        }

        console.log("lock target", targetBmapTx)
        const response = await prisma.lock.upsert({
            where: { txid },
            create: {
                unixtime: blockHeader.time,
                satoshis,
                blockHeight: BigInt(Number(lockUntilHeight.toString())),
                vibes: satoshis * Math.log10(lockUntilHeight),
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
                },
                app: bmapTx.MAP[0].app,
                postLockTarget: targetBmapTx.MAP[0].type === "post" ? {
                    connect: { txid: targetTxid }
                } : {},
                messageLockTarget: targetBmapTx.MAP[0].type === "message" ? {
                    connect: { txid: targetTxid }
                } : {},
                locker: {
                    connectOrCreate: {
                        where: {
                            address: address
                        },
                        create: {
                            address: address,
                            paymail: bmapTx.MAP[0].paymail
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
