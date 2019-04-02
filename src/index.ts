import AuthContext from "./contexts/auth";
import ParentContext from "./contexts/parent";

/**
 * Entry point to the module. Will return the appropriate context for the
 * environment.
 */
export function initialize(): AuthContext | ParentContext {
  if (window.opener !== null) {
    return new AuthContext;
  } else {
    return new ParentContext;
  }
}
