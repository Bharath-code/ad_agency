/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as competitors from "../competitors.js";
import type * as cache from "../cache.js";
import type * as crons from "../crons.js";
import type * as emails from "../emails.js";
import type * as intentQueries from "../intentQueries.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_llm_openai from "../lib/llm/openai.js";
import type * as lib_llm_router from "../lib/llm/router.js";
import type * as lib_llm_types from "../lib/llm/types.js";
import type * as lib_prompts from "../lib/prompts.js";
import type * as payments from "../payments.js";
import type * as projects from "../projects.js";
import type * as results from "../results.js";
import type * as scans from "../scans.js";
import type * as users from "../users.js";
import type * as weeklyReports from "../weeklyReports.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  cache: typeof cache;
  competitors: typeof competitors;
  crons: typeof crons;
  emails: typeof emails;
  intentQueries: typeof intentQueries;
  "lib/constants": typeof lib_constants;
  "lib/llm/openai": typeof lib_llm_openai;
  "lib/llm/router": typeof lib_llm_router;
  "lib/llm/types": typeof lib_llm_types;
  "lib/prompts": typeof lib_prompts;
  payments: typeof payments;
  projects: typeof projects;
  results: typeof results;
  scans: typeof scans;
  users: typeof users;
  weeklyReports: typeof weeklyReports;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
