import bmapjs, { bobFromRawTx } from 'bmapjs'
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

const saveTx = async (tx: BobTx, lockupData?: LockDataProps) => {
    let t: any

    // Transform
    try {
        t = await TransformTx(tx)
    } catch (e) {
        throw new Error("Failed to transform tx " + tx)
    }

    if(t) {
        let txid = tx && tx.tx ? tx.tx.h : undefined
        if (t.MAP[0].type === "post" || t.MAP[0].type === "message") {
            try {
                if(t.MAP[0].tx){
                    const replyRecord = await prisma.post.findUnique({ where: { txid: t.MAP[0].tx }})
                    if(!replyRecord){
                        const replyTxHex = await fetchTransaction({ txid: t.MAP[0].tx })
                        const replyTxBob = await bobFromRawTx(replyTxHex)
                        await saveTx(replyTxBob)
                    }
                }
                const newPost = await prisma.post.upsert({
                    where: { txid },
                    create: {
                        txid,
                        blockHeight: t.blk ? t.blk.i === 0 ? null: t.blk.i : null,
                        unixtime: t.blk ? t.blk.t : new Date().getTime() / 1000,
                        type: t.MAP[0].type,
                        content: t.B[0].content,
                        contentType: t.B[0]["content-type"],
                        inReplyTo: t.MAP[0].tx ? { connect: { txid: t.MAP[0].tx }} : {},
                        postedByUserAddress: t.in[0].e.a,
                        postedByUserPaymail: t.MAP[0].paymail ? t.MAP[0].paymail : null,
                        app: t.MAP[0].app ? t.MAP[0].app : null,
                        channel: t.MAP[0].channel ? t.MAP[0].channel : null
                    },
                    update: {
                        blockHeight: t.blk.i,
                    }
                })
                console.log("new.post.created", newPost)
            } catch (e) {
                throw new Error('Failed to ingest post ' + txid + ' : ' + e)
            }
        }
        if (lockupData) {
            if(t.MAP[0].type === "like"){
                const likeTxRecord = await prisma.post.findUnique({ where: { txid: t.MAP[0].tx }})
                if(!likeTxRecord){
                    const likeTxHex = await fetchTransaction({ txid: t.MAP[0].tx })
                    const likeTxBob = await bobFromRawTx(likeTxHex)
                    await saveTx(likeTxBob)
                }
            }
            try {
                const newLock = await prisma.lock.upsert({
                    where: { txid },
                    create: {
                        txid,
                        blockHeight: t.blk ? t.blk.i === 0 ? null: t.blk.i : null,
                        satoshis: lockupData.satoshis,
                        lockUntilHeight: lockupData.lockUntilHeight,
                        vibes: lockupData.satoshis * Math.log10(lockupData.lockUntilHeight),
                        unixtime: t.blk ? t.blk.t : new Date().getTime() / 1000,
                        app: t.MAP[0].app,
                        lockTarget: { connect: { txid: t.MAP[0].type === "like" ? t.MAP[0].tx : txid }},
                        lockerByUserAddress: t.in[0].e.a,
                        lockerByUserPaymail: t.MAP[0].paymail ? t.MAP[0].paymail : null
                    },
                    update: {
                        blockHeight: t.blk.i,
                    }
                })
                console.log("new.lock.created", newLock)
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