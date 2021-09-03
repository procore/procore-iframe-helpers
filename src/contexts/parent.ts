import Authentication from "../authentication";
import { Config } from "../index";

/**
 * Parent Context. Instantiated when initialize is called from the iframed
 * application.
 */
export default class ParentContext {
  public window: Window;
  public parentWindow: Window;
  public authentication: Authentication;
  public config: Config;

  constructor(config: Config) {
    this.window = window;
    this.config = config;
    this.parentWindow = window.parent;
    this.authentication = new Authentication(this);

    this.window.addEventListener("message", this.processMessage, false);
  }

  /**
   * Handler for the postMessage browser API. Will reject any messages not sent
   * from the same origin as the iframe, or those that do not come in as an
   * object.
   *
   * @param event The browser MessageEvent
   */
  private processMessage = (event: MessageEvent) => {
    const origin = event.origin;
    const source = event.source;

    // Reject any messages that come from the same window
    if (source === this.window) {
      return;
    }

    // Reject messages that come from an unexpected domain
    let expectedDomains = this.config.validDomains || [];
    expectedDomains.push(this.window.location.origin);

    if (!expectedDomains.includes(origin)) {
      return;
    }

    // Reject, not the correct shape, potentially coming from something malicious
    if (typeof event.data !== "object") {
      return;
    }

    switch (event.data.type) {
      case "authentication.success":
        this.authentication.handleSuccessMessage(event.data.payload);
        break;
      case "authentication.failure":
        this.authentication.handleFailureMessage(event.data.payload);
        break;
    }
  };
}
