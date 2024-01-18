// LIU Minghao, ZHANG Wengyu
/* eslint-disable no-undef */
$(document).ready(function() {
    $('#signupButton').on('click', function(event) {
        event.preventDefault();
        const username = $('#username').val().trim();
        const password = $('#password').val().trim();
        const confirmPassword = $('#repeatPassword').val().trim();
        const gender = $('#genderSelect').val().trim();
        const email = $('#emailInput').val().trim();
        const nickname = $('#nickname').val().trim();
        const dobMonth = $('#dobMonth').val().trim();
        const dobYear = $('#dobYear').val().trim();
        var flag = true;
        if (!username) {
            $("#IDMessage").removeClass("d-none")
            flag = false;
        }
        if (!password) {
            $("#passwordMessage").removeClass("d-none")
            flag = false;
        }
        if (!confirmPassword) {
            $("#passwordCheck").html(`
            <div class="alert alert-danger alert-dismissible py-1" role="alert">
            <strong>Passwords do not match!</strong>
            </div>
            `)
            flag = false;
        }
        if (!email) {
            $("#emailMessage").removeClass("d-none")
            flag = false;
        }
        if (!nickname) {
            $("#nicknameMessage").removeClass("d-none")
            flag = false;
        }
        if (!gender) {
            $("#genderMessage").removeClass("d-none")
            flag = false;
        }
        if (!dobMonth || !dobYear) {
            $("#dobMessage").removeClass("d-none")
            flag = false;
        }

        if (password !== confirmPassword) {
            $("#passwordCheck").html(`
            <div class="alert alert-danger alert-dismissible py-1" role="alert">
            <strong>Passwords do not match!</strong>
            </div>
            `)
            flag = false;
        }
        
        if (!flag) {
            return;
        }
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('nickname', nickname);
        formData.append('email', email);
        formData.append('gender', gender);
        formData.append('birthDate', dobMonth + "-" + dobYear);

        var image = $('#image')[0].files[0];
        if (image==null) {
            image = "https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg";
        }
        formData.append('image', image);
        
        fetch('/auth/register', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert(`Welcome ${data.user.username}! \n You can login with your account now!`);
                window.location.href = "/login.html";
            } else if (data.status === "failed") {
                alert(data.reason || data.message);
            } else {
                alert("Unknown error");
            }
        })

    });

    $("#username").on("input", function() {
        if ($(this).val().length < 3) {
            $("#IDMessage").removeClass("d-none")
        } else {
            $("#IDMessage").addClass("d-none")
        }
    });


    $("#password").on("input", function() {
        if ($(this).val().length >= 8) {
            $("#length").addClass("d-none")
        } else {
            $("#length").removeClass("d-none")
        }
        if ($(this).val().match(/[A-Z]/)) {
            $("#upper").addClass("d-none")
        } else {
            $("#upper").removeClass("d-none")
        }
        if ($(this).val().match(/[a-z]/)) {
            $("#lower").addClass("d-none")
        } else {
            $("#lower").removeClass("d-none")
        }
        if ($(this).val().match(/[0-9]/) || $(this).val().match(/[!@#$%^&*]/)) {
            $("#numsym").addClass("d-none")
        } else {
            $("#numsym").removeClass("d-none")
        } 
        if ($(this).val().length >= 8 && $(this).val().match(/[A-Z]/) && $(this).val().match(/[a-z]/) && ($(this).val().match(/[0-9]/) || $(this).val().match(/[!@#$%^&*]/))) {
            $("#passwordMessage").addClass("d-none")
        } else {
            $("#passwordMessage").removeClass("d-none")
        }
    });
    $("#repeatPassword").on("input", function() {
        if ($(this).val() != $("#password").val()) {
            $("#passwordCheck").html(`
            <div class="alert alert-danger alert-dismissible py-1" role="alert">
            <strong>Passwords do not match!</strong>
            </div>
            `)
        } else {
            $("#passwordCheck").html("")
        }
    });
    $("#emailInput").on("input", function() {
        if ($(this).val() == "") {
            $("#emailMessage").removeClass("d-none")
        } else {
            $("#emailMessage").addClass("d-none")
        }
    });
    $("#nickname").on("input", function() {
        if ($(this).val() == "") {
            $("#nicknameMessage").removeClass("d-none")
        } else {
            $("#nicknameMessage").addClass("d-none")
        }
    });
    $("#genderSelect").on("change", function() {
        if ($(this).val() == "") {
            $("#genderMessage").removeClass("d-none")
        } else {
            $("#genderMessage").addClass("d-none")
        }
    });
    $("#dobMonth").on("change", function() {
        if ($(this).val() == "") {
            $("#dobMessage").removeClass("d-none")
        } else {
            $("#dobMessage").addClass("d-none")
        }
    });
    $("#dobYear").on("change", function() {
        if ($(this).val() == "") {
            $("#dobMessage").removeClass("d-none")
        } else {
            $("#dobMessage").addClass("d-none")
        }
    });
    
    $("#image").change(function(){
        readURL(this);
        });
});

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#profileImage').attr('src', e.target.result);
            $('#profileImage').show();
        }

        reader.readAsDataURL(input.files[0]);
    }
}
