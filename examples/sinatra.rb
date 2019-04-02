require 'rubygems'
require 'bundler/inline'

gemfile do
  source 'https://rubygems.org'
  gem 'sinatra'
  gem 'omniauth'
  gem 'omniauth-procore'
end

require 'sinatra'
require 'omniauth'

class App < Sinatra::Base
  configure do
    enable :sessions
    enable :inline_templates

    use OmniAuth::Builder do
      provider(:procore, ENV['PROCORE_CLIENT_ID'], ENV['PROCORE_CLIENT_SECRET'])
    end
  end

  # Protected content. If user is not signed in, redirect them to the sign in
  # page. Otherwise, display some content for the currently signed in user.
  get '/' do
    if session[:procore_id].nil?
      redirect '/signin'
    else
      "Protected Content: Your Procore ID is #{session[:procore_id]}"
    end
  end

  # Sign in page. Renders a sign in button, which when clicked will launch a
  # new window where the user can sign in.
  get '/signin' do
    erb :signin
  end

  # Callback from Oauth. Renders the auth end template, which only renders a
  # single script tag that calls the notifySuccess method. This method will
  # message the main window letting it know that authentication succeeded.
  get '/auth/procore/callback' do
    auth = request.env['omniauth.auth']
    session[:procore_id] = auth.info.procore_id

    erb :auth_end
  end

  # Callback from Oauth. Reached when an error occurs during the Oauth flow.
  # Renders a script tag which calls that notifyFailure method. This method
  # will message the main window letting it know that authentication has
  # failed.
  get '/auth/failure' do
    erb :auth_failure
  end

  run!
end

__END__

@@layout
<html>
  <head>
    <script src="/ProcoreIframeHelpers.js"></script>
  </head>

  <body>
    <%= yield %>
  </body>
</html>


@@signin
<div id="errors"></div>
<button onclick="signin()">Sign in with Procore</button>

<script>
  var context = procoreIframeHelpers.initialize()

  function signin() {
    context.authentication.authenticate({
      url: "/auth/procore",
      onSuccess: function(payload) {
        window.location = "/content";
      },
      onFailure: function(error) {
        var textnode = document.createElement("p");
        textnode.appendChild(document.createTextNode(error.reason))
        textnode.style.color = "red"
        document.getElementById("errors").appendChild(textnode)
      }
    })
  }
</script>


@@auth_end
<script>
  const context = procoreIframeHelpers.initialize();
  context.authentication.notifySuccess({})
</script>


@@auth_failure
<script>
  const context = procoreIframeHelpers.initialize();
  context.authentication.notifyFailure({
    type: "oauth_failure",
    reason: "<%= params[:message] %>"
  })
</script>
