import { resolve } from "url"
import { prisma } from "./context"
import { config } from "./jungleBusConfig";

const getCurrentBlock = (): Promise<number> => {
    return new Promise(async (resolve, reject) => {
      try {
        const currentBlock = await prisma.block.findFirst({
          orderBy: { height: 'desc' },
          select: { height: true },
        });
        if (currentBlock) {
            resolve(currentBlock?.height);
        } else {
            resolve(config.from)
        }
      } catch (e) {
        console.error('Failed to get current block', e);
        reject(e);
      }
    });
  };

export { getCurrentBlock }