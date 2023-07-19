$(window).on('load', function () {
    $('#preloader').show();

    var countryData = fetchResultFromPhp('php/getCountryName.php', null);

    countryData.then(function(results) {
      var options = [];
      $.each(results, function(index, item) {
        $.each(item, function(index, data) {
          options.push(data);
        });
      });
      
      options.sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });
      
      $.each(options, function(index, data) {
        var newOption = $('<option>', {
          value: data.name,
          text: data.name + " | " + data.iso_a3
        });
        $('#countrySelectButton').append(newOption);
      });
    }).catch(function(error) {
      console.error(error);
    });   
    
    var map = L.map('map'); //093ec152c9msh0d9691f95342f38p1c2dc2jsnd0dacbaced2e

    L.tileLayer('https://maptiles.p.rapidapi.com/en/map/v1/{z}/{x}/{y}.png?rapidapi-key={apikey}', {
      attribution: '&copy; <a href="http://www.maptilesapi.com/">MapTiles API</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      apikey: '093ec152c9msh0d9691f95342f38p1c2dc2jsnd0dacbaced2e',
      maxZoom: 19
    }).addTo(map);

    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    //   maxZoom: 13,
    // }).addTo(map);

    

    var featureGroup = L.featureGroup();
    var markerClusterGroup = L.markerClusterGroup();
    var baseResult = null;

    if (!navigator.geolocation) {
      
      // Geolocation is not supported
      console.log("Geolocation is not supported by this browser.");
    } else {
      // Geolocation is supported
      navigator.geolocation.getCurrentPosition(
        async function (position) {
          // Get latitude and longitude
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;

          //Fetch country name using lat and lng
          baseResult = await fetchResultFromPhp('php/getCountryInfo.php', {lat:lat, lng: lng});

          var countryName = baseResult['data'][0]['components']['country'];

          $('#countrySelectButton option').each(function(index, option) {
            var value = $(option).val();
            if(value === countryName){
              $(option).prop('selected', true);
            }
          });
    
          featureGroupFun(featureGroup, markerClusterGroup, baseResult, map, lat, lng);

          var buttonConfigs = [
            {
              id: 'countryInfoButton',
              icon: 'info',
              onClick: function() {
                $('#countryInfoModal').modal('show');
              }
            },
            {
              id: 'weatherInfoButton',
              icon: 'foggy',
              onClick: function() {
                $('#weatherInfoModal').modal('show');
              }
            },
            {
              id: 'currencyButton',
              icon: 'currency_exchange',
              onClick: function() {
                $('#currencyModal').modal('show');
              }
            }
          ];
        
          buttonConfigs.forEach(function(config) {
            var easyButton = L.easyButton({
              states: [
                {
                  stateName: config.id,
                  icon:  '<span class="material-icons">' + config.icon + '</span>',
                  onClick: config.onClick
                }
              ]
            });
        
            // Add the EasyButton to the map
            easyButton.addTo(map);
          });

          countryInfo(baseResult)

          var currentWeatherInfo = await fetchResultFromPhp('php/getCurrentWeather.php', {lat: lat, lng: lng});
          var hourlyForecast = await fetchResultFromPhp('php/getHourlyForecast.php', {lat: lat, lng: lng})
          var dailyForecast = await fetchResultFromPhp('php/getdaily.php', {lat: lat, lng: lng})          
          weather(baseResult, currentWeatherInfo, hourlyForecast, dailyForecast);

          var currency_iso = baseResult.data[0].annotations.currency.iso_code;
          var currencyData = await fetchResultFromPhp('php/convertCurrency.php', {from: currency_iso, to: currency_iso});
          currency(currencyData, baseResult, baseResult);
        },
        function (error) {
          // Error occurred while retrieving location
          console.log("Error: " + error.message);
        }
      );
    }    

    //Change action for select button and load lat and lng from getCountryInfo
    $('#countrySelectButton').change(function() {
      $('#preloader').show();
      var countryName = $(this).val();
      var countryData = fetchResultFromPhp('php/getCountryInfo.php', {countryName : countryName});

      countryData.then(async function(selectedResult) {

        var lat = selectedResult.data[0].geometry.lat;
        var lng = selectedResult.data[0].geometry.lng;

        if(map.hasLayer(featureGroup)){
          map.removeLayer(featureGroup);
          map.removeLayer(markerClusterGroup);
        }

        markerClusterGroup = L.markerClusterGroup();
        featureGroup = await L.featureGroup();
        featureGroupFun(featureGroup, markerClusterGroup, selectedResult, map, lat, lng)

        countryInfo(selectedResult)

        var currentWeatherInfo = await fetchResultFromPhp('php/getCurrentWeather.php', {lat: lat, lng: lng});
        var hourlyForecast = await fetchResultFromPhp('php/getHourlyForecast.php', {lat: lat, lng: lng})
        var dailyForecast = await fetchResultFromPhp('php/getdaily.php', {lat: lat, lng: lng})          
        weather(selectedResult, currentWeatherInfo, hourlyForecast, dailyForecast);

        var baseCurrency_iso = baseResult.data[0].annotations.currency.iso_code;
        var selectedCurrency_iso = selectedResult.data[0].annotations.currency.iso_code;
        var currencyData = await fetchResultFromPhp('php/convertCurrency.php', {from: baseCurrency_iso, to: selectedCurrency_iso});
        currency(currencyData, baseResult, selectedResult)
        $('#preloader').hide();
      }).catch(function(error) {
        console.error(error);
      });  
      
    });
});


