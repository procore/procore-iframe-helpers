# Procore Iframe Helpers

## Usage

Create a new context object by calling:

```javascript
const context = ProcoreIframeHelpers.initialize();
```

This context can be used to gather information about the current environment
your iframe application is in, or to perform certain actions within the iframe.


## Authentication

For security reasons, Procore's login page will not render within an iframe. To
resolve this issue, this library will launch a new window where the user can
safely sign into Procore, and return an access token to your application.

To begin, create a signin button and initialize the `procoreIframeHelpers`
library:

```html
<button onclick="login">Sign in With Procore</button>

<script>
  const context = ProcoreIframeHelpers.initialize();

  function login() {
    // Will be filled in
  }
</script>
```

When the user clicks the button, the `login` function will be run. It should
look like this:

```javascript
function login() {
  context.authentication.authenticate({
    // Some URL on your domain that will start the authentication process. In
    // this case, /auth/procore will just forward the user onto the
    // /oauth/authorize endpoint with the appropriate client id and redirect URL
    url: "/auth/procore",

    // A function to run if authentication is successful. Payload, you will see
    // below, is sent by you at the last stage of the authentication flow.
    // In this case, we don't need to use payload, and instead just forward the
    // user onto some protected content
    onSuccess: function(payload) {
      window.location = "/protected/content"
    },

    // A function to run if authentication fails. We are just logging the error
    // to the console, but you will want to display an error to the user. This
    // function can be triggered by you, or will be triggered automatically if the
    // user closes the authenication window
    onFailure: function(error) {
      console.log(error);
    }
  })
}
```

At the end of the authentication flow, there is still one piece to be done. You
must notify the iframe that authentication succeeded in the login window. To do
that, render an html page with just this script tag:

```javascript
<script>
  const context = ProcoreIframeHelpers.initialize();

  // Not required to send a payload, but you can if you'd like. This is the
  // payload passed to your onSuccess handler.
  context.authentication.notifySuccess({})
</script>
```

`notifySuccess` will send a message from the login window to your iframe
application, triggering the `onSuccess` callback. This will also automatically
close the login window for you.
