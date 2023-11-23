import bmapjs from 'bmapjs'
import { BobTx } from 'bmapjs/types/common.js'
import { prisma } from './context'
import { LockDataProps } from './crawler'
import { fetchTransaction } from './utils/whatsonchain'
const { TransformTx } = bmapjs

const saveBlock = (block: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newBlock = await prisma.block.upsert({
                where: { height: block },
                update: { height: block },
                create: { height: block }
            })
            resolve(newBlock)
        } catch (error) {
            console.error("Failed to save block", error)
            reject(error)
        }
    })
}

const saveTx = async (tx: BobTx, lockupData: LockDataProps) => {
    let t: any

    // Transform
    try {
        t = await TransformTx(tx)
    } catch (e) {
        throw new Error("Failed to transform tx " + tx)
    }

    if(t) {
        let txid = tx && tx.tx ? tx.tx.h : undefined
        if (t.MAP[0].paymail){
            try {
                const newUser = await prisma.user.upsert({
                    where: {
                        address: t.in[0].e.a,
                    },
                    create: {
                        address: t.in[0].e.a,
                        paymail: t.MAP[0].paymail
                    },
                    update: {
                        paymail: t.MAP[0].paymail
                    }
                })
            } catch (e) {
                throw new Error('Failed to ingest user ' + t.MAP[0].paymail + " : " + e )
            }
        }
        if (t.MAP[0].type === "post" || t.MAP[0].type === "message") {
            try {
                
                const newPost = await prisma.post.upsert({
                    where: { txid },
                    create: {
                        txid,
                        blockHeight: t.blk ? t.blk.i : null,
                        unixtime: t.blk ? t.blk.t : new Date().getTime() / 1000,
                        type: t.MAP[0].type,
                        content: t.B[0].content,
                        contentType: t.B[0]["content-type"],
                        inReplyTo: t.MAP[0].tx ? {
                            connect: {
                                txid: t.MAP[0].tx
                            }
                        } : {},
                        postedBy: {
                            connectOrCreate: {
                                where: {
                                    address: t.in[0].e.a
                                },
                                create: {
                                    address: t.in[0].e.a,
                                    paymail: t.MAP[0].paymail
                                }
                            }
                        },
                        app: t.MAP[0].app ? t.MAP[0].app : null,
                        channel: t.MAP[0].channel ? t.MAP[0].channel : null
                    },
                    update: {
                        blockHeight: t.blk.i,
                        postedBy: {
                            connectOrCreate: {
                                where: {
                                    address: t.in[0].e.a
                                },
                                create: {
                                    address: t.in[0].e.a,
                                    paymail: t.MAP[0].paymail
                                }
                            }
                        }
                    }
                })
            } catch (e) {
                throw new Error('Failed to ingest post ' + txid + ' : ' + e)
            }
        }
        if (lockupData) {
            let targetTx = t
            if (t.MAP[0].type === "like"){
                const newTargetHex = await fetchTransaction({ txid: targetTx.MAP[0].tx })
                targetTx = await TransformTx(newTargetHex)
            } 
            try {
                const newLock = await prisma.lock.upsert({
                    where: { txid },
                    create: {
                        txid,
                        blockHeight: t.blk ? t.blk.i : null,
                        satoshis: lockupData.satoshis,
                        lockUntilHeight: lockupData.lockUntilHeight,
                        vibes: lockupData.satoshis * Math.log10(lockupData.lockUntilHeight),
                        unixtime: 0,
                        app: t.MAP[0].app ? t.MAP[0].app : null,
                        lockTarget: {
                            connectOrCreate: {
                                where: { txid: targetTx.tx.h },
                                create: {
                                    txid: targetTx.tx.h,
                                    blockHeight: targetTx.blk ? targetTx.blk.i : null,
                                    unixtime: targetTx.blk ? targetTx.blk.t : new Date().getTime() / 1000,
                                    type: targetTx.MAP[0].type,
                                    content: targetTx.B[0].content,
                                    contentType: targetTx.B[0]["content-type"],
                                    inReplyTo: targetTx.MAP[0].tx ? {
                                        connect: { txid: targetTx.MAP[0].tx }
                                    } : {},
                                    postedBy: {
                                        connectOrCreate: {
                                            where: {
                                                address: targetTx.in[0].e.a
                                            },
                                            create: {
                                                address: targetTx.in[0].e.a,
                                                paymail: targetTx.MAP[0].paymail
                                            }
                                        }
                                    },
                                    app: targetTx.MAP[0].app,
                                    channel: targetTx.MAP[0].channel
                                }
                            },
                        },
                        locker: {
                            connectOrCreate: {
                                where: {
                                    address: t.in[0].e.a
                                },
                                create: {
                                    address: t.in[0].e.a,
                                    paymail: t.MAP[0].paymail
                                }
                            }
                        }
                    },
                    update: {
                        blockHeight: t.blk.i,
                        locker: {
                            connectOrCreate: {
                                where: {
                                    address: t.in[0].e.a
                                },
                                create: {
                                    address: t.in[0].e.a,
                                    paymail: t.MAP[0].paymail
                                }
                            }
                        }
                    }
                })
            } catch (e) {
                throw new Error('Failed to ingest lock ' + txid + ' : ' + e)
            }
        }
    } else {
        throw new Error('Invalid tx')
    }
}

const rewind = async (block: number) => {
    try {
        const rewinds = await Promise.all([
            prisma.block.deleteMany({ where: { height: { gte: block } } }),
            prisma.post.deleteMany({ where: { blockHeight: { gte: block } } }),
            prisma.lock.deleteMany({ where: { blockHeight: { gte: block } } })
        ])
    } catch (error) {
        console.error(`Failed to rewind to block ${block}`, error)
    }

    await clearUnconfirmed()
}

const clearUnconfirmed = async () => {
    try {
        const unconfirmedCleared = await Promise.all([
            prisma.post.deleteMany({ where: { blockHeight: null }}),
            prisma.lock.deleteMany({ where: { blockHeight: null }})
        ])
        
    } catch (error) {
        console.error('Failed to clear unconfirmed records due to reorg', error)
    }
}

export { saveTx, saveBlock, rewind }