const { TransformTx, bobFromRawTx }  = require('bmapjs')
import { add } from "winston"
import { prisma } from "../context"

export async function bmapParseTransaction(txhex: string){
    const bob = await bobFromRawTx(txhex)
    const bmapTx = await TransformTx(bob)

    return bmapTx
}

export async function ingestBmapTransaction(bmapTx) {
    let response
    const txid = bmapTx.tx.h
    const address = bmapTx.in[0].e.a
    console.log(bmapTx)
    if (bmapTx.MAP[0].type === "post"){
        const newPost = await prisma.post.create({
            data: {
                transaction: {
                    connectOrCreate: {
                        where: {
                            hash: txid
                        },
                        create: {
                            hash: txid
                        }
                    }
                },
                createdAt: bmapTx.blk ? new Date(bmapTx.blk.t * 1000).toISOString() : new Date().toISOString(),
                content: bmapTx.B[0].content,
                contentType: bmapTx.B[0]["content-type"],
                inReplyTo: bmapTx.MAP[0].context === "tx" ? bmapTx.MAP[0].tx : null,
                postedBy: {
                    connectOrCreate: {
                        where: {
                            address: address
                        },
                        create: {
                            address: address
                        }
                    },
                },
                app: bmapTx.MAP[0].app ? bmapTx.MAP[0].app : null 
            }
        })
        console.log(`ingest.post.response`, newPost)
        response = newPost
    } else if (bmapTx.MAP[0].type === "message"){
        const newMessage = await prisma.message.create({
            data: {
                transaction: {
                    connectOrCreate: {
                        where: {
                            hash: txid
                        },
                        create: {
                            hash: txid
                        }
                    }
                },
                createdAt: bmapTx.blk ? new Date(bmapTx.blk.t * 1000).toISOString() : new Date().toISOString(),
                content: bmapTx.B[0].content,
                contentType: bmapTx.B[0]["content-type"],
                inReplyTo: bmapTx.MAP[0].context === "tx" ? bmapTx.MAP[0].tx : null,
                sentBy: {
                    connectOrCreate: {
                        where: {
                            address: address
                        },
                        create: {
                            address: address
                        }
                    },
                },
                app: bmapTx.MAP[0].app ? bmapTx.MAP[0].app : null,
                channel: bmapTx.MAP[0].channel
            }
        })

        console.log(`ingest.message.response`, newMessage)
        response = newMessage
    }

    return response
}