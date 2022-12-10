$(() => {
    const $form = $('#register-details');
    var $form = $('#register-details'),
      studentIdInput = $('#studentid'),
      firstnameInput = $('#firstname'),
      lastnameInput = $('#lastname'),
      emailInput = $('#email'),
      passwordInput = $('#password')
  
    $form.on('submit', validateRegister);
  
    function validateRegister (e) {
      e.preventDefault();

      var studentIdVal = studentIdInput.val();
      var firstNameVal = firstnameInput.val();
      var lastNameVal = lastnameInput.val();
      var emailVal = emailInput.val();
      var passwordVal = passwordInput.val();
     
      var registerDetails = $('#register-details');
  
      if (studentIdVal && firstNameVal && lastNameVal && emailVal && passwordVal) {
        var JsonVal = false;
        if (JsonVal) {
          var requestConfig = {
            method: $form.attr('method'),
            url: $form.attr('action'),
            contentType: 'application/json',
            data: JSON.stringify({
              studentId: studentIdVal,
              firstName : firstNameVal,
              lastName : lastNameVal,
              email : emailVal,
              password : passwordVal,
              
            })
          };
  
          $.ajax(requestConfig).then(function (responseMessage) {
            console.log(responseMessage);
            registerDetails.html(responseMessage.message);
          });
        }
      }
    }
    
  })