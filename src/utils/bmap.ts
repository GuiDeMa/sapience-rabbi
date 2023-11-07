const { TransformTx, bobFromRawTx }  = require('bmapjs')

export async function bmapParseTransaction(txhex: string){
    const bob = await bobFromRawTx(txhex)
    const bmapTx = await TransformTx(bob)

    return bmapTx
}