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
  PostOrderByInput: { // input type
    createdAt?: NexusGenEnums['Sort'] | null; // Sort
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
  Feed: { // root type
    count: number; // Int!
    id?: string | null; // ID
    posts: NexusGenRootTypes['Post'][]; // [Post!]!
  }
  Lock: { // root type
    app?: string | null; // String
    blockHeight: number; // Int!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    id: number; // Int!
    lockTargetByTxid: string; // String!
    paymail?: string | null; // String
    satoshis: NexusGenScalars['BigInt']; // BigInt!
    txid: string; // String!
  }
  Message: { // root type
    app?: string | null; // String
    channel: string; // String!
    content: string; // String!
    contentType: string; // String!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    id: number; // Int!
    inReplyTo?: string | null; // String
    txid: string; // String!
  }
  Mutation: {};
  Post: { // root type
    app?: string | null; // String
    content: string; // String!
    contentType: string; // String!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    id: number; // Int!
    inReplyTo?: string | null; // String
    txid: string; // String!
  }
  Query: {};
  Transaction: { // root type
    block?: number | null; // Int
    hash: string; // String!
    id: number; // Int!
  }
  User: { // root type
    address: string; // String!
    id: number; // Int!
    paymail: string; // String!
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  Feed: { // field return type
    count: number; // Int!
    id: string | null; // ID
    posts: NexusGenRootTypes['Post'][]; // [Post!]!
  }
  Lock: { // field return type
    app: string | null; // String
    blockHeight: number; // Int!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    id: number; // Int!
    lockTarget: NexusGenRootTypes['Transaction'] | null; // Transaction
    lockTargetByTxid: string; // String!
    locker: NexusGenRootTypes['User']; // User!
    paymail: string | null; // String
    satoshis: NexusGenScalars['BigInt']; // BigInt!
    txid: string; // String!
  }
  Message: { // field return type
    app: string | null; // String
    channel: string; // String!
    content: string; // String!
    contentType: string; // String!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    id: number; // Int!
    inReplyTo: string | null; // String
    sentBy: NexusGenRootTypes['User'] | null; // User
    txid: string; // String!
  }
  Mutation: { // field return type
    post: NexusGenRootTypes['Post']; // Post!
  }
  Post: { // field return type
    app: string | null; // String
    content: string; // String!
    contentType: string; // String!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    id: number; // Int!
    inReplyTo: string | null; // String
    postedBy: NexusGenRootTypes['User'] | null; // User
    txid: string; // String!
  }
  Query: { // field return type
    feed: NexusGenRootTypes['Feed']; // Feed!
  }
  Transaction: { // field return type
    block: number | null; // Int
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
    paymail: string; // String!
    posts: NexusGenRootTypes['Post'][]; // [Post!]!
  }
}

export interface NexusGenFieldTypeNames {
  Feed: { // field return type name
    count: 'Int'
    id: 'ID'
    posts: 'Post'
  }
  Lock: { // field return type name
    app: 'String'
    blockHeight: 'Int'
    createdAt: 'DateTime'
    id: 'Int'
    lockTarget: 'Transaction'
    lockTargetByTxid: 'String'
    locker: 'User'
    paymail: 'String'
    satoshis: 'BigInt'
    txid: 'String'
  }
  Message: { // field return type name
    app: 'String'
    channel: 'String'
    content: 'String'
    contentType: 'String'
    createdAt: 'DateTime'
    id: 'Int'
    inReplyTo: 'String'
    sentBy: 'User'
    txid: 'String'
  }
  Mutation: { // field return type name
    post: 'Post'
  }
  Post: { // field return type name
    app: 'String'
    content: 'String'
    contentType: 'String'
    createdAt: 'DateTime'
    id: 'Int'
    inReplyTo: 'String'
    postedBy: 'User'
    txid: 'String'
  }
  Query: { // field return type name
    feed: 'Feed'
  }
  Transaction: { // field return type name
    block: 'Int'
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
}

export interface NexusGenArgTypes {
  Mutation: {
    post: { // args
      app?: string | null; // String
      content: string; // String!
      contentType: string; // String!
      createdAt?: string | null; // String
      inReplyTo?: string | null; // String
      postedByUserPaymail: string; // String!
      txid: string; // String!
    }
  }
  Query: {
    feed: { // args
      filter?: string | null; // String
      orderBy?: NexusGenInputs['PostOrderByInput'][] | null; // [PostOrderByInput!]
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