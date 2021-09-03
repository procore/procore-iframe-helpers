import AuthContext from "./contexts/auth";
import ParentContext from "./contexts/parent";

/**
 * Configuration options for the library.
 */
export interface Config {
  /* List of domains the app expects to load */
  validDomains?: string[];
}

/**
 * Entry point to the module. Will return the appropriate context for the
 * environment.
 */
export function initialize(config: Config = {}): AuthContext | ParentContext {
  if (window.opener !== null) {
    return new AuthContext(config);
  } else {
    return new ParentContext(config);
  }
}
