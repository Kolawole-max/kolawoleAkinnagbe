$(window).on('load', function () {
    if ($('#preloader').length) {
            $('#preloader').delay(1000).fadeOut('slow', function () {
            $(this).remove();
        });
    }
});
function fetchData(url, queryType, lat, lng) {
    console.log(lat);
    console.log(lng);
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: {
            lat: lat,
            lng: lng
        },
        success: function(result) {
            if (result.status.name == "ok") {
                if(queryType === "ocean"){
                    $('#para1').html("Name : " + result['data']['name']);
                    $('#para2').html("GeonameId: " + result['data']['geonameId']);
                    $('#para3').html("Distance: " + result['data']['distance'] );
                } else if (queryType === "address"){
                    $('#para1').html("Country Code: " + result['data']['countryCode']);
                    $('#para2').html("House Number: " + result['data']['houseNumber']);
                    $('#para3').html("Street: " + result['data']['street']);
                } else if(queryType === "findNearby") {
                    $('#para1').html("Country Name: " + result['data'][0]['countryName']);
                    $('#para2').html("Country Code: " + result['data'][0]['countryCode']);
                    $('#para3').html("Continent Code: " + result['data'][0]['continentCode'] );
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // your error code
            $('#para1').html("No data was found. Make sure you're matching the options correctly");
            $('#para2').html("");
            $('#para3').html("");
        }
    }); 
}
$('#oceanBtn').on('click', function() {
    var lat = $('#oceanLat').val();
    var lng = $('#oceanLng').val();
    fetchData("php/getOceanName.php", 'ocean', lat, lng);
});
$('#addressBtn').on('click', function() {
    var lat = $('#addressLat').val();
    var lng = $('#addressLng').val();
    fetchData("php/getAddress.php", 'address', lat, lng);
});
$('#findNearbyBtn').on('click', function() {
    var lat = $('#findNearbyLat').val();
    var lng = $('#findNearbyLng').val();
    fetchData("php/getNearby.php", 'findNearby', lat, lng);
});

