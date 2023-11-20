import { inputObjectType, objectType, enumType, extendType, stringArg, intArg, arg, list, nonNull } from "nexus";
import { Prisma } from "@prisma/client";
import { Sort } from "./Sort";
import { string } from "joi";

export const Post = objectType({
  name: "Post",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("txid");
    t.nonNull.int("unixtime");
    t.nonNull.string("content");
    t.nonNull.string("contentType");
    t.nonNull.string("type");
    t.field("inReplyTo", {
      type: "Post",
      resolve(parent, args, context) {
        return context.prisma.post.findUnique({ where: {txid: parent.txid}})
      }
    });
    t.string("app");
    t.string("channel")
    t.nonNull.field("postedBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.post.findUnique({ where: { txid: parent.txid } }).postedBy()
      }
    })
  },
})

export const allPosts = objectType({
  name: "allPosts",
  definition(t) {
    t.nonNull.list.nonNull.field("posts", { type: "Post"})
    t.nonNull.int("count")
    t.id("id")
  },
})

export const PostOrderByInput = inputObjectType({
  name: "PostOrderByInput",
  definition(t) {
    t.field("unixtime", { type: Sort })
  },
})

export const PostQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("allPosts", {
      type: "allPosts",
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(PostOrderByInput))})
      },
      async resolve(parent, args, context) {
        const where = args.filter ?
            { content: { contains: args.filter }} : {}
        const posts = await context.prisma.post.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | number,
          orderBy: args?.orderBy as
          | Prisma.Enumerable<Prisma.PostOrderByWithRelationInput>
          | undefined,
        })
        const count = await context.prisma.post.count({ where })
        const id = `allPosts: ${JSON.stringify(args)}`

        return {
          posts,
          count,
          id
        }
      }
    })
  },
})

export interface NewPostProps {
  txid: string;
  unixtime: number;
  content: string;
  contentType: string;
  type: "post" | "message";
  inReplyToTx?: string;
  postedByUserAddress: string;
  postedByUserPaymail?: string;
  app?: string;
  channel?: string;
}

export const PostMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Post",
      args: {
        txid: nonNull(stringArg()),
        unixtime: nonNull(intArg()),
        content: nonNull(stringArg()),
        contentType: nonNull(stringArg()),
        type: nonNull(stringArg()),
        inReplyToTx: stringArg(),
        postedByUserAddress: nonNull(stringArg()),
        postedByUserPaymail: stringArg(),
        app: stringArg(),
        channel: stringArg()
      },
      async resolve(parent, args: NewPostProps, context) {
        const { txid, unixtime, content, contentType, type, inReplyToTx, postedByUserAddress, postedByUserPaymail, app, channel } = args
        /* const { userId } = context;
        
        if (!userId) {
            throw new Error("Cannot post without logging in.");
        } */

        const newPost = context.prisma.post.upsert({
          where: { txid },
          create: {
            txid,
            unixtime,
            content,
            contentType,
            type,
            inReplyTo: {
              connect: {
                txid: inReplyToTx
              }
            },
            postedBy: {
              connectOrCreate: {
                where: { address: postedByUserAddress },
                create: { 
                  address: postedByUserAddress,
                  paymail: postedByUserPaymail
                }
              }
            },
            app,
            channel
          },
          update: {
            postedBy: {
              connectOrCreate: {
                where: { address: postedByUserAddress },
                create: { 
                  address: postedByUserAddress,
                  paymail: postedByUserPaymail
                }
              }
            },
          },
          include: {
            postedBy: true
          }
        })
        
        return newPost
      }
    })
  },
})