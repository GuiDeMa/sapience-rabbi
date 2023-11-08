import { Actor, log } from 'rabbi'
const PassThrough = require('stream').PassThrough;

export const stream = new PassThrough({ objectMode: true })

export async function events (request, h) {

    stream.write({ message: "init sse"})

    return h.event(stream, null, { event: 'lock' })
    //return h.event({ data: { txid, lockup, lock_vout, hex } });
}