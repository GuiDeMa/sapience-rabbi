import { extendType, intArg, nonNull, objectType } from "nexus";

export const Block = objectType({
    name: "Block",
    definition(t) {
        t.nonNull.int("id")
        t.nonNull.int("height")
    },
})

export const BlockMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("block", {
            type: "Block",
            args: {
                height: nonNull(intArg())
            },
            resolve(parent, args, context) {
                const newBlock = context.prisma.block.upsert({
                    where: {
                        height: args.height
                    },
                    update: {
                        height: args.height
                    },
                    create: {
                        height: args.height
                    }
                })

                return newBlock
            }
        })
    },
})