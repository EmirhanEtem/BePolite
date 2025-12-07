declare module 'vitest' {
  export interface Assertion<T = any> {
    toBeGreaterThan(value: number | bigint): Assertion<T>;
    toBeLessThan(value: number | bigint): Assertion<T>;
    toBeGreaterThanOrEqual(value: number | bigint): Assertion<T>;
    toBeLessThanOrEqual(value: number | bigint): Assertion<T>;
    toBe(value: any): Assertion<T>;
    toEqual(value: any): Assertion<T>;
    toHaveProperty(key: string, value?: any): Assertion<T>;
    toStrictEqual(value: any): Assertion<T>;
    toThrow(error?: any): Assertion<T>;
  }

  export function describe(name: string, fn: () => void | Promise<void>): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  
  export function expect<T = any>(value: T): Assertion<T>;
  
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  
  export function vi(): any;
}
