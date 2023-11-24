import { arg, extendType, inputObjectType, intArg, list, nonNull, objectType, stringArg } from "nexus";
import { Sort } from "./Sort";
import { Prisma } from "@prisma/client";
import { NewPostProps } from "./Post";

export const Lock = objectType({
  name: "Lock",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("txid");
    t.int("blockHeight");
    t.nonNull.int("unixtime");
    t.nonNull.bigint("satoshis");
    t.nonNull.bigint("blockHeight");
    t.nonNull.float("vibes");
    t.string("app");
    t.nonNull.string('lockTargetByTxid')
    t.nonNull.string('lockerByUserAddress')
    t.string("lockerByPaymail")
    t.nonNull.field("locker", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.lock.findUnique({ where: { txid: parent.txid } }).locker()
      }
    });
    t.field("lockTarget", {
      type: "Post",
      resolve(parent, args, context) {
        return context.prisma.lock.findFirst({ where: { lockTargetByTxid: parent.lockTargetByTxid}}).lockTarget()
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
  blockHeight: number;
  unixtime: number;
  satoshis: number;
  lockUntilHeight: number;
  lockTargetByTxid: string;
  //lockTarget?: NewPostProps;
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
        blockHeight: intArg(),
        unixtime: nonNull(intArg()),
        satoshis: nonNull(intArg()),
        lockUntilHeight: nonNull(intArg()),
        lockTargetByTxid: nonNull(stringArg()),
        lockerByUserAddress: nonNull(stringArg()),
        lockerByUserPaymail: stringArg(),
        app: stringArg()
      },
      async resolve(parent, args: NewLockProps, context) {
        const { txid, blockHeight, unixtime, satoshis, lockUntilHeight, lockTargetByTxid, lockerByUserAddress, lockerByUserPaymail, app } = args

        /* const { userId } = context;
        
        if (!userId) {
            throw new Error("Cannot post without logging in.");
        } */

        const vibes = satoshis * Math.log10(blockHeight)

        const newLock = context.prisma.lock.upsert({
          where: { txid },
          create: {
            txid,
            blockHeight,
            unixtime,
            satoshis,
            vibes,
            lockUntilHeight,
            app,
            lockTarget: {
              connect: lockTargetByTxid
            },
            lockerByUserAddress,
            lockerByUserPaymail
          },
          update: {
            blockHeight
          }
        })

        return newLock
      }
    })
  },
})