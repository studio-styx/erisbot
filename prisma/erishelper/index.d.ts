
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Votes
 * 
 */
export type Votes = $Result.DefaultSelection<Prisma.$VotesPayload>
/**
 * Model Application
 * 
 */
export type Application = $Result.DefaultSelection<Prisma.$ApplicationPayload>
/**
 * Model Cooldown
 * 
 */
export type Cooldown = $Result.DefaultSelection<Prisma.$CooldownPayload>
/**
 * Model Annotation
 * 
 */
export type Annotation = $Result.DefaultSelection<Prisma.$AnnotationPayload>
/**
 * Model VoteReminder
 * 
 */
export type VoteReminder = $Result.DefaultSelection<Prisma.$VoteReminderPayload>
/**
 * Model Analyze
 * 
 */
export type Analyze = $Result.DefaultSelection<Prisma.$AnalyzePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.votes`: Exposes CRUD operations for the **Votes** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Votes
    * const votes = await prisma.votes.findMany()
    * ```
    */
  get votes(): Prisma.VotesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.application`: Exposes CRUD operations for the **Application** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Applications
    * const applications = await prisma.application.findMany()
    * ```
    */
  get application(): Prisma.ApplicationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cooldown`: Exposes CRUD operations for the **Cooldown** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Cooldowns
    * const cooldowns = await prisma.cooldown.findMany()
    * ```
    */
  get cooldown(): Prisma.CooldownDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.annotation`: Exposes CRUD operations for the **Annotation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Annotations
    * const annotations = await prisma.annotation.findMany()
    * ```
    */
  get annotation(): Prisma.AnnotationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.voteReminder`: Exposes CRUD operations for the **VoteReminder** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VoteReminders
    * const voteReminders = await prisma.voteReminder.findMany()
    * ```
    */
  get voteReminder(): Prisma.VoteReminderDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.analyze`: Exposes CRUD operations for the **Analyze** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Analyzes
    * const analyzes = await prisma.analyze.findMany()
    * ```
    */
  get analyze(): Prisma.AnalyzeDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.13.0
   * Query Engine version: 361e86d0ea4987e9f53a565309b3eed797a6bcbd
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Votes: 'Votes',
    Application: 'Application',
    Cooldown: 'Cooldown',
    Annotation: 'Annotation',
    VoteReminder: 'VoteReminder',
    Analyze: 'Analyze'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "votes" | "application" | "cooldown" | "annotation" | "voteReminder" | "analyze"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Votes: {
        payload: Prisma.$VotesPayload<ExtArgs>
        fields: Prisma.VotesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VotesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VotesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VotesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VotesPayload>
          }
          findFirst: {
            args: Prisma.VotesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VotesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VotesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VotesPayload>
          }
          findMany: {
            args: Prisma.VotesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VotesPayload>[]
          }
          create: {
            args: Prisma.VotesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VotesPayload>
          }
          createMany: {
            args: Prisma.VotesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VotesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VotesPayload>[]
          }
          delete: {
            args: Prisma.VotesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VotesPayload>
          }
          update: {
            args: Prisma.VotesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VotesPayload>
          }
          deleteMany: {
            args: Prisma.VotesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VotesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VotesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VotesPayload>[]
          }
          upsert: {
            args: Prisma.VotesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VotesPayload>
          }
          aggregate: {
            args: Prisma.VotesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVotes>
          }
          groupBy: {
            args: Prisma.VotesGroupByArgs<ExtArgs>
            result: $Utils.Optional<VotesGroupByOutputType>[]
          }
          count: {
            args: Prisma.VotesCountArgs<ExtArgs>
            result: $Utils.Optional<VotesCountAggregateOutputType> | number
          }
        }
      }
      Application: {
        payload: Prisma.$ApplicationPayload<ExtArgs>
        fields: Prisma.ApplicationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApplicationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApplicationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          findFirst: {
            args: Prisma.ApplicationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApplicationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          findMany: {
            args: Prisma.ApplicationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>[]
          }
          create: {
            args: Prisma.ApplicationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          createMany: {
            args: Prisma.ApplicationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApplicationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>[]
          }
          delete: {
            args: Prisma.ApplicationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          update: {
            args: Prisma.ApplicationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          deleteMany: {
            args: Prisma.ApplicationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApplicationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApplicationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>[]
          }
          upsert: {
            args: Prisma.ApplicationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          aggregate: {
            args: Prisma.ApplicationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApplication>
          }
          groupBy: {
            args: Prisma.ApplicationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApplicationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApplicationCountArgs<ExtArgs>
            result: $Utils.Optional<ApplicationCountAggregateOutputType> | number
          }
        }
      }
      Cooldown: {
        payload: Prisma.$CooldownPayload<ExtArgs>
        fields: Prisma.CooldownFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CooldownFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CooldownPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CooldownFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CooldownPayload>
          }
          findFirst: {
            args: Prisma.CooldownFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CooldownPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CooldownFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CooldownPayload>
          }
          findMany: {
            args: Prisma.CooldownFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CooldownPayload>[]
          }
          create: {
            args: Prisma.CooldownCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CooldownPayload>
          }
          createMany: {
            args: Prisma.CooldownCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CooldownCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CooldownPayload>[]
          }
          delete: {
            args: Prisma.CooldownDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CooldownPayload>
          }
          update: {
            args: Prisma.CooldownUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CooldownPayload>
          }
          deleteMany: {
            args: Prisma.CooldownDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CooldownUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CooldownUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CooldownPayload>[]
          }
          upsert: {
            args: Prisma.CooldownUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CooldownPayload>
          }
          aggregate: {
            args: Prisma.CooldownAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCooldown>
          }
          groupBy: {
            args: Prisma.CooldownGroupByArgs<ExtArgs>
            result: $Utils.Optional<CooldownGroupByOutputType>[]
          }
          count: {
            args: Prisma.CooldownCountArgs<ExtArgs>
            result: $Utils.Optional<CooldownCountAggregateOutputType> | number
          }
        }
      }
      Annotation: {
        payload: Prisma.$AnnotationPayload<ExtArgs>
        fields: Prisma.AnnotationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AnnotationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AnnotationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>
          }
          findFirst: {
            args: Prisma.AnnotationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AnnotationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>
          }
          findMany: {
            args: Prisma.AnnotationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>[]
          }
          create: {
            args: Prisma.AnnotationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>
          }
          createMany: {
            args: Prisma.AnnotationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AnnotationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>[]
          }
          delete: {
            args: Prisma.AnnotationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>
          }
          update: {
            args: Prisma.AnnotationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>
          }
          deleteMany: {
            args: Prisma.AnnotationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AnnotationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AnnotationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>[]
          }
          upsert: {
            args: Prisma.AnnotationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnnotationPayload>
          }
          aggregate: {
            args: Prisma.AnnotationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAnnotation>
          }
          groupBy: {
            args: Prisma.AnnotationGroupByArgs<ExtArgs>
            result: $Utils.Optional<AnnotationGroupByOutputType>[]
          }
          count: {
            args: Prisma.AnnotationCountArgs<ExtArgs>
            result: $Utils.Optional<AnnotationCountAggregateOutputType> | number
          }
        }
      }
      VoteReminder: {
        payload: Prisma.$VoteReminderPayload<ExtArgs>
        fields: Prisma.VoteReminderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VoteReminderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoteReminderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VoteReminderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoteReminderPayload>
          }
          findFirst: {
            args: Prisma.VoteReminderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoteReminderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VoteReminderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoteReminderPayload>
          }
          findMany: {
            args: Prisma.VoteReminderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoteReminderPayload>[]
          }
          create: {
            args: Prisma.VoteReminderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoteReminderPayload>
          }
          createMany: {
            args: Prisma.VoteReminderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VoteReminderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoteReminderPayload>[]
          }
          delete: {
            args: Prisma.VoteReminderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoteReminderPayload>
          }
          update: {
            args: Prisma.VoteReminderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoteReminderPayload>
          }
          deleteMany: {
            args: Prisma.VoteReminderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VoteReminderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VoteReminderUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoteReminderPayload>[]
          }
          upsert: {
            args: Prisma.VoteReminderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoteReminderPayload>
          }
          aggregate: {
            args: Prisma.VoteReminderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVoteReminder>
          }
          groupBy: {
            args: Prisma.VoteReminderGroupByArgs<ExtArgs>
            result: $Utils.Optional<VoteReminderGroupByOutputType>[]
          }
          count: {
            args: Prisma.VoteReminderCountArgs<ExtArgs>
            result: $Utils.Optional<VoteReminderCountAggregateOutputType> | number
          }
        }
      }
      Analyze: {
        payload: Prisma.$AnalyzePayload<ExtArgs>
        fields: Prisma.AnalyzeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AnalyzeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyzePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AnalyzeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyzePayload>
          }
          findFirst: {
            args: Prisma.AnalyzeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyzePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AnalyzeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyzePayload>
          }
          findMany: {
            args: Prisma.AnalyzeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyzePayload>[]
          }
          create: {
            args: Prisma.AnalyzeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyzePayload>
          }
          createMany: {
            args: Prisma.AnalyzeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AnalyzeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyzePayload>[]
          }
          delete: {
            args: Prisma.AnalyzeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyzePayload>
          }
          update: {
            args: Prisma.AnalyzeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyzePayload>
          }
          deleteMany: {
            args: Prisma.AnalyzeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AnalyzeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AnalyzeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyzePayload>[]
          }
          upsert: {
            args: Prisma.AnalyzeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyzePayload>
          }
          aggregate: {
            args: Prisma.AnalyzeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAnalyze>
          }
          groupBy: {
            args: Prisma.AnalyzeGroupByArgs<ExtArgs>
            result: $Utils.Optional<AnalyzeGroupByOutputType>[]
          }
          count: {
            args: Prisma.AnalyzeCountArgs<ExtArgs>
            result: $Utils.Optional<AnalyzeCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    votes?: VotesOmit
    application?: ApplicationOmit
    cooldown?: CooldownOmit
    annotation?: AnnotationOmit
    voteReminder?: VoteReminderOmit
    analyze?: AnalyzeOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    applications: number
    cooldowns: number
    analyzes: number
    votes: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    applications?: boolean | UserCountOutputTypeCountApplicationsArgs
    cooldowns?: boolean | UserCountOutputTypeCountCooldownsArgs
    analyzes?: boolean | UserCountOutputTypeCountAnalyzesArgs
    votes?: boolean | UserCountOutputTypeCountVotesArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountApplicationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApplicationWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCooldownsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CooldownWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAnalyzesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnalyzeWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountVotesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VotesWhereInput
  }


  /**
   * Count Type ApplicationCountOutputType
   */

  export type ApplicationCountOutputType = {
    votes: number
  }

  export type ApplicationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    votes?: boolean | ApplicationCountOutputTypeCountVotesArgs
  }

  // Custom InputTypes
  /**
   * ApplicationCountOutputType without action
   */
  export type ApplicationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationCountOutputType
     */
    select?: ApplicationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ApplicationCountOutputType without action
   */
  export type ApplicationCountOutputTypeCountVotesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VotesWhereInput
  }


  /**
   * Count Type AnalyzeCountOutputType
   */

  export type AnalyzeCountOutputType = {
    annotations: number
  }

  export type AnalyzeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    annotations?: boolean | AnalyzeCountOutputTypeCountAnnotationsArgs
  }

  // Custom InputTypes
  /**
   * AnalyzeCountOutputType without action
   */
  export type AnalyzeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyzeCountOutputType
     */
    select?: AnalyzeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AnalyzeCountOutputType without action
   */
  export type AnalyzeCountOutputTypeCountAnnotationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnnotationWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    analisingId: number | null
    coins: number | null
  }

  export type UserSumAggregateOutputType = {
    analisingId: number | null
    coins: number | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    blacklist: boolean | null
    defaultVote: string | null
    isAvaliator: boolean | null
    isSuperAvaliator: boolean | null
    createdAt: Date | null
    analisingId: number | null
    coins: number | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    blacklist: boolean | null
    defaultVote: string | null
    isAvaliator: boolean | null
    isSuperAvaliator: boolean | null
    createdAt: Date | null
    analisingId: number | null
    coins: number | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    blacklist: number
    defaultVote: number
    isAvaliator: number
    isSuperAvaliator: number
    createdAt: number
    analisingId: number
    coins: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    analisingId?: true
    coins?: true
  }

  export type UserSumAggregateInputType = {
    analisingId?: true
    coins?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    blacklist?: true
    defaultVote?: true
    isAvaliator?: true
    isSuperAvaliator?: true
    createdAt?: true
    analisingId?: true
    coins?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    blacklist?: true
    defaultVote?: true
    isAvaliator?: true
    isSuperAvaliator?: true
    createdAt?: true
    analisingId?: true
    coins?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    blacklist?: true
    defaultVote?: true
    isAvaliator?: true
    isSuperAvaliator?: true
    createdAt?: true
    analisingId?: true
    coins?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    blacklist: boolean
    defaultVote: string | null
    isAvaliator: boolean
    isSuperAvaliator: boolean
    createdAt: Date
    analisingId: number | null
    coins: number
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    blacklist?: boolean
    defaultVote?: boolean
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: boolean
    analisingId?: boolean
    coins?: boolean
    applications?: boolean | User$applicationsArgs<ExtArgs>
    cooldowns?: boolean | User$cooldownsArgs<ExtArgs>
    analyzes?: boolean | User$analyzesArgs<ExtArgs>
    votes?: boolean | User$votesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    blacklist?: boolean
    defaultVote?: boolean
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: boolean
    analisingId?: boolean
    coins?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    blacklist?: boolean
    defaultVote?: boolean
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: boolean
    analisingId?: boolean
    coins?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    blacklist?: boolean
    defaultVote?: boolean
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: boolean
    analisingId?: boolean
    coins?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "blacklist" | "defaultVote" | "isAvaliator" | "isSuperAvaliator" | "createdAt" | "analisingId" | "coins", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    applications?: boolean | User$applicationsArgs<ExtArgs>
    cooldowns?: boolean | User$cooldownsArgs<ExtArgs>
    analyzes?: boolean | User$analyzesArgs<ExtArgs>
    votes?: boolean | User$votesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      applications: Prisma.$ApplicationPayload<ExtArgs>[]
      cooldowns: Prisma.$CooldownPayload<ExtArgs>[]
      analyzes: Prisma.$AnalyzePayload<ExtArgs>[]
      votes: Prisma.$VotesPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      blacklist: boolean
      defaultVote: string | null
      isAvaliator: boolean
      isSuperAvaliator: boolean
      createdAt: Date
      analisingId: number | null
      coins: number
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    applications<T extends User$applicationsArgs<ExtArgs> = {}>(args?: Subset<T, User$applicationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    cooldowns<T extends User$cooldownsArgs<ExtArgs> = {}>(args?: Subset<T, User$cooldownsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CooldownPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    analyzes<T extends User$analyzesArgs<ExtArgs> = {}>(args?: Subset<T, User$analyzesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    votes<T extends User$votesArgs<ExtArgs> = {}>(args?: Subset<T, User$votesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VotesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly blacklist: FieldRef<"User", 'Boolean'>
    readonly defaultVote: FieldRef<"User", 'String'>
    readonly isAvaliator: FieldRef<"User", 'Boolean'>
    readonly isSuperAvaliator: FieldRef<"User", 'Boolean'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly analisingId: FieldRef<"User", 'Int'>
    readonly coins: FieldRef<"User", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.applications
   */
  export type User$applicationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    where?: ApplicationWhereInput
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    cursor?: ApplicationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ApplicationScalarFieldEnum | ApplicationScalarFieldEnum[]
  }

  /**
   * User.cooldowns
   */
  export type User$cooldownsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cooldown
     */
    select?: CooldownSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cooldown
     */
    omit?: CooldownOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CooldownInclude<ExtArgs> | null
    where?: CooldownWhereInput
    orderBy?: CooldownOrderByWithRelationInput | CooldownOrderByWithRelationInput[]
    cursor?: CooldownWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CooldownScalarFieldEnum | CooldownScalarFieldEnum[]
  }

  /**
   * User.analyzes
   */
  export type User$analyzesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeInclude<ExtArgs> | null
    where?: AnalyzeWhereInput
    orderBy?: AnalyzeOrderByWithRelationInput | AnalyzeOrderByWithRelationInput[]
    cursor?: AnalyzeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AnalyzeScalarFieldEnum | AnalyzeScalarFieldEnum[]
  }

  /**
   * User.votes
   */
  export type User$votesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesInclude<ExtArgs> | null
    where?: VotesWhereInput
    orderBy?: VotesOrderByWithRelationInput | VotesOrderByWithRelationInput[]
    cursor?: VotesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VotesScalarFieldEnum | VotesScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Votes
   */

  export type AggregateVotes = {
    _count: VotesCountAggregateOutputType | null
    _avg: VotesAvgAggregateOutputType | null
    _sum: VotesSumAggregateOutputType | null
    _min: VotesMinAggregateOutputType | null
    _max: VotesMaxAggregateOutputType | null
  }

  export type VotesAvgAggregateOutputType = {
    id: number | null
  }

  export type VotesSumAggregateOutputType = {
    id: number | null
  }

  export type VotesMinAggregateOutputType = {
    id: number | null
    userId: string | null
    applicationId: string | null
    createdAt: Date | null
  }

  export type VotesMaxAggregateOutputType = {
    id: number | null
    userId: string | null
    applicationId: string | null
    createdAt: Date | null
  }

  export type VotesCountAggregateOutputType = {
    id: number
    userId: number
    applicationId: number
    createdAt: number
    _all: number
  }


  export type VotesAvgAggregateInputType = {
    id?: true
  }

  export type VotesSumAggregateInputType = {
    id?: true
  }

  export type VotesMinAggregateInputType = {
    id?: true
    userId?: true
    applicationId?: true
    createdAt?: true
  }

  export type VotesMaxAggregateInputType = {
    id?: true
    userId?: true
    applicationId?: true
    createdAt?: true
  }

  export type VotesCountAggregateInputType = {
    id?: true
    userId?: true
    applicationId?: true
    createdAt?: true
    _all?: true
  }

  export type VotesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Votes to aggregate.
     */
    where?: VotesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Votes to fetch.
     */
    orderBy?: VotesOrderByWithRelationInput | VotesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VotesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Votes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Votes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Votes
    **/
    _count?: true | VotesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VotesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VotesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VotesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VotesMaxAggregateInputType
  }

  export type GetVotesAggregateType<T extends VotesAggregateArgs> = {
        [P in keyof T & keyof AggregateVotes]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVotes[P]>
      : GetScalarType<T[P], AggregateVotes[P]>
  }




  export type VotesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VotesWhereInput
    orderBy?: VotesOrderByWithAggregationInput | VotesOrderByWithAggregationInput[]
    by: VotesScalarFieldEnum[] | VotesScalarFieldEnum
    having?: VotesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VotesCountAggregateInputType | true
    _avg?: VotesAvgAggregateInputType
    _sum?: VotesSumAggregateInputType
    _min?: VotesMinAggregateInputType
    _max?: VotesMaxAggregateInputType
  }

  export type VotesGroupByOutputType = {
    id: number
    userId: string
    applicationId: string
    createdAt: Date
    _count: VotesCountAggregateOutputType | null
    _avg: VotesAvgAggregateOutputType | null
    _sum: VotesSumAggregateOutputType | null
    _min: VotesMinAggregateOutputType | null
    _max: VotesMaxAggregateOutputType | null
  }

  type GetVotesGroupByPayload<T extends VotesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VotesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VotesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VotesGroupByOutputType[P]>
            : GetScalarType<T[P], VotesGroupByOutputType[P]>
        }
      >
    >


  export type VotesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    applicationId?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    application?: boolean | ApplicationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["votes"]>

  export type VotesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    applicationId?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    application?: boolean | ApplicationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["votes"]>

  export type VotesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    applicationId?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    application?: boolean | ApplicationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["votes"]>

  export type VotesSelectScalar = {
    id?: boolean
    userId?: boolean
    applicationId?: boolean
    createdAt?: boolean
  }

  export type VotesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "applicationId" | "createdAt", ExtArgs["result"]["votes"]>
  export type VotesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    application?: boolean | ApplicationDefaultArgs<ExtArgs>
  }
  export type VotesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    application?: boolean | ApplicationDefaultArgs<ExtArgs>
  }
  export type VotesIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    application?: boolean | ApplicationDefaultArgs<ExtArgs>
  }

  export type $VotesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Votes"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      application: Prisma.$ApplicationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: string
      applicationId: string
      createdAt: Date
    }, ExtArgs["result"]["votes"]>
    composites: {}
  }

  type VotesGetPayload<S extends boolean | null | undefined | VotesDefaultArgs> = $Result.GetResult<Prisma.$VotesPayload, S>

  type VotesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VotesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VotesCountAggregateInputType | true
    }

  export interface VotesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Votes'], meta: { name: 'Votes' } }
    /**
     * Find zero or one Votes that matches the filter.
     * @param {VotesFindUniqueArgs} args - Arguments to find a Votes
     * @example
     * // Get one Votes
     * const votes = await prisma.votes.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VotesFindUniqueArgs>(args: SelectSubset<T, VotesFindUniqueArgs<ExtArgs>>): Prisma__VotesClient<$Result.GetResult<Prisma.$VotesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Votes that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VotesFindUniqueOrThrowArgs} args - Arguments to find a Votes
     * @example
     * // Get one Votes
     * const votes = await prisma.votes.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VotesFindUniqueOrThrowArgs>(args: SelectSubset<T, VotesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VotesClient<$Result.GetResult<Prisma.$VotesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Votes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VotesFindFirstArgs} args - Arguments to find a Votes
     * @example
     * // Get one Votes
     * const votes = await prisma.votes.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VotesFindFirstArgs>(args?: SelectSubset<T, VotesFindFirstArgs<ExtArgs>>): Prisma__VotesClient<$Result.GetResult<Prisma.$VotesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Votes that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VotesFindFirstOrThrowArgs} args - Arguments to find a Votes
     * @example
     * // Get one Votes
     * const votes = await prisma.votes.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VotesFindFirstOrThrowArgs>(args?: SelectSubset<T, VotesFindFirstOrThrowArgs<ExtArgs>>): Prisma__VotesClient<$Result.GetResult<Prisma.$VotesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Votes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VotesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Votes
     * const votes = await prisma.votes.findMany()
     * 
     * // Get first 10 Votes
     * const votes = await prisma.votes.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const votesWithIdOnly = await prisma.votes.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VotesFindManyArgs>(args?: SelectSubset<T, VotesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VotesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Votes.
     * @param {VotesCreateArgs} args - Arguments to create a Votes.
     * @example
     * // Create one Votes
     * const Votes = await prisma.votes.create({
     *   data: {
     *     // ... data to create a Votes
     *   }
     * })
     * 
     */
    create<T extends VotesCreateArgs>(args: SelectSubset<T, VotesCreateArgs<ExtArgs>>): Prisma__VotesClient<$Result.GetResult<Prisma.$VotesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Votes.
     * @param {VotesCreateManyArgs} args - Arguments to create many Votes.
     * @example
     * // Create many Votes
     * const votes = await prisma.votes.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VotesCreateManyArgs>(args?: SelectSubset<T, VotesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Votes and returns the data saved in the database.
     * @param {VotesCreateManyAndReturnArgs} args - Arguments to create many Votes.
     * @example
     * // Create many Votes
     * const votes = await prisma.votes.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Votes and only return the `id`
     * const votesWithIdOnly = await prisma.votes.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VotesCreateManyAndReturnArgs>(args?: SelectSubset<T, VotesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VotesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Votes.
     * @param {VotesDeleteArgs} args - Arguments to delete one Votes.
     * @example
     * // Delete one Votes
     * const Votes = await prisma.votes.delete({
     *   where: {
     *     // ... filter to delete one Votes
     *   }
     * })
     * 
     */
    delete<T extends VotesDeleteArgs>(args: SelectSubset<T, VotesDeleteArgs<ExtArgs>>): Prisma__VotesClient<$Result.GetResult<Prisma.$VotesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Votes.
     * @param {VotesUpdateArgs} args - Arguments to update one Votes.
     * @example
     * // Update one Votes
     * const votes = await prisma.votes.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VotesUpdateArgs>(args: SelectSubset<T, VotesUpdateArgs<ExtArgs>>): Prisma__VotesClient<$Result.GetResult<Prisma.$VotesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Votes.
     * @param {VotesDeleteManyArgs} args - Arguments to filter Votes to delete.
     * @example
     * // Delete a few Votes
     * const { count } = await prisma.votes.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VotesDeleteManyArgs>(args?: SelectSubset<T, VotesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Votes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VotesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Votes
     * const votes = await prisma.votes.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VotesUpdateManyArgs>(args: SelectSubset<T, VotesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Votes and returns the data updated in the database.
     * @param {VotesUpdateManyAndReturnArgs} args - Arguments to update many Votes.
     * @example
     * // Update many Votes
     * const votes = await prisma.votes.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Votes and only return the `id`
     * const votesWithIdOnly = await prisma.votes.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VotesUpdateManyAndReturnArgs>(args: SelectSubset<T, VotesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VotesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Votes.
     * @param {VotesUpsertArgs} args - Arguments to update or create a Votes.
     * @example
     * // Update or create a Votes
     * const votes = await prisma.votes.upsert({
     *   create: {
     *     // ... data to create a Votes
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Votes we want to update
     *   }
     * })
     */
    upsert<T extends VotesUpsertArgs>(args: SelectSubset<T, VotesUpsertArgs<ExtArgs>>): Prisma__VotesClient<$Result.GetResult<Prisma.$VotesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Votes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VotesCountArgs} args - Arguments to filter Votes to count.
     * @example
     * // Count the number of Votes
     * const count = await prisma.votes.count({
     *   where: {
     *     // ... the filter for the Votes we want to count
     *   }
     * })
    **/
    count<T extends VotesCountArgs>(
      args?: Subset<T, VotesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VotesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Votes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VotesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VotesAggregateArgs>(args: Subset<T, VotesAggregateArgs>): Prisma.PrismaPromise<GetVotesAggregateType<T>>

    /**
     * Group by Votes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VotesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VotesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VotesGroupByArgs['orderBy'] }
        : { orderBy?: VotesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VotesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVotesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Votes model
   */
  readonly fields: VotesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Votes.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VotesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    application<T extends ApplicationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ApplicationDefaultArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Votes model
   */
  interface VotesFieldRefs {
    readonly id: FieldRef<"Votes", 'Int'>
    readonly userId: FieldRef<"Votes", 'String'>
    readonly applicationId: FieldRef<"Votes", 'String'>
    readonly createdAt: FieldRef<"Votes", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Votes findUnique
   */
  export type VotesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesInclude<ExtArgs> | null
    /**
     * Filter, which Votes to fetch.
     */
    where: VotesWhereUniqueInput
  }

  /**
   * Votes findUniqueOrThrow
   */
  export type VotesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesInclude<ExtArgs> | null
    /**
     * Filter, which Votes to fetch.
     */
    where: VotesWhereUniqueInput
  }

  /**
   * Votes findFirst
   */
  export type VotesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesInclude<ExtArgs> | null
    /**
     * Filter, which Votes to fetch.
     */
    where?: VotesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Votes to fetch.
     */
    orderBy?: VotesOrderByWithRelationInput | VotesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Votes.
     */
    cursor?: VotesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Votes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Votes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Votes.
     */
    distinct?: VotesScalarFieldEnum | VotesScalarFieldEnum[]
  }

  /**
   * Votes findFirstOrThrow
   */
  export type VotesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesInclude<ExtArgs> | null
    /**
     * Filter, which Votes to fetch.
     */
    where?: VotesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Votes to fetch.
     */
    orderBy?: VotesOrderByWithRelationInput | VotesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Votes.
     */
    cursor?: VotesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Votes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Votes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Votes.
     */
    distinct?: VotesScalarFieldEnum | VotesScalarFieldEnum[]
  }

  /**
   * Votes findMany
   */
  export type VotesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesInclude<ExtArgs> | null
    /**
     * Filter, which Votes to fetch.
     */
    where?: VotesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Votes to fetch.
     */
    orderBy?: VotesOrderByWithRelationInput | VotesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Votes.
     */
    cursor?: VotesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Votes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Votes.
     */
    skip?: number
    distinct?: VotesScalarFieldEnum | VotesScalarFieldEnum[]
  }

  /**
   * Votes create
   */
  export type VotesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesInclude<ExtArgs> | null
    /**
     * The data needed to create a Votes.
     */
    data: XOR<VotesCreateInput, VotesUncheckedCreateInput>
  }

  /**
   * Votes createMany
   */
  export type VotesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Votes.
     */
    data: VotesCreateManyInput | VotesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Votes createManyAndReturn
   */
  export type VotesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * The data used to create many Votes.
     */
    data: VotesCreateManyInput | VotesCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Votes update
   */
  export type VotesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesInclude<ExtArgs> | null
    /**
     * The data needed to update a Votes.
     */
    data: XOR<VotesUpdateInput, VotesUncheckedUpdateInput>
    /**
     * Choose, which Votes to update.
     */
    where: VotesWhereUniqueInput
  }

  /**
   * Votes updateMany
   */
  export type VotesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Votes.
     */
    data: XOR<VotesUpdateManyMutationInput, VotesUncheckedUpdateManyInput>
    /**
     * Filter which Votes to update
     */
    where?: VotesWhereInput
    /**
     * Limit how many Votes to update.
     */
    limit?: number
  }

  /**
   * Votes updateManyAndReturn
   */
  export type VotesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * The data used to update Votes.
     */
    data: XOR<VotesUpdateManyMutationInput, VotesUncheckedUpdateManyInput>
    /**
     * Filter which Votes to update
     */
    where?: VotesWhereInput
    /**
     * Limit how many Votes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Votes upsert
   */
  export type VotesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesInclude<ExtArgs> | null
    /**
     * The filter to search for the Votes to update in case it exists.
     */
    where: VotesWhereUniqueInput
    /**
     * In case the Votes found by the `where` argument doesn't exist, create a new Votes with this data.
     */
    create: XOR<VotesCreateInput, VotesUncheckedCreateInput>
    /**
     * In case the Votes was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VotesUpdateInput, VotesUncheckedUpdateInput>
  }

  /**
   * Votes delete
   */
  export type VotesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesInclude<ExtArgs> | null
    /**
     * Filter which Votes to delete.
     */
    where: VotesWhereUniqueInput
  }

  /**
   * Votes deleteMany
   */
  export type VotesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Votes to delete
     */
    where?: VotesWhereInput
    /**
     * Limit how many Votes to delete.
     */
    limit?: number
  }

  /**
   * Votes without action
   */
  export type VotesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesInclude<ExtArgs> | null
  }


  /**
   * Model Application
   */

  export type AggregateApplication = {
    _count: ApplicationCountAggregateOutputType | null
    _avg: ApplicationAvgAggregateOutputType | null
    _sum: ApplicationSumAggregateOutputType | null
    _min: ApplicationMinAggregateOutputType | null
    _max: ApplicationMaxAggregateOutputType | null
  }

  export type ApplicationAvgAggregateOutputType = {
    analyzeId: number | null
  }

  export type ApplicationSumAggregateOutputType = {
    analyzeId: number | null
  }

  export type ApplicationMinAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    language: string | null
    lib: string | null
    description: string | null
    prefix: string | null
    prefix2: string | null
    createdAt: Date | null
    analyzeId: number | null
    carefulAnalysis: boolean | null
  }

  export type ApplicationMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    language: string | null
    lib: string | null
    description: string | null
    prefix: string | null
    prefix2: string | null
    createdAt: Date | null
    analyzeId: number | null
    carefulAnalysis: boolean | null
  }

  export type ApplicationCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    language: number
    lib: number
    description: number
    prefix: number
    prefix2: number
    createdAt: number
    analyzeId: number
    carefulAnalysis: number
    _all: number
  }


  export type ApplicationAvgAggregateInputType = {
    analyzeId?: true
  }

  export type ApplicationSumAggregateInputType = {
    analyzeId?: true
  }

  export type ApplicationMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    language?: true
    lib?: true
    description?: true
    prefix?: true
    prefix2?: true
    createdAt?: true
    analyzeId?: true
    carefulAnalysis?: true
  }

  export type ApplicationMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    language?: true
    lib?: true
    description?: true
    prefix?: true
    prefix2?: true
    createdAt?: true
    analyzeId?: true
    carefulAnalysis?: true
  }

  export type ApplicationCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    language?: true
    lib?: true
    description?: true
    prefix?: true
    prefix2?: true
    createdAt?: true
    analyzeId?: true
    carefulAnalysis?: true
    _all?: true
  }

  export type ApplicationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Application to aggregate.
     */
    where?: ApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Applications to fetch.
     */
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Applications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Applications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Applications
    **/
    _count?: true | ApplicationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ApplicationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ApplicationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApplicationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApplicationMaxAggregateInputType
  }

  export type GetApplicationAggregateType<T extends ApplicationAggregateArgs> = {
        [P in keyof T & keyof AggregateApplication]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApplication[P]>
      : GetScalarType<T[P], AggregateApplication[P]>
  }




  export type ApplicationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApplicationWhereInput
    orderBy?: ApplicationOrderByWithAggregationInput | ApplicationOrderByWithAggregationInput[]
    by: ApplicationScalarFieldEnum[] | ApplicationScalarFieldEnum
    having?: ApplicationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApplicationCountAggregateInputType | true
    _avg?: ApplicationAvgAggregateInputType
    _sum?: ApplicationSumAggregateInputType
    _min?: ApplicationMinAggregateInputType
    _max?: ApplicationMaxAggregateInputType
  }

  export type ApplicationGroupByOutputType = {
    id: string
    userId: string
    name: string
    language: string
    lib: string
    description: string | null
    prefix: string
    prefix2: string | null
    createdAt: Date
    analyzeId: number | null
    carefulAnalysis: boolean
    _count: ApplicationCountAggregateOutputType | null
    _avg: ApplicationAvgAggregateOutputType | null
    _sum: ApplicationSumAggregateOutputType | null
    _min: ApplicationMinAggregateOutputType | null
    _max: ApplicationMaxAggregateOutputType | null
  }

  type GetApplicationGroupByPayload<T extends ApplicationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApplicationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApplicationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApplicationGroupByOutputType[P]>
            : GetScalarType<T[P], ApplicationGroupByOutputType[P]>
        }
      >
    >


  export type ApplicationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    language?: boolean
    lib?: boolean
    description?: boolean
    prefix?: boolean
    prefix2?: boolean
    createdAt?: boolean
    analyzeId?: boolean
    carefulAnalysis?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    votes?: boolean | Application$votesArgs<ExtArgs>
    analyze?: boolean | Application$analyzeArgs<ExtArgs>
    _count?: boolean | ApplicationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["application"]>

  export type ApplicationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    language?: boolean
    lib?: boolean
    description?: boolean
    prefix?: boolean
    prefix2?: boolean
    createdAt?: boolean
    analyzeId?: boolean
    carefulAnalysis?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    analyze?: boolean | Application$analyzeArgs<ExtArgs>
  }, ExtArgs["result"]["application"]>

  export type ApplicationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    language?: boolean
    lib?: boolean
    description?: boolean
    prefix?: boolean
    prefix2?: boolean
    createdAt?: boolean
    analyzeId?: boolean
    carefulAnalysis?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    analyze?: boolean | Application$analyzeArgs<ExtArgs>
  }, ExtArgs["result"]["application"]>

  export type ApplicationSelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    language?: boolean
    lib?: boolean
    description?: boolean
    prefix?: boolean
    prefix2?: boolean
    createdAt?: boolean
    analyzeId?: boolean
    carefulAnalysis?: boolean
  }

  export type ApplicationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "name" | "language" | "lib" | "description" | "prefix" | "prefix2" | "createdAt" | "analyzeId" | "carefulAnalysis", ExtArgs["result"]["application"]>
  export type ApplicationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    votes?: boolean | Application$votesArgs<ExtArgs>
    analyze?: boolean | Application$analyzeArgs<ExtArgs>
    _count?: boolean | ApplicationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ApplicationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    analyze?: boolean | Application$analyzeArgs<ExtArgs>
  }
  export type ApplicationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    analyze?: boolean | Application$analyzeArgs<ExtArgs>
  }

  export type $ApplicationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Application"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      votes: Prisma.$VotesPayload<ExtArgs>[]
      analyze: Prisma.$AnalyzePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      name: string
      language: string
      lib: string
      description: string | null
      prefix: string
      prefix2: string | null
      createdAt: Date
      analyzeId: number | null
      carefulAnalysis: boolean
    }, ExtArgs["result"]["application"]>
    composites: {}
  }

  type ApplicationGetPayload<S extends boolean | null | undefined | ApplicationDefaultArgs> = $Result.GetResult<Prisma.$ApplicationPayload, S>

  type ApplicationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApplicationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApplicationCountAggregateInputType | true
    }

  export interface ApplicationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Application'], meta: { name: 'Application' } }
    /**
     * Find zero or one Application that matches the filter.
     * @param {ApplicationFindUniqueArgs} args - Arguments to find a Application
     * @example
     * // Get one Application
     * const application = await prisma.application.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApplicationFindUniqueArgs>(args: SelectSubset<T, ApplicationFindUniqueArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Application that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApplicationFindUniqueOrThrowArgs} args - Arguments to find a Application
     * @example
     * // Get one Application
     * const application = await prisma.application.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApplicationFindUniqueOrThrowArgs>(args: SelectSubset<T, ApplicationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Application that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFindFirstArgs} args - Arguments to find a Application
     * @example
     * // Get one Application
     * const application = await prisma.application.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApplicationFindFirstArgs>(args?: SelectSubset<T, ApplicationFindFirstArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Application that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFindFirstOrThrowArgs} args - Arguments to find a Application
     * @example
     * // Get one Application
     * const application = await prisma.application.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApplicationFindFirstOrThrowArgs>(args?: SelectSubset<T, ApplicationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Applications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Applications
     * const applications = await prisma.application.findMany()
     * 
     * // Get first 10 Applications
     * const applications = await prisma.application.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const applicationWithIdOnly = await prisma.application.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApplicationFindManyArgs>(args?: SelectSubset<T, ApplicationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Application.
     * @param {ApplicationCreateArgs} args - Arguments to create a Application.
     * @example
     * // Create one Application
     * const Application = await prisma.application.create({
     *   data: {
     *     // ... data to create a Application
     *   }
     * })
     * 
     */
    create<T extends ApplicationCreateArgs>(args: SelectSubset<T, ApplicationCreateArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Applications.
     * @param {ApplicationCreateManyArgs} args - Arguments to create many Applications.
     * @example
     * // Create many Applications
     * const application = await prisma.application.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApplicationCreateManyArgs>(args?: SelectSubset<T, ApplicationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Applications and returns the data saved in the database.
     * @param {ApplicationCreateManyAndReturnArgs} args - Arguments to create many Applications.
     * @example
     * // Create many Applications
     * const application = await prisma.application.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Applications and only return the `id`
     * const applicationWithIdOnly = await prisma.application.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApplicationCreateManyAndReturnArgs>(args?: SelectSubset<T, ApplicationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Application.
     * @param {ApplicationDeleteArgs} args - Arguments to delete one Application.
     * @example
     * // Delete one Application
     * const Application = await prisma.application.delete({
     *   where: {
     *     // ... filter to delete one Application
     *   }
     * })
     * 
     */
    delete<T extends ApplicationDeleteArgs>(args: SelectSubset<T, ApplicationDeleteArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Application.
     * @param {ApplicationUpdateArgs} args - Arguments to update one Application.
     * @example
     * // Update one Application
     * const application = await prisma.application.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApplicationUpdateArgs>(args: SelectSubset<T, ApplicationUpdateArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Applications.
     * @param {ApplicationDeleteManyArgs} args - Arguments to filter Applications to delete.
     * @example
     * // Delete a few Applications
     * const { count } = await prisma.application.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApplicationDeleteManyArgs>(args?: SelectSubset<T, ApplicationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Applications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Applications
     * const application = await prisma.application.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApplicationUpdateManyArgs>(args: SelectSubset<T, ApplicationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Applications and returns the data updated in the database.
     * @param {ApplicationUpdateManyAndReturnArgs} args - Arguments to update many Applications.
     * @example
     * // Update many Applications
     * const application = await prisma.application.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Applications and only return the `id`
     * const applicationWithIdOnly = await prisma.application.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ApplicationUpdateManyAndReturnArgs>(args: SelectSubset<T, ApplicationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Application.
     * @param {ApplicationUpsertArgs} args - Arguments to update or create a Application.
     * @example
     * // Update or create a Application
     * const application = await prisma.application.upsert({
     *   create: {
     *     // ... data to create a Application
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Application we want to update
     *   }
     * })
     */
    upsert<T extends ApplicationUpsertArgs>(args: SelectSubset<T, ApplicationUpsertArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Applications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationCountArgs} args - Arguments to filter Applications to count.
     * @example
     * // Count the number of Applications
     * const count = await prisma.application.count({
     *   where: {
     *     // ... the filter for the Applications we want to count
     *   }
     * })
    **/
    count<T extends ApplicationCountArgs>(
      args?: Subset<T, ApplicationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApplicationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Application.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApplicationAggregateArgs>(args: Subset<T, ApplicationAggregateArgs>): Prisma.PrismaPromise<GetApplicationAggregateType<T>>

    /**
     * Group by Application.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApplicationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApplicationGroupByArgs['orderBy'] }
        : { orderBy?: ApplicationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApplicationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApplicationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Application model
   */
  readonly fields: ApplicationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Application.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApplicationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    votes<T extends Application$votesArgs<ExtArgs> = {}>(args?: Subset<T, Application$votesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VotesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    analyze<T extends Application$analyzeArgs<ExtArgs> = {}>(args?: Subset<T, Application$analyzeArgs<ExtArgs>>): Prisma__AnalyzeClient<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Application model
   */
  interface ApplicationFieldRefs {
    readonly id: FieldRef<"Application", 'String'>
    readonly userId: FieldRef<"Application", 'String'>
    readonly name: FieldRef<"Application", 'String'>
    readonly language: FieldRef<"Application", 'String'>
    readonly lib: FieldRef<"Application", 'String'>
    readonly description: FieldRef<"Application", 'String'>
    readonly prefix: FieldRef<"Application", 'String'>
    readonly prefix2: FieldRef<"Application", 'String'>
    readonly createdAt: FieldRef<"Application", 'DateTime'>
    readonly analyzeId: FieldRef<"Application", 'Int'>
    readonly carefulAnalysis: FieldRef<"Application", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Application findUnique
   */
  export type ApplicationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Application to fetch.
     */
    where: ApplicationWhereUniqueInput
  }

  /**
   * Application findUniqueOrThrow
   */
  export type ApplicationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Application to fetch.
     */
    where: ApplicationWhereUniqueInput
  }

  /**
   * Application findFirst
   */
  export type ApplicationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Application to fetch.
     */
    where?: ApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Applications to fetch.
     */
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Applications.
     */
    cursor?: ApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Applications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Applications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Applications.
     */
    distinct?: ApplicationScalarFieldEnum | ApplicationScalarFieldEnum[]
  }

  /**
   * Application findFirstOrThrow
   */
  export type ApplicationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Application to fetch.
     */
    where?: ApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Applications to fetch.
     */
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Applications.
     */
    cursor?: ApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Applications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Applications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Applications.
     */
    distinct?: ApplicationScalarFieldEnum | ApplicationScalarFieldEnum[]
  }

  /**
   * Application findMany
   */
  export type ApplicationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Applications to fetch.
     */
    where?: ApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Applications to fetch.
     */
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Applications.
     */
    cursor?: ApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Applications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Applications.
     */
    skip?: number
    distinct?: ApplicationScalarFieldEnum | ApplicationScalarFieldEnum[]
  }

  /**
   * Application create
   */
  export type ApplicationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * The data needed to create a Application.
     */
    data: XOR<ApplicationCreateInput, ApplicationUncheckedCreateInput>
  }

  /**
   * Application createMany
   */
  export type ApplicationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Applications.
     */
    data: ApplicationCreateManyInput | ApplicationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Application createManyAndReturn
   */
  export type ApplicationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * The data used to create many Applications.
     */
    data: ApplicationCreateManyInput | ApplicationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Application update
   */
  export type ApplicationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * The data needed to update a Application.
     */
    data: XOR<ApplicationUpdateInput, ApplicationUncheckedUpdateInput>
    /**
     * Choose, which Application to update.
     */
    where: ApplicationWhereUniqueInput
  }

  /**
   * Application updateMany
   */
  export type ApplicationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Applications.
     */
    data: XOR<ApplicationUpdateManyMutationInput, ApplicationUncheckedUpdateManyInput>
    /**
     * Filter which Applications to update
     */
    where?: ApplicationWhereInput
    /**
     * Limit how many Applications to update.
     */
    limit?: number
  }

  /**
   * Application updateManyAndReturn
   */
  export type ApplicationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * The data used to update Applications.
     */
    data: XOR<ApplicationUpdateManyMutationInput, ApplicationUncheckedUpdateManyInput>
    /**
     * Filter which Applications to update
     */
    where?: ApplicationWhereInput
    /**
     * Limit how many Applications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Application upsert
   */
  export type ApplicationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * The filter to search for the Application to update in case it exists.
     */
    where: ApplicationWhereUniqueInput
    /**
     * In case the Application found by the `where` argument doesn't exist, create a new Application with this data.
     */
    create: XOR<ApplicationCreateInput, ApplicationUncheckedCreateInput>
    /**
     * In case the Application was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApplicationUpdateInput, ApplicationUncheckedUpdateInput>
  }

  /**
   * Application delete
   */
  export type ApplicationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter which Application to delete.
     */
    where: ApplicationWhereUniqueInput
  }

  /**
   * Application deleteMany
   */
  export type ApplicationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Applications to delete
     */
    where?: ApplicationWhereInput
    /**
     * Limit how many Applications to delete.
     */
    limit?: number
  }

  /**
   * Application.votes
   */
  export type Application$votesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Votes
     */
    select?: VotesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Votes
     */
    omit?: VotesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VotesInclude<ExtArgs> | null
    where?: VotesWhereInput
    orderBy?: VotesOrderByWithRelationInput | VotesOrderByWithRelationInput[]
    cursor?: VotesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VotesScalarFieldEnum | VotesScalarFieldEnum[]
  }

  /**
   * Application.analyze
   */
  export type Application$analyzeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeInclude<ExtArgs> | null
    where?: AnalyzeWhereInput
  }

  /**
   * Application without action
   */
  export type ApplicationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
  }


  /**
   * Model Cooldown
   */

  export type AggregateCooldown = {
    _count: CooldownCountAggregateOutputType | null
    _avg: CooldownAvgAggregateOutputType | null
    _sum: CooldownSumAggregateOutputType | null
    _min: CooldownMinAggregateOutputType | null
    _max: CooldownMaxAggregateOutputType | null
  }

  export type CooldownAvgAggregateOutputType = {
    id: number | null
  }

  export type CooldownSumAggregateOutputType = {
    id: number | null
  }

  export type CooldownMinAggregateOutputType = {
    id: number | null
    userId: string | null
    name: string | null
    createdAt: Date | null
    endIn: Date | null
  }

  export type CooldownMaxAggregateOutputType = {
    id: number | null
    userId: string | null
    name: string | null
    createdAt: Date | null
    endIn: Date | null
  }

  export type CooldownCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    createdAt: number
    endIn: number
    _all: number
  }


  export type CooldownAvgAggregateInputType = {
    id?: true
  }

  export type CooldownSumAggregateInputType = {
    id?: true
  }

  export type CooldownMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    createdAt?: true
    endIn?: true
  }

  export type CooldownMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    createdAt?: true
    endIn?: true
  }

  export type CooldownCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    createdAt?: true
    endIn?: true
    _all?: true
  }

  export type CooldownAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cooldown to aggregate.
     */
    where?: CooldownWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cooldowns to fetch.
     */
    orderBy?: CooldownOrderByWithRelationInput | CooldownOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CooldownWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cooldowns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cooldowns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Cooldowns
    **/
    _count?: true | CooldownCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CooldownAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CooldownSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CooldownMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CooldownMaxAggregateInputType
  }

  export type GetCooldownAggregateType<T extends CooldownAggregateArgs> = {
        [P in keyof T & keyof AggregateCooldown]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCooldown[P]>
      : GetScalarType<T[P], AggregateCooldown[P]>
  }




  export type CooldownGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CooldownWhereInput
    orderBy?: CooldownOrderByWithAggregationInput | CooldownOrderByWithAggregationInput[]
    by: CooldownScalarFieldEnum[] | CooldownScalarFieldEnum
    having?: CooldownScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CooldownCountAggregateInputType | true
    _avg?: CooldownAvgAggregateInputType
    _sum?: CooldownSumAggregateInputType
    _min?: CooldownMinAggregateInputType
    _max?: CooldownMaxAggregateInputType
  }

  export type CooldownGroupByOutputType = {
    id: number
    userId: string
    name: string
    createdAt: Date
    endIn: Date
    _count: CooldownCountAggregateOutputType | null
    _avg: CooldownAvgAggregateOutputType | null
    _sum: CooldownSumAggregateOutputType | null
    _min: CooldownMinAggregateOutputType | null
    _max: CooldownMaxAggregateOutputType | null
  }

  type GetCooldownGroupByPayload<T extends CooldownGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CooldownGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CooldownGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CooldownGroupByOutputType[P]>
            : GetScalarType<T[P], CooldownGroupByOutputType[P]>
        }
      >
    >


  export type CooldownSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    createdAt?: boolean
    endIn?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cooldown"]>

  export type CooldownSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    createdAt?: boolean
    endIn?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cooldown"]>

  export type CooldownSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    createdAt?: boolean
    endIn?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cooldown"]>

  export type CooldownSelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    createdAt?: boolean
    endIn?: boolean
  }

  export type CooldownOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "name" | "createdAt" | "endIn", ExtArgs["result"]["cooldown"]>
  export type CooldownInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CooldownIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CooldownIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $CooldownPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Cooldown"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: string
      name: string
      createdAt: Date
      endIn: Date
    }, ExtArgs["result"]["cooldown"]>
    composites: {}
  }

  type CooldownGetPayload<S extends boolean | null | undefined | CooldownDefaultArgs> = $Result.GetResult<Prisma.$CooldownPayload, S>

  type CooldownCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CooldownFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CooldownCountAggregateInputType | true
    }

  export interface CooldownDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Cooldown'], meta: { name: 'Cooldown' } }
    /**
     * Find zero or one Cooldown that matches the filter.
     * @param {CooldownFindUniqueArgs} args - Arguments to find a Cooldown
     * @example
     * // Get one Cooldown
     * const cooldown = await prisma.cooldown.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CooldownFindUniqueArgs>(args: SelectSubset<T, CooldownFindUniqueArgs<ExtArgs>>): Prisma__CooldownClient<$Result.GetResult<Prisma.$CooldownPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Cooldown that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CooldownFindUniqueOrThrowArgs} args - Arguments to find a Cooldown
     * @example
     * // Get one Cooldown
     * const cooldown = await prisma.cooldown.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CooldownFindUniqueOrThrowArgs>(args: SelectSubset<T, CooldownFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CooldownClient<$Result.GetResult<Prisma.$CooldownPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cooldown that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CooldownFindFirstArgs} args - Arguments to find a Cooldown
     * @example
     * // Get one Cooldown
     * const cooldown = await prisma.cooldown.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CooldownFindFirstArgs>(args?: SelectSubset<T, CooldownFindFirstArgs<ExtArgs>>): Prisma__CooldownClient<$Result.GetResult<Prisma.$CooldownPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cooldown that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CooldownFindFirstOrThrowArgs} args - Arguments to find a Cooldown
     * @example
     * // Get one Cooldown
     * const cooldown = await prisma.cooldown.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CooldownFindFirstOrThrowArgs>(args?: SelectSubset<T, CooldownFindFirstOrThrowArgs<ExtArgs>>): Prisma__CooldownClient<$Result.GetResult<Prisma.$CooldownPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Cooldowns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CooldownFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cooldowns
     * const cooldowns = await prisma.cooldown.findMany()
     * 
     * // Get first 10 Cooldowns
     * const cooldowns = await prisma.cooldown.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cooldownWithIdOnly = await prisma.cooldown.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CooldownFindManyArgs>(args?: SelectSubset<T, CooldownFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CooldownPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Cooldown.
     * @param {CooldownCreateArgs} args - Arguments to create a Cooldown.
     * @example
     * // Create one Cooldown
     * const Cooldown = await prisma.cooldown.create({
     *   data: {
     *     // ... data to create a Cooldown
     *   }
     * })
     * 
     */
    create<T extends CooldownCreateArgs>(args: SelectSubset<T, CooldownCreateArgs<ExtArgs>>): Prisma__CooldownClient<$Result.GetResult<Prisma.$CooldownPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Cooldowns.
     * @param {CooldownCreateManyArgs} args - Arguments to create many Cooldowns.
     * @example
     * // Create many Cooldowns
     * const cooldown = await prisma.cooldown.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CooldownCreateManyArgs>(args?: SelectSubset<T, CooldownCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Cooldowns and returns the data saved in the database.
     * @param {CooldownCreateManyAndReturnArgs} args - Arguments to create many Cooldowns.
     * @example
     * // Create many Cooldowns
     * const cooldown = await prisma.cooldown.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Cooldowns and only return the `id`
     * const cooldownWithIdOnly = await prisma.cooldown.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CooldownCreateManyAndReturnArgs>(args?: SelectSubset<T, CooldownCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CooldownPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Cooldown.
     * @param {CooldownDeleteArgs} args - Arguments to delete one Cooldown.
     * @example
     * // Delete one Cooldown
     * const Cooldown = await prisma.cooldown.delete({
     *   where: {
     *     // ... filter to delete one Cooldown
     *   }
     * })
     * 
     */
    delete<T extends CooldownDeleteArgs>(args: SelectSubset<T, CooldownDeleteArgs<ExtArgs>>): Prisma__CooldownClient<$Result.GetResult<Prisma.$CooldownPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Cooldown.
     * @param {CooldownUpdateArgs} args - Arguments to update one Cooldown.
     * @example
     * // Update one Cooldown
     * const cooldown = await prisma.cooldown.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CooldownUpdateArgs>(args: SelectSubset<T, CooldownUpdateArgs<ExtArgs>>): Prisma__CooldownClient<$Result.GetResult<Prisma.$CooldownPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Cooldowns.
     * @param {CooldownDeleteManyArgs} args - Arguments to filter Cooldowns to delete.
     * @example
     * // Delete a few Cooldowns
     * const { count } = await prisma.cooldown.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CooldownDeleteManyArgs>(args?: SelectSubset<T, CooldownDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cooldowns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CooldownUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cooldowns
     * const cooldown = await prisma.cooldown.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CooldownUpdateManyArgs>(args: SelectSubset<T, CooldownUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cooldowns and returns the data updated in the database.
     * @param {CooldownUpdateManyAndReturnArgs} args - Arguments to update many Cooldowns.
     * @example
     * // Update many Cooldowns
     * const cooldown = await prisma.cooldown.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Cooldowns and only return the `id`
     * const cooldownWithIdOnly = await prisma.cooldown.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CooldownUpdateManyAndReturnArgs>(args: SelectSubset<T, CooldownUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CooldownPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Cooldown.
     * @param {CooldownUpsertArgs} args - Arguments to update or create a Cooldown.
     * @example
     * // Update or create a Cooldown
     * const cooldown = await prisma.cooldown.upsert({
     *   create: {
     *     // ... data to create a Cooldown
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cooldown we want to update
     *   }
     * })
     */
    upsert<T extends CooldownUpsertArgs>(args: SelectSubset<T, CooldownUpsertArgs<ExtArgs>>): Prisma__CooldownClient<$Result.GetResult<Prisma.$CooldownPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Cooldowns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CooldownCountArgs} args - Arguments to filter Cooldowns to count.
     * @example
     * // Count the number of Cooldowns
     * const count = await prisma.cooldown.count({
     *   where: {
     *     // ... the filter for the Cooldowns we want to count
     *   }
     * })
    **/
    count<T extends CooldownCountArgs>(
      args?: Subset<T, CooldownCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CooldownCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cooldown.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CooldownAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CooldownAggregateArgs>(args: Subset<T, CooldownAggregateArgs>): Prisma.PrismaPromise<GetCooldownAggregateType<T>>

    /**
     * Group by Cooldown.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CooldownGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CooldownGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CooldownGroupByArgs['orderBy'] }
        : { orderBy?: CooldownGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CooldownGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCooldownGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Cooldown model
   */
  readonly fields: CooldownFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Cooldown.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CooldownClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Cooldown model
   */
  interface CooldownFieldRefs {
    readonly id: FieldRef<"Cooldown", 'Int'>
    readonly userId: FieldRef<"Cooldown", 'String'>
    readonly name: FieldRef<"Cooldown", 'String'>
    readonly createdAt: FieldRef<"Cooldown", 'DateTime'>
    readonly endIn: FieldRef<"Cooldown", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Cooldown findUnique
   */
  export type CooldownFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cooldown
     */
    select?: CooldownSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cooldown
     */
    omit?: CooldownOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CooldownInclude<ExtArgs> | null
    /**
     * Filter, which Cooldown to fetch.
     */
    where: CooldownWhereUniqueInput
  }

  /**
   * Cooldown findUniqueOrThrow
   */
  export type CooldownFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cooldown
     */
    select?: CooldownSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cooldown
     */
    omit?: CooldownOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CooldownInclude<ExtArgs> | null
    /**
     * Filter, which Cooldown to fetch.
     */
    where: CooldownWhereUniqueInput
  }

  /**
   * Cooldown findFirst
   */
  export type CooldownFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cooldown
     */
    select?: CooldownSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cooldown
     */
    omit?: CooldownOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CooldownInclude<ExtArgs> | null
    /**
     * Filter, which Cooldown to fetch.
     */
    where?: CooldownWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cooldowns to fetch.
     */
    orderBy?: CooldownOrderByWithRelationInput | CooldownOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cooldowns.
     */
    cursor?: CooldownWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cooldowns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cooldowns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cooldowns.
     */
    distinct?: CooldownScalarFieldEnum | CooldownScalarFieldEnum[]
  }

  /**
   * Cooldown findFirstOrThrow
   */
  export type CooldownFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cooldown
     */
    select?: CooldownSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cooldown
     */
    omit?: CooldownOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CooldownInclude<ExtArgs> | null
    /**
     * Filter, which Cooldown to fetch.
     */
    where?: CooldownWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cooldowns to fetch.
     */
    orderBy?: CooldownOrderByWithRelationInput | CooldownOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cooldowns.
     */
    cursor?: CooldownWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cooldowns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cooldowns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cooldowns.
     */
    distinct?: CooldownScalarFieldEnum | CooldownScalarFieldEnum[]
  }

  /**
   * Cooldown findMany
   */
  export type CooldownFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cooldown
     */
    select?: CooldownSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cooldown
     */
    omit?: CooldownOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CooldownInclude<ExtArgs> | null
    /**
     * Filter, which Cooldowns to fetch.
     */
    where?: CooldownWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cooldowns to fetch.
     */
    orderBy?: CooldownOrderByWithRelationInput | CooldownOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Cooldowns.
     */
    cursor?: CooldownWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cooldowns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cooldowns.
     */
    skip?: number
    distinct?: CooldownScalarFieldEnum | CooldownScalarFieldEnum[]
  }

  /**
   * Cooldown create
   */
  export type CooldownCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cooldown
     */
    select?: CooldownSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cooldown
     */
    omit?: CooldownOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CooldownInclude<ExtArgs> | null
    /**
     * The data needed to create a Cooldown.
     */
    data: XOR<CooldownCreateInput, CooldownUncheckedCreateInput>
  }

  /**
   * Cooldown createMany
   */
  export type CooldownCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Cooldowns.
     */
    data: CooldownCreateManyInput | CooldownCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cooldown createManyAndReturn
   */
  export type CooldownCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cooldown
     */
    select?: CooldownSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cooldown
     */
    omit?: CooldownOmit<ExtArgs> | null
    /**
     * The data used to create many Cooldowns.
     */
    data: CooldownCreateManyInput | CooldownCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CooldownIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cooldown update
   */
  export type CooldownUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cooldown
     */
    select?: CooldownSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cooldown
     */
    omit?: CooldownOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CooldownInclude<ExtArgs> | null
    /**
     * The data needed to update a Cooldown.
     */
    data: XOR<CooldownUpdateInput, CooldownUncheckedUpdateInput>
    /**
     * Choose, which Cooldown to update.
     */
    where: CooldownWhereUniqueInput
  }

  /**
   * Cooldown updateMany
   */
  export type CooldownUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Cooldowns.
     */
    data: XOR<CooldownUpdateManyMutationInput, CooldownUncheckedUpdateManyInput>
    /**
     * Filter which Cooldowns to update
     */
    where?: CooldownWhereInput
    /**
     * Limit how many Cooldowns to update.
     */
    limit?: number
  }

  /**
   * Cooldown updateManyAndReturn
   */
  export type CooldownUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cooldown
     */
    select?: CooldownSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cooldown
     */
    omit?: CooldownOmit<ExtArgs> | null
    /**
     * The data used to update Cooldowns.
     */
    data: XOR<CooldownUpdateManyMutationInput, CooldownUncheckedUpdateManyInput>
    /**
     * Filter which Cooldowns to update
     */
    where?: CooldownWhereInput
    /**
     * Limit how many Cooldowns to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CooldownIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cooldown upsert
   */
  export type CooldownUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cooldown
     */
    select?: CooldownSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cooldown
     */
    omit?: CooldownOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CooldownInclude<ExtArgs> | null
    /**
     * The filter to search for the Cooldown to update in case it exists.
     */
    where: CooldownWhereUniqueInput
    /**
     * In case the Cooldown found by the `where` argument doesn't exist, create a new Cooldown with this data.
     */
    create: XOR<CooldownCreateInput, CooldownUncheckedCreateInput>
    /**
     * In case the Cooldown was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CooldownUpdateInput, CooldownUncheckedUpdateInput>
  }

  /**
   * Cooldown delete
   */
  export type CooldownDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cooldown
     */
    select?: CooldownSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cooldown
     */
    omit?: CooldownOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CooldownInclude<ExtArgs> | null
    /**
     * Filter which Cooldown to delete.
     */
    where: CooldownWhereUniqueInput
  }

  /**
   * Cooldown deleteMany
   */
  export type CooldownDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cooldowns to delete
     */
    where?: CooldownWhereInput
    /**
     * Limit how many Cooldowns to delete.
     */
    limit?: number
  }

  /**
   * Cooldown without action
   */
  export type CooldownDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cooldown
     */
    select?: CooldownSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cooldown
     */
    omit?: CooldownOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CooldownInclude<ExtArgs> | null
  }


  /**
   * Model Annotation
   */

  export type AggregateAnnotation = {
    _count: AnnotationCountAggregateOutputType | null
    _avg: AnnotationAvgAggregateOutputType | null
    _sum: AnnotationSumAggregateOutputType | null
    _min: AnnotationMinAggregateOutputType | null
    _max: AnnotationMaxAggregateOutputType | null
  }

  export type AnnotationAvgAggregateOutputType = {
    id: number | null
    analyzeId: number | null
  }

  export type AnnotationSumAggregateOutputType = {
    id: number | null
    analyzeId: number | null
  }

  export type AnnotationMinAggregateOutputType = {
    id: number | null
    analyzeId: number | null
    type: string | null
    text: string | null
    createdAt: Date | null
  }

  export type AnnotationMaxAggregateOutputType = {
    id: number | null
    analyzeId: number | null
    type: string | null
    text: string | null
    createdAt: Date | null
  }

  export type AnnotationCountAggregateOutputType = {
    id: number
    analyzeId: number
    type: number
    text: number
    createdAt: number
    _all: number
  }


  export type AnnotationAvgAggregateInputType = {
    id?: true
    analyzeId?: true
  }

  export type AnnotationSumAggregateInputType = {
    id?: true
    analyzeId?: true
  }

  export type AnnotationMinAggregateInputType = {
    id?: true
    analyzeId?: true
    type?: true
    text?: true
    createdAt?: true
  }

  export type AnnotationMaxAggregateInputType = {
    id?: true
    analyzeId?: true
    type?: true
    text?: true
    createdAt?: true
  }

  export type AnnotationCountAggregateInputType = {
    id?: true
    analyzeId?: true
    type?: true
    text?: true
    createdAt?: true
    _all?: true
  }

  export type AnnotationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Annotation to aggregate.
     */
    where?: AnnotationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Annotations to fetch.
     */
    orderBy?: AnnotationOrderByWithRelationInput | AnnotationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AnnotationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Annotations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Annotations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Annotations
    **/
    _count?: true | AnnotationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AnnotationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AnnotationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AnnotationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AnnotationMaxAggregateInputType
  }

  export type GetAnnotationAggregateType<T extends AnnotationAggregateArgs> = {
        [P in keyof T & keyof AggregateAnnotation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnnotation[P]>
      : GetScalarType<T[P], AggregateAnnotation[P]>
  }




  export type AnnotationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnnotationWhereInput
    orderBy?: AnnotationOrderByWithAggregationInput | AnnotationOrderByWithAggregationInput[]
    by: AnnotationScalarFieldEnum[] | AnnotationScalarFieldEnum
    having?: AnnotationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AnnotationCountAggregateInputType | true
    _avg?: AnnotationAvgAggregateInputType
    _sum?: AnnotationSumAggregateInputType
    _min?: AnnotationMinAggregateInputType
    _max?: AnnotationMaxAggregateInputType
  }

  export type AnnotationGroupByOutputType = {
    id: number
    analyzeId: number
    type: string
    text: string
    createdAt: Date
    _count: AnnotationCountAggregateOutputType | null
    _avg: AnnotationAvgAggregateOutputType | null
    _sum: AnnotationSumAggregateOutputType | null
    _min: AnnotationMinAggregateOutputType | null
    _max: AnnotationMaxAggregateOutputType | null
  }

  type GetAnnotationGroupByPayload<T extends AnnotationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AnnotationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AnnotationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AnnotationGroupByOutputType[P]>
            : GetScalarType<T[P], AnnotationGroupByOutputType[P]>
        }
      >
    >


  export type AnnotationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    analyzeId?: boolean
    type?: boolean
    text?: boolean
    createdAt?: boolean
    analyze?: boolean | AnalyzeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["annotation"]>

  export type AnnotationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    analyzeId?: boolean
    type?: boolean
    text?: boolean
    createdAt?: boolean
    analyze?: boolean | AnalyzeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["annotation"]>

  export type AnnotationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    analyzeId?: boolean
    type?: boolean
    text?: boolean
    createdAt?: boolean
    analyze?: boolean | AnalyzeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["annotation"]>

  export type AnnotationSelectScalar = {
    id?: boolean
    analyzeId?: boolean
    type?: boolean
    text?: boolean
    createdAt?: boolean
  }

  export type AnnotationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "analyzeId" | "type" | "text" | "createdAt", ExtArgs["result"]["annotation"]>
  export type AnnotationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    analyze?: boolean | AnalyzeDefaultArgs<ExtArgs>
  }
  export type AnnotationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    analyze?: boolean | AnalyzeDefaultArgs<ExtArgs>
  }
  export type AnnotationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    analyze?: boolean | AnalyzeDefaultArgs<ExtArgs>
  }

  export type $AnnotationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Annotation"
    objects: {
      analyze: Prisma.$AnalyzePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      analyzeId: number
      type: string
      text: string
      createdAt: Date
    }, ExtArgs["result"]["annotation"]>
    composites: {}
  }

  type AnnotationGetPayload<S extends boolean | null | undefined | AnnotationDefaultArgs> = $Result.GetResult<Prisma.$AnnotationPayload, S>

  type AnnotationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AnnotationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AnnotationCountAggregateInputType | true
    }

  export interface AnnotationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Annotation'], meta: { name: 'Annotation' } }
    /**
     * Find zero or one Annotation that matches the filter.
     * @param {AnnotationFindUniqueArgs} args - Arguments to find a Annotation
     * @example
     * // Get one Annotation
     * const annotation = await prisma.annotation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnnotationFindUniqueArgs>(args: SelectSubset<T, AnnotationFindUniqueArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Annotation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnnotationFindUniqueOrThrowArgs} args - Arguments to find a Annotation
     * @example
     * // Get one Annotation
     * const annotation = await prisma.annotation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnnotationFindUniqueOrThrowArgs>(args: SelectSubset<T, AnnotationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Annotation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationFindFirstArgs} args - Arguments to find a Annotation
     * @example
     * // Get one Annotation
     * const annotation = await prisma.annotation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnnotationFindFirstArgs>(args?: SelectSubset<T, AnnotationFindFirstArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Annotation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationFindFirstOrThrowArgs} args - Arguments to find a Annotation
     * @example
     * // Get one Annotation
     * const annotation = await prisma.annotation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnnotationFindFirstOrThrowArgs>(args?: SelectSubset<T, AnnotationFindFirstOrThrowArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Annotations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Annotations
     * const annotations = await prisma.annotation.findMany()
     * 
     * // Get first 10 Annotations
     * const annotations = await prisma.annotation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const annotationWithIdOnly = await prisma.annotation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AnnotationFindManyArgs>(args?: SelectSubset<T, AnnotationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Annotation.
     * @param {AnnotationCreateArgs} args - Arguments to create a Annotation.
     * @example
     * // Create one Annotation
     * const Annotation = await prisma.annotation.create({
     *   data: {
     *     // ... data to create a Annotation
     *   }
     * })
     * 
     */
    create<T extends AnnotationCreateArgs>(args: SelectSubset<T, AnnotationCreateArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Annotations.
     * @param {AnnotationCreateManyArgs} args - Arguments to create many Annotations.
     * @example
     * // Create many Annotations
     * const annotation = await prisma.annotation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AnnotationCreateManyArgs>(args?: SelectSubset<T, AnnotationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Annotations and returns the data saved in the database.
     * @param {AnnotationCreateManyAndReturnArgs} args - Arguments to create many Annotations.
     * @example
     * // Create many Annotations
     * const annotation = await prisma.annotation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Annotations and only return the `id`
     * const annotationWithIdOnly = await prisma.annotation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AnnotationCreateManyAndReturnArgs>(args?: SelectSubset<T, AnnotationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Annotation.
     * @param {AnnotationDeleteArgs} args - Arguments to delete one Annotation.
     * @example
     * // Delete one Annotation
     * const Annotation = await prisma.annotation.delete({
     *   where: {
     *     // ... filter to delete one Annotation
     *   }
     * })
     * 
     */
    delete<T extends AnnotationDeleteArgs>(args: SelectSubset<T, AnnotationDeleteArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Annotation.
     * @param {AnnotationUpdateArgs} args - Arguments to update one Annotation.
     * @example
     * // Update one Annotation
     * const annotation = await prisma.annotation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AnnotationUpdateArgs>(args: SelectSubset<T, AnnotationUpdateArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Annotations.
     * @param {AnnotationDeleteManyArgs} args - Arguments to filter Annotations to delete.
     * @example
     * // Delete a few Annotations
     * const { count } = await prisma.annotation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AnnotationDeleteManyArgs>(args?: SelectSubset<T, AnnotationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Annotations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Annotations
     * const annotation = await prisma.annotation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AnnotationUpdateManyArgs>(args: SelectSubset<T, AnnotationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Annotations and returns the data updated in the database.
     * @param {AnnotationUpdateManyAndReturnArgs} args - Arguments to update many Annotations.
     * @example
     * // Update many Annotations
     * const annotation = await prisma.annotation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Annotations and only return the `id`
     * const annotationWithIdOnly = await prisma.annotation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AnnotationUpdateManyAndReturnArgs>(args: SelectSubset<T, AnnotationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Annotation.
     * @param {AnnotationUpsertArgs} args - Arguments to update or create a Annotation.
     * @example
     * // Update or create a Annotation
     * const annotation = await prisma.annotation.upsert({
     *   create: {
     *     // ... data to create a Annotation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Annotation we want to update
     *   }
     * })
     */
    upsert<T extends AnnotationUpsertArgs>(args: SelectSubset<T, AnnotationUpsertArgs<ExtArgs>>): Prisma__AnnotationClient<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Annotations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationCountArgs} args - Arguments to filter Annotations to count.
     * @example
     * // Count the number of Annotations
     * const count = await prisma.annotation.count({
     *   where: {
     *     // ... the filter for the Annotations we want to count
     *   }
     * })
    **/
    count<T extends AnnotationCountArgs>(
      args?: Subset<T, AnnotationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AnnotationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Annotation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AnnotationAggregateArgs>(args: Subset<T, AnnotationAggregateArgs>): Prisma.PrismaPromise<GetAnnotationAggregateType<T>>

    /**
     * Group by Annotation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnnotationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AnnotationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AnnotationGroupByArgs['orderBy'] }
        : { orderBy?: AnnotationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AnnotationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnnotationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Annotation model
   */
  readonly fields: AnnotationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Annotation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AnnotationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    analyze<T extends AnalyzeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AnalyzeDefaultArgs<ExtArgs>>): Prisma__AnalyzeClient<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Annotation model
   */
  interface AnnotationFieldRefs {
    readonly id: FieldRef<"Annotation", 'Int'>
    readonly analyzeId: FieldRef<"Annotation", 'Int'>
    readonly type: FieldRef<"Annotation", 'String'>
    readonly text: FieldRef<"Annotation", 'String'>
    readonly createdAt: FieldRef<"Annotation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Annotation findUnique
   */
  export type AnnotationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * Filter, which Annotation to fetch.
     */
    where: AnnotationWhereUniqueInput
  }

  /**
   * Annotation findUniqueOrThrow
   */
  export type AnnotationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * Filter, which Annotation to fetch.
     */
    where: AnnotationWhereUniqueInput
  }

  /**
   * Annotation findFirst
   */
  export type AnnotationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * Filter, which Annotation to fetch.
     */
    where?: AnnotationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Annotations to fetch.
     */
    orderBy?: AnnotationOrderByWithRelationInput | AnnotationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Annotations.
     */
    cursor?: AnnotationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Annotations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Annotations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Annotations.
     */
    distinct?: AnnotationScalarFieldEnum | AnnotationScalarFieldEnum[]
  }

  /**
   * Annotation findFirstOrThrow
   */
  export type AnnotationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * Filter, which Annotation to fetch.
     */
    where?: AnnotationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Annotations to fetch.
     */
    orderBy?: AnnotationOrderByWithRelationInput | AnnotationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Annotations.
     */
    cursor?: AnnotationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Annotations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Annotations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Annotations.
     */
    distinct?: AnnotationScalarFieldEnum | AnnotationScalarFieldEnum[]
  }

  /**
   * Annotation findMany
   */
  export type AnnotationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * Filter, which Annotations to fetch.
     */
    where?: AnnotationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Annotations to fetch.
     */
    orderBy?: AnnotationOrderByWithRelationInput | AnnotationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Annotations.
     */
    cursor?: AnnotationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Annotations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Annotations.
     */
    skip?: number
    distinct?: AnnotationScalarFieldEnum | AnnotationScalarFieldEnum[]
  }

  /**
   * Annotation create
   */
  export type AnnotationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * The data needed to create a Annotation.
     */
    data: XOR<AnnotationCreateInput, AnnotationUncheckedCreateInput>
  }

  /**
   * Annotation createMany
   */
  export type AnnotationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Annotations.
     */
    data: AnnotationCreateManyInput | AnnotationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Annotation createManyAndReturn
   */
  export type AnnotationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * The data used to create many Annotations.
     */
    data: AnnotationCreateManyInput | AnnotationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Annotation update
   */
  export type AnnotationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * The data needed to update a Annotation.
     */
    data: XOR<AnnotationUpdateInput, AnnotationUncheckedUpdateInput>
    /**
     * Choose, which Annotation to update.
     */
    where: AnnotationWhereUniqueInput
  }

  /**
   * Annotation updateMany
   */
  export type AnnotationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Annotations.
     */
    data: XOR<AnnotationUpdateManyMutationInput, AnnotationUncheckedUpdateManyInput>
    /**
     * Filter which Annotations to update
     */
    where?: AnnotationWhereInput
    /**
     * Limit how many Annotations to update.
     */
    limit?: number
  }

  /**
   * Annotation updateManyAndReturn
   */
  export type AnnotationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * The data used to update Annotations.
     */
    data: XOR<AnnotationUpdateManyMutationInput, AnnotationUncheckedUpdateManyInput>
    /**
     * Filter which Annotations to update
     */
    where?: AnnotationWhereInput
    /**
     * Limit how many Annotations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Annotation upsert
   */
  export type AnnotationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * The filter to search for the Annotation to update in case it exists.
     */
    where: AnnotationWhereUniqueInput
    /**
     * In case the Annotation found by the `where` argument doesn't exist, create a new Annotation with this data.
     */
    create: XOR<AnnotationCreateInput, AnnotationUncheckedCreateInput>
    /**
     * In case the Annotation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AnnotationUpdateInput, AnnotationUncheckedUpdateInput>
  }

  /**
   * Annotation delete
   */
  export type AnnotationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    /**
     * Filter which Annotation to delete.
     */
    where: AnnotationWhereUniqueInput
  }

  /**
   * Annotation deleteMany
   */
  export type AnnotationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Annotations to delete
     */
    where?: AnnotationWhereInput
    /**
     * Limit how many Annotations to delete.
     */
    limit?: number
  }

  /**
   * Annotation without action
   */
  export type AnnotationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
  }


  /**
   * Model VoteReminder
   */

  export type AggregateVoteReminder = {
    _count: VoteReminderCountAggregateOutputType | null
    _min: VoteReminderMinAggregateOutputType | null
    _max: VoteReminderMaxAggregateOutputType | null
  }

  export type VoteReminderMinAggregateOutputType = {
    userId: string | null
    channelId: string | null
    guildId: string | null
    endTime: Date | null
  }

  export type VoteReminderMaxAggregateOutputType = {
    userId: string | null
    channelId: string | null
    guildId: string | null
    endTime: Date | null
  }

  export type VoteReminderCountAggregateOutputType = {
    userId: number
    channelId: number
    guildId: number
    endTime: number
    _all: number
  }


  export type VoteReminderMinAggregateInputType = {
    userId?: true
    channelId?: true
    guildId?: true
    endTime?: true
  }

  export type VoteReminderMaxAggregateInputType = {
    userId?: true
    channelId?: true
    guildId?: true
    endTime?: true
  }

  export type VoteReminderCountAggregateInputType = {
    userId?: true
    channelId?: true
    guildId?: true
    endTime?: true
    _all?: true
  }

  export type VoteReminderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VoteReminder to aggregate.
     */
    where?: VoteReminderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VoteReminders to fetch.
     */
    orderBy?: VoteReminderOrderByWithRelationInput | VoteReminderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VoteReminderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VoteReminders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VoteReminders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VoteReminders
    **/
    _count?: true | VoteReminderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VoteReminderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VoteReminderMaxAggregateInputType
  }

  export type GetVoteReminderAggregateType<T extends VoteReminderAggregateArgs> = {
        [P in keyof T & keyof AggregateVoteReminder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVoteReminder[P]>
      : GetScalarType<T[P], AggregateVoteReminder[P]>
  }




  export type VoteReminderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VoteReminderWhereInput
    orderBy?: VoteReminderOrderByWithAggregationInput | VoteReminderOrderByWithAggregationInput[]
    by: VoteReminderScalarFieldEnum[] | VoteReminderScalarFieldEnum
    having?: VoteReminderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VoteReminderCountAggregateInputType | true
    _min?: VoteReminderMinAggregateInputType
    _max?: VoteReminderMaxAggregateInputType
  }

  export type VoteReminderGroupByOutputType = {
    userId: string
    channelId: string
    guildId: string
    endTime: Date
    _count: VoteReminderCountAggregateOutputType | null
    _min: VoteReminderMinAggregateOutputType | null
    _max: VoteReminderMaxAggregateOutputType | null
  }

  type GetVoteReminderGroupByPayload<T extends VoteReminderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VoteReminderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VoteReminderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VoteReminderGroupByOutputType[P]>
            : GetScalarType<T[P], VoteReminderGroupByOutputType[P]>
        }
      >
    >


  export type VoteReminderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    channelId?: boolean
    guildId?: boolean
    endTime?: boolean
  }, ExtArgs["result"]["voteReminder"]>

  export type VoteReminderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    channelId?: boolean
    guildId?: boolean
    endTime?: boolean
  }, ExtArgs["result"]["voteReminder"]>

  export type VoteReminderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    channelId?: boolean
    guildId?: boolean
    endTime?: boolean
  }, ExtArgs["result"]["voteReminder"]>

  export type VoteReminderSelectScalar = {
    userId?: boolean
    channelId?: boolean
    guildId?: boolean
    endTime?: boolean
  }

  export type VoteReminderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"userId" | "channelId" | "guildId" | "endTime", ExtArgs["result"]["voteReminder"]>

  export type $VoteReminderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VoteReminder"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      userId: string
      channelId: string
      guildId: string
      endTime: Date
    }, ExtArgs["result"]["voteReminder"]>
    composites: {}
  }

  type VoteReminderGetPayload<S extends boolean | null | undefined | VoteReminderDefaultArgs> = $Result.GetResult<Prisma.$VoteReminderPayload, S>

  type VoteReminderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VoteReminderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VoteReminderCountAggregateInputType | true
    }

  export interface VoteReminderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VoteReminder'], meta: { name: 'VoteReminder' } }
    /**
     * Find zero or one VoteReminder that matches the filter.
     * @param {VoteReminderFindUniqueArgs} args - Arguments to find a VoteReminder
     * @example
     * // Get one VoteReminder
     * const voteReminder = await prisma.voteReminder.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VoteReminderFindUniqueArgs>(args: SelectSubset<T, VoteReminderFindUniqueArgs<ExtArgs>>): Prisma__VoteReminderClient<$Result.GetResult<Prisma.$VoteReminderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VoteReminder that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VoteReminderFindUniqueOrThrowArgs} args - Arguments to find a VoteReminder
     * @example
     * // Get one VoteReminder
     * const voteReminder = await prisma.voteReminder.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VoteReminderFindUniqueOrThrowArgs>(args: SelectSubset<T, VoteReminderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VoteReminderClient<$Result.GetResult<Prisma.$VoteReminderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VoteReminder that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoteReminderFindFirstArgs} args - Arguments to find a VoteReminder
     * @example
     * // Get one VoteReminder
     * const voteReminder = await prisma.voteReminder.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VoteReminderFindFirstArgs>(args?: SelectSubset<T, VoteReminderFindFirstArgs<ExtArgs>>): Prisma__VoteReminderClient<$Result.GetResult<Prisma.$VoteReminderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VoteReminder that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoteReminderFindFirstOrThrowArgs} args - Arguments to find a VoteReminder
     * @example
     * // Get one VoteReminder
     * const voteReminder = await prisma.voteReminder.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VoteReminderFindFirstOrThrowArgs>(args?: SelectSubset<T, VoteReminderFindFirstOrThrowArgs<ExtArgs>>): Prisma__VoteReminderClient<$Result.GetResult<Prisma.$VoteReminderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VoteReminders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoteReminderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VoteReminders
     * const voteReminders = await prisma.voteReminder.findMany()
     * 
     * // Get first 10 VoteReminders
     * const voteReminders = await prisma.voteReminder.findMany({ take: 10 })
     * 
     * // Only select the `userId`
     * const voteReminderWithUserIdOnly = await prisma.voteReminder.findMany({ select: { userId: true } })
     * 
     */
    findMany<T extends VoteReminderFindManyArgs>(args?: SelectSubset<T, VoteReminderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VoteReminderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VoteReminder.
     * @param {VoteReminderCreateArgs} args - Arguments to create a VoteReminder.
     * @example
     * // Create one VoteReminder
     * const VoteReminder = await prisma.voteReminder.create({
     *   data: {
     *     // ... data to create a VoteReminder
     *   }
     * })
     * 
     */
    create<T extends VoteReminderCreateArgs>(args: SelectSubset<T, VoteReminderCreateArgs<ExtArgs>>): Prisma__VoteReminderClient<$Result.GetResult<Prisma.$VoteReminderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VoteReminders.
     * @param {VoteReminderCreateManyArgs} args - Arguments to create many VoteReminders.
     * @example
     * // Create many VoteReminders
     * const voteReminder = await prisma.voteReminder.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VoteReminderCreateManyArgs>(args?: SelectSubset<T, VoteReminderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VoteReminders and returns the data saved in the database.
     * @param {VoteReminderCreateManyAndReturnArgs} args - Arguments to create many VoteReminders.
     * @example
     * // Create many VoteReminders
     * const voteReminder = await prisma.voteReminder.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VoteReminders and only return the `userId`
     * const voteReminderWithUserIdOnly = await prisma.voteReminder.createManyAndReturn({
     *   select: { userId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VoteReminderCreateManyAndReturnArgs>(args?: SelectSubset<T, VoteReminderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VoteReminderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VoteReminder.
     * @param {VoteReminderDeleteArgs} args - Arguments to delete one VoteReminder.
     * @example
     * // Delete one VoteReminder
     * const VoteReminder = await prisma.voteReminder.delete({
     *   where: {
     *     // ... filter to delete one VoteReminder
     *   }
     * })
     * 
     */
    delete<T extends VoteReminderDeleteArgs>(args: SelectSubset<T, VoteReminderDeleteArgs<ExtArgs>>): Prisma__VoteReminderClient<$Result.GetResult<Prisma.$VoteReminderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VoteReminder.
     * @param {VoteReminderUpdateArgs} args - Arguments to update one VoteReminder.
     * @example
     * // Update one VoteReminder
     * const voteReminder = await prisma.voteReminder.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VoteReminderUpdateArgs>(args: SelectSubset<T, VoteReminderUpdateArgs<ExtArgs>>): Prisma__VoteReminderClient<$Result.GetResult<Prisma.$VoteReminderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VoteReminders.
     * @param {VoteReminderDeleteManyArgs} args - Arguments to filter VoteReminders to delete.
     * @example
     * // Delete a few VoteReminders
     * const { count } = await prisma.voteReminder.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VoteReminderDeleteManyArgs>(args?: SelectSubset<T, VoteReminderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VoteReminders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoteReminderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VoteReminders
     * const voteReminder = await prisma.voteReminder.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VoteReminderUpdateManyArgs>(args: SelectSubset<T, VoteReminderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VoteReminders and returns the data updated in the database.
     * @param {VoteReminderUpdateManyAndReturnArgs} args - Arguments to update many VoteReminders.
     * @example
     * // Update many VoteReminders
     * const voteReminder = await prisma.voteReminder.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VoteReminders and only return the `userId`
     * const voteReminderWithUserIdOnly = await prisma.voteReminder.updateManyAndReturn({
     *   select: { userId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VoteReminderUpdateManyAndReturnArgs>(args: SelectSubset<T, VoteReminderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VoteReminderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VoteReminder.
     * @param {VoteReminderUpsertArgs} args - Arguments to update or create a VoteReminder.
     * @example
     * // Update or create a VoteReminder
     * const voteReminder = await prisma.voteReminder.upsert({
     *   create: {
     *     // ... data to create a VoteReminder
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VoteReminder we want to update
     *   }
     * })
     */
    upsert<T extends VoteReminderUpsertArgs>(args: SelectSubset<T, VoteReminderUpsertArgs<ExtArgs>>): Prisma__VoteReminderClient<$Result.GetResult<Prisma.$VoteReminderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VoteReminders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoteReminderCountArgs} args - Arguments to filter VoteReminders to count.
     * @example
     * // Count the number of VoteReminders
     * const count = await prisma.voteReminder.count({
     *   where: {
     *     // ... the filter for the VoteReminders we want to count
     *   }
     * })
    **/
    count<T extends VoteReminderCountArgs>(
      args?: Subset<T, VoteReminderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VoteReminderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VoteReminder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoteReminderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VoteReminderAggregateArgs>(args: Subset<T, VoteReminderAggregateArgs>): Prisma.PrismaPromise<GetVoteReminderAggregateType<T>>

    /**
     * Group by VoteReminder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoteReminderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VoteReminderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VoteReminderGroupByArgs['orderBy'] }
        : { orderBy?: VoteReminderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VoteReminderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVoteReminderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VoteReminder model
   */
  readonly fields: VoteReminderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VoteReminder.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VoteReminderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VoteReminder model
   */
  interface VoteReminderFieldRefs {
    readonly userId: FieldRef<"VoteReminder", 'String'>
    readonly channelId: FieldRef<"VoteReminder", 'String'>
    readonly guildId: FieldRef<"VoteReminder", 'String'>
    readonly endTime: FieldRef<"VoteReminder", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * VoteReminder findUnique
   */
  export type VoteReminderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoteReminder
     */
    select?: VoteReminderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoteReminder
     */
    omit?: VoteReminderOmit<ExtArgs> | null
    /**
     * Filter, which VoteReminder to fetch.
     */
    where: VoteReminderWhereUniqueInput
  }

  /**
   * VoteReminder findUniqueOrThrow
   */
  export type VoteReminderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoteReminder
     */
    select?: VoteReminderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoteReminder
     */
    omit?: VoteReminderOmit<ExtArgs> | null
    /**
     * Filter, which VoteReminder to fetch.
     */
    where: VoteReminderWhereUniqueInput
  }

  /**
   * VoteReminder findFirst
   */
  export type VoteReminderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoteReminder
     */
    select?: VoteReminderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoteReminder
     */
    omit?: VoteReminderOmit<ExtArgs> | null
    /**
     * Filter, which VoteReminder to fetch.
     */
    where?: VoteReminderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VoteReminders to fetch.
     */
    orderBy?: VoteReminderOrderByWithRelationInput | VoteReminderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VoteReminders.
     */
    cursor?: VoteReminderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VoteReminders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VoteReminders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VoteReminders.
     */
    distinct?: VoteReminderScalarFieldEnum | VoteReminderScalarFieldEnum[]
  }

  /**
   * VoteReminder findFirstOrThrow
   */
  export type VoteReminderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoteReminder
     */
    select?: VoteReminderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoteReminder
     */
    omit?: VoteReminderOmit<ExtArgs> | null
    /**
     * Filter, which VoteReminder to fetch.
     */
    where?: VoteReminderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VoteReminders to fetch.
     */
    orderBy?: VoteReminderOrderByWithRelationInput | VoteReminderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VoteReminders.
     */
    cursor?: VoteReminderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VoteReminders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VoteReminders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VoteReminders.
     */
    distinct?: VoteReminderScalarFieldEnum | VoteReminderScalarFieldEnum[]
  }

  /**
   * VoteReminder findMany
   */
  export type VoteReminderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoteReminder
     */
    select?: VoteReminderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoteReminder
     */
    omit?: VoteReminderOmit<ExtArgs> | null
    /**
     * Filter, which VoteReminders to fetch.
     */
    where?: VoteReminderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VoteReminders to fetch.
     */
    orderBy?: VoteReminderOrderByWithRelationInput | VoteReminderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VoteReminders.
     */
    cursor?: VoteReminderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VoteReminders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VoteReminders.
     */
    skip?: number
    distinct?: VoteReminderScalarFieldEnum | VoteReminderScalarFieldEnum[]
  }

  /**
   * VoteReminder create
   */
  export type VoteReminderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoteReminder
     */
    select?: VoteReminderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoteReminder
     */
    omit?: VoteReminderOmit<ExtArgs> | null
    /**
     * The data needed to create a VoteReminder.
     */
    data: XOR<VoteReminderCreateInput, VoteReminderUncheckedCreateInput>
  }

  /**
   * VoteReminder createMany
   */
  export type VoteReminderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VoteReminders.
     */
    data: VoteReminderCreateManyInput | VoteReminderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VoteReminder createManyAndReturn
   */
  export type VoteReminderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoteReminder
     */
    select?: VoteReminderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VoteReminder
     */
    omit?: VoteReminderOmit<ExtArgs> | null
    /**
     * The data used to create many VoteReminders.
     */
    data: VoteReminderCreateManyInput | VoteReminderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VoteReminder update
   */
  export type VoteReminderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoteReminder
     */
    select?: VoteReminderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoteReminder
     */
    omit?: VoteReminderOmit<ExtArgs> | null
    /**
     * The data needed to update a VoteReminder.
     */
    data: XOR<VoteReminderUpdateInput, VoteReminderUncheckedUpdateInput>
    /**
     * Choose, which VoteReminder to update.
     */
    where: VoteReminderWhereUniqueInput
  }

  /**
   * VoteReminder updateMany
   */
  export type VoteReminderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VoteReminders.
     */
    data: XOR<VoteReminderUpdateManyMutationInput, VoteReminderUncheckedUpdateManyInput>
    /**
     * Filter which VoteReminders to update
     */
    where?: VoteReminderWhereInput
    /**
     * Limit how many VoteReminders to update.
     */
    limit?: number
  }

  /**
   * VoteReminder updateManyAndReturn
   */
  export type VoteReminderUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoteReminder
     */
    select?: VoteReminderSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VoteReminder
     */
    omit?: VoteReminderOmit<ExtArgs> | null
    /**
     * The data used to update VoteReminders.
     */
    data: XOR<VoteReminderUpdateManyMutationInput, VoteReminderUncheckedUpdateManyInput>
    /**
     * Filter which VoteReminders to update
     */
    where?: VoteReminderWhereInput
    /**
     * Limit how many VoteReminders to update.
     */
    limit?: number
  }

  /**
   * VoteReminder upsert
   */
  export type VoteReminderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoteReminder
     */
    select?: VoteReminderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoteReminder
     */
    omit?: VoteReminderOmit<ExtArgs> | null
    /**
     * The filter to search for the VoteReminder to update in case it exists.
     */
    where: VoteReminderWhereUniqueInput
    /**
     * In case the VoteReminder found by the `where` argument doesn't exist, create a new VoteReminder with this data.
     */
    create: XOR<VoteReminderCreateInput, VoteReminderUncheckedCreateInput>
    /**
     * In case the VoteReminder was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VoteReminderUpdateInput, VoteReminderUncheckedUpdateInput>
  }

  /**
   * VoteReminder delete
   */
  export type VoteReminderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoteReminder
     */
    select?: VoteReminderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoteReminder
     */
    omit?: VoteReminderOmit<ExtArgs> | null
    /**
     * Filter which VoteReminder to delete.
     */
    where: VoteReminderWhereUniqueInput
  }

  /**
   * VoteReminder deleteMany
   */
  export type VoteReminderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VoteReminders to delete
     */
    where?: VoteReminderWhereInput
    /**
     * Limit how many VoteReminders to delete.
     */
    limit?: number
  }

  /**
   * VoteReminder without action
   */
  export type VoteReminderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoteReminder
     */
    select?: VoteReminderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoteReminder
     */
    omit?: VoteReminderOmit<ExtArgs> | null
  }


  /**
   * Model Analyze
   */

  export type AggregateAnalyze = {
    _count: AnalyzeCountAggregateOutputType | null
    _avg: AnalyzeAvgAggregateOutputType | null
    _sum: AnalyzeSumAggregateOutputType | null
    _min: AnalyzeMinAggregateOutputType | null
    _max: AnalyzeMaxAggregateOutputType | null
  }

  export type AnalyzeAvgAggregateOutputType = {
    id: number | null
  }

  export type AnalyzeSumAggregateOutputType = {
    id: number | null
  }

  export type AnalyzeMinAggregateOutputType = {
    id: number | null
    applicationId: string | null
    userId: string | null
    avaliation: string | null
    approved: boolean | null
    createdAt: Date | null
    finishedIn: Date | null
  }

  export type AnalyzeMaxAggregateOutputType = {
    id: number | null
    applicationId: string | null
    userId: string | null
    avaliation: string | null
    approved: boolean | null
    createdAt: Date | null
    finishedIn: Date | null
  }

  export type AnalyzeCountAggregateOutputType = {
    id: number
    applicationId: number
    userId: number
    avaliation: number
    approved: number
    createdAt: number
    finishedIn: number
    _all: number
  }


  export type AnalyzeAvgAggregateInputType = {
    id?: true
  }

  export type AnalyzeSumAggregateInputType = {
    id?: true
  }

  export type AnalyzeMinAggregateInputType = {
    id?: true
    applicationId?: true
    userId?: true
    avaliation?: true
    approved?: true
    createdAt?: true
    finishedIn?: true
  }

  export type AnalyzeMaxAggregateInputType = {
    id?: true
    applicationId?: true
    userId?: true
    avaliation?: true
    approved?: true
    createdAt?: true
    finishedIn?: true
  }

  export type AnalyzeCountAggregateInputType = {
    id?: true
    applicationId?: true
    userId?: true
    avaliation?: true
    approved?: true
    createdAt?: true
    finishedIn?: true
    _all?: true
  }

  export type AnalyzeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Analyze to aggregate.
     */
    where?: AnalyzeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Analyzes to fetch.
     */
    orderBy?: AnalyzeOrderByWithRelationInput | AnalyzeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AnalyzeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Analyzes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Analyzes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Analyzes
    **/
    _count?: true | AnalyzeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AnalyzeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AnalyzeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AnalyzeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AnalyzeMaxAggregateInputType
  }

  export type GetAnalyzeAggregateType<T extends AnalyzeAggregateArgs> = {
        [P in keyof T & keyof AggregateAnalyze]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnalyze[P]>
      : GetScalarType<T[P], AggregateAnalyze[P]>
  }




  export type AnalyzeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnalyzeWhereInput
    orderBy?: AnalyzeOrderByWithAggregationInput | AnalyzeOrderByWithAggregationInput[]
    by: AnalyzeScalarFieldEnum[] | AnalyzeScalarFieldEnum
    having?: AnalyzeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AnalyzeCountAggregateInputType | true
    _avg?: AnalyzeAvgAggregateInputType
    _sum?: AnalyzeSumAggregateInputType
    _min?: AnalyzeMinAggregateInputType
    _max?: AnalyzeMaxAggregateInputType
  }

  export type AnalyzeGroupByOutputType = {
    id: number
    applicationId: string | null
    userId: string | null
    avaliation: string | null
    approved: boolean | null
    createdAt: Date
    finishedIn: Date | null
    _count: AnalyzeCountAggregateOutputType | null
    _avg: AnalyzeAvgAggregateOutputType | null
    _sum: AnalyzeSumAggregateOutputType | null
    _min: AnalyzeMinAggregateOutputType | null
    _max: AnalyzeMaxAggregateOutputType | null
  }

  type GetAnalyzeGroupByPayload<T extends AnalyzeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AnalyzeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AnalyzeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AnalyzeGroupByOutputType[P]>
            : GetScalarType<T[P], AnalyzeGroupByOutputType[P]>
        }
      >
    >


  export type AnalyzeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    applicationId?: boolean
    userId?: boolean
    avaliation?: boolean
    approved?: boolean
    createdAt?: boolean
    finishedIn?: boolean
    application?: boolean | Analyze$applicationArgs<ExtArgs>
    user?: boolean | Analyze$userArgs<ExtArgs>
    annotations?: boolean | Analyze$annotationsArgs<ExtArgs>
    _count?: boolean | AnalyzeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["analyze"]>

  export type AnalyzeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    applicationId?: boolean
    userId?: boolean
    avaliation?: boolean
    approved?: boolean
    createdAt?: boolean
    finishedIn?: boolean
    user?: boolean | Analyze$userArgs<ExtArgs>
  }, ExtArgs["result"]["analyze"]>

  export type AnalyzeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    applicationId?: boolean
    userId?: boolean
    avaliation?: boolean
    approved?: boolean
    createdAt?: boolean
    finishedIn?: boolean
    user?: boolean | Analyze$userArgs<ExtArgs>
  }, ExtArgs["result"]["analyze"]>

  export type AnalyzeSelectScalar = {
    id?: boolean
    applicationId?: boolean
    userId?: boolean
    avaliation?: boolean
    approved?: boolean
    createdAt?: boolean
    finishedIn?: boolean
  }

  export type AnalyzeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "applicationId" | "userId" | "avaliation" | "approved" | "createdAt" | "finishedIn", ExtArgs["result"]["analyze"]>
  export type AnalyzeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    application?: boolean | Analyze$applicationArgs<ExtArgs>
    user?: boolean | Analyze$userArgs<ExtArgs>
    annotations?: boolean | Analyze$annotationsArgs<ExtArgs>
    _count?: boolean | AnalyzeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AnalyzeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Analyze$userArgs<ExtArgs>
  }
  export type AnalyzeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Analyze$userArgs<ExtArgs>
  }

  export type $AnalyzePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Analyze"
    objects: {
      application: Prisma.$ApplicationPayload<ExtArgs> | null
      user: Prisma.$UserPayload<ExtArgs> | null
      annotations: Prisma.$AnnotationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      applicationId: string | null
      userId: string | null
      avaliation: string | null
      approved: boolean | null
      createdAt: Date
      finishedIn: Date | null
    }, ExtArgs["result"]["analyze"]>
    composites: {}
  }

  type AnalyzeGetPayload<S extends boolean | null | undefined | AnalyzeDefaultArgs> = $Result.GetResult<Prisma.$AnalyzePayload, S>

  type AnalyzeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AnalyzeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AnalyzeCountAggregateInputType | true
    }

  export interface AnalyzeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Analyze'], meta: { name: 'Analyze' } }
    /**
     * Find zero or one Analyze that matches the filter.
     * @param {AnalyzeFindUniqueArgs} args - Arguments to find a Analyze
     * @example
     * // Get one Analyze
     * const analyze = await prisma.analyze.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnalyzeFindUniqueArgs>(args: SelectSubset<T, AnalyzeFindUniqueArgs<ExtArgs>>): Prisma__AnalyzeClient<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Analyze that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnalyzeFindUniqueOrThrowArgs} args - Arguments to find a Analyze
     * @example
     * // Get one Analyze
     * const analyze = await prisma.analyze.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnalyzeFindUniqueOrThrowArgs>(args: SelectSubset<T, AnalyzeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AnalyzeClient<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Analyze that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyzeFindFirstArgs} args - Arguments to find a Analyze
     * @example
     * // Get one Analyze
     * const analyze = await prisma.analyze.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnalyzeFindFirstArgs>(args?: SelectSubset<T, AnalyzeFindFirstArgs<ExtArgs>>): Prisma__AnalyzeClient<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Analyze that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyzeFindFirstOrThrowArgs} args - Arguments to find a Analyze
     * @example
     * // Get one Analyze
     * const analyze = await prisma.analyze.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnalyzeFindFirstOrThrowArgs>(args?: SelectSubset<T, AnalyzeFindFirstOrThrowArgs<ExtArgs>>): Prisma__AnalyzeClient<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Analyzes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyzeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Analyzes
     * const analyzes = await prisma.analyze.findMany()
     * 
     * // Get first 10 Analyzes
     * const analyzes = await prisma.analyze.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const analyzeWithIdOnly = await prisma.analyze.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AnalyzeFindManyArgs>(args?: SelectSubset<T, AnalyzeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Analyze.
     * @param {AnalyzeCreateArgs} args - Arguments to create a Analyze.
     * @example
     * // Create one Analyze
     * const Analyze = await prisma.analyze.create({
     *   data: {
     *     // ... data to create a Analyze
     *   }
     * })
     * 
     */
    create<T extends AnalyzeCreateArgs>(args: SelectSubset<T, AnalyzeCreateArgs<ExtArgs>>): Prisma__AnalyzeClient<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Analyzes.
     * @param {AnalyzeCreateManyArgs} args - Arguments to create many Analyzes.
     * @example
     * // Create many Analyzes
     * const analyze = await prisma.analyze.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AnalyzeCreateManyArgs>(args?: SelectSubset<T, AnalyzeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Analyzes and returns the data saved in the database.
     * @param {AnalyzeCreateManyAndReturnArgs} args - Arguments to create many Analyzes.
     * @example
     * // Create many Analyzes
     * const analyze = await prisma.analyze.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Analyzes and only return the `id`
     * const analyzeWithIdOnly = await prisma.analyze.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AnalyzeCreateManyAndReturnArgs>(args?: SelectSubset<T, AnalyzeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Analyze.
     * @param {AnalyzeDeleteArgs} args - Arguments to delete one Analyze.
     * @example
     * // Delete one Analyze
     * const Analyze = await prisma.analyze.delete({
     *   where: {
     *     // ... filter to delete one Analyze
     *   }
     * })
     * 
     */
    delete<T extends AnalyzeDeleteArgs>(args: SelectSubset<T, AnalyzeDeleteArgs<ExtArgs>>): Prisma__AnalyzeClient<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Analyze.
     * @param {AnalyzeUpdateArgs} args - Arguments to update one Analyze.
     * @example
     * // Update one Analyze
     * const analyze = await prisma.analyze.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AnalyzeUpdateArgs>(args: SelectSubset<T, AnalyzeUpdateArgs<ExtArgs>>): Prisma__AnalyzeClient<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Analyzes.
     * @param {AnalyzeDeleteManyArgs} args - Arguments to filter Analyzes to delete.
     * @example
     * // Delete a few Analyzes
     * const { count } = await prisma.analyze.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AnalyzeDeleteManyArgs>(args?: SelectSubset<T, AnalyzeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Analyzes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyzeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Analyzes
     * const analyze = await prisma.analyze.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AnalyzeUpdateManyArgs>(args: SelectSubset<T, AnalyzeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Analyzes and returns the data updated in the database.
     * @param {AnalyzeUpdateManyAndReturnArgs} args - Arguments to update many Analyzes.
     * @example
     * // Update many Analyzes
     * const analyze = await prisma.analyze.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Analyzes and only return the `id`
     * const analyzeWithIdOnly = await prisma.analyze.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AnalyzeUpdateManyAndReturnArgs>(args: SelectSubset<T, AnalyzeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Analyze.
     * @param {AnalyzeUpsertArgs} args - Arguments to update or create a Analyze.
     * @example
     * // Update or create a Analyze
     * const analyze = await prisma.analyze.upsert({
     *   create: {
     *     // ... data to create a Analyze
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Analyze we want to update
     *   }
     * })
     */
    upsert<T extends AnalyzeUpsertArgs>(args: SelectSubset<T, AnalyzeUpsertArgs<ExtArgs>>): Prisma__AnalyzeClient<$Result.GetResult<Prisma.$AnalyzePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Analyzes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyzeCountArgs} args - Arguments to filter Analyzes to count.
     * @example
     * // Count the number of Analyzes
     * const count = await prisma.analyze.count({
     *   where: {
     *     // ... the filter for the Analyzes we want to count
     *   }
     * })
    **/
    count<T extends AnalyzeCountArgs>(
      args?: Subset<T, AnalyzeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AnalyzeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Analyze.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyzeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AnalyzeAggregateArgs>(args: Subset<T, AnalyzeAggregateArgs>): Prisma.PrismaPromise<GetAnalyzeAggregateType<T>>

    /**
     * Group by Analyze.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyzeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AnalyzeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AnalyzeGroupByArgs['orderBy'] }
        : { orderBy?: AnalyzeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AnalyzeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnalyzeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Analyze model
   */
  readonly fields: AnalyzeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Analyze.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AnalyzeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    application<T extends Analyze$applicationArgs<ExtArgs> = {}>(args?: Subset<T, Analyze$applicationArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    user<T extends Analyze$userArgs<ExtArgs> = {}>(args?: Subset<T, Analyze$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    annotations<T extends Analyze$annotationsArgs<ExtArgs> = {}>(args?: Subset<T, Analyze$annotationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnnotationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Analyze model
   */
  interface AnalyzeFieldRefs {
    readonly id: FieldRef<"Analyze", 'Int'>
    readonly applicationId: FieldRef<"Analyze", 'String'>
    readonly userId: FieldRef<"Analyze", 'String'>
    readonly avaliation: FieldRef<"Analyze", 'String'>
    readonly approved: FieldRef<"Analyze", 'Boolean'>
    readonly createdAt: FieldRef<"Analyze", 'DateTime'>
    readonly finishedIn: FieldRef<"Analyze", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Analyze findUnique
   */
  export type AnalyzeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeInclude<ExtArgs> | null
    /**
     * Filter, which Analyze to fetch.
     */
    where: AnalyzeWhereUniqueInput
  }

  /**
   * Analyze findUniqueOrThrow
   */
  export type AnalyzeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeInclude<ExtArgs> | null
    /**
     * Filter, which Analyze to fetch.
     */
    where: AnalyzeWhereUniqueInput
  }

  /**
   * Analyze findFirst
   */
  export type AnalyzeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeInclude<ExtArgs> | null
    /**
     * Filter, which Analyze to fetch.
     */
    where?: AnalyzeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Analyzes to fetch.
     */
    orderBy?: AnalyzeOrderByWithRelationInput | AnalyzeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Analyzes.
     */
    cursor?: AnalyzeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Analyzes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Analyzes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Analyzes.
     */
    distinct?: AnalyzeScalarFieldEnum | AnalyzeScalarFieldEnum[]
  }

  /**
   * Analyze findFirstOrThrow
   */
  export type AnalyzeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeInclude<ExtArgs> | null
    /**
     * Filter, which Analyze to fetch.
     */
    where?: AnalyzeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Analyzes to fetch.
     */
    orderBy?: AnalyzeOrderByWithRelationInput | AnalyzeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Analyzes.
     */
    cursor?: AnalyzeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Analyzes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Analyzes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Analyzes.
     */
    distinct?: AnalyzeScalarFieldEnum | AnalyzeScalarFieldEnum[]
  }

  /**
   * Analyze findMany
   */
  export type AnalyzeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeInclude<ExtArgs> | null
    /**
     * Filter, which Analyzes to fetch.
     */
    where?: AnalyzeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Analyzes to fetch.
     */
    orderBy?: AnalyzeOrderByWithRelationInput | AnalyzeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Analyzes.
     */
    cursor?: AnalyzeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Analyzes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Analyzes.
     */
    skip?: number
    distinct?: AnalyzeScalarFieldEnum | AnalyzeScalarFieldEnum[]
  }

  /**
   * Analyze create
   */
  export type AnalyzeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeInclude<ExtArgs> | null
    /**
     * The data needed to create a Analyze.
     */
    data?: XOR<AnalyzeCreateInput, AnalyzeUncheckedCreateInput>
  }

  /**
   * Analyze createMany
   */
  export type AnalyzeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Analyzes.
     */
    data: AnalyzeCreateManyInput | AnalyzeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Analyze createManyAndReturn
   */
  export type AnalyzeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * The data used to create many Analyzes.
     */
    data: AnalyzeCreateManyInput | AnalyzeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Analyze update
   */
  export type AnalyzeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeInclude<ExtArgs> | null
    /**
     * The data needed to update a Analyze.
     */
    data: XOR<AnalyzeUpdateInput, AnalyzeUncheckedUpdateInput>
    /**
     * Choose, which Analyze to update.
     */
    where: AnalyzeWhereUniqueInput
  }

  /**
   * Analyze updateMany
   */
  export type AnalyzeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Analyzes.
     */
    data: XOR<AnalyzeUpdateManyMutationInput, AnalyzeUncheckedUpdateManyInput>
    /**
     * Filter which Analyzes to update
     */
    where?: AnalyzeWhereInput
    /**
     * Limit how many Analyzes to update.
     */
    limit?: number
  }

  /**
   * Analyze updateManyAndReturn
   */
  export type AnalyzeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * The data used to update Analyzes.
     */
    data: XOR<AnalyzeUpdateManyMutationInput, AnalyzeUncheckedUpdateManyInput>
    /**
     * Filter which Analyzes to update
     */
    where?: AnalyzeWhereInput
    /**
     * Limit how many Analyzes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Analyze upsert
   */
  export type AnalyzeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeInclude<ExtArgs> | null
    /**
     * The filter to search for the Analyze to update in case it exists.
     */
    where: AnalyzeWhereUniqueInput
    /**
     * In case the Analyze found by the `where` argument doesn't exist, create a new Analyze with this data.
     */
    create: XOR<AnalyzeCreateInput, AnalyzeUncheckedCreateInput>
    /**
     * In case the Analyze was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AnalyzeUpdateInput, AnalyzeUncheckedUpdateInput>
  }

  /**
   * Analyze delete
   */
  export type AnalyzeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeInclude<ExtArgs> | null
    /**
     * Filter which Analyze to delete.
     */
    where: AnalyzeWhereUniqueInput
  }

  /**
   * Analyze deleteMany
   */
  export type AnalyzeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Analyzes to delete
     */
    where?: AnalyzeWhereInput
    /**
     * Limit how many Analyzes to delete.
     */
    limit?: number
  }

  /**
   * Analyze.application
   */
  export type Analyze$applicationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    where?: ApplicationWhereInput
  }

  /**
   * Analyze.user
   */
  export type Analyze$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Analyze.annotations
   */
  export type Analyze$annotationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Annotation
     */
    select?: AnnotationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Annotation
     */
    omit?: AnnotationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnnotationInclude<ExtArgs> | null
    where?: AnnotationWhereInput
    orderBy?: AnnotationOrderByWithRelationInput | AnnotationOrderByWithRelationInput[]
    cursor?: AnnotationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AnnotationScalarFieldEnum | AnnotationScalarFieldEnum[]
  }

  /**
   * Analyze without action
   */
  export type AnalyzeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Analyze
     */
    select?: AnalyzeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Analyze
     */
    omit?: AnalyzeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyzeInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    blacklist: 'blacklist',
    defaultVote: 'defaultVote',
    isAvaliator: 'isAvaliator',
    isSuperAvaliator: 'isSuperAvaliator',
    createdAt: 'createdAt',
    analisingId: 'analisingId',
    coins: 'coins'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const VotesScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    applicationId: 'applicationId',
    createdAt: 'createdAt'
  };

  export type VotesScalarFieldEnum = (typeof VotesScalarFieldEnum)[keyof typeof VotesScalarFieldEnum]


  export const ApplicationScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    language: 'language',
    lib: 'lib',
    description: 'description',
    prefix: 'prefix',
    prefix2: 'prefix2',
    createdAt: 'createdAt',
    analyzeId: 'analyzeId',
    carefulAnalysis: 'carefulAnalysis'
  };

  export type ApplicationScalarFieldEnum = (typeof ApplicationScalarFieldEnum)[keyof typeof ApplicationScalarFieldEnum]


  export const CooldownScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    createdAt: 'createdAt',
    endIn: 'endIn'
  };

  export type CooldownScalarFieldEnum = (typeof CooldownScalarFieldEnum)[keyof typeof CooldownScalarFieldEnum]


  export const AnnotationScalarFieldEnum: {
    id: 'id',
    analyzeId: 'analyzeId',
    type: 'type',
    text: 'text',
    createdAt: 'createdAt'
  };

  export type AnnotationScalarFieldEnum = (typeof AnnotationScalarFieldEnum)[keyof typeof AnnotationScalarFieldEnum]


  export const VoteReminderScalarFieldEnum: {
    userId: 'userId',
    channelId: 'channelId',
    guildId: 'guildId',
    endTime: 'endTime'
  };

  export type VoteReminderScalarFieldEnum = (typeof VoteReminderScalarFieldEnum)[keyof typeof VoteReminderScalarFieldEnum]


  export const AnalyzeScalarFieldEnum: {
    id: 'id',
    applicationId: 'applicationId',
    userId: 'userId',
    avaliation: 'avaliation',
    approved: 'approved',
    createdAt: 'createdAt',
    finishedIn: 'finishedIn'
  };

  export type AnalyzeScalarFieldEnum = (typeof AnalyzeScalarFieldEnum)[keyof typeof AnalyzeScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    blacklist?: BoolFilter<"User"> | boolean
    defaultVote?: StringNullableFilter<"User"> | string | null
    isAvaliator?: BoolFilter<"User"> | boolean
    isSuperAvaliator?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    analisingId?: IntNullableFilter<"User"> | number | null
    coins?: IntFilter<"User"> | number
    applications?: ApplicationListRelationFilter
    cooldowns?: CooldownListRelationFilter
    analyzes?: AnalyzeListRelationFilter
    votes?: VotesListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    blacklist?: SortOrder
    defaultVote?: SortOrderInput | SortOrder
    isAvaliator?: SortOrder
    isSuperAvaliator?: SortOrder
    createdAt?: SortOrder
    analisingId?: SortOrderInput | SortOrder
    coins?: SortOrder
    applications?: ApplicationOrderByRelationAggregateInput
    cooldowns?: CooldownOrderByRelationAggregateInput
    analyzes?: AnalyzeOrderByRelationAggregateInput
    votes?: VotesOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    analisingId?: number
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    blacklist?: BoolFilter<"User"> | boolean
    defaultVote?: StringNullableFilter<"User"> | string | null
    isAvaliator?: BoolFilter<"User"> | boolean
    isSuperAvaliator?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    coins?: IntFilter<"User"> | number
    applications?: ApplicationListRelationFilter
    cooldowns?: CooldownListRelationFilter
    analyzes?: AnalyzeListRelationFilter
    votes?: VotesListRelationFilter
  }, "id" | "analisingId">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    blacklist?: SortOrder
    defaultVote?: SortOrderInput | SortOrder
    isAvaliator?: SortOrder
    isSuperAvaliator?: SortOrder
    createdAt?: SortOrder
    analisingId?: SortOrderInput | SortOrder
    coins?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    blacklist?: BoolWithAggregatesFilter<"User"> | boolean
    defaultVote?: StringNullableWithAggregatesFilter<"User"> | string | null
    isAvaliator?: BoolWithAggregatesFilter<"User"> | boolean
    isSuperAvaliator?: BoolWithAggregatesFilter<"User"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    analisingId?: IntNullableWithAggregatesFilter<"User"> | number | null
    coins?: IntWithAggregatesFilter<"User"> | number
  }

  export type VotesWhereInput = {
    AND?: VotesWhereInput | VotesWhereInput[]
    OR?: VotesWhereInput[]
    NOT?: VotesWhereInput | VotesWhereInput[]
    id?: IntFilter<"Votes"> | number
    userId?: StringFilter<"Votes"> | string
    applicationId?: StringFilter<"Votes"> | string
    createdAt?: DateTimeFilter<"Votes"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    application?: XOR<ApplicationScalarRelationFilter, ApplicationWhereInput>
  }

  export type VotesOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    applicationId?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
    application?: ApplicationOrderByWithRelationInput
  }

  export type VotesWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: VotesWhereInput | VotesWhereInput[]
    OR?: VotesWhereInput[]
    NOT?: VotesWhereInput | VotesWhereInput[]
    userId?: StringFilter<"Votes"> | string
    applicationId?: StringFilter<"Votes"> | string
    createdAt?: DateTimeFilter<"Votes"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    application?: XOR<ApplicationScalarRelationFilter, ApplicationWhereInput>
  }, "id">

  export type VotesOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    applicationId?: SortOrder
    createdAt?: SortOrder
    _count?: VotesCountOrderByAggregateInput
    _avg?: VotesAvgOrderByAggregateInput
    _max?: VotesMaxOrderByAggregateInput
    _min?: VotesMinOrderByAggregateInput
    _sum?: VotesSumOrderByAggregateInput
  }

  export type VotesScalarWhereWithAggregatesInput = {
    AND?: VotesScalarWhereWithAggregatesInput | VotesScalarWhereWithAggregatesInput[]
    OR?: VotesScalarWhereWithAggregatesInput[]
    NOT?: VotesScalarWhereWithAggregatesInput | VotesScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Votes"> | number
    userId?: StringWithAggregatesFilter<"Votes"> | string
    applicationId?: StringWithAggregatesFilter<"Votes"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Votes"> | Date | string
  }

  export type ApplicationWhereInput = {
    AND?: ApplicationWhereInput | ApplicationWhereInput[]
    OR?: ApplicationWhereInput[]
    NOT?: ApplicationWhereInput | ApplicationWhereInput[]
    id?: StringFilter<"Application"> | string
    userId?: StringFilter<"Application"> | string
    name?: StringFilter<"Application"> | string
    language?: StringFilter<"Application"> | string
    lib?: StringFilter<"Application"> | string
    description?: StringNullableFilter<"Application"> | string | null
    prefix?: StringFilter<"Application"> | string
    prefix2?: StringNullableFilter<"Application"> | string | null
    createdAt?: DateTimeFilter<"Application"> | Date | string
    analyzeId?: IntNullableFilter<"Application"> | number | null
    carefulAnalysis?: BoolFilter<"Application"> | boolean
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    votes?: VotesListRelationFilter
    analyze?: XOR<AnalyzeNullableScalarRelationFilter, AnalyzeWhereInput> | null
  }

  export type ApplicationOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    language?: SortOrder
    lib?: SortOrder
    description?: SortOrderInput | SortOrder
    prefix?: SortOrder
    prefix2?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    analyzeId?: SortOrderInput | SortOrder
    carefulAnalysis?: SortOrder
    user?: UserOrderByWithRelationInput
    votes?: VotesOrderByRelationAggregateInput
    analyze?: AnalyzeOrderByWithRelationInput
  }

  export type ApplicationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    analyzeId?: number
    AND?: ApplicationWhereInput | ApplicationWhereInput[]
    OR?: ApplicationWhereInput[]
    NOT?: ApplicationWhereInput | ApplicationWhereInput[]
    userId?: StringFilter<"Application"> | string
    name?: StringFilter<"Application"> | string
    language?: StringFilter<"Application"> | string
    lib?: StringFilter<"Application"> | string
    description?: StringNullableFilter<"Application"> | string | null
    prefix?: StringFilter<"Application"> | string
    prefix2?: StringNullableFilter<"Application"> | string | null
    createdAt?: DateTimeFilter<"Application"> | Date | string
    carefulAnalysis?: BoolFilter<"Application"> | boolean
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    votes?: VotesListRelationFilter
    analyze?: XOR<AnalyzeNullableScalarRelationFilter, AnalyzeWhereInput> | null
  }, "id" | "analyzeId">

  export type ApplicationOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    language?: SortOrder
    lib?: SortOrder
    description?: SortOrderInput | SortOrder
    prefix?: SortOrder
    prefix2?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    analyzeId?: SortOrderInput | SortOrder
    carefulAnalysis?: SortOrder
    _count?: ApplicationCountOrderByAggregateInput
    _avg?: ApplicationAvgOrderByAggregateInput
    _max?: ApplicationMaxOrderByAggregateInput
    _min?: ApplicationMinOrderByAggregateInput
    _sum?: ApplicationSumOrderByAggregateInput
  }

  export type ApplicationScalarWhereWithAggregatesInput = {
    AND?: ApplicationScalarWhereWithAggregatesInput | ApplicationScalarWhereWithAggregatesInput[]
    OR?: ApplicationScalarWhereWithAggregatesInput[]
    NOT?: ApplicationScalarWhereWithAggregatesInput | ApplicationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Application"> | string
    userId?: StringWithAggregatesFilter<"Application"> | string
    name?: StringWithAggregatesFilter<"Application"> | string
    language?: StringWithAggregatesFilter<"Application"> | string
    lib?: StringWithAggregatesFilter<"Application"> | string
    description?: StringNullableWithAggregatesFilter<"Application"> | string | null
    prefix?: StringWithAggregatesFilter<"Application"> | string
    prefix2?: StringNullableWithAggregatesFilter<"Application"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Application"> | Date | string
    analyzeId?: IntNullableWithAggregatesFilter<"Application"> | number | null
    carefulAnalysis?: BoolWithAggregatesFilter<"Application"> | boolean
  }

  export type CooldownWhereInput = {
    AND?: CooldownWhereInput | CooldownWhereInput[]
    OR?: CooldownWhereInput[]
    NOT?: CooldownWhereInput | CooldownWhereInput[]
    id?: IntFilter<"Cooldown"> | number
    userId?: StringFilter<"Cooldown"> | string
    name?: StringFilter<"Cooldown"> | string
    createdAt?: DateTimeFilter<"Cooldown"> | Date | string
    endIn?: DateTimeFilter<"Cooldown"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type CooldownOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    endIn?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type CooldownWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    userId_name?: CooldownUserIdNameCompoundUniqueInput
    AND?: CooldownWhereInput | CooldownWhereInput[]
    OR?: CooldownWhereInput[]
    NOT?: CooldownWhereInput | CooldownWhereInput[]
    userId?: StringFilter<"Cooldown"> | string
    name?: StringFilter<"Cooldown"> | string
    createdAt?: DateTimeFilter<"Cooldown"> | Date | string
    endIn?: DateTimeFilter<"Cooldown"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId_name">

  export type CooldownOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    endIn?: SortOrder
    _count?: CooldownCountOrderByAggregateInput
    _avg?: CooldownAvgOrderByAggregateInput
    _max?: CooldownMaxOrderByAggregateInput
    _min?: CooldownMinOrderByAggregateInput
    _sum?: CooldownSumOrderByAggregateInput
  }

  export type CooldownScalarWhereWithAggregatesInput = {
    AND?: CooldownScalarWhereWithAggregatesInput | CooldownScalarWhereWithAggregatesInput[]
    OR?: CooldownScalarWhereWithAggregatesInput[]
    NOT?: CooldownScalarWhereWithAggregatesInput | CooldownScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Cooldown"> | number
    userId?: StringWithAggregatesFilter<"Cooldown"> | string
    name?: StringWithAggregatesFilter<"Cooldown"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Cooldown"> | Date | string
    endIn?: DateTimeWithAggregatesFilter<"Cooldown"> | Date | string
  }

  export type AnnotationWhereInput = {
    AND?: AnnotationWhereInput | AnnotationWhereInput[]
    OR?: AnnotationWhereInput[]
    NOT?: AnnotationWhereInput | AnnotationWhereInput[]
    id?: IntFilter<"Annotation"> | number
    analyzeId?: IntFilter<"Annotation"> | number
    type?: StringFilter<"Annotation"> | string
    text?: StringFilter<"Annotation"> | string
    createdAt?: DateTimeFilter<"Annotation"> | Date | string
    analyze?: XOR<AnalyzeScalarRelationFilter, AnalyzeWhereInput>
  }

  export type AnnotationOrderByWithRelationInput = {
    id?: SortOrder
    analyzeId?: SortOrder
    type?: SortOrder
    text?: SortOrder
    createdAt?: SortOrder
    analyze?: AnalyzeOrderByWithRelationInput
  }

  export type AnnotationWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: AnnotationWhereInput | AnnotationWhereInput[]
    OR?: AnnotationWhereInput[]
    NOT?: AnnotationWhereInput | AnnotationWhereInput[]
    analyzeId?: IntFilter<"Annotation"> | number
    type?: StringFilter<"Annotation"> | string
    text?: StringFilter<"Annotation"> | string
    createdAt?: DateTimeFilter<"Annotation"> | Date | string
    analyze?: XOR<AnalyzeScalarRelationFilter, AnalyzeWhereInput>
  }, "id">

  export type AnnotationOrderByWithAggregationInput = {
    id?: SortOrder
    analyzeId?: SortOrder
    type?: SortOrder
    text?: SortOrder
    createdAt?: SortOrder
    _count?: AnnotationCountOrderByAggregateInput
    _avg?: AnnotationAvgOrderByAggregateInput
    _max?: AnnotationMaxOrderByAggregateInput
    _min?: AnnotationMinOrderByAggregateInput
    _sum?: AnnotationSumOrderByAggregateInput
  }

  export type AnnotationScalarWhereWithAggregatesInput = {
    AND?: AnnotationScalarWhereWithAggregatesInput | AnnotationScalarWhereWithAggregatesInput[]
    OR?: AnnotationScalarWhereWithAggregatesInput[]
    NOT?: AnnotationScalarWhereWithAggregatesInput | AnnotationScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Annotation"> | number
    analyzeId?: IntWithAggregatesFilter<"Annotation"> | number
    type?: StringWithAggregatesFilter<"Annotation"> | string
    text?: StringWithAggregatesFilter<"Annotation"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Annotation"> | Date | string
  }

  export type VoteReminderWhereInput = {
    AND?: VoteReminderWhereInput | VoteReminderWhereInput[]
    OR?: VoteReminderWhereInput[]
    NOT?: VoteReminderWhereInput | VoteReminderWhereInput[]
    userId?: StringFilter<"VoteReminder"> | string
    channelId?: StringFilter<"VoteReminder"> | string
    guildId?: StringFilter<"VoteReminder"> | string
    endTime?: DateTimeFilter<"VoteReminder"> | Date | string
  }

  export type VoteReminderOrderByWithRelationInput = {
    userId?: SortOrder
    channelId?: SortOrder
    guildId?: SortOrder
    endTime?: SortOrder
  }

  export type VoteReminderWhereUniqueInput = Prisma.AtLeast<{
    userId_channelId_guildId?: VoteReminderUserIdChannelIdGuildIdCompoundUniqueInput
    AND?: VoteReminderWhereInput | VoteReminderWhereInput[]
    OR?: VoteReminderWhereInput[]
    NOT?: VoteReminderWhereInput | VoteReminderWhereInput[]
    userId?: StringFilter<"VoteReminder"> | string
    channelId?: StringFilter<"VoteReminder"> | string
    guildId?: StringFilter<"VoteReminder"> | string
    endTime?: DateTimeFilter<"VoteReminder"> | Date | string
  }, "userId_channelId_guildId">

  export type VoteReminderOrderByWithAggregationInput = {
    userId?: SortOrder
    channelId?: SortOrder
    guildId?: SortOrder
    endTime?: SortOrder
    _count?: VoteReminderCountOrderByAggregateInput
    _max?: VoteReminderMaxOrderByAggregateInput
    _min?: VoteReminderMinOrderByAggregateInput
  }

  export type VoteReminderScalarWhereWithAggregatesInput = {
    AND?: VoteReminderScalarWhereWithAggregatesInput | VoteReminderScalarWhereWithAggregatesInput[]
    OR?: VoteReminderScalarWhereWithAggregatesInput[]
    NOT?: VoteReminderScalarWhereWithAggregatesInput | VoteReminderScalarWhereWithAggregatesInput[]
    userId?: StringWithAggregatesFilter<"VoteReminder"> | string
    channelId?: StringWithAggregatesFilter<"VoteReminder"> | string
    guildId?: StringWithAggregatesFilter<"VoteReminder"> | string
    endTime?: DateTimeWithAggregatesFilter<"VoteReminder"> | Date | string
  }

  export type AnalyzeWhereInput = {
    AND?: AnalyzeWhereInput | AnalyzeWhereInput[]
    OR?: AnalyzeWhereInput[]
    NOT?: AnalyzeWhereInput | AnalyzeWhereInput[]
    id?: IntFilter<"Analyze"> | number
    applicationId?: StringNullableFilter<"Analyze"> | string | null
    userId?: StringNullableFilter<"Analyze"> | string | null
    avaliation?: StringNullableFilter<"Analyze"> | string | null
    approved?: BoolNullableFilter<"Analyze"> | boolean | null
    createdAt?: DateTimeFilter<"Analyze"> | Date | string
    finishedIn?: DateTimeNullableFilter<"Analyze"> | Date | string | null
    application?: XOR<ApplicationNullableScalarRelationFilter, ApplicationWhereInput> | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    annotations?: AnnotationListRelationFilter
  }

  export type AnalyzeOrderByWithRelationInput = {
    id?: SortOrder
    applicationId?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    avaliation?: SortOrderInput | SortOrder
    approved?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    finishedIn?: SortOrderInput | SortOrder
    application?: ApplicationOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
    annotations?: AnnotationOrderByRelationAggregateInput
  }

  export type AnalyzeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: AnalyzeWhereInput | AnalyzeWhereInput[]
    OR?: AnalyzeWhereInput[]
    NOT?: AnalyzeWhereInput | AnalyzeWhereInput[]
    applicationId?: StringNullableFilter<"Analyze"> | string | null
    userId?: StringNullableFilter<"Analyze"> | string | null
    avaliation?: StringNullableFilter<"Analyze"> | string | null
    approved?: BoolNullableFilter<"Analyze"> | boolean | null
    createdAt?: DateTimeFilter<"Analyze"> | Date | string
    finishedIn?: DateTimeNullableFilter<"Analyze"> | Date | string | null
    application?: XOR<ApplicationNullableScalarRelationFilter, ApplicationWhereInput> | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    annotations?: AnnotationListRelationFilter
  }, "id">

  export type AnalyzeOrderByWithAggregationInput = {
    id?: SortOrder
    applicationId?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    avaliation?: SortOrderInput | SortOrder
    approved?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    finishedIn?: SortOrderInput | SortOrder
    _count?: AnalyzeCountOrderByAggregateInput
    _avg?: AnalyzeAvgOrderByAggregateInput
    _max?: AnalyzeMaxOrderByAggregateInput
    _min?: AnalyzeMinOrderByAggregateInput
    _sum?: AnalyzeSumOrderByAggregateInput
  }

  export type AnalyzeScalarWhereWithAggregatesInput = {
    AND?: AnalyzeScalarWhereWithAggregatesInput | AnalyzeScalarWhereWithAggregatesInput[]
    OR?: AnalyzeScalarWhereWithAggregatesInput[]
    NOT?: AnalyzeScalarWhereWithAggregatesInput | AnalyzeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Analyze"> | number
    applicationId?: StringNullableWithAggregatesFilter<"Analyze"> | string | null
    userId?: StringNullableWithAggregatesFilter<"Analyze"> | string | null
    avaliation?: StringNullableWithAggregatesFilter<"Analyze"> | string | null
    approved?: BoolNullableWithAggregatesFilter<"Analyze"> | boolean | null
    createdAt?: DateTimeWithAggregatesFilter<"Analyze"> | Date | string
    finishedIn?: DateTimeNullableWithAggregatesFilter<"Analyze"> | Date | string | null
  }

  export type UserCreateInput = {
    id: string
    blacklist?: boolean
    defaultVote?: string | null
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: Date | string
    analisingId?: number | null
    coins?: number
    applications?: ApplicationCreateNestedManyWithoutUserInput
    cooldowns?: CooldownCreateNestedManyWithoutUserInput
    analyzes?: AnalyzeCreateNestedManyWithoutUserInput
    votes?: VotesCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id: string
    blacklist?: boolean
    defaultVote?: string | null
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: Date | string
    analisingId?: number | null
    coins?: number
    applications?: ApplicationUncheckedCreateNestedManyWithoutUserInput
    cooldowns?: CooldownUncheckedCreateNestedManyWithoutUserInput
    analyzes?: AnalyzeUncheckedCreateNestedManyWithoutUserInput
    votes?: VotesUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    blacklist?: BoolFieldUpdateOperationsInput | boolean
    defaultVote?: NullableStringFieldUpdateOperationsInput | string | null
    isAvaliator?: BoolFieldUpdateOperationsInput | boolean
    isSuperAvaliator?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analisingId?: NullableIntFieldUpdateOperationsInput | number | null
    coins?: IntFieldUpdateOperationsInput | number
    applications?: ApplicationUpdateManyWithoutUserNestedInput
    cooldowns?: CooldownUpdateManyWithoutUserNestedInput
    analyzes?: AnalyzeUpdateManyWithoutUserNestedInput
    votes?: VotesUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    blacklist?: BoolFieldUpdateOperationsInput | boolean
    defaultVote?: NullableStringFieldUpdateOperationsInput | string | null
    isAvaliator?: BoolFieldUpdateOperationsInput | boolean
    isSuperAvaliator?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analisingId?: NullableIntFieldUpdateOperationsInput | number | null
    coins?: IntFieldUpdateOperationsInput | number
    applications?: ApplicationUncheckedUpdateManyWithoutUserNestedInput
    cooldowns?: CooldownUncheckedUpdateManyWithoutUserNestedInput
    analyzes?: AnalyzeUncheckedUpdateManyWithoutUserNestedInput
    votes?: VotesUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id: string
    blacklist?: boolean
    defaultVote?: string | null
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: Date | string
    analisingId?: number | null
    coins?: number
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    blacklist?: BoolFieldUpdateOperationsInput | boolean
    defaultVote?: NullableStringFieldUpdateOperationsInput | string | null
    isAvaliator?: BoolFieldUpdateOperationsInput | boolean
    isSuperAvaliator?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analisingId?: NullableIntFieldUpdateOperationsInput | number | null
    coins?: IntFieldUpdateOperationsInput | number
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    blacklist?: BoolFieldUpdateOperationsInput | boolean
    defaultVote?: NullableStringFieldUpdateOperationsInput | string | null
    isAvaliator?: BoolFieldUpdateOperationsInput | boolean
    isSuperAvaliator?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analisingId?: NullableIntFieldUpdateOperationsInput | number | null
    coins?: IntFieldUpdateOperationsInput | number
  }

  export type VotesCreateInput = {
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutVotesInput
    application: ApplicationCreateNestedOneWithoutVotesInput
  }

  export type VotesUncheckedCreateInput = {
    id?: number
    userId: string
    applicationId: string
    createdAt?: Date | string
  }

  export type VotesUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutVotesNestedInput
    application?: ApplicationUpdateOneRequiredWithoutVotesNestedInput
  }

  export type VotesUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
    applicationId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VotesCreateManyInput = {
    id?: number
    userId: string
    applicationId: string
    createdAt?: Date | string
  }

  export type VotesUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VotesUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
    applicationId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationCreateInput = {
    id: string
    name: string
    language: string
    lib: string
    description?: string | null
    prefix: string
    prefix2?: string | null
    createdAt?: Date | string
    carefulAnalysis?: boolean
    user: UserCreateNestedOneWithoutApplicationsInput
    votes?: VotesCreateNestedManyWithoutApplicationInput
    analyze?: AnalyzeCreateNestedOneWithoutApplicationInput
  }

  export type ApplicationUncheckedCreateInput = {
    id: string
    userId: string
    name: string
    language: string
    lib: string
    description?: string | null
    prefix: string
    prefix2?: string | null
    createdAt?: Date | string
    analyzeId?: number | null
    carefulAnalysis?: boolean
    votes?: VotesUncheckedCreateNestedManyWithoutApplicationInput
  }

  export type ApplicationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lib?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    prefix?: StringFieldUpdateOperationsInput | string
    prefix2?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    carefulAnalysis?: BoolFieldUpdateOperationsInput | boolean
    user?: UserUpdateOneRequiredWithoutApplicationsNestedInput
    votes?: VotesUpdateManyWithoutApplicationNestedInput
    analyze?: AnalyzeUpdateOneWithoutApplicationNestedInput
  }

  export type ApplicationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lib?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    prefix?: StringFieldUpdateOperationsInput | string
    prefix2?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analyzeId?: NullableIntFieldUpdateOperationsInput | number | null
    carefulAnalysis?: BoolFieldUpdateOperationsInput | boolean
    votes?: VotesUncheckedUpdateManyWithoutApplicationNestedInput
  }

  export type ApplicationCreateManyInput = {
    id: string
    userId: string
    name: string
    language: string
    lib: string
    description?: string | null
    prefix: string
    prefix2?: string | null
    createdAt?: Date | string
    analyzeId?: number | null
    carefulAnalysis?: boolean
  }

  export type ApplicationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lib?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    prefix?: StringFieldUpdateOperationsInput | string
    prefix2?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    carefulAnalysis?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ApplicationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lib?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    prefix?: StringFieldUpdateOperationsInput | string
    prefix2?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analyzeId?: NullableIntFieldUpdateOperationsInput | number | null
    carefulAnalysis?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CooldownCreateInput = {
    name: string
    createdAt?: Date | string
    endIn: Date | string
    user: UserCreateNestedOneWithoutCooldownsInput
  }

  export type CooldownUncheckedCreateInput = {
    id?: number
    userId: string
    name: string
    createdAt?: Date | string
    endIn: Date | string
  }

  export type CooldownUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endIn?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutCooldownsNestedInput
  }

  export type CooldownUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endIn?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CooldownCreateManyInput = {
    id?: number
    userId: string
    name: string
    createdAt?: Date | string
    endIn: Date | string
  }

  export type CooldownUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endIn?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CooldownUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endIn?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationCreateInput = {
    type: string
    text: string
    createdAt?: Date | string
    analyze: AnalyzeCreateNestedOneWithoutAnnotationsInput
  }

  export type AnnotationUncheckedCreateInput = {
    id?: number
    analyzeId: number
    type: string
    text: string
    createdAt?: Date | string
  }

  export type AnnotationUpdateInput = {
    type?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analyze?: AnalyzeUpdateOneRequiredWithoutAnnotationsNestedInput
  }

  export type AnnotationUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    analyzeId?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationCreateManyInput = {
    id?: number
    analyzeId: number
    type: string
    text: string
    createdAt?: Date | string
  }

  export type AnnotationUpdateManyMutationInput = {
    type?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    analyzeId?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoteReminderCreateInput = {
    userId: string
    channelId: string
    guildId: string
    endTime: Date | string
  }

  export type VoteReminderUncheckedCreateInput = {
    userId: string
    channelId: string
    guildId: string
    endTime: Date | string
  }

  export type VoteReminderUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    channelId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoteReminderUncheckedUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    channelId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoteReminderCreateManyInput = {
    userId: string
    channelId: string
    guildId: string
    endTime: Date | string
  }

  export type VoteReminderUpdateManyMutationInput = {
    userId?: StringFieldUpdateOperationsInput | string
    channelId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoteReminderUncheckedUpdateManyInput = {
    userId?: StringFieldUpdateOperationsInput | string
    channelId?: StringFieldUpdateOperationsInput | string
    guildId?: StringFieldUpdateOperationsInput | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnalyzeCreateInput = {
    applicationId?: string | null
    avaliation?: string | null
    approved?: boolean | null
    createdAt?: Date | string
    finishedIn?: Date | string | null
    application?: ApplicationCreateNestedOneWithoutAnalyzeInput
    user?: UserCreateNestedOneWithoutAnalyzesInput
    annotations?: AnnotationCreateNestedManyWithoutAnalyzeInput
  }

  export type AnalyzeUncheckedCreateInput = {
    id?: number
    applicationId?: string | null
    userId?: string | null
    avaliation?: string | null
    approved?: boolean | null
    createdAt?: Date | string
    finishedIn?: Date | string | null
    application?: ApplicationUncheckedCreateNestedOneWithoutAnalyzeInput
    annotations?: AnnotationUncheckedCreateNestedManyWithoutAnalyzeInput
  }

  export type AnalyzeUpdateInput = {
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    avaliation?: NullableStringFieldUpdateOperationsInput | string | null
    approved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    application?: ApplicationUpdateOneWithoutAnalyzeNestedInput
    user?: UserUpdateOneWithoutAnalyzesNestedInput
    annotations?: AnnotationUpdateManyWithoutAnalyzeNestedInput
  }

  export type AnalyzeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    avaliation?: NullableStringFieldUpdateOperationsInput | string | null
    approved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    application?: ApplicationUncheckedUpdateOneWithoutAnalyzeNestedInput
    annotations?: AnnotationUncheckedUpdateManyWithoutAnalyzeNestedInput
  }

  export type AnalyzeCreateManyInput = {
    id?: number
    applicationId?: string | null
    userId?: string | null
    avaliation?: string | null
    approved?: boolean | null
    createdAt?: Date | string
    finishedIn?: Date | string | null
  }

  export type AnalyzeUpdateManyMutationInput = {
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    avaliation?: NullableStringFieldUpdateOperationsInput | string | null
    approved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AnalyzeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    avaliation?: NullableStringFieldUpdateOperationsInput | string | null
    approved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type ApplicationListRelationFilter = {
    every?: ApplicationWhereInput
    some?: ApplicationWhereInput
    none?: ApplicationWhereInput
  }

  export type CooldownListRelationFilter = {
    every?: CooldownWhereInput
    some?: CooldownWhereInput
    none?: CooldownWhereInput
  }

  export type AnalyzeListRelationFilter = {
    every?: AnalyzeWhereInput
    some?: AnalyzeWhereInput
    none?: AnalyzeWhereInput
  }

  export type VotesListRelationFilter = {
    every?: VotesWhereInput
    some?: VotesWhereInput
    none?: VotesWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ApplicationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CooldownOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AnalyzeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VotesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    blacklist?: SortOrder
    defaultVote?: SortOrder
    isAvaliator?: SortOrder
    isSuperAvaliator?: SortOrder
    createdAt?: SortOrder
    analisingId?: SortOrder
    coins?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    analisingId?: SortOrder
    coins?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    blacklist?: SortOrder
    defaultVote?: SortOrder
    isAvaliator?: SortOrder
    isSuperAvaliator?: SortOrder
    createdAt?: SortOrder
    analisingId?: SortOrder
    coins?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    blacklist?: SortOrder
    defaultVote?: SortOrder
    isAvaliator?: SortOrder
    isSuperAvaliator?: SortOrder
    createdAt?: SortOrder
    analisingId?: SortOrder
    coins?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    analisingId?: SortOrder
    coins?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type ApplicationScalarRelationFilter = {
    is?: ApplicationWhereInput
    isNot?: ApplicationWhereInput
  }

  export type VotesCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    applicationId?: SortOrder
    createdAt?: SortOrder
  }

  export type VotesAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type VotesMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    applicationId?: SortOrder
    createdAt?: SortOrder
  }

  export type VotesMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    applicationId?: SortOrder
    createdAt?: SortOrder
  }

  export type VotesSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AnalyzeNullableScalarRelationFilter = {
    is?: AnalyzeWhereInput | null
    isNot?: AnalyzeWhereInput | null
  }

  export type ApplicationCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    language?: SortOrder
    lib?: SortOrder
    description?: SortOrder
    prefix?: SortOrder
    prefix2?: SortOrder
    createdAt?: SortOrder
    analyzeId?: SortOrder
    carefulAnalysis?: SortOrder
  }

  export type ApplicationAvgOrderByAggregateInput = {
    analyzeId?: SortOrder
  }

  export type ApplicationMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    language?: SortOrder
    lib?: SortOrder
    description?: SortOrder
    prefix?: SortOrder
    prefix2?: SortOrder
    createdAt?: SortOrder
    analyzeId?: SortOrder
    carefulAnalysis?: SortOrder
  }

  export type ApplicationMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    language?: SortOrder
    lib?: SortOrder
    description?: SortOrder
    prefix?: SortOrder
    prefix2?: SortOrder
    createdAt?: SortOrder
    analyzeId?: SortOrder
    carefulAnalysis?: SortOrder
  }

  export type ApplicationSumOrderByAggregateInput = {
    analyzeId?: SortOrder
  }

  export type CooldownUserIdNameCompoundUniqueInput = {
    userId: string
    name: string
  }

  export type CooldownCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    endIn?: SortOrder
  }

  export type CooldownAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CooldownMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    endIn?: SortOrder
  }

  export type CooldownMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    endIn?: SortOrder
  }

  export type CooldownSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AnalyzeScalarRelationFilter = {
    is?: AnalyzeWhereInput
    isNot?: AnalyzeWhereInput
  }

  export type AnnotationCountOrderByAggregateInput = {
    id?: SortOrder
    analyzeId?: SortOrder
    type?: SortOrder
    text?: SortOrder
    createdAt?: SortOrder
  }

  export type AnnotationAvgOrderByAggregateInput = {
    id?: SortOrder
    analyzeId?: SortOrder
  }

  export type AnnotationMaxOrderByAggregateInput = {
    id?: SortOrder
    analyzeId?: SortOrder
    type?: SortOrder
    text?: SortOrder
    createdAt?: SortOrder
  }

  export type AnnotationMinOrderByAggregateInput = {
    id?: SortOrder
    analyzeId?: SortOrder
    type?: SortOrder
    text?: SortOrder
    createdAt?: SortOrder
  }

  export type AnnotationSumOrderByAggregateInput = {
    id?: SortOrder
    analyzeId?: SortOrder
  }

  export type VoteReminderUserIdChannelIdGuildIdCompoundUniqueInput = {
    userId: string
    channelId: string
    guildId: string
  }

  export type VoteReminderCountOrderByAggregateInput = {
    userId?: SortOrder
    channelId?: SortOrder
    guildId?: SortOrder
    endTime?: SortOrder
  }

  export type VoteReminderMaxOrderByAggregateInput = {
    userId?: SortOrder
    channelId?: SortOrder
    guildId?: SortOrder
    endTime?: SortOrder
  }

  export type VoteReminderMinOrderByAggregateInput = {
    userId?: SortOrder
    channelId?: SortOrder
    guildId?: SortOrder
    endTime?: SortOrder
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ApplicationNullableScalarRelationFilter = {
    is?: ApplicationWhereInput | null
    isNot?: ApplicationWhereInput | null
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type AnnotationListRelationFilter = {
    every?: AnnotationWhereInput
    some?: AnnotationWhereInput
    none?: AnnotationWhereInput
  }

  export type AnnotationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AnalyzeCountOrderByAggregateInput = {
    id?: SortOrder
    applicationId?: SortOrder
    userId?: SortOrder
    avaliation?: SortOrder
    approved?: SortOrder
    createdAt?: SortOrder
    finishedIn?: SortOrder
  }

  export type AnalyzeAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AnalyzeMaxOrderByAggregateInput = {
    id?: SortOrder
    applicationId?: SortOrder
    userId?: SortOrder
    avaliation?: SortOrder
    approved?: SortOrder
    createdAt?: SortOrder
    finishedIn?: SortOrder
  }

  export type AnalyzeMinOrderByAggregateInput = {
    id?: SortOrder
    applicationId?: SortOrder
    userId?: SortOrder
    avaliation?: SortOrder
    approved?: SortOrder
    createdAt?: SortOrder
    finishedIn?: SortOrder
  }

  export type AnalyzeSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ApplicationCreateNestedManyWithoutUserInput = {
    create?: XOR<ApplicationCreateWithoutUserInput, ApplicationUncheckedCreateWithoutUserInput> | ApplicationCreateWithoutUserInput[] | ApplicationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ApplicationCreateOrConnectWithoutUserInput | ApplicationCreateOrConnectWithoutUserInput[]
    createMany?: ApplicationCreateManyUserInputEnvelope
    connect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
  }

  export type CooldownCreateNestedManyWithoutUserInput = {
    create?: XOR<CooldownCreateWithoutUserInput, CooldownUncheckedCreateWithoutUserInput> | CooldownCreateWithoutUserInput[] | CooldownUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CooldownCreateOrConnectWithoutUserInput | CooldownCreateOrConnectWithoutUserInput[]
    createMany?: CooldownCreateManyUserInputEnvelope
    connect?: CooldownWhereUniqueInput | CooldownWhereUniqueInput[]
  }

  export type AnalyzeCreateNestedManyWithoutUserInput = {
    create?: XOR<AnalyzeCreateWithoutUserInput, AnalyzeUncheckedCreateWithoutUserInput> | AnalyzeCreateWithoutUserInput[] | AnalyzeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AnalyzeCreateOrConnectWithoutUserInput | AnalyzeCreateOrConnectWithoutUserInput[]
    createMany?: AnalyzeCreateManyUserInputEnvelope
    connect?: AnalyzeWhereUniqueInput | AnalyzeWhereUniqueInput[]
  }

  export type VotesCreateNestedManyWithoutUserInput = {
    create?: XOR<VotesCreateWithoutUserInput, VotesUncheckedCreateWithoutUserInput> | VotesCreateWithoutUserInput[] | VotesUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VotesCreateOrConnectWithoutUserInput | VotesCreateOrConnectWithoutUserInput[]
    createMany?: VotesCreateManyUserInputEnvelope
    connect?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
  }

  export type ApplicationUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ApplicationCreateWithoutUserInput, ApplicationUncheckedCreateWithoutUserInput> | ApplicationCreateWithoutUserInput[] | ApplicationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ApplicationCreateOrConnectWithoutUserInput | ApplicationCreateOrConnectWithoutUserInput[]
    createMany?: ApplicationCreateManyUserInputEnvelope
    connect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
  }

  export type CooldownUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<CooldownCreateWithoutUserInput, CooldownUncheckedCreateWithoutUserInput> | CooldownCreateWithoutUserInput[] | CooldownUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CooldownCreateOrConnectWithoutUserInput | CooldownCreateOrConnectWithoutUserInput[]
    createMany?: CooldownCreateManyUserInputEnvelope
    connect?: CooldownWhereUniqueInput | CooldownWhereUniqueInput[]
  }

  export type AnalyzeUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AnalyzeCreateWithoutUserInput, AnalyzeUncheckedCreateWithoutUserInput> | AnalyzeCreateWithoutUserInput[] | AnalyzeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AnalyzeCreateOrConnectWithoutUserInput | AnalyzeCreateOrConnectWithoutUserInput[]
    createMany?: AnalyzeCreateManyUserInputEnvelope
    connect?: AnalyzeWhereUniqueInput | AnalyzeWhereUniqueInput[]
  }

  export type VotesUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<VotesCreateWithoutUserInput, VotesUncheckedCreateWithoutUserInput> | VotesCreateWithoutUserInput[] | VotesUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VotesCreateOrConnectWithoutUserInput | VotesCreateOrConnectWithoutUserInput[]
    createMany?: VotesCreateManyUserInputEnvelope
    connect?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ApplicationUpdateManyWithoutUserNestedInput = {
    create?: XOR<ApplicationCreateWithoutUserInput, ApplicationUncheckedCreateWithoutUserInput> | ApplicationCreateWithoutUserInput[] | ApplicationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ApplicationCreateOrConnectWithoutUserInput | ApplicationCreateOrConnectWithoutUserInput[]
    upsert?: ApplicationUpsertWithWhereUniqueWithoutUserInput | ApplicationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ApplicationCreateManyUserInputEnvelope
    set?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    disconnect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    delete?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    connect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    update?: ApplicationUpdateWithWhereUniqueWithoutUserInput | ApplicationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ApplicationUpdateManyWithWhereWithoutUserInput | ApplicationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ApplicationScalarWhereInput | ApplicationScalarWhereInput[]
  }

  export type CooldownUpdateManyWithoutUserNestedInput = {
    create?: XOR<CooldownCreateWithoutUserInput, CooldownUncheckedCreateWithoutUserInput> | CooldownCreateWithoutUserInput[] | CooldownUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CooldownCreateOrConnectWithoutUserInput | CooldownCreateOrConnectWithoutUserInput[]
    upsert?: CooldownUpsertWithWhereUniqueWithoutUserInput | CooldownUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CooldownCreateManyUserInputEnvelope
    set?: CooldownWhereUniqueInput | CooldownWhereUniqueInput[]
    disconnect?: CooldownWhereUniqueInput | CooldownWhereUniqueInput[]
    delete?: CooldownWhereUniqueInput | CooldownWhereUniqueInput[]
    connect?: CooldownWhereUniqueInput | CooldownWhereUniqueInput[]
    update?: CooldownUpdateWithWhereUniqueWithoutUserInput | CooldownUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CooldownUpdateManyWithWhereWithoutUserInput | CooldownUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CooldownScalarWhereInput | CooldownScalarWhereInput[]
  }

  export type AnalyzeUpdateManyWithoutUserNestedInput = {
    create?: XOR<AnalyzeCreateWithoutUserInput, AnalyzeUncheckedCreateWithoutUserInput> | AnalyzeCreateWithoutUserInput[] | AnalyzeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AnalyzeCreateOrConnectWithoutUserInput | AnalyzeCreateOrConnectWithoutUserInput[]
    upsert?: AnalyzeUpsertWithWhereUniqueWithoutUserInput | AnalyzeUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AnalyzeCreateManyUserInputEnvelope
    set?: AnalyzeWhereUniqueInput | AnalyzeWhereUniqueInput[]
    disconnect?: AnalyzeWhereUniqueInput | AnalyzeWhereUniqueInput[]
    delete?: AnalyzeWhereUniqueInput | AnalyzeWhereUniqueInput[]
    connect?: AnalyzeWhereUniqueInput | AnalyzeWhereUniqueInput[]
    update?: AnalyzeUpdateWithWhereUniqueWithoutUserInput | AnalyzeUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AnalyzeUpdateManyWithWhereWithoutUserInput | AnalyzeUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AnalyzeScalarWhereInput | AnalyzeScalarWhereInput[]
  }

  export type VotesUpdateManyWithoutUserNestedInput = {
    create?: XOR<VotesCreateWithoutUserInput, VotesUncheckedCreateWithoutUserInput> | VotesCreateWithoutUserInput[] | VotesUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VotesCreateOrConnectWithoutUserInput | VotesCreateOrConnectWithoutUserInput[]
    upsert?: VotesUpsertWithWhereUniqueWithoutUserInput | VotesUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: VotesCreateManyUserInputEnvelope
    set?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    disconnect?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    delete?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    connect?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    update?: VotesUpdateWithWhereUniqueWithoutUserInput | VotesUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: VotesUpdateManyWithWhereWithoutUserInput | VotesUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: VotesScalarWhereInput | VotesScalarWhereInput[]
  }

  export type ApplicationUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ApplicationCreateWithoutUserInput, ApplicationUncheckedCreateWithoutUserInput> | ApplicationCreateWithoutUserInput[] | ApplicationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ApplicationCreateOrConnectWithoutUserInput | ApplicationCreateOrConnectWithoutUserInput[]
    upsert?: ApplicationUpsertWithWhereUniqueWithoutUserInput | ApplicationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ApplicationCreateManyUserInputEnvelope
    set?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    disconnect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    delete?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    connect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    update?: ApplicationUpdateWithWhereUniqueWithoutUserInput | ApplicationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ApplicationUpdateManyWithWhereWithoutUserInput | ApplicationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ApplicationScalarWhereInput | ApplicationScalarWhereInput[]
  }

  export type CooldownUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<CooldownCreateWithoutUserInput, CooldownUncheckedCreateWithoutUserInput> | CooldownCreateWithoutUserInput[] | CooldownUncheckedCreateWithoutUserInput[]
    connectOrCreate?: CooldownCreateOrConnectWithoutUserInput | CooldownCreateOrConnectWithoutUserInput[]
    upsert?: CooldownUpsertWithWhereUniqueWithoutUserInput | CooldownUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: CooldownCreateManyUserInputEnvelope
    set?: CooldownWhereUniqueInput | CooldownWhereUniqueInput[]
    disconnect?: CooldownWhereUniqueInput | CooldownWhereUniqueInput[]
    delete?: CooldownWhereUniqueInput | CooldownWhereUniqueInput[]
    connect?: CooldownWhereUniqueInput | CooldownWhereUniqueInput[]
    update?: CooldownUpdateWithWhereUniqueWithoutUserInput | CooldownUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: CooldownUpdateManyWithWhereWithoutUserInput | CooldownUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: CooldownScalarWhereInput | CooldownScalarWhereInput[]
  }

  export type AnalyzeUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AnalyzeCreateWithoutUserInput, AnalyzeUncheckedCreateWithoutUserInput> | AnalyzeCreateWithoutUserInput[] | AnalyzeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AnalyzeCreateOrConnectWithoutUserInput | AnalyzeCreateOrConnectWithoutUserInput[]
    upsert?: AnalyzeUpsertWithWhereUniqueWithoutUserInput | AnalyzeUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AnalyzeCreateManyUserInputEnvelope
    set?: AnalyzeWhereUniqueInput | AnalyzeWhereUniqueInput[]
    disconnect?: AnalyzeWhereUniqueInput | AnalyzeWhereUniqueInput[]
    delete?: AnalyzeWhereUniqueInput | AnalyzeWhereUniqueInput[]
    connect?: AnalyzeWhereUniqueInput | AnalyzeWhereUniqueInput[]
    update?: AnalyzeUpdateWithWhereUniqueWithoutUserInput | AnalyzeUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AnalyzeUpdateManyWithWhereWithoutUserInput | AnalyzeUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AnalyzeScalarWhereInput | AnalyzeScalarWhereInput[]
  }

  export type VotesUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<VotesCreateWithoutUserInput, VotesUncheckedCreateWithoutUserInput> | VotesCreateWithoutUserInput[] | VotesUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VotesCreateOrConnectWithoutUserInput | VotesCreateOrConnectWithoutUserInput[]
    upsert?: VotesUpsertWithWhereUniqueWithoutUserInput | VotesUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: VotesCreateManyUserInputEnvelope
    set?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    disconnect?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    delete?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    connect?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    update?: VotesUpdateWithWhereUniqueWithoutUserInput | VotesUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: VotesUpdateManyWithWhereWithoutUserInput | VotesUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: VotesScalarWhereInput | VotesScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutVotesInput = {
    create?: XOR<UserCreateWithoutVotesInput, UserUncheckedCreateWithoutVotesInput>
    connectOrCreate?: UserCreateOrConnectWithoutVotesInput
    connect?: UserWhereUniqueInput
  }

  export type ApplicationCreateNestedOneWithoutVotesInput = {
    create?: XOR<ApplicationCreateWithoutVotesInput, ApplicationUncheckedCreateWithoutVotesInput>
    connectOrCreate?: ApplicationCreateOrConnectWithoutVotesInput
    connect?: ApplicationWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutVotesNestedInput = {
    create?: XOR<UserCreateWithoutVotesInput, UserUncheckedCreateWithoutVotesInput>
    connectOrCreate?: UserCreateOrConnectWithoutVotesInput
    upsert?: UserUpsertWithoutVotesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutVotesInput, UserUpdateWithoutVotesInput>, UserUncheckedUpdateWithoutVotesInput>
  }

  export type ApplicationUpdateOneRequiredWithoutVotesNestedInput = {
    create?: XOR<ApplicationCreateWithoutVotesInput, ApplicationUncheckedCreateWithoutVotesInput>
    connectOrCreate?: ApplicationCreateOrConnectWithoutVotesInput
    upsert?: ApplicationUpsertWithoutVotesInput
    connect?: ApplicationWhereUniqueInput
    update?: XOR<XOR<ApplicationUpdateToOneWithWhereWithoutVotesInput, ApplicationUpdateWithoutVotesInput>, ApplicationUncheckedUpdateWithoutVotesInput>
  }

  export type UserCreateNestedOneWithoutApplicationsInput = {
    create?: XOR<UserCreateWithoutApplicationsInput, UserUncheckedCreateWithoutApplicationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutApplicationsInput
    connect?: UserWhereUniqueInput
  }

  export type VotesCreateNestedManyWithoutApplicationInput = {
    create?: XOR<VotesCreateWithoutApplicationInput, VotesUncheckedCreateWithoutApplicationInput> | VotesCreateWithoutApplicationInput[] | VotesUncheckedCreateWithoutApplicationInput[]
    connectOrCreate?: VotesCreateOrConnectWithoutApplicationInput | VotesCreateOrConnectWithoutApplicationInput[]
    createMany?: VotesCreateManyApplicationInputEnvelope
    connect?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
  }

  export type AnalyzeCreateNestedOneWithoutApplicationInput = {
    create?: XOR<AnalyzeCreateWithoutApplicationInput, AnalyzeUncheckedCreateWithoutApplicationInput>
    connectOrCreate?: AnalyzeCreateOrConnectWithoutApplicationInput
    connect?: AnalyzeWhereUniqueInput
  }

  export type VotesUncheckedCreateNestedManyWithoutApplicationInput = {
    create?: XOR<VotesCreateWithoutApplicationInput, VotesUncheckedCreateWithoutApplicationInput> | VotesCreateWithoutApplicationInput[] | VotesUncheckedCreateWithoutApplicationInput[]
    connectOrCreate?: VotesCreateOrConnectWithoutApplicationInput | VotesCreateOrConnectWithoutApplicationInput[]
    createMany?: VotesCreateManyApplicationInputEnvelope
    connect?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutApplicationsNestedInput = {
    create?: XOR<UserCreateWithoutApplicationsInput, UserUncheckedCreateWithoutApplicationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutApplicationsInput
    upsert?: UserUpsertWithoutApplicationsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutApplicationsInput, UserUpdateWithoutApplicationsInput>, UserUncheckedUpdateWithoutApplicationsInput>
  }

  export type VotesUpdateManyWithoutApplicationNestedInput = {
    create?: XOR<VotesCreateWithoutApplicationInput, VotesUncheckedCreateWithoutApplicationInput> | VotesCreateWithoutApplicationInput[] | VotesUncheckedCreateWithoutApplicationInput[]
    connectOrCreate?: VotesCreateOrConnectWithoutApplicationInput | VotesCreateOrConnectWithoutApplicationInput[]
    upsert?: VotesUpsertWithWhereUniqueWithoutApplicationInput | VotesUpsertWithWhereUniqueWithoutApplicationInput[]
    createMany?: VotesCreateManyApplicationInputEnvelope
    set?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    disconnect?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    delete?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    connect?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    update?: VotesUpdateWithWhereUniqueWithoutApplicationInput | VotesUpdateWithWhereUniqueWithoutApplicationInput[]
    updateMany?: VotesUpdateManyWithWhereWithoutApplicationInput | VotesUpdateManyWithWhereWithoutApplicationInput[]
    deleteMany?: VotesScalarWhereInput | VotesScalarWhereInput[]
  }

  export type AnalyzeUpdateOneWithoutApplicationNestedInput = {
    create?: XOR<AnalyzeCreateWithoutApplicationInput, AnalyzeUncheckedCreateWithoutApplicationInput>
    connectOrCreate?: AnalyzeCreateOrConnectWithoutApplicationInput
    upsert?: AnalyzeUpsertWithoutApplicationInput
    disconnect?: AnalyzeWhereInput | boolean
    delete?: AnalyzeWhereInput | boolean
    connect?: AnalyzeWhereUniqueInput
    update?: XOR<XOR<AnalyzeUpdateToOneWithWhereWithoutApplicationInput, AnalyzeUpdateWithoutApplicationInput>, AnalyzeUncheckedUpdateWithoutApplicationInput>
  }

  export type VotesUncheckedUpdateManyWithoutApplicationNestedInput = {
    create?: XOR<VotesCreateWithoutApplicationInput, VotesUncheckedCreateWithoutApplicationInput> | VotesCreateWithoutApplicationInput[] | VotesUncheckedCreateWithoutApplicationInput[]
    connectOrCreate?: VotesCreateOrConnectWithoutApplicationInput | VotesCreateOrConnectWithoutApplicationInput[]
    upsert?: VotesUpsertWithWhereUniqueWithoutApplicationInput | VotesUpsertWithWhereUniqueWithoutApplicationInput[]
    createMany?: VotesCreateManyApplicationInputEnvelope
    set?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    disconnect?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    delete?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    connect?: VotesWhereUniqueInput | VotesWhereUniqueInput[]
    update?: VotesUpdateWithWhereUniqueWithoutApplicationInput | VotesUpdateWithWhereUniqueWithoutApplicationInput[]
    updateMany?: VotesUpdateManyWithWhereWithoutApplicationInput | VotesUpdateManyWithWhereWithoutApplicationInput[]
    deleteMany?: VotesScalarWhereInput | VotesScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutCooldownsInput = {
    create?: XOR<UserCreateWithoutCooldownsInput, UserUncheckedCreateWithoutCooldownsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCooldownsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutCooldownsNestedInput = {
    create?: XOR<UserCreateWithoutCooldownsInput, UserUncheckedCreateWithoutCooldownsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCooldownsInput
    upsert?: UserUpsertWithoutCooldownsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCooldownsInput, UserUpdateWithoutCooldownsInput>, UserUncheckedUpdateWithoutCooldownsInput>
  }

  export type AnalyzeCreateNestedOneWithoutAnnotationsInput = {
    create?: XOR<AnalyzeCreateWithoutAnnotationsInput, AnalyzeUncheckedCreateWithoutAnnotationsInput>
    connectOrCreate?: AnalyzeCreateOrConnectWithoutAnnotationsInput
    connect?: AnalyzeWhereUniqueInput
  }

  export type AnalyzeUpdateOneRequiredWithoutAnnotationsNestedInput = {
    create?: XOR<AnalyzeCreateWithoutAnnotationsInput, AnalyzeUncheckedCreateWithoutAnnotationsInput>
    connectOrCreate?: AnalyzeCreateOrConnectWithoutAnnotationsInput
    upsert?: AnalyzeUpsertWithoutAnnotationsInput
    connect?: AnalyzeWhereUniqueInput
    update?: XOR<XOR<AnalyzeUpdateToOneWithWhereWithoutAnnotationsInput, AnalyzeUpdateWithoutAnnotationsInput>, AnalyzeUncheckedUpdateWithoutAnnotationsInput>
  }

  export type ApplicationCreateNestedOneWithoutAnalyzeInput = {
    create?: XOR<ApplicationCreateWithoutAnalyzeInput, ApplicationUncheckedCreateWithoutAnalyzeInput>
    connectOrCreate?: ApplicationCreateOrConnectWithoutAnalyzeInput
    connect?: ApplicationWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutAnalyzesInput = {
    create?: XOR<UserCreateWithoutAnalyzesInput, UserUncheckedCreateWithoutAnalyzesInput>
    connectOrCreate?: UserCreateOrConnectWithoutAnalyzesInput
    connect?: UserWhereUniqueInput
  }

  export type AnnotationCreateNestedManyWithoutAnalyzeInput = {
    create?: XOR<AnnotationCreateWithoutAnalyzeInput, AnnotationUncheckedCreateWithoutAnalyzeInput> | AnnotationCreateWithoutAnalyzeInput[] | AnnotationUncheckedCreateWithoutAnalyzeInput[]
    connectOrCreate?: AnnotationCreateOrConnectWithoutAnalyzeInput | AnnotationCreateOrConnectWithoutAnalyzeInput[]
    createMany?: AnnotationCreateManyAnalyzeInputEnvelope
    connect?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
  }

  export type ApplicationUncheckedCreateNestedOneWithoutAnalyzeInput = {
    create?: XOR<ApplicationCreateWithoutAnalyzeInput, ApplicationUncheckedCreateWithoutAnalyzeInput>
    connectOrCreate?: ApplicationCreateOrConnectWithoutAnalyzeInput
    connect?: ApplicationWhereUniqueInput
  }

  export type AnnotationUncheckedCreateNestedManyWithoutAnalyzeInput = {
    create?: XOR<AnnotationCreateWithoutAnalyzeInput, AnnotationUncheckedCreateWithoutAnalyzeInput> | AnnotationCreateWithoutAnalyzeInput[] | AnnotationUncheckedCreateWithoutAnalyzeInput[]
    connectOrCreate?: AnnotationCreateOrConnectWithoutAnalyzeInput | AnnotationCreateOrConnectWithoutAnalyzeInput[]
    createMany?: AnnotationCreateManyAnalyzeInputEnvelope
    connect?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ApplicationUpdateOneWithoutAnalyzeNestedInput = {
    create?: XOR<ApplicationCreateWithoutAnalyzeInput, ApplicationUncheckedCreateWithoutAnalyzeInput>
    connectOrCreate?: ApplicationCreateOrConnectWithoutAnalyzeInput
    upsert?: ApplicationUpsertWithoutAnalyzeInput
    disconnect?: ApplicationWhereInput | boolean
    delete?: ApplicationWhereInput | boolean
    connect?: ApplicationWhereUniqueInput
    update?: XOR<XOR<ApplicationUpdateToOneWithWhereWithoutAnalyzeInput, ApplicationUpdateWithoutAnalyzeInput>, ApplicationUncheckedUpdateWithoutAnalyzeInput>
  }

  export type UserUpdateOneWithoutAnalyzesNestedInput = {
    create?: XOR<UserCreateWithoutAnalyzesInput, UserUncheckedCreateWithoutAnalyzesInput>
    connectOrCreate?: UserCreateOrConnectWithoutAnalyzesInput
    upsert?: UserUpsertWithoutAnalyzesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAnalyzesInput, UserUpdateWithoutAnalyzesInput>, UserUncheckedUpdateWithoutAnalyzesInput>
  }

  export type AnnotationUpdateManyWithoutAnalyzeNestedInput = {
    create?: XOR<AnnotationCreateWithoutAnalyzeInput, AnnotationUncheckedCreateWithoutAnalyzeInput> | AnnotationCreateWithoutAnalyzeInput[] | AnnotationUncheckedCreateWithoutAnalyzeInput[]
    connectOrCreate?: AnnotationCreateOrConnectWithoutAnalyzeInput | AnnotationCreateOrConnectWithoutAnalyzeInput[]
    upsert?: AnnotationUpsertWithWhereUniqueWithoutAnalyzeInput | AnnotationUpsertWithWhereUniqueWithoutAnalyzeInput[]
    createMany?: AnnotationCreateManyAnalyzeInputEnvelope
    set?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    disconnect?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    delete?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    connect?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    update?: AnnotationUpdateWithWhereUniqueWithoutAnalyzeInput | AnnotationUpdateWithWhereUniqueWithoutAnalyzeInput[]
    updateMany?: AnnotationUpdateManyWithWhereWithoutAnalyzeInput | AnnotationUpdateManyWithWhereWithoutAnalyzeInput[]
    deleteMany?: AnnotationScalarWhereInput | AnnotationScalarWhereInput[]
  }

  export type ApplicationUncheckedUpdateOneWithoutAnalyzeNestedInput = {
    create?: XOR<ApplicationCreateWithoutAnalyzeInput, ApplicationUncheckedCreateWithoutAnalyzeInput>
    connectOrCreate?: ApplicationCreateOrConnectWithoutAnalyzeInput
    upsert?: ApplicationUpsertWithoutAnalyzeInput
    disconnect?: ApplicationWhereInput | boolean
    delete?: ApplicationWhereInput | boolean
    connect?: ApplicationWhereUniqueInput
    update?: XOR<XOR<ApplicationUpdateToOneWithWhereWithoutAnalyzeInput, ApplicationUpdateWithoutAnalyzeInput>, ApplicationUncheckedUpdateWithoutAnalyzeInput>
  }

  export type AnnotationUncheckedUpdateManyWithoutAnalyzeNestedInput = {
    create?: XOR<AnnotationCreateWithoutAnalyzeInput, AnnotationUncheckedCreateWithoutAnalyzeInput> | AnnotationCreateWithoutAnalyzeInput[] | AnnotationUncheckedCreateWithoutAnalyzeInput[]
    connectOrCreate?: AnnotationCreateOrConnectWithoutAnalyzeInput | AnnotationCreateOrConnectWithoutAnalyzeInput[]
    upsert?: AnnotationUpsertWithWhereUniqueWithoutAnalyzeInput | AnnotationUpsertWithWhereUniqueWithoutAnalyzeInput[]
    createMany?: AnnotationCreateManyAnalyzeInputEnvelope
    set?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    disconnect?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    delete?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    connect?: AnnotationWhereUniqueInput | AnnotationWhereUniqueInput[]
    update?: AnnotationUpdateWithWhereUniqueWithoutAnalyzeInput | AnnotationUpdateWithWhereUniqueWithoutAnalyzeInput[]
    updateMany?: AnnotationUpdateManyWithWhereWithoutAnalyzeInput | AnnotationUpdateManyWithWhereWithoutAnalyzeInput[]
    deleteMany?: AnnotationScalarWhereInput | AnnotationScalarWhereInput[]
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ApplicationCreateWithoutUserInput = {
    id: string
    name: string
    language: string
    lib: string
    description?: string | null
    prefix: string
    prefix2?: string | null
    createdAt?: Date | string
    carefulAnalysis?: boolean
    votes?: VotesCreateNestedManyWithoutApplicationInput
    analyze?: AnalyzeCreateNestedOneWithoutApplicationInput
  }

  export type ApplicationUncheckedCreateWithoutUserInput = {
    id: string
    name: string
    language: string
    lib: string
    description?: string | null
    prefix: string
    prefix2?: string | null
    createdAt?: Date | string
    analyzeId?: number | null
    carefulAnalysis?: boolean
    votes?: VotesUncheckedCreateNestedManyWithoutApplicationInput
  }

  export type ApplicationCreateOrConnectWithoutUserInput = {
    where: ApplicationWhereUniqueInput
    create: XOR<ApplicationCreateWithoutUserInput, ApplicationUncheckedCreateWithoutUserInput>
  }

  export type ApplicationCreateManyUserInputEnvelope = {
    data: ApplicationCreateManyUserInput | ApplicationCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type CooldownCreateWithoutUserInput = {
    name: string
    createdAt?: Date | string
    endIn: Date | string
  }

  export type CooldownUncheckedCreateWithoutUserInput = {
    id?: number
    name: string
    createdAt?: Date | string
    endIn: Date | string
  }

  export type CooldownCreateOrConnectWithoutUserInput = {
    where: CooldownWhereUniqueInput
    create: XOR<CooldownCreateWithoutUserInput, CooldownUncheckedCreateWithoutUserInput>
  }

  export type CooldownCreateManyUserInputEnvelope = {
    data: CooldownCreateManyUserInput | CooldownCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AnalyzeCreateWithoutUserInput = {
    applicationId?: string | null
    avaliation?: string | null
    approved?: boolean | null
    createdAt?: Date | string
    finishedIn?: Date | string | null
    application?: ApplicationCreateNestedOneWithoutAnalyzeInput
    annotations?: AnnotationCreateNestedManyWithoutAnalyzeInput
  }

  export type AnalyzeUncheckedCreateWithoutUserInput = {
    id?: number
    applicationId?: string | null
    avaliation?: string | null
    approved?: boolean | null
    createdAt?: Date | string
    finishedIn?: Date | string | null
    application?: ApplicationUncheckedCreateNestedOneWithoutAnalyzeInput
    annotations?: AnnotationUncheckedCreateNestedManyWithoutAnalyzeInput
  }

  export type AnalyzeCreateOrConnectWithoutUserInput = {
    where: AnalyzeWhereUniqueInput
    create: XOR<AnalyzeCreateWithoutUserInput, AnalyzeUncheckedCreateWithoutUserInput>
  }

  export type AnalyzeCreateManyUserInputEnvelope = {
    data: AnalyzeCreateManyUserInput | AnalyzeCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type VotesCreateWithoutUserInput = {
    createdAt?: Date | string
    application: ApplicationCreateNestedOneWithoutVotesInput
  }

  export type VotesUncheckedCreateWithoutUserInput = {
    id?: number
    applicationId: string
    createdAt?: Date | string
  }

  export type VotesCreateOrConnectWithoutUserInput = {
    where: VotesWhereUniqueInput
    create: XOR<VotesCreateWithoutUserInput, VotesUncheckedCreateWithoutUserInput>
  }

  export type VotesCreateManyUserInputEnvelope = {
    data: VotesCreateManyUserInput | VotesCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ApplicationUpsertWithWhereUniqueWithoutUserInput = {
    where: ApplicationWhereUniqueInput
    update: XOR<ApplicationUpdateWithoutUserInput, ApplicationUncheckedUpdateWithoutUserInput>
    create: XOR<ApplicationCreateWithoutUserInput, ApplicationUncheckedCreateWithoutUserInput>
  }

  export type ApplicationUpdateWithWhereUniqueWithoutUserInput = {
    where: ApplicationWhereUniqueInput
    data: XOR<ApplicationUpdateWithoutUserInput, ApplicationUncheckedUpdateWithoutUserInput>
  }

  export type ApplicationUpdateManyWithWhereWithoutUserInput = {
    where: ApplicationScalarWhereInput
    data: XOR<ApplicationUpdateManyMutationInput, ApplicationUncheckedUpdateManyWithoutUserInput>
  }

  export type ApplicationScalarWhereInput = {
    AND?: ApplicationScalarWhereInput | ApplicationScalarWhereInput[]
    OR?: ApplicationScalarWhereInput[]
    NOT?: ApplicationScalarWhereInput | ApplicationScalarWhereInput[]
    id?: StringFilter<"Application"> | string
    userId?: StringFilter<"Application"> | string
    name?: StringFilter<"Application"> | string
    language?: StringFilter<"Application"> | string
    lib?: StringFilter<"Application"> | string
    description?: StringNullableFilter<"Application"> | string | null
    prefix?: StringFilter<"Application"> | string
    prefix2?: StringNullableFilter<"Application"> | string | null
    createdAt?: DateTimeFilter<"Application"> | Date | string
    analyzeId?: IntNullableFilter<"Application"> | number | null
    carefulAnalysis?: BoolFilter<"Application"> | boolean
  }

  export type CooldownUpsertWithWhereUniqueWithoutUserInput = {
    where: CooldownWhereUniqueInput
    update: XOR<CooldownUpdateWithoutUserInput, CooldownUncheckedUpdateWithoutUserInput>
    create: XOR<CooldownCreateWithoutUserInput, CooldownUncheckedCreateWithoutUserInput>
  }

  export type CooldownUpdateWithWhereUniqueWithoutUserInput = {
    where: CooldownWhereUniqueInput
    data: XOR<CooldownUpdateWithoutUserInput, CooldownUncheckedUpdateWithoutUserInput>
  }

  export type CooldownUpdateManyWithWhereWithoutUserInput = {
    where: CooldownScalarWhereInput
    data: XOR<CooldownUpdateManyMutationInput, CooldownUncheckedUpdateManyWithoutUserInput>
  }

  export type CooldownScalarWhereInput = {
    AND?: CooldownScalarWhereInput | CooldownScalarWhereInput[]
    OR?: CooldownScalarWhereInput[]
    NOT?: CooldownScalarWhereInput | CooldownScalarWhereInput[]
    id?: IntFilter<"Cooldown"> | number
    userId?: StringFilter<"Cooldown"> | string
    name?: StringFilter<"Cooldown"> | string
    createdAt?: DateTimeFilter<"Cooldown"> | Date | string
    endIn?: DateTimeFilter<"Cooldown"> | Date | string
  }

  export type AnalyzeUpsertWithWhereUniqueWithoutUserInput = {
    where: AnalyzeWhereUniqueInput
    update: XOR<AnalyzeUpdateWithoutUserInput, AnalyzeUncheckedUpdateWithoutUserInput>
    create: XOR<AnalyzeCreateWithoutUserInput, AnalyzeUncheckedCreateWithoutUserInput>
  }

  export type AnalyzeUpdateWithWhereUniqueWithoutUserInput = {
    where: AnalyzeWhereUniqueInput
    data: XOR<AnalyzeUpdateWithoutUserInput, AnalyzeUncheckedUpdateWithoutUserInput>
  }

  export type AnalyzeUpdateManyWithWhereWithoutUserInput = {
    where: AnalyzeScalarWhereInput
    data: XOR<AnalyzeUpdateManyMutationInput, AnalyzeUncheckedUpdateManyWithoutUserInput>
  }

  export type AnalyzeScalarWhereInput = {
    AND?: AnalyzeScalarWhereInput | AnalyzeScalarWhereInput[]
    OR?: AnalyzeScalarWhereInput[]
    NOT?: AnalyzeScalarWhereInput | AnalyzeScalarWhereInput[]
    id?: IntFilter<"Analyze"> | number
    applicationId?: StringNullableFilter<"Analyze"> | string | null
    userId?: StringNullableFilter<"Analyze"> | string | null
    avaliation?: StringNullableFilter<"Analyze"> | string | null
    approved?: BoolNullableFilter<"Analyze"> | boolean | null
    createdAt?: DateTimeFilter<"Analyze"> | Date | string
    finishedIn?: DateTimeNullableFilter<"Analyze"> | Date | string | null
  }

  export type VotesUpsertWithWhereUniqueWithoutUserInput = {
    where: VotesWhereUniqueInput
    update: XOR<VotesUpdateWithoutUserInput, VotesUncheckedUpdateWithoutUserInput>
    create: XOR<VotesCreateWithoutUserInput, VotesUncheckedCreateWithoutUserInput>
  }

  export type VotesUpdateWithWhereUniqueWithoutUserInput = {
    where: VotesWhereUniqueInput
    data: XOR<VotesUpdateWithoutUserInput, VotesUncheckedUpdateWithoutUserInput>
  }

  export type VotesUpdateManyWithWhereWithoutUserInput = {
    where: VotesScalarWhereInput
    data: XOR<VotesUpdateManyMutationInput, VotesUncheckedUpdateManyWithoutUserInput>
  }

  export type VotesScalarWhereInput = {
    AND?: VotesScalarWhereInput | VotesScalarWhereInput[]
    OR?: VotesScalarWhereInput[]
    NOT?: VotesScalarWhereInput | VotesScalarWhereInput[]
    id?: IntFilter<"Votes"> | number
    userId?: StringFilter<"Votes"> | string
    applicationId?: StringFilter<"Votes"> | string
    createdAt?: DateTimeFilter<"Votes"> | Date | string
  }

  export type UserCreateWithoutVotesInput = {
    id: string
    blacklist?: boolean
    defaultVote?: string | null
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: Date | string
    analisingId?: number | null
    coins?: number
    applications?: ApplicationCreateNestedManyWithoutUserInput
    cooldowns?: CooldownCreateNestedManyWithoutUserInput
    analyzes?: AnalyzeCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutVotesInput = {
    id: string
    blacklist?: boolean
    defaultVote?: string | null
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: Date | string
    analisingId?: number | null
    coins?: number
    applications?: ApplicationUncheckedCreateNestedManyWithoutUserInput
    cooldowns?: CooldownUncheckedCreateNestedManyWithoutUserInput
    analyzes?: AnalyzeUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutVotesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutVotesInput, UserUncheckedCreateWithoutVotesInput>
  }

  export type ApplicationCreateWithoutVotesInput = {
    id: string
    name: string
    language: string
    lib: string
    description?: string | null
    prefix: string
    prefix2?: string | null
    createdAt?: Date | string
    carefulAnalysis?: boolean
    user: UserCreateNestedOneWithoutApplicationsInput
    analyze?: AnalyzeCreateNestedOneWithoutApplicationInput
  }

  export type ApplicationUncheckedCreateWithoutVotesInput = {
    id: string
    userId: string
    name: string
    language: string
    lib: string
    description?: string | null
    prefix: string
    prefix2?: string | null
    createdAt?: Date | string
    analyzeId?: number | null
    carefulAnalysis?: boolean
  }

  export type ApplicationCreateOrConnectWithoutVotesInput = {
    where: ApplicationWhereUniqueInput
    create: XOR<ApplicationCreateWithoutVotesInput, ApplicationUncheckedCreateWithoutVotesInput>
  }

  export type UserUpsertWithoutVotesInput = {
    update: XOR<UserUpdateWithoutVotesInput, UserUncheckedUpdateWithoutVotesInput>
    create: XOR<UserCreateWithoutVotesInput, UserUncheckedCreateWithoutVotesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutVotesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutVotesInput, UserUncheckedUpdateWithoutVotesInput>
  }

  export type UserUpdateWithoutVotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    blacklist?: BoolFieldUpdateOperationsInput | boolean
    defaultVote?: NullableStringFieldUpdateOperationsInput | string | null
    isAvaliator?: BoolFieldUpdateOperationsInput | boolean
    isSuperAvaliator?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analisingId?: NullableIntFieldUpdateOperationsInput | number | null
    coins?: IntFieldUpdateOperationsInput | number
    applications?: ApplicationUpdateManyWithoutUserNestedInput
    cooldowns?: CooldownUpdateManyWithoutUserNestedInput
    analyzes?: AnalyzeUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutVotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    blacklist?: BoolFieldUpdateOperationsInput | boolean
    defaultVote?: NullableStringFieldUpdateOperationsInput | string | null
    isAvaliator?: BoolFieldUpdateOperationsInput | boolean
    isSuperAvaliator?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analisingId?: NullableIntFieldUpdateOperationsInput | number | null
    coins?: IntFieldUpdateOperationsInput | number
    applications?: ApplicationUncheckedUpdateManyWithoutUserNestedInput
    cooldowns?: CooldownUncheckedUpdateManyWithoutUserNestedInput
    analyzes?: AnalyzeUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ApplicationUpsertWithoutVotesInput = {
    update: XOR<ApplicationUpdateWithoutVotesInput, ApplicationUncheckedUpdateWithoutVotesInput>
    create: XOR<ApplicationCreateWithoutVotesInput, ApplicationUncheckedCreateWithoutVotesInput>
    where?: ApplicationWhereInput
  }

  export type ApplicationUpdateToOneWithWhereWithoutVotesInput = {
    where?: ApplicationWhereInput
    data: XOR<ApplicationUpdateWithoutVotesInput, ApplicationUncheckedUpdateWithoutVotesInput>
  }

  export type ApplicationUpdateWithoutVotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lib?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    prefix?: StringFieldUpdateOperationsInput | string
    prefix2?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    carefulAnalysis?: BoolFieldUpdateOperationsInput | boolean
    user?: UserUpdateOneRequiredWithoutApplicationsNestedInput
    analyze?: AnalyzeUpdateOneWithoutApplicationNestedInput
  }

  export type ApplicationUncheckedUpdateWithoutVotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lib?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    prefix?: StringFieldUpdateOperationsInput | string
    prefix2?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analyzeId?: NullableIntFieldUpdateOperationsInput | number | null
    carefulAnalysis?: BoolFieldUpdateOperationsInput | boolean
  }

  export type UserCreateWithoutApplicationsInput = {
    id: string
    blacklist?: boolean
    defaultVote?: string | null
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: Date | string
    analisingId?: number | null
    coins?: number
    cooldowns?: CooldownCreateNestedManyWithoutUserInput
    analyzes?: AnalyzeCreateNestedManyWithoutUserInput
    votes?: VotesCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutApplicationsInput = {
    id: string
    blacklist?: boolean
    defaultVote?: string | null
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: Date | string
    analisingId?: number | null
    coins?: number
    cooldowns?: CooldownUncheckedCreateNestedManyWithoutUserInput
    analyzes?: AnalyzeUncheckedCreateNestedManyWithoutUserInput
    votes?: VotesUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutApplicationsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutApplicationsInput, UserUncheckedCreateWithoutApplicationsInput>
  }

  export type VotesCreateWithoutApplicationInput = {
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutVotesInput
  }

  export type VotesUncheckedCreateWithoutApplicationInput = {
    id?: number
    userId: string
    createdAt?: Date | string
  }

  export type VotesCreateOrConnectWithoutApplicationInput = {
    where: VotesWhereUniqueInput
    create: XOR<VotesCreateWithoutApplicationInput, VotesUncheckedCreateWithoutApplicationInput>
  }

  export type VotesCreateManyApplicationInputEnvelope = {
    data: VotesCreateManyApplicationInput | VotesCreateManyApplicationInput[]
    skipDuplicates?: boolean
  }

  export type AnalyzeCreateWithoutApplicationInput = {
    applicationId?: string | null
    avaliation?: string | null
    approved?: boolean | null
    createdAt?: Date | string
    finishedIn?: Date | string | null
    user?: UserCreateNestedOneWithoutAnalyzesInput
    annotations?: AnnotationCreateNestedManyWithoutAnalyzeInput
  }

  export type AnalyzeUncheckedCreateWithoutApplicationInput = {
    id?: number
    applicationId?: string | null
    userId?: string | null
    avaliation?: string | null
    approved?: boolean | null
    createdAt?: Date | string
    finishedIn?: Date | string | null
    annotations?: AnnotationUncheckedCreateNestedManyWithoutAnalyzeInput
  }

  export type AnalyzeCreateOrConnectWithoutApplicationInput = {
    where: AnalyzeWhereUniqueInput
    create: XOR<AnalyzeCreateWithoutApplicationInput, AnalyzeUncheckedCreateWithoutApplicationInput>
  }

  export type UserUpsertWithoutApplicationsInput = {
    update: XOR<UserUpdateWithoutApplicationsInput, UserUncheckedUpdateWithoutApplicationsInput>
    create: XOR<UserCreateWithoutApplicationsInput, UserUncheckedCreateWithoutApplicationsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutApplicationsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutApplicationsInput, UserUncheckedUpdateWithoutApplicationsInput>
  }

  export type UserUpdateWithoutApplicationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    blacklist?: BoolFieldUpdateOperationsInput | boolean
    defaultVote?: NullableStringFieldUpdateOperationsInput | string | null
    isAvaliator?: BoolFieldUpdateOperationsInput | boolean
    isSuperAvaliator?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analisingId?: NullableIntFieldUpdateOperationsInput | number | null
    coins?: IntFieldUpdateOperationsInput | number
    cooldowns?: CooldownUpdateManyWithoutUserNestedInput
    analyzes?: AnalyzeUpdateManyWithoutUserNestedInput
    votes?: VotesUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutApplicationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    blacklist?: BoolFieldUpdateOperationsInput | boolean
    defaultVote?: NullableStringFieldUpdateOperationsInput | string | null
    isAvaliator?: BoolFieldUpdateOperationsInput | boolean
    isSuperAvaliator?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analisingId?: NullableIntFieldUpdateOperationsInput | number | null
    coins?: IntFieldUpdateOperationsInput | number
    cooldowns?: CooldownUncheckedUpdateManyWithoutUserNestedInput
    analyzes?: AnalyzeUncheckedUpdateManyWithoutUserNestedInput
    votes?: VotesUncheckedUpdateManyWithoutUserNestedInput
  }

  export type VotesUpsertWithWhereUniqueWithoutApplicationInput = {
    where: VotesWhereUniqueInput
    update: XOR<VotesUpdateWithoutApplicationInput, VotesUncheckedUpdateWithoutApplicationInput>
    create: XOR<VotesCreateWithoutApplicationInput, VotesUncheckedCreateWithoutApplicationInput>
  }

  export type VotesUpdateWithWhereUniqueWithoutApplicationInput = {
    where: VotesWhereUniqueInput
    data: XOR<VotesUpdateWithoutApplicationInput, VotesUncheckedUpdateWithoutApplicationInput>
  }

  export type VotesUpdateManyWithWhereWithoutApplicationInput = {
    where: VotesScalarWhereInput
    data: XOR<VotesUpdateManyMutationInput, VotesUncheckedUpdateManyWithoutApplicationInput>
  }

  export type AnalyzeUpsertWithoutApplicationInput = {
    update: XOR<AnalyzeUpdateWithoutApplicationInput, AnalyzeUncheckedUpdateWithoutApplicationInput>
    create: XOR<AnalyzeCreateWithoutApplicationInput, AnalyzeUncheckedCreateWithoutApplicationInput>
    where?: AnalyzeWhereInput
  }

  export type AnalyzeUpdateToOneWithWhereWithoutApplicationInput = {
    where?: AnalyzeWhereInput
    data: XOR<AnalyzeUpdateWithoutApplicationInput, AnalyzeUncheckedUpdateWithoutApplicationInput>
  }

  export type AnalyzeUpdateWithoutApplicationInput = {
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    avaliation?: NullableStringFieldUpdateOperationsInput | string | null
    approved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneWithoutAnalyzesNestedInput
    annotations?: AnnotationUpdateManyWithoutAnalyzeNestedInput
  }

  export type AnalyzeUncheckedUpdateWithoutApplicationInput = {
    id?: IntFieldUpdateOperationsInput | number
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    avaliation?: NullableStringFieldUpdateOperationsInput | string | null
    approved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    annotations?: AnnotationUncheckedUpdateManyWithoutAnalyzeNestedInput
  }

  export type UserCreateWithoutCooldownsInput = {
    id: string
    blacklist?: boolean
    defaultVote?: string | null
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: Date | string
    analisingId?: number | null
    coins?: number
    applications?: ApplicationCreateNestedManyWithoutUserInput
    analyzes?: AnalyzeCreateNestedManyWithoutUserInput
    votes?: VotesCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCooldownsInput = {
    id: string
    blacklist?: boolean
    defaultVote?: string | null
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: Date | string
    analisingId?: number | null
    coins?: number
    applications?: ApplicationUncheckedCreateNestedManyWithoutUserInput
    analyzes?: AnalyzeUncheckedCreateNestedManyWithoutUserInput
    votes?: VotesUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCooldownsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCooldownsInput, UserUncheckedCreateWithoutCooldownsInput>
  }

  export type UserUpsertWithoutCooldownsInput = {
    update: XOR<UserUpdateWithoutCooldownsInput, UserUncheckedUpdateWithoutCooldownsInput>
    create: XOR<UserCreateWithoutCooldownsInput, UserUncheckedCreateWithoutCooldownsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCooldownsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCooldownsInput, UserUncheckedUpdateWithoutCooldownsInput>
  }

  export type UserUpdateWithoutCooldownsInput = {
    id?: StringFieldUpdateOperationsInput | string
    blacklist?: BoolFieldUpdateOperationsInput | boolean
    defaultVote?: NullableStringFieldUpdateOperationsInput | string | null
    isAvaliator?: BoolFieldUpdateOperationsInput | boolean
    isSuperAvaliator?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analisingId?: NullableIntFieldUpdateOperationsInput | number | null
    coins?: IntFieldUpdateOperationsInput | number
    applications?: ApplicationUpdateManyWithoutUserNestedInput
    analyzes?: AnalyzeUpdateManyWithoutUserNestedInput
    votes?: VotesUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCooldownsInput = {
    id?: StringFieldUpdateOperationsInput | string
    blacklist?: BoolFieldUpdateOperationsInput | boolean
    defaultVote?: NullableStringFieldUpdateOperationsInput | string | null
    isAvaliator?: BoolFieldUpdateOperationsInput | boolean
    isSuperAvaliator?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analisingId?: NullableIntFieldUpdateOperationsInput | number | null
    coins?: IntFieldUpdateOperationsInput | number
    applications?: ApplicationUncheckedUpdateManyWithoutUserNestedInput
    analyzes?: AnalyzeUncheckedUpdateManyWithoutUserNestedInput
    votes?: VotesUncheckedUpdateManyWithoutUserNestedInput
  }

  export type AnalyzeCreateWithoutAnnotationsInput = {
    applicationId?: string | null
    avaliation?: string | null
    approved?: boolean | null
    createdAt?: Date | string
    finishedIn?: Date | string | null
    application?: ApplicationCreateNestedOneWithoutAnalyzeInput
    user?: UserCreateNestedOneWithoutAnalyzesInput
  }

  export type AnalyzeUncheckedCreateWithoutAnnotationsInput = {
    id?: number
    applicationId?: string | null
    userId?: string | null
    avaliation?: string | null
    approved?: boolean | null
    createdAt?: Date | string
    finishedIn?: Date | string | null
    application?: ApplicationUncheckedCreateNestedOneWithoutAnalyzeInput
  }

  export type AnalyzeCreateOrConnectWithoutAnnotationsInput = {
    where: AnalyzeWhereUniqueInput
    create: XOR<AnalyzeCreateWithoutAnnotationsInput, AnalyzeUncheckedCreateWithoutAnnotationsInput>
  }

  export type AnalyzeUpsertWithoutAnnotationsInput = {
    update: XOR<AnalyzeUpdateWithoutAnnotationsInput, AnalyzeUncheckedUpdateWithoutAnnotationsInput>
    create: XOR<AnalyzeCreateWithoutAnnotationsInput, AnalyzeUncheckedCreateWithoutAnnotationsInput>
    where?: AnalyzeWhereInput
  }

  export type AnalyzeUpdateToOneWithWhereWithoutAnnotationsInput = {
    where?: AnalyzeWhereInput
    data: XOR<AnalyzeUpdateWithoutAnnotationsInput, AnalyzeUncheckedUpdateWithoutAnnotationsInput>
  }

  export type AnalyzeUpdateWithoutAnnotationsInput = {
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    avaliation?: NullableStringFieldUpdateOperationsInput | string | null
    approved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    application?: ApplicationUpdateOneWithoutAnalyzeNestedInput
    user?: UserUpdateOneWithoutAnalyzesNestedInput
  }

  export type AnalyzeUncheckedUpdateWithoutAnnotationsInput = {
    id?: IntFieldUpdateOperationsInput | number
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    avaliation?: NullableStringFieldUpdateOperationsInput | string | null
    approved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    application?: ApplicationUncheckedUpdateOneWithoutAnalyzeNestedInput
  }

  export type ApplicationCreateWithoutAnalyzeInput = {
    id: string
    name: string
    language: string
    lib: string
    description?: string | null
    prefix: string
    prefix2?: string | null
    createdAt?: Date | string
    carefulAnalysis?: boolean
    user: UserCreateNestedOneWithoutApplicationsInput
    votes?: VotesCreateNestedManyWithoutApplicationInput
  }

  export type ApplicationUncheckedCreateWithoutAnalyzeInput = {
    id: string
    userId: string
    name: string
    language: string
    lib: string
    description?: string | null
    prefix: string
    prefix2?: string | null
    createdAt?: Date | string
    carefulAnalysis?: boolean
    votes?: VotesUncheckedCreateNestedManyWithoutApplicationInput
  }

  export type ApplicationCreateOrConnectWithoutAnalyzeInput = {
    where: ApplicationWhereUniqueInput
    create: XOR<ApplicationCreateWithoutAnalyzeInput, ApplicationUncheckedCreateWithoutAnalyzeInput>
  }

  export type UserCreateWithoutAnalyzesInput = {
    id: string
    blacklist?: boolean
    defaultVote?: string | null
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: Date | string
    analisingId?: number | null
    coins?: number
    applications?: ApplicationCreateNestedManyWithoutUserInput
    cooldowns?: CooldownCreateNestedManyWithoutUserInput
    votes?: VotesCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAnalyzesInput = {
    id: string
    blacklist?: boolean
    defaultVote?: string | null
    isAvaliator?: boolean
    isSuperAvaliator?: boolean
    createdAt?: Date | string
    analisingId?: number | null
    coins?: number
    applications?: ApplicationUncheckedCreateNestedManyWithoutUserInput
    cooldowns?: CooldownUncheckedCreateNestedManyWithoutUserInput
    votes?: VotesUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAnalyzesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAnalyzesInput, UserUncheckedCreateWithoutAnalyzesInput>
  }

  export type AnnotationCreateWithoutAnalyzeInput = {
    type: string
    text: string
    createdAt?: Date | string
  }

  export type AnnotationUncheckedCreateWithoutAnalyzeInput = {
    id?: number
    type: string
    text: string
    createdAt?: Date | string
  }

  export type AnnotationCreateOrConnectWithoutAnalyzeInput = {
    where: AnnotationWhereUniqueInput
    create: XOR<AnnotationCreateWithoutAnalyzeInput, AnnotationUncheckedCreateWithoutAnalyzeInput>
  }

  export type AnnotationCreateManyAnalyzeInputEnvelope = {
    data: AnnotationCreateManyAnalyzeInput | AnnotationCreateManyAnalyzeInput[]
    skipDuplicates?: boolean
  }

  export type ApplicationUpsertWithoutAnalyzeInput = {
    update: XOR<ApplicationUpdateWithoutAnalyzeInput, ApplicationUncheckedUpdateWithoutAnalyzeInput>
    create: XOR<ApplicationCreateWithoutAnalyzeInput, ApplicationUncheckedCreateWithoutAnalyzeInput>
    where?: ApplicationWhereInput
  }

  export type ApplicationUpdateToOneWithWhereWithoutAnalyzeInput = {
    where?: ApplicationWhereInput
    data: XOR<ApplicationUpdateWithoutAnalyzeInput, ApplicationUncheckedUpdateWithoutAnalyzeInput>
  }

  export type ApplicationUpdateWithoutAnalyzeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lib?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    prefix?: StringFieldUpdateOperationsInput | string
    prefix2?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    carefulAnalysis?: BoolFieldUpdateOperationsInput | boolean
    user?: UserUpdateOneRequiredWithoutApplicationsNestedInput
    votes?: VotesUpdateManyWithoutApplicationNestedInput
  }

  export type ApplicationUncheckedUpdateWithoutAnalyzeInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lib?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    prefix?: StringFieldUpdateOperationsInput | string
    prefix2?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    carefulAnalysis?: BoolFieldUpdateOperationsInput | boolean
    votes?: VotesUncheckedUpdateManyWithoutApplicationNestedInput
  }

  export type UserUpsertWithoutAnalyzesInput = {
    update: XOR<UserUpdateWithoutAnalyzesInput, UserUncheckedUpdateWithoutAnalyzesInput>
    create: XOR<UserCreateWithoutAnalyzesInput, UserUncheckedCreateWithoutAnalyzesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAnalyzesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAnalyzesInput, UserUncheckedUpdateWithoutAnalyzesInput>
  }

  export type UserUpdateWithoutAnalyzesInput = {
    id?: StringFieldUpdateOperationsInput | string
    blacklist?: BoolFieldUpdateOperationsInput | boolean
    defaultVote?: NullableStringFieldUpdateOperationsInput | string | null
    isAvaliator?: BoolFieldUpdateOperationsInput | boolean
    isSuperAvaliator?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analisingId?: NullableIntFieldUpdateOperationsInput | number | null
    coins?: IntFieldUpdateOperationsInput | number
    applications?: ApplicationUpdateManyWithoutUserNestedInput
    cooldowns?: CooldownUpdateManyWithoutUserNestedInput
    votes?: VotesUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAnalyzesInput = {
    id?: StringFieldUpdateOperationsInput | string
    blacklist?: BoolFieldUpdateOperationsInput | boolean
    defaultVote?: NullableStringFieldUpdateOperationsInput | string | null
    isAvaliator?: BoolFieldUpdateOperationsInput | boolean
    isSuperAvaliator?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analisingId?: NullableIntFieldUpdateOperationsInput | number | null
    coins?: IntFieldUpdateOperationsInput | number
    applications?: ApplicationUncheckedUpdateManyWithoutUserNestedInput
    cooldowns?: CooldownUncheckedUpdateManyWithoutUserNestedInput
    votes?: VotesUncheckedUpdateManyWithoutUserNestedInput
  }

  export type AnnotationUpsertWithWhereUniqueWithoutAnalyzeInput = {
    where: AnnotationWhereUniqueInput
    update: XOR<AnnotationUpdateWithoutAnalyzeInput, AnnotationUncheckedUpdateWithoutAnalyzeInput>
    create: XOR<AnnotationCreateWithoutAnalyzeInput, AnnotationUncheckedCreateWithoutAnalyzeInput>
  }

  export type AnnotationUpdateWithWhereUniqueWithoutAnalyzeInput = {
    where: AnnotationWhereUniqueInput
    data: XOR<AnnotationUpdateWithoutAnalyzeInput, AnnotationUncheckedUpdateWithoutAnalyzeInput>
  }

  export type AnnotationUpdateManyWithWhereWithoutAnalyzeInput = {
    where: AnnotationScalarWhereInput
    data: XOR<AnnotationUpdateManyMutationInput, AnnotationUncheckedUpdateManyWithoutAnalyzeInput>
  }

  export type AnnotationScalarWhereInput = {
    AND?: AnnotationScalarWhereInput | AnnotationScalarWhereInput[]
    OR?: AnnotationScalarWhereInput[]
    NOT?: AnnotationScalarWhereInput | AnnotationScalarWhereInput[]
    id?: IntFilter<"Annotation"> | number
    analyzeId?: IntFilter<"Annotation"> | number
    type?: StringFilter<"Annotation"> | string
    text?: StringFilter<"Annotation"> | string
    createdAt?: DateTimeFilter<"Annotation"> | Date | string
  }

  export type ApplicationCreateManyUserInput = {
    id: string
    name: string
    language: string
    lib: string
    description?: string | null
    prefix: string
    prefix2?: string | null
    createdAt?: Date | string
    analyzeId?: number | null
    carefulAnalysis?: boolean
  }

  export type CooldownCreateManyUserInput = {
    id?: number
    name: string
    createdAt?: Date | string
    endIn: Date | string
  }

  export type AnalyzeCreateManyUserInput = {
    id?: number
    applicationId?: string | null
    avaliation?: string | null
    approved?: boolean | null
    createdAt?: Date | string
    finishedIn?: Date | string | null
  }

  export type VotesCreateManyUserInput = {
    id?: number
    applicationId: string
    createdAt?: Date | string
  }

  export type ApplicationUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lib?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    prefix?: StringFieldUpdateOperationsInput | string
    prefix2?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    carefulAnalysis?: BoolFieldUpdateOperationsInput | boolean
    votes?: VotesUpdateManyWithoutApplicationNestedInput
    analyze?: AnalyzeUpdateOneWithoutApplicationNestedInput
  }

  export type ApplicationUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lib?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    prefix?: StringFieldUpdateOperationsInput | string
    prefix2?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analyzeId?: NullableIntFieldUpdateOperationsInput | number | null
    carefulAnalysis?: BoolFieldUpdateOperationsInput | boolean
    votes?: VotesUncheckedUpdateManyWithoutApplicationNestedInput
  }

  export type ApplicationUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    lib?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    prefix?: StringFieldUpdateOperationsInput | string
    prefix2?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    analyzeId?: NullableIntFieldUpdateOperationsInput | number | null
    carefulAnalysis?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CooldownUpdateWithoutUserInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endIn?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CooldownUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endIn?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CooldownUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endIn?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnalyzeUpdateWithoutUserInput = {
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    avaliation?: NullableStringFieldUpdateOperationsInput | string | null
    approved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    application?: ApplicationUpdateOneWithoutAnalyzeNestedInput
    annotations?: AnnotationUpdateManyWithoutAnalyzeNestedInput
  }

  export type AnalyzeUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    avaliation?: NullableStringFieldUpdateOperationsInput | string | null
    approved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    application?: ApplicationUncheckedUpdateOneWithoutAnalyzeNestedInput
    annotations?: AnnotationUncheckedUpdateManyWithoutAnalyzeNestedInput
  }

  export type AnalyzeUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    avaliation?: NullableStringFieldUpdateOperationsInput | string | null
    approved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    finishedIn?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type VotesUpdateWithoutUserInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    application?: ApplicationUpdateOneRequiredWithoutVotesNestedInput
  }

  export type VotesUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    applicationId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VotesUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    applicationId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VotesCreateManyApplicationInput = {
    id?: number
    userId: string
    createdAt?: Date | string
  }

  export type VotesUpdateWithoutApplicationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutVotesNestedInput
  }

  export type VotesUncheckedUpdateWithoutApplicationInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VotesUncheckedUpdateManyWithoutApplicationInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationCreateManyAnalyzeInput = {
    id?: number
    type: string
    text: string
    createdAt?: Date | string
  }

  export type AnnotationUpdateWithoutAnalyzeInput = {
    type?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationUncheckedUpdateWithoutAnalyzeInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnnotationUncheckedUpdateManyWithoutAnalyzeInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    text?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}