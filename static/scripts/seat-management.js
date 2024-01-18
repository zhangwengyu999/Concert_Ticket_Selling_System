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

    getVenues();

    getAllData();

    $('#venueSelection').change(function() {
        selectedVenueID = $(this).val();
        // if select on -2 to create new venue, display the input for name
        if (selectedVenueID == "-2") {
            $('#newVenueDiv').removeClass('d-none');
            $('#seatMapContainer').empty();
            $('#seatUserInfo').text('Enter Venue Name and Row and Column to create a new venue.');
        } else {
            $('#newVenueDiv').addClass('d-none');
            getSeatMap(selectedVenueID);
            $('#seatUserInfo').text('Click on a seat to view user information.');
        }

        

    });

  $('#applyButton').on('click', function() {
      var venueID = $('#venueSelection').val();
      if (venueID == "-2") {
        // for new venue name
        venueID = $('#newVenueName').val();
      }
      var rows = $('#numberOfRows').val();
      var cols = $('#numberOfColumns').val();

      if ((venueID != "-1") && rows && cols) {
          checkSeatAvailabilityBeforeUpdate(venueID, rows, cols);
      } else {
          alert('Please select/enter a venue and specify rows and columns');
      }
  });


});

var allUsersTransactions = [];
var eventList = [];
var venueList = [];
var selectedVenueID;

function getVenues() {
    $.ajax({
        url: '/venues',
        type: 'GET',
        success: function(venues) {
            renderVenueDropdown(venues);
        },
        error: function() {
            alert('Failed to get venues');
        }
    });
}

function renderVenueDropdown(venues) {
    const venueSelect = $('#venueSelection');
    venueSelect.empty();
    venueSelect.append($('<option>', { value: '-1', text: 'Please Select' }));

    venues.forEach(function(venue) {
        venueSelect.append($('<option>', {
            value: venue.venueID,
            text: venue.venueName
        }));
    });
    // for selecting new venue
    venueSelect.append($('<option>', { value: '-2', text: 'Create New Venue' }));
}

function getSeatMap(venueID) {
    $.ajax({
        url: '/venues/seatmap/' + venueID,
        type: 'GET',
        success: function(seatMap) {
          $('#seatMessage').text('Please enter the number of rows and columns to update the seat map');
          renderSeatMap(seatMap);
        },
        error: function() {
            console.error('No seat map!');
            $('#seatMapContainer').empty();
            $('#seatMessage').text('No seat map available for this venue, please create one.');
        }
    });

}

