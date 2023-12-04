import { Actor, log } from 'rabbi'
const PassThrough = require('stream').PassThrough;

export const stream = new PassThrough({ objectMode: true })

export async function mempool (request, h) {
    Actor.create({
        exchange: 'sapience',
        routingkey: 'bsv.spv.mempool',
        queue:"bsv.spv.mempool.processed"
    })
    .start(async (channel, msg, json) => {
        const { transaction, size } = json
        stream.write({ data: { transaction, size } })
    })
    
    return h.event(stream, null, { event: 'bsv.mempool' })
}

export async function block (request, h) {
    Actor.create({
        exchange: 'sapience',
        routingkey: 'bsv.spv.block',
        queue: 'bsv.spv.block.processed'
    })
    .start(async (channel, msg, json) => {
        const {
            header,
            started,
            finished,
            size,
            height,
            txCount,
            transactions,
            startDate,
        } = json
        stream.write({ data: {
            header,
            started,
            finished,
            size,
            height,
            txCount,
            transactions,
            startDate,
        }})
    })

    return h.event(stream, null, { event: 'bsv.block' })
}

export async function reorg (request, h) {
    Actor.create({
        exchange: 'sapience',
        routingkey: 'bsv.spv.reorg',
        queue:"bsv.spv.reorg.processed"
    })
    .start(async (channel, msg, json) => {
        const { height, hash } = json
        stream.write({ data: { height, hash } })
    })
    
    return h.event(stream, null, { event: 'bsv.reorg' })
}