//Display country info
function countryInfo(result){
  var countryName = result.data[0].components.country;
  var flag = result.data[0].components.country_code.toUpperCase();

  $('#countryLabel').text(countryName)
  $('#countryImg').attr('src', `https://flagsapi.com/` + flag + `/shiny/64.png`)

  var currencySymbolEntity = result.data[0].annotations.currency.symbol;

  $("#countryName").text(countryName);
  $("#continent").text(result.data[0].components.continent);
  $("#countryCode").text(result.data[0].components.country_code);
  $("#countryInfoCurrencyName").text(result.data[0].annotations.currency.name);
  $("#driveOn").text(result.data[0].annotations.roadinfo.drive_on);
  $("#currencySymbol").html(currencySymbolEntity);  
}



//Display weather info
function weather(result, currentWeatherInfo, hourlyForecast, dailyForecast){

  var countryName = result.data[0].components.country;
  var flag = result.data[0].components.country_code.toUpperCase();

  var dailyContainer = $('#dailyContainer');
  dailyContainer.text('');

  var hourlyContainer = $('#hourly');
  hourlyContainer.text('');

  $('#weatherInfoLabel').text(countryName)
  $('#weatherImg').attr('src', `https://flagsapi.com/` + flag + `/shiny/64.png`)

  $('#currentImg').attr('src', `https://openweathermap.org/img/wn/${currentWeatherInfo.data.weather[0].icon}.png`)

  $('#description').text(currentWeatherInfo.data.weather[0].description);
  $('#temp').text(currentWeatherInfo.data.main.temp);
  $('#feels_like').text(currentWeatherInfo.data.main.feels_like);
  $('#wind').text(currentWeatherInfo.data.wind.speed);
  $('#pressure').text(currentWeatherInfo.data.main.pressure);

  var limitedHourly = hourlyForecast.data.slice(0, 6);
  var limitedDaily = dailyForecast.data.slice(1, 7);

  var hourlyCards = limitedHourly.map(function(data) {
      return `<div class="col p-1 ps-0">
                  <div class="card mb-3 text-center">
                    <h5>${convertTimeToAMPM(data.dt_txt.split(" ")[1])}</h5>
                    <div class="card-body text-truncate text-center">
                      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" class="img-fluid rounded-start" alt="...">
                      <p class="card-text">${data.main.temp}\u00B0C</p>
                    </div>
                  </div>
                </div>`;
    
  }).join(''); 

  
  hourlyContainer.append(hourlyCards);

  //https://www.weatherbit.io/static/img/icons/c03d.png

  var dailyCards = limitedDaily.map(function(data) {
    return `<div class="col p-1 ps-0">
                <div class="card mb-3">
                  <h5 class="text-center">${convertDateToDayName(data.datetime)}</h5>
                  <img src="https://www.weatherbit.io/static/img/icons/${data.weather.icon}.png" class="img-fluid rounded-start" alt="...">
                  <div class="text-wrap text-center" style="white-space: nowrap;">${data.max_temp} - ${data.min_temp}\u00B0C</div>
                </div>
              </div>`;
    
  }).join('');
  
  dailyContainer.append(dailyCards);
}

