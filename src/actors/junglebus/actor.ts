import { JungleBusClient } from '@gorillapool/js-junglebus'
import { crawler, setCurrentBlock } from '../../crawler'
import { getCurrentBlock } from '../../state'
const chalk = require("chalk")

export async function start() {
    
    try {

        let currentBlock = await getCurrentBlock()
        setCurrentBlock(currentBlock)
        console.log(chalk.cyan('crawling from', currentBlock))
        
        const s = 'junglebus.gorillapool.io'
        console.log('CRAWLING', s)

        const jungleBusClient = new JungleBusClient(s, {
            debug: true,
            protocol: 'protobuf',
            onConnected(ctx) {
                console.log({ status: 'connected', ctx })
            },
            onConnecting(ctx) {
                console.log({ status: 'connecting', ctx })
            },
            onDisconnected(ctx) {
                console.log({ status: 'disconnected', ctx })
            },
            onError(ctx) {
                console.log({ status: 'error', ctx })
            },
        })

        await crawler(jungleBusClient)

    } catch (error) {
        
    }
}

if (require.main === module){
    
    start()

}