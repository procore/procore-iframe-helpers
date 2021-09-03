import Authentication from "../authentication";
import { Config } from "../index";

/**
 * Authentication Context. Created when this utility is loaded within an
 * authentication popup.
 */
export default class AuthContext {
  public authentication: Authentication;
  public config: Config;
  public parentWindow: Window;
  public window: Window;

  constructor(config: Config) {
    this.window = window;
    this.config = config;
    this.parentWindow = window.opener;

    this.authentication = new Authentication(this);
  }
}
