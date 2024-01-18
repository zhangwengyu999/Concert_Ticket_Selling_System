// LIU Minghao, ZHANG Wengyu
/* eslint-disable no-undef */

$(document).ready(function() {
    getVenues();

    $("#searchButton").click(function() {
        filterEvents();
    });

    $("#titleInput").on("input", function() {
        let inputText = $(this).val();
        showTitleSuggestions(inputText);
    });

    $("#titleSuggestions").on("click", ".list-group-item-action", function(e) {
        e.preventDefault();
        let selectedTitle = $(this).text();
        $("#titleInput").val(selectedTitle);
        // Find the eventID
        let matchedEvent = allEvents.find(event => event.title === selectedTitle);
        if (matchedEvent) {
            $("#titleSelection").val(matchedEvent.eventID).trigger('change');
        }
        $("#titleSuggestions").empty();

        $("#venueSelection").val('-1');
        $("#datetimeSelection").val('-1');
        $("#descriptionInput").val('');
        filterEvents();
    });

    $("#searchReset").on("click", function(e) {
        $("#titleSelection").val('-1');
        $("#venueSelection").val('-1');
        $("#datetimeSelection").val('-1');
        $("#descriptionInput").val('');
        filterEvents();
    });

});

let venuesList = {}; 
function getVenues() {
    $.ajax({
        url: '/venues',
        type: 'GET',
        success: function(venues) {
            venues.forEach(function(venue) {
                venuesList[venue.venueID] = venue.venueName;
            });
            getEvents(); // Fetch events after venues are loaded
        },
        error: function() {
            alert('Failed to get venues');
        }
    });
}

let allEvents = [];
function getEvents() {
    $.ajax({
        url: '/events',
        type: 'GET',
        success: function(events) {
            events.forEach(function(event) {
                if (event.status == 1) {
                    allEvents.push(event);
                    getVenueAvailability(event);
                }
            });
            renderEventDropdown(allEvents);
        },
        error: function() {
            $("#events-list-container").append("<div class='alert alert-danger' role='alert'>Failed to get events. Please try again later.</div>");
        }
    });
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

function renderEventDropdown(events) {
    var select = $("#titleSelection");
    select.empty();
    select.append($('<option>', { value: '-1', text: '-- Select an event --' }));
    events.forEach(function(event) {
        select.append($('<option>', {
            value: event.eventID,
            text: event.title
        }));
    });
    select.trigger('change');

    select = $("#venueSelection");
    select.empty();
    select.append($('<option>', { value: '-1', text: '-- Select a venue --' }));
    for (const venueID in venuesList) {
        select.append($('<option>', {
            value: venueID,
            text: venuesList[venueID]
        }));
    }

    select = $("#datetimeSelection");
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
    var selectedTitle = $("#titleSelection").val();
    var selectedVenueID = $("#venueSelection").val();
    var selectedDateTime = $("#datetimeSelection").val();
    var inputDescription = $("#descriptionInput").val().toLowerCase();

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


function displayEvent(event, availability) {
    // check and remove the 'static/' in the path
    if (event.image.startsWith('static/')) {
        event.image = event.image.substring(7);
    }
    let venueName = venuesList[event.venueID];
    let eventHtml = `
        <div class="card mx-0 my-2 m-md-2 p-0" style="width: 30rem;">
            <a href="./ticketbooking.html?eventID=${event.eventID}" class="text-decoration-none text-dark">
                <img src="${event.image}" class="card-img-top m-0 p-0 w-100 object-fit-cover" alt="${event.title}">
                <div class="card-body">
                    <h5 class="card-title">${event.title}</h5>
                    <span class="text-bg-light">${event.description.substring(0, 50)}...</span><br>
                    <b>Venue: </b> <span class="text-bg-light">${venueName}</span><br>
                    <b>Date: </b> <span class="text-bg-light">${event.datetime}</span><br>
                    <span class="card-text mt-2"><b>Price:</b> ${getPrices(event.prices)}</span><br>
                    <span class="card-text mt-2"><b>Available:</b> ${availability.availableSeats}/${availability.totalSeats}</span><br>
                </div>
            </a>
        </div>`;
    $("#events-list").append(eventHtml);
}

function getPrices(prices) {
    return prices.map(price => `$${price}`).join(' / ');
}

// Real-time event name suggestion
function showTitleSuggestions(inputText) {
    if (inputText.length > 0) {
        let filteredEvents = allEvents.filter(event => event.title.toLowerCase().includes(inputText.toLowerCase()));
        displaySuggestions(filteredEvents);
    } else {
        $("#titleSuggestions").empty();
    }
}

function displaySuggestions(events) {
    let suggestionsBox = $("#titleSuggestions");
    suggestionsBox.empty();
    events.forEach(event => {
        suggestionsBox.append(`<a class="list-group-item list-group-item-action">${event.title}</a>`);
    });
}


