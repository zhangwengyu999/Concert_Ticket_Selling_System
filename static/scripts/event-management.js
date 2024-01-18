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
          username  = data.user.username;
    });
    
    // First fetch all events, all venues and then fetch all transactions
    getVenues();
    
    $("#titleSelectModify").change(function() {
        var eventID = $(this).val();
        getEventDetails(eventID);
    });
    
    $("#uploadPictureInput").change(function(){
        readURL(this);
    });

    $("#modifyEventButton").click(function(event) {
        event.preventDefault();
        modifyEvent();
    });

    $('#addEventButton').on('click', function(event) {
        event.preventDefault();
        createEvent();
    });

    $("#uploadPictureInput").change(function(){
        readURL(this, 'previewImage');
    });

    $("#uploadPictureInputModify").change(function(){
        console.log("change");
        readURL(this, 'previewImageModify');
    });

    $("#searchButton").click(function() {
        filterEvents();
    });

    $("#searchReset").click(function() {
        $("#titleSelectionFilter").val('-1');
        $("#venueSelectionFilter").val('-1');
        $("#datetimeSelectionFilter").val('-1');
        $("#descriptionInputFilter").val('');
        filterEvents();
    });
});

function readURL(input, previewID) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var id = '#' + previewID;
            $(id).attr('src', e.target.result);
            $(id).show();
        }

        reader.readAsDataURL(input.files[0]);
    }
}

