/* implements rabbi actor protocol */

require('dotenv').config();

import { Actor, log } from 'rabbi';
import { prisma } from '../../context';
import { bmapParseTransaction } from '../../utils/bmap';
import { bsv } from 'scrypt-ts';

export async function start(){

    Actor.create({

        exchange: 'sapience',

        routingkey: 'lockup.transaction.discovered',

        queue: 'ingest_lockup_transaction'

    })
    .start(async (channel, msg, json) => {
        
        console.log("lockup.actor.started")
        
        const { txid, lockup, lock_vout, hex } = json

        const bsvTx = new bsv.Transaction(hex)
        const bmapTx = await bmapParseTransaction(hex)

        let targetTxid = txid
        if (bmapTx.MAP[0].type === "like"){
            targetTxid = bmapTx.MAP[0].tx
        }

        // lock mutation here
        console.log({
            createdAt: bmapTx.blk && new Date(bmapTx.blk.t * 1000).toISOString() ,
            satoshis: bsvTx.outputs[lock_vout].satoshis,
            blockHeight: Number(lockup.lockUntilHeight),
            transaction: {
                connectOrCreate: {
                    where: {
                        hash: txid
                    },
                    create: {
                        hash: txid,
                        block: bmapTx.blk && bmapTx.blk.i
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
                        address: "lockerAddress"
                    },
                    create: {
                        address: "lockerAddress",
                    }
                }
            }
        })
        const response = await prisma.lock.create({
            data: {
                createdAt: bmapTx.blk && new Date(bmapTx.blk.t * 1000).toISOString() ,
                satoshis: bsvTx.outputs[lock_vout].satoshis,
                blockHeight: Number(lockup.lockUntilHeight),
                transaction: {
                    connectOrCreate: {
                        where: {
                            hash: txid
                        },
                        create: {
                            hash: txid,
                            block: bmapTx.blk && bmapTx.blk.i
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
                            address: "lockerAddress"
                        },
                        create: {
                            address: "lockerAddress",
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