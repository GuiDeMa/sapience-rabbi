import {
    extendType,
    nonNull,
    objectType,
    stringArg,
    intArg,
    inputObjectType,
    enumType,
    arg,
    list,
} from "nexus";

export const Message = objectType({
    name: 'Message',
    definition(t) {
      t.string('id');
      t.string('txid');
      t.string('content');
      t.string('contentType');
      t.string('inReplyTo');
      t.string('paymail');
      t.string('app');
      t.list.field('locks', {
        type: 'Lock',
        resolve: (parent, args, context) => {
          return context.prisma.message
            .findUnique({
              where: { id: parent.id },
            })
            .locks();
        },
      });
      t.field('user', {
        type: 'User',
        resolve: (parent, args, context) => {
          return context.prisma.message
            .findUnique({
              where: { id: parent.id },
            })
            .user();
        },
      });
    },
});