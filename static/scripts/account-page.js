// LIU Minghao, ZHANG Wengyu
/* eslint-disable no-undef */
$(document).ready(function() {
    fetch('/auth/me')
        .then(response => response.json())
        .then(data => {
            if (data.status === "success" && data.user) {
                if (data.user.role === "admin") {
                    window.location.href = "/admin-account.html";
                } else if (data.user.role === "user") {
                    window.location.href = "/usersaccount.html";
                } else {
                    alert("Unknown error");
                    window.location.href = "/index.html";
                }
            } else {
                window.open("/login.html", "_self");
            }
        });

    $('#logoutBtn').click(function() {
        const confirmed = confirm("Confirm to logout?");
        if (confirmed) {
            fetch('/auth/logout', {
                method: 'POST',
            })
            .then(response => {
                if (response.status == 200) {
                    window.location.href = "/login.html";
                } else {
                    alert("Logout failed. Please try again.");
                }
            });
        }
    });
});
