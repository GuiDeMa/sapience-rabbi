import { objectType } from "nexus";

export const Message = objectType({
  name: "Message",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("txid");
    t.nonNull.string("channel")
    t.nonNull.dateTime("createdAt");
    t.nonNull.string("content");
    t.nonNull.string("contentType");
    t.string("inReplyTo");
    t.string("app");
    t.field("sentBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.message.findUnique({ where: { txid: parent.txid } })
      }
    })
    
  },
})