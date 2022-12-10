(function ($) {
  const form = document.getElementById("register-details");
  const firstName = document.getElementById("firstname");
  const lastName = document.getElementById("lastname");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const error = document.getElementsByClassName("error");
  const $form = $('#register-details');
  
  let validateEmail = (email) => {
    debugger;
    const emailRegex = new RegExp('^[^\s@]+@[^\s@]+\.[^\s@]+$');
    if(!emailRegex.test(email)) 
      return false;
    return true
  };

  let validatePassword = (password) => {
    const passwordRegex = new RegExp('^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$')
    if (!passwordRegex.test(password)) 
      return false;
    return true
  };

  form.addEventListener("submit", function addStudent(event) {
    event.preventDefault();
    $(".error").hide();
    var valid = false;
    var firstNameVal = firstName.value.replace(/\s/g, "");
    var lastNameVal = lastName.value.replace(/\s/g, "");
    var emailVal = email.value.replace(/\s/g, "");
    var passwordVal = password.value.replace(/\s/g, "");

    if (firstNameVal.length == 0) {
      document.getElementById("firstnameError").innerHTML = "Please enter firstname"
      $("#firstnameError").show().fadeOut(3000);
      firstName.focus();
      valid = true
    }
  
    if (lastNameVal.length == 0) {
      document.getElementById("lastnameError").innerHTML = "Please enter lastname"
      $("#lastnameError").show().fadeOut(3000);
      valid = true
    }

    if (emailVal.length == 0) {
      document.getElementById("emailError").innerHTML = "Please enter email"
      $("#emailError").show().fadeOut(3000);
      valid = true;
    }else if (!validateEmail(emailVal)) {
      document.getElementById("emailError").innerHTML = "Please enter valid email"
      $("#emailError").show().fadeOut(3000);
      valid = true;
    }

    if (passwordVal.length == 0) {
      document.getElementById("passwordError").innerHTML = "Please enter password"
      $("#passwordError").show().fadeOut(3000);
      valid = true;
    } else if (passwordVal.length < 8) {
      document.getElementById("passwordError").innerHTML = "Password should be atleast 8 characters long"
      $("#passwordError").show().fadeOut(3000);
      valid = true;
    } else if (!validatePassword(passwordVal)) {
      document.getElementById("passwordError").innerHTML = "Password should contain one uppercase, one lower case, one special character and one number"
      $("#passwordError").show().fadeOut(3000);
      valid = true;
    }

    if (valid) {
      return;
    } 

    $.ajax({
      type: $form.attr('method'),
      url: $form.attr('action'),
      contentType: "application/json",
      data: JSON.stringify({
        firstname: firstNameVal,
        lastname: lastNameVal,
        email: emailVal,
        password: passwordVal
      }),
      dataType: "text",
      success: function (res) {
        window.location.replace("/students/login");
      },
      error: function (err) {
        error.innerHTML =  err.responseText
        error.show();
      },
    });
   
  });
})(window.jQuery);
