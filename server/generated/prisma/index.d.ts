
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
 * Model UserRoleMapping
 * 
 */
export type UserRoleMapping = $Result.DefaultSelection<Prisma.$UserRoleMappingPayload>
/**
 * Model Profile
 * 
 */
export type Profile = $Result.DefaultSelection<Prisma.$ProfilePayload>
/**
 * Model Fee
 * 
 */
export type Fee = $Result.DefaultSelection<Prisma.$FeePayload>
/**
 * Model Driver
 * 
 */
export type Driver = $Result.DefaultSelection<Prisma.$DriverPayload>
/**
 * Model Record
 * 
 */
export type Record = $Result.DefaultSelection<Prisma.$RecordPayload>
/**
 * Model Violation
 * 
 */
export type Violation = $Result.DefaultSelection<Prisma.$ViolationPayload>
/**
 * Model RecordHistory
 * 
 */
export type RecordHistory = $Result.DefaultSelection<Prisma.$RecordHistoryPayload>
/**
 * Model Vehicle
 * 
 */
export type Vehicle = $Result.DefaultSelection<Prisma.$VehiclePayload>
/**
 * Model VehicleDriverHistory
 * 
 */
export type VehicleDriverHistory = $Result.DefaultSelection<Prisma.$VehicleDriverHistoryPayload>
/**
 * Model TestSchedule
 * 
 */
export type TestSchedule = $Result.DefaultSelection<Prisma.$TestSchedulePayload>
/**
 * Model Test
 * 
 */
export type Test = $Result.DefaultSelection<Prisma.$TestPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const user_role: {
  admin: 'admin',
  air_quality: 'air_quality',
  tree_management: 'tree_management',
  government_emission: 'government_emission'
};

export type user_role = (typeof user_role)[keyof typeof user_role]

}

export type user_role = $Enums.user_role

export const user_role: typeof $Enums.user_role

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
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
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
   * `prisma.userRoleMapping`: Exposes CRUD operations for the **UserRoleMapping** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserRoleMappings
    * const userRoleMappings = await prisma.userRoleMapping.findMany()
    * ```
    */
  get userRoleMapping(): Prisma.UserRoleMappingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.profile`: Exposes CRUD operations for the **Profile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Profiles
    * const profiles = await prisma.profile.findMany()
    * ```
    */
  get profile(): Prisma.ProfileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.fee`: Exposes CRUD operations for the **Fee** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Fees
    * const fees = await prisma.fee.findMany()
    * ```
    */
  get fee(): Prisma.FeeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.driver`: Exposes CRUD operations for the **Driver** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Drivers
    * const drivers = await prisma.driver.findMany()
    * ```
    */
  get driver(): Prisma.DriverDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.record`: Exposes CRUD operations for the **Record** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Records
    * const records = await prisma.record.findMany()
    * ```
    */
  get record(): Prisma.RecordDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.violation`: Exposes CRUD operations for the **Violation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Violations
    * const violations = await prisma.violation.findMany()
    * ```
    */
  get violation(): Prisma.ViolationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.recordHistory`: Exposes CRUD operations for the **RecordHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RecordHistories
    * const recordHistories = await prisma.recordHistory.findMany()
    * ```
    */
  get recordHistory(): Prisma.RecordHistoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.vehicle`: Exposes CRUD operations for the **Vehicle** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Vehicles
    * const vehicles = await prisma.vehicle.findMany()
    * ```
    */
  get vehicle(): Prisma.VehicleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.vehicleDriverHistory`: Exposes CRUD operations for the **VehicleDriverHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VehicleDriverHistories
    * const vehicleDriverHistories = await prisma.vehicleDriverHistory.findMany()
    * ```
    */
  get vehicleDriverHistory(): Prisma.VehicleDriverHistoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.testSchedule`: Exposes CRUD operations for the **TestSchedule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TestSchedules
    * const testSchedules = await prisma.testSchedule.findMany()
    * ```
    */
  get testSchedule(): Prisma.TestScheduleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.test`: Exposes CRUD operations for the **Test** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tests
    * const tests = await prisma.test.findMany()
    * ```
    */
  get test(): Prisma.TestDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.8.2
   * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
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
    UserRoleMapping: 'UserRoleMapping',
    Profile: 'Profile',
    Fee: 'Fee',
    Driver: 'Driver',
    Record: 'Record',
    Violation: 'Violation',
    RecordHistory: 'RecordHistory',
    Vehicle: 'Vehicle',
    VehicleDriverHistory: 'VehicleDriverHistory',
    TestSchedule: 'TestSchedule',
    Test: 'Test'
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
      modelProps: "user" | "userRoleMapping" | "profile" | "fee" | "driver" | "record" | "violation" | "recordHistory" | "vehicle" | "vehicleDriverHistory" | "testSchedule" | "test"
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
      UserRoleMapping: {
        payload: Prisma.$UserRoleMappingPayload<ExtArgs>
        fields: Prisma.UserRoleMappingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserRoleMappingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRoleMappingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserRoleMappingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRoleMappingPayload>
          }
          findFirst: {
            args: Prisma.UserRoleMappingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRoleMappingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserRoleMappingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRoleMappingPayload>
          }
          findMany: {
            args: Prisma.UserRoleMappingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRoleMappingPayload>[]
          }
          create: {
            args: Prisma.UserRoleMappingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRoleMappingPayload>
          }
          createMany: {
            args: Prisma.UserRoleMappingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserRoleMappingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRoleMappingPayload>[]
          }
          delete: {
            args: Prisma.UserRoleMappingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRoleMappingPayload>
          }
          update: {
            args: Prisma.UserRoleMappingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRoleMappingPayload>
          }
          deleteMany: {
            args: Prisma.UserRoleMappingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserRoleMappingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserRoleMappingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRoleMappingPayload>[]
          }
          upsert: {
            args: Prisma.UserRoleMappingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRoleMappingPayload>
          }
          aggregate: {
            args: Prisma.UserRoleMappingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserRoleMapping>
          }
          groupBy: {
            args: Prisma.UserRoleMappingGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserRoleMappingGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserRoleMappingCountArgs<ExtArgs>
            result: $Utils.Optional<UserRoleMappingCountAggregateOutputType> | number
          }
        }
      }
      Profile: {
        payload: Prisma.$ProfilePayload<ExtArgs>
        fields: Prisma.ProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>
          }
          findFirst: {
            args: Prisma.ProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>
          }
          findMany: {
            args: Prisma.ProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>[]
          }
          create: {
            args: Prisma.ProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>
          }
          createMany: {
            args: Prisma.ProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>[]
          }
          delete: {
            args: Prisma.ProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>
          }
          update: {
            args: Prisma.ProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>
          }
          deleteMany: {
            args: Prisma.ProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProfileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>[]
          }
          upsert: {
            args: Prisma.ProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>
          }
          aggregate: {
            args: Prisma.ProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProfile>
          }
          groupBy: {
            args: Prisma.ProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProfileCountArgs<ExtArgs>
            result: $Utils.Optional<ProfileCountAggregateOutputType> | number
          }
        }
      }
      Fee: {
        payload: Prisma.$FeePayload<ExtArgs>
        fields: Prisma.FeeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FeeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FeeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeePayload>
          }
          findFirst: {
            args: Prisma.FeeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FeeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeePayload>
          }
          findMany: {
            args: Prisma.FeeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeePayload>[]
          }
          create: {
            args: Prisma.FeeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeePayload>
          }
          createMany: {
            args: Prisma.FeeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FeeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeePayload>[]
          }
          delete: {
            args: Prisma.FeeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeePayload>
          }
          update: {
            args: Prisma.FeeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeePayload>
          }
          deleteMany: {
            args: Prisma.FeeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FeeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FeeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeePayload>[]
          }
          upsert: {
            args: Prisma.FeeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeePayload>
          }
          aggregate: {
            args: Prisma.FeeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFee>
          }
          groupBy: {
            args: Prisma.FeeGroupByArgs<ExtArgs>
            result: $Utils.Optional<FeeGroupByOutputType>[]
          }
          count: {
            args: Prisma.FeeCountArgs<ExtArgs>
            result: $Utils.Optional<FeeCountAggregateOutputType> | number
          }
        }
      }
      Driver: {
        payload: Prisma.$DriverPayload<ExtArgs>
        fields: Prisma.DriverFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DriverFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DriverFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          findFirst: {
            args: Prisma.DriverFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DriverFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          findMany: {
            args: Prisma.DriverFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>[]
          }
          create: {
            args: Prisma.DriverCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          createMany: {
            args: Prisma.DriverCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DriverCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>[]
          }
          delete: {
            args: Prisma.DriverDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          update: {
            args: Prisma.DriverUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          deleteMany: {
            args: Prisma.DriverDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DriverUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DriverUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>[]
          }
          upsert: {
            args: Prisma.DriverUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          aggregate: {
            args: Prisma.DriverAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDriver>
          }
          groupBy: {
            args: Prisma.DriverGroupByArgs<ExtArgs>
            result: $Utils.Optional<DriverGroupByOutputType>[]
          }
          count: {
            args: Prisma.DriverCountArgs<ExtArgs>
            result: $Utils.Optional<DriverCountAggregateOutputType> | number
          }
        }
      }
      Record: {
        payload: Prisma.$RecordPayload<ExtArgs>
        fields: Prisma.RecordFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RecordFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RecordFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>
          }
          findFirst: {
            args: Prisma.RecordFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RecordFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>
          }
          findMany: {
            args: Prisma.RecordFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>[]
          }
          create: {
            args: Prisma.RecordCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>
          }
          createMany: {
            args: Prisma.RecordCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RecordCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>[]
          }
          delete: {
            args: Prisma.RecordDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>
          }
          update: {
            args: Prisma.RecordUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>
          }
          deleteMany: {
            args: Prisma.RecordDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RecordUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RecordUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>[]
          }
          upsert: {
            args: Prisma.RecordUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>
          }
          aggregate: {
            args: Prisma.RecordAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRecord>
          }
          groupBy: {
            args: Prisma.RecordGroupByArgs<ExtArgs>
            result: $Utils.Optional<RecordGroupByOutputType>[]
          }
          count: {
            args: Prisma.RecordCountArgs<ExtArgs>
            result: $Utils.Optional<RecordCountAggregateOutputType> | number
          }
        }
      }
      Violation: {
        payload: Prisma.$ViolationPayload<ExtArgs>
        fields: Prisma.ViolationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ViolationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ViolationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ViolationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ViolationPayload>
          }
          findFirst: {
            args: Prisma.ViolationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ViolationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ViolationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ViolationPayload>
          }
          findMany: {
            args: Prisma.ViolationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ViolationPayload>[]
          }
          create: {
            args: Prisma.ViolationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ViolationPayload>
          }
          createMany: {
            args: Prisma.ViolationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ViolationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ViolationPayload>[]
          }
          delete: {
            args: Prisma.ViolationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ViolationPayload>
          }
          update: {
            args: Prisma.ViolationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ViolationPayload>
          }
          deleteMany: {
            args: Prisma.ViolationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ViolationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ViolationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ViolationPayload>[]
          }
          upsert: {
            args: Prisma.ViolationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ViolationPayload>
          }
          aggregate: {
            args: Prisma.ViolationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateViolation>
          }
          groupBy: {
            args: Prisma.ViolationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ViolationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ViolationCountArgs<ExtArgs>
            result: $Utils.Optional<ViolationCountAggregateOutputType> | number
          }
        }
      }
      RecordHistory: {
        payload: Prisma.$RecordHistoryPayload<ExtArgs>
        fields: Prisma.RecordHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RecordHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RecordHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordHistoryPayload>
          }
          findFirst: {
            args: Prisma.RecordHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RecordHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordHistoryPayload>
          }
          findMany: {
            args: Prisma.RecordHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordHistoryPayload>[]
          }
          create: {
            args: Prisma.RecordHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordHistoryPayload>
          }
          createMany: {
            args: Prisma.RecordHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RecordHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordHistoryPayload>[]
          }
          delete: {
            args: Prisma.RecordHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordHistoryPayload>
          }
          update: {
            args: Prisma.RecordHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordHistoryPayload>
          }
          deleteMany: {
            args: Prisma.RecordHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RecordHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RecordHistoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordHistoryPayload>[]
          }
          upsert: {
            args: Prisma.RecordHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordHistoryPayload>
          }
          aggregate: {
            args: Prisma.RecordHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRecordHistory>
          }
          groupBy: {
            args: Prisma.RecordHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<RecordHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.RecordHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<RecordHistoryCountAggregateOutputType> | number
          }
        }
      }
      Vehicle: {
        payload: Prisma.$VehiclePayload<ExtArgs>
        fields: Prisma.VehicleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VehicleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VehicleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          findFirst: {
            args: Prisma.VehicleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VehicleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          findMany: {
            args: Prisma.VehicleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>[]
          }
          create: {
            args: Prisma.VehicleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          createMany: {
            args: Prisma.VehicleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VehicleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>[]
          }
          delete: {
            args: Prisma.VehicleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          update: {
            args: Prisma.VehicleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          deleteMany: {
            args: Prisma.VehicleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VehicleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VehicleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>[]
          }
          upsert: {
            args: Prisma.VehicleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehiclePayload>
          }
          aggregate: {
            args: Prisma.VehicleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVehicle>
          }
          groupBy: {
            args: Prisma.VehicleGroupByArgs<ExtArgs>
            result: $Utils.Optional<VehicleGroupByOutputType>[]
          }
          count: {
            args: Prisma.VehicleCountArgs<ExtArgs>
            result: $Utils.Optional<VehicleCountAggregateOutputType> | number
          }
        }
      }
      VehicleDriverHistory: {
        payload: Prisma.$VehicleDriverHistoryPayload<ExtArgs>
        fields: Prisma.VehicleDriverHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VehicleDriverHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehicleDriverHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VehicleDriverHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehicleDriverHistoryPayload>
          }
          findFirst: {
            args: Prisma.VehicleDriverHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehicleDriverHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VehicleDriverHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehicleDriverHistoryPayload>
          }
          findMany: {
            args: Prisma.VehicleDriverHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehicleDriverHistoryPayload>[]
          }
          create: {
            args: Prisma.VehicleDriverHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehicleDriverHistoryPayload>
          }
          createMany: {
            args: Prisma.VehicleDriverHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VehicleDriverHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehicleDriverHistoryPayload>[]
          }
          delete: {
            args: Prisma.VehicleDriverHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehicleDriverHistoryPayload>
          }
          update: {
            args: Prisma.VehicleDriverHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehicleDriverHistoryPayload>
          }
          deleteMany: {
            args: Prisma.VehicleDriverHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VehicleDriverHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VehicleDriverHistoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehicleDriverHistoryPayload>[]
          }
          upsert: {
            args: Prisma.VehicleDriverHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VehicleDriverHistoryPayload>
          }
          aggregate: {
            args: Prisma.VehicleDriverHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVehicleDriverHistory>
          }
          groupBy: {
            args: Prisma.VehicleDriverHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<VehicleDriverHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.VehicleDriverHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<VehicleDriverHistoryCountAggregateOutputType> | number
          }
        }
      }
      TestSchedule: {
        payload: Prisma.$TestSchedulePayload<ExtArgs>
        fields: Prisma.TestScheduleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TestScheduleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSchedulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TestScheduleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSchedulePayload>
          }
          findFirst: {
            args: Prisma.TestScheduleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSchedulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TestScheduleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSchedulePayload>
          }
          findMany: {
            args: Prisma.TestScheduleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSchedulePayload>[]
          }
          create: {
            args: Prisma.TestScheduleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSchedulePayload>
          }
          createMany: {
            args: Prisma.TestScheduleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TestScheduleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSchedulePayload>[]
          }
          delete: {
            args: Prisma.TestScheduleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSchedulePayload>
          }
          update: {
            args: Prisma.TestScheduleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSchedulePayload>
          }
          deleteMany: {
            args: Prisma.TestScheduleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TestScheduleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TestScheduleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSchedulePayload>[]
          }
          upsert: {
            args: Prisma.TestScheduleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestSchedulePayload>
          }
          aggregate: {
            args: Prisma.TestScheduleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTestSchedule>
          }
          groupBy: {
            args: Prisma.TestScheduleGroupByArgs<ExtArgs>
            result: $Utils.Optional<TestScheduleGroupByOutputType>[]
          }
          count: {
            args: Prisma.TestScheduleCountArgs<ExtArgs>
            result: $Utils.Optional<TestScheduleCountAggregateOutputType> | number
          }
        }
      }
      Test: {
        payload: Prisma.$TestPayload<ExtArgs>
        fields: Prisma.TestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestPayload>
          }
          findFirst: {
            args: Prisma.TestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestPayload>
          }
          findMany: {
            args: Prisma.TestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestPayload>[]
          }
          create: {
            args: Prisma.TestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestPayload>
          }
          createMany: {
            args: Prisma.TestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestPayload>[]
          }
          delete: {
            args: Prisma.TestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestPayload>
          }
          update: {
            args: Prisma.TestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestPayload>
          }
          deleteMany: {
            args: Prisma.TestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TestUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestPayload>[]
          }
          upsert: {
            args: Prisma.TestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TestPayload>
          }
          aggregate: {
            args: Prisma.TestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTest>
          }
          groupBy: {
            args: Prisma.TestGroupByArgs<ExtArgs>
            result: $Utils.Optional<TestGroupByOutputType>[]
          }
          count: {
            args: Prisma.TestCountArgs<ExtArgs>
            result: $Utils.Optional<TestCountAggregateOutputType> | number
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
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
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
    userRoleMapping?: UserRoleMappingOmit
    profile?: ProfileOmit
    fee?: FeeOmit
    driver?: DriverOmit
    record?: RecordOmit
    violation?: ViolationOmit
    recordHistory?: RecordHistoryOmit
    vehicle?: VehicleOmit
    vehicleDriverHistory?: VehicleDriverHistoryOmit
    testSchedule?: TestScheduleOmit
    test?: TestOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

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
    UserRoleMapping: number
    tests: number
    driverHistories: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    UserRoleMapping?: boolean | UserCountOutputTypeCountUserRoleMappingArgs
    tests?: boolean | UserCountOutputTypeCountTestsArgs
    driverHistories?: boolean | UserCountOutputTypeCountDriverHistoriesArgs
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
  export type UserCountOutputTypeCountUserRoleMappingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserRoleMappingWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TestWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDriverHistoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VehicleDriverHistoryWhereInput
  }


  /**
   * Count Type DriverCountOutputType
   */

  export type DriverCountOutputType = {
    violations: number
  }

  export type DriverCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    violations?: boolean | DriverCountOutputTypeCountViolationsArgs
  }

  // Custom InputTypes
  /**
   * DriverCountOutputType without action
   */
  export type DriverCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverCountOutputType
     */
    select?: DriverCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DriverCountOutputType without action
   */
  export type DriverCountOutputTypeCountViolationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ViolationWhereInput
  }


  /**
   * Count Type RecordCountOutputType
   */

  export type RecordCountOutputType = {
    recordHistory: number
    violations: number
  }

  export type RecordCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recordHistory?: boolean | RecordCountOutputTypeCountRecordHistoryArgs
    violations?: boolean | RecordCountOutputTypeCountViolationsArgs
  }

  // Custom InputTypes
  /**
   * RecordCountOutputType without action
   */
  export type RecordCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordCountOutputType
     */
    select?: RecordCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RecordCountOutputType without action
   */
  export type RecordCountOutputTypeCountRecordHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecordHistoryWhereInput
  }

  /**
   * RecordCountOutputType without action
   */
  export type RecordCountOutputTypeCountViolationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ViolationWhereInput
  }


  /**
   * Count Type VehicleCountOutputType
   */

  export type VehicleCountOutputType = {
    tests: number
    driverHistory: number
  }

  export type VehicleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tests?: boolean | VehicleCountOutputTypeCountTestsArgs
    driverHistory?: boolean | VehicleCountOutputTypeCountDriverHistoryArgs
  }

  // Custom InputTypes
  /**
   * VehicleCountOutputType without action
   */
  export type VehicleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleCountOutputType
     */
    select?: VehicleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * VehicleCountOutputType without action
   */
  export type VehicleCountOutputTypeCountTestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TestWhereInput
  }

  /**
   * VehicleCountOutputType without action
   */
  export type VehicleCountOutputTypeCountDriverHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VehicleDriverHistoryWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    encryptedPassword: string | null
    isSuperAdmin: boolean | null
    lastSignInAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    encryptedPassword: string | null
    isSuperAdmin: boolean | null
    lastSignInAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    encryptedPassword: number
    isSuperAdmin: number
    lastSignInAt: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    encryptedPassword?: true
    isSuperAdmin?: true
    lastSignInAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    encryptedPassword?: true
    isSuperAdmin?: true
    lastSignInAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    encryptedPassword?: true
    isSuperAdmin?: true
    lastSignInAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
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
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    encryptedPassword: string
    isSuperAdmin: boolean | null
    lastSignInAt: Date | null
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    _count: UserCountAggregateOutputType | null
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
    email?: boolean
    encryptedPassword?: boolean
    isSuperAdmin?: boolean
    lastSignInAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    profile?: boolean | User$profileArgs<ExtArgs>
    UserRoleMapping?: boolean | User$UserRoleMappingArgs<ExtArgs>
    tests?: boolean | User$testsArgs<ExtArgs>
    driverHistories?: boolean | User$driverHistoriesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    encryptedPassword?: boolean
    isSuperAdmin?: boolean
    lastSignInAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    encryptedPassword?: boolean
    isSuperAdmin?: boolean
    lastSignInAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    encryptedPassword?: boolean
    isSuperAdmin?: boolean
    lastSignInAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "encryptedPassword" | "isSuperAdmin" | "lastSignInAt" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    profile?: boolean | User$profileArgs<ExtArgs>
    UserRoleMapping?: boolean | User$UserRoleMappingArgs<ExtArgs>
    tests?: boolean | User$testsArgs<ExtArgs>
    driverHistories?: boolean | User$driverHistoriesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      profile: Prisma.$ProfilePayload<ExtArgs> | null
      UserRoleMapping: Prisma.$UserRoleMappingPayload<ExtArgs>[]
      tests: Prisma.$TestPayload<ExtArgs>[]
      driverHistories: Prisma.$VehicleDriverHistoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      encryptedPassword: string
      isSuperAdmin: boolean | null
      lastSignInAt: Date | null
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
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
    profile<T extends User$profileArgs<ExtArgs> = {}>(args?: Subset<T, User$profileArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    UserRoleMapping<T extends User$UserRoleMappingArgs<ExtArgs> = {}>(args?: Subset<T, User$UserRoleMappingArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRoleMappingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tests<T extends User$testsArgs<ExtArgs> = {}>(args?: Subset<T, User$testsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    driverHistories<T extends User$driverHistoriesArgs<ExtArgs> = {}>(args?: Subset<T, User$driverHistoriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VehicleDriverHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
    readonly email: FieldRef<"User", 'String'>
    readonly encryptedPassword: FieldRef<"User", 'String'>
    readonly isSuperAdmin: FieldRef<"User", 'Boolean'>
    readonly lastSignInAt: FieldRef<"User", 'DateTime'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly deletedAt: FieldRef<"User", 'DateTime'>
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
   * User.profile
   */
  export type User$profileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    where?: ProfileWhereInput
  }

  /**
   * User.UserRoleMapping
   */
  export type User$UserRoleMappingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRoleMapping
     */
    select?: UserRoleMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRoleMapping
     */
    omit?: UserRoleMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleMappingInclude<ExtArgs> | null
    where?: UserRoleMappingWhereInput
    orderBy?: UserRoleMappingOrderByWithRelationInput | UserRoleMappingOrderByWithRelationInput[]
    cursor?: UserRoleMappingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserRoleMappingScalarFieldEnum | UserRoleMappingScalarFieldEnum[]
  }

  /**
   * User.tests
   */
  export type User$testsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestInclude<ExtArgs> | null
    where?: TestWhereInput
    orderBy?: TestOrderByWithRelationInput | TestOrderByWithRelationInput[]
    cursor?: TestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TestScalarFieldEnum | TestScalarFieldEnum[]
  }

  /**
   * User.driverHistories
   */
  export type User$driverHistoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryInclude<ExtArgs> | null
    where?: VehicleDriverHistoryWhereInput
    orderBy?: VehicleDriverHistoryOrderByWithRelationInput | VehicleDriverHistoryOrderByWithRelationInput[]
    cursor?: VehicleDriverHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VehicleDriverHistoryScalarFieldEnum | VehicleDriverHistoryScalarFieldEnum[]
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
   * Model UserRoleMapping
   */

  export type AggregateUserRoleMapping = {
    _count: UserRoleMappingCountAggregateOutputType | null
    _min: UserRoleMappingMinAggregateOutputType | null
    _max: UserRoleMappingMaxAggregateOutputType | null
  }

  export type UserRoleMappingMinAggregateOutputType = {
    id: string | null
    userId: string | null
    role: $Enums.user_role | null
    createdAt: Date | null
  }

  export type UserRoleMappingMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    role: $Enums.user_role | null
    createdAt: Date | null
  }

  export type UserRoleMappingCountAggregateOutputType = {
    id: number
    userId: number
    role: number
    createdAt: number
    _all: number
  }


  export type UserRoleMappingMinAggregateInputType = {
    id?: true
    userId?: true
    role?: true
    createdAt?: true
  }

  export type UserRoleMappingMaxAggregateInputType = {
    id?: true
    userId?: true
    role?: true
    createdAt?: true
  }

  export type UserRoleMappingCountAggregateInputType = {
    id?: true
    userId?: true
    role?: true
    createdAt?: true
    _all?: true
  }

  export type UserRoleMappingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserRoleMapping to aggregate.
     */
    where?: UserRoleMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRoleMappings to fetch.
     */
    orderBy?: UserRoleMappingOrderByWithRelationInput | UserRoleMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserRoleMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRoleMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRoleMappings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserRoleMappings
    **/
    _count?: true | UserRoleMappingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserRoleMappingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserRoleMappingMaxAggregateInputType
  }

  export type GetUserRoleMappingAggregateType<T extends UserRoleMappingAggregateArgs> = {
        [P in keyof T & keyof AggregateUserRoleMapping]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserRoleMapping[P]>
      : GetScalarType<T[P], AggregateUserRoleMapping[P]>
  }




  export type UserRoleMappingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserRoleMappingWhereInput
    orderBy?: UserRoleMappingOrderByWithAggregationInput | UserRoleMappingOrderByWithAggregationInput[]
    by: UserRoleMappingScalarFieldEnum[] | UserRoleMappingScalarFieldEnum
    having?: UserRoleMappingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserRoleMappingCountAggregateInputType | true
    _min?: UserRoleMappingMinAggregateInputType
    _max?: UserRoleMappingMaxAggregateInputType
  }

  export type UserRoleMappingGroupByOutputType = {
    id: string
    userId: string
    role: $Enums.user_role
    createdAt: Date
    _count: UserRoleMappingCountAggregateOutputType | null
    _min: UserRoleMappingMinAggregateOutputType | null
    _max: UserRoleMappingMaxAggregateOutputType | null
  }

  type GetUserRoleMappingGroupByPayload<T extends UserRoleMappingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserRoleMappingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserRoleMappingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserRoleMappingGroupByOutputType[P]>
            : GetScalarType<T[P], UserRoleMappingGroupByOutputType[P]>
        }
      >
    >


  export type UserRoleMappingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    role?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userRoleMapping"]>

  export type UserRoleMappingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    role?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userRoleMapping"]>

  export type UserRoleMappingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    role?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userRoleMapping"]>

  export type UserRoleMappingSelectScalar = {
    id?: boolean
    userId?: boolean
    role?: boolean
    createdAt?: boolean
  }

  export type UserRoleMappingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "role" | "createdAt", ExtArgs["result"]["userRoleMapping"]>
  export type UserRoleMappingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserRoleMappingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserRoleMappingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserRoleMappingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserRoleMapping"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      role: $Enums.user_role
      createdAt: Date
    }, ExtArgs["result"]["userRoleMapping"]>
    composites: {}
  }

  type UserRoleMappingGetPayload<S extends boolean | null | undefined | UserRoleMappingDefaultArgs> = $Result.GetResult<Prisma.$UserRoleMappingPayload, S>

  type UserRoleMappingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserRoleMappingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserRoleMappingCountAggregateInputType | true
    }

  export interface UserRoleMappingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserRoleMapping'], meta: { name: 'UserRoleMapping' } }
    /**
     * Find zero or one UserRoleMapping that matches the filter.
     * @param {UserRoleMappingFindUniqueArgs} args - Arguments to find a UserRoleMapping
     * @example
     * // Get one UserRoleMapping
     * const userRoleMapping = await prisma.userRoleMapping.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserRoleMappingFindUniqueArgs>(args: SelectSubset<T, UserRoleMappingFindUniqueArgs<ExtArgs>>): Prisma__UserRoleMappingClient<$Result.GetResult<Prisma.$UserRoleMappingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserRoleMapping that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserRoleMappingFindUniqueOrThrowArgs} args - Arguments to find a UserRoleMapping
     * @example
     * // Get one UserRoleMapping
     * const userRoleMapping = await prisma.userRoleMapping.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserRoleMappingFindUniqueOrThrowArgs>(args: SelectSubset<T, UserRoleMappingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserRoleMappingClient<$Result.GetResult<Prisma.$UserRoleMappingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserRoleMapping that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleMappingFindFirstArgs} args - Arguments to find a UserRoleMapping
     * @example
     * // Get one UserRoleMapping
     * const userRoleMapping = await prisma.userRoleMapping.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserRoleMappingFindFirstArgs>(args?: SelectSubset<T, UserRoleMappingFindFirstArgs<ExtArgs>>): Prisma__UserRoleMappingClient<$Result.GetResult<Prisma.$UserRoleMappingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserRoleMapping that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleMappingFindFirstOrThrowArgs} args - Arguments to find a UserRoleMapping
     * @example
     * // Get one UserRoleMapping
     * const userRoleMapping = await prisma.userRoleMapping.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserRoleMappingFindFirstOrThrowArgs>(args?: SelectSubset<T, UserRoleMappingFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserRoleMappingClient<$Result.GetResult<Prisma.$UserRoleMappingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserRoleMappings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleMappingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserRoleMappings
     * const userRoleMappings = await prisma.userRoleMapping.findMany()
     * 
     * // Get first 10 UserRoleMappings
     * const userRoleMappings = await prisma.userRoleMapping.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userRoleMappingWithIdOnly = await prisma.userRoleMapping.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserRoleMappingFindManyArgs>(args?: SelectSubset<T, UserRoleMappingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRoleMappingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserRoleMapping.
     * @param {UserRoleMappingCreateArgs} args - Arguments to create a UserRoleMapping.
     * @example
     * // Create one UserRoleMapping
     * const UserRoleMapping = await prisma.userRoleMapping.create({
     *   data: {
     *     // ... data to create a UserRoleMapping
     *   }
     * })
     * 
     */
    create<T extends UserRoleMappingCreateArgs>(args: SelectSubset<T, UserRoleMappingCreateArgs<ExtArgs>>): Prisma__UserRoleMappingClient<$Result.GetResult<Prisma.$UserRoleMappingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserRoleMappings.
     * @param {UserRoleMappingCreateManyArgs} args - Arguments to create many UserRoleMappings.
     * @example
     * // Create many UserRoleMappings
     * const userRoleMapping = await prisma.userRoleMapping.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserRoleMappingCreateManyArgs>(args?: SelectSubset<T, UserRoleMappingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserRoleMappings and returns the data saved in the database.
     * @param {UserRoleMappingCreateManyAndReturnArgs} args - Arguments to create many UserRoleMappings.
     * @example
     * // Create many UserRoleMappings
     * const userRoleMapping = await prisma.userRoleMapping.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserRoleMappings and only return the `id`
     * const userRoleMappingWithIdOnly = await prisma.userRoleMapping.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserRoleMappingCreateManyAndReturnArgs>(args?: SelectSubset<T, UserRoleMappingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRoleMappingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserRoleMapping.
     * @param {UserRoleMappingDeleteArgs} args - Arguments to delete one UserRoleMapping.
     * @example
     * // Delete one UserRoleMapping
     * const UserRoleMapping = await prisma.userRoleMapping.delete({
     *   where: {
     *     // ... filter to delete one UserRoleMapping
     *   }
     * })
     * 
     */
    delete<T extends UserRoleMappingDeleteArgs>(args: SelectSubset<T, UserRoleMappingDeleteArgs<ExtArgs>>): Prisma__UserRoleMappingClient<$Result.GetResult<Prisma.$UserRoleMappingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserRoleMapping.
     * @param {UserRoleMappingUpdateArgs} args - Arguments to update one UserRoleMapping.
     * @example
     * // Update one UserRoleMapping
     * const userRoleMapping = await prisma.userRoleMapping.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserRoleMappingUpdateArgs>(args: SelectSubset<T, UserRoleMappingUpdateArgs<ExtArgs>>): Prisma__UserRoleMappingClient<$Result.GetResult<Prisma.$UserRoleMappingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserRoleMappings.
     * @param {UserRoleMappingDeleteManyArgs} args - Arguments to filter UserRoleMappings to delete.
     * @example
     * // Delete a few UserRoleMappings
     * const { count } = await prisma.userRoleMapping.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserRoleMappingDeleteManyArgs>(args?: SelectSubset<T, UserRoleMappingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserRoleMappings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleMappingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserRoleMappings
     * const userRoleMapping = await prisma.userRoleMapping.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserRoleMappingUpdateManyArgs>(args: SelectSubset<T, UserRoleMappingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserRoleMappings and returns the data updated in the database.
     * @param {UserRoleMappingUpdateManyAndReturnArgs} args - Arguments to update many UserRoleMappings.
     * @example
     * // Update many UserRoleMappings
     * const userRoleMapping = await prisma.userRoleMapping.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserRoleMappings and only return the `id`
     * const userRoleMappingWithIdOnly = await prisma.userRoleMapping.updateManyAndReturn({
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
    updateManyAndReturn<T extends UserRoleMappingUpdateManyAndReturnArgs>(args: SelectSubset<T, UserRoleMappingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRoleMappingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserRoleMapping.
     * @param {UserRoleMappingUpsertArgs} args - Arguments to update or create a UserRoleMapping.
     * @example
     * // Update or create a UserRoleMapping
     * const userRoleMapping = await prisma.userRoleMapping.upsert({
     *   create: {
     *     // ... data to create a UserRoleMapping
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserRoleMapping we want to update
     *   }
     * })
     */
    upsert<T extends UserRoleMappingUpsertArgs>(args: SelectSubset<T, UserRoleMappingUpsertArgs<ExtArgs>>): Prisma__UserRoleMappingClient<$Result.GetResult<Prisma.$UserRoleMappingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserRoleMappings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleMappingCountArgs} args - Arguments to filter UserRoleMappings to count.
     * @example
     * // Count the number of UserRoleMappings
     * const count = await prisma.userRoleMapping.count({
     *   where: {
     *     // ... the filter for the UserRoleMappings we want to count
     *   }
     * })
    **/
    count<T extends UserRoleMappingCountArgs>(
      args?: Subset<T, UserRoleMappingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserRoleMappingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserRoleMapping.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleMappingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserRoleMappingAggregateArgs>(args: Subset<T, UserRoleMappingAggregateArgs>): Prisma.PrismaPromise<GetUserRoleMappingAggregateType<T>>

    /**
     * Group by UserRoleMapping.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleMappingGroupByArgs} args - Group by arguments.
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
      T extends UserRoleMappingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserRoleMappingGroupByArgs['orderBy'] }
        : { orderBy?: UserRoleMappingGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserRoleMappingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserRoleMappingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserRoleMapping model
   */
  readonly fields: UserRoleMappingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserRoleMapping.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserRoleMappingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the UserRoleMapping model
   */
  interface UserRoleMappingFieldRefs {
    readonly id: FieldRef<"UserRoleMapping", 'String'>
    readonly userId: FieldRef<"UserRoleMapping", 'String'>
    readonly role: FieldRef<"UserRoleMapping", 'user_role'>
    readonly createdAt: FieldRef<"UserRoleMapping", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserRoleMapping findUnique
   */
  export type UserRoleMappingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRoleMapping
     */
    select?: UserRoleMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRoleMapping
     */
    omit?: UserRoleMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleMappingInclude<ExtArgs> | null
    /**
     * Filter, which UserRoleMapping to fetch.
     */
    where: UserRoleMappingWhereUniqueInput
  }

  /**
   * UserRoleMapping findUniqueOrThrow
   */
  export type UserRoleMappingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRoleMapping
     */
    select?: UserRoleMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRoleMapping
     */
    omit?: UserRoleMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleMappingInclude<ExtArgs> | null
    /**
     * Filter, which UserRoleMapping to fetch.
     */
    where: UserRoleMappingWhereUniqueInput
  }

  /**
   * UserRoleMapping findFirst
   */
  export type UserRoleMappingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRoleMapping
     */
    select?: UserRoleMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRoleMapping
     */
    omit?: UserRoleMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleMappingInclude<ExtArgs> | null
    /**
     * Filter, which UserRoleMapping to fetch.
     */
    where?: UserRoleMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRoleMappings to fetch.
     */
    orderBy?: UserRoleMappingOrderByWithRelationInput | UserRoleMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserRoleMappings.
     */
    cursor?: UserRoleMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRoleMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRoleMappings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserRoleMappings.
     */
    distinct?: UserRoleMappingScalarFieldEnum | UserRoleMappingScalarFieldEnum[]
  }

  /**
   * UserRoleMapping findFirstOrThrow
   */
  export type UserRoleMappingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRoleMapping
     */
    select?: UserRoleMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRoleMapping
     */
    omit?: UserRoleMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleMappingInclude<ExtArgs> | null
    /**
     * Filter, which UserRoleMapping to fetch.
     */
    where?: UserRoleMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRoleMappings to fetch.
     */
    orderBy?: UserRoleMappingOrderByWithRelationInput | UserRoleMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserRoleMappings.
     */
    cursor?: UserRoleMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRoleMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRoleMappings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserRoleMappings.
     */
    distinct?: UserRoleMappingScalarFieldEnum | UserRoleMappingScalarFieldEnum[]
  }

  /**
   * UserRoleMapping findMany
   */
  export type UserRoleMappingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRoleMapping
     */
    select?: UserRoleMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRoleMapping
     */
    omit?: UserRoleMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleMappingInclude<ExtArgs> | null
    /**
     * Filter, which UserRoleMappings to fetch.
     */
    where?: UserRoleMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRoleMappings to fetch.
     */
    orderBy?: UserRoleMappingOrderByWithRelationInput | UserRoleMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserRoleMappings.
     */
    cursor?: UserRoleMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRoleMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRoleMappings.
     */
    skip?: number
    distinct?: UserRoleMappingScalarFieldEnum | UserRoleMappingScalarFieldEnum[]
  }

  /**
   * UserRoleMapping create
   */
  export type UserRoleMappingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRoleMapping
     */
    select?: UserRoleMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRoleMapping
     */
    omit?: UserRoleMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleMappingInclude<ExtArgs> | null
    /**
     * The data needed to create a UserRoleMapping.
     */
    data: XOR<UserRoleMappingCreateInput, UserRoleMappingUncheckedCreateInput>
  }

  /**
   * UserRoleMapping createMany
   */
  export type UserRoleMappingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserRoleMappings.
     */
    data: UserRoleMappingCreateManyInput | UserRoleMappingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserRoleMapping createManyAndReturn
   */
  export type UserRoleMappingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRoleMapping
     */
    select?: UserRoleMappingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserRoleMapping
     */
    omit?: UserRoleMappingOmit<ExtArgs> | null
    /**
     * The data used to create many UserRoleMappings.
     */
    data: UserRoleMappingCreateManyInput | UserRoleMappingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleMappingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserRoleMapping update
   */
  export type UserRoleMappingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRoleMapping
     */
    select?: UserRoleMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRoleMapping
     */
    omit?: UserRoleMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleMappingInclude<ExtArgs> | null
    /**
     * The data needed to update a UserRoleMapping.
     */
    data: XOR<UserRoleMappingUpdateInput, UserRoleMappingUncheckedUpdateInput>
    /**
     * Choose, which UserRoleMapping to update.
     */
    where: UserRoleMappingWhereUniqueInput
  }

  /**
   * UserRoleMapping updateMany
   */
  export type UserRoleMappingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserRoleMappings.
     */
    data: XOR<UserRoleMappingUpdateManyMutationInput, UserRoleMappingUncheckedUpdateManyInput>
    /**
     * Filter which UserRoleMappings to update
     */
    where?: UserRoleMappingWhereInput
    /**
     * Limit how many UserRoleMappings to update.
     */
    limit?: number
  }

  /**
   * UserRoleMapping updateManyAndReturn
   */
  export type UserRoleMappingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRoleMapping
     */
    select?: UserRoleMappingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserRoleMapping
     */
    omit?: UserRoleMappingOmit<ExtArgs> | null
    /**
     * The data used to update UserRoleMappings.
     */
    data: XOR<UserRoleMappingUpdateManyMutationInput, UserRoleMappingUncheckedUpdateManyInput>
    /**
     * Filter which UserRoleMappings to update
     */
    where?: UserRoleMappingWhereInput
    /**
     * Limit how many UserRoleMappings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleMappingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserRoleMapping upsert
   */
  export type UserRoleMappingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRoleMapping
     */
    select?: UserRoleMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRoleMapping
     */
    omit?: UserRoleMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleMappingInclude<ExtArgs> | null
    /**
     * The filter to search for the UserRoleMapping to update in case it exists.
     */
    where: UserRoleMappingWhereUniqueInput
    /**
     * In case the UserRoleMapping found by the `where` argument doesn't exist, create a new UserRoleMapping with this data.
     */
    create: XOR<UserRoleMappingCreateInput, UserRoleMappingUncheckedCreateInput>
    /**
     * In case the UserRoleMapping was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserRoleMappingUpdateInput, UserRoleMappingUncheckedUpdateInput>
  }

  /**
   * UserRoleMapping delete
   */
  export type UserRoleMappingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRoleMapping
     */
    select?: UserRoleMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRoleMapping
     */
    omit?: UserRoleMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleMappingInclude<ExtArgs> | null
    /**
     * Filter which UserRoleMapping to delete.
     */
    where: UserRoleMappingWhereUniqueInput
  }

  /**
   * UserRoleMapping deleteMany
   */
  export type UserRoleMappingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserRoleMappings to delete
     */
    where?: UserRoleMappingWhereInput
    /**
     * Limit how many UserRoleMappings to delete.
     */
    limit?: number
  }

  /**
   * UserRoleMapping without action
   */
  export type UserRoleMappingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRoleMapping
     */
    select?: UserRoleMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRoleMapping
     */
    omit?: UserRoleMappingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleMappingInclude<ExtArgs> | null
  }


  /**
   * Model Profile
   */

  export type AggregateProfile = {
    _count: ProfileCountAggregateOutputType | null
    _min: ProfileMinAggregateOutputType | null
    _max: ProfileMaxAggregateOutputType | null
  }

  export type ProfileMinAggregateOutputType = {
    id: string | null
    userId: string | null
    firstName: string | null
    lastName: string | null
    bio: string | null
    jobTitle: string | null
    department: string | null
    phoneNumber: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProfileMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    firstName: string | null
    lastName: string | null
    bio: string | null
    jobTitle: string | null
    department: string | null
    phoneNumber: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProfileCountAggregateOutputType = {
    id: number
    userId: number
    firstName: number
    lastName: number
    bio: number
    jobTitle: number
    department: number
    phoneNumber: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProfileMinAggregateInputType = {
    id?: true
    userId?: true
    firstName?: true
    lastName?: true
    bio?: true
    jobTitle?: true
    department?: true
    phoneNumber?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProfileMaxAggregateInputType = {
    id?: true
    userId?: true
    firstName?: true
    lastName?: true
    bio?: true
    jobTitle?: true
    department?: true
    phoneNumber?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProfileCountAggregateInputType = {
    id?: true
    userId?: true
    firstName?: true
    lastName?: true
    bio?: true
    jobTitle?: true
    department?: true
    phoneNumber?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Profile to aggregate.
     */
    where?: ProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Profiles to fetch.
     */
    orderBy?: ProfileOrderByWithRelationInput | ProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Profiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Profiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Profiles
    **/
    _count?: true | ProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProfileMaxAggregateInputType
  }

  export type GetProfileAggregateType<T extends ProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProfile[P]>
      : GetScalarType<T[P], AggregateProfile[P]>
  }




  export type ProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProfileWhereInput
    orderBy?: ProfileOrderByWithAggregationInput | ProfileOrderByWithAggregationInput[]
    by: ProfileScalarFieldEnum[] | ProfileScalarFieldEnum
    having?: ProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProfileCountAggregateInputType | true
    _min?: ProfileMinAggregateInputType
    _max?: ProfileMaxAggregateInputType
  }

  export type ProfileGroupByOutputType = {
    id: string
    userId: string
    firstName: string | null
    lastName: string | null
    bio: string | null
    jobTitle: string | null
    department: string | null
    phoneNumber: string | null
    createdAt: Date
    updatedAt: Date
    _count: ProfileCountAggregateOutputType | null
    _min: ProfileMinAggregateOutputType | null
    _max: ProfileMaxAggregateOutputType | null
  }

  type GetProfileGroupByPayload<T extends ProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProfileGroupByOutputType[P]>
            : GetScalarType<T[P], ProfileGroupByOutputType[P]>
        }
      >
    >


  export type ProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    firstName?: boolean
    lastName?: boolean
    bio?: boolean
    jobTitle?: boolean
    department?: boolean
    phoneNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["profile"]>

  export type ProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    firstName?: boolean
    lastName?: boolean
    bio?: boolean
    jobTitle?: boolean
    department?: boolean
    phoneNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["profile"]>

  export type ProfileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    firstName?: boolean
    lastName?: boolean
    bio?: boolean
    jobTitle?: boolean
    department?: boolean
    phoneNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["profile"]>

  export type ProfileSelectScalar = {
    id?: boolean
    userId?: boolean
    firstName?: boolean
    lastName?: boolean
    bio?: boolean
    jobTitle?: boolean
    department?: boolean
    phoneNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "firstName" | "lastName" | "bio" | "jobTitle" | "department" | "phoneNumber" | "createdAt" | "updatedAt", ExtArgs["result"]["profile"]>
  export type ProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ProfileIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Profile"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      firstName: string | null
      lastName: string | null
      bio: string | null
      jobTitle: string | null
      department: string | null
      phoneNumber: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["profile"]>
    composites: {}
  }

  type ProfileGetPayload<S extends boolean | null | undefined | ProfileDefaultArgs> = $Result.GetResult<Prisma.$ProfilePayload, S>

  type ProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProfileCountAggregateInputType | true
    }

  export interface ProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Profile'], meta: { name: 'Profile' } }
    /**
     * Find zero or one Profile that matches the filter.
     * @param {ProfileFindUniqueArgs} args - Arguments to find a Profile
     * @example
     * // Get one Profile
     * const profile = await prisma.profile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProfileFindUniqueArgs>(args: SelectSubset<T, ProfileFindUniqueArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Profile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProfileFindUniqueOrThrowArgs} args - Arguments to find a Profile
     * @example
     * // Get one Profile
     * const profile = await prisma.profile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, ProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Profile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileFindFirstArgs} args - Arguments to find a Profile
     * @example
     * // Get one Profile
     * const profile = await prisma.profile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProfileFindFirstArgs>(args?: SelectSubset<T, ProfileFindFirstArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Profile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileFindFirstOrThrowArgs} args - Arguments to find a Profile
     * @example
     * // Get one Profile
     * const profile = await prisma.profile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, ProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Profiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Profiles
     * const profiles = await prisma.profile.findMany()
     * 
     * // Get first 10 Profiles
     * const profiles = await prisma.profile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const profileWithIdOnly = await prisma.profile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProfileFindManyArgs>(args?: SelectSubset<T, ProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Profile.
     * @param {ProfileCreateArgs} args - Arguments to create a Profile.
     * @example
     * // Create one Profile
     * const Profile = await prisma.profile.create({
     *   data: {
     *     // ... data to create a Profile
     *   }
     * })
     * 
     */
    create<T extends ProfileCreateArgs>(args: SelectSubset<T, ProfileCreateArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Profiles.
     * @param {ProfileCreateManyArgs} args - Arguments to create many Profiles.
     * @example
     * // Create many Profiles
     * const profile = await prisma.profile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProfileCreateManyArgs>(args?: SelectSubset<T, ProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Profiles and returns the data saved in the database.
     * @param {ProfileCreateManyAndReturnArgs} args - Arguments to create many Profiles.
     * @example
     * // Create many Profiles
     * const profile = await prisma.profile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Profiles and only return the `id`
     * const profileWithIdOnly = await prisma.profile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, ProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Profile.
     * @param {ProfileDeleteArgs} args - Arguments to delete one Profile.
     * @example
     * // Delete one Profile
     * const Profile = await prisma.profile.delete({
     *   where: {
     *     // ... filter to delete one Profile
     *   }
     * })
     * 
     */
    delete<T extends ProfileDeleteArgs>(args: SelectSubset<T, ProfileDeleteArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Profile.
     * @param {ProfileUpdateArgs} args - Arguments to update one Profile.
     * @example
     * // Update one Profile
     * const profile = await prisma.profile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProfileUpdateArgs>(args: SelectSubset<T, ProfileUpdateArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Profiles.
     * @param {ProfileDeleteManyArgs} args - Arguments to filter Profiles to delete.
     * @example
     * // Delete a few Profiles
     * const { count } = await prisma.profile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProfileDeleteManyArgs>(args?: SelectSubset<T, ProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Profiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Profiles
     * const profile = await prisma.profile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProfileUpdateManyArgs>(args: SelectSubset<T, ProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Profiles and returns the data updated in the database.
     * @param {ProfileUpdateManyAndReturnArgs} args - Arguments to update many Profiles.
     * @example
     * // Update many Profiles
     * const profile = await prisma.profile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Profiles and only return the `id`
     * const profileWithIdOnly = await prisma.profile.updateManyAndReturn({
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
    updateManyAndReturn<T extends ProfileUpdateManyAndReturnArgs>(args: SelectSubset<T, ProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Profile.
     * @param {ProfileUpsertArgs} args - Arguments to update or create a Profile.
     * @example
     * // Update or create a Profile
     * const profile = await prisma.profile.upsert({
     *   create: {
     *     // ... data to create a Profile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Profile we want to update
     *   }
     * })
     */
    upsert<T extends ProfileUpsertArgs>(args: SelectSubset<T, ProfileUpsertArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Profiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileCountArgs} args - Arguments to filter Profiles to count.
     * @example
     * // Count the number of Profiles
     * const count = await prisma.profile.count({
     *   where: {
     *     // ... the filter for the Profiles we want to count
     *   }
     * })
    **/
    count<T extends ProfileCountArgs>(
      args?: Subset<T, ProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Profile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProfileAggregateArgs>(args: Subset<T, ProfileAggregateArgs>): Prisma.PrismaPromise<GetProfileAggregateType<T>>

    /**
     * Group by Profile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileGroupByArgs} args - Group by arguments.
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
      T extends ProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProfileGroupByArgs['orderBy'] }
        : { orderBy?: ProfileGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Profile model
   */
  readonly fields: ProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Profile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the Profile model
   */
  interface ProfileFieldRefs {
    readonly id: FieldRef<"Profile", 'String'>
    readonly userId: FieldRef<"Profile", 'String'>
    readonly firstName: FieldRef<"Profile", 'String'>
    readonly lastName: FieldRef<"Profile", 'String'>
    readonly bio: FieldRef<"Profile", 'String'>
    readonly jobTitle: FieldRef<"Profile", 'String'>
    readonly department: FieldRef<"Profile", 'String'>
    readonly phoneNumber: FieldRef<"Profile", 'String'>
    readonly createdAt: FieldRef<"Profile", 'DateTime'>
    readonly updatedAt: FieldRef<"Profile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Profile findUnique
   */
  export type ProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * Filter, which Profile to fetch.
     */
    where: ProfileWhereUniqueInput
  }

  /**
   * Profile findUniqueOrThrow
   */
  export type ProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * Filter, which Profile to fetch.
     */
    where: ProfileWhereUniqueInput
  }

  /**
   * Profile findFirst
   */
  export type ProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * Filter, which Profile to fetch.
     */
    where?: ProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Profiles to fetch.
     */
    orderBy?: ProfileOrderByWithRelationInput | ProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Profiles.
     */
    cursor?: ProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Profiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Profiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Profiles.
     */
    distinct?: ProfileScalarFieldEnum | ProfileScalarFieldEnum[]
  }

  /**
   * Profile findFirstOrThrow
   */
  export type ProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * Filter, which Profile to fetch.
     */
    where?: ProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Profiles to fetch.
     */
    orderBy?: ProfileOrderByWithRelationInput | ProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Profiles.
     */
    cursor?: ProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Profiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Profiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Profiles.
     */
    distinct?: ProfileScalarFieldEnum | ProfileScalarFieldEnum[]
  }

  /**
   * Profile findMany
   */
  export type ProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * Filter, which Profiles to fetch.
     */
    where?: ProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Profiles to fetch.
     */
    orderBy?: ProfileOrderByWithRelationInput | ProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Profiles.
     */
    cursor?: ProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Profiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Profiles.
     */
    skip?: number
    distinct?: ProfileScalarFieldEnum | ProfileScalarFieldEnum[]
  }

  /**
   * Profile create
   */
  export type ProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a Profile.
     */
    data: XOR<ProfileCreateInput, ProfileUncheckedCreateInput>
  }

  /**
   * Profile createMany
   */
  export type ProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Profiles.
     */
    data: ProfileCreateManyInput | ProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Profile createManyAndReturn
   */
  export type ProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * The data used to create many Profiles.
     */
    data: ProfileCreateManyInput | ProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Profile update
   */
  export type ProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a Profile.
     */
    data: XOR<ProfileUpdateInput, ProfileUncheckedUpdateInput>
    /**
     * Choose, which Profile to update.
     */
    where: ProfileWhereUniqueInput
  }

  /**
   * Profile updateMany
   */
  export type ProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Profiles.
     */
    data: XOR<ProfileUpdateManyMutationInput, ProfileUncheckedUpdateManyInput>
    /**
     * Filter which Profiles to update
     */
    where?: ProfileWhereInput
    /**
     * Limit how many Profiles to update.
     */
    limit?: number
  }

  /**
   * Profile updateManyAndReturn
   */
  export type ProfileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * The data used to update Profiles.
     */
    data: XOR<ProfileUpdateManyMutationInput, ProfileUncheckedUpdateManyInput>
    /**
     * Filter which Profiles to update
     */
    where?: ProfileWhereInput
    /**
     * Limit how many Profiles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Profile upsert
   */
  export type ProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the Profile to update in case it exists.
     */
    where: ProfileWhereUniqueInput
    /**
     * In case the Profile found by the `where` argument doesn't exist, create a new Profile with this data.
     */
    create: XOR<ProfileCreateInput, ProfileUncheckedCreateInput>
    /**
     * In case the Profile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProfileUpdateInput, ProfileUncheckedUpdateInput>
  }

  /**
   * Profile delete
   */
  export type ProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * Filter which Profile to delete.
     */
    where: ProfileWhereUniqueInput
  }

  /**
   * Profile deleteMany
   */
  export type ProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Profiles to delete
     */
    where?: ProfileWhereInput
    /**
     * Limit how many Profiles to delete.
     */
    limit?: number
  }

  /**
   * Profile without action
   */
  export type ProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
  }


  /**
   * Model Fee
   */

  export type AggregateFee = {
    _count: FeeCountAggregateOutputType | null
    _avg: FeeAvgAggregateOutputType | null
    _sum: FeeSumAggregateOutputType | null
    _min: FeeMinAggregateOutputType | null
    _max: FeeMaxAggregateOutputType | null
  }

  export type FeeAvgAggregateOutputType = {
    id: number | null
    amount: Decimal | null
    level: number | null
  }

  export type FeeSumAggregateOutputType = {
    id: number | null
    amount: Decimal | null
    level: number | null
  }

  export type FeeMinAggregateOutputType = {
    id: number | null
    amount: Decimal | null
    category: string | null
    level: number | null
    effectiveDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FeeMaxAggregateOutputType = {
    id: number | null
    amount: Decimal | null
    category: string | null
    level: number | null
    effectiveDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FeeCountAggregateOutputType = {
    id: number
    amount: number
    category: number
    level: number
    effectiveDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FeeAvgAggregateInputType = {
    id?: true
    amount?: true
    level?: true
  }

  export type FeeSumAggregateInputType = {
    id?: true
    amount?: true
    level?: true
  }

  export type FeeMinAggregateInputType = {
    id?: true
    amount?: true
    category?: true
    level?: true
    effectiveDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FeeMaxAggregateInputType = {
    id?: true
    amount?: true
    category?: true
    level?: true
    effectiveDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FeeCountAggregateInputType = {
    id?: true
    amount?: true
    category?: true
    level?: true
    effectiveDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FeeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Fee to aggregate.
     */
    where?: FeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fees to fetch.
     */
    orderBy?: FeeOrderByWithRelationInput | FeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Fees
    **/
    _count?: true | FeeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FeeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FeeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FeeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FeeMaxAggregateInputType
  }

  export type GetFeeAggregateType<T extends FeeAggregateArgs> = {
        [P in keyof T & keyof AggregateFee]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFee[P]>
      : GetScalarType<T[P], AggregateFee[P]>
  }




  export type FeeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FeeWhereInput
    orderBy?: FeeOrderByWithAggregationInput | FeeOrderByWithAggregationInput[]
    by: FeeScalarFieldEnum[] | FeeScalarFieldEnum
    having?: FeeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FeeCountAggregateInputType | true
    _avg?: FeeAvgAggregateInputType
    _sum?: FeeSumAggregateInputType
    _min?: FeeMinAggregateInputType
    _max?: FeeMaxAggregateInputType
  }

  export type FeeGroupByOutputType = {
    id: number
    amount: Decimal
    category: string
    level: number
    effectiveDate: Date
    createdAt: Date | null
    updatedAt: Date | null
    _count: FeeCountAggregateOutputType | null
    _avg: FeeAvgAggregateOutputType | null
    _sum: FeeSumAggregateOutputType | null
    _min: FeeMinAggregateOutputType | null
    _max: FeeMaxAggregateOutputType | null
  }

  type GetFeeGroupByPayload<T extends FeeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FeeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FeeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FeeGroupByOutputType[P]>
            : GetScalarType<T[P], FeeGroupByOutputType[P]>
        }
      >
    >


  export type FeeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    amount?: boolean
    category?: boolean
    level?: boolean
    effectiveDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["fee"]>

  export type FeeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    amount?: boolean
    category?: boolean
    level?: boolean
    effectiveDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["fee"]>

  export type FeeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    amount?: boolean
    category?: boolean
    level?: boolean
    effectiveDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["fee"]>

  export type FeeSelectScalar = {
    id?: boolean
    amount?: boolean
    category?: boolean
    level?: boolean
    effectiveDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FeeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "amount" | "category" | "level" | "effectiveDate" | "createdAt" | "updatedAt", ExtArgs["result"]["fee"]>

  export type $FeePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Fee"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      amount: Prisma.Decimal
      category: string
      level: number
      effectiveDate: Date
      createdAt: Date | null
      updatedAt: Date | null
    }, ExtArgs["result"]["fee"]>
    composites: {}
  }

  type FeeGetPayload<S extends boolean | null | undefined | FeeDefaultArgs> = $Result.GetResult<Prisma.$FeePayload, S>

  type FeeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FeeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FeeCountAggregateInputType | true
    }

  export interface FeeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Fee'], meta: { name: 'Fee' } }
    /**
     * Find zero or one Fee that matches the filter.
     * @param {FeeFindUniqueArgs} args - Arguments to find a Fee
     * @example
     * // Get one Fee
     * const fee = await prisma.fee.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FeeFindUniqueArgs>(args: SelectSubset<T, FeeFindUniqueArgs<ExtArgs>>): Prisma__FeeClient<$Result.GetResult<Prisma.$FeePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Fee that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FeeFindUniqueOrThrowArgs} args - Arguments to find a Fee
     * @example
     * // Get one Fee
     * const fee = await prisma.fee.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FeeFindUniqueOrThrowArgs>(args: SelectSubset<T, FeeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FeeClient<$Result.GetResult<Prisma.$FeePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Fee that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeeFindFirstArgs} args - Arguments to find a Fee
     * @example
     * // Get one Fee
     * const fee = await prisma.fee.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FeeFindFirstArgs>(args?: SelectSubset<T, FeeFindFirstArgs<ExtArgs>>): Prisma__FeeClient<$Result.GetResult<Prisma.$FeePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Fee that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeeFindFirstOrThrowArgs} args - Arguments to find a Fee
     * @example
     * // Get one Fee
     * const fee = await prisma.fee.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FeeFindFirstOrThrowArgs>(args?: SelectSubset<T, FeeFindFirstOrThrowArgs<ExtArgs>>): Prisma__FeeClient<$Result.GetResult<Prisma.$FeePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Fees that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Fees
     * const fees = await prisma.fee.findMany()
     * 
     * // Get first 10 Fees
     * const fees = await prisma.fee.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const feeWithIdOnly = await prisma.fee.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FeeFindManyArgs>(args?: SelectSubset<T, FeeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Fee.
     * @param {FeeCreateArgs} args - Arguments to create a Fee.
     * @example
     * // Create one Fee
     * const Fee = await prisma.fee.create({
     *   data: {
     *     // ... data to create a Fee
     *   }
     * })
     * 
     */
    create<T extends FeeCreateArgs>(args: SelectSubset<T, FeeCreateArgs<ExtArgs>>): Prisma__FeeClient<$Result.GetResult<Prisma.$FeePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Fees.
     * @param {FeeCreateManyArgs} args - Arguments to create many Fees.
     * @example
     * // Create many Fees
     * const fee = await prisma.fee.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FeeCreateManyArgs>(args?: SelectSubset<T, FeeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Fees and returns the data saved in the database.
     * @param {FeeCreateManyAndReturnArgs} args - Arguments to create many Fees.
     * @example
     * // Create many Fees
     * const fee = await prisma.fee.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Fees and only return the `id`
     * const feeWithIdOnly = await prisma.fee.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FeeCreateManyAndReturnArgs>(args?: SelectSubset<T, FeeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Fee.
     * @param {FeeDeleteArgs} args - Arguments to delete one Fee.
     * @example
     * // Delete one Fee
     * const Fee = await prisma.fee.delete({
     *   where: {
     *     // ... filter to delete one Fee
     *   }
     * })
     * 
     */
    delete<T extends FeeDeleteArgs>(args: SelectSubset<T, FeeDeleteArgs<ExtArgs>>): Prisma__FeeClient<$Result.GetResult<Prisma.$FeePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Fee.
     * @param {FeeUpdateArgs} args - Arguments to update one Fee.
     * @example
     * // Update one Fee
     * const fee = await prisma.fee.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FeeUpdateArgs>(args: SelectSubset<T, FeeUpdateArgs<ExtArgs>>): Prisma__FeeClient<$Result.GetResult<Prisma.$FeePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Fees.
     * @param {FeeDeleteManyArgs} args - Arguments to filter Fees to delete.
     * @example
     * // Delete a few Fees
     * const { count } = await prisma.fee.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FeeDeleteManyArgs>(args?: SelectSubset<T, FeeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Fees.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Fees
     * const fee = await prisma.fee.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FeeUpdateManyArgs>(args: SelectSubset<T, FeeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Fees and returns the data updated in the database.
     * @param {FeeUpdateManyAndReturnArgs} args - Arguments to update many Fees.
     * @example
     * // Update many Fees
     * const fee = await prisma.fee.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Fees and only return the `id`
     * const feeWithIdOnly = await prisma.fee.updateManyAndReturn({
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
    updateManyAndReturn<T extends FeeUpdateManyAndReturnArgs>(args: SelectSubset<T, FeeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Fee.
     * @param {FeeUpsertArgs} args - Arguments to update or create a Fee.
     * @example
     * // Update or create a Fee
     * const fee = await prisma.fee.upsert({
     *   create: {
     *     // ... data to create a Fee
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Fee we want to update
     *   }
     * })
     */
    upsert<T extends FeeUpsertArgs>(args: SelectSubset<T, FeeUpsertArgs<ExtArgs>>): Prisma__FeeClient<$Result.GetResult<Prisma.$FeePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Fees.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeeCountArgs} args - Arguments to filter Fees to count.
     * @example
     * // Count the number of Fees
     * const count = await prisma.fee.count({
     *   where: {
     *     // ... the filter for the Fees we want to count
     *   }
     * })
    **/
    count<T extends FeeCountArgs>(
      args?: Subset<T, FeeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FeeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Fee.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FeeAggregateArgs>(args: Subset<T, FeeAggregateArgs>): Prisma.PrismaPromise<GetFeeAggregateType<T>>

    /**
     * Group by Fee.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeeGroupByArgs} args - Group by arguments.
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
      T extends FeeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FeeGroupByArgs['orderBy'] }
        : { orderBy?: FeeGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, FeeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFeeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Fee model
   */
  readonly fields: FeeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Fee.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FeeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the Fee model
   */
  interface FeeFieldRefs {
    readonly id: FieldRef<"Fee", 'Int'>
    readonly amount: FieldRef<"Fee", 'Decimal'>
    readonly category: FieldRef<"Fee", 'String'>
    readonly level: FieldRef<"Fee", 'Int'>
    readonly effectiveDate: FieldRef<"Fee", 'DateTime'>
    readonly createdAt: FieldRef<"Fee", 'DateTime'>
    readonly updatedAt: FieldRef<"Fee", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Fee findUnique
   */
  export type FeeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fee
     */
    select?: FeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fee
     */
    omit?: FeeOmit<ExtArgs> | null
    /**
     * Filter, which Fee to fetch.
     */
    where: FeeWhereUniqueInput
  }

  /**
   * Fee findUniqueOrThrow
   */
  export type FeeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fee
     */
    select?: FeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fee
     */
    omit?: FeeOmit<ExtArgs> | null
    /**
     * Filter, which Fee to fetch.
     */
    where: FeeWhereUniqueInput
  }

  /**
   * Fee findFirst
   */
  export type FeeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fee
     */
    select?: FeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fee
     */
    omit?: FeeOmit<ExtArgs> | null
    /**
     * Filter, which Fee to fetch.
     */
    where?: FeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fees to fetch.
     */
    orderBy?: FeeOrderByWithRelationInput | FeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Fees.
     */
    cursor?: FeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Fees.
     */
    distinct?: FeeScalarFieldEnum | FeeScalarFieldEnum[]
  }

  /**
   * Fee findFirstOrThrow
   */
  export type FeeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fee
     */
    select?: FeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fee
     */
    omit?: FeeOmit<ExtArgs> | null
    /**
     * Filter, which Fee to fetch.
     */
    where?: FeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fees to fetch.
     */
    orderBy?: FeeOrderByWithRelationInput | FeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Fees.
     */
    cursor?: FeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Fees.
     */
    distinct?: FeeScalarFieldEnum | FeeScalarFieldEnum[]
  }

  /**
   * Fee findMany
   */
  export type FeeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fee
     */
    select?: FeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fee
     */
    omit?: FeeOmit<ExtArgs> | null
    /**
     * Filter, which Fees to fetch.
     */
    where?: FeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fees to fetch.
     */
    orderBy?: FeeOrderByWithRelationInput | FeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Fees.
     */
    cursor?: FeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fees.
     */
    skip?: number
    distinct?: FeeScalarFieldEnum | FeeScalarFieldEnum[]
  }

  /**
   * Fee create
   */
  export type FeeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fee
     */
    select?: FeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fee
     */
    omit?: FeeOmit<ExtArgs> | null
    /**
     * The data needed to create a Fee.
     */
    data: XOR<FeeCreateInput, FeeUncheckedCreateInput>
  }

  /**
   * Fee createMany
   */
  export type FeeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Fees.
     */
    data: FeeCreateManyInput | FeeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Fee createManyAndReturn
   */
  export type FeeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fee
     */
    select?: FeeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Fee
     */
    omit?: FeeOmit<ExtArgs> | null
    /**
     * The data used to create many Fees.
     */
    data: FeeCreateManyInput | FeeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Fee update
   */
  export type FeeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fee
     */
    select?: FeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fee
     */
    omit?: FeeOmit<ExtArgs> | null
    /**
     * The data needed to update a Fee.
     */
    data: XOR<FeeUpdateInput, FeeUncheckedUpdateInput>
    /**
     * Choose, which Fee to update.
     */
    where: FeeWhereUniqueInput
  }

  /**
   * Fee updateMany
   */
  export type FeeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Fees.
     */
    data: XOR<FeeUpdateManyMutationInput, FeeUncheckedUpdateManyInput>
    /**
     * Filter which Fees to update
     */
    where?: FeeWhereInput
    /**
     * Limit how many Fees to update.
     */
    limit?: number
  }

  /**
   * Fee updateManyAndReturn
   */
  export type FeeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fee
     */
    select?: FeeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Fee
     */
    omit?: FeeOmit<ExtArgs> | null
    /**
     * The data used to update Fees.
     */
    data: XOR<FeeUpdateManyMutationInput, FeeUncheckedUpdateManyInput>
    /**
     * Filter which Fees to update
     */
    where?: FeeWhereInput
    /**
     * Limit how many Fees to update.
     */
    limit?: number
  }

  /**
   * Fee upsert
   */
  export type FeeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fee
     */
    select?: FeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fee
     */
    omit?: FeeOmit<ExtArgs> | null
    /**
     * The filter to search for the Fee to update in case it exists.
     */
    where: FeeWhereUniqueInput
    /**
     * In case the Fee found by the `where` argument doesn't exist, create a new Fee with this data.
     */
    create: XOR<FeeCreateInput, FeeUncheckedCreateInput>
    /**
     * In case the Fee was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FeeUpdateInput, FeeUncheckedUpdateInput>
  }

  /**
   * Fee delete
   */
  export type FeeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fee
     */
    select?: FeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fee
     */
    omit?: FeeOmit<ExtArgs> | null
    /**
     * Filter which Fee to delete.
     */
    where: FeeWhereUniqueInput
  }

  /**
   * Fee deleteMany
   */
  export type FeeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Fees to delete
     */
    where?: FeeWhereInput
    /**
     * Limit how many Fees to delete.
     */
    limit?: number
  }

  /**
   * Fee without action
   */
  export type FeeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fee
     */
    select?: FeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Fee
     */
    omit?: FeeOmit<ExtArgs> | null
  }


  /**
   * Model Driver
   */

  export type AggregateDriver = {
    _count: DriverCountAggregateOutputType | null
    _min: DriverMinAggregateOutputType | null
    _max: DriverMaxAggregateOutputType | null
  }

  export type DriverMinAggregateOutputType = {
    id: string | null
    firstName: string | null
    middleName: string | null
    lastName: string | null
    address: string | null
    licenseNumber: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DriverMaxAggregateOutputType = {
    id: string | null
    firstName: string | null
    middleName: string | null
    lastName: string | null
    address: string | null
    licenseNumber: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DriverCountAggregateOutputType = {
    id: number
    firstName: number
    middleName: number
    lastName: number
    address: number
    licenseNumber: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DriverMinAggregateInputType = {
    id?: true
    firstName?: true
    middleName?: true
    lastName?: true
    address?: true
    licenseNumber?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DriverMaxAggregateInputType = {
    id?: true
    firstName?: true
    middleName?: true
    lastName?: true
    address?: true
    licenseNumber?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DriverCountAggregateInputType = {
    id?: true
    firstName?: true
    middleName?: true
    lastName?: true
    address?: true
    licenseNumber?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DriverAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Driver to aggregate.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Drivers
    **/
    _count?: true | DriverCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DriverMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DriverMaxAggregateInputType
  }

  export type GetDriverAggregateType<T extends DriverAggregateArgs> = {
        [P in keyof T & keyof AggregateDriver]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDriver[P]>
      : GetScalarType<T[P], AggregateDriver[P]>
  }




  export type DriverGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DriverWhereInput
    orderBy?: DriverOrderByWithAggregationInput | DriverOrderByWithAggregationInput[]
    by: DriverScalarFieldEnum[] | DriverScalarFieldEnum
    having?: DriverScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DriverCountAggregateInputType | true
    _min?: DriverMinAggregateInputType
    _max?: DriverMaxAggregateInputType
  }

  export type DriverGroupByOutputType = {
    id: string
    firstName: string
    middleName: string | null
    lastName: string
    address: string
    licenseNumber: string
    createdAt: Date | null
    updatedAt: Date | null
    _count: DriverCountAggregateOutputType | null
    _min: DriverMinAggregateOutputType | null
    _max: DriverMaxAggregateOutputType | null
  }

  type GetDriverGroupByPayload<T extends DriverGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DriverGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DriverGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DriverGroupByOutputType[P]>
            : GetScalarType<T[P], DriverGroupByOutputType[P]>
        }
      >
    >


  export type DriverSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    address?: boolean
    licenseNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    violations?: boolean | Driver$violationsArgs<ExtArgs>
    _count?: boolean | DriverCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["driver"]>

  export type DriverSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    address?: boolean
    licenseNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["driver"]>

  export type DriverSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    address?: boolean
    licenseNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["driver"]>

  export type DriverSelectScalar = {
    id?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    address?: boolean
    licenseNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DriverOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "firstName" | "middleName" | "lastName" | "address" | "licenseNumber" | "createdAt" | "updatedAt", ExtArgs["result"]["driver"]>
  export type DriverInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    violations?: boolean | Driver$violationsArgs<ExtArgs>
    _count?: boolean | DriverCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DriverIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type DriverIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DriverPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Driver"
    objects: {
      violations: Prisma.$ViolationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      firstName: string
      middleName: string | null
      lastName: string
      address: string
      licenseNumber: string
      createdAt: Date | null
      updatedAt: Date | null
    }, ExtArgs["result"]["driver"]>
    composites: {}
  }

  type DriverGetPayload<S extends boolean | null | undefined | DriverDefaultArgs> = $Result.GetResult<Prisma.$DriverPayload, S>

  type DriverCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DriverFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DriverCountAggregateInputType | true
    }

  export interface DriverDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Driver'], meta: { name: 'Driver' } }
    /**
     * Find zero or one Driver that matches the filter.
     * @param {DriverFindUniqueArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DriverFindUniqueArgs>(args: SelectSubset<T, DriverFindUniqueArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Driver that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DriverFindUniqueOrThrowArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DriverFindUniqueOrThrowArgs>(args: SelectSubset<T, DriverFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Driver that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindFirstArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DriverFindFirstArgs>(args?: SelectSubset<T, DriverFindFirstArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Driver that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindFirstOrThrowArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DriverFindFirstOrThrowArgs>(args?: SelectSubset<T, DriverFindFirstOrThrowArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Drivers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Drivers
     * const drivers = await prisma.driver.findMany()
     * 
     * // Get first 10 Drivers
     * const drivers = await prisma.driver.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const driverWithIdOnly = await prisma.driver.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DriverFindManyArgs>(args?: SelectSubset<T, DriverFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Driver.
     * @param {DriverCreateArgs} args - Arguments to create a Driver.
     * @example
     * // Create one Driver
     * const Driver = await prisma.driver.create({
     *   data: {
     *     // ... data to create a Driver
     *   }
     * })
     * 
     */
    create<T extends DriverCreateArgs>(args: SelectSubset<T, DriverCreateArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Drivers.
     * @param {DriverCreateManyArgs} args - Arguments to create many Drivers.
     * @example
     * // Create many Drivers
     * const driver = await prisma.driver.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DriverCreateManyArgs>(args?: SelectSubset<T, DriverCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Drivers and returns the data saved in the database.
     * @param {DriverCreateManyAndReturnArgs} args - Arguments to create many Drivers.
     * @example
     * // Create many Drivers
     * const driver = await prisma.driver.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Drivers and only return the `id`
     * const driverWithIdOnly = await prisma.driver.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DriverCreateManyAndReturnArgs>(args?: SelectSubset<T, DriverCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Driver.
     * @param {DriverDeleteArgs} args - Arguments to delete one Driver.
     * @example
     * // Delete one Driver
     * const Driver = await prisma.driver.delete({
     *   where: {
     *     // ... filter to delete one Driver
     *   }
     * })
     * 
     */
    delete<T extends DriverDeleteArgs>(args: SelectSubset<T, DriverDeleteArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Driver.
     * @param {DriverUpdateArgs} args - Arguments to update one Driver.
     * @example
     * // Update one Driver
     * const driver = await prisma.driver.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DriverUpdateArgs>(args: SelectSubset<T, DriverUpdateArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Drivers.
     * @param {DriverDeleteManyArgs} args - Arguments to filter Drivers to delete.
     * @example
     * // Delete a few Drivers
     * const { count } = await prisma.driver.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DriverDeleteManyArgs>(args?: SelectSubset<T, DriverDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Drivers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Drivers
     * const driver = await prisma.driver.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DriverUpdateManyArgs>(args: SelectSubset<T, DriverUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Drivers and returns the data updated in the database.
     * @param {DriverUpdateManyAndReturnArgs} args - Arguments to update many Drivers.
     * @example
     * // Update many Drivers
     * const driver = await prisma.driver.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Drivers and only return the `id`
     * const driverWithIdOnly = await prisma.driver.updateManyAndReturn({
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
    updateManyAndReturn<T extends DriverUpdateManyAndReturnArgs>(args: SelectSubset<T, DriverUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Driver.
     * @param {DriverUpsertArgs} args - Arguments to update or create a Driver.
     * @example
     * // Update or create a Driver
     * const driver = await prisma.driver.upsert({
     *   create: {
     *     // ... data to create a Driver
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Driver we want to update
     *   }
     * })
     */
    upsert<T extends DriverUpsertArgs>(args: SelectSubset<T, DriverUpsertArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Drivers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverCountArgs} args - Arguments to filter Drivers to count.
     * @example
     * // Count the number of Drivers
     * const count = await prisma.driver.count({
     *   where: {
     *     // ... the filter for the Drivers we want to count
     *   }
     * })
    **/
    count<T extends DriverCountArgs>(
      args?: Subset<T, DriverCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DriverCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Driver.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DriverAggregateArgs>(args: Subset<T, DriverAggregateArgs>): Prisma.PrismaPromise<GetDriverAggregateType<T>>

    /**
     * Group by Driver.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverGroupByArgs} args - Group by arguments.
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
      T extends DriverGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DriverGroupByArgs['orderBy'] }
        : { orderBy?: DriverGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DriverGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDriverGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Driver model
   */
  readonly fields: DriverFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Driver.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DriverClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    violations<T extends Driver$violationsArgs<ExtArgs> = {}>(args?: Subset<T, Driver$violationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ViolationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Driver model
   */
  interface DriverFieldRefs {
    readonly id: FieldRef<"Driver", 'String'>
    readonly firstName: FieldRef<"Driver", 'String'>
    readonly middleName: FieldRef<"Driver", 'String'>
    readonly lastName: FieldRef<"Driver", 'String'>
    readonly address: FieldRef<"Driver", 'String'>
    readonly licenseNumber: FieldRef<"Driver", 'String'>
    readonly createdAt: FieldRef<"Driver", 'DateTime'>
    readonly updatedAt: FieldRef<"Driver", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Driver findUnique
   */
  export type DriverFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver findUniqueOrThrow
   */
  export type DriverFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver findFirst
   */
  export type DriverFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Drivers.
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Drivers.
     */
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[]
  }

  /**
   * Driver findFirstOrThrow
   */
  export type DriverFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Drivers.
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Drivers.
     */
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[]
  }

  /**
   * Driver findMany
   */
  export type DriverFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Drivers to fetch.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Drivers.
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[]
  }

  /**
   * Driver create
   */
  export type DriverCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * The data needed to create a Driver.
     */
    data: XOR<DriverCreateInput, DriverUncheckedCreateInput>
  }

  /**
   * Driver createMany
   */
  export type DriverCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Drivers.
     */
    data: DriverCreateManyInput | DriverCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Driver createManyAndReturn
   */
  export type DriverCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null
    /**
     * The data used to create many Drivers.
     */
    data: DriverCreateManyInput | DriverCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Driver update
   */
  export type DriverUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * The data needed to update a Driver.
     */
    data: XOR<DriverUpdateInput, DriverUncheckedUpdateInput>
    /**
     * Choose, which Driver to update.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver updateMany
   */
  export type DriverUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Drivers.
     */
    data: XOR<DriverUpdateManyMutationInput, DriverUncheckedUpdateManyInput>
    /**
     * Filter which Drivers to update
     */
    where?: DriverWhereInput
    /**
     * Limit how many Drivers to update.
     */
    limit?: number
  }

  /**
   * Driver updateManyAndReturn
   */
  export type DriverUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null
    /**
     * The data used to update Drivers.
     */
    data: XOR<DriverUpdateManyMutationInput, DriverUncheckedUpdateManyInput>
    /**
     * Filter which Drivers to update
     */
    where?: DriverWhereInput
    /**
     * Limit how many Drivers to update.
     */
    limit?: number
  }

  /**
   * Driver upsert
   */
  export type DriverUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * The filter to search for the Driver to update in case it exists.
     */
    where: DriverWhereUniqueInput
    /**
     * In case the Driver found by the `where` argument doesn't exist, create a new Driver with this data.
     */
    create: XOR<DriverCreateInput, DriverUncheckedCreateInput>
    /**
     * In case the Driver was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DriverUpdateInput, DriverUncheckedUpdateInput>
  }

  /**
   * Driver delete
   */
  export type DriverDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter which Driver to delete.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver deleteMany
   */
  export type DriverDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Drivers to delete
     */
    where?: DriverWhereInput
    /**
     * Limit how many Drivers to delete.
     */
    limit?: number
  }

  /**
   * Driver.violations
   */
  export type Driver$violationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationInclude<ExtArgs> | null
    where?: ViolationWhereInput
    orderBy?: ViolationOrderByWithRelationInput | ViolationOrderByWithRelationInput[]
    cursor?: ViolationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ViolationScalarFieldEnum | ViolationScalarFieldEnum[]
  }

  /**
   * Driver without action
   */
  export type DriverDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
  }


  /**
   * Model Record
   */

  export type AggregateRecord = {
    _count: RecordCountAggregateOutputType | null
    _avg: RecordAvgAggregateOutputType | null
    _sum: RecordSumAggregateOutputType | null
    _min: RecordMinAggregateOutputType | null
    _max: RecordMaxAggregateOutputType | null
  }

  export type RecordAvgAggregateOutputType = {
    id: number | null
  }

  export type RecordSumAggregateOutputType = {
    id: number | null
  }

  export type RecordMinAggregateOutputType = {
    id: number | null
    plateNumber: string | null
    vehicleType: string | null
    transportGroup: string | null
    operatorCompanyName: string | null
    operatorAddress: string | null
    ownerFirstName: string | null
    ownerMiddleName: string | null
    ownerLastName: string | null
    motorNo: string | null
    motorVehicleName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RecordMaxAggregateOutputType = {
    id: number | null
    plateNumber: string | null
    vehicleType: string | null
    transportGroup: string | null
    operatorCompanyName: string | null
    operatorAddress: string | null
    ownerFirstName: string | null
    ownerMiddleName: string | null
    ownerLastName: string | null
    motorNo: string | null
    motorVehicleName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RecordCountAggregateOutputType = {
    id: number
    plateNumber: number
    vehicleType: number
    transportGroup: number
    operatorCompanyName: number
    operatorAddress: number
    ownerFirstName: number
    ownerMiddleName: number
    ownerLastName: number
    motorNo: number
    motorVehicleName: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RecordAvgAggregateInputType = {
    id?: true
  }

  export type RecordSumAggregateInputType = {
    id?: true
  }

  export type RecordMinAggregateInputType = {
    id?: true
    plateNumber?: true
    vehicleType?: true
    transportGroup?: true
    operatorCompanyName?: true
    operatorAddress?: true
    ownerFirstName?: true
    ownerMiddleName?: true
    ownerLastName?: true
    motorNo?: true
    motorVehicleName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RecordMaxAggregateInputType = {
    id?: true
    plateNumber?: true
    vehicleType?: true
    transportGroup?: true
    operatorCompanyName?: true
    operatorAddress?: true
    ownerFirstName?: true
    ownerMiddleName?: true
    ownerLastName?: true
    motorNo?: true
    motorVehicleName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RecordCountAggregateInputType = {
    id?: true
    plateNumber?: true
    vehicleType?: true
    transportGroup?: true
    operatorCompanyName?: true
    operatorAddress?: true
    ownerFirstName?: true
    ownerMiddleName?: true
    ownerLastName?: true
    motorNo?: true
    motorVehicleName?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RecordAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Record to aggregate.
     */
    where?: RecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Records to fetch.
     */
    orderBy?: RecordOrderByWithRelationInput | RecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Records from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Records.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Records
    **/
    _count?: true | RecordCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RecordAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RecordSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RecordMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RecordMaxAggregateInputType
  }

  export type GetRecordAggregateType<T extends RecordAggregateArgs> = {
        [P in keyof T & keyof AggregateRecord]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRecord[P]>
      : GetScalarType<T[P], AggregateRecord[P]>
  }




  export type RecordGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecordWhereInput
    orderBy?: RecordOrderByWithAggregationInput | RecordOrderByWithAggregationInput[]
    by: RecordScalarFieldEnum[] | RecordScalarFieldEnum
    having?: RecordScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RecordCountAggregateInputType | true
    _avg?: RecordAvgAggregateInputType
    _sum?: RecordSumAggregateInputType
    _min?: RecordMinAggregateInputType
    _max?: RecordMaxAggregateInputType
  }

  export type RecordGroupByOutputType = {
    id: number
    plateNumber: string
    vehicleType: string
    transportGroup: string | null
    operatorCompanyName: string
    operatorAddress: string | null
    ownerFirstName: string | null
    ownerMiddleName: string | null
    ownerLastName: string | null
    motorNo: string | null
    motorVehicleName: string | null
    createdAt: Date | null
    updatedAt: Date | null
    _count: RecordCountAggregateOutputType | null
    _avg: RecordAvgAggregateOutputType | null
    _sum: RecordSumAggregateOutputType | null
    _min: RecordMinAggregateOutputType | null
    _max: RecordMaxAggregateOutputType | null
  }

  type GetRecordGroupByPayload<T extends RecordGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RecordGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RecordGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RecordGroupByOutputType[P]>
            : GetScalarType<T[P], RecordGroupByOutputType[P]>
        }
      >
    >


  export type RecordSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    plateNumber?: boolean
    vehicleType?: boolean
    transportGroup?: boolean
    operatorCompanyName?: boolean
    operatorAddress?: boolean
    ownerFirstName?: boolean
    ownerMiddleName?: boolean
    ownerLastName?: boolean
    motorNo?: boolean
    motorVehicleName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    recordHistory?: boolean | Record$recordHistoryArgs<ExtArgs>
    violations?: boolean | Record$violationsArgs<ExtArgs>
    _count?: boolean | RecordCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["record"]>

  export type RecordSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    plateNumber?: boolean
    vehicleType?: boolean
    transportGroup?: boolean
    operatorCompanyName?: boolean
    operatorAddress?: boolean
    ownerFirstName?: boolean
    ownerMiddleName?: boolean
    ownerLastName?: boolean
    motorNo?: boolean
    motorVehicleName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["record"]>

  export type RecordSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    plateNumber?: boolean
    vehicleType?: boolean
    transportGroup?: boolean
    operatorCompanyName?: boolean
    operatorAddress?: boolean
    ownerFirstName?: boolean
    ownerMiddleName?: boolean
    ownerLastName?: boolean
    motorNo?: boolean
    motorVehicleName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["record"]>

  export type RecordSelectScalar = {
    id?: boolean
    plateNumber?: boolean
    vehicleType?: boolean
    transportGroup?: boolean
    operatorCompanyName?: boolean
    operatorAddress?: boolean
    ownerFirstName?: boolean
    ownerMiddleName?: boolean
    ownerLastName?: boolean
    motorNo?: boolean
    motorVehicleName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RecordOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "plateNumber" | "vehicleType" | "transportGroup" | "operatorCompanyName" | "operatorAddress" | "ownerFirstName" | "ownerMiddleName" | "ownerLastName" | "motorNo" | "motorVehicleName" | "createdAt" | "updatedAt", ExtArgs["result"]["record"]>
  export type RecordInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recordHistory?: boolean | Record$recordHistoryArgs<ExtArgs>
    violations?: boolean | Record$violationsArgs<ExtArgs>
    _count?: boolean | RecordCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RecordIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type RecordIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RecordPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Record"
    objects: {
      recordHistory: Prisma.$RecordHistoryPayload<ExtArgs>[]
      violations: Prisma.$ViolationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      plateNumber: string
      vehicleType: string
      transportGroup: string | null
      operatorCompanyName: string
      operatorAddress: string | null
      ownerFirstName: string | null
      ownerMiddleName: string | null
      ownerLastName: string | null
      motorNo: string | null
      motorVehicleName: string | null
      createdAt: Date | null
      updatedAt: Date | null
    }, ExtArgs["result"]["record"]>
    composites: {}
  }

  type RecordGetPayload<S extends boolean | null | undefined | RecordDefaultArgs> = $Result.GetResult<Prisma.$RecordPayload, S>

  type RecordCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RecordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RecordCountAggregateInputType | true
    }

  export interface RecordDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Record'], meta: { name: 'Record' } }
    /**
     * Find zero or one Record that matches the filter.
     * @param {RecordFindUniqueArgs} args - Arguments to find a Record
     * @example
     * // Get one Record
     * const record = await prisma.record.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RecordFindUniqueArgs>(args: SelectSubset<T, RecordFindUniqueArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Record that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RecordFindUniqueOrThrowArgs} args - Arguments to find a Record
     * @example
     * // Get one Record
     * const record = await prisma.record.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RecordFindUniqueOrThrowArgs>(args: SelectSubset<T, RecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Record that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordFindFirstArgs} args - Arguments to find a Record
     * @example
     * // Get one Record
     * const record = await prisma.record.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RecordFindFirstArgs>(args?: SelectSubset<T, RecordFindFirstArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Record that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordFindFirstOrThrowArgs} args - Arguments to find a Record
     * @example
     * // Get one Record
     * const record = await prisma.record.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RecordFindFirstOrThrowArgs>(args?: SelectSubset<T, RecordFindFirstOrThrowArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Records that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Records
     * const records = await prisma.record.findMany()
     * 
     * // Get first 10 Records
     * const records = await prisma.record.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const recordWithIdOnly = await prisma.record.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RecordFindManyArgs>(args?: SelectSubset<T, RecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Record.
     * @param {RecordCreateArgs} args - Arguments to create a Record.
     * @example
     * // Create one Record
     * const Record = await prisma.record.create({
     *   data: {
     *     // ... data to create a Record
     *   }
     * })
     * 
     */
    create<T extends RecordCreateArgs>(args: SelectSubset<T, RecordCreateArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Records.
     * @param {RecordCreateManyArgs} args - Arguments to create many Records.
     * @example
     * // Create many Records
     * const record = await prisma.record.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RecordCreateManyArgs>(args?: SelectSubset<T, RecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Records and returns the data saved in the database.
     * @param {RecordCreateManyAndReturnArgs} args - Arguments to create many Records.
     * @example
     * // Create many Records
     * const record = await prisma.record.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Records and only return the `id`
     * const recordWithIdOnly = await prisma.record.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RecordCreateManyAndReturnArgs>(args?: SelectSubset<T, RecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Record.
     * @param {RecordDeleteArgs} args - Arguments to delete one Record.
     * @example
     * // Delete one Record
     * const Record = await prisma.record.delete({
     *   where: {
     *     // ... filter to delete one Record
     *   }
     * })
     * 
     */
    delete<T extends RecordDeleteArgs>(args: SelectSubset<T, RecordDeleteArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Record.
     * @param {RecordUpdateArgs} args - Arguments to update one Record.
     * @example
     * // Update one Record
     * const record = await prisma.record.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RecordUpdateArgs>(args: SelectSubset<T, RecordUpdateArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Records.
     * @param {RecordDeleteManyArgs} args - Arguments to filter Records to delete.
     * @example
     * // Delete a few Records
     * const { count } = await prisma.record.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RecordDeleteManyArgs>(args?: SelectSubset<T, RecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Records.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Records
     * const record = await prisma.record.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RecordUpdateManyArgs>(args: SelectSubset<T, RecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Records and returns the data updated in the database.
     * @param {RecordUpdateManyAndReturnArgs} args - Arguments to update many Records.
     * @example
     * // Update many Records
     * const record = await prisma.record.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Records and only return the `id`
     * const recordWithIdOnly = await prisma.record.updateManyAndReturn({
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
    updateManyAndReturn<T extends RecordUpdateManyAndReturnArgs>(args: SelectSubset<T, RecordUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Record.
     * @param {RecordUpsertArgs} args - Arguments to update or create a Record.
     * @example
     * // Update or create a Record
     * const record = await prisma.record.upsert({
     *   create: {
     *     // ... data to create a Record
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Record we want to update
     *   }
     * })
     */
    upsert<T extends RecordUpsertArgs>(args: SelectSubset<T, RecordUpsertArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Records.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordCountArgs} args - Arguments to filter Records to count.
     * @example
     * // Count the number of Records
     * const count = await prisma.record.count({
     *   where: {
     *     // ... the filter for the Records we want to count
     *   }
     * })
    **/
    count<T extends RecordCountArgs>(
      args?: Subset<T, RecordCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RecordCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Record.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends RecordAggregateArgs>(args: Subset<T, RecordAggregateArgs>): Prisma.PrismaPromise<GetRecordAggregateType<T>>

    /**
     * Group by Record.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordGroupByArgs} args - Group by arguments.
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
      T extends RecordGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RecordGroupByArgs['orderBy'] }
        : { orderBy?: RecordGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, RecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Record model
   */
  readonly fields: RecordFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Record.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RecordClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    recordHistory<T extends Record$recordHistoryArgs<ExtArgs> = {}>(args?: Subset<T, Record$recordHistoryArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    violations<T extends Record$violationsArgs<ExtArgs> = {}>(args?: Subset<T, Record$violationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ViolationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Record model
   */
  interface RecordFieldRefs {
    readonly id: FieldRef<"Record", 'Int'>
    readonly plateNumber: FieldRef<"Record", 'String'>
    readonly vehicleType: FieldRef<"Record", 'String'>
    readonly transportGroup: FieldRef<"Record", 'String'>
    readonly operatorCompanyName: FieldRef<"Record", 'String'>
    readonly operatorAddress: FieldRef<"Record", 'String'>
    readonly ownerFirstName: FieldRef<"Record", 'String'>
    readonly ownerMiddleName: FieldRef<"Record", 'String'>
    readonly ownerLastName: FieldRef<"Record", 'String'>
    readonly motorNo: FieldRef<"Record", 'String'>
    readonly motorVehicleName: FieldRef<"Record", 'String'>
    readonly createdAt: FieldRef<"Record", 'DateTime'>
    readonly updatedAt: FieldRef<"Record", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Record findUnique
   */
  export type RecordFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * Filter, which Record to fetch.
     */
    where: RecordWhereUniqueInput
  }

  /**
   * Record findUniqueOrThrow
   */
  export type RecordFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * Filter, which Record to fetch.
     */
    where: RecordWhereUniqueInput
  }

  /**
   * Record findFirst
   */
  export type RecordFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * Filter, which Record to fetch.
     */
    where?: RecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Records to fetch.
     */
    orderBy?: RecordOrderByWithRelationInput | RecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Records.
     */
    cursor?: RecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Records from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Records.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Records.
     */
    distinct?: RecordScalarFieldEnum | RecordScalarFieldEnum[]
  }

  /**
   * Record findFirstOrThrow
   */
  export type RecordFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * Filter, which Record to fetch.
     */
    where?: RecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Records to fetch.
     */
    orderBy?: RecordOrderByWithRelationInput | RecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Records.
     */
    cursor?: RecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Records from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Records.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Records.
     */
    distinct?: RecordScalarFieldEnum | RecordScalarFieldEnum[]
  }

  /**
   * Record findMany
   */
  export type RecordFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * Filter, which Records to fetch.
     */
    where?: RecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Records to fetch.
     */
    orderBy?: RecordOrderByWithRelationInput | RecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Records.
     */
    cursor?: RecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Records from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Records.
     */
    skip?: number
    distinct?: RecordScalarFieldEnum | RecordScalarFieldEnum[]
  }

  /**
   * Record create
   */
  export type RecordCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * The data needed to create a Record.
     */
    data: XOR<RecordCreateInput, RecordUncheckedCreateInput>
  }

  /**
   * Record createMany
   */
  export type RecordCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Records.
     */
    data: RecordCreateManyInput | RecordCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Record createManyAndReturn
   */
  export type RecordCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * The data used to create many Records.
     */
    data: RecordCreateManyInput | RecordCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Record update
   */
  export type RecordUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * The data needed to update a Record.
     */
    data: XOR<RecordUpdateInput, RecordUncheckedUpdateInput>
    /**
     * Choose, which Record to update.
     */
    where: RecordWhereUniqueInput
  }

  /**
   * Record updateMany
   */
  export type RecordUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Records.
     */
    data: XOR<RecordUpdateManyMutationInput, RecordUncheckedUpdateManyInput>
    /**
     * Filter which Records to update
     */
    where?: RecordWhereInput
    /**
     * Limit how many Records to update.
     */
    limit?: number
  }

  /**
   * Record updateManyAndReturn
   */
  export type RecordUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * The data used to update Records.
     */
    data: XOR<RecordUpdateManyMutationInput, RecordUncheckedUpdateManyInput>
    /**
     * Filter which Records to update
     */
    where?: RecordWhereInput
    /**
     * Limit how many Records to update.
     */
    limit?: number
  }

  /**
   * Record upsert
   */
  export type RecordUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * The filter to search for the Record to update in case it exists.
     */
    where: RecordWhereUniqueInput
    /**
     * In case the Record found by the `where` argument doesn't exist, create a new Record with this data.
     */
    create: XOR<RecordCreateInput, RecordUncheckedCreateInput>
    /**
     * In case the Record was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RecordUpdateInput, RecordUncheckedUpdateInput>
  }

  /**
   * Record delete
   */
  export type RecordDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * Filter which Record to delete.
     */
    where: RecordWhereUniqueInput
  }

  /**
   * Record deleteMany
   */
  export type RecordDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Records to delete
     */
    where?: RecordWhereInput
    /**
     * Limit how many Records to delete.
     */
    limit?: number
  }

  /**
   * Record.recordHistory
   */
  export type Record$recordHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordHistory
     */
    select?: RecordHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordHistory
     */
    omit?: RecordHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordHistoryInclude<ExtArgs> | null
    where?: RecordHistoryWhereInput
    orderBy?: RecordHistoryOrderByWithRelationInput | RecordHistoryOrderByWithRelationInput[]
    cursor?: RecordHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RecordHistoryScalarFieldEnum | RecordHistoryScalarFieldEnum[]
  }

  /**
   * Record.violations
   */
  export type Record$violationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationInclude<ExtArgs> | null
    where?: ViolationWhereInput
    orderBy?: ViolationOrderByWithRelationInput | ViolationOrderByWithRelationInput[]
    cursor?: ViolationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ViolationScalarFieldEnum | ViolationScalarFieldEnum[]
  }

  /**
   * Record without action
   */
  export type RecordDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
  }


  /**
   * Model Violation
   */

  export type AggregateViolation = {
    _count: ViolationCountAggregateOutputType | null
    _avg: ViolationAvgAggregateOutputType | null
    _sum: ViolationSumAggregateOutputType | null
    _min: ViolationMinAggregateOutputType | null
    _max: ViolationMaxAggregateOutputType | null
  }

  export type ViolationAvgAggregateOutputType = {
    id: number | null
    recordId: number | null
  }

  export type ViolationSumAggregateOutputType = {
    id: number | null
    recordId: number | null
  }

  export type ViolationMinAggregateOutputType = {
    id: number | null
    recordId: number | null
    ordinanceInfractionReportNo: string | null
    smokeDensityTestResultNo: string | null
    placeOfApprehension: string | null
    dateOfApprehension: Date | null
    paidDriver: boolean | null
    paidOperator: boolean | null
    driverId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ViolationMaxAggregateOutputType = {
    id: number | null
    recordId: number | null
    ordinanceInfractionReportNo: string | null
    smokeDensityTestResultNo: string | null
    placeOfApprehension: string | null
    dateOfApprehension: Date | null
    paidDriver: boolean | null
    paidOperator: boolean | null
    driverId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ViolationCountAggregateOutputType = {
    id: number
    recordId: number
    ordinanceInfractionReportNo: number
    smokeDensityTestResultNo: number
    placeOfApprehension: number
    dateOfApprehension: number
    paidDriver: number
    paidOperator: number
    driverId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ViolationAvgAggregateInputType = {
    id?: true
    recordId?: true
  }

  export type ViolationSumAggregateInputType = {
    id?: true
    recordId?: true
  }

  export type ViolationMinAggregateInputType = {
    id?: true
    recordId?: true
    ordinanceInfractionReportNo?: true
    smokeDensityTestResultNo?: true
    placeOfApprehension?: true
    dateOfApprehension?: true
    paidDriver?: true
    paidOperator?: true
    driverId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ViolationMaxAggregateInputType = {
    id?: true
    recordId?: true
    ordinanceInfractionReportNo?: true
    smokeDensityTestResultNo?: true
    placeOfApprehension?: true
    dateOfApprehension?: true
    paidDriver?: true
    paidOperator?: true
    driverId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ViolationCountAggregateInputType = {
    id?: true
    recordId?: true
    ordinanceInfractionReportNo?: true
    smokeDensityTestResultNo?: true
    placeOfApprehension?: true
    dateOfApprehension?: true
    paidDriver?: true
    paidOperator?: true
    driverId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ViolationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Violation to aggregate.
     */
    where?: ViolationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Violations to fetch.
     */
    orderBy?: ViolationOrderByWithRelationInput | ViolationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ViolationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Violations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Violations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Violations
    **/
    _count?: true | ViolationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ViolationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ViolationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ViolationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ViolationMaxAggregateInputType
  }

  export type GetViolationAggregateType<T extends ViolationAggregateArgs> = {
        [P in keyof T & keyof AggregateViolation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateViolation[P]>
      : GetScalarType<T[P], AggregateViolation[P]>
  }




  export type ViolationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ViolationWhereInput
    orderBy?: ViolationOrderByWithAggregationInput | ViolationOrderByWithAggregationInput[]
    by: ViolationScalarFieldEnum[] | ViolationScalarFieldEnum
    having?: ViolationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ViolationCountAggregateInputType | true
    _avg?: ViolationAvgAggregateInputType
    _sum?: ViolationSumAggregateInputType
    _min?: ViolationMinAggregateInputType
    _max?: ViolationMaxAggregateInputType
  }

  export type ViolationGroupByOutputType = {
    id: number
    recordId: number
    ordinanceInfractionReportNo: string | null
    smokeDensityTestResultNo: string | null
    placeOfApprehension: string
    dateOfApprehension: Date
    paidDriver: boolean | null
    paidOperator: boolean | null
    driverId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    _count: ViolationCountAggregateOutputType | null
    _avg: ViolationAvgAggregateOutputType | null
    _sum: ViolationSumAggregateOutputType | null
    _min: ViolationMinAggregateOutputType | null
    _max: ViolationMaxAggregateOutputType | null
  }

  type GetViolationGroupByPayload<T extends ViolationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ViolationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ViolationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ViolationGroupByOutputType[P]>
            : GetScalarType<T[P], ViolationGroupByOutputType[P]>
        }
      >
    >


  export type ViolationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recordId?: boolean
    ordinanceInfractionReportNo?: boolean
    smokeDensityTestResultNo?: boolean
    placeOfApprehension?: boolean
    dateOfApprehension?: boolean
    paidDriver?: boolean
    paidOperator?: boolean
    driverId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    driver?: boolean | Violation$driverArgs<ExtArgs>
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["violation"]>

  export type ViolationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recordId?: boolean
    ordinanceInfractionReportNo?: boolean
    smokeDensityTestResultNo?: boolean
    placeOfApprehension?: boolean
    dateOfApprehension?: boolean
    paidDriver?: boolean
    paidOperator?: boolean
    driverId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    driver?: boolean | Violation$driverArgs<ExtArgs>
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["violation"]>

  export type ViolationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recordId?: boolean
    ordinanceInfractionReportNo?: boolean
    smokeDensityTestResultNo?: boolean
    placeOfApprehension?: boolean
    dateOfApprehension?: boolean
    paidDriver?: boolean
    paidOperator?: boolean
    driverId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    driver?: boolean | Violation$driverArgs<ExtArgs>
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["violation"]>

  export type ViolationSelectScalar = {
    id?: boolean
    recordId?: boolean
    ordinanceInfractionReportNo?: boolean
    smokeDensityTestResultNo?: boolean
    placeOfApprehension?: boolean
    dateOfApprehension?: boolean
    paidDriver?: boolean
    paidOperator?: boolean
    driverId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ViolationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "recordId" | "ordinanceInfractionReportNo" | "smokeDensityTestResultNo" | "placeOfApprehension" | "dateOfApprehension" | "paidDriver" | "paidOperator" | "driverId" | "createdAt" | "updatedAt", ExtArgs["result"]["violation"]>
  export type ViolationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    driver?: boolean | Violation$driverArgs<ExtArgs>
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }
  export type ViolationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    driver?: boolean | Violation$driverArgs<ExtArgs>
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }
  export type ViolationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    driver?: boolean | Violation$driverArgs<ExtArgs>
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }

  export type $ViolationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Violation"
    objects: {
      driver: Prisma.$DriverPayload<ExtArgs> | null
      record: Prisma.$RecordPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      recordId: number
      ordinanceInfractionReportNo: string | null
      smokeDensityTestResultNo: string | null
      placeOfApprehension: string
      dateOfApprehension: Date
      paidDriver: boolean | null
      paidOperator: boolean | null
      driverId: string | null
      createdAt: Date | null
      updatedAt: Date | null
    }, ExtArgs["result"]["violation"]>
    composites: {}
  }

  type ViolationGetPayload<S extends boolean | null | undefined | ViolationDefaultArgs> = $Result.GetResult<Prisma.$ViolationPayload, S>

  type ViolationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ViolationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ViolationCountAggregateInputType | true
    }

  export interface ViolationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Violation'], meta: { name: 'Violation' } }
    /**
     * Find zero or one Violation that matches the filter.
     * @param {ViolationFindUniqueArgs} args - Arguments to find a Violation
     * @example
     * // Get one Violation
     * const violation = await prisma.violation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ViolationFindUniqueArgs>(args: SelectSubset<T, ViolationFindUniqueArgs<ExtArgs>>): Prisma__ViolationClient<$Result.GetResult<Prisma.$ViolationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Violation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ViolationFindUniqueOrThrowArgs} args - Arguments to find a Violation
     * @example
     * // Get one Violation
     * const violation = await prisma.violation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ViolationFindUniqueOrThrowArgs>(args: SelectSubset<T, ViolationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ViolationClient<$Result.GetResult<Prisma.$ViolationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Violation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ViolationFindFirstArgs} args - Arguments to find a Violation
     * @example
     * // Get one Violation
     * const violation = await prisma.violation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ViolationFindFirstArgs>(args?: SelectSubset<T, ViolationFindFirstArgs<ExtArgs>>): Prisma__ViolationClient<$Result.GetResult<Prisma.$ViolationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Violation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ViolationFindFirstOrThrowArgs} args - Arguments to find a Violation
     * @example
     * // Get one Violation
     * const violation = await prisma.violation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ViolationFindFirstOrThrowArgs>(args?: SelectSubset<T, ViolationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ViolationClient<$Result.GetResult<Prisma.$ViolationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Violations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ViolationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Violations
     * const violations = await prisma.violation.findMany()
     * 
     * // Get first 10 Violations
     * const violations = await prisma.violation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const violationWithIdOnly = await prisma.violation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ViolationFindManyArgs>(args?: SelectSubset<T, ViolationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ViolationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Violation.
     * @param {ViolationCreateArgs} args - Arguments to create a Violation.
     * @example
     * // Create one Violation
     * const Violation = await prisma.violation.create({
     *   data: {
     *     // ... data to create a Violation
     *   }
     * })
     * 
     */
    create<T extends ViolationCreateArgs>(args: SelectSubset<T, ViolationCreateArgs<ExtArgs>>): Prisma__ViolationClient<$Result.GetResult<Prisma.$ViolationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Violations.
     * @param {ViolationCreateManyArgs} args - Arguments to create many Violations.
     * @example
     * // Create many Violations
     * const violation = await prisma.violation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ViolationCreateManyArgs>(args?: SelectSubset<T, ViolationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Violations and returns the data saved in the database.
     * @param {ViolationCreateManyAndReturnArgs} args - Arguments to create many Violations.
     * @example
     * // Create many Violations
     * const violation = await prisma.violation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Violations and only return the `id`
     * const violationWithIdOnly = await prisma.violation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ViolationCreateManyAndReturnArgs>(args?: SelectSubset<T, ViolationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ViolationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Violation.
     * @param {ViolationDeleteArgs} args - Arguments to delete one Violation.
     * @example
     * // Delete one Violation
     * const Violation = await prisma.violation.delete({
     *   where: {
     *     // ... filter to delete one Violation
     *   }
     * })
     * 
     */
    delete<T extends ViolationDeleteArgs>(args: SelectSubset<T, ViolationDeleteArgs<ExtArgs>>): Prisma__ViolationClient<$Result.GetResult<Prisma.$ViolationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Violation.
     * @param {ViolationUpdateArgs} args - Arguments to update one Violation.
     * @example
     * // Update one Violation
     * const violation = await prisma.violation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ViolationUpdateArgs>(args: SelectSubset<T, ViolationUpdateArgs<ExtArgs>>): Prisma__ViolationClient<$Result.GetResult<Prisma.$ViolationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Violations.
     * @param {ViolationDeleteManyArgs} args - Arguments to filter Violations to delete.
     * @example
     * // Delete a few Violations
     * const { count } = await prisma.violation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ViolationDeleteManyArgs>(args?: SelectSubset<T, ViolationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Violations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ViolationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Violations
     * const violation = await prisma.violation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ViolationUpdateManyArgs>(args: SelectSubset<T, ViolationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Violations and returns the data updated in the database.
     * @param {ViolationUpdateManyAndReturnArgs} args - Arguments to update many Violations.
     * @example
     * // Update many Violations
     * const violation = await prisma.violation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Violations and only return the `id`
     * const violationWithIdOnly = await prisma.violation.updateManyAndReturn({
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
    updateManyAndReturn<T extends ViolationUpdateManyAndReturnArgs>(args: SelectSubset<T, ViolationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ViolationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Violation.
     * @param {ViolationUpsertArgs} args - Arguments to update or create a Violation.
     * @example
     * // Update or create a Violation
     * const violation = await prisma.violation.upsert({
     *   create: {
     *     // ... data to create a Violation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Violation we want to update
     *   }
     * })
     */
    upsert<T extends ViolationUpsertArgs>(args: SelectSubset<T, ViolationUpsertArgs<ExtArgs>>): Prisma__ViolationClient<$Result.GetResult<Prisma.$ViolationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Violations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ViolationCountArgs} args - Arguments to filter Violations to count.
     * @example
     * // Count the number of Violations
     * const count = await prisma.violation.count({
     *   where: {
     *     // ... the filter for the Violations we want to count
     *   }
     * })
    **/
    count<T extends ViolationCountArgs>(
      args?: Subset<T, ViolationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ViolationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Violation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ViolationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ViolationAggregateArgs>(args: Subset<T, ViolationAggregateArgs>): Prisma.PrismaPromise<GetViolationAggregateType<T>>

    /**
     * Group by Violation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ViolationGroupByArgs} args - Group by arguments.
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
      T extends ViolationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ViolationGroupByArgs['orderBy'] }
        : { orderBy?: ViolationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ViolationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetViolationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Violation model
   */
  readonly fields: ViolationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Violation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ViolationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    driver<T extends Violation$driverArgs<ExtArgs> = {}>(args?: Subset<T, Violation$driverArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    record<T extends RecordDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RecordDefaultArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Violation model
   */
  interface ViolationFieldRefs {
    readonly id: FieldRef<"Violation", 'Int'>
    readonly recordId: FieldRef<"Violation", 'Int'>
    readonly ordinanceInfractionReportNo: FieldRef<"Violation", 'String'>
    readonly smokeDensityTestResultNo: FieldRef<"Violation", 'String'>
    readonly placeOfApprehension: FieldRef<"Violation", 'String'>
    readonly dateOfApprehension: FieldRef<"Violation", 'DateTime'>
    readonly paidDriver: FieldRef<"Violation", 'Boolean'>
    readonly paidOperator: FieldRef<"Violation", 'Boolean'>
    readonly driverId: FieldRef<"Violation", 'String'>
    readonly createdAt: FieldRef<"Violation", 'DateTime'>
    readonly updatedAt: FieldRef<"Violation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Violation findUnique
   */
  export type ViolationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationInclude<ExtArgs> | null
    /**
     * Filter, which Violation to fetch.
     */
    where: ViolationWhereUniqueInput
  }

  /**
   * Violation findUniqueOrThrow
   */
  export type ViolationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationInclude<ExtArgs> | null
    /**
     * Filter, which Violation to fetch.
     */
    where: ViolationWhereUniqueInput
  }

  /**
   * Violation findFirst
   */
  export type ViolationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationInclude<ExtArgs> | null
    /**
     * Filter, which Violation to fetch.
     */
    where?: ViolationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Violations to fetch.
     */
    orderBy?: ViolationOrderByWithRelationInput | ViolationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Violations.
     */
    cursor?: ViolationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Violations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Violations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Violations.
     */
    distinct?: ViolationScalarFieldEnum | ViolationScalarFieldEnum[]
  }

  /**
   * Violation findFirstOrThrow
   */
  export type ViolationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationInclude<ExtArgs> | null
    /**
     * Filter, which Violation to fetch.
     */
    where?: ViolationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Violations to fetch.
     */
    orderBy?: ViolationOrderByWithRelationInput | ViolationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Violations.
     */
    cursor?: ViolationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Violations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Violations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Violations.
     */
    distinct?: ViolationScalarFieldEnum | ViolationScalarFieldEnum[]
  }

  /**
   * Violation findMany
   */
  export type ViolationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationInclude<ExtArgs> | null
    /**
     * Filter, which Violations to fetch.
     */
    where?: ViolationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Violations to fetch.
     */
    orderBy?: ViolationOrderByWithRelationInput | ViolationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Violations.
     */
    cursor?: ViolationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Violations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Violations.
     */
    skip?: number
    distinct?: ViolationScalarFieldEnum | ViolationScalarFieldEnum[]
  }

  /**
   * Violation create
   */
  export type ViolationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationInclude<ExtArgs> | null
    /**
     * The data needed to create a Violation.
     */
    data: XOR<ViolationCreateInput, ViolationUncheckedCreateInput>
  }

  /**
   * Violation createMany
   */
  export type ViolationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Violations.
     */
    data: ViolationCreateManyInput | ViolationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Violation createManyAndReturn
   */
  export type ViolationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * The data used to create many Violations.
     */
    data: ViolationCreateManyInput | ViolationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Violation update
   */
  export type ViolationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationInclude<ExtArgs> | null
    /**
     * The data needed to update a Violation.
     */
    data: XOR<ViolationUpdateInput, ViolationUncheckedUpdateInput>
    /**
     * Choose, which Violation to update.
     */
    where: ViolationWhereUniqueInput
  }

  /**
   * Violation updateMany
   */
  export type ViolationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Violations.
     */
    data: XOR<ViolationUpdateManyMutationInput, ViolationUncheckedUpdateManyInput>
    /**
     * Filter which Violations to update
     */
    where?: ViolationWhereInput
    /**
     * Limit how many Violations to update.
     */
    limit?: number
  }

  /**
   * Violation updateManyAndReturn
   */
  export type ViolationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * The data used to update Violations.
     */
    data: XOR<ViolationUpdateManyMutationInput, ViolationUncheckedUpdateManyInput>
    /**
     * Filter which Violations to update
     */
    where?: ViolationWhereInput
    /**
     * Limit how many Violations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Violation upsert
   */
  export type ViolationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationInclude<ExtArgs> | null
    /**
     * The filter to search for the Violation to update in case it exists.
     */
    where: ViolationWhereUniqueInput
    /**
     * In case the Violation found by the `where` argument doesn't exist, create a new Violation with this data.
     */
    create: XOR<ViolationCreateInput, ViolationUncheckedCreateInput>
    /**
     * In case the Violation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ViolationUpdateInput, ViolationUncheckedUpdateInput>
  }

  /**
   * Violation delete
   */
  export type ViolationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationInclude<ExtArgs> | null
    /**
     * Filter which Violation to delete.
     */
    where: ViolationWhereUniqueInput
  }

  /**
   * Violation deleteMany
   */
  export type ViolationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Violations to delete
     */
    where?: ViolationWhereInput
    /**
     * Limit how many Violations to delete.
     */
    limit?: number
  }

  /**
   * Violation.driver
   */
  export type Violation$driverArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Driver
     */
    omit?: DriverOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    where?: DriverWhereInput
  }

  /**
   * Violation without action
   */
  export type ViolationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Violation
     */
    select?: ViolationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Violation
     */
    omit?: ViolationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ViolationInclude<ExtArgs> | null
  }


  /**
   * Model RecordHistory
   */

  export type AggregateRecordHistory = {
    _count: RecordHistoryCountAggregateOutputType | null
    _avg: RecordHistoryAvgAggregateOutputType | null
    _sum: RecordHistorySumAggregateOutputType | null
    _min: RecordHistoryMinAggregateOutputType | null
    _max: RecordHistoryMaxAggregateOutputType | null
  }

  export type RecordHistoryAvgAggregateOutputType = {
    id: number | null
    recordId: number | null
  }

  export type RecordHistorySumAggregateOutputType = {
    id: number | null
    recordId: number | null
  }

  export type RecordHistoryMinAggregateOutputType = {
    id: number | null
    recordId: number | null
    type: string | null
    date: Date | null
    details: string | null
    orNumber: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RecordHistoryMaxAggregateOutputType = {
    id: number | null
    recordId: number | null
    type: string | null
    date: Date | null
    details: string | null
    orNumber: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RecordHistoryCountAggregateOutputType = {
    id: number
    recordId: number
    type: number
    date: number
    details: number
    orNumber: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RecordHistoryAvgAggregateInputType = {
    id?: true
    recordId?: true
  }

  export type RecordHistorySumAggregateInputType = {
    id?: true
    recordId?: true
  }

  export type RecordHistoryMinAggregateInputType = {
    id?: true
    recordId?: true
    type?: true
    date?: true
    details?: true
    orNumber?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RecordHistoryMaxAggregateInputType = {
    id?: true
    recordId?: true
    type?: true
    date?: true
    details?: true
    orNumber?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RecordHistoryCountAggregateInputType = {
    id?: true
    recordId?: true
    type?: true
    date?: true
    details?: true
    orNumber?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RecordHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecordHistory to aggregate.
     */
    where?: RecordHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecordHistories to fetch.
     */
    orderBy?: RecordHistoryOrderByWithRelationInput | RecordHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RecordHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecordHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecordHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RecordHistories
    **/
    _count?: true | RecordHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RecordHistoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RecordHistorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RecordHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RecordHistoryMaxAggregateInputType
  }

  export type GetRecordHistoryAggregateType<T extends RecordHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateRecordHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRecordHistory[P]>
      : GetScalarType<T[P], AggregateRecordHistory[P]>
  }




  export type RecordHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecordHistoryWhereInput
    orderBy?: RecordHistoryOrderByWithAggregationInput | RecordHistoryOrderByWithAggregationInput[]
    by: RecordHistoryScalarFieldEnum[] | RecordHistoryScalarFieldEnum
    having?: RecordHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RecordHistoryCountAggregateInputType | true
    _avg?: RecordHistoryAvgAggregateInputType
    _sum?: RecordHistorySumAggregateInputType
    _min?: RecordHistoryMinAggregateInputType
    _max?: RecordHistoryMaxAggregateInputType
  }

  export type RecordHistoryGroupByOutputType = {
    id: number
    recordId: number
    type: string
    date: Date
    details: string | null
    orNumber: string | null
    status: string
    createdAt: Date | null
    updatedAt: Date | null
    _count: RecordHistoryCountAggregateOutputType | null
    _avg: RecordHistoryAvgAggregateOutputType | null
    _sum: RecordHistorySumAggregateOutputType | null
    _min: RecordHistoryMinAggregateOutputType | null
    _max: RecordHistoryMaxAggregateOutputType | null
  }

  type GetRecordHistoryGroupByPayload<T extends RecordHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RecordHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RecordHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RecordHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], RecordHistoryGroupByOutputType[P]>
        }
      >
    >


  export type RecordHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recordId?: boolean
    type?: boolean
    date?: boolean
    details?: boolean
    orNumber?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recordHistory"]>

  export type RecordHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recordId?: boolean
    type?: boolean
    date?: boolean
    details?: boolean
    orNumber?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recordHistory"]>

  export type RecordHistorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recordId?: boolean
    type?: boolean
    date?: boolean
    details?: boolean
    orNumber?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recordHistory"]>

  export type RecordHistorySelectScalar = {
    id?: boolean
    recordId?: boolean
    type?: boolean
    date?: boolean
    details?: boolean
    orNumber?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RecordHistoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "recordId" | "type" | "date" | "details" | "orNumber" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["recordHistory"]>
  export type RecordHistoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }
  export type RecordHistoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }
  export type RecordHistoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }

  export type $RecordHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RecordHistory"
    objects: {
      record: Prisma.$RecordPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      recordId: number
      type: string
      date: Date
      details: string | null
      orNumber: string | null
      status: string
      createdAt: Date | null
      updatedAt: Date | null
    }, ExtArgs["result"]["recordHistory"]>
    composites: {}
  }

  type RecordHistoryGetPayload<S extends boolean | null | undefined | RecordHistoryDefaultArgs> = $Result.GetResult<Prisma.$RecordHistoryPayload, S>

  type RecordHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RecordHistoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RecordHistoryCountAggregateInputType | true
    }

  export interface RecordHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RecordHistory'], meta: { name: 'RecordHistory' } }
    /**
     * Find zero or one RecordHistory that matches the filter.
     * @param {RecordHistoryFindUniqueArgs} args - Arguments to find a RecordHistory
     * @example
     * // Get one RecordHistory
     * const recordHistory = await prisma.recordHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RecordHistoryFindUniqueArgs>(args: SelectSubset<T, RecordHistoryFindUniqueArgs<ExtArgs>>): Prisma__RecordHistoryClient<$Result.GetResult<Prisma.$RecordHistoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RecordHistory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RecordHistoryFindUniqueOrThrowArgs} args - Arguments to find a RecordHistory
     * @example
     * // Get one RecordHistory
     * const recordHistory = await prisma.recordHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RecordHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, RecordHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RecordHistoryClient<$Result.GetResult<Prisma.$RecordHistoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecordHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordHistoryFindFirstArgs} args - Arguments to find a RecordHistory
     * @example
     * // Get one RecordHistory
     * const recordHistory = await prisma.recordHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RecordHistoryFindFirstArgs>(args?: SelectSubset<T, RecordHistoryFindFirstArgs<ExtArgs>>): Prisma__RecordHistoryClient<$Result.GetResult<Prisma.$RecordHistoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecordHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordHistoryFindFirstOrThrowArgs} args - Arguments to find a RecordHistory
     * @example
     * // Get one RecordHistory
     * const recordHistory = await prisma.recordHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RecordHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, RecordHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__RecordHistoryClient<$Result.GetResult<Prisma.$RecordHistoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RecordHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RecordHistories
     * const recordHistories = await prisma.recordHistory.findMany()
     * 
     * // Get first 10 RecordHistories
     * const recordHistories = await prisma.recordHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const recordHistoryWithIdOnly = await prisma.recordHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RecordHistoryFindManyArgs>(args?: SelectSubset<T, RecordHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RecordHistory.
     * @param {RecordHistoryCreateArgs} args - Arguments to create a RecordHistory.
     * @example
     * // Create one RecordHistory
     * const RecordHistory = await prisma.recordHistory.create({
     *   data: {
     *     // ... data to create a RecordHistory
     *   }
     * })
     * 
     */
    create<T extends RecordHistoryCreateArgs>(args: SelectSubset<T, RecordHistoryCreateArgs<ExtArgs>>): Prisma__RecordHistoryClient<$Result.GetResult<Prisma.$RecordHistoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RecordHistories.
     * @param {RecordHistoryCreateManyArgs} args - Arguments to create many RecordHistories.
     * @example
     * // Create many RecordHistories
     * const recordHistory = await prisma.recordHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RecordHistoryCreateManyArgs>(args?: SelectSubset<T, RecordHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RecordHistories and returns the data saved in the database.
     * @param {RecordHistoryCreateManyAndReturnArgs} args - Arguments to create many RecordHistories.
     * @example
     * // Create many RecordHistories
     * const recordHistory = await prisma.recordHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RecordHistories and only return the `id`
     * const recordHistoryWithIdOnly = await prisma.recordHistory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RecordHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, RecordHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordHistoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RecordHistory.
     * @param {RecordHistoryDeleteArgs} args - Arguments to delete one RecordHistory.
     * @example
     * // Delete one RecordHistory
     * const RecordHistory = await prisma.recordHistory.delete({
     *   where: {
     *     // ... filter to delete one RecordHistory
     *   }
     * })
     * 
     */
    delete<T extends RecordHistoryDeleteArgs>(args: SelectSubset<T, RecordHistoryDeleteArgs<ExtArgs>>): Prisma__RecordHistoryClient<$Result.GetResult<Prisma.$RecordHistoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RecordHistory.
     * @param {RecordHistoryUpdateArgs} args - Arguments to update one RecordHistory.
     * @example
     * // Update one RecordHistory
     * const recordHistory = await prisma.recordHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RecordHistoryUpdateArgs>(args: SelectSubset<T, RecordHistoryUpdateArgs<ExtArgs>>): Prisma__RecordHistoryClient<$Result.GetResult<Prisma.$RecordHistoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RecordHistories.
     * @param {RecordHistoryDeleteManyArgs} args - Arguments to filter RecordHistories to delete.
     * @example
     * // Delete a few RecordHistories
     * const { count } = await prisma.recordHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RecordHistoryDeleteManyArgs>(args?: SelectSubset<T, RecordHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecordHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RecordHistories
     * const recordHistory = await prisma.recordHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RecordHistoryUpdateManyArgs>(args: SelectSubset<T, RecordHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecordHistories and returns the data updated in the database.
     * @param {RecordHistoryUpdateManyAndReturnArgs} args - Arguments to update many RecordHistories.
     * @example
     * // Update many RecordHistories
     * const recordHistory = await prisma.recordHistory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RecordHistories and only return the `id`
     * const recordHistoryWithIdOnly = await prisma.recordHistory.updateManyAndReturn({
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
    updateManyAndReturn<T extends RecordHistoryUpdateManyAndReturnArgs>(args: SelectSubset<T, RecordHistoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordHistoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RecordHistory.
     * @param {RecordHistoryUpsertArgs} args - Arguments to update or create a RecordHistory.
     * @example
     * // Update or create a RecordHistory
     * const recordHistory = await prisma.recordHistory.upsert({
     *   create: {
     *     // ... data to create a RecordHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RecordHistory we want to update
     *   }
     * })
     */
    upsert<T extends RecordHistoryUpsertArgs>(args: SelectSubset<T, RecordHistoryUpsertArgs<ExtArgs>>): Prisma__RecordHistoryClient<$Result.GetResult<Prisma.$RecordHistoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RecordHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordHistoryCountArgs} args - Arguments to filter RecordHistories to count.
     * @example
     * // Count the number of RecordHistories
     * const count = await prisma.recordHistory.count({
     *   where: {
     *     // ... the filter for the RecordHistories we want to count
     *   }
     * })
    **/
    count<T extends RecordHistoryCountArgs>(
      args?: Subset<T, RecordHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RecordHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RecordHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends RecordHistoryAggregateArgs>(args: Subset<T, RecordHistoryAggregateArgs>): Prisma.PrismaPromise<GetRecordHistoryAggregateType<T>>

    /**
     * Group by RecordHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordHistoryGroupByArgs} args - Group by arguments.
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
      T extends RecordHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RecordHistoryGroupByArgs['orderBy'] }
        : { orderBy?: RecordHistoryGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, RecordHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecordHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RecordHistory model
   */
  readonly fields: RecordHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RecordHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RecordHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    record<T extends RecordDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RecordDefaultArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the RecordHistory model
   */
  interface RecordHistoryFieldRefs {
    readonly id: FieldRef<"RecordHistory", 'Int'>
    readonly recordId: FieldRef<"RecordHistory", 'Int'>
    readonly type: FieldRef<"RecordHistory", 'String'>
    readonly date: FieldRef<"RecordHistory", 'DateTime'>
    readonly details: FieldRef<"RecordHistory", 'String'>
    readonly orNumber: FieldRef<"RecordHistory", 'String'>
    readonly status: FieldRef<"RecordHistory", 'String'>
    readonly createdAt: FieldRef<"RecordHistory", 'DateTime'>
    readonly updatedAt: FieldRef<"RecordHistory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RecordHistory findUnique
   */
  export type RecordHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordHistory
     */
    select?: RecordHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordHistory
     */
    omit?: RecordHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordHistoryInclude<ExtArgs> | null
    /**
     * Filter, which RecordHistory to fetch.
     */
    where: RecordHistoryWhereUniqueInput
  }

  /**
   * RecordHistory findUniqueOrThrow
   */
  export type RecordHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordHistory
     */
    select?: RecordHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordHistory
     */
    omit?: RecordHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordHistoryInclude<ExtArgs> | null
    /**
     * Filter, which RecordHistory to fetch.
     */
    where: RecordHistoryWhereUniqueInput
  }

  /**
   * RecordHistory findFirst
   */
  export type RecordHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordHistory
     */
    select?: RecordHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordHistory
     */
    omit?: RecordHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordHistoryInclude<ExtArgs> | null
    /**
     * Filter, which RecordHistory to fetch.
     */
    where?: RecordHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecordHistories to fetch.
     */
    orderBy?: RecordHistoryOrderByWithRelationInput | RecordHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecordHistories.
     */
    cursor?: RecordHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecordHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecordHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecordHistories.
     */
    distinct?: RecordHistoryScalarFieldEnum | RecordHistoryScalarFieldEnum[]
  }

  /**
   * RecordHistory findFirstOrThrow
   */
  export type RecordHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordHistory
     */
    select?: RecordHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordHistory
     */
    omit?: RecordHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordHistoryInclude<ExtArgs> | null
    /**
     * Filter, which RecordHistory to fetch.
     */
    where?: RecordHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecordHistories to fetch.
     */
    orderBy?: RecordHistoryOrderByWithRelationInput | RecordHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecordHistories.
     */
    cursor?: RecordHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecordHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecordHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecordHistories.
     */
    distinct?: RecordHistoryScalarFieldEnum | RecordHistoryScalarFieldEnum[]
  }

  /**
   * RecordHistory findMany
   */
  export type RecordHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordHistory
     */
    select?: RecordHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordHistory
     */
    omit?: RecordHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordHistoryInclude<ExtArgs> | null
    /**
     * Filter, which RecordHistories to fetch.
     */
    where?: RecordHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecordHistories to fetch.
     */
    orderBy?: RecordHistoryOrderByWithRelationInput | RecordHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RecordHistories.
     */
    cursor?: RecordHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecordHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecordHistories.
     */
    skip?: number
    distinct?: RecordHistoryScalarFieldEnum | RecordHistoryScalarFieldEnum[]
  }

  /**
   * RecordHistory create
   */
  export type RecordHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordHistory
     */
    select?: RecordHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordHistory
     */
    omit?: RecordHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordHistoryInclude<ExtArgs> | null
    /**
     * The data needed to create a RecordHistory.
     */
    data: XOR<RecordHistoryCreateInput, RecordHistoryUncheckedCreateInput>
  }

  /**
   * RecordHistory createMany
   */
  export type RecordHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RecordHistories.
     */
    data: RecordHistoryCreateManyInput | RecordHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RecordHistory createManyAndReturn
   */
  export type RecordHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordHistory
     */
    select?: RecordHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecordHistory
     */
    omit?: RecordHistoryOmit<ExtArgs> | null
    /**
     * The data used to create many RecordHistories.
     */
    data: RecordHistoryCreateManyInput | RecordHistoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordHistoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RecordHistory update
   */
  export type RecordHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordHistory
     */
    select?: RecordHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordHistory
     */
    omit?: RecordHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordHistoryInclude<ExtArgs> | null
    /**
     * The data needed to update a RecordHistory.
     */
    data: XOR<RecordHistoryUpdateInput, RecordHistoryUncheckedUpdateInput>
    /**
     * Choose, which RecordHistory to update.
     */
    where: RecordHistoryWhereUniqueInput
  }

  /**
   * RecordHistory updateMany
   */
  export type RecordHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RecordHistories.
     */
    data: XOR<RecordHistoryUpdateManyMutationInput, RecordHistoryUncheckedUpdateManyInput>
    /**
     * Filter which RecordHistories to update
     */
    where?: RecordHistoryWhereInput
    /**
     * Limit how many RecordHistories to update.
     */
    limit?: number
  }

  /**
   * RecordHistory updateManyAndReturn
   */
  export type RecordHistoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordHistory
     */
    select?: RecordHistorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecordHistory
     */
    omit?: RecordHistoryOmit<ExtArgs> | null
    /**
     * The data used to update RecordHistories.
     */
    data: XOR<RecordHistoryUpdateManyMutationInput, RecordHistoryUncheckedUpdateManyInput>
    /**
     * Filter which RecordHistories to update
     */
    where?: RecordHistoryWhereInput
    /**
     * Limit how many RecordHistories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordHistoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RecordHistory upsert
   */
  export type RecordHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordHistory
     */
    select?: RecordHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordHistory
     */
    omit?: RecordHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordHistoryInclude<ExtArgs> | null
    /**
     * The filter to search for the RecordHistory to update in case it exists.
     */
    where: RecordHistoryWhereUniqueInput
    /**
     * In case the RecordHistory found by the `where` argument doesn't exist, create a new RecordHistory with this data.
     */
    create: XOR<RecordHistoryCreateInput, RecordHistoryUncheckedCreateInput>
    /**
     * In case the RecordHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RecordHistoryUpdateInput, RecordHistoryUncheckedUpdateInput>
  }

  /**
   * RecordHistory delete
   */
  export type RecordHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordHistory
     */
    select?: RecordHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordHistory
     */
    omit?: RecordHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordHistoryInclude<ExtArgs> | null
    /**
     * Filter which RecordHistory to delete.
     */
    where: RecordHistoryWhereUniqueInput
  }

  /**
   * RecordHistory deleteMany
   */
  export type RecordHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecordHistories to delete
     */
    where?: RecordHistoryWhereInput
    /**
     * Limit how many RecordHistories to delete.
     */
    limit?: number
  }

  /**
   * RecordHistory without action
   */
  export type RecordHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordHistory
     */
    select?: RecordHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordHistory
     */
    omit?: RecordHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordHistoryInclude<ExtArgs> | null
  }


  /**
   * Model Vehicle
   */

  export type AggregateVehicle = {
    _count: VehicleCountAggregateOutputType | null
    _avg: VehicleAvgAggregateOutputType | null
    _sum: VehicleSumAggregateOutputType | null
    _min: VehicleMinAggregateOutputType | null
    _max: VehicleMaxAggregateOutputType | null
  }

  export type VehicleAvgAggregateOutputType = {
    wheels: number | null
  }

  export type VehicleSumAggregateOutputType = {
    wheels: number | null
  }

  export type VehicleMinAggregateOutputType = {
    id: string | null
    driverName: string | null
    contactNumber: string | null
    engineType: string | null
    officeName: string | null
    plateNumber: string | null
    vehicleType: string | null
    wheels: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VehicleMaxAggregateOutputType = {
    id: string | null
    driverName: string | null
    contactNumber: string | null
    engineType: string | null
    officeName: string | null
    plateNumber: string | null
    vehicleType: string | null
    wheels: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VehicleCountAggregateOutputType = {
    id: number
    driverName: number
    contactNumber: number
    engineType: number
    officeName: number
    plateNumber: number
    vehicleType: number
    wheels: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VehicleAvgAggregateInputType = {
    wheels?: true
  }

  export type VehicleSumAggregateInputType = {
    wheels?: true
  }

  export type VehicleMinAggregateInputType = {
    id?: true
    driverName?: true
    contactNumber?: true
    engineType?: true
    officeName?: true
    plateNumber?: true
    vehicleType?: true
    wheels?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VehicleMaxAggregateInputType = {
    id?: true
    driverName?: true
    contactNumber?: true
    engineType?: true
    officeName?: true
    plateNumber?: true
    vehicleType?: true
    wheels?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VehicleCountAggregateInputType = {
    id?: true
    driverName?: true
    contactNumber?: true
    engineType?: true
    officeName?: true
    plateNumber?: true
    vehicleType?: true
    wheels?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VehicleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vehicle to aggregate.
     */
    where?: VehicleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vehicles to fetch.
     */
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VehicleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vehicles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vehicles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Vehicles
    **/
    _count?: true | VehicleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VehicleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VehicleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VehicleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VehicleMaxAggregateInputType
  }

  export type GetVehicleAggregateType<T extends VehicleAggregateArgs> = {
        [P in keyof T & keyof AggregateVehicle]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVehicle[P]>
      : GetScalarType<T[P], AggregateVehicle[P]>
  }




  export type VehicleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VehicleWhereInput
    orderBy?: VehicleOrderByWithAggregationInput | VehicleOrderByWithAggregationInput[]
    by: VehicleScalarFieldEnum[] | VehicleScalarFieldEnum
    having?: VehicleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VehicleCountAggregateInputType | true
    _avg?: VehicleAvgAggregateInputType
    _sum?: VehicleSumAggregateInputType
    _min?: VehicleMinAggregateInputType
    _max?: VehicleMaxAggregateInputType
  }

  export type VehicleGroupByOutputType = {
    id: string
    driverName: string
    contactNumber: string | null
    engineType: string
    officeName: string
    plateNumber: string
    vehicleType: string
    wheels: number
    createdAt: Date
    updatedAt: Date
    _count: VehicleCountAggregateOutputType | null
    _avg: VehicleAvgAggregateOutputType | null
    _sum: VehicleSumAggregateOutputType | null
    _min: VehicleMinAggregateOutputType | null
    _max: VehicleMaxAggregateOutputType | null
  }

  type GetVehicleGroupByPayload<T extends VehicleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VehicleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VehicleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VehicleGroupByOutputType[P]>
            : GetScalarType<T[P], VehicleGroupByOutputType[P]>
        }
      >
    >


  export type VehicleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    driverName?: boolean
    contactNumber?: boolean
    engineType?: boolean
    officeName?: boolean
    plateNumber?: boolean
    vehicleType?: boolean
    wheels?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tests?: boolean | Vehicle$testsArgs<ExtArgs>
    driverHistory?: boolean | Vehicle$driverHistoryArgs<ExtArgs>
    _count?: boolean | VehicleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vehicle"]>

  export type VehicleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    driverName?: boolean
    contactNumber?: boolean
    engineType?: boolean
    officeName?: boolean
    plateNumber?: boolean
    vehicleType?: boolean
    wheels?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["vehicle"]>

  export type VehicleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    driverName?: boolean
    contactNumber?: boolean
    engineType?: boolean
    officeName?: boolean
    plateNumber?: boolean
    vehicleType?: boolean
    wheels?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["vehicle"]>

  export type VehicleSelectScalar = {
    id?: boolean
    driverName?: boolean
    contactNumber?: boolean
    engineType?: boolean
    officeName?: boolean
    plateNumber?: boolean
    vehicleType?: boolean
    wheels?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VehicleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "driverName" | "contactNumber" | "engineType" | "officeName" | "plateNumber" | "vehicleType" | "wheels" | "createdAt" | "updatedAt", ExtArgs["result"]["vehicle"]>
  export type VehicleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tests?: boolean | Vehicle$testsArgs<ExtArgs>
    driverHistory?: boolean | Vehicle$driverHistoryArgs<ExtArgs>
    _count?: boolean | VehicleCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type VehicleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type VehicleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $VehiclePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Vehicle"
    objects: {
      tests: Prisma.$TestPayload<ExtArgs>[]
      driverHistory: Prisma.$VehicleDriverHistoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      driverName: string
      contactNumber: string | null
      engineType: string
      officeName: string
      plateNumber: string
      vehicleType: string
      wheels: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["vehicle"]>
    composites: {}
  }

  type VehicleGetPayload<S extends boolean | null | undefined | VehicleDefaultArgs> = $Result.GetResult<Prisma.$VehiclePayload, S>

  type VehicleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VehicleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VehicleCountAggregateInputType | true
    }

  export interface VehicleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Vehicle'], meta: { name: 'Vehicle' } }
    /**
     * Find zero or one Vehicle that matches the filter.
     * @param {VehicleFindUniqueArgs} args - Arguments to find a Vehicle
     * @example
     * // Get one Vehicle
     * const vehicle = await prisma.vehicle.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VehicleFindUniqueArgs>(args: SelectSubset<T, VehicleFindUniqueArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Vehicle that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VehicleFindUniqueOrThrowArgs} args - Arguments to find a Vehicle
     * @example
     * // Get one Vehicle
     * const vehicle = await prisma.vehicle.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VehicleFindUniqueOrThrowArgs>(args: SelectSubset<T, VehicleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Vehicle that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleFindFirstArgs} args - Arguments to find a Vehicle
     * @example
     * // Get one Vehicle
     * const vehicle = await prisma.vehicle.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VehicleFindFirstArgs>(args?: SelectSubset<T, VehicleFindFirstArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Vehicle that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleFindFirstOrThrowArgs} args - Arguments to find a Vehicle
     * @example
     * // Get one Vehicle
     * const vehicle = await prisma.vehicle.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VehicleFindFirstOrThrowArgs>(args?: SelectSubset<T, VehicleFindFirstOrThrowArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Vehicles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Vehicles
     * const vehicles = await prisma.vehicle.findMany()
     * 
     * // Get first 10 Vehicles
     * const vehicles = await prisma.vehicle.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const vehicleWithIdOnly = await prisma.vehicle.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VehicleFindManyArgs>(args?: SelectSubset<T, VehicleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Vehicle.
     * @param {VehicleCreateArgs} args - Arguments to create a Vehicle.
     * @example
     * // Create one Vehicle
     * const Vehicle = await prisma.vehicle.create({
     *   data: {
     *     // ... data to create a Vehicle
     *   }
     * })
     * 
     */
    create<T extends VehicleCreateArgs>(args: SelectSubset<T, VehicleCreateArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Vehicles.
     * @param {VehicleCreateManyArgs} args - Arguments to create many Vehicles.
     * @example
     * // Create many Vehicles
     * const vehicle = await prisma.vehicle.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VehicleCreateManyArgs>(args?: SelectSubset<T, VehicleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Vehicles and returns the data saved in the database.
     * @param {VehicleCreateManyAndReturnArgs} args - Arguments to create many Vehicles.
     * @example
     * // Create many Vehicles
     * const vehicle = await prisma.vehicle.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Vehicles and only return the `id`
     * const vehicleWithIdOnly = await prisma.vehicle.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VehicleCreateManyAndReturnArgs>(args?: SelectSubset<T, VehicleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Vehicle.
     * @param {VehicleDeleteArgs} args - Arguments to delete one Vehicle.
     * @example
     * // Delete one Vehicle
     * const Vehicle = await prisma.vehicle.delete({
     *   where: {
     *     // ... filter to delete one Vehicle
     *   }
     * })
     * 
     */
    delete<T extends VehicleDeleteArgs>(args: SelectSubset<T, VehicleDeleteArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Vehicle.
     * @param {VehicleUpdateArgs} args - Arguments to update one Vehicle.
     * @example
     * // Update one Vehicle
     * const vehicle = await prisma.vehicle.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VehicleUpdateArgs>(args: SelectSubset<T, VehicleUpdateArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Vehicles.
     * @param {VehicleDeleteManyArgs} args - Arguments to filter Vehicles to delete.
     * @example
     * // Delete a few Vehicles
     * const { count } = await prisma.vehicle.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VehicleDeleteManyArgs>(args?: SelectSubset<T, VehicleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Vehicles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Vehicles
     * const vehicle = await prisma.vehicle.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VehicleUpdateManyArgs>(args: SelectSubset<T, VehicleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Vehicles and returns the data updated in the database.
     * @param {VehicleUpdateManyAndReturnArgs} args - Arguments to update many Vehicles.
     * @example
     * // Update many Vehicles
     * const vehicle = await prisma.vehicle.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Vehicles and only return the `id`
     * const vehicleWithIdOnly = await prisma.vehicle.updateManyAndReturn({
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
    updateManyAndReturn<T extends VehicleUpdateManyAndReturnArgs>(args: SelectSubset<T, VehicleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Vehicle.
     * @param {VehicleUpsertArgs} args - Arguments to update or create a Vehicle.
     * @example
     * // Update or create a Vehicle
     * const vehicle = await prisma.vehicle.upsert({
     *   create: {
     *     // ... data to create a Vehicle
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Vehicle we want to update
     *   }
     * })
     */
    upsert<T extends VehicleUpsertArgs>(args: SelectSubset<T, VehicleUpsertArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Vehicles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleCountArgs} args - Arguments to filter Vehicles to count.
     * @example
     * // Count the number of Vehicles
     * const count = await prisma.vehicle.count({
     *   where: {
     *     // ... the filter for the Vehicles we want to count
     *   }
     * })
    **/
    count<T extends VehicleCountArgs>(
      args?: Subset<T, VehicleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VehicleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Vehicle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends VehicleAggregateArgs>(args: Subset<T, VehicleAggregateArgs>): Prisma.PrismaPromise<GetVehicleAggregateType<T>>

    /**
     * Group by Vehicle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleGroupByArgs} args - Group by arguments.
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
      T extends VehicleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VehicleGroupByArgs['orderBy'] }
        : { orderBy?: VehicleGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, VehicleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVehicleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Vehicle model
   */
  readonly fields: VehicleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Vehicle.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VehicleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tests<T extends Vehicle$testsArgs<ExtArgs> = {}>(args?: Subset<T, Vehicle$testsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    driverHistory<T extends Vehicle$driverHistoryArgs<ExtArgs> = {}>(args?: Subset<T, Vehicle$driverHistoryArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VehicleDriverHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Vehicle model
   */
  interface VehicleFieldRefs {
    readonly id: FieldRef<"Vehicle", 'String'>
    readonly driverName: FieldRef<"Vehicle", 'String'>
    readonly contactNumber: FieldRef<"Vehicle", 'String'>
    readonly engineType: FieldRef<"Vehicle", 'String'>
    readonly officeName: FieldRef<"Vehicle", 'String'>
    readonly plateNumber: FieldRef<"Vehicle", 'String'>
    readonly vehicleType: FieldRef<"Vehicle", 'String'>
    readonly wheels: FieldRef<"Vehicle", 'Int'>
    readonly createdAt: FieldRef<"Vehicle", 'DateTime'>
    readonly updatedAt: FieldRef<"Vehicle", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Vehicle findUnique
   */
  export type VehicleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vehicle
     */
    omit?: VehicleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicle to fetch.
     */
    where: VehicleWhereUniqueInput
  }

  /**
   * Vehicle findUniqueOrThrow
   */
  export type VehicleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vehicle
     */
    omit?: VehicleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicle to fetch.
     */
    where: VehicleWhereUniqueInput
  }

  /**
   * Vehicle findFirst
   */
  export type VehicleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vehicle
     */
    omit?: VehicleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicle to fetch.
     */
    where?: VehicleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vehicles to fetch.
     */
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vehicles.
     */
    cursor?: VehicleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vehicles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vehicles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vehicles.
     */
    distinct?: VehicleScalarFieldEnum | VehicleScalarFieldEnum[]
  }

  /**
   * Vehicle findFirstOrThrow
   */
  export type VehicleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vehicle
     */
    omit?: VehicleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicle to fetch.
     */
    where?: VehicleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vehicles to fetch.
     */
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vehicles.
     */
    cursor?: VehicleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vehicles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vehicles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vehicles.
     */
    distinct?: VehicleScalarFieldEnum | VehicleScalarFieldEnum[]
  }

  /**
   * Vehicle findMany
   */
  export type VehicleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vehicle
     */
    omit?: VehicleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter, which Vehicles to fetch.
     */
    where?: VehicleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vehicles to fetch.
     */
    orderBy?: VehicleOrderByWithRelationInput | VehicleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Vehicles.
     */
    cursor?: VehicleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vehicles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vehicles.
     */
    skip?: number
    distinct?: VehicleScalarFieldEnum | VehicleScalarFieldEnum[]
  }

  /**
   * Vehicle create
   */
  export type VehicleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vehicle
     */
    omit?: VehicleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * The data needed to create a Vehicle.
     */
    data: XOR<VehicleCreateInput, VehicleUncheckedCreateInput>
  }

  /**
   * Vehicle createMany
   */
  export type VehicleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Vehicles.
     */
    data: VehicleCreateManyInput | VehicleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Vehicle createManyAndReturn
   */
  export type VehicleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Vehicle
     */
    omit?: VehicleOmit<ExtArgs> | null
    /**
     * The data used to create many Vehicles.
     */
    data: VehicleCreateManyInput | VehicleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Vehicle update
   */
  export type VehicleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vehicle
     */
    omit?: VehicleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * The data needed to update a Vehicle.
     */
    data: XOR<VehicleUpdateInput, VehicleUncheckedUpdateInput>
    /**
     * Choose, which Vehicle to update.
     */
    where: VehicleWhereUniqueInput
  }

  /**
   * Vehicle updateMany
   */
  export type VehicleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Vehicles.
     */
    data: XOR<VehicleUpdateManyMutationInput, VehicleUncheckedUpdateManyInput>
    /**
     * Filter which Vehicles to update
     */
    where?: VehicleWhereInput
    /**
     * Limit how many Vehicles to update.
     */
    limit?: number
  }

  /**
   * Vehicle updateManyAndReturn
   */
  export type VehicleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Vehicle
     */
    omit?: VehicleOmit<ExtArgs> | null
    /**
     * The data used to update Vehicles.
     */
    data: XOR<VehicleUpdateManyMutationInput, VehicleUncheckedUpdateManyInput>
    /**
     * Filter which Vehicles to update
     */
    where?: VehicleWhereInput
    /**
     * Limit how many Vehicles to update.
     */
    limit?: number
  }

  /**
   * Vehicle upsert
   */
  export type VehicleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vehicle
     */
    omit?: VehicleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * The filter to search for the Vehicle to update in case it exists.
     */
    where: VehicleWhereUniqueInput
    /**
     * In case the Vehicle found by the `where` argument doesn't exist, create a new Vehicle with this data.
     */
    create: XOR<VehicleCreateInput, VehicleUncheckedCreateInput>
    /**
     * In case the Vehicle was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VehicleUpdateInput, VehicleUncheckedUpdateInput>
  }

  /**
   * Vehicle delete
   */
  export type VehicleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vehicle
     */
    omit?: VehicleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
    /**
     * Filter which Vehicle to delete.
     */
    where: VehicleWhereUniqueInput
  }

  /**
   * Vehicle deleteMany
   */
  export type VehicleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vehicles to delete
     */
    where?: VehicleWhereInput
    /**
     * Limit how many Vehicles to delete.
     */
    limit?: number
  }

  /**
   * Vehicle.tests
   */
  export type Vehicle$testsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestInclude<ExtArgs> | null
    where?: TestWhereInput
    orderBy?: TestOrderByWithRelationInput | TestOrderByWithRelationInput[]
    cursor?: TestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TestScalarFieldEnum | TestScalarFieldEnum[]
  }

  /**
   * Vehicle.driverHistory
   */
  export type Vehicle$driverHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryInclude<ExtArgs> | null
    where?: VehicleDriverHistoryWhereInput
    orderBy?: VehicleDriverHistoryOrderByWithRelationInput | VehicleDriverHistoryOrderByWithRelationInput[]
    cursor?: VehicleDriverHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VehicleDriverHistoryScalarFieldEnum | VehicleDriverHistoryScalarFieldEnum[]
  }

  /**
   * Vehicle without action
   */
  export type VehicleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vehicle
     */
    select?: VehicleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vehicle
     */
    omit?: VehicleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleInclude<ExtArgs> | null
  }


  /**
   * Model VehicleDriverHistory
   */

  export type AggregateVehicleDriverHistory = {
    _count: VehicleDriverHistoryCountAggregateOutputType | null
    _min: VehicleDriverHistoryMinAggregateOutputType | null
    _max: VehicleDriverHistoryMaxAggregateOutputType | null
  }

  export type VehicleDriverHistoryMinAggregateOutputType = {
    id: string | null
    vehicleId: string | null
    driverName: string | null
    changedAt: Date | null
    changedBy: string | null
  }

  export type VehicleDriverHistoryMaxAggregateOutputType = {
    id: string | null
    vehicleId: string | null
    driverName: string | null
    changedAt: Date | null
    changedBy: string | null
  }

  export type VehicleDriverHistoryCountAggregateOutputType = {
    id: number
    vehicleId: number
    driverName: number
    changedAt: number
    changedBy: number
    _all: number
  }


  export type VehicleDriverHistoryMinAggregateInputType = {
    id?: true
    vehicleId?: true
    driverName?: true
    changedAt?: true
    changedBy?: true
  }

  export type VehicleDriverHistoryMaxAggregateInputType = {
    id?: true
    vehicleId?: true
    driverName?: true
    changedAt?: true
    changedBy?: true
  }

  export type VehicleDriverHistoryCountAggregateInputType = {
    id?: true
    vehicleId?: true
    driverName?: true
    changedAt?: true
    changedBy?: true
    _all?: true
  }

  export type VehicleDriverHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VehicleDriverHistory to aggregate.
     */
    where?: VehicleDriverHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VehicleDriverHistories to fetch.
     */
    orderBy?: VehicleDriverHistoryOrderByWithRelationInput | VehicleDriverHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VehicleDriverHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VehicleDriverHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VehicleDriverHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VehicleDriverHistories
    **/
    _count?: true | VehicleDriverHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VehicleDriverHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VehicleDriverHistoryMaxAggregateInputType
  }

  export type GetVehicleDriverHistoryAggregateType<T extends VehicleDriverHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateVehicleDriverHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVehicleDriverHistory[P]>
      : GetScalarType<T[P], AggregateVehicleDriverHistory[P]>
  }




  export type VehicleDriverHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VehicleDriverHistoryWhereInput
    orderBy?: VehicleDriverHistoryOrderByWithAggregationInput | VehicleDriverHistoryOrderByWithAggregationInput[]
    by: VehicleDriverHistoryScalarFieldEnum[] | VehicleDriverHistoryScalarFieldEnum
    having?: VehicleDriverHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VehicleDriverHistoryCountAggregateInputType | true
    _min?: VehicleDriverHistoryMinAggregateInputType
    _max?: VehicleDriverHistoryMaxAggregateInputType
  }

  export type VehicleDriverHistoryGroupByOutputType = {
    id: string
    vehicleId: string
    driverName: string
    changedAt: Date
    changedBy: string | null
    _count: VehicleDriverHistoryCountAggregateOutputType | null
    _min: VehicleDriverHistoryMinAggregateOutputType | null
    _max: VehicleDriverHistoryMaxAggregateOutputType | null
  }

  type GetVehicleDriverHistoryGroupByPayload<T extends VehicleDriverHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VehicleDriverHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VehicleDriverHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VehicleDriverHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], VehicleDriverHistoryGroupByOutputType[P]>
        }
      >
    >


  export type VehicleDriverHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vehicleId?: boolean
    driverName?: boolean
    changedAt?: boolean
    changedBy?: boolean
    user?: boolean | VehicleDriverHistory$userArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vehicleDriverHistory"]>

  export type VehicleDriverHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vehicleId?: boolean
    driverName?: boolean
    changedAt?: boolean
    changedBy?: boolean
    user?: boolean | VehicleDriverHistory$userArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vehicleDriverHistory"]>

  export type VehicleDriverHistorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vehicleId?: boolean
    driverName?: boolean
    changedAt?: boolean
    changedBy?: boolean
    user?: boolean | VehicleDriverHistory$userArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vehicleDriverHistory"]>

  export type VehicleDriverHistorySelectScalar = {
    id?: boolean
    vehicleId?: boolean
    driverName?: boolean
    changedAt?: boolean
    changedBy?: boolean
  }

  export type VehicleDriverHistoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "vehicleId" | "driverName" | "changedAt" | "changedBy", ExtArgs["result"]["vehicleDriverHistory"]>
  export type VehicleDriverHistoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | VehicleDriverHistory$userArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
  }
  export type VehicleDriverHistoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | VehicleDriverHistory$userArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
  }
  export type VehicleDriverHistoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | VehicleDriverHistory$userArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
  }

  export type $VehicleDriverHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VehicleDriverHistory"
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null
      vehicle: Prisma.$VehiclePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      vehicleId: string
      driverName: string
      changedAt: Date
      changedBy: string | null
    }, ExtArgs["result"]["vehicleDriverHistory"]>
    composites: {}
  }

  type VehicleDriverHistoryGetPayload<S extends boolean | null | undefined | VehicleDriverHistoryDefaultArgs> = $Result.GetResult<Prisma.$VehicleDriverHistoryPayload, S>

  type VehicleDriverHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VehicleDriverHistoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VehicleDriverHistoryCountAggregateInputType | true
    }

  export interface VehicleDriverHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VehicleDriverHistory'], meta: { name: 'VehicleDriverHistory' } }
    /**
     * Find zero or one VehicleDriverHistory that matches the filter.
     * @param {VehicleDriverHistoryFindUniqueArgs} args - Arguments to find a VehicleDriverHistory
     * @example
     * // Get one VehicleDriverHistory
     * const vehicleDriverHistory = await prisma.vehicleDriverHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VehicleDriverHistoryFindUniqueArgs>(args: SelectSubset<T, VehicleDriverHistoryFindUniqueArgs<ExtArgs>>): Prisma__VehicleDriverHistoryClient<$Result.GetResult<Prisma.$VehicleDriverHistoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VehicleDriverHistory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VehicleDriverHistoryFindUniqueOrThrowArgs} args - Arguments to find a VehicleDriverHistory
     * @example
     * // Get one VehicleDriverHistory
     * const vehicleDriverHistory = await prisma.vehicleDriverHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VehicleDriverHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, VehicleDriverHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VehicleDriverHistoryClient<$Result.GetResult<Prisma.$VehicleDriverHistoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VehicleDriverHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleDriverHistoryFindFirstArgs} args - Arguments to find a VehicleDriverHistory
     * @example
     * // Get one VehicleDriverHistory
     * const vehicleDriverHistory = await prisma.vehicleDriverHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VehicleDriverHistoryFindFirstArgs>(args?: SelectSubset<T, VehicleDriverHistoryFindFirstArgs<ExtArgs>>): Prisma__VehicleDriverHistoryClient<$Result.GetResult<Prisma.$VehicleDriverHistoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VehicleDriverHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleDriverHistoryFindFirstOrThrowArgs} args - Arguments to find a VehicleDriverHistory
     * @example
     * // Get one VehicleDriverHistory
     * const vehicleDriverHistory = await prisma.vehicleDriverHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VehicleDriverHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, VehicleDriverHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__VehicleDriverHistoryClient<$Result.GetResult<Prisma.$VehicleDriverHistoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VehicleDriverHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleDriverHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VehicleDriverHistories
     * const vehicleDriverHistories = await prisma.vehicleDriverHistory.findMany()
     * 
     * // Get first 10 VehicleDriverHistories
     * const vehicleDriverHistories = await prisma.vehicleDriverHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const vehicleDriverHistoryWithIdOnly = await prisma.vehicleDriverHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VehicleDriverHistoryFindManyArgs>(args?: SelectSubset<T, VehicleDriverHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VehicleDriverHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VehicleDriverHistory.
     * @param {VehicleDriverHistoryCreateArgs} args - Arguments to create a VehicleDriverHistory.
     * @example
     * // Create one VehicleDriverHistory
     * const VehicleDriverHistory = await prisma.vehicleDriverHistory.create({
     *   data: {
     *     // ... data to create a VehicleDriverHistory
     *   }
     * })
     * 
     */
    create<T extends VehicleDriverHistoryCreateArgs>(args: SelectSubset<T, VehicleDriverHistoryCreateArgs<ExtArgs>>): Prisma__VehicleDriverHistoryClient<$Result.GetResult<Prisma.$VehicleDriverHistoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VehicleDriverHistories.
     * @param {VehicleDriverHistoryCreateManyArgs} args - Arguments to create many VehicleDriverHistories.
     * @example
     * // Create many VehicleDriverHistories
     * const vehicleDriverHistory = await prisma.vehicleDriverHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VehicleDriverHistoryCreateManyArgs>(args?: SelectSubset<T, VehicleDriverHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VehicleDriverHistories and returns the data saved in the database.
     * @param {VehicleDriverHistoryCreateManyAndReturnArgs} args - Arguments to create many VehicleDriverHistories.
     * @example
     * // Create many VehicleDriverHistories
     * const vehicleDriverHistory = await prisma.vehicleDriverHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VehicleDriverHistories and only return the `id`
     * const vehicleDriverHistoryWithIdOnly = await prisma.vehicleDriverHistory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VehicleDriverHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, VehicleDriverHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VehicleDriverHistoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VehicleDriverHistory.
     * @param {VehicleDriverHistoryDeleteArgs} args - Arguments to delete one VehicleDriverHistory.
     * @example
     * // Delete one VehicleDriverHistory
     * const VehicleDriverHistory = await prisma.vehicleDriverHistory.delete({
     *   where: {
     *     // ... filter to delete one VehicleDriverHistory
     *   }
     * })
     * 
     */
    delete<T extends VehicleDriverHistoryDeleteArgs>(args: SelectSubset<T, VehicleDriverHistoryDeleteArgs<ExtArgs>>): Prisma__VehicleDriverHistoryClient<$Result.GetResult<Prisma.$VehicleDriverHistoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VehicleDriverHistory.
     * @param {VehicleDriverHistoryUpdateArgs} args - Arguments to update one VehicleDriverHistory.
     * @example
     * // Update one VehicleDriverHistory
     * const vehicleDriverHistory = await prisma.vehicleDriverHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VehicleDriverHistoryUpdateArgs>(args: SelectSubset<T, VehicleDriverHistoryUpdateArgs<ExtArgs>>): Prisma__VehicleDriverHistoryClient<$Result.GetResult<Prisma.$VehicleDriverHistoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VehicleDriverHistories.
     * @param {VehicleDriverHistoryDeleteManyArgs} args - Arguments to filter VehicleDriverHistories to delete.
     * @example
     * // Delete a few VehicleDriverHistories
     * const { count } = await prisma.vehicleDriverHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VehicleDriverHistoryDeleteManyArgs>(args?: SelectSubset<T, VehicleDriverHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VehicleDriverHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleDriverHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VehicleDriverHistories
     * const vehicleDriverHistory = await prisma.vehicleDriverHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VehicleDriverHistoryUpdateManyArgs>(args: SelectSubset<T, VehicleDriverHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VehicleDriverHistories and returns the data updated in the database.
     * @param {VehicleDriverHistoryUpdateManyAndReturnArgs} args - Arguments to update many VehicleDriverHistories.
     * @example
     * // Update many VehicleDriverHistories
     * const vehicleDriverHistory = await prisma.vehicleDriverHistory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VehicleDriverHistories and only return the `id`
     * const vehicleDriverHistoryWithIdOnly = await prisma.vehicleDriverHistory.updateManyAndReturn({
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
    updateManyAndReturn<T extends VehicleDriverHistoryUpdateManyAndReturnArgs>(args: SelectSubset<T, VehicleDriverHistoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VehicleDriverHistoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VehicleDriverHistory.
     * @param {VehicleDriverHistoryUpsertArgs} args - Arguments to update or create a VehicleDriverHistory.
     * @example
     * // Update or create a VehicleDriverHistory
     * const vehicleDriverHistory = await prisma.vehicleDriverHistory.upsert({
     *   create: {
     *     // ... data to create a VehicleDriverHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VehicleDriverHistory we want to update
     *   }
     * })
     */
    upsert<T extends VehicleDriverHistoryUpsertArgs>(args: SelectSubset<T, VehicleDriverHistoryUpsertArgs<ExtArgs>>): Prisma__VehicleDriverHistoryClient<$Result.GetResult<Prisma.$VehicleDriverHistoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VehicleDriverHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleDriverHistoryCountArgs} args - Arguments to filter VehicleDriverHistories to count.
     * @example
     * // Count the number of VehicleDriverHistories
     * const count = await prisma.vehicleDriverHistory.count({
     *   where: {
     *     // ... the filter for the VehicleDriverHistories we want to count
     *   }
     * })
    **/
    count<T extends VehicleDriverHistoryCountArgs>(
      args?: Subset<T, VehicleDriverHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VehicleDriverHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VehicleDriverHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleDriverHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends VehicleDriverHistoryAggregateArgs>(args: Subset<T, VehicleDriverHistoryAggregateArgs>): Prisma.PrismaPromise<GetVehicleDriverHistoryAggregateType<T>>

    /**
     * Group by VehicleDriverHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VehicleDriverHistoryGroupByArgs} args - Group by arguments.
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
      T extends VehicleDriverHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VehicleDriverHistoryGroupByArgs['orderBy'] }
        : { orderBy?: VehicleDriverHistoryGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, VehicleDriverHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVehicleDriverHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VehicleDriverHistory model
   */
  readonly fields: VehicleDriverHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VehicleDriverHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VehicleDriverHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends VehicleDriverHistory$userArgs<ExtArgs> = {}>(args?: Subset<T, VehicleDriverHistory$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    vehicle<T extends VehicleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VehicleDefaultArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the VehicleDriverHistory model
   */
  interface VehicleDriverHistoryFieldRefs {
    readonly id: FieldRef<"VehicleDriverHistory", 'String'>
    readonly vehicleId: FieldRef<"VehicleDriverHistory", 'String'>
    readonly driverName: FieldRef<"VehicleDriverHistory", 'String'>
    readonly changedAt: FieldRef<"VehicleDriverHistory", 'DateTime'>
    readonly changedBy: FieldRef<"VehicleDriverHistory", 'String'>
  }
    

  // Custom InputTypes
  /**
   * VehicleDriverHistory findUnique
   */
  export type VehicleDriverHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryInclude<ExtArgs> | null
    /**
     * Filter, which VehicleDriverHistory to fetch.
     */
    where: VehicleDriverHistoryWhereUniqueInput
  }

  /**
   * VehicleDriverHistory findUniqueOrThrow
   */
  export type VehicleDriverHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryInclude<ExtArgs> | null
    /**
     * Filter, which VehicleDriverHistory to fetch.
     */
    where: VehicleDriverHistoryWhereUniqueInput
  }

  /**
   * VehicleDriverHistory findFirst
   */
  export type VehicleDriverHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryInclude<ExtArgs> | null
    /**
     * Filter, which VehicleDriverHistory to fetch.
     */
    where?: VehicleDriverHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VehicleDriverHistories to fetch.
     */
    orderBy?: VehicleDriverHistoryOrderByWithRelationInput | VehicleDriverHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VehicleDriverHistories.
     */
    cursor?: VehicleDriverHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VehicleDriverHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VehicleDriverHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VehicleDriverHistories.
     */
    distinct?: VehicleDriverHistoryScalarFieldEnum | VehicleDriverHistoryScalarFieldEnum[]
  }

  /**
   * VehicleDriverHistory findFirstOrThrow
   */
  export type VehicleDriverHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryInclude<ExtArgs> | null
    /**
     * Filter, which VehicleDriverHistory to fetch.
     */
    where?: VehicleDriverHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VehicleDriverHistories to fetch.
     */
    orderBy?: VehicleDriverHistoryOrderByWithRelationInput | VehicleDriverHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VehicleDriverHistories.
     */
    cursor?: VehicleDriverHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VehicleDriverHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VehicleDriverHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VehicleDriverHistories.
     */
    distinct?: VehicleDriverHistoryScalarFieldEnum | VehicleDriverHistoryScalarFieldEnum[]
  }

  /**
   * VehicleDriverHistory findMany
   */
  export type VehicleDriverHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryInclude<ExtArgs> | null
    /**
     * Filter, which VehicleDriverHistories to fetch.
     */
    where?: VehicleDriverHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VehicleDriverHistories to fetch.
     */
    orderBy?: VehicleDriverHistoryOrderByWithRelationInput | VehicleDriverHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VehicleDriverHistories.
     */
    cursor?: VehicleDriverHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VehicleDriverHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VehicleDriverHistories.
     */
    skip?: number
    distinct?: VehicleDriverHistoryScalarFieldEnum | VehicleDriverHistoryScalarFieldEnum[]
  }

  /**
   * VehicleDriverHistory create
   */
  export type VehicleDriverHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryInclude<ExtArgs> | null
    /**
     * The data needed to create a VehicleDriverHistory.
     */
    data: XOR<VehicleDriverHistoryCreateInput, VehicleDriverHistoryUncheckedCreateInput>
  }

  /**
   * VehicleDriverHistory createMany
   */
  export type VehicleDriverHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VehicleDriverHistories.
     */
    data: VehicleDriverHistoryCreateManyInput | VehicleDriverHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VehicleDriverHistory createManyAndReturn
   */
  export type VehicleDriverHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * The data used to create many VehicleDriverHistories.
     */
    data: VehicleDriverHistoryCreateManyInput | VehicleDriverHistoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * VehicleDriverHistory update
   */
  export type VehicleDriverHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryInclude<ExtArgs> | null
    /**
     * The data needed to update a VehicleDriverHistory.
     */
    data: XOR<VehicleDriverHistoryUpdateInput, VehicleDriverHistoryUncheckedUpdateInput>
    /**
     * Choose, which VehicleDriverHistory to update.
     */
    where: VehicleDriverHistoryWhereUniqueInput
  }

  /**
   * VehicleDriverHistory updateMany
   */
  export type VehicleDriverHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VehicleDriverHistories.
     */
    data: XOR<VehicleDriverHistoryUpdateManyMutationInput, VehicleDriverHistoryUncheckedUpdateManyInput>
    /**
     * Filter which VehicleDriverHistories to update
     */
    where?: VehicleDriverHistoryWhereInput
    /**
     * Limit how many VehicleDriverHistories to update.
     */
    limit?: number
  }

  /**
   * VehicleDriverHistory updateManyAndReturn
   */
  export type VehicleDriverHistoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * The data used to update VehicleDriverHistories.
     */
    data: XOR<VehicleDriverHistoryUpdateManyMutationInput, VehicleDriverHistoryUncheckedUpdateManyInput>
    /**
     * Filter which VehicleDriverHistories to update
     */
    where?: VehicleDriverHistoryWhereInput
    /**
     * Limit how many VehicleDriverHistories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * VehicleDriverHistory upsert
   */
  export type VehicleDriverHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryInclude<ExtArgs> | null
    /**
     * The filter to search for the VehicleDriverHistory to update in case it exists.
     */
    where: VehicleDriverHistoryWhereUniqueInput
    /**
     * In case the VehicleDriverHistory found by the `where` argument doesn't exist, create a new VehicleDriverHistory with this data.
     */
    create: XOR<VehicleDriverHistoryCreateInput, VehicleDriverHistoryUncheckedCreateInput>
    /**
     * In case the VehicleDriverHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VehicleDriverHistoryUpdateInput, VehicleDriverHistoryUncheckedUpdateInput>
  }

  /**
   * VehicleDriverHistory delete
   */
  export type VehicleDriverHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryInclude<ExtArgs> | null
    /**
     * Filter which VehicleDriverHistory to delete.
     */
    where: VehicleDriverHistoryWhereUniqueInput
  }

  /**
   * VehicleDriverHistory deleteMany
   */
  export type VehicleDriverHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VehicleDriverHistories to delete
     */
    where?: VehicleDriverHistoryWhereInput
    /**
     * Limit how many VehicleDriverHistories to delete.
     */
    limit?: number
  }

  /**
   * VehicleDriverHistory.user
   */
  export type VehicleDriverHistory$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * VehicleDriverHistory without action
   */
  export type VehicleDriverHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VehicleDriverHistory
     */
    select?: VehicleDriverHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the VehicleDriverHistory
     */
    omit?: VehicleDriverHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VehicleDriverHistoryInclude<ExtArgs> | null
  }


  /**
   * Model TestSchedule
   */

  export type AggregateTestSchedule = {
    _count: TestScheduleCountAggregateOutputType | null
    _avg: TestScheduleAvgAggregateOutputType | null
    _sum: TestScheduleSumAggregateOutputType | null
    _min: TestScheduleMinAggregateOutputType | null
    _max: TestScheduleMaxAggregateOutputType | null
  }

  export type TestScheduleAvgAggregateOutputType = {
    quarter: number | null
    year: number | null
  }

  export type TestScheduleSumAggregateOutputType = {
    quarter: number | null
    year: number | null
  }

  export type TestScheduleMinAggregateOutputType = {
    id: string | null
    assignedPersonnel: string | null
    conductedOn: Date | null
    location: string | null
    quarter: number | null
    year: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TestScheduleMaxAggregateOutputType = {
    id: string | null
    assignedPersonnel: string | null
    conductedOn: Date | null
    location: string | null
    quarter: number | null
    year: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TestScheduleCountAggregateOutputType = {
    id: number
    assignedPersonnel: number
    conductedOn: number
    location: number
    quarter: number
    year: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TestScheduleAvgAggregateInputType = {
    quarter?: true
    year?: true
  }

  export type TestScheduleSumAggregateInputType = {
    quarter?: true
    year?: true
  }

  export type TestScheduleMinAggregateInputType = {
    id?: true
    assignedPersonnel?: true
    conductedOn?: true
    location?: true
    quarter?: true
    year?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TestScheduleMaxAggregateInputType = {
    id?: true
    assignedPersonnel?: true
    conductedOn?: true
    location?: true
    quarter?: true
    year?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TestScheduleCountAggregateInputType = {
    id?: true
    assignedPersonnel?: true
    conductedOn?: true
    location?: true
    quarter?: true
    year?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TestScheduleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TestSchedule to aggregate.
     */
    where?: TestScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestSchedules to fetch.
     */
    orderBy?: TestScheduleOrderByWithRelationInput | TestScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TestScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestSchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestSchedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TestSchedules
    **/
    _count?: true | TestScheduleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TestScheduleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TestScheduleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TestScheduleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TestScheduleMaxAggregateInputType
  }

  export type GetTestScheduleAggregateType<T extends TestScheduleAggregateArgs> = {
        [P in keyof T & keyof AggregateTestSchedule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTestSchedule[P]>
      : GetScalarType<T[P], AggregateTestSchedule[P]>
  }




  export type TestScheduleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TestScheduleWhereInput
    orderBy?: TestScheduleOrderByWithAggregationInput | TestScheduleOrderByWithAggregationInput[]
    by: TestScheduleScalarFieldEnum[] | TestScheduleScalarFieldEnum
    having?: TestScheduleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TestScheduleCountAggregateInputType | true
    _avg?: TestScheduleAvgAggregateInputType
    _sum?: TestScheduleSumAggregateInputType
    _min?: TestScheduleMinAggregateInputType
    _max?: TestScheduleMaxAggregateInputType
  }

  export type TestScheduleGroupByOutputType = {
    id: string
    assignedPersonnel: string
    conductedOn: Date
    location: string
    quarter: number
    year: number
    createdAt: Date
    updatedAt: Date
    _count: TestScheduleCountAggregateOutputType | null
    _avg: TestScheduleAvgAggregateOutputType | null
    _sum: TestScheduleSumAggregateOutputType | null
    _min: TestScheduleMinAggregateOutputType | null
    _max: TestScheduleMaxAggregateOutputType | null
  }

  type GetTestScheduleGroupByPayload<T extends TestScheduleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TestScheduleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TestScheduleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TestScheduleGroupByOutputType[P]>
            : GetScalarType<T[P], TestScheduleGroupByOutputType[P]>
        }
      >
    >


  export type TestScheduleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assignedPersonnel?: boolean
    conductedOn?: boolean
    location?: boolean
    quarter?: boolean
    year?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["testSchedule"]>

  export type TestScheduleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assignedPersonnel?: boolean
    conductedOn?: boolean
    location?: boolean
    quarter?: boolean
    year?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["testSchedule"]>

  export type TestScheduleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assignedPersonnel?: boolean
    conductedOn?: boolean
    location?: boolean
    quarter?: boolean
    year?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["testSchedule"]>

  export type TestScheduleSelectScalar = {
    id?: boolean
    assignedPersonnel?: boolean
    conductedOn?: boolean
    location?: boolean
    quarter?: boolean
    year?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TestScheduleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "assignedPersonnel" | "conductedOn" | "location" | "quarter" | "year" | "createdAt" | "updatedAt", ExtArgs["result"]["testSchedule"]>

  export type $TestSchedulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TestSchedule"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      assignedPersonnel: string
      conductedOn: Date
      location: string
      quarter: number
      year: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["testSchedule"]>
    composites: {}
  }

  type TestScheduleGetPayload<S extends boolean | null | undefined | TestScheduleDefaultArgs> = $Result.GetResult<Prisma.$TestSchedulePayload, S>

  type TestScheduleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TestScheduleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TestScheduleCountAggregateInputType | true
    }

  export interface TestScheduleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TestSchedule'], meta: { name: 'TestSchedule' } }
    /**
     * Find zero or one TestSchedule that matches the filter.
     * @param {TestScheduleFindUniqueArgs} args - Arguments to find a TestSchedule
     * @example
     * // Get one TestSchedule
     * const testSchedule = await prisma.testSchedule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TestScheduleFindUniqueArgs>(args: SelectSubset<T, TestScheduleFindUniqueArgs<ExtArgs>>): Prisma__TestScheduleClient<$Result.GetResult<Prisma.$TestSchedulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TestSchedule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TestScheduleFindUniqueOrThrowArgs} args - Arguments to find a TestSchedule
     * @example
     * // Get one TestSchedule
     * const testSchedule = await prisma.testSchedule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TestScheduleFindUniqueOrThrowArgs>(args: SelectSubset<T, TestScheduleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TestScheduleClient<$Result.GetResult<Prisma.$TestSchedulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TestSchedule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestScheduleFindFirstArgs} args - Arguments to find a TestSchedule
     * @example
     * // Get one TestSchedule
     * const testSchedule = await prisma.testSchedule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TestScheduleFindFirstArgs>(args?: SelectSubset<T, TestScheduleFindFirstArgs<ExtArgs>>): Prisma__TestScheduleClient<$Result.GetResult<Prisma.$TestSchedulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TestSchedule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestScheduleFindFirstOrThrowArgs} args - Arguments to find a TestSchedule
     * @example
     * // Get one TestSchedule
     * const testSchedule = await prisma.testSchedule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TestScheduleFindFirstOrThrowArgs>(args?: SelectSubset<T, TestScheduleFindFirstOrThrowArgs<ExtArgs>>): Prisma__TestScheduleClient<$Result.GetResult<Prisma.$TestSchedulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TestSchedules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestScheduleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TestSchedules
     * const testSchedules = await prisma.testSchedule.findMany()
     * 
     * // Get first 10 TestSchedules
     * const testSchedules = await prisma.testSchedule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const testScheduleWithIdOnly = await prisma.testSchedule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TestScheduleFindManyArgs>(args?: SelectSubset<T, TestScheduleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestSchedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TestSchedule.
     * @param {TestScheduleCreateArgs} args - Arguments to create a TestSchedule.
     * @example
     * // Create one TestSchedule
     * const TestSchedule = await prisma.testSchedule.create({
     *   data: {
     *     // ... data to create a TestSchedule
     *   }
     * })
     * 
     */
    create<T extends TestScheduleCreateArgs>(args: SelectSubset<T, TestScheduleCreateArgs<ExtArgs>>): Prisma__TestScheduleClient<$Result.GetResult<Prisma.$TestSchedulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TestSchedules.
     * @param {TestScheduleCreateManyArgs} args - Arguments to create many TestSchedules.
     * @example
     * // Create many TestSchedules
     * const testSchedule = await prisma.testSchedule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TestScheduleCreateManyArgs>(args?: SelectSubset<T, TestScheduleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TestSchedules and returns the data saved in the database.
     * @param {TestScheduleCreateManyAndReturnArgs} args - Arguments to create many TestSchedules.
     * @example
     * // Create many TestSchedules
     * const testSchedule = await prisma.testSchedule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TestSchedules and only return the `id`
     * const testScheduleWithIdOnly = await prisma.testSchedule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TestScheduleCreateManyAndReturnArgs>(args?: SelectSubset<T, TestScheduleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestSchedulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TestSchedule.
     * @param {TestScheduleDeleteArgs} args - Arguments to delete one TestSchedule.
     * @example
     * // Delete one TestSchedule
     * const TestSchedule = await prisma.testSchedule.delete({
     *   where: {
     *     // ... filter to delete one TestSchedule
     *   }
     * })
     * 
     */
    delete<T extends TestScheduleDeleteArgs>(args: SelectSubset<T, TestScheduleDeleteArgs<ExtArgs>>): Prisma__TestScheduleClient<$Result.GetResult<Prisma.$TestSchedulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TestSchedule.
     * @param {TestScheduleUpdateArgs} args - Arguments to update one TestSchedule.
     * @example
     * // Update one TestSchedule
     * const testSchedule = await prisma.testSchedule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TestScheduleUpdateArgs>(args: SelectSubset<T, TestScheduleUpdateArgs<ExtArgs>>): Prisma__TestScheduleClient<$Result.GetResult<Prisma.$TestSchedulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TestSchedules.
     * @param {TestScheduleDeleteManyArgs} args - Arguments to filter TestSchedules to delete.
     * @example
     * // Delete a few TestSchedules
     * const { count } = await prisma.testSchedule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TestScheduleDeleteManyArgs>(args?: SelectSubset<T, TestScheduleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TestSchedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestScheduleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TestSchedules
     * const testSchedule = await prisma.testSchedule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TestScheduleUpdateManyArgs>(args: SelectSubset<T, TestScheduleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TestSchedules and returns the data updated in the database.
     * @param {TestScheduleUpdateManyAndReturnArgs} args - Arguments to update many TestSchedules.
     * @example
     * // Update many TestSchedules
     * const testSchedule = await prisma.testSchedule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TestSchedules and only return the `id`
     * const testScheduleWithIdOnly = await prisma.testSchedule.updateManyAndReturn({
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
    updateManyAndReturn<T extends TestScheduleUpdateManyAndReturnArgs>(args: SelectSubset<T, TestScheduleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestSchedulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TestSchedule.
     * @param {TestScheduleUpsertArgs} args - Arguments to update or create a TestSchedule.
     * @example
     * // Update or create a TestSchedule
     * const testSchedule = await prisma.testSchedule.upsert({
     *   create: {
     *     // ... data to create a TestSchedule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TestSchedule we want to update
     *   }
     * })
     */
    upsert<T extends TestScheduleUpsertArgs>(args: SelectSubset<T, TestScheduleUpsertArgs<ExtArgs>>): Prisma__TestScheduleClient<$Result.GetResult<Prisma.$TestSchedulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TestSchedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestScheduleCountArgs} args - Arguments to filter TestSchedules to count.
     * @example
     * // Count the number of TestSchedules
     * const count = await prisma.testSchedule.count({
     *   where: {
     *     // ... the filter for the TestSchedules we want to count
     *   }
     * })
    **/
    count<T extends TestScheduleCountArgs>(
      args?: Subset<T, TestScheduleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TestScheduleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TestSchedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestScheduleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TestScheduleAggregateArgs>(args: Subset<T, TestScheduleAggregateArgs>): Prisma.PrismaPromise<GetTestScheduleAggregateType<T>>

    /**
     * Group by TestSchedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestScheduleGroupByArgs} args - Group by arguments.
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
      T extends TestScheduleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TestScheduleGroupByArgs['orderBy'] }
        : { orderBy?: TestScheduleGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TestScheduleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTestScheduleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TestSchedule model
   */
  readonly fields: TestScheduleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TestSchedule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TestScheduleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the TestSchedule model
   */
  interface TestScheduleFieldRefs {
    readonly id: FieldRef<"TestSchedule", 'String'>
    readonly assignedPersonnel: FieldRef<"TestSchedule", 'String'>
    readonly conductedOn: FieldRef<"TestSchedule", 'DateTime'>
    readonly location: FieldRef<"TestSchedule", 'String'>
    readonly quarter: FieldRef<"TestSchedule", 'Int'>
    readonly year: FieldRef<"TestSchedule", 'Int'>
    readonly createdAt: FieldRef<"TestSchedule", 'DateTime'>
    readonly updatedAt: FieldRef<"TestSchedule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TestSchedule findUnique
   */
  export type TestScheduleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSchedule
     */
    select?: TestScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestSchedule
     */
    omit?: TestScheduleOmit<ExtArgs> | null
    /**
     * Filter, which TestSchedule to fetch.
     */
    where: TestScheduleWhereUniqueInput
  }

  /**
   * TestSchedule findUniqueOrThrow
   */
  export type TestScheduleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSchedule
     */
    select?: TestScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestSchedule
     */
    omit?: TestScheduleOmit<ExtArgs> | null
    /**
     * Filter, which TestSchedule to fetch.
     */
    where: TestScheduleWhereUniqueInput
  }

  /**
   * TestSchedule findFirst
   */
  export type TestScheduleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSchedule
     */
    select?: TestScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestSchedule
     */
    omit?: TestScheduleOmit<ExtArgs> | null
    /**
     * Filter, which TestSchedule to fetch.
     */
    where?: TestScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestSchedules to fetch.
     */
    orderBy?: TestScheduleOrderByWithRelationInput | TestScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TestSchedules.
     */
    cursor?: TestScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestSchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestSchedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TestSchedules.
     */
    distinct?: TestScheduleScalarFieldEnum | TestScheduleScalarFieldEnum[]
  }

  /**
   * TestSchedule findFirstOrThrow
   */
  export type TestScheduleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSchedule
     */
    select?: TestScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestSchedule
     */
    omit?: TestScheduleOmit<ExtArgs> | null
    /**
     * Filter, which TestSchedule to fetch.
     */
    where?: TestScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestSchedules to fetch.
     */
    orderBy?: TestScheduleOrderByWithRelationInput | TestScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TestSchedules.
     */
    cursor?: TestScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestSchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestSchedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TestSchedules.
     */
    distinct?: TestScheduleScalarFieldEnum | TestScheduleScalarFieldEnum[]
  }

  /**
   * TestSchedule findMany
   */
  export type TestScheduleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSchedule
     */
    select?: TestScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestSchedule
     */
    omit?: TestScheduleOmit<ExtArgs> | null
    /**
     * Filter, which TestSchedules to fetch.
     */
    where?: TestScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TestSchedules to fetch.
     */
    orderBy?: TestScheduleOrderByWithRelationInput | TestScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TestSchedules.
     */
    cursor?: TestScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TestSchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TestSchedules.
     */
    skip?: number
    distinct?: TestScheduleScalarFieldEnum | TestScheduleScalarFieldEnum[]
  }

  /**
   * TestSchedule create
   */
  export type TestScheduleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSchedule
     */
    select?: TestScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestSchedule
     */
    omit?: TestScheduleOmit<ExtArgs> | null
    /**
     * The data needed to create a TestSchedule.
     */
    data: XOR<TestScheduleCreateInput, TestScheduleUncheckedCreateInput>
  }

  /**
   * TestSchedule createMany
   */
  export type TestScheduleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TestSchedules.
     */
    data: TestScheduleCreateManyInput | TestScheduleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TestSchedule createManyAndReturn
   */
  export type TestScheduleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSchedule
     */
    select?: TestScheduleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TestSchedule
     */
    omit?: TestScheduleOmit<ExtArgs> | null
    /**
     * The data used to create many TestSchedules.
     */
    data: TestScheduleCreateManyInput | TestScheduleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TestSchedule update
   */
  export type TestScheduleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSchedule
     */
    select?: TestScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestSchedule
     */
    omit?: TestScheduleOmit<ExtArgs> | null
    /**
     * The data needed to update a TestSchedule.
     */
    data: XOR<TestScheduleUpdateInput, TestScheduleUncheckedUpdateInput>
    /**
     * Choose, which TestSchedule to update.
     */
    where: TestScheduleWhereUniqueInput
  }

  /**
   * TestSchedule updateMany
   */
  export type TestScheduleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TestSchedules.
     */
    data: XOR<TestScheduleUpdateManyMutationInput, TestScheduleUncheckedUpdateManyInput>
    /**
     * Filter which TestSchedules to update
     */
    where?: TestScheduleWhereInput
    /**
     * Limit how many TestSchedules to update.
     */
    limit?: number
  }

  /**
   * TestSchedule updateManyAndReturn
   */
  export type TestScheduleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSchedule
     */
    select?: TestScheduleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TestSchedule
     */
    omit?: TestScheduleOmit<ExtArgs> | null
    /**
     * The data used to update TestSchedules.
     */
    data: XOR<TestScheduleUpdateManyMutationInput, TestScheduleUncheckedUpdateManyInput>
    /**
     * Filter which TestSchedules to update
     */
    where?: TestScheduleWhereInput
    /**
     * Limit how many TestSchedules to update.
     */
    limit?: number
  }

  /**
   * TestSchedule upsert
   */
  export type TestScheduleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSchedule
     */
    select?: TestScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestSchedule
     */
    omit?: TestScheduleOmit<ExtArgs> | null
    /**
     * The filter to search for the TestSchedule to update in case it exists.
     */
    where: TestScheduleWhereUniqueInput
    /**
     * In case the TestSchedule found by the `where` argument doesn't exist, create a new TestSchedule with this data.
     */
    create: XOR<TestScheduleCreateInput, TestScheduleUncheckedCreateInput>
    /**
     * In case the TestSchedule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TestScheduleUpdateInput, TestScheduleUncheckedUpdateInput>
  }

  /**
   * TestSchedule delete
   */
  export type TestScheduleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSchedule
     */
    select?: TestScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestSchedule
     */
    omit?: TestScheduleOmit<ExtArgs> | null
    /**
     * Filter which TestSchedule to delete.
     */
    where: TestScheduleWhereUniqueInput
  }

  /**
   * TestSchedule deleteMany
   */
  export type TestScheduleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TestSchedules to delete
     */
    where?: TestScheduleWhereInput
    /**
     * Limit how many TestSchedules to delete.
     */
    limit?: number
  }

  /**
   * TestSchedule without action
   */
  export type TestScheduleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TestSchedule
     */
    select?: TestScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TestSchedule
     */
    omit?: TestScheduleOmit<ExtArgs> | null
  }


  /**
   * Model Test
   */

  export type AggregateTest = {
    _count: TestCountAggregateOutputType | null
    _avg: TestAvgAggregateOutputType | null
    _sum: TestSumAggregateOutputType | null
    _min: TestMinAggregateOutputType | null
    _max: TestMaxAggregateOutputType | null
  }

  export type TestAvgAggregateOutputType = {
    quarter: number | null
    year: number | null
  }

  export type TestSumAggregateOutputType = {
    quarter: number | null
    year: number | null
  }

  export type TestMinAggregateOutputType = {
    id: string | null
    vehicleId: string | null
    testDate: Date | null
    quarter: number | null
    year: number | null
    result: boolean | null
    createdBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TestMaxAggregateOutputType = {
    id: string | null
    vehicleId: string | null
    testDate: Date | null
    quarter: number | null
    year: number | null
    result: boolean | null
    createdBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TestCountAggregateOutputType = {
    id: number
    vehicleId: number
    testDate: number
    quarter: number
    year: number
    result: number
    createdBy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TestAvgAggregateInputType = {
    quarter?: true
    year?: true
  }

  export type TestSumAggregateInputType = {
    quarter?: true
    year?: true
  }

  export type TestMinAggregateInputType = {
    id?: true
    vehicleId?: true
    testDate?: true
    quarter?: true
    year?: true
    result?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TestMaxAggregateInputType = {
    id?: true
    vehicleId?: true
    testDate?: true
    quarter?: true
    year?: true
    result?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TestCountAggregateInputType = {
    id?: true
    vehicleId?: true
    testDate?: true
    quarter?: true
    year?: true
    result?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Test to aggregate.
     */
    where?: TestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tests to fetch.
     */
    orderBy?: TestOrderByWithRelationInput | TestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tests
    **/
    _count?: true | TestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TestAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TestSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TestMaxAggregateInputType
  }

  export type GetTestAggregateType<T extends TestAggregateArgs> = {
        [P in keyof T & keyof AggregateTest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTest[P]>
      : GetScalarType<T[P], AggregateTest[P]>
  }




  export type TestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TestWhereInput
    orderBy?: TestOrderByWithAggregationInput | TestOrderByWithAggregationInput[]
    by: TestScalarFieldEnum[] | TestScalarFieldEnum
    having?: TestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TestCountAggregateInputType | true
    _avg?: TestAvgAggregateInputType
    _sum?: TestSumAggregateInputType
    _min?: TestMinAggregateInputType
    _max?: TestMaxAggregateInputType
  }

  export type TestGroupByOutputType = {
    id: string
    vehicleId: string
    testDate: Date
    quarter: number
    year: number
    result: boolean
    createdBy: string | null
    createdAt: Date
    updatedAt: Date
    _count: TestCountAggregateOutputType | null
    _avg: TestAvgAggregateOutputType | null
    _sum: TestSumAggregateOutputType | null
    _min: TestMinAggregateOutputType | null
    _max: TestMaxAggregateOutputType | null
  }

  type GetTestGroupByPayload<T extends TestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TestGroupByOutputType[P]>
            : GetScalarType<T[P], TestGroupByOutputType[P]>
        }
      >
    >


  export type TestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vehicleId?: boolean
    testDate?: boolean
    quarter?: boolean
    year?: boolean
    result?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | Test$userArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["test"]>

  export type TestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vehicleId?: boolean
    testDate?: boolean
    quarter?: boolean
    year?: boolean
    result?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | Test$userArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["test"]>

  export type TestSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vehicleId?: boolean
    testDate?: boolean
    quarter?: boolean
    year?: boolean
    result?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | Test$userArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["test"]>

  export type TestSelectScalar = {
    id?: boolean
    vehicleId?: boolean
    testDate?: boolean
    quarter?: boolean
    year?: boolean
    result?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "vehicleId" | "testDate" | "quarter" | "year" | "result" | "createdBy" | "createdAt" | "updatedAt", ExtArgs["result"]["test"]>
  export type TestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Test$userArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
  }
  export type TestIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Test$userArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
  }
  export type TestIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Test$userArgs<ExtArgs>
    vehicle?: boolean | VehicleDefaultArgs<ExtArgs>
  }

  export type $TestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Test"
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null
      vehicle: Prisma.$VehiclePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      vehicleId: string
      testDate: Date
      quarter: number
      year: number
      result: boolean
      createdBy: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["test"]>
    composites: {}
  }

  type TestGetPayload<S extends boolean | null | undefined | TestDefaultArgs> = $Result.GetResult<Prisma.$TestPayload, S>

  type TestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TestCountAggregateInputType | true
    }

  export interface TestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Test'], meta: { name: 'Test' } }
    /**
     * Find zero or one Test that matches the filter.
     * @param {TestFindUniqueArgs} args - Arguments to find a Test
     * @example
     * // Get one Test
     * const test = await prisma.test.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TestFindUniqueArgs>(args: SelectSubset<T, TestFindUniqueArgs<ExtArgs>>): Prisma__TestClient<$Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Test that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TestFindUniqueOrThrowArgs} args - Arguments to find a Test
     * @example
     * // Get one Test
     * const test = await prisma.test.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TestFindUniqueOrThrowArgs>(args: SelectSubset<T, TestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TestClient<$Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Test that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestFindFirstArgs} args - Arguments to find a Test
     * @example
     * // Get one Test
     * const test = await prisma.test.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TestFindFirstArgs>(args?: SelectSubset<T, TestFindFirstArgs<ExtArgs>>): Prisma__TestClient<$Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Test that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestFindFirstOrThrowArgs} args - Arguments to find a Test
     * @example
     * // Get one Test
     * const test = await prisma.test.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TestFindFirstOrThrowArgs>(args?: SelectSubset<T, TestFindFirstOrThrowArgs<ExtArgs>>): Prisma__TestClient<$Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tests
     * const tests = await prisma.test.findMany()
     * 
     * // Get first 10 Tests
     * const tests = await prisma.test.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const testWithIdOnly = await prisma.test.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TestFindManyArgs>(args?: SelectSubset<T, TestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Test.
     * @param {TestCreateArgs} args - Arguments to create a Test.
     * @example
     * // Create one Test
     * const Test = await prisma.test.create({
     *   data: {
     *     // ... data to create a Test
     *   }
     * })
     * 
     */
    create<T extends TestCreateArgs>(args: SelectSubset<T, TestCreateArgs<ExtArgs>>): Prisma__TestClient<$Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tests.
     * @param {TestCreateManyArgs} args - Arguments to create many Tests.
     * @example
     * // Create many Tests
     * const test = await prisma.test.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TestCreateManyArgs>(args?: SelectSubset<T, TestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tests and returns the data saved in the database.
     * @param {TestCreateManyAndReturnArgs} args - Arguments to create many Tests.
     * @example
     * // Create many Tests
     * const test = await prisma.test.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tests and only return the `id`
     * const testWithIdOnly = await prisma.test.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TestCreateManyAndReturnArgs>(args?: SelectSubset<T, TestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Test.
     * @param {TestDeleteArgs} args - Arguments to delete one Test.
     * @example
     * // Delete one Test
     * const Test = await prisma.test.delete({
     *   where: {
     *     // ... filter to delete one Test
     *   }
     * })
     * 
     */
    delete<T extends TestDeleteArgs>(args: SelectSubset<T, TestDeleteArgs<ExtArgs>>): Prisma__TestClient<$Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Test.
     * @param {TestUpdateArgs} args - Arguments to update one Test.
     * @example
     * // Update one Test
     * const test = await prisma.test.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TestUpdateArgs>(args: SelectSubset<T, TestUpdateArgs<ExtArgs>>): Prisma__TestClient<$Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tests.
     * @param {TestDeleteManyArgs} args - Arguments to filter Tests to delete.
     * @example
     * // Delete a few Tests
     * const { count } = await prisma.test.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TestDeleteManyArgs>(args?: SelectSubset<T, TestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tests
     * const test = await prisma.test.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TestUpdateManyArgs>(args: SelectSubset<T, TestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tests and returns the data updated in the database.
     * @param {TestUpdateManyAndReturnArgs} args - Arguments to update many Tests.
     * @example
     * // Update many Tests
     * const test = await prisma.test.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tests and only return the `id`
     * const testWithIdOnly = await prisma.test.updateManyAndReturn({
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
    updateManyAndReturn<T extends TestUpdateManyAndReturnArgs>(args: SelectSubset<T, TestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Test.
     * @param {TestUpsertArgs} args - Arguments to update or create a Test.
     * @example
     * // Update or create a Test
     * const test = await prisma.test.upsert({
     *   create: {
     *     // ... data to create a Test
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Test we want to update
     *   }
     * })
     */
    upsert<T extends TestUpsertArgs>(args: SelectSubset<T, TestUpsertArgs<ExtArgs>>): Prisma__TestClient<$Result.GetResult<Prisma.$TestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestCountArgs} args - Arguments to filter Tests to count.
     * @example
     * // Count the number of Tests
     * const count = await prisma.test.count({
     *   where: {
     *     // ... the filter for the Tests we want to count
     *   }
     * })
    **/
    count<T extends TestCountArgs>(
      args?: Subset<T, TestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Test.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TestAggregateArgs>(args: Subset<T, TestAggregateArgs>): Prisma.PrismaPromise<GetTestAggregateType<T>>

    /**
     * Group by Test.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestGroupByArgs} args - Group by arguments.
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
      T extends TestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TestGroupByArgs['orderBy'] }
        : { orderBy?: TestGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Test model
   */
  readonly fields: TestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Test.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends Test$userArgs<ExtArgs> = {}>(args?: Subset<T, Test$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    vehicle<T extends VehicleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VehicleDefaultArgs<ExtArgs>>): Prisma__VehicleClient<$Result.GetResult<Prisma.$VehiclePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Test model
   */
  interface TestFieldRefs {
    readonly id: FieldRef<"Test", 'String'>
    readonly vehicleId: FieldRef<"Test", 'String'>
    readonly testDate: FieldRef<"Test", 'DateTime'>
    readonly quarter: FieldRef<"Test", 'Int'>
    readonly year: FieldRef<"Test", 'Int'>
    readonly result: FieldRef<"Test", 'Boolean'>
    readonly createdBy: FieldRef<"Test", 'String'>
    readonly createdAt: FieldRef<"Test", 'DateTime'>
    readonly updatedAt: FieldRef<"Test", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Test findUnique
   */
  export type TestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestInclude<ExtArgs> | null
    /**
     * Filter, which Test to fetch.
     */
    where: TestWhereUniqueInput
  }

  /**
   * Test findUniqueOrThrow
   */
  export type TestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestInclude<ExtArgs> | null
    /**
     * Filter, which Test to fetch.
     */
    where: TestWhereUniqueInput
  }

  /**
   * Test findFirst
   */
  export type TestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestInclude<ExtArgs> | null
    /**
     * Filter, which Test to fetch.
     */
    where?: TestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tests to fetch.
     */
    orderBy?: TestOrderByWithRelationInput | TestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tests.
     */
    cursor?: TestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tests.
     */
    distinct?: TestScalarFieldEnum | TestScalarFieldEnum[]
  }

  /**
   * Test findFirstOrThrow
   */
  export type TestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestInclude<ExtArgs> | null
    /**
     * Filter, which Test to fetch.
     */
    where?: TestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tests to fetch.
     */
    orderBy?: TestOrderByWithRelationInput | TestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tests.
     */
    cursor?: TestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tests.
     */
    distinct?: TestScalarFieldEnum | TestScalarFieldEnum[]
  }

  /**
   * Test findMany
   */
  export type TestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestInclude<ExtArgs> | null
    /**
     * Filter, which Tests to fetch.
     */
    where?: TestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tests to fetch.
     */
    orderBy?: TestOrderByWithRelationInput | TestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tests.
     */
    cursor?: TestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tests.
     */
    skip?: number
    distinct?: TestScalarFieldEnum | TestScalarFieldEnum[]
  }

  /**
   * Test create
   */
  export type TestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestInclude<ExtArgs> | null
    /**
     * The data needed to create a Test.
     */
    data: XOR<TestCreateInput, TestUncheckedCreateInput>
  }

  /**
   * Test createMany
   */
  export type TestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tests.
     */
    data: TestCreateManyInput | TestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Test createManyAndReturn
   */
  export type TestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * The data used to create many Tests.
     */
    data: TestCreateManyInput | TestCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Test update
   */
  export type TestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestInclude<ExtArgs> | null
    /**
     * The data needed to update a Test.
     */
    data: XOR<TestUpdateInput, TestUncheckedUpdateInput>
    /**
     * Choose, which Test to update.
     */
    where: TestWhereUniqueInput
  }

  /**
   * Test updateMany
   */
  export type TestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tests.
     */
    data: XOR<TestUpdateManyMutationInput, TestUncheckedUpdateManyInput>
    /**
     * Filter which Tests to update
     */
    where?: TestWhereInput
    /**
     * Limit how many Tests to update.
     */
    limit?: number
  }

  /**
   * Test updateManyAndReturn
   */
  export type TestUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * The data used to update Tests.
     */
    data: XOR<TestUpdateManyMutationInput, TestUncheckedUpdateManyInput>
    /**
     * Filter which Tests to update
     */
    where?: TestWhereInput
    /**
     * Limit how many Tests to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Test upsert
   */
  export type TestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestInclude<ExtArgs> | null
    /**
     * The filter to search for the Test to update in case it exists.
     */
    where: TestWhereUniqueInput
    /**
     * In case the Test found by the `where` argument doesn't exist, create a new Test with this data.
     */
    create: XOR<TestCreateInput, TestUncheckedCreateInput>
    /**
     * In case the Test was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TestUpdateInput, TestUncheckedUpdateInput>
  }

  /**
   * Test delete
   */
  export type TestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestInclude<ExtArgs> | null
    /**
     * Filter which Test to delete.
     */
    where: TestWhereUniqueInput
  }

  /**
   * Test deleteMany
   */
  export type TestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tests to delete
     */
    where?: TestWhereInput
    /**
     * Limit how many Tests to delete.
     */
    limit?: number
  }

  /**
   * Test.user
   */
  export type Test$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * Test without action
   */
  export type TestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Test
     */
    select?: TestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Test
     */
    omit?: TestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TestInclude<ExtArgs> | null
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
    email: 'email',
    encryptedPassword: 'encryptedPassword',
    isSuperAdmin: 'isSuperAdmin',
    lastSignInAt: 'lastSignInAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const UserRoleMappingScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    role: 'role',
    createdAt: 'createdAt'
  };

  export type UserRoleMappingScalarFieldEnum = (typeof UserRoleMappingScalarFieldEnum)[keyof typeof UserRoleMappingScalarFieldEnum]


  export const ProfileScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    firstName: 'firstName',
    lastName: 'lastName',
    bio: 'bio',
    jobTitle: 'jobTitle',
    department: 'department',
    phoneNumber: 'phoneNumber',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProfileScalarFieldEnum = (typeof ProfileScalarFieldEnum)[keyof typeof ProfileScalarFieldEnum]


  export const FeeScalarFieldEnum: {
    id: 'id',
    amount: 'amount',
    category: 'category',
    level: 'level',
    effectiveDate: 'effectiveDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FeeScalarFieldEnum = (typeof FeeScalarFieldEnum)[keyof typeof FeeScalarFieldEnum]


  export const DriverScalarFieldEnum: {
    id: 'id',
    firstName: 'firstName',
    middleName: 'middleName',
    lastName: 'lastName',
    address: 'address',
    licenseNumber: 'licenseNumber',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DriverScalarFieldEnum = (typeof DriverScalarFieldEnum)[keyof typeof DriverScalarFieldEnum]


  export const RecordScalarFieldEnum: {
    id: 'id',
    plateNumber: 'plateNumber',
    vehicleType: 'vehicleType',
    transportGroup: 'transportGroup',
    operatorCompanyName: 'operatorCompanyName',
    operatorAddress: 'operatorAddress',
    ownerFirstName: 'ownerFirstName',
    ownerMiddleName: 'ownerMiddleName',
    ownerLastName: 'ownerLastName',
    motorNo: 'motorNo',
    motorVehicleName: 'motorVehicleName',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RecordScalarFieldEnum = (typeof RecordScalarFieldEnum)[keyof typeof RecordScalarFieldEnum]


  export const ViolationScalarFieldEnum: {
    id: 'id',
    recordId: 'recordId',
    ordinanceInfractionReportNo: 'ordinanceInfractionReportNo',
    smokeDensityTestResultNo: 'smokeDensityTestResultNo',
    placeOfApprehension: 'placeOfApprehension',
    dateOfApprehension: 'dateOfApprehension',
    paidDriver: 'paidDriver',
    paidOperator: 'paidOperator',
    driverId: 'driverId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ViolationScalarFieldEnum = (typeof ViolationScalarFieldEnum)[keyof typeof ViolationScalarFieldEnum]


  export const RecordHistoryScalarFieldEnum: {
    id: 'id',
    recordId: 'recordId',
    type: 'type',
    date: 'date',
    details: 'details',
    orNumber: 'orNumber',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RecordHistoryScalarFieldEnum = (typeof RecordHistoryScalarFieldEnum)[keyof typeof RecordHistoryScalarFieldEnum]


  export const VehicleScalarFieldEnum: {
    id: 'id',
    driverName: 'driverName',
    contactNumber: 'contactNumber',
    engineType: 'engineType',
    officeName: 'officeName',
    plateNumber: 'plateNumber',
    vehicleType: 'vehicleType',
    wheels: 'wheels',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VehicleScalarFieldEnum = (typeof VehicleScalarFieldEnum)[keyof typeof VehicleScalarFieldEnum]


  export const VehicleDriverHistoryScalarFieldEnum: {
    id: 'id',
    vehicleId: 'vehicleId',
    driverName: 'driverName',
    changedAt: 'changedAt',
    changedBy: 'changedBy'
  };

  export type VehicleDriverHistoryScalarFieldEnum = (typeof VehicleDriverHistoryScalarFieldEnum)[keyof typeof VehicleDriverHistoryScalarFieldEnum]


  export const TestScheduleScalarFieldEnum: {
    id: 'id',
    assignedPersonnel: 'assignedPersonnel',
    conductedOn: 'conductedOn',
    location: 'location',
    quarter: 'quarter',
    year: 'year',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TestScheduleScalarFieldEnum = (typeof TestScheduleScalarFieldEnum)[keyof typeof TestScheduleScalarFieldEnum]


  export const TestScalarFieldEnum: {
    id: 'id',
    vehicleId: 'vehicleId',
    testDate: 'testDate',
    quarter: 'quarter',
    year: 'year',
    result: 'result',
    createdBy: 'createdBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TestScalarFieldEnum = (typeof TestScalarFieldEnum)[keyof typeof TestScalarFieldEnum]


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
   * Reference to a field of type 'user_role'
   */
  export type Enumuser_roleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'user_role'>
    


  /**
   * Reference to a field of type 'user_role[]'
   */
  export type ListEnumuser_roleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'user_role[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


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
    id?: UuidFilter<"User"> | string
    email?: StringFilter<"User"> | string
    encryptedPassword?: StringFilter<"User"> | string
    isSuperAdmin?: BoolNullableFilter<"User"> | boolean | null
    lastSignInAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    profile?: XOR<ProfileNullableScalarRelationFilter, ProfileWhereInput> | null
    UserRoleMapping?: UserRoleMappingListRelationFilter
    tests?: TestListRelationFilter
    driverHistories?: VehicleDriverHistoryListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    encryptedPassword?: SortOrder
    isSuperAdmin?: SortOrderInput | SortOrder
    lastSignInAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    profile?: ProfileOrderByWithRelationInput
    UserRoleMapping?: UserRoleMappingOrderByRelationAggregateInput
    tests?: TestOrderByRelationAggregateInput
    driverHistories?: VehicleDriverHistoryOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    encryptedPassword?: StringFilter<"User"> | string
    isSuperAdmin?: BoolNullableFilter<"User"> | boolean | null
    lastSignInAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    deletedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    profile?: XOR<ProfileNullableScalarRelationFilter, ProfileWhereInput> | null
    UserRoleMapping?: UserRoleMappingListRelationFilter
    tests?: TestListRelationFilter
    driverHistories?: VehicleDriverHistoryListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    encryptedPassword?: SortOrder
    isSuperAdmin?: SortOrderInput | SortOrder
    lastSignInAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    encryptedPassword?: StringWithAggregatesFilter<"User"> | string
    isSuperAdmin?: BoolNullableWithAggregatesFilter<"User"> | boolean | null
    lastSignInAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
  }

  export type UserRoleMappingWhereInput = {
    AND?: UserRoleMappingWhereInput | UserRoleMappingWhereInput[]
    OR?: UserRoleMappingWhereInput[]
    NOT?: UserRoleMappingWhereInput | UserRoleMappingWhereInput[]
    id?: UuidFilter<"UserRoleMapping"> | string
    userId?: UuidFilter<"UserRoleMapping"> | string
    role?: Enumuser_roleFilter<"UserRoleMapping"> | $Enums.user_role
    createdAt?: DateTimeFilter<"UserRoleMapping"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserRoleMappingOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserRoleMappingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_role?: UserRoleMappingUserIdRoleCompoundUniqueInput
    AND?: UserRoleMappingWhereInput | UserRoleMappingWhereInput[]
    OR?: UserRoleMappingWhereInput[]
    NOT?: UserRoleMappingWhereInput | UserRoleMappingWhereInput[]
    userId?: UuidFilter<"UserRoleMapping"> | string
    role?: Enumuser_roleFilter<"UserRoleMapping"> | $Enums.user_role
    createdAt?: DateTimeFilter<"UserRoleMapping"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId_role">

  export type UserRoleMappingOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    _count?: UserRoleMappingCountOrderByAggregateInput
    _max?: UserRoleMappingMaxOrderByAggregateInput
    _min?: UserRoleMappingMinOrderByAggregateInput
  }

  export type UserRoleMappingScalarWhereWithAggregatesInput = {
    AND?: UserRoleMappingScalarWhereWithAggregatesInput | UserRoleMappingScalarWhereWithAggregatesInput[]
    OR?: UserRoleMappingScalarWhereWithAggregatesInput[]
    NOT?: UserRoleMappingScalarWhereWithAggregatesInput | UserRoleMappingScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"UserRoleMapping"> | string
    userId?: UuidWithAggregatesFilter<"UserRoleMapping"> | string
    role?: Enumuser_roleWithAggregatesFilter<"UserRoleMapping"> | $Enums.user_role
    createdAt?: DateTimeWithAggregatesFilter<"UserRoleMapping"> | Date | string
  }

  export type ProfileWhereInput = {
    AND?: ProfileWhereInput | ProfileWhereInput[]
    OR?: ProfileWhereInput[]
    NOT?: ProfileWhereInput | ProfileWhereInput[]
    id?: UuidFilter<"Profile"> | string
    userId?: UuidFilter<"Profile"> | string
    firstName?: StringNullableFilter<"Profile"> | string | null
    lastName?: StringNullableFilter<"Profile"> | string | null
    bio?: StringNullableFilter<"Profile"> | string | null
    jobTitle?: StringNullableFilter<"Profile"> | string | null
    department?: StringNullableFilter<"Profile"> | string | null
    phoneNumber?: StringNullableFilter<"Profile"> | string | null
    createdAt?: DateTimeFilter<"Profile"> | Date | string
    updatedAt?: DateTimeFilter<"Profile"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ProfileOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrderInput | SortOrder
    lastName?: SortOrderInput | SortOrder
    bio?: SortOrderInput | SortOrder
    jobTitle?: SortOrderInput | SortOrder
    department?: SortOrderInput | SortOrder
    phoneNumber?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type ProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: ProfileWhereInput | ProfileWhereInput[]
    OR?: ProfileWhereInput[]
    NOT?: ProfileWhereInput | ProfileWhereInput[]
    firstName?: StringNullableFilter<"Profile"> | string | null
    lastName?: StringNullableFilter<"Profile"> | string | null
    bio?: StringNullableFilter<"Profile"> | string | null
    jobTitle?: StringNullableFilter<"Profile"> | string | null
    department?: StringNullableFilter<"Profile"> | string | null
    phoneNumber?: StringNullableFilter<"Profile"> | string | null
    createdAt?: DateTimeFilter<"Profile"> | Date | string
    updatedAt?: DateTimeFilter<"Profile"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type ProfileOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrderInput | SortOrder
    lastName?: SortOrderInput | SortOrder
    bio?: SortOrderInput | SortOrder
    jobTitle?: SortOrderInput | SortOrder
    department?: SortOrderInput | SortOrder
    phoneNumber?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProfileCountOrderByAggregateInput
    _max?: ProfileMaxOrderByAggregateInput
    _min?: ProfileMinOrderByAggregateInput
  }

  export type ProfileScalarWhereWithAggregatesInput = {
    AND?: ProfileScalarWhereWithAggregatesInput | ProfileScalarWhereWithAggregatesInput[]
    OR?: ProfileScalarWhereWithAggregatesInput[]
    NOT?: ProfileScalarWhereWithAggregatesInput | ProfileScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Profile"> | string
    userId?: UuidWithAggregatesFilter<"Profile"> | string
    firstName?: StringNullableWithAggregatesFilter<"Profile"> | string | null
    lastName?: StringNullableWithAggregatesFilter<"Profile"> | string | null
    bio?: StringNullableWithAggregatesFilter<"Profile"> | string | null
    jobTitle?: StringNullableWithAggregatesFilter<"Profile"> | string | null
    department?: StringNullableWithAggregatesFilter<"Profile"> | string | null
    phoneNumber?: StringNullableWithAggregatesFilter<"Profile"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Profile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Profile"> | Date | string
  }

  export type FeeWhereInput = {
    AND?: FeeWhereInput | FeeWhereInput[]
    OR?: FeeWhereInput[]
    NOT?: FeeWhereInput | FeeWhereInput[]
    id?: IntFilter<"Fee"> | number
    amount?: DecimalFilter<"Fee"> | Decimal | DecimalJsLike | number | string
    category?: StringFilter<"Fee"> | string
    level?: IntFilter<"Fee"> | number
    effectiveDate?: DateTimeFilter<"Fee"> | Date | string
    createdAt?: DateTimeNullableFilter<"Fee"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"Fee"> | Date | string | null
  }

  export type FeeOrderByWithRelationInput = {
    id?: SortOrder
    amount?: SortOrder
    category?: SortOrder
    level?: SortOrder
    effectiveDate?: SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
  }

  export type FeeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: FeeWhereInput | FeeWhereInput[]
    OR?: FeeWhereInput[]
    NOT?: FeeWhereInput | FeeWhereInput[]
    amount?: DecimalFilter<"Fee"> | Decimal | DecimalJsLike | number | string
    category?: StringFilter<"Fee"> | string
    level?: IntFilter<"Fee"> | number
    effectiveDate?: DateTimeFilter<"Fee"> | Date | string
    createdAt?: DateTimeNullableFilter<"Fee"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"Fee"> | Date | string | null
  }, "id">

  export type FeeOrderByWithAggregationInput = {
    id?: SortOrder
    amount?: SortOrder
    category?: SortOrder
    level?: SortOrder
    effectiveDate?: SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    _count?: FeeCountOrderByAggregateInput
    _avg?: FeeAvgOrderByAggregateInput
    _max?: FeeMaxOrderByAggregateInput
    _min?: FeeMinOrderByAggregateInput
    _sum?: FeeSumOrderByAggregateInput
  }

  export type FeeScalarWhereWithAggregatesInput = {
    AND?: FeeScalarWhereWithAggregatesInput | FeeScalarWhereWithAggregatesInput[]
    OR?: FeeScalarWhereWithAggregatesInput[]
    NOT?: FeeScalarWhereWithAggregatesInput | FeeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Fee"> | number
    amount?: DecimalWithAggregatesFilter<"Fee"> | Decimal | DecimalJsLike | number | string
    category?: StringWithAggregatesFilter<"Fee"> | string
    level?: IntWithAggregatesFilter<"Fee"> | number
    effectiveDate?: DateTimeWithAggregatesFilter<"Fee"> | Date | string
    createdAt?: DateTimeNullableWithAggregatesFilter<"Fee"> | Date | string | null
    updatedAt?: DateTimeNullableWithAggregatesFilter<"Fee"> | Date | string | null
  }

  export type DriverWhereInput = {
    AND?: DriverWhereInput | DriverWhereInput[]
    OR?: DriverWhereInput[]
    NOT?: DriverWhereInput | DriverWhereInput[]
    id?: UuidFilter<"Driver"> | string
    firstName?: StringFilter<"Driver"> | string
    middleName?: StringNullableFilter<"Driver"> | string | null
    lastName?: StringFilter<"Driver"> | string
    address?: StringFilter<"Driver"> | string
    licenseNumber?: StringFilter<"Driver"> | string
    createdAt?: DateTimeNullableFilter<"Driver"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"Driver"> | Date | string | null
    violations?: ViolationListRelationFilter
  }

  export type DriverOrderByWithRelationInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrderInput | SortOrder
    lastName?: SortOrder
    address?: SortOrder
    licenseNumber?: SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    violations?: ViolationOrderByRelationAggregateInput
  }

  export type DriverWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    licenseNumber?: string
    AND?: DriverWhereInput | DriverWhereInput[]
    OR?: DriverWhereInput[]
    NOT?: DriverWhereInput | DriverWhereInput[]
    firstName?: StringFilter<"Driver"> | string
    middleName?: StringNullableFilter<"Driver"> | string | null
    lastName?: StringFilter<"Driver"> | string
    address?: StringFilter<"Driver"> | string
    createdAt?: DateTimeNullableFilter<"Driver"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"Driver"> | Date | string | null
    violations?: ViolationListRelationFilter
  }, "id" | "licenseNumber">

  export type DriverOrderByWithAggregationInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrderInput | SortOrder
    lastName?: SortOrder
    address?: SortOrder
    licenseNumber?: SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    _count?: DriverCountOrderByAggregateInput
    _max?: DriverMaxOrderByAggregateInput
    _min?: DriverMinOrderByAggregateInput
  }

  export type DriverScalarWhereWithAggregatesInput = {
    AND?: DriverScalarWhereWithAggregatesInput | DriverScalarWhereWithAggregatesInput[]
    OR?: DriverScalarWhereWithAggregatesInput[]
    NOT?: DriverScalarWhereWithAggregatesInput | DriverScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Driver"> | string
    firstName?: StringWithAggregatesFilter<"Driver"> | string
    middleName?: StringNullableWithAggregatesFilter<"Driver"> | string | null
    lastName?: StringWithAggregatesFilter<"Driver"> | string
    address?: StringWithAggregatesFilter<"Driver"> | string
    licenseNumber?: StringWithAggregatesFilter<"Driver"> | string
    createdAt?: DateTimeNullableWithAggregatesFilter<"Driver"> | Date | string | null
    updatedAt?: DateTimeNullableWithAggregatesFilter<"Driver"> | Date | string | null
  }

  export type RecordWhereInput = {
    AND?: RecordWhereInput | RecordWhereInput[]
    OR?: RecordWhereInput[]
    NOT?: RecordWhereInput | RecordWhereInput[]
    id?: IntFilter<"Record"> | number
    plateNumber?: StringFilter<"Record"> | string
    vehicleType?: StringFilter<"Record"> | string
    transportGroup?: StringNullableFilter<"Record"> | string | null
    operatorCompanyName?: StringFilter<"Record"> | string
    operatorAddress?: StringNullableFilter<"Record"> | string | null
    ownerFirstName?: StringNullableFilter<"Record"> | string | null
    ownerMiddleName?: StringNullableFilter<"Record"> | string | null
    ownerLastName?: StringNullableFilter<"Record"> | string | null
    motorNo?: StringNullableFilter<"Record"> | string | null
    motorVehicleName?: StringNullableFilter<"Record"> | string | null
    createdAt?: DateTimeNullableFilter<"Record"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"Record"> | Date | string | null
    recordHistory?: RecordHistoryListRelationFilter
    violations?: ViolationListRelationFilter
  }

  export type RecordOrderByWithRelationInput = {
    id?: SortOrder
    plateNumber?: SortOrder
    vehicleType?: SortOrder
    transportGroup?: SortOrderInput | SortOrder
    operatorCompanyName?: SortOrder
    operatorAddress?: SortOrderInput | SortOrder
    ownerFirstName?: SortOrderInput | SortOrder
    ownerMiddleName?: SortOrderInput | SortOrder
    ownerLastName?: SortOrderInput | SortOrder
    motorNo?: SortOrderInput | SortOrder
    motorVehicleName?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    recordHistory?: RecordHistoryOrderByRelationAggregateInput
    violations?: ViolationOrderByRelationAggregateInput
  }

  export type RecordWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: RecordWhereInput | RecordWhereInput[]
    OR?: RecordWhereInput[]
    NOT?: RecordWhereInput | RecordWhereInput[]
    plateNumber?: StringFilter<"Record"> | string
    vehicleType?: StringFilter<"Record"> | string
    transportGroup?: StringNullableFilter<"Record"> | string | null
    operatorCompanyName?: StringFilter<"Record"> | string
    operatorAddress?: StringNullableFilter<"Record"> | string | null
    ownerFirstName?: StringNullableFilter<"Record"> | string | null
    ownerMiddleName?: StringNullableFilter<"Record"> | string | null
    ownerLastName?: StringNullableFilter<"Record"> | string | null
    motorNo?: StringNullableFilter<"Record"> | string | null
    motorVehicleName?: StringNullableFilter<"Record"> | string | null
    createdAt?: DateTimeNullableFilter<"Record"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"Record"> | Date | string | null
    recordHistory?: RecordHistoryListRelationFilter
    violations?: ViolationListRelationFilter
  }, "id">

  export type RecordOrderByWithAggregationInput = {
    id?: SortOrder
    plateNumber?: SortOrder
    vehicleType?: SortOrder
    transportGroup?: SortOrderInput | SortOrder
    operatorCompanyName?: SortOrder
    operatorAddress?: SortOrderInput | SortOrder
    ownerFirstName?: SortOrderInput | SortOrder
    ownerMiddleName?: SortOrderInput | SortOrder
    ownerLastName?: SortOrderInput | SortOrder
    motorNo?: SortOrderInput | SortOrder
    motorVehicleName?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    _count?: RecordCountOrderByAggregateInput
    _avg?: RecordAvgOrderByAggregateInput
    _max?: RecordMaxOrderByAggregateInput
    _min?: RecordMinOrderByAggregateInput
    _sum?: RecordSumOrderByAggregateInput
  }

  export type RecordScalarWhereWithAggregatesInput = {
    AND?: RecordScalarWhereWithAggregatesInput | RecordScalarWhereWithAggregatesInput[]
    OR?: RecordScalarWhereWithAggregatesInput[]
    NOT?: RecordScalarWhereWithAggregatesInput | RecordScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Record"> | number
    plateNumber?: StringWithAggregatesFilter<"Record"> | string
    vehicleType?: StringWithAggregatesFilter<"Record"> | string
    transportGroup?: StringNullableWithAggregatesFilter<"Record"> | string | null
    operatorCompanyName?: StringWithAggregatesFilter<"Record"> | string
    operatorAddress?: StringNullableWithAggregatesFilter<"Record"> | string | null
    ownerFirstName?: StringNullableWithAggregatesFilter<"Record"> | string | null
    ownerMiddleName?: StringNullableWithAggregatesFilter<"Record"> | string | null
    ownerLastName?: StringNullableWithAggregatesFilter<"Record"> | string | null
    motorNo?: StringNullableWithAggregatesFilter<"Record"> | string | null
    motorVehicleName?: StringNullableWithAggregatesFilter<"Record"> | string | null
    createdAt?: DateTimeNullableWithAggregatesFilter<"Record"> | Date | string | null
    updatedAt?: DateTimeNullableWithAggregatesFilter<"Record"> | Date | string | null
  }

  export type ViolationWhereInput = {
    AND?: ViolationWhereInput | ViolationWhereInput[]
    OR?: ViolationWhereInput[]
    NOT?: ViolationWhereInput | ViolationWhereInput[]
    id?: IntFilter<"Violation"> | number
    recordId?: IntFilter<"Violation"> | number
    ordinanceInfractionReportNo?: StringNullableFilter<"Violation"> | string | null
    smokeDensityTestResultNo?: StringNullableFilter<"Violation"> | string | null
    placeOfApprehension?: StringFilter<"Violation"> | string
    dateOfApprehension?: DateTimeFilter<"Violation"> | Date | string
    paidDriver?: BoolNullableFilter<"Violation"> | boolean | null
    paidOperator?: BoolNullableFilter<"Violation"> | boolean | null
    driverId?: UuidNullableFilter<"Violation"> | string | null
    createdAt?: DateTimeNullableFilter<"Violation"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"Violation"> | Date | string | null
    driver?: XOR<DriverNullableScalarRelationFilter, DriverWhereInput> | null
    record?: XOR<RecordScalarRelationFilter, RecordWhereInput>
  }

  export type ViolationOrderByWithRelationInput = {
    id?: SortOrder
    recordId?: SortOrder
    ordinanceInfractionReportNo?: SortOrderInput | SortOrder
    smokeDensityTestResultNo?: SortOrderInput | SortOrder
    placeOfApprehension?: SortOrder
    dateOfApprehension?: SortOrder
    paidDriver?: SortOrderInput | SortOrder
    paidOperator?: SortOrderInput | SortOrder
    driverId?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    driver?: DriverOrderByWithRelationInput
    record?: RecordOrderByWithRelationInput
  }

  export type ViolationWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ViolationWhereInput | ViolationWhereInput[]
    OR?: ViolationWhereInput[]
    NOT?: ViolationWhereInput | ViolationWhereInput[]
    recordId?: IntFilter<"Violation"> | number
    ordinanceInfractionReportNo?: StringNullableFilter<"Violation"> | string | null
    smokeDensityTestResultNo?: StringNullableFilter<"Violation"> | string | null
    placeOfApprehension?: StringFilter<"Violation"> | string
    dateOfApprehension?: DateTimeFilter<"Violation"> | Date | string
    paidDriver?: BoolNullableFilter<"Violation"> | boolean | null
    paidOperator?: BoolNullableFilter<"Violation"> | boolean | null
    driverId?: UuidNullableFilter<"Violation"> | string | null
    createdAt?: DateTimeNullableFilter<"Violation"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"Violation"> | Date | string | null
    driver?: XOR<DriverNullableScalarRelationFilter, DriverWhereInput> | null
    record?: XOR<RecordScalarRelationFilter, RecordWhereInput>
  }, "id">

  export type ViolationOrderByWithAggregationInput = {
    id?: SortOrder
    recordId?: SortOrder
    ordinanceInfractionReportNo?: SortOrderInput | SortOrder
    smokeDensityTestResultNo?: SortOrderInput | SortOrder
    placeOfApprehension?: SortOrder
    dateOfApprehension?: SortOrder
    paidDriver?: SortOrderInput | SortOrder
    paidOperator?: SortOrderInput | SortOrder
    driverId?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    _count?: ViolationCountOrderByAggregateInput
    _avg?: ViolationAvgOrderByAggregateInput
    _max?: ViolationMaxOrderByAggregateInput
    _min?: ViolationMinOrderByAggregateInput
    _sum?: ViolationSumOrderByAggregateInput
  }

  export type ViolationScalarWhereWithAggregatesInput = {
    AND?: ViolationScalarWhereWithAggregatesInput | ViolationScalarWhereWithAggregatesInput[]
    OR?: ViolationScalarWhereWithAggregatesInput[]
    NOT?: ViolationScalarWhereWithAggregatesInput | ViolationScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Violation"> | number
    recordId?: IntWithAggregatesFilter<"Violation"> | number
    ordinanceInfractionReportNo?: StringNullableWithAggregatesFilter<"Violation"> | string | null
    smokeDensityTestResultNo?: StringNullableWithAggregatesFilter<"Violation"> | string | null
    placeOfApprehension?: StringWithAggregatesFilter<"Violation"> | string
    dateOfApprehension?: DateTimeWithAggregatesFilter<"Violation"> | Date | string
    paidDriver?: BoolNullableWithAggregatesFilter<"Violation"> | boolean | null
    paidOperator?: BoolNullableWithAggregatesFilter<"Violation"> | boolean | null
    driverId?: UuidNullableWithAggregatesFilter<"Violation"> | string | null
    createdAt?: DateTimeNullableWithAggregatesFilter<"Violation"> | Date | string | null
    updatedAt?: DateTimeNullableWithAggregatesFilter<"Violation"> | Date | string | null
  }

  export type RecordHistoryWhereInput = {
    AND?: RecordHistoryWhereInput | RecordHistoryWhereInput[]
    OR?: RecordHistoryWhereInput[]
    NOT?: RecordHistoryWhereInput | RecordHistoryWhereInput[]
    id?: IntFilter<"RecordHistory"> | number
    recordId?: IntFilter<"RecordHistory"> | number
    type?: StringFilter<"RecordHistory"> | string
    date?: DateTimeFilter<"RecordHistory"> | Date | string
    details?: StringNullableFilter<"RecordHistory"> | string | null
    orNumber?: StringNullableFilter<"RecordHistory"> | string | null
    status?: StringFilter<"RecordHistory"> | string
    createdAt?: DateTimeNullableFilter<"RecordHistory"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"RecordHistory"> | Date | string | null
    record?: XOR<RecordScalarRelationFilter, RecordWhereInput>
  }

  export type RecordHistoryOrderByWithRelationInput = {
    id?: SortOrder
    recordId?: SortOrder
    type?: SortOrder
    date?: SortOrder
    details?: SortOrderInput | SortOrder
    orNumber?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    record?: RecordOrderByWithRelationInput
  }

  export type RecordHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: RecordHistoryWhereInput | RecordHistoryWhereInput[]
    OR?: RecordHistoryWhereInput[]
    NOT?: RecordHistoryWhereInput | RecordHistoryWhereInput[]
    recordId?: IntFilter<"RecordHistory"> | number
    type?: StringFilter<"RecordHistory"> | string
    date?: DateTimeFilter<"RecordHistory"> | Date | string
    details?: StringNullableFilter<"RecordHistory"> | string | null
    orNumber?: StringNullableFilter<"RecordHistory"> | string | null
    status?: StringFilter<"RecordHistory"> | string
    createdAt?: DateTimeNullableFilter<"RecordHistory"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"RecordHistory"> | Date | string | null
    record?: XOR<RecordScalarRelationFilter, RecordWhereInput>
  }, "id">

  export type RecordHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    recordId?: SortOrder
    type?: SortOrder
    date?: SortOrder
    details?: SortOrderInput | SortOrder
    orNumber?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    _count?: RecordHistoryCountOrderByAggregateInput
    _avg?: RecordHistoryAvgOrderByAggregateInput
    _max?: RecordHistoryMaxOrderByAggregateInput
    _min?: RecordHistoryMinOrderByAggregateInput
    _sum?: RecordHistorySumOrderByAggregateInput
  }

  export type RecordHistoryScalarWhereWithAggregatesInput = {
    AND?: RecordHistoryScalarWhereWithAggregatesInput | RecordHistoryScalarWhereWithAggregatesInput[]
    OR?: RecordHistoryScalarWhereWithAggregatesInput[]
    NOT?: RecordHistoryScalarWhereWithAggregatesInput | RecordHistoryScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"RecordHistory"> | number
    recordId?: IntWithAggregatesFilter<"RecordHistory"> | number
    type?: StringWithAggregatesFilter<"RecordHistory"> | string
    date?: DateTimeWithAggregatesFilter<"RecordHistory"> | Date | string
    details?: StringNullableWithAggregatesFilter<"RecordHistory"> | string | null
    orNumber?: StringNullableWithAggregatesFilter<"RecordHistory"> | string | null
    status?: StringWithAggregatesFilter<"RecordHistory"> | string
    createdAt?: DateTimeNullableWithAggregatesFilter<"RecordHistory"> | Date | string | null
    updatedAt?: DateTimeNullableWithAggregatesFilter<"RecordHistory"> | Date | string | null
  }

  export type VehicleWhereInput = {
    AND?: VehicleWhereInput | VehicleWhereInput[]
    OR?: VehicleWhereInput[]
    NOT?: VehicleWhereInput | VehicleWhereInput[]
    id?: UuidFilter<"Vehicle"> | string
    driverName?: StringFilter<"Vehicle"> | string
    contactNumber?: StringNullableFilter<"Vehicle"> | string | null
    engineType?: StringFilter<"Vehicle"> | string
    officeName?: StringFilter<"Vehicle"> | string
    plateNumber?: StringFilter<"Vehicle"> | string
    vehicleType?: StringFilter<"Vehicle"> | string
    wheels?: IntFilter<"Vehicle"> | number
    createdAt?: DateTimeFilter<"Vehicle"> | Date | string
    updatedAt?: DateTimeFilter<"Vehicle"> | Date | string
    tests?: TestListRelationFilter
    driverHistory?: VehicleDriverHistoryListRelationFilter
  }

  export type VehicleOrderByWithRelationInput = {
    id?: SortOrder
    driverName?: SortOrder
    contactNumber?: SortOrderInput | SortOrder
    engineType?: SortOrder
    officeName?: SortOrder
    plateNumber?: SortOrder
    vehicleType?: SortOrder
    wheels?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tests?: TestOrderByRelationAggregateInput
    driverHistory?: VehicleDriverHistoryOrderByRelationAggregateInput
  }

  export type VehicleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    plateNumber?: string
    AND?: VehicleWhereInput | VehicleWhereInput[]
    OR?: VehicleWhereInput[]
    NOT?: VehicleWhereInput | VehicleWhereInput[]
    driverName?: StringFilter<"Vehicle"> | string
    contactNumber?: StringNullableFilter<"Vehicle"> | string | null
    engineType?: StringFilter<"Vehicle"> | string
    officeName?: StringFilter<"Vehicle"> | string
    vehicleType?: StringFilter<"Vehicle"> | string
    wheels?: IntFilter<"Vehicle"> | number
    createdAt?: DateTimeFilter<"Vehicle"> | Date | string
    updatedAt?: DateTimeFilter<"Vehicle"> | Date | string
    tests?: TestListRelationFilter
    driverHistory?: VehicleDriverHistoryListRelationFilter
  }, "id" | "plateNumber">

  export type VehicleOrderByWithAggregationInput = {
    id?: SortOrder
    driverName?: SortOrder
    contactNumber?: SortOrderInput | SortOrder
    engineType?: SortOrder
    officeName?: SortOrder
    plateNumber?: SortOrder
    vehicleType?: SortOrder
    wheels?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VehicleCountOrderByAggregateInput
    _avg?: VehicleAvgOrderByAggregateInput
    _max?: VehicleMaxOrderByAggregateInput
    _min?: VehicleMinOrderByAggregateInput
    _sum?: VehicleSumOrderByAggregateInput
  }

  export type VehicleScalarWhereWithAggregatesInput = {
    AND?: VehicleScalarWhereWithAggregatesInput | VehicleScalarWhereWithAggregatesInput[]
    OR?: VehicleScalarWhereWithAggregatesInput[]
    NOT?: VehicleScalarWhereWithAggregatesInput | VehicleScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Vehicle"> | string
    driverName?: StringWithAggregatesFilter<"Vehicle"> | string
    contactNumber?: StringNullableWithAggregatesFilter<"Vehicle"> | string | null
    engineType?: StringWithAggregatesFilter<"Vehicle"> | string
    officeName?: StringWithAggregatesFilter<"Vehicle"> | string
    plateNumber?: StringWithAggregatesFilter<"Vehicle"> | string
    vehicleType?: StringWithAggregatesFilter<"Vehicle"> | string
    wheels?: IntWithAggregatesFilter<"Vehicle"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Vehicle"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Vehicle"> | Date | string
  }

  export type VehicleDriverHistoryWhereInput = {
    AND?: VehicleDriverHistoryWhereInput | VehicleDriverHistoryWhereInput[]
    OR?: VehicleDriverHistoryWhereInput[]
    NOT?: VehicleDriverHistoryWhereInput | VehicleDriverHistoryWhereInput[]
    id?: UuidFilter<"VehicleDriverHistory"> | string
    vehicleId?: UuidFilter<"VehicleDriverHistory"> | string
    driverName?: StringFilter<"VehicleDriverHistory"> | string
    changedAt?: DateTimeFilter<"VehicleDriverHistory"> | Date | string
    changedBy?: UuidNullableFilter<"VehicleDriverHistory"> | string | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    vehicle?: XOR<VehicleScalarRelationFilter, VehicleWhereInput>
  }

  export type VehicleDriverHistoryOrderByWithRelationInput = {
    id?: SortOrder
    vehicleId?: SortOrder
    driverName?: SortOrder
    changedAt?: SortOrder
    changedBy?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    vehicle?: VehicleOrderByWithRelationInput
  }

  export type VehicleDriverHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: VehicleDriverHistoryWhereInput | VehicleDriverHistoryWhereInput[]
    OR?: VehicleDriverHistoryWhereInput[]
    NOT?: VehicleDriverHistoryWhereInput | VehicleDriverHistoryWhereInput[]
    vehicleId?: UuidFilter<"VehicleDriverHistory"> | string
    driverName?: StringFilter<"VehicleDriverHistory"> | string
    changedAt?: DateTimeFilter<"VehicleDriverHistory"> | Date | string
    changedBy?: UuidNullableFilter<"VehicleDriverHistory"> | string | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    vehicle?: XOR<VehicleScalarRelationFilter, VehicleWhereInput>
  }, "id">

  export type VehicleDriverHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    vehicleId?: SortOrder
    driverName?: SortOrder
    changedAt?: SortOrder
    changedBy?: SortOrderInput | SortOrder
    _count?: VehicleDriverHistoryCountOrderByAggregateInput
    _max?: VehicleDriverHistoryMaxOrderByAggregateInput
    _min?: VehicleDriverHistoryMinOrderByAggregateInput
  }

  export type VehicleDriverHistoryScalarWhereWithAggregatesInput = {
    AND?: VehicleDriverHistoryScalarWhereWithAggregatesInput | VehicleDriverHistoryScalarWhereWithAggregatesInput[]
    OR?: VehicleDriverHistoryScalarWhereWithAggregatesInput[]
    NOT?: VehicleDriverHistoryScalarWhereWithAggregatesInput | VehicleDriverHistoryScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"VehicleDriverHistory"> | string
    vehicleId?: UuidWithAggregatesFilter<"VehicleDriverHistory"> | string
    driverName?: StringWithAggregatesFilter<"VehicleDriverHistory"> | string
    changedAt?: DateTimeWithAggregatesFilter<"VehicleDriverHistory"> | Date | string
    changedBy?: UuidNullableWithAggregatesFilter<"VehicleDriverHistory"> | string | null
  }

  export type TestScheduleWhereInput = {
    AND?: TestScheduleWhereInput | TestScheduleWhereInput[]
    OR?: TestScheduleWhereInput[]
    NOT?: TestScheduleWhereInput | TestScheduleWhereInput[]
    id?: UuidFilter<"TestSchedule"> | string
    assignedPersonnel?: StringFilter<"TestSchedule"> | string
    conductedOn?: DateTimeFilter<"TestSchedule"> | Date | string
    location?: StringFilter<"TestSchedule"> | string
    quarter?: IntFilter<"TestSchedule"> | number
    year?: IntFilter<"TestSchedule"> | number
    createdAt?: DateTimeFilter<"TestSchedule"> | Date | string
    updatedAt?: DateTimeFilter<"TestSchedule"> | Date | string
  }

  export type TestScheduleOrderByWithRelationInput = {
    id?: SortOrder
    assignedPersonnel?: SortOrder
    conductedOn?: SortOrder
    location?: SortOrder
    quarter?: SortOrder
    year?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TestScheduleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TestScheduleWhereInput | TestScheduleWhereInput[]
    OR?: TestScheduleWhereInput[]
    NOT?: TestScheduleWhereInput | TestScheduleWhereInput[]
    assignedPersonnel?: StringFilter<"TestSchedule"> | string
    conductedOn?: DateTimeFilter<"TestSchedule"> | Date | string
    location?: StringFilter<"TestSchedule"> | string
    quarter?: IntFilter<"TestSchedule"> | number
    year?: IntFilter<"TestSchedule"> | number
    createdAt?: DateTimeFilter<"TestSchedule"> | Date | string
    updatedAt?: DateTimeFilter<"TestSchedule"> | Date | string
  }, "id">

  export type TestScheduleOrderByWithAggregationInput = {
    id?: SortOrder
    assignedPersonnel?: SortOrder
    conductedOn?: SortOrder
    location?: SortOrder
    quarter?: SortOrder
    year?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TestScheduleCountOrderByAggregateInput
    _avg?: TestScheduleAvgOrderByAggregateInput
    _max?: TestScheduleMaxOrderByAggregateInput
    _min?: TestScheduleMinOrderByAggregateInput
    _sum?: TestScheduleSumOrderByAggregateInput
  }

  export type TestScheduleScalarWhereWithAggregatesInput = {
    AND?: TestScheduleScalarWhereWithAggregatesInput | TestScheduleScalarWhereWithAggregatesInput[]
    OR?: TestScheduleScalarWhereWithAggregatesInput[]
    NOT?: TestScheduleScalarWhereWithAggregatesInput | TestScheduleScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"TestSchedule"> | string
    assignedPersonnel?: StringWithAggregatesFilter<"TestSchedule"> | string
    conductedOn?: DateTimeWithAggregatesFilter<"TestSchedule"> | Date | string
    location?: StringWithAggregatesFilter<"TestSchedule"> | string
    quarter?: IntWithAggregatesFilter<"TestSchedule"> | number
    year?: IntWithAggregatesFilter<"TestSchedule"> | number
    createdAt?: DateTimeWithAggregatesFilter<"TestSchedule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TestSchedule"> | Date | string
  }

  export type TestWhereInput = {
    AND?: TestWhereInput | TestWhereInput[]
    OR?: TestWhereInput[]
    NOT?: TestWhereInput | TestWhereInput[]
    id?: UuidFilter<"Test"> | string
    vehicleId?: UuidFilter<"Test"> | string
    testDate?: DateTimeFilter<"Test"> | Date | string
    quarter?: IntFilter<"Test"> | number
    year?: IntFilter<"Test"> | number
    result?: BoolFilter<"Test"> | boolean
    createdBy?: UuidNullableFilter<"Test"> | string | null
    createdAt?: DateTimeFilter<"Test"> | Date | string
    updatedAt?: DateTimeFilter<"Test"> | Date | string
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    vehicle?: XOR<VehicleScalarRelationFilter, VehicleWhereInput>
  }

  export type TestOrderByWithRelationInput = {
    id?: SortOrder
    vehicleId?: SortOrder
    testDate?: SortOrder
    quarter?: SortOrder
    year?: SortOrder
    result?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    vehicle?: VehicleOrderByWithRelationInput
  }

  export type TestWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TestWhereInput | TestWhereInput[]
    OR?: TestWhereInput[]
    NOT?: TestWhereInput | TestWhereInput[]
    vehicleId?: UuidFilter<"Test"> | string
    testDate?: DateTimeFilter<"Test"> | Date | string
    quarter?: IntFilter<"Test"> | number
    year?: IntFilter<"Test"> | number
    result?: BoolFilter<"Test"> | boolean
    createdBy?: UuidNullableFilter<"Test"> | string | null
    createdAt?: DateTimeFilter<"Test"> | Date | string
    updatedAt?: DateTimeFilter<"Test"> | Date | string
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    vehicle?: XOR<VehicleScalarRelationFilter, VehicleWhereInput>
  }, "id">

  export type TestOrderByWithAggregationInput = {
    id?: SortOrder
    vehicleId?: SortOrder
    testDate?: SortOrder
    quarter?: SortOrder
    year?: SortOrder
    result?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TestCountOrderByAggregateInput
    _avg?: TestAvgOrderByAggregateInput
    _max?: TestMaxOrderByAggregateInput
    _min?: TestMinOrderByAggregateInput
    _sum?: TestSumOrderByAggregateInput
  }

  export type TestScalarWhereWithAggregatesInput = {
    AND?: TestScalarWhereWithAggregatesInput | TestScalarWhereWithAggregatesInput[]
    OR?: TestScalarWhereWithAggregatesInput[]
    NOT?: TestScalarWhereWithAggregatesInput | TestScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Test"> | string
    vehicleId?: UuidWithAggregatesFilter<"Test"> | string
    testDate?: DateTimeWithAggregatesFilter<"Test"> | Date | string
    quarter?: IntWithAggregatesFilter<"Test"> | number
    year?: IntWithAggregatesFilter<"Test"> | number
    result?: BoolWithAggregatesFilter<"Test"> | boolean
    createdBy?: UuidNullableWithAggregatesFilter<"Test"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Test"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Test"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    encryptedPassword: string
    isSuperAdmin?: boolean | null
    lastSignInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    profile?: ProfileCreateNestedOneWithoutUserInput
    UserRoleMapping?: UserRoleMappingCreateNestedManyWithoutUserInput
    tests?: TestCreateNestedManyWithoutUserInput
    driverHistories?: VehicleDriverHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    encryptedPassword: string
    isSuperAdmin?: boolean | null
    lastSignInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    profile?: ProfileUncheckedCreateNestedOneWithoutUserInput
    UserRoleMapping?: UserRoleMappingUncheckedCreateNestedManyWithoutUserInput
    tests?: TestUncheckedCreateNestedManyWithoutUserInput
    driverHistories?: VehicleDriverHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    isSuperAdmin?: NullableBoolFieldUpdateOperationsInput | boolean | null
    lastSignInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profile?: ProfileUpdateOneWithoutUserNestedInput
    UserRoleMapping?: UserRoleMappingUpdateManyWithoutUserNestedInput
    tests?: TestUpdateManyWithoutUserNestedInput
    driverHistories?: VehicleDriverHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    isSuperAdmin?: NullableBoolFieldUpdateOperationsInput | boolean | null
    lastSignInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profile?: ProfileUncheckedUpdateOneWithoutUserNestedInput
    UserRoleMapping?: UserRoleMappingUncheckedUpdateManyWithoutUserNestedInput
    tests?: TestUncheckedUpdateManyWithoutUserNestedInput
    driverHistories?: VehicleDriverHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    encryptedPassword: string
    isSuperAdmin?: boolean | null
    lastSignInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    isSuperAdmin?: NullableBoolFieldUpdateOperationsInput | boolean | null
    lastSignInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    isSuperAdmin?: NullableBoolFieldUpdateOperationsInput | boolean | null
    lastSignInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserRoleMappingCreateInput = {
    id?: string
    role: $Enums.user_role
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutUserRoleMappingInput
  }

  export type UserRoleMappingUncheckedCreateInput = {
    id?: string
    userId: string
    role: $Enums.user_role
    createdAt?: Date | string
  }

  export type UserRoleMappingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: Enumuser_roleFieldUpdateOperationsInput | $Enums.user_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutUserRoleMappingNestedInput
  }

  export type UserRoleMappingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: Enumuser_roleFieldUpdateOperationsInput | $Enums.user_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserRoleMappingCreateManyInput = {
    id?: string
    userId: string
    role: $Enums.user_role
    createdAt?: Date | string
  }

  export type UserRoleMappingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: Enumuser_roleFieldUpdateOperationsInput | $Enums.user_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserRoleMappingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: Enumuser_roleFieldUpdateOperationsInput | $Enums.user_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileCreateInput = {
    id?: string
    firstName?: string | null
    lastName?: string | null
    bio?: string | null
    jobTitle?: string | null
    department?: string | null
    phoneNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutProfileInput
  }

  export type ProfileUncheckedCreateInput = {
    id?: string
    userId: string
    firstName?: string | null
    lastName?: string | null
    bio?: string | null
    jobTitle?: string | null
    department?: string | null
    phoneNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProfileNestedInput
  }

  export type ProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileCreateManyInput = {
    id?: string
    userId: string
    firstName?: string | null
    lastName?: string | null
    bio?: string | null
    jobTitle?: string | null
    department?: string | null
    phoneNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeeCreateInput = {
    amount: Decimal | DecimalJsLike | number | string
    category: string
    level?: number
    effectiveDate?: Date | string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type FeeUncheckedCreateInput = {
    id?: number
    amount: Decimal | DecimalJsLike | number | string
    category: string
    level?: number
    effectiveDate?: Date | string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type FeeUpdateInput = {
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    category?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    effectiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type FeeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    category?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    effectiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type FeeCreateManyInput = {
    id?: number
    amount: Decimal | DecimalJsLike | number | string
    category: string
    level?: number
    effectiveDate?: Date | string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type FeeUpdateManyMutationInput = {
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    category?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    effectiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type FeeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    category?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    effectiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DriverCreateInput = {
    id?: string
    firstName: string
    middleName?: string | null
    lastName: string
    address: string
    licenseNumber: string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    violations?: ViolationCreateNestedManyWithoutDriverInput
  }

  export type DriverUncheckedCreateInput = {
    id?: string
    firstName: string
    middleName?: string | null
    lastName: string
    address: string
    licenseNumber: string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    violations?: ViolationUncheckedCreateNestedManyWithoutDriverInput
  }

  export type DriverUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    violations?: ViolationUpdateManyWithoutDriverNestedInput
  }

  export type DriverUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    violations?: ViolationUncheckedUpdateManyWithoutDriverNestedInput
  }

  export type DriverCreateManyInput = {
    id?: string
    firstName: string
    middleName?: string | null
    lastName: string
    address: string
    licenseNumber: string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type DriverUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DriverUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RecordCreateInput = {
    plateNumber: string
    vehicleType: string
    transportGroup?: string | null
    operatorCompanyName: string
    operatorAddress?: string | null
    ownerFirstName?: string | null
    ownerMiddleName?: string | null
    ownerLastName?: string | null
    motorNo?: string | null
    motorVehicleName?: string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    recordHistory?: RecordHistoryCreateNestedManyWithoutRecordInput
    violations?: ViolationCreateNestedManyWithoutRecordInput
  }

  export type RecordUncheckedCreateInput = {
    id?: number
    plateNumber: string
    vehicleType: string
    transportGroup?: string | null
    operatorCompanyName: string
    operatorAddress?: string | null
    ownerFirstName?: string | null
    ownerMiddleName?: string | null
    ownerLastName?: string | null
    motorNo?: string | null
    motorVehicleName?: string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    recordHistory?: RecordHistoryUncheckedCreateNestedManyWithoutRecordInput
    violations?: ViolationUncheckedCreateNestedManyWithoutRecordInput
  }

  export type RecordUpdateInput = {
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    transportGroup?: NullableStringFieldUpdateOperationsInput | string | null
    operatorCompanyName?: StringFieldUpdateOperationsInput | string
    operatorAddress?: NullableStringFieldUpdateOperationsInput | string | null
    ownerFirstName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerMiddleName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerLastName?: NullableStringFieldUpdateOperationsInput | string | null
    motorNo?: NullableStringFieldUpdateOperationsInput | string | null
    motorVehicleName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recordHistory?: RecordHistoryUpdateManyWithoutRecordNestedInput
    violations?: ViolationUpdateManyWithoutRecordNestedInput
  }

  export type RecordUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    transportGroup?: NullableStringFieldUpdateOperationsInput | string | null
    operatorCompanyName?: StringFieldUpdateOperationsInput | string
    operatorAddress?: NullableStringFieldUpdateOperationsInput | string | null
    ownerFirstName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerMiddleName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerLastName?: NullableStringFieldUpdateOperationsInput | string | null
    motorNo?: NullableStringFieldUpdateOperationsInput | string | null
    motorVehicleName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recordHistory?: RecordHistoryUncheckedUpdateManyWithoutRecordNestedInput
    violations?: ViolationUncheckedUpdateManyWithoutRecordNestedInput
  }

  export type RecordCreateManyInput = {
    id?: number
    plateNumber: string
    vehicleType: string
    transportGroup?: string | null
    operatorCompanyName: string
    operatorAddress?: string | null
    ownerFirstName?: string | null
    ownerMiddleName?: string | null
    ownerLastName?: string | null
    motorNo?: string | null
    motorVehicleName?: string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type RecordUpdateManyMutationInput = {
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    transportGroup?: NullableStringFieldUpdateOperationsInput | string | null
    operatorCompanyName?: StringFieldUpdateOperationsInput | string
    operatorAddress?: NullableStringFieldUpdateOperationsInput | string | null
    ownerFirstName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerMiddleName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerLastName?: NullableStringFieldUpdateOperationsInput | string | null
    motorNo?: NullableStringFieldUpdateOperationsInput | string | null
    motorVehicleName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RecordUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    transportGroup?: NullableStringFieldUpdateOperationsInput | string | null
    operatorCompanyName?: StringFieldUpdateOperationsInput | string
    operatorAddress?: NullableStringFieldUpdateOperationsInput | string | null
    ownerFirstName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerMiddleName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerLastName?: NullableStringFieldUpdateOperationsInput | string | null
    motorNo?: NullableStringFieldUpdateOperationsInput | string | null
    motorVehicleName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ViolationCreateInput = {
    ordinanceInfractionReportNo?: string | null
    smokeDensityTestResultNo?: string | null
    placeOfApprehension: string
    dateOfApprehension: Date | string
    paidDriver?: boolean | null
    paidOperator?: boolean | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    driver?: DriverCreateNestedOneWithoutViolationsInput
    record: RecordCreateNestedOneWithoutViolationsInput
  }

  export type ViolationUncheckedCreateInput = {
    id?: number
    recordId: number
    ordinanceInfractionReportNo?: string | null
    smokeDensityTestResultNo?: string | null
    placeOfApprehension: string
    dateOfApprehension: Date | string
    paidDriver?: boolean | null
    paidOperator?: boolean | null
    driverId?: string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type ViolationUpdateInput = {
    ordinanceInfractionReportNo?: NullableStringFieldUpdateOperationsInput | string | null
    smokeDensityTestResultNo?: NullableStringFieldUpdateOperationsInput | string | null
    placeOfApprehension?: StringFieldUpdateOperationsInput | string
    dateOfApprehension?: DateTimeFieldUpdateOperationsInput | Date | string
    paidDriver?: NullableBoolFieldUpdateOperationsInput | boolean | null
    paidOperator?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    driver?: DriverUpdateOneWithoutViolationsNestedInput
    record?: RecordUpdateOneRequiredWithoutViolationsNestedInput
  }

  export type ViolationUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    recordId?: IntFieldUpdateOperationsInput | number
    ordinanceInfractionReportNo?: NullableStringFieldUpdateOperationsInput | string | null
    smokeDensityTestResultNo?: NullableStringFieldUpdateOperationsInput | string | null
    placeOfApprehension?: StringFieldUpdateOperationsInput | string
    dateOfApprehension?: DateTimeFieldUpdateOperationsInput | Date | string
    paidDriver?: NullableBoolFieldUpdateOperationsInput | boolean | null
    paidOperator?: NullableBoolFieldUpdateOperationsInput | boolean | null
    driverId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ViolationCreateManyInput = {
    id?: number
    recordId: number
    ordinanceInfractionReportNo?: string | null
    smokeDensityTestResultNo?: string | null
    placeOfApprehension: string
    dateOfApprehension: Date | string
    paidDriver?: boolean | null
    paidOperator?: boolean | null
    driverId?: string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type ViolationUpdateManyMutationInput = {
    ordinanceInfractionReportNo?: NullableStringFieldUpdateOperationsInput | string | null
    smokeDensityTestResultNo?: NullableStringFieldUpdateOperationsInput | string | null
    placeOfApprehension?: StringFieldUpdateOperationsInput | string
    dateOfApprehension?: DateTimeFieldUpdateOperationsInput | Date | string
    paidDriver?: NullableBoolFieldUpdateOperationsInput | boolean | null
    paidOperator?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ViolationUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    recordId?: IntFieldUpdateOperationsInput | number
    ordinanceInfractionReportNo?: NullableStringFieldUpdateOperationsInput | string | null
    smokeDensityTestResultNo?: NullableStringFieldUpdateOperationsInput | string | null
    placeOfApprehension?: StringFieldUpdateOperationsInput | string
    dateOfApprehension?: DateTimeFieldUpdateOperationsInput | Date | string
    paidDriver?: NullableBoolFieldUpdateOperationsInput | boolean | null
    paidOperator?: NullableBoolFieldUpdateOperationsInput | boolean | null
    driverId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RecordHistoryCreateInput = {
    type: string
    date: Date | string
    details?: string | null
    orNumber?: string | null
    status: string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    record: RecordCreateNestedOneWithoutRecordHistoryInput
  }

  export type RecordHistoryUncheckedCreateInput = {
    id?: number
    recordId: number
    type: string
    date: Date | string
    details?: string | null
    orNumber?: string | null
    status: string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type RecordHistoryUpdateInput = {
    type?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    orNumber?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    record?: RecordUpdateOneRequiredWithoutRecordHistoryNestedInput
  }

  export type RecordHistoryUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    recordId?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    orNumber?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RecordHistoryCreateManyInput = {
    id?: number
    recordId: number
    type: string
    date: Date | string
    details?: string | null
    orNumber?: string | null
    status: string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type RecordHistoryUpdateManyMutationInput = {
    type?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    orNumber?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RecordHistoryUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    recordId?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    orNumber?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type VehicleCreateInput = {
    id?: string
    driverName: string
    contactNumber?: string | null
    engineType: string
    officeName: string
    plateNumber: string
    vehicleType: string
    wheels: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tests?: TestCreateNestedManyWithoutVehicleInput
    driverHistory?: VehicleDriverHistoryCreateNestedManyWithoutVehicleInput
  }

  export type VehicleUncheckedCreateInput = {
    id?: string
    driverName: string
    contactNumber?: string | null
    engineType: string
    officeName: string
    plateNumber: string
    vehicleType: string
    wheels: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tests?: TestUncheckedCreateNestedManyWithoutVehicleInput
    driverHistory?: VehicleDriverHistoryUncheckedCreateNestedManyWithoutVehicleInput
  }

  export type VehicleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: StringFieldUpdateOperationsInput | string
    officeName?: StringFieldUpdateOperationsInput | string
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    wheels?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tests?: TestUpdateManyWithoutVehicleNestedInput
    driverHistory?: VehicleDriverHistoryUpdateManyWithoutVehicleNestedInput
  }

  export type VehicleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: StringFieldUpdateOperationsInput | string
    officeName?: StringFieldUpdateOperationsInput | string
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    wheels?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tests?: TestUncheckedUpdateManyWithoutVehicleNestedInput
    driverHistory?: VehicleDriverHistoryUncheckedUpdateManyWithoutVehicleNestedInput
  }

  export type VehicleCreateManyInput = {
    id?: string
    driverName: string
    contactNumber?: string | null
    engineType: string
    officeName: string
    plateNumber: string
    vehicleType: string
    wheels: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VehicleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: StringFieldUpdateOperationsInput | string
    officeName?: StringFieldUpdateOperationsInput | string
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    wheels?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VehicleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: StringFieldUpdateOperationsInput | string
    officeName?: StringFieldUpdateOperationsInput | string
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    wheels?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VehicleDriverHistoryCreateInput = {
    id?: string
    driverName: string
    changedAt?: Date | string
    user?: UserCreateNestedOneWithoutDriverHistoriesInput
    vehicle: VehicleCreateNestedOneWithoutDriverHistoryInput
  }

  export type VehicleDriverHistoryUncheckedCreateInput = {
    id?: string
    vehicleId: string
    driverName: string
    changedAt?: Date | string
    changedBy?: string | null
  }

  export type VehicleDriverHistoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutDriverHistoriesNestedInput
    vehicle?: VehicleUpdateOneRequiredWithoutDriverHistoryNestedInput
  }

  export type VehicleDriverHistoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    changedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type VehicleDriverHistoryCreateManyInput = {
    id?: string
    vehicleId: string
    driverName: string
    changedAt?: Date | string
    changedBy?: string | null
  }

  export type VehicleDriverHistoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VehicleDriverHistoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    changedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TestScheduleCreateInput = {
    id?: string
    assignedPersonnel: string
    conductedOn: Date | string
    location: string
    quarter: number
    year: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TestScheduleUncheckedCreateInput = {
    id?: string
    assignedPersonnel: string
    conductedOn: Date | string
    location: string
    quarter: number
    year: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TestScheduleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedPersonnel?: StringFieldUpdateOperationsInput | string
    conductedOn?: DateTimeFieldUpdateOperationsInput | Date | string
    location?: StringFieldUpdateOperationsInput | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestScheduleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedPersonnel?: StringFieldUpdateOperationsInput | string
    conductedOn?: DateTimeFieldUpdateOperationsInput | Date | string
    location?: StringFieldUpdateOperationsInput | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestScheduleCreateManyInput = {
    id?: string
    assignedPersonnel: string
    conductedOn: Date | string
    location: string
    quarter: number
    year: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TestScheduleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedPersonnel?: StringFieldUpdateOperationsInput | string
    conductedOn?: DateTimeFieldUpdateOperationsInput | Date | string
    location?: StringFieldUpdateOperationsInput | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestScheduleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    assignedPersonnel?: StringFieldUpdateOperationsInput | string
    conductedOn?: DateTimeFieldUpdateOperationsInput | Date | string
    location?: StringFieldUpdateOperationsInput | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestCreateInput = {
    id?: string
    testDate: Date | string
    quarter: number
    year: number
    result: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user?: UserCreateNestedOneWithoutTestsInput
    vehicle: VehicleCreateNestedOneWithoutTestsInput
  }

  export type TestUncheckedCreateInput = {
    id?: string
    vehicleId: string
    testDate: Date | string
    quarter: number
    year: number
    result: boolean
    createdBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TestUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    testDate?: DateTimeFieldUpdateOperationsInput | Date | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    result?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutTestsNestedInput
    vehicle?: VehicleUpdateOneRequiredWithoutTestsNestedInput
  }

  export type TestUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    testDate?: DateTimeFieldUpdateOperationsInput | Date | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    result?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestCreateManyInput = {
    id?: string
    vehicleId: string
    testDate: Date | string
    quarter: number
    year: number
    result: boolean
    createdBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TestUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    testDate?: DateTimeFieldUpdateOperationsInput | Date | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    result?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    testDate?: DateTimeFieldUpdateOperationsInput | Date | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    result?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
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

  export type ProfileNullableScalarRelationFilter = {
    is?: ProfileWhereInput | null
    isNot?: ProfileWhereInput | null
  }

  export type UserRoleMappingListRelationFilter = {
    every?: UserRoleMappingWhereInput
    some?: UserRoleMappingWhereInput
    none?: UserRoleMappingWhereInput
  }

  export type TestListRelationFilter = {
    every?: TestWhereInput
    some?: TestWhereInput
    none?: TestWhereInput
  }

  export type VehicleDriverHistoryListRelationFilter = {
    every?: VehicleDriverHistoryWhereInput
    some?: VehicleDriverHistoryWhereInput
    none?: VehicleDriverHistoryWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserRoleMappingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TestOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VehicleDriverHistoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    encryptedPassword?: SortOrder
    isSuperAdmin?: SortOrder
    lastSignInAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    encryptedPassword?: SortOrder
    isSuperAdmin?: SortOrder
    lastSignInAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    encryptedPassword?: SortOrder
    isSuperAdmin?: SortOrder
    lastSignInAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
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

  export type Enumuser_roleFilter<$PrismaModel = never> = {
    equals?: $Enums.user_role | Enumuser_roleFieldRefInput<$PrismaModel>
    in?: $Enums.user_role[] | ListEnumuser_roleFieldRefInput<$PrismaModel>
    notIn?: $Enums.user_role[] | ListEnumuser_roleFieldRefInput<$PrismaModel>
    not?: NestedEnumuser_roleFilter<$PrismaModel> | $Enums.user_role
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type UserRoleMappingUserIdRoleCompoundUniqueInput = {
    userId: string
    role: $Enums.user_role
  }

  export type UserRoleMappingCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type UserRoleMappingMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type UserRoleMappingMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type Enumuser_roleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.user_role | Enumuser_roleFieldRefInput<$PrismaModel>
    in?: $Enums.user_role[] | ListEnumuser_roleFieldRefInput<$PrismaModel>
    notIn?: $Enums.user_role[] | ListEnumuser_roleFieldRefInput<$PrismaModel>
    not?: NestedEnumuser_roleWithAggregatesFilter<$PrismaModel> | $Enums.user_role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumuser_roleFilter<$PrismaModel>
    _max?: NestedEnumuser_roleFilter<$PrismaModel>
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

  export type ProfileCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    bio?: SortOrder
    jobTitle?: SortOrder
    department?: SortOrder
    phoneNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    bio?: SortOrder
    jobTitle?: SortOrder
    department?: SortOrder
    phoneNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProfileMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    bio?: SortOrder
    jobTitle?: SortOrder
    department?: SortOrder
    phoneNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type FeeCountOrderByAggregateInput = {
    id?: SortOrder
    amount?: SortOrder
    category?: SortOrder
    level?: SortOrder
    effectiveDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FeeAvgOrderByAggregateInput = {
    id?: SortOrder
    amount?: SortOrder
    level?: SortOrder
  }

  export type FeeMaxOrderByAggregateInput = {
    id?: SortOrder
    amount?: SortOrder
    category?: SortOrder
    level?: SortOrder
    effectiveDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FeeMinOrderByAggregateInput = {
    id?: SortOrder
    amount?: SortOrder
    category?: SortOrder
    level?: SortOrder
    effectiveDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FeeSumOrderByAggregateInput = {
    id?: SortOrder
    amount?: SortOrder
    level?: SortOrder
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

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type ViolationListRelationFilter = {
    every?: ViolationWhereInput
    some?: ViolationWhereInput
    none?: ViolationWhereInput
  }

  export type ViolationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DriverCountOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    address?: SortOrder
    licenseNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DriverMaxOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    address?: SortOrder
    licenseNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DriverMinOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    address?: SortOrder
    licenseNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecordHistoryListRelationFilter = {
    every?: RecordHistoryWhereInput
    some?: RecordHistoryWhereInput
    none?: RecordHistoryWhereInput
  }

  export type RecordHistoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RecordCountOrderByAggregateInput = {
    id?: SortOrder
    plateNumber?: SortOrder
    vehicleType?: SortOrder
    transportGroup?: SortOrder
    operatorCompanyName?: SortOrder
    operatorAddress?: SortOrder
    ownerFirstName?: SortOrder
    ownerMiddleName?: SortOrder
    ownerLastName?: SortOrder
    motorNo?: SortOrder
    motorVehicleName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecordAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type RecordMaxOrderByAggregateInput = {
    id?: SortOrder
    plateNumber?: SortOrder
    vehicleType?: SortOrder
    transportGroup?: SortOrder
    operatorCompanyName?: SortOrder
    operatorAddress?: SortOrder
    ownerFirstName?: SortOrder
    ownerMiddleName?: SortOrder
    ownerLastName?: SortOrder
    motorNo?: SortOrder
    motorVehicleName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecordMinOrderByAggregateInput = {
    id?: SortOrder
    plateNumber?: SortOrder
    vehicleType?: SortOrder
    transportGroup?: SortOrder
    operatorCompanyName?: SortOrder
    operatorAddress?: SortOrder
    ownerFirstName?: SortOrder
    ownerMiddleName?: SortOrder
    ownerLastName?: SortOrder
    motorNo?: SortOrder
    motorVehicleName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecordSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type DriverNullableScalarRelationFilter = {
    is?: DriverWhereInput | null
    isNot?: DriverWhereInput | null
  }

  export type RecordScalarRelationFilter = {
    is?: RecordWhereInput
    isNot?: RecordWhereInput
  }

  export type ViolationCountOrderByAggregateInput = {
    id?: SortOrder
    recordId?: SortOrder
    ordinanceInfractionReportNo?: SortOrder
    smokeDensityTestResultNo?: SortOrder
    placeOfApprehension?: SortOrder
    dateOfApprehension?: SortOrder
    paidDriver?: SortOrder
    paidOperator?: SortOrder
    driverId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ViolationAvgOrderByAggregateInput = {
    id?: SortOrder
    recordId?: SortOrder
  }

  export type ViolationMaxOrderByAggregateInput = {
    id?: SortOrder
    recordId?: SortOrder
    ordinanceInfractionReportNo?: SortOrder
    smokeDensityTestResultNo?: SortOrder
    placeOfApprehension?: SortOrder
    dateOfApprehension?: SortOrder
    paidDriver?: SortOrder
    paidOperator?: SortOrder
    driverId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ViolationMinOrderByAggregateInput = {
    id?: SortOrder
    recordId?: SortOrder
    ordinanceInfractionReportNo?: SortOrder
    smokeDensityTestResultNo?: SortOrder
    placeOfApprehension?: SortOrder
    dateOfApprehension?: SortOrder
    paidDriver?: SortOrder
    paidOperator?: SortOrder
    driverId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ViolationSumOrderByAggregateInput = {
    id?: SortOrder
    recordId?: SortOrder
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type RecordHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    recordId?: SortOrder
    type?: SortOrder
    date?: SortOrder
    details?: SortOrder
    orNumber?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecordHistoryAvgOrderByAggregateInput = {
    id?: SortOrder
    recordId?: SortOrder
  }

  export type RecordHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    recordId?: SortOrder
    type?: SortOrder
    date?: SortOrder
    details?: SortOrder
    orNumber?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecordHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    recordId?: SortOrder
    type?: SortOrder
    date?: SortOrder
    details?: SortOrder
    orNumber?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecordHistorySumOrderByAggregateInput = {
    id?: SortOrder
    recordId?: SortOrder
  }

  export type VehicleCountOrderByAggregateInput = {
    id?: SortOrder
    driverName?: SortOrder
    contactNumber?: SortOrder
    engineType?: SortOrder
    officeName?: SortOrder
    plateNumber?: SortOrder
    vehicleType?: SortOrder
    wheels?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VehicleAvgOrderByAggregateInput = {
    wheels?: SortOrder
  }

  export type VehicleMaxOrderByAggregateInput = {
    id?: SortOrder
    driverName?: SortOrder
    contactNumber?: SortOrder
    engineType?: SortOrder
    officeName?: SortOrder
    plateNumber?: SortOrder
    vehicleType?: SortOrder
    wheels?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VehicleMinOrderByAggregateInput = {
    id?: SortOrder
    driverName?: SortOrder
    contactNumber?: SortOrder
    engineType?: SortOrder
    officeName?: SortOrder
    plateNumber?: SortOrder
    vehicleType?: SortOrder
    wheels?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VehicleSumOrderByAggregateInput = {
    wheels?: SortOrder
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type VehicleScalarRelationFilter = {
    is?: VehicleWhereInput
    isNot?: VehicleWhereInput
  }

  export type VehicleDriverHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    vehicleId?: SortOrder
    driverName?: SortOrder
    changedAt?: SortOrder
    changedBy?: SortOrder
  }

  export type VehicleDriverHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    vehicleId?: SortOrder
    driverName?: SortOrder
    changedAt?: SortOrder
    changedBy?: SortOrder
  }

  export type VehicleDriverHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    vehicleId?: SortOrder
    driverName?: SortOrder
    changedAt?: SortOrder
    changedBy?: SortOrder
  }

  export type TestScheduleCountOrderByAggregateInput = {
    id?: SortOrder
    assignedPersonnel?: SortOrder
    conductedOn?: SortOrder
    location?: SortOrder
    quarter?: SortOrder
    year?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TestScheduleAvgOrderByAggregateInput = {
    quarter?: SortOrder
    year?: SortOrder
  }

  export type TestScheduleMaxOrderByAggregateInput = {
    id?: SortOrder
    assignedPersonnel?: SortOrder
    conductedOn?: SortOrder
    location?: SortOrder
    quarter?: SortOrder
    year?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TestScheduleMinOrderByAggregateInput = {
    id?: SortOrder
    assignedPersonnel?: SortOrder
    conductedOn?: SortOrder
    location?: SortOrder
    quarter?: SortOrder
    year?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TestScheduleSumOrderByAggregateInput = {
    quarter?: SortOrder
    year?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type TestCountOrderByAggregateInput = {
    id?: SortOrder
    vehicleId?: SortOrder
    testDate?: SortOrder
    quarter?: SortOrder
    year?: SortOrder
    result?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TestAvgOrderByAggregateInput = {
    quarter?: SortOrder
    year?: SortOrder
  }

  export type TestMaxOrderByAggregateInput = {
    id?: SortOrder
    vehicleId?: SortOrder
    testDate?: SortOrder
    quarter?: SortOrder
    year?: SortOrder
    result?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TestMinOrderByAggregateInput = {
    id?: SortOrder
    vehicleId?: SortOrder
    testDate?: SortOrder
    quarter?: SortOrder
    year?: SortOrder
    result?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TestSumOrderByAggregateInput = {
    quarter?: SortOrder
    year?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ProfileCreateNestedOneWithoutUserInput = {
    create?: XOR<ProfileCreateWithoutUserInput, ProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutUserInput
    connect?: ProfileWhereUniqueInput
  }

  export type UserRoleMappingCreateNestedManyWithoutUserInput = {
    create?: XOR<UserRoleMappingCreateWithoutUserInput, UserRoleMappingUncheckedCreateWithoutUserInput> | UserRoleMappingCreateWithoutUserInput[] | UserRoleMappingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRoleMappingCreateOrConnectWithoutUserInput | UserRoleMappingCreateOrConnectWithoutUserInput[]
    createMany?: UserRoleMappingCreateManyUserInputEnvelope
    connect?: UserRoleMappingWhereUniqueInput | UserRoleMappingWhereUniqueInput[]
  }

  export type TestCreateNestedManyWithoutUserInput = {
    create?: XOR<TestCreateWithoutUserInput, TestUncheckedCreateWithoutUserInput> | TestCreateWithoutUserInput[] | TestUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TestCreateOrConnectWithoutUserInput | TestCreateOrConnectWithoutUserInput[]
    createMany?: TestCreateManyUserInputEnvelope
    connect?: TestWhereUniqueInput | TestWhereUniqueInput[]
  }

  export type VehicleDriverHistoryCreateNestedManyWithoutUserInput = {
    create?: XOR<VehicleDriverHistoryCreateWithoutUserInput, VehicleDriverHistoryUncheckedCreateWithoutUserInput> | VehicleDriverHistoryCreateWithoutUserInput[] | VehicleDriverHistoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VehicleDriverHistoryCreateOrConnectWithoutUserInput | VehicleDriverHistoryCreateOrConnectWithoutUserInput[]
    createMany?: VehicleDriverHistoryCreateManyUserInputEnvelope
    connect?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
  }

  export type ProfileUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<ProfileCreateWithoutUserInput, ProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutUserInput
    connect?: ProfileWhereUniqueInput
  }

  export type UserRoleMappingUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserRoleMappingCreateWithoutUserInput, UserRoleMappingUncheckedCreateWithoutUserInput> | UserRoleMappingCreateWithoutUserInput[] | UserRoleMappingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRoleMappingCreateOrConnectWithoutUserInput | UserRoleMappingCreateOrConnectWithoutUserInput[]
    createMany?: UserRoleMappingCreateManyUserInputEnvelope
    connect?: UserRoleMappingWhereUniqueInput | UserRoleMappingWhereUniqueInput[]
  }

  export type TestUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<TestCreateWithoutUserInput, TestUncheckedCreateWithoutUserInput> | TestCreateWithoutUserInput[] | TestUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TestCreateOrConnectWithoutUserInput | TestCreateOrConnectWithoutUserInput[]
    createMany?: TestCreateManyUserInputEnvelope
    connect?: TestWhereUniqueInput | TestWhereUniqueInput[]
  }

  export type VehicleDriverHistoryUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<VehicleDriverHistoryCreateWithoutUserInput, VehicleDriverHistoryUncheckedCreateWithoutUserInput> | VehicleDriverHistoryCreateWithoutUserInput[] | VehicleDriverHistoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VehicleDriverHistoryCreateOrConnectWithoutUserInput | VehicleDriverHistoryCreateOrConnectWithoutUserInput[]
    createMany?: VehicleDriverHistoryCreateManyUserInputEnvelope
    connect?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ProfileUpdateOneWithoutUserNestedInput = {
    create?: XOR<ProfileCreateWithoutUserInput, ProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutUserInput
    upsert?: ProfileUpsertWithoutUserInput
    disconnect?: ProfileWhereInput | boolean
    delete?: ProfileWhereInput | boolean
    connect?: ProfileWhereUniqueInput
    update?: XOR<XOR<ProfileUpdateToOneWithWhereWithoutUserInput, ProfileUpdateWithoutUserInput>, ProfileUncheckedUpdateWithoutUserInput>
  }

  export type UserRoleMappingUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserRoleMappingCreateWithoutUserInput, UserRoleMappingUncheckedCreateWithoutUserInput> | UserRoleMappingCreateWithoutUserInput[] | UserRoleMappingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRoleMappingCreateOrConnectWithoutUserInput | UserRoleMappingCreateOrConnectWithoutUserInput[]
    upsert?: UserRoleMappingUpsertWithWhereUniqueWithoutUserInput | UserRoleMappingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserRoleMappingCreateManyUserInputEnvelope
    set?: UserRoleMappingWhereUniqueInput | UserRoleMappingWhereUniqueInput[]
    disconnect?: UserRoleMappingWhereUniqueInput | UserRoleMappingWhereUniqueInput[]
    delete?: UserRoleMappingWhereUniqueInput | UserRoleMappingWhereUniqueInput[]
    connect?: UserRoleMappingWhereUniqueInput | UserRoleMappingWhereUniqueInput[]
    update?: UserRoleMappingUpdateWithWhereUniqueWithoutUserInput | UserRoleMappingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserRoleMappingUpdateManyWithWhereWithoutUserInput | UserRoleMappingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserRoleMappingScalarWhereInput | UserRoleMappingScalarWhereInput[]
  }

  export type TestUpdateManyWithoutUserNestedInput = {
    create?: XOR<TestCreateWithoutUserInput, TestUncheckedCreateWithoutUserInput> | TestCreateWithoutUserInput[] | TestUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TestCreateOrConnectWithoutUserInput | TestCreateOrConnectWithoutUserInput[]
    upsert?: TestUpsertWithWhereUniqueWithoutUserInput | TestUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: TestCreateManyUserInputEnvelope
    set?: TestWhereUniqueInput | TestWhereUniqueInput[]
    disconnect?: TestWhereUniqueInput | TestWhereUniqueInput[]
    delete?: TestWhereUniqueInput | TestWhereUniqueInput[]
    connect?: TestWhereUniqueInput | TestWhereUniqueInput[]
    update?: TestUpdateWithWhereUniqueWithoutUserInput | TestUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: TestUpdateManyWithWhereWithoutUserInput | TestUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: TestScalarWhereInput | TestScalarWhereInput[]
  }

  export type VehicleDriverHistoryUpdateManyWithoutUserNestedInput = {
    create?: XOR<VehicleDriverHistoryCreateWithoutUserInput, VehicleDriverHistoryUncheckedCreateWithoutUserInput> | VehicleDriverHistoryCreateWithoutUserInput[] | VehicleDriverHistoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VehicleDriverHistoryCreateOrConnectWithoutUserInput | VehicleDriverHistoryCreateOrConnectWithoutUserInput[]
    upsert?: VehicleDriverHistoryUpsertWithWhereUniqueWithoutUserInput | VehicleDriverHistoryUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: VehicleDriverHistoryCreateManyUserInputEnvelope
    set?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    disconnect?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    delete?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    connect?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    update?: VehicleDriverHistoryUpdateWithWhereUniqueWithoutUserInput | VehicleDriverHistoryUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: VehicleDriverHistoryUpdateManyWithWhereWithoutUserInput | VehicleDriverHistoryUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: VehicleDriverHistoryScalarWhereInput | VehicleDriverHistoryScalarWhereInput[]
  }

  export type ProfileUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<ProfileCreateWithoutUserInput, ProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutUserInput
    upsert?: ProfileUpsertWithoutUserInput
    disconnect?: ProfileWhereInput | boolean
    delete?: ProfileWhereInput | boolean
    connect?: ProfileWhereUniqueInput
    update?: XOR<XOR<ProfileUpdateToOneWithWhereWithoutUserInput, ProfileUpdateWithoutUserInput>, ProfileUncheckedUpdateWithoutUserInput>
  }

  export type UserRoleMappingUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserRoleMappingCreateWithoutUserInput, UserRoleMappingUncheckedCreateWithoutUserInput> | UserRoleMappingCreateWithoutUserInput[] | UserRoleMappingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRoleMappingCreateOrConnectWithoutUserInput | UserRoleMappingCreateOrConnectWithoutUserInput[]
    upsert?: UserRoleMappingUpsertWithWhereUniqueWithoutUserInput | UserRoleMappingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserRoleMappingCreateManyUserInputEnvelope
    set?: UserRoleMappingWhereUniqueInput | UserRoleMappingWhereUniqueInput[]
    disconnect?: UserRoleMappingWhereUniqueInput | UserRoleMappingWhereUniqueInput[]
    delete?: UserRoleMappingWhereUniqueInput | UserRoleMappingWhereUniqueInput[]
    connect?: UserRoleMappingWhereUniqueInput | UserRoleMappingWhereUniqueInput[]
    update?: UserRoleMappingUpdateWithWhereUniqueWithoutUserInput | UserRoleMappingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserRoleMappingUpdateManyWithWhereWithoutUserInput | UserRoleMappingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserRoleMappingScalarWhereInput | UserRoleMappingScalarWhereInput[]
  }

  export type TestUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<TestCreateWithoutUserInput, TestUncheckedCreateWithoutUserInput> | TestCreateWithoutUserInput[] | TestUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TestCreateOrConnectWithoutUserInput | TestCreateOrConnectWithoutUserInput[]
    upsert?: TestUpsertWithWhereUniqueWithoutUserInput | TestUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: TestCreateManyUserInputEnvelope
    set?: TestWhereUniqueInput | TestWhereUniqueInput[]
    disconnect?: TestWhereUniqueInput | TestWhereUniqueInput[]
    delete?: TestWhereUniqueInput | TestWhereUniqueInput[]
    connect?: TestWhereUniqueInput | TestWhereUniqueInput[]
    update?: TestUpdateWithWhereUniqueWithoutUserInput | TestUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: TestUpdateManyWithWhereWithoutUserInput | TestUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: TestScalarWhereInput | TestScalarWhereInput[]
  }

  export type VehicleDriverHistoryUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<VehicleDriverHistoryCreateWithoutUserInput, VehicleDriverHistoryUncheckedCreateWithoutUserInput> | VehicleDriverHistoryCreateWithoutUserInput[] | VehicleDriverHistoryUncheckedCreateWithoutUserInput[]
    connectOrCreate?: VehicleDriverHistoryCreateOrConnectWithoutUserInput | VehicleDriverHistoryCreateOrConnectWithoutUserInput[]
    upsert?: VehicleDriverHistoryUpsertWithWhereUniqueWithoutUserInput | VehicleDriverHistoryUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: VehicleDriverHistoryCreateManyUserInputEnvelope
    set?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    disconnect?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    delete?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    connect?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    update?: VehicleDriverHistoryUpdateWithWhereUniqueWithoutUserInput | VehicleDriverHistoryUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: VehicleDriverHistoryUpdateManyWithWhereWithoutUserInput | VehicleDriverHistoryUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: VehicleDriverHistoryScalarWhereInput | VehicleDriverHistoryScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutUserRoleMappingInput = {
    create?: XOR<UserCreateWithoutUserRoleMappingInput, UserUncheckedCreateWithoutUserRoleMappingInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserRoleMappingInput
    connect?: UserWhereUniqueInput
  }

  export type Enumuser_roleFieldUpdateOperationsInput = {
    set?: $Enums.user_role
  }

  export type UserUpdateOneRequiredWithoutUserRoleMappingNestedInput = {
    create?: XOR<UserCreateWithoutUserRoleMappingInput, UserUncheckedCreateWithoutUserRoleMappingInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserRoleMappingInput
    upsert?: UserUpsertWithoutUserRoleMappingInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUserRoleMappingInput, UserUpdateWithoutUserRoleMappingInput>, UserUncheckedUpdateWithoutUserRoleMappingInput>
  }

  export type UserCreateNestedOneWithoutProfileInput = {
    create?: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutProfileInput
    connect?: UserWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type UserUpdateOneRequiredWithoutProfileNestedInput = {
    create?: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutProfileInput
    upsert?: UserUpsertWithoutProfileInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProfileInput, UserUpdateWithoutProfileInput>, UserUncheckedUpdateWithoutProfileInput>
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ViolationCreateNestedManyWithoutDriverInput = {
    create?: XOR<ViolationCreateWithoutDriverInput, ViolationUncheckedCreateWithoutDriverInput> | ViolationCreateWithoutDriverInput[] | ViolationUncheckedCreateWithoutDriverInput[]
    connectOrCreate?: ViolationCreateOrConnectWithoutDriverInput | ViolationCreateOrConnectWithoutDriverInput[]
    createMany?: ViolationCreateManyDriverInputEnvelope
    connect?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
  }

  export type ViolationUncheckedCreateNestedManyWithoutDriverInput = {
    create?: XOR<ViolationCreateWithoutDriverInput, ViolationUncheckedCreateWithoutDriverInput> | ViolationCreateWithoutDriverInput[] | ViolationUncheckedCreateWithoutDriverInput[]
    connectOrCreate?: ViolationCreateOrConnectWithoutDriverInput | ViolationCreateOrConnectWithoutDriverInput[]
    createMany?: ViolationCreateManyDriverInputEnvelope
    connect?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
  }

  export type ViolationUpdateManyWithoutDriverNestedInput = {
    create?: XOR<ViolationCreateWithoutDriverInput, ViolationUncheckedCreateWithoutDriverInput> | ViolationCreateWithoutDriverInput[] | ViolationUncheckedCreateWithoutDriverInput[]
    connectOrCreate?: ViolationCreateOrConnectWithoutDriverInput | ViolationCreateOrConnectWithoutDriverInput[]
    upsert?: ViolationUpsertWithWhereUniqueWithoutDriverInput | ViolationUpsertWithWhereUniqueWithoutDriverInput[]
    createMany?: ViolationCreateManyDriverInputEnvelope
    set?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    disconnect?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    delete?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    connect?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    update?: ViolationUpdateWithWhereUniqueWithoutDriverInput | ViolationUpdateWithWhereUniqueWithoutDriverInput[]
    updateMany?: ViolationUpdateManyWithWhereWithoutDriverInput | ViolationUpdateManyWithWhereWithoutDriverInput[]
    deleteMany?: ViolationScalarWhereInput | ViolationScalarWhereInput[]
  }

  export type ViolationUncheckedUpdateManyWithoutDriverNestedInput = {
    create?: XOR<ViolationCreateWithoutDriverInput, ViolationUncheckedCreateWithoutDriverInput> | ViolationCreateWithoutDriverInput[] | ViolationUncheckedCreateWithoutDriverInput[]
    connectOrCreate?: ViolationCreateOrConnectWithoutDriverInput | ViolationCreateOrConnectWithoutDriverInput[]
    upsert?: ViolationUpsertWithWhereUniqueWithoutDriverInput | ViolationUpsertWithWhereUniqueWithoutDriverInput[]
    createMany?: ViolationCreateManyDriverInputEnvelope
    set?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    disconnect?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    delete?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    connect?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    update?: ViolationUpdateWithWhereUniqueWithoutDriverInput | ViolationUpdateWithWhereUniqueWithoutDriverInput[]
    updateMany?: ViolationUpdateManyWithWhereWithoutDriverInput | ViolationUpdateManyWithWhereWithoutDriverInput[]
    deleteMany?: ViolationScalarWhereInput | ViolationScalarWhereInput[]
  }

  export type RecordHistoryCreateNestedManyWithoutRecordInput = {
    create?: XOR<RecordHistoryCreateWithoutRecordInput, RecordHistoryUncheckedCreateWithoutRecordInput> | RecordHistoryCreateWithoutRecordInput[] | RecordHistoryUncheckedCreateWithoutRecordInput[]
    connectOrCreate?: RecordHistoryCreateOrConnectWithoutRecordInput | RecordHistoryCreateOrConnectWithoutRecordInput[]
    createMany?: RecordHistoryCreateManyRecordInputEnvelope
    connect?: RecordHistoryWhereUniqueInput | RecordHistoryWhereUniqueInput[]
  }

  export type ViolationCreateNestedManyWithoutRecordInput = {
    create?: XOR<ViolationCreateWithoutRecordInput, ViolationUncheckedCreateWithoutRecordInput> | ViolationCreateWithoutRecordInput[] | ViolationUncheckedCreateWithoutRecordInput[]
    connectOrCreate?: ViolationCreateOrConnectWithoutRecordInput | ViolationCreateOrConnectWithoutRecordInput[]
    createMany?: ViolationCreateManyRecordInputEnvelope
    connect?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
  }

  export type RecordHistoryUncheckedCreateNestedManyWithoutRecordInput = {
    create?: XOR<RecordHistoryCreateWithoutRecordInput, RecordHistoryUncheckedCreateWithoutRecordInput> | RecordHistoryCreateWithoutRecordInput[] | RecordHistoryUncheckedCreateWithoutRecordInput[]
    connectOrCreate?: RecordHistoryCreateOrConnectWithoutRecordInput | RecordHistoryCreateOrConnectWithoutRecordInput[]
    createMany?: RecordHistoryCreateManyRecordInputEnvelope
    connect?: RecordHistoryWhereUniqueInput | RecordHistoryWhereUniqueInput[]
  }

  export type ViolationUncheckedCreateNestedManyWithoutRecordInput = {
    create?: XOR<ViolationCreateWithoutRecordInput, ViolationUncheckedCreateWithoutRecordInput> | ViolationCreateWithoutRecordInput[] | ViolationUncheckedCreateWithoutRecordInput[]
    connectOrCreate?: ViolationCreateOrConnectWithoutRecordInput | ViolationCreateOrConnectWithoutRecordInput[]
    createMany?: ViolationCreateManyRecordInputEnvelope
    connect?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
  }

  export type RecordHistoryUpdateManyWithoutRecordNestedInput = {
    create?: XOR<RecordHistoryCreateWithoutRecordInput, RecordHistoryUncheckedCreateWithoutRecordInput> | RecordHistoryCreateWithoutRecordInput[] | RecordHistoryUncheckedCreateWithoutRecordInput[]
    connectOrCreate?: RecordHistoryCreateOrConnectWithoutRecordInput | RecordHistoryCreateOrConnectWithoutRecordInput[]
    upsert?: RecordHistoryUpsertWithWhereUniqueWithoutRecordInput | RecordHistoryUpsertWithWhereUniqueWithoutRecordInput[]
    createMany?: RecordHistoryCreateManyRecordInputEnvelope
    set?: RecordHistoryWhereUniqueInput | RecordHistoryWhereUniqueInput[]
    disconnect?: RecordHistoryWhereUniqueInput | RecordHistoryWhereUniqueInput[]
    delete?: RecordHistoryWhereUniqueInput | RecordHistoryWhereUniqueInput[]
    connect?: RecordHistoryWhereUniqueInput | RecordHistoryWhereUniqueInput[]
    update?: RecordHistoryUpdateWithWhereUniqueWithoutRecordInput | RecordHistoryUpdateWithWhereUniqueWithoutRecordInput[]
    updateMany?: RecordHistoryUpdateManyWithWhereWithoutRecordInput | RecordHistoryUpdateManyWithWhereWithoutRecordInput[]
    deleteMany?: RecordHistoryScalarWhereInput | RecordHistoryScalarWhereInput[]
  }

  export type ViolationUpdateManyWithoutRecordNestedInput = {
    create?: XOR<ViolationCreateWithoutRecordInput, ViolationUncheckedCreateWithoutRecordInput> | ViolationCreateWithoutRecordInput[] | ViolationUncheckedCreateWithoutRecordInput[]
    connectOrCreate?: ViolationCreateOrConnectWithoutRecordInput | ViolationCreateOrConnectWithoutRecordInput[]
    upsert?: ViolationUpsertWithWhereUniqueWithoutRecordInput | ViolationUpsertWithWhereUniqueWithoutRecordInput[]
    createMany?: ViolationCreateManyRecordInputEnvelope
    set?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    disconnect?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    delete?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    connect?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    update?: ViolationUpdateWithWhereUniqueWithoutRecordInput | ViolationUpdateWithWhereUniqueWithoutRecordInput[]
    updateMany?: ViolationUpdateManyWithWhereWithoutRecordInput | ViolationUpdateManyWithWhereWithoutRecordInput[]
    deleteMany?: ViolationScalarWhereInput | ViolationScalarWhereInput[]
  }

  export type RecordHistoryUncheckedUpdateManyWithoutRecordNestedInput = {
    create?: XOR<RecordHistoryCreateWithoutRecordInput, RecordHistoryUncheckedCreateWithoutRecordInput> | RecordHistoryCreateWithoutRecordInput[] | RecordHistoryUncheckedCreateWithoutRecordInput[]
    connectOrCreate?: RecordHistoryCreateOrConnectWithoutRecordInput | RecordHistoryCreateOrConnectWithoutRecordInput[]
    upsert?: RecordHistoryUpsertWithWhereUniqueWithoutRecordInput | RecordHistoryUpsertWithWhereUniqueWithoutRecordInput[]
    createMany?: RecordHistoryCreateManyRecordInputEnvelope
    set?: RecordHistoryWhereUniqueInput | RecordHistoryWhereUniqueInput[]
    disconnect?: RecordHistoryWhereUniqueInput | RecordHistoryWhereUniqueInput[]
    delete?: RecordHistoryWhereUniqueInput | RecordHistoryWhereUniqueInput[]
    connect?: RecordHistoryWhereUniqueInput | RecordHistoryWhereUniqueInput[]
    update?: RecordHistoryUpdateWithWhereUniqueWithoutRecordInput | RecordHistoryUpdateWithWhereUniqueWithoutRecordInput[]
    updateMany?: RecordHistoryUpdateManyWithWhereWithoutRecordInput | RecordHistoryUpdateManyWithWhereWithoutRecordInput[]
    deleteMany?: RecordHistoryScalarWhereInput | RecordHistoryScalarWhereInput[]
  }

  export type ViolationUncheckedUpdateManyWithoutRecordNestedInput = {
    create?: XOR<ViolationCreateWithoutRecordInput, ViolationUncheckedCreateWithoutRecordInput> | ViolationCreateWithoutRecordInput[] | ViolationUncheckedCreateWithoutRecordInput[]
    connectOrCreate?: ViolationCreateOrConnectWithoutRecordInput | ViolationCreateOrConnectWithoutRecordInput[]
    upsert?: ViolationUpsertWithWhereUniqueWithoutRecordInput | ViolationUpsertWithWhereUniqueWithoutRecordInput[]
    createMany?: ViolationCreateManyRecordInputEnvelope
    set?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    disconnect?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    delete?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    connect?: ViolationWhereUniqueInput | ViolationWhereUniqueInput[]
    update?: ViolationUpdateWithWhereUniqueWithoutRecordInput | ViolationUpdateWithWhereUniqueWithoutRecordInput[]
    updateMany?: ViolationUpdateManyWithWhereWithoutRecordInput | ViolationUpdateManyWithWhereWithoutRecordInput[]
    deleteMany?: ViolationScalarWhereInput | ViolationScalarWhereInput[]
  }

  export type DriverCreateNestedOneWithoutViolationsInput = {
    create?: XOR<DriverCreateWithoutViolationsInput, DriverUncheckedCreateWithoutViolationsInput>
    connectOrCreate?: DriverCreateOrConnectWithoutViolationsInput
    connect?: DriverWhereUniqueInput
  }

  export type RecordCreateNestedOneWithoutViolationsInput = {
    create?: XOR<RecordCreateWithoutViolationsInput, RecordUncheckedCreateWithoutViolationsInput>
    connectOrCreate?: RecordCreateOrConnectWithoutViolationsInput
    connect?: RecordWhereUniqueInput
  }

  export type DriverUpdateOneWithoutViolationsNestedInput = {
    create?: XOR<DriverCreateWithoutViolationsInput, DriverUncheckedCreateWithoutViolationsInput>
    connectOrCreate?: DriverCreateOrConnectWithoutViolationsInput
    upsert?: DriverUpsertWithoutViolationsInput
    disconnect?: DriverWhereInput | boolean
    delete?: DriverWhereInput | boolean
    connect?: DriverWhereUniqueInput
    update?: XOR<XOR<DriverUpdateToOneWithWhereWithoutViolationsInput, DriverUpdateWithoutViolationsInput>, DriverUncheckedUpdateWithoutViolationsInput>
  }

  export type RecordUpdateOneRequiredWithoutViolationsNestedInput = {
    create?: XOR<RecordCreateWithoutViolationsInput, RecordUncheckedCreateWithoutViolationsInput>
    connectOrCreate?: RecordCreateOrConnectWithoutViolationsInput
    upsert?: RecordUpsertWithoutViolationsInput
    connect?: RecordWhereUniqueInput
    update?: XOR<XOR<RecordUpdateToOneWithWhereWithoutViolationsInput, RecordUpdateWithoutViolationsInput>, RecordUncheckedUpdateWithoutViolationsInput>
  }

  export type RecordCreateNestedOneWithoutRecordHistoryInput = {
    create?: XOR<RecordCreateWithoutRecordHistoryInput, RecordUncheckedCreateWithoutRecordHistoryInput>
    connectOrCreate?: RecordCreateOrConnectWithoutRecordHistoryInput
    connect?: RecordWhereUniqueInput
  }

  export type RecordUpdateOneRequiredWithoutRecordHistoryNestedInput = {
    create?: XOR<RecordCreateWithoutRecordHistoryInput, RecordUncheckedCreateWithoutRecordHistoryInput>
    connectOrCreate?: RecordCreateOrConnectWithoutRecordHistoryInput
    upsert?: RecordUpsertWithoutRecordHistoryInput
    connect?: RecordWhereUniqueInput
    update?: XOR<XOR<RecordUpdateToOneWithWhereWithoutRecordHistoryInput, RecordUpdateWithoutRecordHistoryInput>, RecordUncheckedUpdateWithoutRecordHistoryInput>
  }

  export type TestCreateNestedManyWithoutVehicleInput = {
    create?: XOR<TestCreateWithoutVehicleInput, TestUncheckedCreateWithoutVehicleInput> | TestCreateWithoutVehicleInput[] | TestUncheckedCreateWithoutVehicleInput[]
    connectOrCreate?: TestCreateOrConnectWithoutVehicleInput | TestCreateOrConnectWithoutVehicleInput[]
    createMany?: TestCreateManyVehicleInputEnvelope
    connect?: TestWhereUniqueInput | TestWhereUniqueInput[]
  }

  export type VehicleDriverHistoryCreateNestedManyWithoutVehicleInput = {
    create?: XOR<VehicleDriverHistoryCreateWithoutVehicleInput, VehicleDriverHistoryUncheckedCreateWithoutVehicleInput> | VehicleDriverHistoryCreateWithoutVehicleInput[] | VehicleDriverHistoryUncheckedCreateWithoutVehicleInput[]
    connectOrCreate?: VehicleDriverHistoryCreateOrConnectWithoutVehicleInput | VehicleDriverHistoryCreateOrConnectWithoutVehicleInput[]
    createMany?: VehicleDriverHistoryCreateManyVehicleInputEnvelope
    connect?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
  }

  export type TestUncheckedCreateNestedManyWithoutVehicleInput = {
    create?: XOR<TestCreateWithoutVehicleInput, TestUncheckedCreateWithoutVehicleInput> | TestCreateWithoutVehicleInput[] | TestUncheckedCreateWithoutVehicleInput[]
    connectOrCreate?: TestCreateOrConnectWithoutVehicleInput | TestCreateOrConnectWithoutVehicleInput[]
    createMany?: TestCreateManyVehicleInputEnvelope
    connect?: TestWhereUniqueInput | TestWhereUniqueInput[]
  }

  export type VehicleDriverHistoryUncheckedCreateNestedManyWithoutVehicleInput = {
    create?: XOR<VehicleDriverHistoryCreateWithoutVehicleInput, VehicleDriverHistoryUncheckedCreateWithoutVehicleInput> | VehicleDriverHistoryCreateWithoutVehicleInput[] | VehicleDriverHistoryUncheckedCreateWithoutVehicleInput[]
    connectOrCreate?: VehicleDriverHistoryCreateOrConnectWithoutVehicleInput | VehicleDriverHistoryCreateOrConnectWithoutVehicleInput[]
    createMany?: VehicleDriverHistoryCreateManyVehicleInputEnvelope
    connect?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
  }

  export type TestUpdateManyWithoutVehicleNestedInput = {
    create?: XOR<TestCreateWithoutVehicleInput, TestUncheckedCreateWithoutVehicleInput> | TestCreateWithoutVehicleInput[] | TestUncheckedCreateWithoutVehicleInput[]
    connectOrCreate?: TestCreateOrConnectWithoutVehicleInput | TestCreateOrConnectWithoutVehicleInput[]
    upsert?: TestUpsertWithWhereUniqueWithoutVehicleInput | TestUpsertWithWhereUniqueWithoutVehicleInput[]
    createMany?: TestCreateManyVehicleInputEnvelope
    set?: TestWhereUniqueInput | TestWhereUniqueInput[]
    disconnect?: TestWhereUniqueInput | TestWhereUniqueInput[]
    delete?: TestWhereUniqueInput | TestWhereUniqueInput[]
    connect?: TestWhereUniqueInput | TestWhereUniqueInput[]
    update?: TestUpdateWithWhereUniqueWithoutVehicleInput | TestUpdateWithWhereUniqueWithoutVehicleInput[]
    updateMany?: TestUpdateManyWithWhereWithoutVehicleInput | TestUpdateManyWithWhereWithoutVehicleInput[]
    deleteMany?: TestScalarWhereInput | TestScalarWhereInput[]
  }

  export type VehicleDriverHistoryUpdateManyWithoutVehicleNestedInput = {
    create?: XOR<VehicleDriverHistoryCreateWithoutVehicleInput, VehicleDriverHistoryUncheckedCreateWithoutVehicleInput> | VehicleDriverHistoryCreateWithoutVehicleInput[] | VehicleDriverHistoryUncheckedCreateWithoutVehicleInput[]
    connectOrCreate?: VehicleDriverHistoryCreateOrConnectWithoutVehicleInput | VehicleDriverHistoryCreateOrConnectWithoutVehicleInput[]
    upsert?: VehicleDriverHistoryUpsertWithWhereUniqueWithoutVehicleInput | VehicleDriverHistoryUpsertWithWhereUniqueWithoutVehicleInput[]
    createMany?: VehicleDriverHistoryCreateManyVehicleInputEnvelope
    set?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    disconnect?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    delete?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    connect?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    update?: VehicleDriverHistoryUpdateWithWhereUniqueWithoutVehicleInput | VehicleDriverHistoryUpdateWithWhereUniqueWithoutVehicleInput[]
    updateMany?: VehicleDriverHistoryUpdateManyWithWhereWithoutVehicleInput | VehicleDriverHistoryUpdateManyWithWhereWithoutVehicleInput[]
    deleteMany?: VehicleDriverHistoryScalarWhereInput | VehicleDriverHistoryScalarWhereInput[]
  }

  export type TestUncheckedUpdateManyWithoutVehicleNestedInput = {
    create?: XOR<TestCreateWithoutVehicleInput, TestUncheckedCreateWithoutVehicleInput> | TestCreateWithoutVehicleInput[] | TestUncheckedCreateWithoutVehicleInput[]
    connectOrCreate?: TestCreateOrConnectWithoutVehicleInput | TestCreateOrConnectWithoutVehicleInput[]
    upsert?: TestUpsertWithWhereUniqueWithoutVehicleInput | TestUpsertWithWhereUniqueWithoutVehicleInput[]
    createMany?: TestCreateManyVehicleInputEnvelope
    set?: TestWhereUniqueInput | TestWhereUniqueInput[]
    disconnect?: TestWhereUniqueInput | TestWhereUniqueInput[]
    delete?: TestWhereUniqueInput | TestWhereUniqueInput[]
    connect?: TestWhereUniqueInput | TestWhereUniqueInput[]
    update?: TestUpdateWithWhereUniqueWithoutVehicleInput | TestUpdateWithWhereUniqueWithoutVehicleInput[]
    updateMany?: TestUpdateManyWithWhereWithoutVehicleInput | TestUpdateManyWithWhereWithoutVehicleInput[]
    deleteMany?: TestScalarWhereInput | TestScalarWhereInput[]
  }

  export type VehicleDriverHistoryUncheckedUpdateManyWithoutVehicleNestedInput = {
    create?: XOR<VehicleDriverHistoryCreateWithoutVehicleInput, VehicleDriverHistoryUncheckedCreateWithoutVehicleInput> | VehicleDriverHistoryCreateWithoutVehicleInput[] | VehicleDriverHistoryUncheckedCreateWithoutVehicleInput[]
    connectOrCreate?: VehicleDriverHistoryCreateOrConnectWithoutVehicleInput | VehicleDriverHistoryCreateOrConnectWithoutVehicleInput[]
    upsert?: VehicleDriverHistoryUpsertWithWhereUniqueWithoutVehicleInput | VehicleDriverHistoryUpsertWithWhereUniqueWithoutVehicleInput[]
    createMany?: VehicleDriverHistoryCreateManyVehicleInputEnvelope
    set?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    disconnect?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    delete?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    connect?: VehicleDriverHistoryWhereUniqueInput | VehicleDriverHistoryWhereUniqueInput[]
    update?: VehicleDriverHistoryUpdateWithWhereUniqueWithoutVehicleInput | VehicleDriverHistoryUpdateWithWhereUniqueWithoutVehicleInput[]
    updateMany?: VehicleDriverHistoryUpdateManyWithWhereWithoutVehicleInput | VehicleDriverHistoryUpdateManyWithWhereWithoutVehicleInput[]
    deleteMany?: VehicleDriverHistoryScalarWhereInput | VehicleDriverHistoryScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutDriverHistoriesInput = {
    create?: XOR<UserCreateWithoutDriverHistoriesInput, UserUncheckedCreateWithoutDriverHistoriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDriverHistoriesInput
    connect?: UserWhereUniqueInput
  }

  export type VehicleCreateNestedOneWithoutDriverHistoryInput = {
    create?: XOR<VehicleCreateWithoutDriverHistoryInput, VehicleUncheckedCreateWithoutDriverHistoryInput>
    connectOrCreate?: VehicleCreateOrConnectWithoutDriverHistoryInput
    connect?: VehicleWhereUniqueInput
  }

  export type UserUpdateOneWithoutDriverHistoriesNestedInput = {
    create?: XOR<UserCreateWithoutDriverHistoriesInput, UserUncheckedCreateWithoutDriverHistoriesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDriverHistoriesInput
    upsert?: UserUpsertWithoutDriverHistoriesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDriverHistoriesInput, UserUpdateWithoutDriverHistoriesInput>, UserUncheckedUpdateWithoutDriverHistoriesInput>
  }

  export type VehicleUpdateOneRequiredWithoutDriverHistoryNestedInput = {
    create?: XOR<VehicleCreateWithoutDriverHistoryInput, VehicleUncheckedCreateWithoutDriverHistoryInput>
    connectOrCreate?: VehicleCreateOrConnectWithoutDriverHistoryInput
    upsert?: VehicleUpsertWithoutDriverHistoryInput
    connect?: VehicleWhereUniqueInput
    update?: XOR<XOR<VehicleUpdateToOneWithWhereWithoutDriverHistoryInput, VehicleUpdateWithoutDriverHistoryInput>, VehicleUncheckedUpdateWithoutDriverHistoryInput>
  }

  export type UserCreateNestedOneWithoutTestsInput = {
    create?: XOR<UserCreateWithoutTestsInput, UserUncheckedCreateWithoutTestsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTestsInput
    connect?: UserWhereUniqueInput
  }

  export type VehicleCreateNestedOneWithoutTestsInput = {
    create?: XOR<VehicleCreateWithoutTestsInput, VehicleUncheckedCreateWithoutTestsInput>
    connectOrCreate?: VehicleCreateOrConnectWithoutTestsInput
    connect?: VehicleWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneWithoutTestsNestedInput = {
    create?: XOR<UserCreateWithoutTestsInput, UserUncheckedCreateWithoutTestsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTestsInput
    upsert?: UserUpsertWithoutTestsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTestsInput, UserUpdateWithoutTestsInput>, UserUncheckedUpdateWithoutTestsInput>
  }

  export type VehicleUpdateOneRequiredWithoutTestsNestedInput = {
    create?: XOR<VehicleCreateWithoutTestsInput, VehicleUncheckedCreateWithoutTestsInput>
    connectOrCreate?: VehicleCreateOrConnectWithoutTestsInput
    upsert?: VehicleUpsertWithoutTestsInput
    connect?: VehicleWhereUniqueInput
    update?: XOR<XOR<VehicleUpdateToOneWithWhereWithoutTestsInput, VehicleUpdateWithoutTestsInput>, VehicleUncheckedUpdateWithoutTestsInput>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
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

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
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

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
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

  export type NestedEnumuser_roleFilter<$PrismaModel = never> = {
    equals?: $Enums.user_role | Enumuser_roleFieldRefInput<$PrismaModel>
    in?: $Enums.user_role[] | ListEnumuser_roleFieldRefInput<$PrismaModel>
    notIn?: $Enums.user_role[] | ListEnumuser_roleFieldRefInput<$PrismaModel>
    not?: NestedEnumuser_roleFilter<$PrismaModel> | $Enums.user_role
  }

  export type NestedEnumuser_roleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.user_role | Enumuser_roleFieldRefInput<$PrismaModel>
    in?: $Enums.user_role[] | ListEnumuser_roleFieldRefInput<$PrismaModel>
    notIn?: $Enums.user_role[] | ListEnumuser_roleFieldRefInput<$PrismaModel>
    not?: NestedEnumuser_roleWithAggregatesFilter<$PrismaModel> | $Enums.user_role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumuser_roleFilter<$PrismaModel>
    _max?: NestedEnumuser_roleFilter<$PrismaModel>
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

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
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

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ProfileCreateWithoutUserInput = {
    id?: string
    firstName?: string | null
    lastName?: string | null
    bio?: string | null
    jobTitle?: string | null
    department?: string | null
    phoneNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProfileUncheckedCreateWithoutUserInput = {
    id?: string
    firstName?: string | null
    lastName?: string | null
    bio?: string | null
    jobTitle?: string | null
    department?: string | null
    phoneNumber?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProfileCreateOrConnectWithoutUserInput = {
    where: ProfileWhereUniqueInput
    create: XOR<ProfileCreateWithoutUserInput, ProfileUncheckedCreateWithoutUserInput>
  }

  export type UserRoleMappingCreateWithoutUserInput = {
    id?: string
    role: $Enums.user_role
    createdAt?: Date | string
  }

  export type UserRoleMappingUncheckedCreateWithoutUserInput = {
    id?: string
    role: $Enums.user_role
    createdAt?: Date | string
  }

  export type UserRoleMappingCreateOrConnectWithoutUserInput = {
    where: UserRoleMappingWhereUniqueInput
    create: XOR<UserRoleMappingCreateWithoutUserInput, UserRoleMappingUncheckedCreateWithoutUserInput>
  }

  export type UserRoleMappingCreateManyUserInputEnvelope = {
    data: UserRoleMappingCreateManyUserInput | UserRoleMappingCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type TestCreateWithoutUserInput = {
    id?: string
    testDate: Date | string
    quarter: number
    year: number
    result: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    vehicle: VehicleCreateNestedOneWithoutTestsInput
  }

  export type TestUncheckedCreateWithoutUserInput = {
    id?: string
    vehicleId: string
    testDate: Date | string
    quarter: number
    year: number
    result: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TestCreateOrConnectWithoutUserInput = {
    where: TestWhereUniqueInput
    create: XOR<TestCreateWithoutUserInput, TestUncheckedCreateWithoutUserInput>
  }

  export type TestCreateManyUserInputEnvelope = {
    data: TestCreateManyUserInput | TestCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type VehicleDriverHistoryCreateWithoutUserInput = {
    id?: string
    driverName: string
    changedAt?: Date | string
    vehicle: VehicleCreateNestedOneWithoutDriverHistoryInput
  }

  export type VehicleDriverHistoryUncheckedCreateWithoutUserInput = {
    id?: string
    vehicleId: string
    driverName: string
    changedAt?: Date | string
  }

  export type VehicleDriverHistoryCreateOrConnectWithoutUserInput = {
    where: VehicleDriverHistoryWhereUniqueInput
    create: XOR<VehicleDriverHistoryCreateWithoutUserInput, VehicleDriverHistoryUncheckedCreateWithoutUserInput>
  }

  export type VehicleDriverHistoryCreateManyUserInputEnvelope = {
    data: VehicleDriverHistoryCreateManyUserInput | VehicleDriverHistoryCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ProfileUpsertWithoutUserInput = {
    update: XOR<ProfileUpdateWithoutUserInput, ProfileUncheckedUpdateWithoutUserInput>
    create: XOR<ProfileCreateWithoutUserInput, ProfileUncheckedCreateWithoutUserInput>
    where?: ProfileWhereInput
  }

  export type ProfileUpdateToOneWithWhereWithoutUserInput = {
    where?: ProfileWhereInput
    data: XOR<ProfileUpdateWithoutUserInput, ProfileUncheckedUpdateWithoutUserInput>
  }

  export type ProfileUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserRoleMappingUpsertWithWhereUniqueWithoutUserInput = {
    where: UserRoleMappingWhereUniqueInput
    update: XOR<UserRoleMappingUpdateWithoutUserInput, UserRoleMappingUncheckedUpdateWithoutUserInput>
    create: XOR<UserRoleMappingCreateWithoutUserInput, UserRoleMappingUncheckedCreateWithoutUserInput>
  }

  export type UserRoleMappingUpdateWithWhereUniqueWithoutUserInput = {
    where: UserRoleMappingWhereUniqueInput
    data: XOR<UserRoleMappingUpdateWithoutUserInput, UserRoleMappingUncheckedUpdateWithoutUserInput>
  }

  export type UserRoleMappingUpdateManyWithWhereWithoutUserInput = {
    where: UserRoleMappingScalarWhereInput
    data: XOR<UserRoleMappingUpdateManyMutationInput, UserRoleMappingUncheckedUpdateManyWithoutUserInput>
  }

  export type UserRoleMappingScalarWhereInput = {
    AND?: UserRoleMappingScalarWhereInput | UserRoleMappingScalarWhereInput[]
    OR?: UserRoleMappingScalarWhereInput[]
    NOT?: UserRoleMappingScalarWhereInput | UserRoleMappingScalarWhereInput[]
    id?: UuidFilter<"UserRoleMapping"> | string
    userId?: UuidFilter<"UserRoleMapping"> | string
    role?: Enumuser_roleFilter<"UserRoleMapping"> | $Enums.user_role
    createdAt?: DateTimeFilter<"UserRoleMapping"> | Date | string
  }

  export type TestUpsertWithWhereUniqueWithoutUserInput = {
    where: TestWhereUniqueInput
    update: XOR<TestUpdateWithoutUserInput, TestUncheckedUpdateWithoutUserInput>
    create: XOR<TestCreateWithoutUserInput, TestUncheckedCreateWithoutUserInput>
  }

  export type TestUpdateWithWhereUniqueWithoutUserInput = {
    where: TestWhereUniqueInput
    data: XOR<TestUpdateWithoutUserInput, TestUncheckedUpdateWithoutUserInput>
  }

  export type TestUpdateManyWithWhereWithoutUserInput = {
    where: TestScalarWhereInput
    data: XOR<TestUpdateManyMutationInput, TestUncheckedUpdateManyWithoutUserInput>
  }

  export type TestScalarWhereInput = {
    AND?: TestScalarWhereInput | TestScalarWhereInput[]
    OR?: TestScalarWhereInput[]
    NOT?: TestScalarWhereInput | TestScalarWhereInput[]
    id?: UuidFilter<"Test"> | string
    vehicleId?: UuidFilter<"Test"> | string
    testDate?: DateTimeFilter<"Test"> | Date | string
    quarter?: IntFilter<"Test"> | number
    year?: IntFilter<"Test"> | number
    result?: BoolFilter<"Test"> | boolean
    createdBy?: UuidNullableFilter<"Test"> | string | null
    createdAt?: DateTimeFilter<"Test"> | Date | string
    updatedAt?: DateTimeFilter<"Test"> | Date | string
  }

  export type VehicleDriverHistoryUpsertWithWhereUniqueWithoutUserInput = {
    where: VehicleDriverHistoryWhereUniqueInput
    update: XOR<VehicleDriverHistoryUpdateWithoutUserInput, VehicleDriverHistoryUncheckedUpdateWithoutUserInput>
    create: XOR<VehicleDriverHistoryCreateWithoutUserInput, VehicleDriverHistoryUncheckedCreateWithoutUserInput>
  }

  export type VehicleDriverHistoryUpdateWithWhereUniqueWithoutUserInput = {
    where: VehicleDriverHistoryWhereUniqueInput
    data: XOR<VehicleDriverHistoryUpdateWithoutUserInput, VehicleDriverHistoryUncheckedUpdateWithoutUserInput>
  }

  export type VehicleDriverHistoryUpdateManyWithWhereWithoutUserInput = {
    where: VehicleDriverHistoryScalarWhereInput
    data: XOR<VehicleDriverHistoryUpdateManyMutationInput, VehicleDriverHistoryUncheckedUpdateManyWithoutUserInput>
  }

  export type VehicleDriverHistoryScalarWhereInput = {
    AND?: VehicleDriverHistoryScalarWhereInput | VehicleDriverHistoryScalarWhereInput[]
    OR?: VehicleDriverHistoryScalarWhereInput[]
    NOT?: VehicleDriverHistoryScalarWhereInput | VehicleDriverHistoryScalarWhereInput[]
    id?: UuidFilter<"VehicleDriverHistory"> | string
    vehicleId?: UuidFilter<"VehicleDriverHistory"> | string
    driverName?: StringFilter<"VehicleDriverHistory"> | string
    changedAt?: DateTimeFilter<"VehicleDriverHistory"> | Date | string
    changedBy?: UuidNullableFilter<"VehicleDriverHistory"> | string | null
  }

  export type UserCreateWithoutUserRoleMappingInput = {
    id?: string
    email: string
    encryptedPassword: string
    isSuperAdmin?: boolean | null
    lastSignInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    profile?: ProfileCreateNestedOneWithoutUserInput
    tests?: TestCreateNestedManyWithoutUserInput
    driverHistories?: VehicleDriverHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutUserRoleMappingInput = {
    id?: string
    email: string
    encryptedPassword: string
    isSuperAdmin?: boolean | null
    lastSignInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    profile?: ProfileUncheckedCreateNestedOneWithoutUserInput
    tests?: TestUncheckedCreateNestedManyWithoutUserInput
    driverHistories?: VehicleDriverHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutUserRoleMappingInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUserRoleMappingInput, UserUncheckedCreateWithoutUserRoleMappingInput>
  }

  export type UserUpsertWithoutUserRoleMappingInput = {
    update: XOR<UserUpdateWithoutUserRoleMappingInput, UserUncheckedUpdateWithoutUserRoleMappingInput>
    create: XOR<UserCreateWithoutUserRoleMappingInput, UserUncheckedCreateWithoutUserRoleMappingInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUserRoleMappingInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUserRoleMappingInput, UserUncheckedUpdateWithoutUserRoleMappingInput>
  }

  export type UserUpdateWithoutUserRoleMappingInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    isSuperAdmin?: NullableBoolFieldUpdateOperationsInput | boolean | null
    lastSignInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profile?: ProfileUpdateOneWithoutUserNestedInput
    tests?: TestUpdateManyWithoutUserNestedInput
    driverHistories?: VehicleDriverHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutUserRoleMappingInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    isSuperAdmin?: NullableBoolFieldUpdateOperationsInput | boolean | null
    lastSignInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profile?: ProfileUncheckedUpdateOneWithoutUserNestedInput
    tests?: TestUncheckedUpdateManyWithoutUserNestedInput
    driverHistories?: VehicleDriverHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutProfileInput = {
    id?: string
    email: string
    encryptedPassword: string
    isSuperAdmin?: boolean | null
    lastSignInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    UserRoleMapping?: UserRoleMappingCreateNestedManyWithoutUserInput
    tests?: TestCreateNestedManyWithoutUserInput
    driverHistories?: VehicleDriverHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutProfileInput = {
    id?: string
    email: string
    encryptedPassword: string
    isSuperAdmin?: boolean | null
    lastSignInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    UserRoleMapping?: UserRoleMappingUncheckedCreateNestedManyWithoutUserInput
    tests?: TestUncheckedCreateNestedManyWithoutUserInput
    driverHistories?: VehicleDriverHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutProfileInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
  }

  export type UserUpsertWithoutProfileInput = {
    update: XOR<UserUpdateWithoutProfileInput, UserUncheckedUpdateWithoutProfileInput>
    create: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProfileInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProfileInput, UserUncheckedUpdateWithoutProfileInput>
  }

  export type UserUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    isSuperAdmin?: NullableBoolFieldUpdateOperationsInput | boolean | null
    lastSignInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    UserRoleMapping?: UserRoleMappingUpdateManyWithoutUserNestedInput
    tests?: TestUpdateManyWithoutUserNestedInput
    driverHistories?: VehicleDriverHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    isSuperAdmin?: NullableBoolFieldUpdateOperationsInput | boolean | null
    lastSignInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    UserRoleMapping?: UserRoleMappingUncheckedUpdateManyWithoutUserNestedInput
    tests?: TestUncheckedUpdateManyWithoutUserNestedInput
    driverHistories?: VehicleDriverHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ViolationCreateWithoutDriverInput = {
    ordinanceInfractionReportNo?: string | null
    smokeDensityTestResultNo?: string | null
    placeOfApprehension: string
    dateOfApprehension: Date | string
    paidDriver?: boolean | null
    paidOperator?: boolean | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    record: RecordCreateNestedOneWithoutViolationsInput
  }

  export type ViolationUncheckedCreateWithoutDriverInput = {
    id?: number
    recordId: number
    ordinanceInfractionReportNo?: string | null
    smokeDensityTestResultNo?: string | null
    placeOfApprehension: string
    dateOfApprehension: Date | string
    paidDriver?: boolean | null
    paidOperator?: boolean | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type ViolationCreateOrConnectWithoutDriverInput = {
    where: ViolationWhereUniqueInput
    create: XOR<ViolationCreateWithoutDriverInput, ViolationUncheckedCreateWithoutDriverInput>
  }

  export type ViolationCreateManyDriverInputEnvelope = {
    data: ViolationCreateManyDriverInput | ViolationCreateManyDriverInput[]
    skipDuplicates?: boolean
  }

  export type ViolationUpsertWithWhereUniqueWithoutDriverInput = {
    where: ViolationWhereUniqueInput
    update: XOR<ViolationUpdateWithoutDriverInput, ViolationUncheckedUpdateWithoutDriverInput>
    create: XOR<ViolationCreateWithoutDriverInput, ViolationUncheckedCreateWithoutDriverInput>
  }

  export type ViolationUpdateWithWhereUniqueWithoutDriverInput = {
    where: ViolationWhereUniqueInput
    data: XOR<ViolationUpdateWithoutDriverInput, ViolationUncheckedUpdateWithoutDriverInput>
  }

  export type ViolationUpdateManyWithWhereWithoutDriverInput = {
    where: ViolationScalarWhereInput
    data: XOR<ViolationUpdateManyMutationInput, ViolationUncheckedUpdateManyWithoutDriverInput>
  }

  export type ViolationScalarWhereInput = {
    AND?: ViolationScalarWhereInput | ViolationScalarWhereInput[]
    OR?: ViolationScalarWhereInput[]
    NOT?: ViolationScalarWhereInput | ViolationScalarWhereInput[]
    id?: IntFilter<"Violation"> | number
    recordId?: IntFilter<"Violation"> | number
    ordinanceInfractionReportNo?: StringNullableFilter<"Violation"> | string | null
    smokeDensityTestResultNo?: StringNullableFilter<"Violation"> | string | null
    placeOfApprehension?: StringFilter<"Violation"> | string
    dateOfApprehension?: DateTimeFilter<"Violation"> | Date | string
    paidDriver?: BoolNullableFilter<"Violation"> | boolean | null
    paidOperator?: BoolNullableFilter<"Violation"> | boolean | null
    driverId?: UuidNullableFilter<"Violation"> | string | null
    createdAt?: DateTimeNullableFilter<"Violation"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"Violation"> | Date | string | null
  }

  export type RecordHistoryCreateWithoutRecordInput = {
    type: string
    date: Date | string
    details?: string | null
    orNumber?: string | null
    status: string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type RecordHistoryUncheckedCreateWithoutRecordInput = {
    id?: number
    type: string
    date: Date | string
    details?: string | null
    orNumber?: string | null
    status: string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type RecordHistoryCreateOrConnectWithoutRecordInput = {
    where: RecordHistoryWhereUniqueInput
    create: XOR<RecordHistoryCreateWithoutRecordInput, RecordHistoryUncheckedCreateWithoutRecordInput>
  }

  export type RecordHistoryCreateManyRecordInputEnvelope = {
    data: RecordHistoryCreateManyRecordInput | RecordHistoryCreateManyRecordInput[]
    skipDuplicates?: boolean
  }

  export type ViolationCreateWithoutRecordInput = {
    ordinanceInfractionReportNo?: string | null
    smokeDensityTestResultNo?: string | null
    placeOfApprehension: string
    dateOfApprehension: Date | string
    paidDriver?: boolean | null
    paidOperator?: boolean | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    driver?: DriverCreateNestedOneWithoutViolationsInput
  }

  export type ViolationUncheckedCreateWithoutRecordInput = {
    id?: number
    ordinanceInfractionReportNo?: string | null
    smokeDensityTestResultNo?: string | null
    placeOfApprehension: string
    dateOfApprehension: Date | string
    paidDriver?: boolean | null
    paidOperator?: boolean | null
    driverId?: string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type ViolationCreateOrConnectWithoutRecordInput = {
    where: ViolationWhereUniqueInput
    create: XOR<ViolationCreateWithoutRecordInput, ViolationUncheckedCreateWithoutRecordInput>
  }

  export type ViolationCreateManyRecordInputEnvelope = {
    data: ViolationCreateManyRecordInput | ViolationCreateManyRecordInput[]
    skipDuplicates?: boolean
  }

  export type RecordHistoryUpsertWithWhereUniqueWithoutRecordInput = {
    where: RecordHistoryWhereUniqueInput
    update: XOR<RecordHistoryUpdateWithoutRecordInput, RecordHistoryUncheckedUpdateWithoutRecordInput>
    create: XOR<RecordHistoryCreateWithoutRecordInput, RecordHistoryUncheckedCreateWithoutRecordInput>
  }

  export type RecordHistoryUpdateWithWhereUniqueWithoutRecordInput = {
    where: RecordHistoryWhereUniqueInput
    data: XOR<RecordHistoryUpdateWithoutRecordInput, RecordHistoryUncheckedUpdateWithoutRecordInput>
  }

  export type RecordHistoryUpdateManyWithWhereWithoutRecordInput = {
    where: RecordHistoryScalarWhereInput
    data: XOR<RecordHistoryUpdateManyMutationInput, RecordHistoryUncheckedUpdateManyWithoutRecordInput>
  }

  export type RecordHistoryScalarWhereInput = {
    AND?: RecordHistoryScalarWhereInput | RecordHistoryScalarWhereInput[]
    OR?: RecordHistoryScalarWhereInput[]
    NOT?: RecordHistoryScalarWhereInput | RecordHistoryScalarWhereInput[]
    id?: IntFilter<"RecordHistory"> | number
    recordId?: IntFilter<"RecordHistory"> | number
    type?: StringFilter<"RecordHistory"> | string
    date?: DateTimeFilter<"RecordHistory"> | Date | string
    details?: StringNullableFilter<"RecordHistory"> | string | null
    orNumber?: StringNullableFilter<"RecordHistory"> | string | null
    status?: StringFilter<"RecordHistory"> | string
    createdAt?: DateTimeNullableFilter<"RecordHistory"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"RecordHistory"> | Date | string | null
  }

  export type ViolationUpsertWithWhereUniqueWithoutRecordInput = {
    where: ViolationWhereUniqueInput
    update: XOR<ViolationUpdateWithoutRecordInput, ViolationUncheckedUpdateWithoutRecordInput>
    create: XOR<ViolationCreateWithoutRecordInput, ViolationUncheckedCreateWithoutRecordInput>
  }

  export type ViolationUpdateWithWhereUniqueWithoutRecordInput = {
    where: ViolationWhereUniqueInput
    data: XOR<ViolationUpdateWithoutRecordInput, ViolationUncheckedUpdateWithoutRecordInput>
  }

  export type ViolationUpdateManyWithWhereWithoutRecordInput = {
    where: ViolationScalarWhereInput
    data: XOR<ViolationUpdateManyMutationInput, ViolationUncheckedUpdateManyWithoutRecordInput>
  }

  export type DriverCreateWithoutViolationsInput = {
    id?: string
    firstName: string
    middleName?: string | null
    lastName: string
    address: string
    licenseNumber: string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type DriverUncheckedCreateWithoutViolationsInput = {
    id?: string
    firstName: string
    middleName?: string | null
    lastName: string
    address: string
    licenseNumber: string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type DriverCreateOrConnectWithoutViolationsInput = {
    where: DriverWhereUniqueInput
    create: XOR<DriverCreateWithoutViolationsInput, DriverUncheckedCreateWithoutViolationsInput>
  }

  export type RecordCreateWithoutViolationsInput = {
    plateNumber: string
    vehicleType: string
    transportGroup?: string | null
    operatorCompanyName: string
    operatorAddress?: string | null
    ownerFirstName?: string | null
    ownerMiddleName?: string | null
    ownerLastName?: string | null
    motorNo?: string | null
    motorVehicleName?: string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    recordHistory?: RecordHistoryCreateNestedManyWithoutRecordInput
  }

  export type RecordUncheckedCreateWithoutViolationsInput = {
    id?: number
    plateNumber: string
    vehicleType: string
    transportGroup?: string | null
    operatorCompanyName: string
    operatorAddress?: string | null
    ownerFirstName?: string | null
    ownerMiddleName?: string | null
    ownerLastName?: string | null
    motorNo?: string | null
    motorVehicleName?: string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    recordHistory?: RecordHistoryUncheckedCreateNestedManyWithoutRecordInput
  }

  export type RecordCreateOrConnectWithoutViolationsInput = {
    where: RecordWhereUniqueInput
    create: XOR<RecordCreateWithoutViolationsInput, RecordUncheckedCreateWithoutViolationsInput>
  }

  export type DriverUpsertWithoutViolationsInput = {
    update: XOR<DriverUpdateWithoutViolationsInput, DriverUncheckedUpdateWithoutViolationsInput>
    create: XOR<DriverCreateWithoutViolationsInput, DriverUncheckedCreateWithoutViolationsInput>
    where?: DriverWhereInput
  }

  export type DriverUpdateToOneWithWhereWithoutViolationsInput = {
    where?: DriverWhereInput
    data: XOR<DriverUpdateWithoutViolationsInput, DriverUncheckedUpdateWithoutViolationsInput>
  }

  export type DriverUpdateWithoutViolationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DriverUncheckedUpdateWithoutViolationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    licenseNumber?: StringFieldUpdateOperationsInput | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RecordUpsertWithoutViolationsInput = {
    update: XOR<RecordUpdateWithoutViolationsInput, RecordUncheckedUpdateWithoutViolationsInput>
    create: XOR<RecordCreateWithoutViolationsInput, RecordUncheckedCreateWithoutViolationsInput>
    where?: RecordWhereInput
  }

  export type RecordUpdateToOneWithWhereWithoutViolationsInput = {
    where?: RecordWhereInput
    data: XOR<RecordUpdateWithoutViolationsInput, RecordUncheckedUpdateWithoutViolationsInput>
  }

  export type RecordUpdateWithoutViolationsInput = {
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    transportGroup?: NullableStringFieldUpdateOperationsInput | string | null
    operatorCompanyName?: StringFieldUpdateOperationsInput | string
    operatorAddress?: NullableStringFieldUpdateOperationsInput | string | null
    ownerFirstName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerMiddleName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerLastName?: NullableStringFieldUpdateOperationsInput | string | null
    motorNo?: NullableStringFieldUpdateOperationsInput | string | null
    motorVehicleName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recordHistory?: RecordHistoryUpdateManyWithoutRecordNestedInput
  }

  export type RecordUncheckedUpdateWithoutViolationsInput = {
    id?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    transportGroup?: NullableStringFieldUpdateOperationsInput | string | null
    operatorCompanyName?: StringFieldUpdateOperationsInput | string
    operatorAddress?: NullableStringFieldUpdateOperationsInput | string | null
    ownerFirstName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerMiddleName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerLastName?: NullableStringFieldUpdateOperationsInput | string | null
    motorNo?: NullableStringFieldUpdateOperationsInput | string | null
    motorVehicleName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recordHistory?: RecordHistoryUncheckedUpdateManyWithoutRecordNestedInput
  }

  export type RecordCreateWithoutRecordHistoryInput = {
    plateNumber: string
    vehicleType: string
    transportGroup?: string | null
    operatorCompanyName: string
    operatorAddress?: string | null
    ownerFirstName?: string | null
    ownerMiddleName?: string | null
    ownerLastName?: string | null
    motorNo?: string | null
    motorVehicleName?: string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    violations?: ViolationCreateNestedManyWithoutRecordInput
  }

  export type RecordUncheckedCreateWithoutRecordHistoryInput = {
    id?: number
    plateNumber: string
    vehicleType: string
    transportGroup?: string | null
    operatorCompanyName: string
    operatorAddress?: string | null
    ownerFirstName?: string | null
    ownerMiddleName?: string | null
    ownerLastName?: string | null
    motorNo?: string | null
    motorVehicleName?: string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    violations?: ViolationUncheckedCreateNestedManyWithoutRecordInput
  }

  export type RecordCreateOrConnectWithoutRecordHistoryInput = {
    where: RecordWhereUniqueInput
    create: XOR<RecordCreateWithoutRecordHistoryInput, RecordUncheckedCreateWithoutRecordHistoryInput>
  }

  export type RecordUpsertWithoutRecordHistoryInput = {
    update: XOR<RecordUpdateWithoutRecordHistoryInput, RecordUncheckedUpdateWithoutRecordHistoryInput>
    create: XOR<RecordCreateWithoutRecordHistoryInput, RecordUncheckedCreateWithoutRecordHistoryInput>
    where?: RecordWhereInput
  }

  export type RecordUpdateToOneWithWhereWithoutRecordHistoryInput = {
    where?: RecordWhereInput
    data: XOR<RecordUpdateWithoutRecordHistoryInput, RecordUncheckedUpdateWithoutRecordHistoryInput>
  }

  export type RecordUpdateWithoutRecordHistoryInput = {
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    transportGroup?: NullableStringFieldUpdateOperationsInput | string | null
    operatorCompanyName?: StringFieldUpdateOperationsInput | string
    operatorAddress?: NullableStringFieldUpdateOperationsInput | string | null
    ownerFirstName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerMiddleName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerLastName?: NullableStringFieldUpdateOperationsInput | string | null
    motorNo?: NullableStringFieldUpdateOperationsInput | string | null
    motorVehicleName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    violations?: ViolationUpdateManyWithoutRecordNestedInput
  }

  export type RecordUncheckedUpdateWithoutRecordHistoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    transportGroup?: NullableStringFieldUpdateOperationsInput | string | null
    operatorCompanyName?: StringFieldUpdateOperationsInput | string
    operatorAddress?: NullableStringFieldUpdateOperationsInput | string | null
    ownerFirstName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerMiddleName?: NullableStringFieldUpdateOperationsInput | string | null
    ownerLastName?: NullableStringFieldUpdateOperationsInput | string | null
    motorNo?: NullableStringFieldUpdateOperationsInput | string | null
    motorVehicleName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    violations?: ViolationUncheckedUpdateManyWithoutRecordNestedInput
  }

  export type TestCreateWithoutVehicleInput = {
    id?: string
    testDate: Date | string
    quarter: number
    year: number
    result: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user?: UserCreateNestedOneWithoutTestsInput
  }

  export type TestUncheckedCreateWithoutVehicleInput = {
    id?: string
    testDate: Date | string
    quarter: number
    year: number
    result: boolean
    createdBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TestCreateOrConnectWithoutVehicleInput = {
    where: TestWhereUniqueInput
    create: XOR<TestCreateWithoutVehicleInput, TestUncheckedCreateWithoutVehicleInput>
  }

  export type TestCreateManyVehicleInputEnvelope = {
    data: TestCreateManyVehicleInput | TestCreateManyVehicleInput[]
    skipDuplicates?: boolean
  }

  export type VehicleDriverHistoryCreateWithoutVehicleInput = {
    id?: string
    driverName: string
    changedAt?: Date | string
    user?: UserCreateNestedOneWithoutDriverHistoriesInput
  }

  export type VehicleDriverHistoryUncheckedCreateWithoutVehicleInput = {
    id?: string
    driverName: string
    changedAt?: Date | string
    changedBy?: string | null
  }

  export type VehicleDriverHistoryCreateOrConnectWithoutVehicleInput = {
    where: VehicleDriverHistoryWhereUniqueInput
    create: XOR<VehicleDriverHistoryCreateWithoutVehicleInput, VehicleDriverHistoryUncheckedCreateWithoutVehicleInput>
  }

  export type VehicleDriverHistoryCreateManyVehicleInputEnvelope = {
    data: VehicleDriverHistoryCreateManyVehicleInput | VehicleDriverHistoryCreateManyVehicleInput[]
    skipDuplicates?: boolean
  }

  export type TestUpsertWithWhereUniqueWithoutVehicleInput = {
    where: TestWhereUniqueInput
    update: XOR<TestUpdateWithoutVehicleInput, TestUncheckedUpdateWithoutVehicleInput>
    create: XOR<TestCreateWithoutVehicleInput, TestUncheckedCreateWithoutVehicleInput>
  }

  export type TestUpdateWithWhereUniqueWithoutVehicleInput = {
    where: TestWhereUniqueInput
    data: XOR<TestUpdateWithoutVehicleInput, TestUncheckedUpdateWithoutVehicleInput>
  }

  export type TestUpdateManyWithWhereWithoutVehicleInput = {
    where: TestScalarWhereInput
    data: XOR<TestUpdateManyMutationInput, TestUncheckedUpdateManyWithoutVehicleInput>
  }

  export type VehicleDriverHistoryUpsertWithWhereUniqueWithoutVehicleInput = {
    where: VehicleDriverHistoryWhereUniqueInput
    update: XOR<VehicleDriverHistoryUpdateWithoutVehicleInput, VehicleDriverHistoryUncheckedUpdateWithoutVehicleInput>
    create: XOR<VehicleDriverHistoryCreateWithoutVehicleInput, VehicleDriverHistoryUncheckedCreateWithoutVehicleInput>
  }

  export type VehicleDriverHistoryUpdateWithWhereUniqueWithoutVehicleInput = {
    where: VehicleDriverHistoryWhereUniqueInput
    data: XOR<VehicleDriverHistoryUpdateWithoutVehicleInput, VehicleDriverHistoryUncheckedUpdateWithoutVehicleInput>
  }

  export type VehicleDriverHistoryUpdateManyWithWhereWithoutVehicleInput = {
    where: VehicleDriverHistoryScalarWhereInput
    data: XOR<VehicleDriverHistoryUpdateManyMutationInput, VehicleDriverHistoryUncheckedUpdateManyWithoutVehicleInput>
  }

  export type UserCreateWithoutDriverHistoriesInput = {
    id?: string
    email: string
    encryptedPassword: string
    isSuperAdmin?: boolean | null
    lastSignInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    profile?: ProfileCreateNestedOneWithoutUserInput
    UserRoleMapping?: UserRoleMappingCreateNestedManyWithoutUserInput
    tests?: TestCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDriverHistoriesInput = {
    id?: string
    email: string
    encryptedPassword: string
    isSuperAdmin?: boolean | null
    lastSignInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    profile?: ProfileUncheckedCreateNestedOneWithoutUserInput
    UserRoleMapping?: UserRoleMappingUncheckedCreateNestedManyWithoutUserInput
    tests?: TestUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDriverHistoriesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDriverHistoriesInput, UserUncheckedCreateWithoutDriverHistoriesInput>
  }

  export type VehicleCreateWithoutDriverHistoryInput = {
    id?: string
    driverName: string
    contactNumber?: string | null
    engineType: string
    officeName: string
    plateNumber: string
    vehicleType: string
    wheels: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tests?: TestCreateNestedManyWithoutVehicleInput
  }

  export type VehicleUncheckedCreateWithoutDriverHistoryInput = {
    id?: string
    driverName: string
    contactNumber?: string | null
    engineType: string
    officeName: string
    plateNumber: string
    vehicleType: string
    wheels: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tests?: TestUncheckedCreateNestedManyWithoutVehicleInput
  }

  export type VehicleCreateOrConnectWithoutDriverHistoryInput = {
    where: VehicleWhereUniqueInput
    create: XOR<VehicleCreateWithoutDriverHistoryInput, VehicleUncheckedCreateWithoutDriverHistoryInput>
  }

  export type UserUpsertWithoutDriverHistoriesInput = {
    update: XOR<UserUpdateWithoutDriverHistoriesInput, UserUncheckedUpdateWithoutDriverHistoriesInput>
    create: XOR<UserCreateWithoutDriverHistoriesInput, UserUncheckedCreateWithoutDriverHistoriesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDriverHistoriesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDriverHistoriesInput, UserUncheckedUpdateWithoutDriverHistoriesInput>
  }

  export type UserUpdateWithoutDriverHistoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    isSuperAdmin?: NullableBoolFieldUpdateOperationsInput | boolean | null
    lastSignInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profile?: ProfileUpdateOneWithoutUserNestedInput
    UserRoleMapping?: UserRoleMappingUpdateManyWithoutUserNestedInput
    tests?: TestUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDriverHistoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    isSuperAdmin?: NullableBoolFieldUpdateOperationsInput | boolean | null
    lastSignInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profile?: ProfileUncheckedUpdateOneWithoutUserNestedInput
    UserRoleMapping?: UserRoleMappingUncheckedUpdateManyWithoutUserNestedInput
    tests?: TestUncheckedUpdateManyWithoutUserNestedInput
  }

  export type VehicleUpsertWithoutDriverHistoryInput = {
    update: XOR<VehicleUpdateWithoutDriverHistoryInput, VehicleUncheckedUpdateWithoutDriverHistoryInput>
    create: XOR<VehicleCreateWithoutDriverHistoryInput, VehicleUncheckedCreateWithoutDriverHistoryInput>
    where?: VehicleWhereInput
  }

  export type VehicleUpdateToOneWithWhereWithoutDriverHistoryInput = {
    where?: VehicleWhereInput
    data: XOR<VehicleUpdateWithoutDriverHistoryInput, VehicleUncheckedUpdateWithoutDriverHistoryInput>
  }

  export type VehicleUpdateWithoutDriverHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: StringFieldUpdateOperationsInput | string
    officeName?: StringFieldUpdateOperationsInput | string
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    wheels?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tests?: TestUpdateManyWithoutVehicleNestedInput
  }

  export type VehicleUncheckedUpdateWithoutDriverHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: StringFieldUpdateOperationsInput | string
    officeName?: StringFieldUpdateOperationsInput | string
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    wheels?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tests?: TestUncheckedUpdateManyWithoutVehicleNestedInput
  }

  export type UserCreateWithoutTestsInput = {
    id?: string
    email: string
    encryptedPassword: string
    isSuperAdmin?: boolean | null
    lastSignInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    profile?: ProfileCreateNestedOneWithoutUserInput
    UserRoleMapping?: UserRoleMappingCreateNestedManyWithoutUserInput
    driverHistories?: VehicleDriverHistoryCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTestsInput = {
    id?: string
    email: string
    encryptedPassword: string
    isSuperAdmin?: boolean | null
    lastSignInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    profile?: ProfileUncheckedCreateNestedOneWithoutUserInput
    UserRoleMapping?: UserRoleMappingUncheckedCreateNestedManyWithoutUserInput
    driverHistories?: VehicleDriverHistoryUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTestsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTestsInput, UserUncheckedCreateWithoutTestsInput>
  }

  export type VehicleCreateWithoutTestsInput = {
    id?: string
    driverName: string
    contactNumber?: string | null
    engineType: string
    officeName: string
    plateNumber: string
    vehicleType: string
    wheels: number
    createdAt?: Date | string
    updatedAt?: Date | string
    driverHistory?: VehicleDriverHistoryCreateNestedManyWithoutVehicleInput
  }

  export type VehicleUncheckedCreateWithoutTestsInput = {
    id?: string
    driverName: string
    contactNumber?: string | null
    engineType: string
    officeName: string
    plateNumber: string
    vehicleType: string
    wheels: number
    createdAt?: Date | string
    updatedAt?: Date | string
    driverHistory?: VehicleDriverHistoryUncheckedCreateNestedManyWithoutVehicleInput
  }

  export type VehicleCreateOrConnectWithoutTestsInput = {
    where: VehicleWhereUniqueInput
    create: XOR<VehicleCreateWithoutTestsInput, VehicleUncheckedCreateWithoutTestsInput>
  }

  export type UserUpsertWithoutTestsInput = {
    update: XOR<UserUpdateWithoutTestsInput, UserUncheckedUpdateWithoutTestsInput>
    create: XOR<UserCreateWithoutTestsInput, UserUncheckedCreateWithoutTestsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTestsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTestsInput, UserUncheckedUpdateWithoutTestsInput>
  }

  export type UserUpdateWithoutTestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    isSuperAdmin?: NullableBoolFieldUpdateOperationsInput | boolean | null
    lastSignInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profile?: ProfileUpdateOneWithoutUserNestedInput
    UserRoleMapping?: UserRoleMappingUpdateManyWithoutUserNestedInput
    driverHistories?: VehicleDriverHistoryUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    isSuperAdmin?: NullableBoolFieldUpdateOperationsInput | boolean | null
    lastSignInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profile?: ProfileUncheckedUpdateOneWithoutUserNestedInput
    UserRoleMapping?: UserRoleMappingUncheckedUpdateManyWithoutUserNestedInput
    driverHistories?: VehicleDriverHistoryUncheckedUpdateManyWithoutUserNestedInput
  }

  export type VehicleUpsertWithoutTestsInput = {
    update: XOR<VehicleUpdateWithoutTestsInput, VehicleUncheckedUpdateWithoutTestsInput>
    create: XOR<VehicleCreateWithoutTestsInput, VehicleUncheckedCreateWithoutTestsInput>
    where?: VehicleWhereInput
  }

  export type VehicleUpdateToOneWithWhereWithoutTestsInput = {
    where?: VehicleWhereInput
    data: XOR<VehicleUpdateWithoutTestsInput, VehicleUncheckedUpdateWithoutTestsInput>
  }

  export type VehicleUpdateWithoutTestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: StringFieldUpdateOperationsInput | string
    officeName?: StringFieldUpdateOperationsInput | string
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    wheels?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    driverHistory?: VehicleDriverHistoryUpdateManyWithoutVehicleNestedInput
  }

  export type VehicleUncheckedUpdateWithoutTestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    contactNumber?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: StringFieldUpdateOperationsInput | string
    officeName?: StringFieldUpdateOperationsInput | string
    plateNumber?: StringFieldUpdateOperationsInput | string
    vehicleType?: StringFieldUpdateOperationsInput | string
    wheels?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    driverHistory?: VehicleDriverHistoryUncheckedUpdateManyWithoutVehicleNestedInput
  }

  export type UserRoleMappingCreateManyUserInput = {
    id?: string
    role: $Enums.user_role
    createdAt?: Date | string
  }

  export type TestCreateManyUserInput = {
    id?: string
    vehicleId: string
    testDate: Date | string
    quarter: number
    year: number
    result: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VehicleDriverHistoryCreateManyUserInput = {
    id?: string
    vehicleId: string
    driverName: string
    changedAt?: Date | string
  }

  export type UserRoleMappingUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: Enumuser_roleFieldUpdateOperationsInput | $Enums.user_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserRoleMappingUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: Enumuser_roleFieldUpdateOperationsInput | $Enums.user_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserRoleMappingUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: Enumuser_roleFieldUpdateOperationsInput | $Enums.user_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    testDate?: DateTimeFieldUpdateOperationsInput | Date | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    result?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vehicle?: VehicleUpdateOneRequiredWithoutTestsNestedInput
  }

  export type TestUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    testDate?: DateTimeFieldUpdateOperationsInput | Date | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    result?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    testDate?: DateTimeFieldUpdateOperationsInput | Date | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    result?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VehicleDriverHistoryUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    vehicle?: VehicleUpdateOneRequiredWithoutDriverHistoryNestedInput
  }

  export type VehicleDriverHistoryUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VehicleDriverHistoryUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    vehicleId?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ViolationCreateManyDriverInput = {
    id?: number
    recordId: number
    ordinanceInfractionReportNo?: string | null
    smokeDensityTestResultNo?: string | null
    placeOfApprehension: string
    dateOfApprehension: Date | string
    paidDriver?: boolean | null
    paidOperator?: boolean | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type ViolationUpdateWithoutDriverInput = {
    ordinanceInfractionReportNo?: NullableStringFieldUpdateOperationsInput | string | null
    smokeDensityTestResultNo?: NullableStringFieldUpdateOperationsInput | string | null
    placeOfApprehension?: StringFieldUpdateOperationsInput | string
    dateOfApprehension?: DateTimeFieldUpdateOperationsInput | Date | string
    paidDriver?: NullableBoolFieldUpdateOperationsInput | boolean | null
    paidOperator?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    record?: RecordUpdateOneRequiredWithoutViolationsNestedInput
  }

  export type ViolationUncheckedUpdateWithoutDriverInput = {
    id?: IntFieldUpdateOperationsInput | number
    recordId?: IntFieldUpdateOperationsInput | number
    ordinanceInfractionReportNo?: NullableStringFieldUpdateOperationsInput | string | null
    smokeDensityTestResultNo?: NullableStringFieldUpdateOperationsInput | string | null
    placeOfApprehension?: StringFieldUpdateOperationsInput | string
    dateOfApprehension?: DateTimeFieldUpdateOperationsInput | Date | string
    paidDriver?: NullableBoolFieldUpdateOperationsInput | boolean | null
    paidOperator?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ViolationUncheckedUpdateManyWithoutDriverInput = {
    id?: IntFieldUpdateOperationsInput | number
    recordId?: IntFieldUpdateOperationsInput | number
    ordinanceInfractionReportNo?: NullableStringFieldUpdateOperationsInput | string | null
    smokeDensityTestResultNo?: NullableStringFieldUpdateOperationsInput | string | null
    placeOfApprehension?: StringFieldUpdateOperationsInput | string
    dateOfApprehension?: DateTimeFieldUpdateOperationsInput | Date | string
    paidDriver?: NullableBoolFieldUpdateOperationsInput | boolean | null
    paidOperator?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RecordHistoryCreateManyRecordInput = {
    id?: number
    type: string
    date: Date | string
    details?: string | null
    orNumber?: string | null
    status: string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type ViolationCreateManyRecordInput = {
    id?: number
    ordinanceInfractionReportNo?: string | null
    smokeDensityTestResultNo?: string | null
    placeOfApprehension: string
    dateOfApprehension: Date | string
    paidDriver?: boolean | null
    paidOperator?: boolean | null
    driverId?: string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type RecordHistoryUpdateWithoutRecordInput = {
    type?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    orNumber?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RecordHistoryUncheckedUpdateWithoutRecordInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    orNumber?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RecordHistoryUncheckedUpdateManyWithoutRecordInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    orNumber?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ViolationUpdateWithoutRecordInput = {
    ordinanceInfractionReportNo?: NullableStringFieldUpdateOperationsInput | string | null
    smokeDensityTestResultNo?: NullableStringFieldUpdateOperationsInput | string | null
    placeOfApprehension?: StringFieldUpdateOperationsInput | string
    dateOfApprehension?: DateTimeFieldUpdateOperationsInput | Date | string
    paidDriver?: NullableBoolFieldUpdateOperationsInput | boolean | null
    paidOperator?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    driver?: DriverUpdateOneWithoutViolationsNestedInput
  }

  export type ViolationUncheckedUpdateWithoutRecordInput = {
    id?: IntFieldUpdateOperationsInput | number
    ordinanceInfractionReportNo?: NullableStringFieldUpdateOperationsInput | string | null
    smokeDensityTestResultNo?: NullableStringFieldUpdateOperationsInput | string | null
    placeOfApprehension?: StringFieldUpdateOperationsInput | string
    dateOfApprehension?: DateTimeFieldUpdateOperationsInput | Date | string
    paidDriver?: NullableBoolFieldUpdateOperationsInput | boolean | null
    paidOperator?: NullableBoolFieldUpdateOperationsInput | boolean | null
    driverId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ViolationUncheckedUpdateManyWithoutRecordInput = {
    id?: IntFieldUpdateOperationsInput | number
    ordinanceInfractionReportNo?: NullableStringFieldUpdateOperationsInput | string | null
    smokeDensityTestResultNo?: NullableStringFieldUpdateOperationsInput | string | null
    placeOfApprehension?: StringFieldUpdateOperationsInput | string
    dateOfApprehension?: DateTimeFieldUpdateOperationsInput | Date | string
    paidDriver?: NullableBoolFieldUpdateOperationsInput | boolean | null
    paidOperator?: NullableBoolFieldUpdateOperationsInput | boolean | null
    driverId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TestCreateManyVehicleInput = {
    id?: string
    testDate: Date | string
    quarter: number
    year: number
    result: boolean
    createdBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VehicleDriverHistoryCreateManyVehicleInput = {
    id?: string
    driverName: string
    changedAt?: Date | string
    changedBy?: string | null
  }

  export type TestUpdateWithoutVehicleInput = {
    id?: StringFieldUpdateOperationsInput | string
    testDate?: DateTimeFieldUpdateOperationsInput | Date | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    result?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutTestsNestedInput
  }

  export type TestUncheckedUpdateWithoutVehicleInput = {
    id?: StringFieldUpdateOperationsInput | string
    testDate?: DateTimeFieldUpdateOperationsInput | Date | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    result?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TestUncheckedUpdateManyWithoutVehicleInput = {
    id?: StringFieldUpdateOperationsInput | string
    testDate?: DateTimeFieldUpdateOperationsInput | Date | string
    quarter?: IntFieldUpdateOperationsInput | number
    year?: IntFieldUpdateOperationsInput | number
    result?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VehicleDriverHistoryUpdateWithoutVehicleInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutDriverHistoriesNestedInput
  }

  export type VehicleDriverHistoryUncheckedUpdateWithoutVehicleInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    changedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type VehicleDriverHistoryUncheckedUpdateManyWithoutVehicleInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    changedBy?: NullableStringFieldUpdateOperationsInput | string | null
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