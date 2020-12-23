/*
 * Extra typings definitions
 */

// Allow .json files imports
declare module '*.json';

// Allow .js files imports
declare module '*.js';

// SystemJS module definition
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
