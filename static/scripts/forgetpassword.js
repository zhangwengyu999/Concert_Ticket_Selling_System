// LIU Minghao, ZHANG Wengyu
/* eslint-disable no-undef */
$(document).ready(function(){
    var userEmail = '';
    var username = '';

    var passwordValid = false;

    $("#submitButton").click(function(event){
        event.preventDefault();
        userEmail = $("#email").val();

        // Fetch all users and check if email exists
        fetch('/user/all')
        .then(response => response.json())
        .then(data => {
            const user = data.find(user => user.email === userEmail);
            if (user) {
                username = user.username;
                alert("[For demo only]\nA email has been sent to your email address.\nPlease reset your password below.");
                $("#passwordResetFields").removeClass("d-none");
            } else {
                alert("Email does not exist.");
            }
        });
    });

    $("#password").on("input", function() {
        if ($(this).val().length >= 8) {
            $("#length").addClass("d-none")
            passwordValid = true;
        } else {
            $("#length").removeClass("d-none")
            passwordValid = false;
        }
        if ($(this).val().match(/[A-Z]/)) {
            $("#upper").addClass("d-none")
            passwordValid = true;
        } else {
            $("#upper").removeClass("d-none")
            passwordValid = false;
        }
        if ($(this).val().match(/[a-z]/)) {
            $("#lower").addClass("d-none")
            passwordValid = true;
        } else {
            $("#lower").removeClass("d-none")
            passwordValid = false;
        }
        if ($(this).val().match(/[0-9]/) || $(this).val().match(/[!@#$%^&*]/)) {
            $("#numsym").addClass("d-none")
            passwordValid = true;
        } else {
            $("#numsym").removeClass("d-none")
            passwordValid = false;
        } 
        if ($(this).val().length >= 8 && $(this).val().match(/[A-Z]/) && $(this).val().match(/[a-z]/) && ($(this).val().match(/[0-9]/) || $(this).val().match(/[!@#$%^&*]/))) {
            $("#passwordMessage").addClass("d-none")
            passwordValid = true;
        } else {
            $("#passwordMessage").removeClass("d-none")
            passwordValid = false;
        }
    });
    $("#repeatPassword").on("input", function() {
        if ($(this).val() != $("#password").val()) {
            $("#passwordCheck").html(`
            <div class="alert alert-danger alert-dismissible py-1" role="alert">
                <strong>Passwords do not match!</strong>
            </div>
            `)
            passwordValid = false;
        } else {
            $("#passwordCheck").html("")
            passwordValid = true;
            $("#resetPasswordButton").prop('disabled', false);
        }
        
    });

    $("#resetPasswordButton").click(function(){
        var newPassword = $("#password").val();
        var confirmNewPassword = $("#repeatPassword").val();

        if (newPassword !== confirmNewPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (!passwordValid) {
            alert("Password is not valid.");
            return;
        }

        fetch('/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: newPassword })
        })
        .then(response => {
            if (response.ok) {
                alert("Password reset successfully.");
                window.location.href = "/login.html";
            } else {
                alert("Failed to reset password.");
            }
        });
    });
});
