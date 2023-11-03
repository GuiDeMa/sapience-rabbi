import { objectType } from "nexus";

export const Transaction= objectType({
    name: "Transaction",
    definition (t) {
        t.nonNull.int("id")
        t.nonNull.string("hash")
        t.int("block")
        t.nonNull.list.field("locks", {
            type: "Lock",
            resolve(parent, args, context) {
                return context.prisma.transaction.findUnique({ where: { hash: parent.hash } })
            }
        })
        t.field("post", {
            type: "Post",
            resolve(parent, args, context) {
                return context.prisma.transaction.findUnique({ where: { hash: parent.hash } }).Post()
            }
        })
        t.field("message", {
            type: "Message",
            resolve(parent, args, context) {
                return context.prisma.transaction.findUnique({ where: { hash: parent.hash } }).Message()
            }
        })
        t.field("lock", {
            type: "Lock",
            resolve(parent, args, context) {
                return context.prisma.transaction.findUnique({ where: { hash: parent.hash } }).Lock()
            }
        })
    }
})