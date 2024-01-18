// LIU Minghao, ZHANG Wengyu
/* eslint-disable no-undef */
$(document).ready(function() {

    // Handle remember me
    var isRememberMe = localStorage.getItem("rememberID");
    if (isRememberMe == 'true') {
        $('#rememberID').attr('checked', true);
        $('#username').val(localStorage.getItem("userID"));
    } else {
        $('#rememberID').attr('checked', false);
        $('#username').val("");
    }
    
    $('#loginButton').on('click', function(event) {
        event.preventDefault();

        const username = $('#username').val().trim();
        const password = $('#password').val().trim();

        if (!username || !password) {
            alert("Username and password cannot be empty");
            return;
        }

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        console.log(formData);

        fetch('/auth/login', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {

                // Handle remember me
                var rememberIDCheckbox = $('#rememberID').prop('checked');
                if (rememberIDCheckbox) {
                    localStorage.setItem("rememberID", "true");
                    localStorage.setItem("userID", username);
                } else {
                    localStorage.removeItem("rememberID");
                    localStorage.removeItem("userID");
                }


                alert(`Logged as \`${data.user.username}\` (${data.user.role})`);
                if (data.user.role === "admin") {
                    window.location.href = "/admin-account.html";
                } else if (data.user.role === "user") {
                    window.location.href = "/usersaccount.html";
                } else {
                  alert("Unknown error");
                  window.location.href = "/index.html";
                }
            } else if (data.status === "failed") {
                alert(data.reason || data.message);
            } else {
                alert("Unknown error");
            }
        })
        .catch(error => console.error('Error:', error));
    });
});