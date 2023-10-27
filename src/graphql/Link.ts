import { arg, enumType, extendType, inputObjectType, intArg, list, nonNull, objectType, stringArg } from "nexus";   
import { NexusGenObjects } from "../../nexus-typegen";  
import { Prisma } from "@prisma/client";

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id"),
        t.nonNull.string("description"),
        t.nonNull.string("url"),
        t.nonNull.dateTime("createdAt"),
        t.field("postedBy", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({
                        where: { id: parent.id }
                    })
                    .postedBy()
                    
            }
        }),
        t.nonNull.list.nonNull.field("voters", {
            type: "User",
            //@ts-ignore
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id }})
                    .voters()
            }
        })
    },
})

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", { type: Sort }),
        t.field("url", { type: Sort }),
        t.field("createdAt", { type: Sort })
    },
})

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"]
})

export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links", { type: Link }),
        t.nonNull.int("count"),
        t.nonNull.id("id")
    },
})

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.field("feed", {
            type: "Feed",
            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
                orderBy: arg({ type: list(nonNull(LinkOrderByInput))})
            },
            async resolve(parents, args, context, info) {
                const where = args.filter
                    ? {
                        OR: [
                            { description: { contains: args.filter }},
                            { url: { contains: args.filter }}
                        ]
                    } 
                    : {}
                const links = await context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined,
                    take: args?.take as number | undefined,
                    orderBy: args.orderBy as Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput> | undefined
                })
                const count = await context.prisma.link.count({ where })
                const id = `main-feed:${JSON.stringify(args)}`
                return {
                    links,
                    count, 
                    id
                }
            }
        })
        /* t.field("link", {
            type: "Link",
            args: {
                id: nonNull(intArg())
            },
            resolve(parents, args, context, info) {
                const linkId = args.id;
                const link = context.prisma.link.findOne()
                return link || null;
            }
        }) */
    },
})

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg())
            },
            resolve(parents, args, context) {
                const { description, url } = args;
                const { userId } = context;

                if (!userId) { 
                    throw new Error("Cannot post without logging in.");
                }

                const newLink = context.prisma.link.create({
                    data: {
                        description,
                        url,
                        postedBy: { connect: { id: userId } }, 
                    },
                });

                return newLink;
            }
        })
        /* t.field("updateLink", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
                description: stringArg(),
                url: stringArg()
            },
            resolve(parents, args, context) {
                const { id, description, url } = args;
                const linkIndex = links.findIndex(link => link.id === id);

                if (linkIndex !== -1) {
                    // Update the link with the provided description and url
                    if (description) {
                        links[linkIndex].description = description;
                    }
                    if (url) {
                        links[linkIndex].url = url;
                    }

                    // Return the updated link
                    return links[linkIndex];
                }

                // If the link is not found, return null
                return null;
            }
        }),
        t.field("deleteLink", {
            type: "Link",
            args: {
                id: nonNull(intArg())
            },
            resolve(parents, args, context) {
                const { id } = args
                const linkIndex = links.findIndex(link => link.id === id)

                if(linkIndex !== -1) {
                    const deletedLink = links.splice(linkIndex, 1)[0];
                    return deletedLink;
                }

                return null
            }
        }) */
    },
})