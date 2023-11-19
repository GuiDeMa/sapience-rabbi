import { arg, extendType, inputObjectType, intArg, list, nonNull, objectType, stringArg } from "nexus";
import { Sort } from "./Sort";
import { Prisma } from "@prisma/client";
import { NewPostProps } from "./Post";
import { NewMessageProps } from "./Message";

export const Lock = objectType({
  name: "Lock",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("txid");
    t.nonNull.int("unixtime");
    t.nonNull.bigint("satoshis");
    t.nonNull.bigint("blockHeight");
    t.nonNull.float("vibes");
    t.string("app");
    t.nonNull.field("locker", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.lock.findUnique({ where: { txid: parent.txid } }).locker()
      }
    });
    t.nonNull.string("lockTargetByTxid");
    t.field("postLockTarget", {
      type: "Post",
      resolve(parent, args, context) {
        return context.prisma.lock.findFirst({ where: { lockTargetByTxid: parent.lockTargetByTxid}}).postLockTarget()
      }
    });
    t.field("MessageLockTarget", {
      type: "Message",
      resolve(parent, args, context) {
        return context.prisma.lock.findFirst({ where: { lockTargetByTxid: parent.lockTargetByTxid}}).messageLockTarget()
      }
    });  
  },
})

export const allLocks = objectType({
  name: "allLocks",
  definition(t) {
    t.nonNull.list.nonNull.field("locks", { type: "Lock" })
    t.nonNull.int("count")
    t.id("id")
  },
})

export const LockOrderByInput = inputObjectType({
  name: "LockOrderByInput",
  definition(t) {
    t.field("unixtime", { type: Sort })
  },
})

export const LockQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("allLocks", {
      type: "allLocks",
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(LockOrderByInput))})
      },
      async resolve(parent, args, context) {
        const where = {}
        const locks = await context.prisma.lock.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined,
          orderBy: args?.orderBy as | Prisma.Enumerable<Prisma.LockOrderByWithRelationInput> | undefined 
        })
        const count = await context.prisma.lock.count({ where })
        const id = `allLocks: ${JSON.stringify(args)}`

        return {
          locks,
          count,
          id
        }
      }
    })
  },
})

// TODO Ranking Query

interface NewLockProps {
  txid: string;
  unixtime: number;
  satoshis: number;
  blockHeight: number;
  lockTargetByTxid: string;
  postLockTarget?: NewPostProps;
  messageLockTarget?: NewMessageProps;
  lockerByUserAddress: string;
  lockerByUserPaymail?: string;
  app?: string;
}

export const LockMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("lock", {
      type: "Lock",
      args: {
        txid: nonNull(stringArg()),
        unixtime: nonNull(intArg()),
        satoshis: nonNull(intArg()),
        blockHeight: nonNull(intArg()),
        lockTargetByTxid: nonNull(stringArg()),
        lockerByUserAddress: nonNull(stringArg()),
        lockerByUserPaymail: stringArg(),
        app: stringArg()
      },
      async resolve(parent, args: NewLockProps, context) {
        const { txid, unixtime, satoshis, blockHeight, lockTargetByTxid, postLockTarget, messageLockTarget, lockerByUserAddress, lockerByUserPaymail, app } = args

        /* const { userId } = context;
        
        if (!userId) {
            throw new Error("Cannot post without logging in.");
        } */

        const vibes = satoshis * Math.log10(blockHeight)

        const newLock = context.prisma.lock.upsert({
          where: { txid },
          create: {
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
            unixtime,
            satoshis,
            vibes,
            blockHeight,
            app,
            postLockTarget: {
              connectOrCreate: {
                where: {
                  txid: lockTargetByTxid
                },
                create: {
                  txid: lockTargetByTxid,
                  unixtime: postLockTarget.unixtime,
                  content: postLockTarget.content,
                  contentType: postLockTarget.contentType,
                  inReplyToTx: postLockTarget.inReplyToTx,
                  app: postLockTarget.app,
                  postedByUserAddress: postLockTarget.postedByUserAddress,
                }
              }
            },
            messageLockTarget: {
              connectOrCreate: {
                where: {
                  txid: lockTargetByTxid
                },
                create: {
                  txid: lockTargetByTxid,
                  unixtime: messageLockTarget.unixtime,
                  content: messageLockTarget.content,
                  contentType: messageLockTarget.contentType,
                  inReplyToTx: messageLockTarget.inReplyToTx,
                  app: messageLockTarget.app,
                  channel: messageLockTarget.app,
                  sentByUserAddress: messageLockTarget.sentByUserAddress
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
          },
          update: {}
        })

        return newLock
      }
    })
  },
})