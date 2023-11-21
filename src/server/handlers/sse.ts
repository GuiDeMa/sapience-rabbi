import { Actor, log } from 'rabbi'
const PassThrough = require('stream').PassThrough;

export const stream = new PassThrough({ objectMode: true })

export async function mempool (request, h) {
    Actor.create({
        exchange: 'sapience',
        routingkey: 'mempool.transaction.discovered',
        queue:"sse.mempool.transaction"
    })
    .start(async (channel, msg, json) => {
        const { id, block_hash, block_height, block_index, block_time, transaction, merkle_proof } = json
        stream.write({ data: { id, block_hash, block_height, block_index, block_time, transaction, merkle_proof } })
    })
    
    return h.event(stream, null, { event: 'mempoolTx' })
}

export async function blocks (request, h) {
    Actor.create({
        exchange: 'sapience',
        routingkey: 'new.block.synced',
        queue: 'sse.block.synced'
    })
    .start(async (channel, msg, json) => {
        const { statusCode, status, message, block, transactions } = json
        stream.write({ data: { statusCode, status, message, block, transactions } })
    })

    Actor.create({
        exchange: 'sapience',
        routingkey: 'new.block.transaction',
        queue: 'sse.block.transaction'
    })
    .start(async (channel, msg, json) => {
        const { id, block_hash, block_height, block_index, block_time, transaction, merkle_proof } = json
        stream.write({ data: { id, block_hash, block_height, block_index, block_time, transaction, merkle_proof } })
    })

    return h.event(stream, null, { event: 'block' })
}