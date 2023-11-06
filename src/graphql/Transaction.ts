import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";

export const Transaction= objectType({
    name: "Transaction",
    definition (t) {
        t.nonNull.int("id")
        t.nonNull.string("hash")
        t.int("block")
        t.nonNull.list.field("locks", {
            type: "Lock",
            resolve(parent, args, context) {
                return context.prisma.transaction.findUnique({ where: { hash: parent.hash } }).locks()
            }
        })
        t.field("post", {
            type: "Post",
            resolve(parent, args, context) {
                return context.prisma.transaction.findUnique({ where: { hash: parent.hash } }).post()
            }
        })
        t.field("message", {
            type: "Message",
            resolve(parent, args, context) {
                return context.prisma.transaction.findUnique({ where: { hash: parent.hash } }).message()
            }
        })
        t.field("lock", {
            type: "Lock",
            resolve(parent, args, context) {
                return context.prisma.transaction.findUnique({ where: { hash: parent.hash } }).lock()
            }
        })
    }
})

interface NewTransactionProps {
    hash: string;
    block?: number;
}

export const TransactionMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("transaction", {
            type: "Transaction",
            args: {
                hash: nonNull(stringArg()),
                block: intArg()
            },
            async resolve(parent, args: NewTransactionProps, context) {
                const { hash, block } = args

                /* const { userId } = context;
        
                if (!userId) {
                    throw new Error("Cannot post without logging in.");
                } */

                const newTransaction = context.prisma.transaction.create({
                    data: {
                        hash,
                        block,
                    }
                    
                })

                return newTransaction
            }
        })
    },
})