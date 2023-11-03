import { objectType } from "nexus";

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