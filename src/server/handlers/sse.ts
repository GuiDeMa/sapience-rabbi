import { Actor, log } from 'rabbi'
const PassThrough = require('stream').PassThrough;

export const stream = new PassThrough({ objectMode: true })

export async function locks (request, h) {

    return h.event(stream, null, { event: 'lock' })
}

export async function blocks (request, h) {

    return h.event(stream, null, { event: 'block' })
}