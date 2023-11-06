import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";

export const Lock = objectType({
  name: "Lock",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("txid");
    t.nonNull.dateTime("createdAt");
    t.nonNull.bigint("satoshis");
    t.nonNull.int("blockHeight");
    t.string("app");
    t.string("paymail");
    t.nonNull.field("locker", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.lock.findUnique({ where: { txid: parent.txid } }).locker()
      }
    })
    t.nonNull.string("lockTargetByTxid")
    t.field("lockTarget", {
      type: "Transaction",
      resolve(parent, args, context) {
        return context.prisma.lock.findFirst({ where: { lockTargetByTxid: parent.lockTargetByTxid}}).lockTarget()
      }
    }) 
  },
})

// TODO Ranking Query

interface NewLockProps {
  txid: string;
  createdAt: string;
  satoshis: number;
  blockHeight: number;
  lockTargetByTxid: string;
  lockerByUserAddress: string;
  lockerByUserPaymail: string;
}

export const LockMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("lock", {
      type: "Lock",
      args: {
        txid: nonNull(stringArg()),
        createdAt: stringArg(),
        satoshis: nonNull(intArg()),
        blockHeight: nonNull(intArg()),
        lockTargetByTxid: nonNull(stringArg()),
        lockerByUserAddress: nonNull(stringArg())
      },
      async resolve(parent, args: NewLockProps, context) {
        const { txid, createdAt, satoshis, blockHeight, lockTargetByTxid, lockerByUserAddress, lockerByUserPaymail } = args

        /* const { userId } = context;
        
        if (!userId) {
            throw new Error("Cannot post without logging in.");
        } */

        const newLock = context.prisma.lock.create({
          data: {
            transaction: {
              connectOrCreate: {
                where: {
                  hash: txid
                },
                create: {
                  hash: txid
                }
              },
            },
            createdAt,
            satoshis,
            blockHeight,
            lockTarget: {
              connectOrCreate: {
                where: {
                  hash: lockTargetByTxid
                },
                create: {
                  hash: lockTargetByTxid
                }
              }
            },
            locker: {
              connectOrCreate: {
                where: {
                  address: lockerByUserAddress
                },
                create: {
                  address: lockerByUserAddress,
                  paymail: lockerByUserPaymail
                }
              }
            }
          }
        })
      }
    })
  },
})