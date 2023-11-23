import { arg, extendType, inputObjectType, intArg, list, nonNull, objectType, stringArg } from "nexus";
import { Sort } from "./Sort";
import { Prisma } from "@prisma/client";

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.list.nonNull.string("addresses")
    t.nonNull.string("paymail")
    /* t.nonNull.list.nonNull.field("posts", {
      type: "Post",
      resolve(parent, args, context) {
        return context.prisma.user.findUnique({ where: { address : parent.address } }).posts()
      }
    })
    t.nonNull.list.nonNull.field("locks", { 
      type: "Lock",
      resolve(parent, args, context) {
        return context.prisma.user.findUnique({ where: { address: parent.address } }).locks()
      }
    }) */
  },
})

export const allUsers = objectType({
  name: "allUsers",
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
    t.nonNull.field("allUsers", {
      type: "allUsers",
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
        const id = `users: ${JSON.stringify(args)}`

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
  paymail: string;
}

export const UserMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("user", {
      type: "User",
      args: {
        address: nonNull(stringArg()),
        paymail: nonNull(stringArg())
      },
      async resolve(parent, args: NewUserProps, context) {
        const { address, paymail } = args

        /* const { userId } = context;
        
        if (!userId) {
            throw new Error("Cannot post without logging in.");
        } */

        const newUser = context.prisma.user.upsert({
          where: {
            paymail
          },
          update: {
            addresses: {
              push: address
            }
          },
          create: {
            paymail,
            addresses: {
              push: address
            }
          }
        })

        return newUser
      }
    })
  },
})

