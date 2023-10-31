import { objectType } from "nexus";

export const Lock = objectType({
    name: 'Lock',
    definition(t) {
      t.string('id');
      t.string('txid');
      t.int('satoshis');
      t.int('blockHeight');
      t.field('post', {
        type: 'Post',
        resolve: (parent, args, context) => {
          return context.prisma.lock
            .findUnique({
              where: { id: parent.id },
            })
            .post();
        },
      });
      t.field('message', {
        type: 'Message',
        resolve: (parent, args, context) => {
          return context.prisma.lock
            .findUnique({
              where: { id: parent.id },
            })
            .message();
        },
      });
      t.field('user', {
        type: 'User',
        resolve: (parent, args, context) => {
          return context.prisma.lock
            .findUnique({
              where: { id: parent.id },
            })
            .user();
        },
      });
    },
});