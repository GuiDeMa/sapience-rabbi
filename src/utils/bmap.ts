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
    
    try {
        
        const newPost = await prisma.post.upsert({
            where: { txid },
            create: {
                txid,
                unixtime: bmapTx.blk ? bmapTx.blk.t : new Date().getTime() / 1000,
                content: bmapTx.B[0].content,
                type: bmapTx.MAP[0].type,
                contentType: bmapTx.B[0]["content-type"],
                inReplyTo: bmapTx.MAP[0].tx ? {
                    connect: {
                        txid: bmapTx.MAP[0].tx
                    }
                } : {},
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
                app: bmapTx.MAP[0].app ? bmapTx.MAP[0].app : null, 
                channel: bmapTx.MAP[0].channel ? bmapTx.MAP[0].channel : null
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

    return response
}