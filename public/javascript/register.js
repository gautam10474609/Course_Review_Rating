$(() => {
  const $form = document.getElementById('register-form');
  const firstName = document.getElementById('firstname');
  const lastName = document.getElementById('lastname');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const firstnameError = document.getElementById('firstnameError');
  const lastnameError = document.getElementById('lastnameError');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  

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

  $form.addEventListener("submit", function (e) {
    e.preventDefault();
    $(".error-msg").hide();
    var valid = false;
    var firstNameVal = firstName.value.replace(/\s/g, "");
    var lastNameVal = lastName.value.replace(/\s/g, "");
    var emailVal = email.value.replace(/\s/g, "");
    var passwordVal = password.value.replace(/\s/g, "");

    if (firstNameVal.length == 0) {
      firstnameError.style.display = "block";
      firstnameError.innerHTML = "Please enter firstname"
      firstnameError.show().fadeOut(5000);
      firstName.focus();
      valid = true
    }

    if (lastNameVal.length == 0) {
      lastnameError.style.display = "block";
      lastnameError.innerHTML = "Please enter lastname"
      lastnameError.show().fadeOut(5000);
      valid = true
    }

    if (emailVal.length == 0) {
      emailError.style.display = "block";
      emailError.innerHTML = "Please enter email"
      emailError.show().fadeOut(5000);
      valid = true;
    } else if (!validateEmail(emailVal)) {
      emailError.style.display = "block";
      emailError.innerHTML = "Please enter valid email"
      emailError.show().fadeOut(5000);
      valid = true;
    }

    if (passwordVal.length == 0) {
      passwordError.style.display = "block";
      passwordError.innerHTML = "Please enter password"
      passwordError.show().fadeOut(5000);
      valid = true;
    } else if (passwordVal.length < 8) {
      passwordError.style.display = "block";
      passwordError.innerHTML = "Password should be atleast 8 characters long"
      passwordError.show().fadeOut(5000);
      valid = true;
    } else if (!validatePassword(passwordVal)) {
      passwordError.style.display = "block";
      passwordError.innerHTML = "Password should contain one uppercase, one lower case, one special character and one number"
      passwordError.show().fadeOut(5000);
      valid = true;
    }

    if (valid) {
      return;
    }else{
      firstnameError.style.display = "none";
      lastnameError.style.display = "none";
      emailError.style.display = "none";
      passwordError.style.display = "none";
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

