const { TransformTx, bobFromRawTx }  = require('bmapjs')
import { add } from "winston"
import { prisma } from "../context"
import { fetchTransaction } from "./whatsonchain"

export async function bmapParseTransaction(txhex: string){
    const bob = await bobFromRawTx(txhex)
    const bmapTx = await TransformTx(bob)

    return bmapTx
}

export async function ingestBmapTransaction(bmapTx) {
    let response = null
    const txid = bmapTx.tx.h
    const address = bmapTx.in[0].e.a
    const paymail = bmapTx.MAP[0].paymail
    
    if (bmapTx.MAP[0].context === "tx"){
        const replyTxid = bmapTx.MAP[0].tx
        const replyTxHex = await fetchTransaction({txid: replyTxid})
        const replyBmapTx = await bmapParseTransaction(replyTxHex)
        await ingestBmapTransaction(replyBmapTx)
    }
    //console.log(bmapTx)
    if (bmapTx.MAP[0].type === "post"){
        try {
            
            const newPost = await prisma.post.upsert({
                where: { txid },
                create: {
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
                    unixtime: bmapTx.blk ? bmapTx.blk.t : new Date().getTime() / 1000,
                    content: bmapTx.B[0].content,
                    contentType: bmapTx.B[0]["content-type"],
                    inReplyToPost: {
                        connect: {
                            txid: bmapTx.MAP[0].tx
                        }
                    },
                    postedBy: {
                        connectOrCreate: {
                            where: {
                                address: address
                            },
                            create: {
                                address,
                                paymail
                            }
                        },
                    },
                    app: bmapTx.MAP[0].app ? bmapTx.MAP[0].app : null 
                },
                update: {
                    postedBy: {
                        connectOrCreate: {
                            where: {
                                address: address
                            },
                            create: {
                                address,
                                paymail
                            }
                        },
                    }
                }
            })
            console.log(`ingest.post.response`, newPost)
            response = newPost
        } catch (error) {
            console.log("ingest.post.error", error)
        }
    } else if (bmapTx.MAP[0].type === "message"){
        try {
            const newMessage = await prisma.message.upsert({
                where: { txid },
                create: {
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
                    unixtime: bmapTx.blk ? bmapTx.blk.t : new Date().getTime() / 1000,
                    content: bmapTx.B[0].content,
                    contentType: bmapTx.B[0]["content-type"],
                    inReplyToMessage: {
                        connect: {
                            txid: bmapTx.MAP[0].tx
                        }
                    },
                    sentBy: {
                        connectOrCreate: {
                            where: {
                                address: address
                            },
                            create: {
                                address,
                                paymail
                            }
                        },
                    },
                    app: bmapTx.MAP[0].app ? bmapTx.MAP[0].app : null,
                    channel: bmapTx.MAP[0].channel
                },
                update: {
                    sentBy: {
                        connectOrCreate: {
                            where: {
                                address: address
                            },
                            create: {
                                address,
                                paymail
                            }
                        },
                    }
                }
            })
    
            console.log(`ingest.message.response`, newMessage)
            response = newMessage
        } catch (error) {
            console.log("ingest.message.error", error)
        }
        
    }

    return response
}