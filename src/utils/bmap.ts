const { TransformTx, bobFromRawTx }  = require('bmapjs')
import { prisma } from "../context"

export async function bmapParseTransaction(txhex: string){
    const bob = await bobFromRawTx(txhex)
    const bmapTx = await TransformTx(bob)

    return bmapTx
}

export async function ingestBmapTransaction(bmapTx) {
    let response
    console.log(bmapTx.in)
    if (!bmapTx.t.h){
        return null
    }
    if (bmapTx.MAP[0].type === "post"){
        const newPost = await prisma.post.create({
            data: {
                transaction: {
                    connectOrCreate: {
                        where: {
                            hash: bmapTx.tx.h
                        },
                        create: {
                            hash: bmapTx.tx.h
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
                            address: bmapTx.in[0].e.a
                        },
                        create: {
                            address: bmapTx.in[0].e.a
                        }
                    },
                },
                app: bmapTx.MAP[0].app ? bmapTx.MAP[0].app : null 
            },
            include: {
                transaction: true,
                postedBy: true
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
                            hash: bmapTx.tx.h
                        },
                        create: {
                            hash: bmapTx.tx.h
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
                            address: ""
                        },
                        create: {
                            address: ""
                        }
                    },
                },
                app: bmapTx.MAP[0].app ? bmapTx.MAP[0].app : null,
                channel: bmapTx.MAP[0].channel
            },
            include: {
                transaction: true,
                sentBy: true
            }
        })

        console.log(`ingest.message.response`, newMessage)
        response = newMessage
    }

    return response
}