function getVenues() {
    $.ajax({
        url: '/venues',
        type: 'GET',
        success: function(venues) {
            getVenuesList();
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
}


function getVenuesForModify() {
    $.ajax({
        url: '/venues',
        type: 'GET',
        success: function(venues) {
            renderVenueDropdownForModify(venues);
        },
        error: function() {
            alert('Failed to get venues');
        }
    });
}
function renderVenueDropdownForModify(venues) {
    const venueSelect = $('#venueSelectionModify');
    venueSelect.empty();
    venueSelect.append($('<option>', { value: '-1', text: 'Please Select' }));

    venues.forEach(function(venue) {
        venueSelect.append($('<option>', {
            value: venue.venueID,
            text: venue.venueName
        }));
    });

    $("#titleSelectModify").trigger('change');
}
    
// for create event
function createEvent() {
    var eventID = $('#idInput').val();
    var title = $('#titleInput').val();
    var datetime = $('#dateInput').val();
    var venueID = $('#venueSelection').val();
    var description = $('#descInput').val();
    var firstClassPrice = $('#firstClassPriceInput').val();
    var secondClassPrice = $('#secondClassPriceInput').val();
    var image = $('#uploadPictureInput')[0].files[0];

    if (!title || !datetime || venueID == "-1" || !description || !firstClassPrice || !secondClassPrice || !image) {
        alert('Please fill in all fields');
        return;
    }

    // check if the eventID is existed
    if (allEvents.some(event => event.eventID == parseInt(eventID))) {
        alert('Event ID already exists');
        return;
    }

    var formData = new FormData();
    formData.append('eventID', eventID);
    formData.append('title', title);
    formData.append('datetime', datetime);
    formData.append('venueID', venueID);
    formData.append('description', description);
    formData.append('image', image);
    formData.append('prices', JSON.stringify({
        firstClass: firstClassPrice,
        secondClass: secondClassPrice
    }));
    formData.append('status', 1);

    $.ajax({
        url: '/events',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            alert('Event created successfully');
        },
        error: function(error) {
            alert('Error creating event: ' + error);
        }
    });
}


// Modify event
let allEvents = [];
function getEventsForModification() {
    $.ajax({
        url: '/events',
        type: 'GET',
        success: function(events) {
            allEvents = events; 
        },
        error: function() {
            alert('Failed to get events');
        }
    });
}

function renderEventDropdown(events) {
    var select = $("#titleSelectModify");
    select.empty();
    events.forEach(function(event) {
        select.append($('<option>', {
            value: event.eventID,
            text: event.title
        }));
    });
    select.trigger('change');
}



function getEventDetails(eventID) {
    $.ajax({
        url: '/events/' + eventID,
        type: 'GET',
        success: function(event) {
            // Populate form fields
            $('#titleInputModify').val(event.title);
            $('#idInputModify').val(event.eventID);
            $('#dateInputModify').val(event.datetime);
            // select the event's venue as default option
            $('#venueSelectionModify').val(event.venueID);
            $('#descInputModify').val(event.description);
            $('#firstClassPriceInputModify').val(event.prices[0]);
            $('#secondClassPriceInputModify').val(event.prices[1]);
            if (event.image.startsWith('static/')) {
                event.image = event.image.substring(7);
            }
            $('#oldImage').attr('src', event.image).show();
            $('#statusSelectModify').val(event.status);
        },
        error: function() {
            alert('Failed to get event details');
        }
    });
}

function modifyEvent() {
    var eventID = $('#idInputModify').val();
    var title = $('#titleInputModify').val();
    var datetime = $('#dateInputModify').val();
    var venueID = $('#venueSelectionModify').val();
    var description = $('#descInputModify').val();
    var firstClassPrice = $('#firstClassPriceInputModify').val();
    var secondClassPrice = $('#secondClassPriceInputModify').val();
    var newImage = $('#uploadPictureInputModify')[0].files[0];    
    var status = $('#statusSelectModify').val();


    var formData = new FormData();
    formData.append('eventID', eventID);
    formData.append('title', title);
    formData.append('datetime', datetime);
    formData.append('venueID', venueID);
    formData.append('description', description);
    if(newImage) {
        formData.append('image', newImage);
    }
    formData.append('prices', JSON.stringify({
        firstClass: firstClassPrice,
        secondClass: secondClassPrice
    }));
    formData.append('status', status);

    $.ajax({
        url: '/events/' + eventID,
        type: 'PUT',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            alert('Event modified successfully');
        },
        error: function(error) {
            alert('Error modifying event: ' + error);
        }
    });
}

// For filter events
function renderEventDropdownForFilter(events) {
    var select = $("#titleSelectionFilter");
    select.empty();
    select.append($('<option>', { value: '-1', text: '-- Select an event --' }));
    events.forEach(function(event) {
        select.append($('<option>', {
            value: event.eventID,
            text: event.title
        }));
    });
    select.trigger('change');

    select = $("#venueSelectionFilter");
    select.empty();
    select.append($('<option>', { value: '-1', text: '-- Select a venue --' }));
    for (const venueID in venuesList) {
        select.append($('<option>', {
            value: venueID,
            text: venuesList[venueID]
        }));
    }

    select = $("#datetimeSelectionFilter");
    select.empty();
    select.append($('<option>', { value: '-1', text: '-- Select a date and time --' }));
    for (const event of events) {
        select.append($('<option>', {
            value: event.datetime,
            text: event.datetime
        }));
    }
}

function filterEvents() {
    var selectedTitle = $("#titleSelectionFilter").val();
    var selectedVenueID = $("#venueSelectionFilter").val();
    var selectedDateTime = $("#datetimeSelectionFilter").val();
    var inputDescription = $("#descriptionInputFilter").val().toLowerCase();

    // Clear existing events list
    $("#events-list").empty();
    var isFound = false;
    // Filter events based on selection
    allEvents.forEach(function(event) {
        var venueName = venuesList[event.venueID];
        if ((selectedTitle == '-1' || event.eventID == selectedTitle) &&
            (selectedVenueID == '-1' || event.venueID == selectedVenueID) &&
            (selectedDateTime == '-1' || event.datetime == selectedDateTime) &&
            (inputDescription == '' || event.description.toLowerCase().includes(inputDescription))) {
            isFound = true;
            getVenueAvailability(event); // Only display filtered events
        }
    });
    if (!isFound) {
        alert("No event found!");
    }
}

function getVenueAvailability(event) {
    $.ajax({
        url: `/venues/availability/${event.venueID}`,
        type: 'GET',
        success: function(availability) {
            displayEvent(event, availability);
        },
        error: function() {
            displayEvent(event, { available: 'N/A', total: 'N/A' });
        }
    });
}

function displayEvent(event, availability) {
    // check and remove the 'static/' in the path
    if (event.image.startsWith('static/')) {
        event.image = event.image.substring(7);
    }
    let venueName = venuesList[event.venueID];
    let eventHtml = `
        <div class="card mx-0 my-2 m-md-2 p-0" style="width: 30rem;">
            <a class="text-decoration-none text-dark">
                <img src="${event.image}" class="card-img-top m-0 p-0 w-100 object-fit-cover" alt="${event.title}">
                <div class="card-body">
                    <h5 class="card-title">${event.title}</h5>
                    <span class="text-bg-light">${event.description.substring(0, 50)}...</span><br>
                    <b>Venue: </b> <span class="text-bg-light">${venueName}</span><br>
                    <b>Date: </b> <span class="text-bg-light">${event.datetime}</span><br>
                    <span class="card-text mt-2"><b>Price:</b> ${getPrices(event.prices)}</span><br>
                    <span class="card-text mt-2"><b>Available:</b> ${availability.availableSeats}/${availability.totalSeats}</span><br>
                    <span class="card-text mt-2"><b>Status:</b> ${event.status == 1 ? '<font style="background-color: green; color: white">Running</font>' : '<font style="background-color: red; color: white">Cancelled</font>'}</span><br>
                </div>
            </a>
        </div>`;
    $("#events-list").append(eventHtml);
}

function getPrices(prices) {
    return prices.map(price => `$${price}`).join(' / ');
}



// For fetch transactions
let eventsList = {}; 
function getEvents() {
    $.ajax({
        url: '/events',
        type: 'GET',
        success: function(events) {
            events.forEach(function(event) {
                eventsList[event.eventID] = event;
                getVenueAvailability(event);
            });
            
            // Starting point
            getVenuesForModify()
            getEventsForModification();
            getAllUserTransactions();
            renderEventDropdownForFilter(events);
            renderEventDropdown(events)
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
            
            getEvents();
            
        },
        error: function() {
            alert('Failed to fetch venues');
        }
    });
}

function getAllUserTransactions() {
    fetch(`/user/alltransactions/`)
    .then(response => response.json())
    .then(data => {
        if(data.status === "success") {
            renderTransactionsTable(data);
        } else {
            console.error('Error get user transactions'); 
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function renderTransactionsTable(data) {
    const transactionTable = $("#transaction-table");
    transactionTable.empty(); 
    var items = data.data;
    items.forEach(item => {
        var username = item.username;
        var transactions = item.transactions;
        if (transactions) {
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

                const row = `
                    <tr>
                        <td>${username}</td>
                        <td>${eventTitle}</td>
                        <td>${eventVenue}</td>
                        <td>${eventDataTime}</td>
                        <td>${seatNum}</td>
                        <td>${transaction.price}</td>
                        <td>${formattedDate}</td>
                    </tr>
                `;
                transactionTable.append(row);
            });
        }
    });
}