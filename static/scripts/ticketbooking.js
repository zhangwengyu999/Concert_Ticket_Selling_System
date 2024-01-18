// LIU Minghao, ZHANG Wengyu
/* eslint-disable no-undef */
var firstClassPrice = 0;
var secondClassPrice = 0;
var venueName = "";
var username = "";
var selectedSeatRow = 0;
var selectedSeatCol = 0;

$(document).ready(function() {

    fetch('/auth/me')
        .then(response => response.json())
        .then(data => {
            if (!(data.status === "success" && data.user)) {
                window.open("/login.html", "_self");
            }
            username  = data.user.username;
    });

    var eventID = getEventIdFromUrl();
    getEventDetails(eventID);
    $('#ticketPriceSelection').change(function() {
        updateDisplayedPrice();
        updateSeatMapBasedOnTicketType();
    });

    $('#resetButton').on('click', function() {
        resetAll();
    });

    $('#payment').on('click', function() {
        handlePaymentClick();
    });

    $('#paybutton').on('click', function() {
        placeOrder();
    });
});


function getEventIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get('eventID');
}

function getEventDetails(eventID) {
    $.ajax({
        url: '/events/' + eventID,
        type: 'GET',
        success: function(event) {
            renderEventDetails(event);
            getSeatMap(event.venueID);

            // Fetch venue name
            $.ajax({
                url: '/venues/' + event.venueID,
                type: 'GET',
                success: function(venue) {
                    $('#eventVenue').text(venue.venueName);
                    venueName = venue.venueName;
                },
                error: function() {
                    alert('Unable to get venue details!');
                }
            });
        },
        error: function() {
            alert('Unable to get event details!');
        }
    });
}


function updateSeatMapBasedOnTicketType() {
    getSeatMap(getEventIdFromUrl());
}

function renderEventDetails(event) {
    $('#eventTitle').text(event.title);
    $('#eventVenue').text(venueName);
    $('#eventPrice').text(event.prices);
    $('#eventDate').text(event.datetime);
    
    if (event.image.startsWith('static/')) {
        event.image = event.image.substring(7);
    }
    $('#eventImage').attr('src', event.image);
    
    renderTicketPrices(event.prices);
    getSeatMap(event.venueID);
}

function renderTicketPrices(prices) {
    var ticketPriceSelect = $('#ticketPriceSelection');
    ticketPriceSelect.empty(); 

    prices.forEach(function(price, index) {
        var option = $('<option></option>').attr("value", price).text("$" + price);
        ticketPriceSelect.append(option);
        if (index === 0) {
            firstClassPrice = price;
            ticketPriceSelect.val(price);
        } else {
            secondClassPrice = price;
        }
    });
    
    updateDisplayedPrice();
}

function updateDisplayedPrice() {
    var selectedPrice = $('#ticketPriceSelection').val();
    $('#price').text(selectedPrice);
}

function getSeatMap(venueID) {
    $.ajax({
        url: '/venues/seatmap/' + venueID,
        type: 'GET',
        success: function(seatMap) {
            renderSeatMap(seatMap);
        },
        error: function() {
            console.error('Unable to get seat map!');
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
                class: 'seat',
                'data-row': rowIndex,
                'data-seat': seatIndex
            });

            rect.on('click', function() {
                if(seat === 1) return; // Skip if seat is taken

                // Update the selected seat info display
                selectedSeatRow = rowIndex + 1;
                selectedSeatCol = seatIndex + 1;

                // Deselect all seats and select the clicked one
                $('.seat').attr('fill', s => getSeatColor(parseInt($('.seat').eq(s).attr('data-row')), seatMap[parseInt($('.seat').eq(s).attr('data-row'))][parseInt($('.seat').eq(s).attr('data-seat'))]));
                $(this).attr('fill', 'green');

                // Update selected seat info
                $('#selectedSeatInfo').text(`Selected Seat: Row ${rowIndex + 1}, Seat ${seatIndex + 1}`);
                updateTicketTypeAndPrice(rowIndex);
            });
        

            svg.append(rect);
        });
    });

    seatMapContainer.append(svg);
}

function updateTicketTypeAndPrice(rowIndex) {
    let ticketType, price;
    if (rowIndex < 2) {
        ticketType = 'First Class';
        price = firstClassPrice;
    } else {
        ticketType = 'Second Class';
        price = secondClassPrice;
    }
    $('#ticketTypeInfo').text(`${ticketType}`);
    $('#price').text(price);
}

function getSeatColor(rowIndex, seat) {
    if (seat == 1) return 'grey'; // Seat is taken
    return rowIndex < 2 ? 'red' : 'blue'; // First-class seats are red, second-class are blue
}

function resetAll() {
    // Clear selected seat info
    $('#selectedSeatInfo').text('Not selected');
    $('#ticketTypeInfo').text('Not selected');
    $('#price').text('0');

    // Reset the seat map
    const venueID = getEventIdFromUrl();
    getSeatMap(venueID);

    // Reset the payment info fields
    $('#paymentInfoContainer').hide();
}

// Payment handling
function handlePaymentClick() {
    if ($('#selectedSeatInfo').text() === 'Not selected') {
        alert('Please select a seat!');
        return;
    }

    $('.seat').off('click');

    // Show payment info fields
    $('#paymentInfoContainer').show();

    $('html, body').animate({
        scrollTop: $('#paymentInfoContainer').offset().top
    }, 0);
}

function placeOrder() {
    // Check credit card input
    const creditName = $('#creditName').val();
    const creditNo = $('#creditNo').val();
    const creditCVV = $('#creditCVV').val();
    if (creditName === '' || creditNo === '' || creditCVV === '') {
        alert('Please fill in all credit card details!');
        return;
    }
    // Retrieve user input
    const eventID = getEventIdFromUrl();
    const price = parseInt($('#price').text());
    const bookingDateTime = new Date().toLocaleString();

    // Prepare the order data
    const orderData = {
        username: username,
        eventID: eventID,
        seatRow: selectedSeatRow - 1, // 0-base
        seatCol: selectedSeatCol - 1, // 0-base
        price: price
    };

    console.log(orderData);

    // Send order data to back-end
    $.ajax({
        url: '/order/placeOrder',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(orderData),
        success: function(response) {
            // Show success message
            $('#placeOrderMessage').show();
            $('#confirmationTicket').show(); // Show confirmation ticket
            
            $('html, body').animate({
                scrollTop: $('#confirmationTicket').offset().top
            }, 0);

            // Populate confirmation ticket details
            getConfirmationTicket(eventID, price, bookingDateTime);
        
        },
        error: function(xhr, status, error) {
            // Show error message
            alert('Error placing order: ' + xhr.responseText);
        }
    });
}

function getConfirmationTicket(eventID, price, bookingDateTime) {
    // Populate ticket details
    $('#ticketImage').attr('src', $('#eventImage').attr('src'));
    $('#ticketTitle').text($('#eventTitle').text());
    $('#ticketVenue').text(venueName);
    $('#ticketDate').text($('#eventDate').text());
    $('#ticketPrice').text(`$${price}`);
    $('#ticketSeat').text(`Row ${selectedSeatRow}, Seat ${selectedSeatCol}`);
    $('#ticketName').text(username);
    $('#bookingDateTime').text(bookingDateTime);
}
