// LIU Minghao, ZHANG Wengyu
/* eslint-disable no-undef */
$(document).ready(function(){

    fetch('/auth/me')
        .then(response => response.json())
        .then(data => {
            if (!(data.status === "success" && data.user)) {
                window.open("/login.html", "_self");
            }
            username  = data.user.username;
    });

    getEventsList();
    getVenuesList();
    
    $("#profileImage").change(function(){
        readURL(this);
    });

    $("#basic-addon1").on("click", function() {
        $("#hiddenPassword").addClass("d-none");
        $("#showPassword").removeClass("d-none");
    });
    $("#basic-addon2").on("click", function() {
        $("#hiddenPassword").removeClass("d-none");
        $("#showPassword").addClass("d-none");
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

  $("#confirmPassword").on("input", function() {
      if ($(this).val() != $("#password").val()) {
          $("#passwordCheck").html(`
          <div class="alert alert-danger py-1" role="alert">
          Password not match!
          </div>
          `)
      } else {
          $("#passwordCheck").html("")
      }
    });

    $("#updateButton").on("click", function() {
        event.preventDefault();
        // check input validation, but not on password
        if ($("#nickname").val() == "" || $("#email").val() == "") {
            alert("Neither nickname nor email can be empty!");
            return;
        }

        updateUserInfo();   
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

  $("#image").change(function(){
    readURL(this);
    });

});

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#previewImage').attr('src', e.target.result);
            $('#previewImage').show();
        }

        reader.readAsDataURL(input.files[0]);
    }
}

let eventsList = {}; 
function getEventsList() {
    $.ajax({
        url: '/events',
        type: 'GET',
        success: function(events) {
            events.forEach(function(event) {
                eventsList[event.eventID] = event;
            });
        },
        error: function() {
            alert('Failed to get events');
        }
    });
}

let venuesList = {}; 
function getVenuesList() {
    $.ajax({
        url: '/venues',
        type: 'GET',
        success: function(venues) {
            venues.forEach(function(venue) {
                venuesList[venue.venueID] = venue.venueName;
            });
            // get user info after getting venues list
            getUserInfo();
        },
        error: function() {
            alert('Failed to get venues');
        }
    });
}


function getUserInfo() {
    fetch('/auth/me')
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            getDetailedUserInfo(data.user.username);
            getUserTransactions(data.user.username);
        } else {
            // Handle unauthorized access or errors
            console.error('User not logged in or error get user data');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getDetailedUserInfo(username) {
    fetch(`/user/details/${username}`)
    .then(response => response.json())
    .then(data => {
        if(data.status === "success") {
            renderUserInfo(data.user);
        } else {
            console.error('Error get detailed user info'); 
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getUserTransactions(username) {
    fetch(`/user/transactions/${username}`)
    .then(response => response.json())
    .then(data => {
        if(data.status === "success") {
            renderTransactionsTable(data.transactions);
        } else {
            console.error('Error get user transactions'); 
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


// Function to populate user info
function renderUserInfo(userInfo) {
    $('#username').val(userInfo.username);
    $('#nickname').val(userInfo.nickname);
    $('#email').val(userInfo.email);
    if (userInfo.image.startsWith('static/')) {
        userInfo.image = userInfo.image.substring(7);
    }
    $('#profileImage').attr('src', userInfo.image);
    $('#gender').val(userInfo.gender);
    $('#dob').val(userInfo.birthDate);
}

function renderTransactionsTable(transactions) {
    const transactionTable = $("#transaction-table");
    transactionTable.empty(); 

    var cancelledCount = 0;

    if (eventsList == null || venuesList == null) {
        getEventsList();
        getVenuesList();
    }

    transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.time);
        const formattedDate = transactionDate.toLocaleDateString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', 
            hour12: false
        });
        var eventTitle = eventsList[transaction.eventID].title;
        var eventVenue = venuesList[eventsList[transaction.eventID].venueID];
        var eventDataTime = eventsList[transaction.eventID].datetime;
        var rowNum = transaction.seatCoord[0]+1;
        var colNum = transaction.seatCoord[1]+1;
        var seatNum =  rowNum +"-"+ colNum;

        var eventStatus = eventsList[transaction.eventID].status;

        const rowStyle = eventStatus === 0 ? 'style="background-color: #ffcccc;"' : '';
        
        const row = `
            <tr> 
                <td ${rowStyle}>${eventTitle}</td>
                <td ${rowStyle}>${eventVenue}</td>
                <td ${rowStyle}>${eventDataTime}</td>
                <td ${rowStyle}>${seatNum}</td>
                <td ${rowStyle}>${transaction.price}</td>
                <td ${rowStyle}>${formattedDate}</td>
            </tr>
        `;

        transactionTable.append(row);

        if (eventStatus === 0) {
            cancelledCount++;
        }

    });

    if (cancelledCount > 0) {
        $("#cancelledCount").html(`
            <p style="color: #ff0000">Note: You have ${cancelledCount} ticket(s) have been cancelled. Marked in red.</p>
        `);
    }
}

// Function to update user info
function updateUserInfo() {

    var username = $('#username').val();
    var password = $('#password').val();
    var nickname = $('#nickname').val();
    var email = $('#email').val();
    var image = $('#image')[0].files[0];

    var userData = new FormData();
    userData.append('username', username);
    if (password != "") {
        userData.append('password', password);
    }
    userData.append('nickname', nickname);
    userData.append('email', email);
    // check if image is uploaded in profileImageUpload
    if (image) {
        userData.append('image', image);
    }
    console.log(">>>"+userData);

    $.ajax({
        url: '/user/update',
        type: 'POST',
        data: userData,
        processData: false,
        contentType: false,
        success: function(data) {
            alert('User updated successfully');
        },
        error: function(error) {
            alert('Error creating event: ' + error.responseText);
        }
    });
}
