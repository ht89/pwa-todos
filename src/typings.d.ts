/*
 * Extra typings definitions
 */

// Allow .json files imports
declare module '*.json';

// Allow .js files imports
declare module '*.js';

// SystemJS module definition
declare let module: NodeModule;
interface NodeModule {
  id: string;
}
