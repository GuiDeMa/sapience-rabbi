import bmapjs from 'bmapjs'
import { BobTx } from 'bmapjs/types/common.js'
import { prisma } from './context'
import { LockDataProps } from './crawler'
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
                        paymail: t.MAP[0].paymail
                    },
                    create: {
                        address: t.in[0].e.a,
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
                        } : null,
                        postedBy: {
                            connect: {
                                address: t.in[0].e.a,
                                paymail: t.MAP[0].paymail
                            }
                        },
                        app: t.MAP[0].app ? t.MAP[0].app : null,
                        channel: t.MAP[0].channel ? t.MAP[0].channel : null
                    },
                    update: {
                        blockHeight: t.blk
                    }
                })
            } catch (e) {
                throw new Error('Failed to ingest post ' + txid + ' : ' + e)
            }
        }
        if (lockupData) {
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
                            connect: {
                                txid: t.MAP[0].type === "like" ? t.MAP[0].tx : txid
                            }
                        },
                        locker: {
                            connect: {
                                address: t.in[0].e.a
                            }
                        }
                    },
                    update: {
                        blockHeight: t.blk
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