import { objectType } from "nexus";

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.string("address")
    t.nonNull.string("paymail")
    t.nonNull.list.nonNull.field("posts", {
      type: "Post",
      resolve(parent, args, context) {
        return context.prisma.user.findUnique({ where: { paymail : parent.paymail } }).posts()
      }
    })
    t.nonNull.list.nonNull.field("messages", {
      type: "Message",
      resolve(parent, args, context) {
        return context.prisma.user.findUnique({ where: { paymail: parent.paymail }})
      }
    })
    t.nonNull.list.nonNull.field("locks", { 
      type: "Lock",
      resolve(parent, args, context) {
        return context.prisma.user.findUnique({ where: { address: parent.address } })
      }
    })
  },
})