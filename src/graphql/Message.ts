import { enumType, extendType, inputObjectType, intArg, arg, list, nonNull, objectType, stringArg } from "nexus";
import { Sort } from "./Sort";
import { Prisma } from "@prisma/client";

export const Message = objectType({
  name: "Message",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("txid");
    t.nonNull.string("channel")
    t.nonNull.int("unixtime");
    t.nonNull.string("content");
    t.nonNull.string("contentType");
    t.string("inReplyTo");
    t.string("app");
    t.field("sentBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.message.findUnique({ where: { txid: parent.txid } }).sentBy()
      }
    })
  },
})

export const allMessages = objectType({
  name: "allMessages",
  definition(t) {
    t.nonNull.list.nonNull.field("messages", { type: "Message" })
    t.nonNull.int("count")
    t.id("id")
  },
})

export const MessageOrderByInput = inputObjectType({
  name: "MessageOrderByInput",
  definition(t) {
    t.field("unixtime", { type: Sort })
  },
})

export const MessageQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("allMessages", {
      type: "allMessages",
      args: {
        channel: nonNull(stringArg()),
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(MessageOrderByInput))})
      },
      async resolve(parent, args, context) {
        const where = { channel: args.channel } // TODO add filter
        const messages = await context.prisma.message.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | number,
          orderBy: args?.orderBy as
          | Prisma.Enumerable<Prisma.MessageOrderByWithRelationInput>
          | undefined,
        })
        const count = await context.prisma.message.count({ where })
        const id=`allMessages: ${JSON.stringify(args)}`

        return {
          messages,
          count,
          id
        }
      }
    })
  },
})

interface NewMessageProps {
  txid: string;
  unixtime: number;
  content: string;
  contentType: string;
  inReplyTo?: string;
  sentByUserAddress: string;
  sentByUserPaymail?: string;
  app?: string;
  channel: string;
}

export const MessageMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("message", {
      type: "Message",
      args: {
        txid: nonNull(stringArg()),
        unixtime: nonNull(intArg()),
        content: nonNull(stringArg()),
        contentType: nonNull(stringArg()),
        inReplyTo: stringArg(),
        sentByUserAddress: nonNull(stringArg()),
        sentByUserPaymail: stringArg(),
        app: stringArg(),
        channel: nonNull(stringArg())
      },
      async resolve(parent, args: NewMessageProps, context) {
        const { txid, unixtime, content, contentType, inReplyTo, sentByUserAddress, sentByUserPaymail, app, channel } = args
        
        /* const { userId } = context;
        
        if (!userId) {
            throw new Error("Cannot post without logging in.");
        } */

        const newMessage = context.prisma.message.upsert({
          where: { txid },
          create: {
            transaction: {
              connectOrCreate: {
                where: { hash: txid },
                create: { hash: txid }
              }
            },
            unixtime,
            content,
            contentType,
            inReplyTo,
            sentBy: {
              connectOrCreate: {
                where: { address: sentByUserAddress },
                create: {
                  address: sentByUserAddress,
                  paymail: sentByUserPaymail
                }
              }
            },
            app,
            channel
          },
          update: {
            sentBy: {
              connectOrCreate: {
                where: { address: sentByUserAddress },
                create: {
                  address: sentByUserAddress,
                  paymail: sentByUserPaymail
                }
              }
            }
          },
          include: {
            transaction: true,
            sentBy: true
          }
        })

        return newMessage
      }
    })
  },
})