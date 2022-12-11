$(() => {
    const $form = $('#register');
    var $form = $('#register-form'),
      firstName = $('#firstname'),
      lastName = $('#lastname'),
      email = $('#email'),
      password = $('#password')
  
    let validateEmail = (email) => {
      const emailRegex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
      if (!emailRegex.test(email))
        return false;
      return true
    };
  
    let validatePassword = (password) => {
      const passwordRegex = new RegExp('^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$')
      if (!passwordRegex.test(password))
        return false;
      return true
    };
  
    $form.addEventListener("submit", function register(e) {
      e.preventDefault();
      $(".error-msg").hide();
      var valid = false;
      var firstNameVal = firstName.val().replace(/\s/g, "");
      var lastNameVal = lastName.val().replace(/\s/g, "");
      var emailVal = email.val().replace(/\s/g, "");
      var passwordVal = password.val().replace(/\s/g, "");
  
      if (firstNameVal.length == 0) {
        $("#firstnameError").innerHTML = "Please enter firstname"
        $("#firstnameError").show().fadeOut(5000);
        firstName.focus();
        valid = true
      }
  
      if (lastNameVal.length == 0) {
        $("#lastnameError").innerHTML = "Please enter lastname"
        $("#lastnameError").show().fadeOut(5000);
        valid = true
      }
  
      if (emailVal.length == 0) {
        $("#emailError").innerHTML = "Please enter email"
        $("#emailError").show().fadeOut(5000);
        valid = true;
      } else if (!validateEmail(emailVal)) {
        $("#emailError").innerHTML = "Please enter valid email"
        $("#emailError").show().fadeOut(5000);
        valid = true;
      }
  
      if (passwordVal.length == 0) {
        $("#passwordError").innerHTML = "Please enter password"
        $("#passwordError").show().fadeOut(5000);
        valid = true;
      } else if (passwordVal.length < 8) {
        $("#passwordError").innerHTML = "Password should be atleast 8 characters long"
        $("#passwordError").show().fadeOut(5000);
        valid = true;
      } else if (!validatePassword(passwordVal)) {
        $("#passwordError").innerHTML = "Password should contain one uppercase, one lower case, one special character and one number"
        $("#passwordError").show().fadeOut(5000);
        valid = true;
      }
  
      if (valid) {
        return;
      }
      var registerdetails = $('#register-details');
  
      if (firstNameVal && lastNameVal && emailVal && passwordVal) {
        var jsnoVal = false;
        if (jsnoVal) {
          $.ajax({
            method: $form.attr('method'),
            url: $form.attr('action'),
            contentType: 'application/json',
            data: JSON.stringify({
              firstname: firstNameVal,
              lastname: lastNameVal,
              email: emailVal,
              password: passwordVal
            }),
            success: function (responseMessage) {
              window.location.replace("/");
            },
            error: function (e) {
              error.innerHTML = JSON.parse(
                e.responseText
              ).message.preventXSS();
              error.show();
            },
          }).then(function (responseMessage) {
            registerdetails.html(responseMessage.message);
          });
        }
      }
    });
  })
  
  