/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { Context } from "./src/context"
import type { core } from "nexus"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    dateTime<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "DateTime";
    /**
     * The `BigInt` scalar type represents non-fractional signed whole numeric values.
     */
    bigint<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "BigInt";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    dateTime<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "DateTime";
    /**
     * The `BigInt` scalar type represents non-fractional signed whole numeric values.
     */
    bigint<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "BigInt";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  LockOrderByInput: { // input type
    unixtime?: NexusGenEnums['Sort'] | null; // Sort
  }
  MessageOrderByInput: { // input type
    unixtime?: NexusGenEnums['Sort'] | null; // Sort
  }
  PostOrderByInput: { // input type
    unixtime?: NexusGenEnums['Sort'] | null; // Sort
  }
  UserOrderByInput: { // input type
    locks?: NexusGenEnums['Sort'] | null; // Sort
  }
}

export interface NexusGenEnums {
  Sort: "asc" | "desc"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  BigInt: any
  DateTime: any
}

export interface NexusGenObjects {
  Lock: { // root type
    app?: string | null; // String
    blockHeight: NexusGenScalars['BigInt']; // BigInt!
    id: number; // Int!
    lockTargetByTxid: string; // String!
    satoshis: NexusGenScalars['BigInt']; // BigInt!
    txid: string; // String!
    unixtime: number; // Int!
    vibes: number; // Float!
  }
  Message: { // root type
    app?: string | null; // String
    channel: string; // String!
    content: string; // String!
    contentType: string; // String!
    id: number; // Int!
    txid: string; // String!
    unixtime: number; // Int!
  }
  Mutation: {};
  Post: { // root type
    app?: string | null; // String
    content: string; // String!
    contentType: string; // String!
    id: number; // Int!
    txid: string; // String!
    unixtime: number; // Int!
  }
  Query: {};
  Transaction: { // root type
    block?: NexusGenScalars['BigInt'] | null; // BigInt
    hash: string; // String!
    id: number; // Int!
  }
  User: { // root type
    address: string; // String!
    id: number; // Int!
    paymail?: string | null; // String
  }
  allLocks: { // root type
    count: number; // Int!
    id?: string | null; // ID
    locks: NexusGenRootTypes['Lock'][]; // [Lock!]!
  }
  allMessages: { // root type
    count: number; // Int!
    id?: string | null; // ID
    messages: NexusGenRootTypes['Message'][]; // [Message!]!
  }
  allPosts: { // root type
    count: number; // Int!
    id?: string | null; // ID
    posts: NexusGenRootTypes['Post'][]; // [Post!]!
  }
  allUsers: { // root type
    count: number; // Int!
    id?: string | null; // ID
    users: NexusGenRootTypes['User'][]; // [User!]!
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  Lock: { // field return type
    MessageLockTarget: NexusGenRootTypes['Message'] | null; // Message
    app: string | null; // String
    blockHeight: NexusGenScalars['BigInt']; // BigInt!
    id: number; // Int!
    lockTargetByTxid: string; // String!
    locker: NexusGenRootTypes['User']; // User!
    postLockTarget: NexusGenRootTypes['Post'] | null; // Post
    satoshis: NexusGenScalars['BigInt']; // BigInt!
    txid: string; // String!
    unixtime: number; // Int!
    vibes: number; // Float!
  }
  Message: { // field return type
    app: string | null; // String
    channel: string; // String!
    content: string; // String!
    contentType: string; // String!
    id: number; // Int!
    inReplyTo: NexusGenRootTypes['Message'] | null; // Message
    sentBy: NexusGenRootTypes['User']; // User!
    txid: string; // String!
    unixtime: number; // Int!
  }
  Mutation: { // field return type
    lock: NexusGenRootTypes['Lock']; // Lock!
    message: NexusGenRootTypes['Message']; // Message!
    post: NexusGenRootTypes['Post']; // Post!
    transaction: NexusGenRootTypes['Transaction']; // Transaction!
    user: NexusGenRootTypes['User']; // User!
  }
  Post: { // field return type
    app: string | null; // String
    content: string; // String!
    contentType: string; // String!
    id: number; // Int!
    inReplyTo: NexusGenRootTypes['Post'] | null; // Post
    postedBy: NexusGenRootTypes['User']; // User!
    txid: string; // String!
    unixtime: number; // Int!
  }
  Query: { // field return type
    allLocks: NexusGenRootTypes['allLocks']; // allLocks!
    allMessages: NexusGenRootTypes['allMessages']; // allMessages!
    allPosts: NexusGenRootTypes['allPosts']; // allPosts!
    allUsers: NexusGenRootTypes['allUsers']; // allUsers!
  }
  Transaction: { // field return type
    block: NexusGenScalars['BigInt'] | null; // BigInt
    hash: string; // String!
    id: number; // Int!
    lock: NexusGenRootTypes['Lock'] | null; // Lock
    locks: Array<NexusGenRootTypes['Lock'] | null>; // [Lock]!
    message: NexusGenRootTypes['Message'] | null; // Message
    post: NexusGenRootTypes['Post'] | null; // Post
  }
  User: { // field return type
    address: string; // String!
    id: number; // Int!
    locks: NexusGenRootTypes['Lock'][]; // [Lock!]!
    messages: NexusGenRootTypes['Message'][]; // [Message!]!
    paymail: string | null; // String
    posts: NexusGenRootTypes['Post'][]; // [Post!]!
  }
  allLocks: { // field return type
    count: number; // Int!
    id: string | null; // ID
    locks: NexusGenRootTypes['Lock'][]; // [Lock!]!
  }
  allMessages: { // field return type
    count: number; // Int!
    id: string | null; // ID
    messages: NexusGenRootTypes['Message'][]; // [Message!]!
  }
  allPosts: { // field return type
    count: number; // Int!
    id: string | null; // ID
    posts: NexusGenRootTypes['Post'][]; // [Post!]!
  }
  allUsers: { // field return type
    count: number; // Int!
    id: string | null; // ID
    users: NexusGenRootTypes['User'][]; // [User!]!
  }
}

export interface NexusGenFieldTypeNames {
  Lock: { // field return type name
    MessageLockTarget: 'Message'
    app: 'String'
    blockHeight: 'BigInt'
    id: 'Int'
    lockTargetByTxid: 'String'
    locker: 'User'
    postLockTarget: 'Post'
    satoshis: 'BigInt'
    txid: 'String'
    unixtime: 'Int'
    vibes: 'Float'
  }
  Message: { // field return type name
    app: 'String'
    channel: 'String'
    content: 'String'
    contentType: 'String'
    id: 'Int'
    inReplyTo: 'Message'
    sentBy: 'User'
    txid: 'String'
    unixtime: 'Int'
  }
  Mutation: { // field return type name
    lock: 'Lock'
    message: 'Message'
    post: 'Post'
    transaction: 'Transaction'
    user: 'User'
  }
  Post: { // field return type name
    app: 'String'
    content: 'String'
    contentType: 'String'
    id: 'Int'
    inReplyTo: 'Post'
    postedBy: 'User'
    txid: 'String'
    unixtime: 'Int'
  }
  Query: { // field return type name
    allLocks: 'allLocks'
    allMessages: 'allMessages'
    allPosts: 'allPosts'
    allUsers: 'allUsers'
  }
  Transaction: { // field return type name
    block: 'BigInt'
    hash: 'String'
    id: 'Int'
    lock: 'Lock'
    locks: 'Lock'
    message: 'Message'
    post: 'Post'
  }
  User: { // field return type name
    address: 'String'
    id: 'Int'
    locks: 'Lock'
    messages: 'Message'
    paymail: 'String'
    posts: 'Post'
  }
  allLocks: { // field return type name
    count: 'Int'
    id: 'ID'
    locks: 'Lock'
  }
  allMessages: { // field return type name
    count: 'Int'
    id: 'ID'
    messages: 'Message'
  }
  allPosts: { // field return type name
    count: 'Int'
    id: 'ID'
    posts: 'Post'
  }
  allUsers: { // field return type name
    count: 'Int'
    id: 'ID'
    users: 'User'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    lock: { // args
      app?: string | null; // String
      blockHeight: number; // Int!
      lockTargetByTxid: string; // String!
      lockerByUserAddress: string; // String!
      lockerByUserPaymail?: string | null; // String
      satoshis: number; // Int!
      txid: string; // String!
      unixtime: number; // Int!
    }
    message: { // args
      app?: string | null; // String
      channel: string; // String!
      content: string; // String!
      contentType: string; // String!
      inReplyTo?: string | null; // String
      sentByUserAddress: string; // String!
      sentByUserPaymail?: string | null; // String
      txid: string; // String!
      unixtime: number; // Int!
    }
    post: { // args
      app?: string | null; // String
      content: string; // String!
      contentType: string; // String!
      inReplyToTx?: string | null; // String
      postedByUserAddress: string; // String!
      postedByUserPaymail?: string | null; // String
      txid: string; // String!
      unixtime: number; // Int!
    }
    transaction: { // args
      block?: number | null; // Int
      hash: string; // String!
    }
    user: { // args
      address: string; // String!
      paymail?: string | null; // String
    }
  }
  Query: {
    allLocks: { // args
      filter?: string | null; // String
      orderBy?: NexusGenInputs['LockOrderByInput'][] | null; // [LockOrderByInput!]
      skip?: number | null; // Int
      take?: number | null; // Int
    }
    allMessages: { // args
      channel: string; // String!
      filter?: string | null; // String
      orderBy?: NexusGenInputs['MessageOrderByInput'][] | null; // [MessageOrderByInput!]
      skip?: number | null; // Int
      take?: number | null; // Int
    }
    allPosts: { // args
      filter?: string | null; // String
      orderBy?: NexusGenInputs['PostOrderByInput'][] | null; // [PostOrderByInput!]
      skip?: number | null; // Int
      take?: number | null; // Int
    }
    allUsers: { // args
      filter?: string | null; // String
      orderBy?: NexusGenInputs['UserOrderByInput'][] | null; // [UserOrderByInput!]
      skip?: number | null; // Int
      take?: number | null; // Int
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: Context;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}