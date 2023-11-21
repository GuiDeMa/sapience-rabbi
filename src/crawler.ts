import { ControlMessageStatusCode, JungleBusClient, Transaction } from "@gorillapool/js-junglebus";
import chalk from 'chalk'
import { BmapTx, BobTx } from 'bmapjs/types/common.js'
import { parse } from 'bpu-ts'
import { rewind, saveBlock, saveTx } from "./actions";
const bsv = require('bsv')
const { connect } = require('amqplib')

const LOCKUP_PREFIX = `2097dfd76851bf465e8f715593b217714858bbe9570ff3bd5e33840a34e20ff0262102ba79df5f8ae7604a9830f03c7933028186aede0675a16f025dc4f8be8eec0382201008ce7480da41702918d1ec8e6849ba32b4d65b1e40dc669c31a1e6306b266c`;
const LOCKUP_SUFFIX = `610079040065cd1d9f690079547a75537a537a537a5179537a75527a527a7575615579014161517957795779210ac407f0e4bd44bfc207355a778b046225a7068fc59ee7eda43ad905aadbffc800206c266b30e6a1319c66dc401e5bd6b432ba49688eecd118297041da8074ce081059795679615679aa0079610079517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01007e81517a75615779567956795679567961537956795479577995939521414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff00517951796151795179970079009f63007952799367007968517a75517a75517a7561527a75517a517951795296a0630079527994527a75517a6853798277527982775379012080517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01205279947f7754537993527993013051797e527e54797e58797e527e53797e52797e57797e0079517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a756100795779ac517a75517a75517a75517a75517a75517a75517a75517a75517a7561517a75517a756169557961007961007982775179517954947f75517958947f77517a75517a756161007901007e81517a7561517a7561040065cd1d9f6955796100796100798277517951790128947f755179012c947f77517a75517a756161007901007e81517a7561517a756105ffffffff009f69557961007961007982775179517954947f75517958947f77517a75517a756161007901007e81517a7561517a75615279a2695679a95179876957795779ac7777777777777777`

let currentBlock = 0
let synced = false

var amqp

async function startAmqp() {

    const connection = await connect(process.env.amqp_url)

    amqp = await connection.createChannel()

    await amqp.assertExchange('sapience')
}

startAmqp()

const bobFromRawTx = async (rawtx: string) => {
    return await parse({
        tx: { r: rawtx },
        split: [
            {
                token: { op: 106 },
                include: 'l',
            },
            {
                token: { s: '|' },
            }
        ]
    })
}

const crawl = (height: number, jungleBusClient: JungleBusClient) => {
    return new Promise(async (resolve, reject) => {

        const subId = process.env.JUNGLEBUS_SUBSCRIPTION_ID || ""
        await jungleBusClient.Subscribe(
            subId,
            height,
            async function onPublish(ctx) {
                amqp.publish('sapience', 'new.block.transaction', Buffer.from(JSON.stringify(ctx)))
                try {
                    await processTransaction(ctx)
                } catch (error) {
                    console.log(chalk.redBright('Failed to process block tx', error))
                }
            },
            async function onStatus(cMsg) {
                if (cMsg.statusCode === ControlMessageStatusCode.BLOCK_DONE){
                    await saveBlock(cMsg.block)
                    amqp.publish('sapience', 'new.block.synced', Buffer.from(JSON.stringify(cMsg)))
                    
                    setCurrentBlock(cMsg.block)

                    console.log(
                        chalk.blue('####  '),
                        chalk.magenta('NEW BLOCK '),
                        chalk.green(currentBlock),
                        cMsg.transactions > 0
                          ? chalk.bgCyan(cMsg.transactions)
                          : chalk.bgGray('No transactions this block')
                    )
                } else if (cMsg.statusCode === ControlMessageStatusCode.WAITING) {
                    console.log(
                        chalk.blue('####  '),
                        chalk.yellow('WAITING ON NEW BLOCK ')
                    )
                    synced = true
                } else if (cMsg.statusCode === ControlMessageStatusCode.REORG) {
                    console.log(
                        chalk.blue('####  '),
                        chalk.red('REORG TRIGGERED ', cMsg.block)
                    )

                    await rewind(cMsg.block)
                    setCurrentBlock(cMsg.block)
                } else {
                    chalk.red(cMsg)
                }

            },
            function onError(cErr) {
                console.error(cErr)
                reject(cErr)
            },
            async function onMempool(ctx) {
                console.log('MEMPOOL TRANSACTION', ctx.id)
                amqp.publish('sapience', 'mempool.transaction.discovered', Buffer.from(JSON.stringify(ctx)))
                try {
                    await processTransaction(ctx)
                } catch (error) {
                    console.log(chalk.redBright('Failed to process mempool tx', error))
                }
            }
        )
    })
}

const crawler = async (jungleBusClient: JungleBusClient) => {

    chalk.cyan('CRAWLING FROM BLOCK HEIGHT', currentBlock)

    await crawl(currentBlock, jungleBusClient).catch((e) => {
        console.log('ERROR', e)
    })
}

const changeEndianness = string => {// change endianess of hex value before placing into ASM script
    const result = [];
    let len = string.length - 2;
    while (len >= 0) {
        //@ts-ignore
      result.push(string.substr(len, 2));
      len -= 2;
    }
    return result.join('');
}
const hex2Int = hex => {
    const reversedHex = changeEndianness(hex);
    return parseInt(reversedHex, 16);
}

export interface LockDataProps {
    address: string;
    satoshis: number;
    lockUntilHeight: number
}

function detectLockupFromTxHex(txhex) {
    const tx = new bsv.Transaction(txhex)

    let lockupData: LockDataProps | null  = null

    for (let i = 0; i < tx.outputs.length; i++) {
        let output = tx.outputs[i]
        if (output.script.toHex().startsWith(LOCKUP_PREFIX) && output.script.toHex().endsWith(LOCKUP_SUFFIX)){
            const hexAddr = output.script.chunks[5]?.buf.toString("hex")
            const script = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${hexAddr} OP_EQUALVERIFY OP_CHECKSIG`)
            const address = bsv.Address.fromScript(script).toString()
            const hexBlock = output.script.chunks[6].buf.toString("hex")
            const lockUntilHeight = hex2Int(hexBlock)
            const satoshis = Number(output.satoshis)
            lockupData = {
                address,
                satoshis,
                lockUntilHeight
            }
            break;
        }
    }

    return lockupData 
    
}

export async function processTransaction(ctx: Partial<Transaction>) {
    let result: Partial<BobTx>
    
    try {
        
        result = (await bobFromRawTx(ctx.transaction!)) as Partial<BmapTx>
        
        result.blk = {
            i: ctx.block_height || 0,
            t: ctx.block_time || Math.round(new Date().getTime() / 1000)
        }
        
        if(!ctx.block_hash) {
            result.timestamp = ctx.block_time || Math.floor(new Date().getTime() / 1000 - 86400)
        }
        
    } catch (e) {
        console.error('Failed to bob tx', e)
        return null
    }
    
    try {
        const lockupData = detectLockupFromTxHex(ctx.transaction)
        return await saveTx(result as BobTx, lockupData!)
    } catch (e) {

        console.error('Failed to save tx', e)
        return null
        
    }

    

}

const setCurrentBlock = (num: number) => {
    currentBlock = num
}

export { setCurrentBlock, synced, crawler }