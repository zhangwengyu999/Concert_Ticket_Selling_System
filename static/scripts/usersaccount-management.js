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
    
    getAllUsers();
});

function getAllUsers() {
    $.ajax({
        url: '/user/all',
        type: 'GET',
        success: function(users) {
            renderUserTable(users);
        },
        error: function(error) {
            console.error('Error get users:', error);
        }
    });
}

function renderUserTable(users) {
    const userTable = $("#user-table");
    userTable.empty();
    if (users.length === 0) {
        userTable.append('<tr><td colspan="5">No users found</td></tr>');
    } else {
      users.forEach(user => {
        var loginAttempts = 0
        if (user.loginAttempts) {
            loginAttempts = user.loginAttempts;
        }
        var profileEdits = 0
        if (user.profileChangeAttempts) {
            profileEdits = user.profileChangeAttempts;
        }
        var passwordChangeAttempts = 0
        if (user.passwordChangeAttempts) {
            passwordChangeAttempts = user.passwordChangeAttempts;
        }
        if (user.role !== 'admin') {
          userTable.append(`
              <tr>
                  <td>${user.username}</td>
                  <td>${user.email}</td>
                  <td>${user.nickname}</td>
                  <td>${user.gender}</td>
                  <td>${user.birthDate}</td>
                  <td>${loginAttempts}</td>
                  <td>${profileEdits}</td>
                  <td>${passwordChangeAttempts}</td>
              </tr>
          `);
        } else {
            userTable.append(`
              <tr>
                  <td>${user.username}</td>
                  <td>ADMIN</td>
                  <td>ADMIN</td>
                  <td>ADMIN</td>
                  <td>ADMIN</td>
                  <td>${loginAttempts}</td>
                  <td>${profileEdits}</td>
                  <td>${passwordChangeAttempts}</td>
              </tr>
          `);
        }

      });
    }
}
