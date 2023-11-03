import { inputObjectType, objectType, enumType, extendType, stringArg, intArg, arg, list, nonNull } from "nexus";
import { Prisma } from "@prisma/client";

export const Post = objectType({
  name: "Post",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("txid");
    t.nonNull.dateTime("createdAt");
    t.nonNull.string("content");
    t.nonNull.string("contentType");
    t.string("inReplyTo");
    t.string("app");
    t.field("postedBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.post.findUnique({ where: { txid: parent.txid } }).postedBy()
      }
    })
  },
})

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("posts", { type: "Post"})
    t.nonNull.int("count")
    t.id("id")
  },
})

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
});

export const PostOrderByInput = inputObjectType({
  name: "PostOrderByInput",
  definition(t) {
    t.field("createdAt", { type: Sort })
  },
})

export const PostQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("feed", {
      type: "Feed",
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(PostOrderByInput))})
      },
      async resolve(parent, args, context) {
        const where = args.filter ?{
          OR: [
            { content: { contains: args.filter }},
            { postedBy: {
              paymail: { contains: args.filter }
            }}
          ]
        } : {}
        const posts = await context.prisma.post.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | number,
          orderBy: args?.orderBy as
          | Prisma.Enumerable<Prisma.PostOrderByWithRelationInput>
          | undefined,
        })
        const count = await context.prisma.post.findMany({ where })
        const id = `main-feed:${JSON.stringify(args)}`

        return {
          posts,
          count,
          id
        }
      }
    })
  },
})

interface NewPostProps {
  txid: string;
  createdAt: string;
  content: string;
  contentType: string;
  inReplyTo?: string;
  postedByUserPaymail: string;
  app?: string;
}

export const PostMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Post",
      args: {
        txid: nonNull(stringArg()),
        createdAt: stringArg(),
        content: nonNull(stringArg()),
        contentType: nonNull(stringArg()),
        inReplyTo: stringArg(),
        postedByUserPaymail: nonNull(stringArg()),
        app: stringArg()
      },
      resolve(parent, args: NewPostProps, context) {
        const { txid, createdAt, content, contentType, inReplyTo, postedByUserPaymail, app } = args
        /* const { userId } = context;

        if (!userId) {
            throw new Error("Cannot post without logging in.");
        } */
        
        const newPost = context.prisma.post.create({
          data: {
            txid,
            transaction: { connect: { hash: txid }},
            createdAt,
            content, 
            contentType, 
            inReplyTo, 
            postedByUserPaymail,
            postedBy: { connect: { paymail: postedByUserPaymail }} ,
            app
          }
        })

        return newPost
      }
    })
  },
})