//Display currency det and converter
async function currency(currencyData, baseResult, selectedResult){

  var countryName = selectedResult.data[0].components.country;
  var flag = selectedResult.data[0].components.country_code.toUpperCase();

  $('#currencyLabel').text(countryName)
  $('#currencyImg').attr('src', `https://flagsapi.com/` + flag + `/shiny/64.png`)

  var selectedSymbol = selectedResult.data[0].annotations.currency.symbol;
  var baseSymbol = baseResult.data[0].annotations.currency.symbol;

  $('#currencyResult').text(selectedSymbol + '0');
  $('#currencyResult2').text(baseSymbol + '0');
  $('#conversionInput').val('');
  $('#conversionInput2').val('');

  var baseCurrency_iso = baseResult.data[0].annotations.currency.iso_code;
  var selectedCurrency_iso = selectedResult.data[0].annotations.currency.iso_code;

  $('#currencyName').text(`Currency name: ${selectedResult.data[0].annotations.currency.name}`)
  $('#symbol').html(`Symbol: ${selectedSymbol}`)
  $('#code').text(`Currency code: ${selectedCurrency_iso}`)
  $('#conversion').html(`Conversion rate: ${baseSymbol}1 is ${selectedSymbol + currencyData.data[selectedCurrency_iso]}`)
  
  $('label[for="conversionInput"]').text(`${baseCurrency_iso} to ${selectedCurrency_iso}`);
  $('label[for="conversionInput2"]').text(`${selectedCurrency_iso} to ${baseCurrency_iso}`);

  var convertedResult = ''

  $('#conversionInput').on('input', async function() {
    var amount = $(this).val();
    if(amount){
      
      convertedResult = await fetchResultFromPhp('php/convertCurrency.php', {from: baseCurrency_iso, to: selectedCurrency_iso, amount: amount});
      $('#currencyResult').text(selectedSymbol + convertedResult.data);
      console.log(convertedResult)
    } else {
      $('#currencyResult').text(selectedSymbol + '0');
    }
    
  });

  $('#conversionInput2').on('input', async function() {
    var amount = $(this).val();
    if(amount){
      var convertedResult2 = await fetchResultFromPhp('php/convertCurrency.php', {from: selectedCurrency_iso, to: baseCurrency_iso, amount: amount});
      $('#currencyResult2').text(baseSymbol + convertedResult2.data);
    } else {
      $('#currencyResult2').text(baseSymbol + '0');
    }
  });
}

//Convert date to dayName
function convertDateToDayName(date){
  var dateObj = new Date(date);
  var dayName = dateObj.toLocaleString('en-us', { weekday: 'short' });
  return dayName;
}

//Convert time to am and pm format
function convertTimeToAMPM(time) {
  var hour = parseInt(time.split(":")[0]);

  if (hour === 0) {
    return "12am";
  } else if (hour === 12) {
    return "12pm";
  } else if (hour < 12) {
    return hour + "am";
  } else {
    return (hour - 12) + "pm";
  }
}


//Feature group
async function featureGroupFun(featureGroup, markerClusterGroup, countryData, map, lat, lng){
  try{

    var countryName = countryData.data[0].components.country;
    var countryCode = countryData.data[0].components.country_code.toUpperCase();

    // Style the county boundary
    var countyBoundaryStyle = {
      color: 'red',
      weight: 2,
      opacity: 0.8,
    };

    var customIcon = L.icon({
      iconUrl: 'library.png',
      iconSize: [32, 32], // [width, height]
      iconAnchor: [16, 32], // The point of the icon that corresponds to the marker's geographical location
      popupAnchor: [0, -32] // The point from which the popup should open relative to the iconAnchor
    });


    $.getJSON('php/getCountryBoundaries.php', { countryName: countryName })
      .then(function(data) {
        return new Promise(function(resolve) {
          resolve(data);
        });
      })
      .then(function(data) {
        var geojsonLayer = L.geoJSON(data.data, {
          style: countyBoundaryStyle
        });
        featureGroup.addLayer(geojsonLayer);
      })
      .catch(function(error) {
        console.error('Error fetching GeoJSON data:', error);
      });


  var markerPositions = [];
  var markers = [];

  var results = await fetchResultFromPhp('php/wikiCountry.php', {countryName: countryName}); 
  
  results.data.forEach(result => {
    if(result.countryCode === countryCode){
      console.log(result)
      var arr = [result.lat, result.lng, result.title, result.summary, result.wikipediaUrl];
      markerPositions.push(arr); 
    }
  });

  markerPositions.forEach(function(position) {
    var marker = L.marker([position[0], position[1]], { icon: customIcon });

    var title = position[2];
    var message = position[3];
    var wikipediaUrl = position[4];

    marker.bindPopup(`<h3>${title}</h3><p>${message}</p><a href="${wikipediaUrl}" target="_blank">More Info</a>`);

    markers.push(marker);
  });

  var markerClusterGroup = L.markerClusterGroup();

  markerClusterGroup.addLayers(markers);
  map.addLayer(markerClusterGroup);

  map.addLayer(featureGroup)

  var bounds = markerClusterGroup.getBounds();
  map.fitBounds(bounds);

  $('#preloader').hide();
    
  } catch(error){
    console.log('Error:', error);
  }
}

function fetchResultFromPhp(fileName, data){
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: fileName,
      type: 'GET',
      dataType: 'json',
      data: data,
      success: function(result) {
        resolve(result);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        reject(errorThrown);
      }
    });
    
  });
}