// References: https://developer.mozilla.org/en-US/docs/Web/SVG/Scripting
function renderSeatMap(seatMap) {
    const seatMapContainer = $('#seatMapContainer');
    seatMapContainer.empty();

    // Calculate SVG dimensions
    const svgWidth = 40 + (seatMap[0].length * 40); 
    const svgHeight = 40 + (seatMap.length * 40);

    const svg = $(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    svg.attr('width', svgWidth);
    svg.attr('height', svgHeight);

    // Adding the 'Stage' label
    const stage = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
    stage.attr({ x: 0, y: 0, width: svgWidth-30, height: 30, fill: 'grey' });
    svg.append(stage);

    const stageText = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
    stageText.attr({ x: svgWidth/2-30, y: 20, fill: 'white' }).text('Stage');
    svg.append(stageText);

    seatMap.forEach((row, rowIndex) => {

        // Adding the row label
        const rowLabel = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
        rowLabel.attr({ x: 0, y: 70 + rowIndex * 40, fill: 'black' }).text(rowIndex + 1);
        svg.append(rowLabel);

        row.forEach((seat, seatIndex) => {
            // Column label (only for the first row)
            if (rowIndex === 0) {
                const colLabel = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
                colLabel.attr({ x: 20 + seatIndex * 40, y: 45, fill: 'black' }).text(seatIndex + 1);
                svg.append(colLabel);
            }

            const rect = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
            rect.attr({
                x: 10 + seatIndex * 40, // Adjust x position
                y: 50 + rowIndex * 40, // Adjust y position
                width: 30,
                height: 30,
                fill: getSeatColor(rowIndex, seat),
            });

            rect.on('click', function() {
                displayUserInfoForSeat(selectedVenueID, rowIndex, seatIndex);
            });

            svg.append(rect);
        });
    });

    seatMapContainer.append(svg);
}

function getSeatColor(rowIndex, seat) {
    if (seat == 1) return 'grey'; // Seat is taken
    return rowIndex < 2 ? 'red' : 'blue'; // First-class seats are red, second-class are blue
}

function checkSeatAvailabilityBeforeUpdate(venueID, rows, cols) {
    var selectedID = $('#venueSelection').val();
      if (selectedID == "-2") {
        updateVenue($('#newVenueName').val(), rows, cols);
      } else {
        $.ajax({
            url: '/venues/availability/' + venueID,
            type: 'GET',
            success: function(seatAvailability) {
                if (seatAvailability.totalSeats !== seatAvailability.availableSeats) {
                    alert('Some seats are already booked in this venue. Cannot modify seat map.');
                } else {
                    updateSeatMap(venueID, rows, cols);
                }
            },
            error: function() {
                console.error('Unable to get seat availability!');
            }
        });
      }
}

function updateSeatMap(venueID, rows, cols) {
    // check for at least 40 seats
    if (rows * cols < 40 || rows < 3 || cols < 3) {
        alert('A seat map must have at least 40 seats and 3 rows and columns');
        return;
    }
    $.ajax({
        url: '/venues/seatmap',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ venueID, rows, cols }),
        success: function(response) {
            alert('Seat map updated successfully');
            getSeatMap(venueID); // Refresh
        },
        error: function(xhr, status, error) {
            alert('Error updating seat map: ' + xhr.responseText);
        }
    });
}

function updateVenue(venueName, rows, cols) {
    // check for at least 40 seats
    if (rows * cols < 40 || rows < 3 || cols < 3) {
        alert('A seat map must have at least 40 seats and 3 rows and columns');
        return;
    }

    var venueID = venueList.length;
    $.ajax({
        url: '/venues',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ venueID, venueName, rows, cols }),
        success: function(response) {
            alert('Venue create successfully');
            getSeatMap(venueID); // Refresh
        },
        error: function(error) {
            alert('Error create venue: ' + error);
        }
    });
}

// For seat user info
function getAllData() {
    $.ajax({
        url: '/user/alltransactions/',
        type: 'GET',
        success: function(data) {
            allUsersTransactions = data.data;
        },
        error: function(error) {
            console.error('Error get user transactions:', error);
        }
    });

    $.ajax({
        url: '/events',
        type: 'GET',
        success: function(data) {
            eventList = data;
        },
        error: function(error) {
            console.error('Error get events:', error);
        }
    });

    $.ajax({
        url: '/venues',
        type: 'GET',
        success: function(data) {
            venueList = data;
        },
        error: function(error) {
            console.error('Error get venues:', error);
        }
    });
}

function displayUserInfoForSeat(venueID, row, col) {
    venueID = parseInt(venueID);
    console.log(row+" "+col);

    const event = eventList.find(e => e.venueID === venueID);
    if (!event) {
        alert("Event not found for this venue.");
        return;
    }

    let occupantUsername = null;
    for (const user of allUsersTransactions) {
        
        if (!user.transactions) continue;
        console.log(user.transactions);
        const userTransaction = user.transactions.find(t => 
            t.eventID == event.eventID && 
            t.seatCoord[0] == row && 
            t.seatCoord[1] == col
        );

        if (userTransaction) {
            occupantUsername = user.username;
            break; 
        }
    }

    // Check if found an occupant
    if (occupantUsername) {
        $('#seatUserInfo').text("Seat " + (row + 1) + "-" + (col + 1) + " is occupied by " + occupantUsername + " for event " + event.title + " at " + venueList.find(v => v.venueID === venueID).venueName + ".");
    } else {
        $('#seatUserInfo').text("Seat " + (row + 1) + "-" + (col + 1) + " is currently unoccupied.");
    }
}


