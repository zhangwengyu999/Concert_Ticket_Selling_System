// LIU Minghao, ZHANG Wengyu
/* eslint-disable no-undef */
$(document).ready(function() {

        fetch('/auth/me')
        .then(response => response.json())
        .then(data => {
            if (!(data.status === "success" && data.user.role === "admin")) {
                window.open("/login.html", "_self");
                alert("You are not authorized to access this page! Please log in as an admin.");
            }
            username = data.user.username;
        });
        
        $('#logoutButton').click(function() {
        const confirmed = confirm("Confirm to logout?");
        if (confirmed) {
            fetch('/auth/logout', {
                method: 'POST',
            })
            .then(response => {
                if (response.status == 200) {
                    window.location.href = "/index.html";
                } else {
                    alert("Logout failed. Please try again.");
                }
            });
        }
    });
});