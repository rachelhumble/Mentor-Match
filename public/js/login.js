$(document).ready(function() {
  // Getting references to our form and inputs
  var loginForm = $("form.login");
  var usernameInput = $("input#username-input");
  var passwordInput = $("input#password-input");

  // When the form is submitted, we validate there's an username and password entered
  loginForm.on("submit", function(event) {
    event.preventDefault();
    var userData = {
      username: usernameInput.val().trim(),
      password: passwordInput.val().trim()
    };

    if (!userData.username || !userData.password) {
      $("#alert .msg").text("Please enter valid username and password");
      $("#alert").fadeIn(500);
      return;
    }

    // If we have an username and password we run the loginUser function and clear the form
    loginUser(userData.username, userData.password);
    usernameInput.val("");
    passwordInput.val("");
  });

  // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
  function loginUser(username, password) {
    $.post("/api/login", {
      username: username,
      password: password
    })
      .then(function() {
        window.location.replace("/");
        // If there's an error, log the error
      })
      .catch(function(err) {
        console.log(err);
        console.log(err);
        $("#alert .msg").text(
          "  Username does not exists! Please /Signup/ and then login"
        );
        $("#alert").fadeIn(500);
        return;
      });
  }
});
