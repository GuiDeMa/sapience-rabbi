import { objectType } from "nexus";

export const User = objectType({
    name: 'User',
    definition(t) {
      t.string('id');
      t.string('address');
      t.string('paymail');
      t.list.field('posts', {
        type: 'Post',
        resolve: (parent, args, context) => {
          return context.prisma.user
            .findUnique({
              where: { id: parent.id },
            })
            .posts();
        },
      });
      t.list.field('messages', {
        type: 'Message',
        resolve: (parent, args, context) => {
          return context.prisma.user
            .findUnique({
              where: { id: parent.id },
            })
            .messages();
        },
      });
      t.list.field('locks', {
        type: 'Lock',
        resolve: (parent, args, context) => {
          return context.prisma.user
            .findUnique({
              where: { id: parent.id },
            })
            .locks();
        },
      });
    },
  });

/* export const User = objectType({
    name: "User",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("name");
        t.nonNull.string("email");
        t.nonNull.list.nonNull.field("links", {  
            type: "Link",
            //@ts-ignore
            resolve(parent, args, context) {  
                return context.prisma.user 
                    .findUnique({ where: { id: parent.id } })
                    .links()
            },
        });
        t.nonNull.list.nonNull.field("votes", {
            type: "Vote",
            //@ts-ignore
            resolve(parent, args, context) {
                return context.prisma.user
                    .findUnique({ where: { id: parent.id }})
                    .votes()
            }
        }) 
    },
}); */