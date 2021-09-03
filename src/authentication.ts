import AuthContext from "./contexts/auth";
import ParentContext from "./contexts/parent";

/**
 * Configuration to pass into authenticate.
 */
interface AuthenticationConfig {
  /* URL to open in auth window */
  url: string;

  /* Height of the auth window, defaults to 600 */
  height?: number;

  /* Width of the auth window, defaults to 560 */
  width?: number;

  /* Callback to run if authentication fails */
  onFailure: (error: any) => void;

  /* Callback to run if authentication succeeds */
  onSuccess: (payload: any) => void;
}

/**
 * Responsible for creating and managing auth popups. When used in
 * ParentContext, will launch a new window for auth. When used in an
 * AuthContext, can be used to send success / failure messages back to the
 * parent window.
 */
export default class Authentication {
  authWindow: Window | undefined | null;
  onAuthSuccess?: (payload: any) => void;
  onAuthFailure?: (error: any) => void;
  monitor?: number;
  context: ParentContext | AuthContext;

  constructor(context: ParentContext | AuthContext) {
    this.context = context;
  }

  /**
   * Used to launch an authentication window. After the user either finishes
   * the authentication flow successfully, or bails out early, one of the
   * handlers will be called.
   *
   * @param config Configuration for the authenticate call. Specifies URL and
   * success / failure handlers
   */
  public authenticate = (config: AuthenticationConfig) => {
    if (this.context instanceof AuthContext) {
      console.error("Cannot authenticate in this context");
      return;
    }

    // Set defaults for optional properties
    const width = config.width || 560;
    const height = config.height || 600;

    // Convert any relative URLs into absolute ones
    const url = new URL(config.url, this.context.window.location.href);

    // Open a new window to the authentication URL. Make sure to center the
    // window over the users screen
    this.authWindow = this.context.window.open(
      String(url),
      "_blank",
      `
        toolbar=no,
        location=yes,
        status=no,
        menubar=no,
        scrollbars=yes,
        width=${width},
        height=${height},
        top=${this.context.window.outerHeight / 2 - height / 2},
        left=${this.context.window.outerWidth / 2 - width / 2},
      `
    );

    this.onAuthSuccess = config.onSuccess;
    this.onAuthFailure = config.onFailure;

    // Create a interval to check if the child window has been closed
    this.monitor = this.context.window.setInterval(() => {
      if (!this.authWindow || this.authWindow.closed) {
        this.clearMonitor();
        this.onAuthFailure!({
          type: "canceled_by_user",
          reason: "Cancelled by User"
        });
      }
    }, 100);
  };

  /**
   * For use when in the [[AuthContext]]. Will notify the parent window that
   * authentication was completed successfully.
   *
   * @param payload Can be anything the user specifies. Will be passed onto
   * onSuccess in [[AuthContext]]
   */
  public notifySuccess = (payload: any) => {
    this.context.parentWindow.postMessage(
      { type: "authentication.success", payload: payload },
      this.context.window.location.origin
    );
  };

  /**
   * For use when in the [[AuthContext]]. Will notify the parent window that
   * authentication has failed.
   *
   * @param payload Can be anything the user specifies. Will be passed onto
   * onFailure in [[AuthContext]]
   */
  public notifyFailure = (payload: any) => {
    this.context.parentWindow.postMessage(
      { type: "authentication.failure", payload: payload },
      this.context.window.location.origin
    );
  };

  /**
   * Internal method which forwards a message onto the configured success
   * handler, and does cleanup on the auth window
   *
   * @ignore
   */
  public handleSuccessMessage = (payload: any) => {
    this.clearMonitor();
    this.authWindow && this.authWindow.close();
    this.onAuthSuccess && this.onAuthSuccess(payload);
  };

  /**
   * Internal method which forwards a message onto the configured failure
   * handler, and does cleanup on the auth window
   *
   * @ignore
   */
  public handleFailureMessage = (error: any) => {
    this.clearMonitor();
    this.authWindow && this.authWindow.close();
    this.onAuthFailure && this.onAuthFailure(error);
  };

  /**
   * Clears the monitor interval, which polls every 100ms to check if the auth
   * window was closed by the user
   */
  private clearMonitor = () => {
    clearInterval(this.monitor);
    this.monitor = undefined;
  };
}
