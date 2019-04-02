import Authentication from "../authentication";

/**
 * Authentication Context. Created when this utility is loaded within an
 * authentication popup.
 */
export default class AuthContext {
  public authentication: Authentication;
  public parentWindow: Window;
  public window: Window;

  constructor() {
    this.window = window;
    this.parentWindow = window.opener;

    this.authentication = new Authentication(this);
  }
}
