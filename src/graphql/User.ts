import { arg, extendType, inputObjectType, intArg, list, nonNull, objectType, stringArg } from "nexus";
import { Sort } from "./Sort";
import { Prisma } from "@prisma/client";
import { string } from "joi";

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.string("address")
    t.nonNull.list.nonNull.field("posts", {
      type: "Post",
      resolve(parent, args, context) {
        return context.prisma.user.findUnique({ where: { address : parent.address } }).posts()
      }
    })
    t.nonNull.list.nonNull.field("messages", {
      type: "Message",
      resolve(parent, args, context) {
        return context.prisma.user.findUnique({ where: { address: parent.address }}).messages()
      }
    })
    t.nonNull.list.nonNull.field("locks", { 
      type: "Lock",
      resolve(parent, args, context) {
        return context.prisma.user.findUnique({ where: { address: parent.address } }).locks()
      }
    })
  },
})

export const leaderboard = objectType({
  name: "Leaderboard",
  definition(t) {
    t.nonNull.list.nonNull.field("users", { type: "User" })
    t.nonNull.int("count")
    t.id("id")
  },
})

export const UserOrderByInput = inputObjectType({
  name: "UserOrderByInput",
  definition(t) {
    t.field("locks", { type: Sort }) //TODO userRankings
  },
})

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("leaderboard", {
      type: "Leaderboard",
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(UserOrderByInput))})
      },
      async resolve(parent, args, context) {
        const where ={
        } 

        const users = await context.prisma.user.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | number,
          orderBy: args?.orderBy as
          | Prisma.Enumerable<Prisma.PostOrderByWithRelationInput>
          | undefined,
        })

        const count = await context.prisma.user.count({ where })
        const id = `channel: ${JSON.stringify(args)}`

        return {
          users,
          count, 
          id
        }
      }
    })
  },
})

interface NewUserProps {
  address: string;
}

export const UserMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("user", {
      type: "User",
      args: {
        address: nonNull(stringArg()),
      },
      async resolve(parent, args: NewUserProps, context) {
        const { address } = args

        /* const { userId } = context;
        
        if (!userId) {
            throw new Error("Cannot post without logging in.");
        } */

        const newUser = context.prisma.user.create({
          data: {
            address,
          }
        })

        return newUser
      }
    })
  },
})

