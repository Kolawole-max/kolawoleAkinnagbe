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
          value: data.iso_a2, 
          text: data.name
        });
        $('#countrySelectButton').append(newOption);
      });
    }).catch(function(error) {
      console.error(error);
    }); 

    var streets = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    });

    var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    
    var basemaps = {
      "Streets": streets,
      "Satellite": satellite
    };

    var map = L.map('map', {
      layers: [streets]
    }).setView([54.5, -4], 6);

    var airports = L.markerClusterGroup({
      polygonOptions: {
        fillColor: '#fff',
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
      }
    }).addTo(map);

    var cities = L.markerClusterGroup({
      polygonOptions: {
        fillColor: '#fff',
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
      }
    }).addTo(map);

    var overlays = {
      "Airports": airports,
      "Cities": cities
    };

    var layerControl = L.control.layers(basemaps, overlays).addTo(map);

    var featureGroup = L.featureGroup();
    var baseResult = null;
    $('#countryInfoModal').modal('show');

    if (!navigator.geolocation) {
      
      // Geolocation is not supported
      $('#preloader').hide();
    } else {
      // Geolocation is supported
      navigator.geolocation.getCurrentPosition(
        async function (position) {
          // Get latitude and longitude
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;

          //Fetch country name using lat and lng
          baseResult = await fetchResultFromPhp('php/getCountryInfo.php', {lat:lat, lng: lng});

          var iso = baseResult.data[0].components['ISO_3166-1_alpha-2'];

          $('#countrySelectButton option').each(function(index, option) {
            var value = $(option).val();
            if(value === iso){
              $(option).prop('selected', true);
            }
          });
    
          featureGroupFun(featureGroup, baseResult, map, airports, cities);

          var buttonConfigs = [
            {
              id: 'countryInfoButton',
              icon: "fa-info fa-lg",
              onClick: function() {
                $('#countryInfoModal').modal('show');
              }
            },
            {
              id: 'weatherInfoButton',
              icon: 'fa-solid fa-sun',
              onClick: function() {
                $('#weatherInfoModal').modal('show');
              }
            },
            {
              id: 'currencyButton',
              icon: 'fa-solid fa-dollar-sign',
              onClick: function() {
                $('#currencyModal').modal('show');
              }
            },
            {
              id: 'newsButton',
              icon: 'fa-regular fa-newspaper',
              onClick: function() {
                $('#newsModal').modal('show');
              }
            },
            { 
              id: 'holidaysButton',
              icon: 'fa-regular fa-table',
              onClick: function() {
                $('#publicHoliday').modal('show');
              }
            }
          ];

          buttonConfigs.forEach(function(config) {
            L.easyButton({
              states: [
                {
                  stateName: config.id,
                  icon:  config.icon,
                  onClick: config.onClick
                }
              ]
            }).addTo(map);
          });

          var capitalResult = await fetchResultFromPhp('php/getCapital.php', {iso : iso});
          var capital = capitalResult.data[0].capital;

          countryInfo(baseResult, capital)

          var currentWeatherInfo = await fetchResultFromPhp('php/getCurrentWeather.php', {capital : capital});
          var hourlyForecast = await fetchResultFromPhp('php/getHourlyForecast.php', {capital : capital})
          var dailyForecast = await fetchResultFromPhp('php/getdaily.php', {capital : capital})          
          weather(capital, baseResult, currentWeatherInfo, hourlyForecast, dailyForecast);

          var currency_iso = baseResult.data[0].annotations.currency.iso_code;
          var currencyData = await fetchResultFromPhp('php/getCurrencyRate.php', {from: currency_iso, to: currency_iso});
          currency(currencyData, baseResult, baseResult);

          var currentYear = (new Date()).getFullYear();
          var holidayData = await fetchResultFromPhp('php/getHoliday.php', {year: currentYear, iso: iso})
          holiday(baseResult, holidayData)

          var newsData = await fetchResultFromPhp('php/getNews.php', {iso: iso});
          DisplayNews(baseResult, newsData);
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
      
      var selected_iso = $(this).val();
      var countryData = fetchResultFromPhp('php/getCountryInfo.php', {iso : selected_iso});

      countryData.then(async function(selectedResult) {

        featureGroup.clearLayers();
        airports.clearLayers();
        cities.clearLayers();
        featureGroupFun(featureGroup, selectedResult, map, airports, cities)

        var capitalResult = await fetchResultFromPhp('php/getCapital.php', {iso : selected_iso});
        var selectedCapital = capitalResult.data[0].capital;

        countryInfo(selectedResult, selectedCapital)
        $('#countryInfoModal').modal('show');

        var currentWeatherInfo = await fetchResultFromPhp('php/getCurrentWeather.php', {capital : selectedCapital});
        var hourlyForecast = await fetchResultFromPhp('php/getHourlyForecast.php', {capital : selectedCapital})
        var dailyForecast = await fetchResultFromPhp('php/getdaily.php', {capital : selectedCapital})          
        weather(selectedCapital, selectedResult, currentWeatherInfo, hourlyForecast, dailyForecast);

        var baseCurrency_iso = baseResult.data[0].annotations.currency.iso_code;
        var selectedCurrency_iso = selectedResult.data[0].annotations.currency.iso_code;
        var currencyData = await fetchResultFromPhp('php/getCurrencyRate.php', {from: baseCurrency_iso, to: selectedCurrency_iso});
        currency(currencyData, baseResult, selectedResult)

        var currentYear = (new Date()).getFullYear();
        var holidayData = await fetchResultFromPhp('php/getHoliday.php', {year: currentYear, iso: selected_iso})
        holiday(selectedResult, holidayData)

        var newsData = await fetchResultFromPhp('php/getNews.php', {iso: selected_iso});
        DisplayNews(selectedResult, newsData);

        //$('#preloader').hide();
      }).catch(function(error) {
        console.error(error.message);
      });  
    });
});

//Display news
function DisplayNews(result, newsData){
  $('#newsHeading').text(result.data[0].components.country)

  var news = newsData.data.map(function(result) {
    if(result.image_url){
    return `<table class="table table-borderless mb-0">       
            <tr>
              <td rowspan="2" width="50%">
                <img class="img-fluid rounded" src=${result.image_url} alt="" title="">
              </td>
              <td>
                <a href=${result.link} class="fw-bold fs-6 text-black" target="_blank">${result.title}</a>
              </td>
            </tr>
            <tr>          
              <td class="align-bottom pb-0">
                <p class="fw-light fs-6 mb-1">${result.source_id}</p>
              </td>
            </tr>
          </table> <hr> `
    }
  }).join('');
  $('#newsBody').append(news)
}

//Display holiday dates
function holiday(result, holidayData){
  $('#holidayBody').text('');
  var countryName = result.data[0].components.country;

  $('#holidayLabel').text(countryName)

  var date = holidayData.data.map(function(result) {
    var parts = result.date.split("-");
    var year = parts[0];
    var month = parts[1];
    var day = parts[2];

    var convertedDateString = day + "-" + month + "-" + year;

    return `<tr>
              <td>${result.name}</td>
              <td>${convertedDateString}</td>
            </tr>`;
    
  }).join('');
  
  $('#holidayBody').append(date);
}


//Display country info
function countryInfo(result, capital){
  $('#preloader').show();

  var countryName = result.data[0].components.country;
  var flag = result.data[0].components.country_code.toUpperCase();

  $('#countryLabel').text(countryName)
  $('#countryImg').attr('src', `https://flagsapi.com/` + flag + `/shiny/64.png`)

  var currencySymbolEntity = result.data[0].annotations.currency.symbol;

  $("#capitalName").text(capital);
  $("#continent").text(result.data[0].components.continent);
  $("#countryCode").text(result.data[0].components.country_code);
  $("#countryInfoCurrencyName").text(result.data[0].annotations.currency.name);
  $("#driveOn").text(result.data[0].annotations.roadinfo.drive_on);
  $("#currencySymbol").html(currencySymbolEntity); 
  
  //$('#countryInfoModal').modal('show');

  $('#preloader').hide();
}

//Display weather info
function weather(capital, result, currentWeatherInfo, hourlyForecast, dailyForecast){

  var countryName = result.data[0].components.country;

  var dailyContainer = $('#dailyContainer');
  dailyContainer.text('');

  var hourlyContainer = $('#hourly');
  hourlyContainer.text('');

  $('#weatherInfoLabel').text(`${capital}, ${countryName}`)

  $('#currentImg').attr('src', `https://openweathermap.org/img/wn/${currentWeatherInfo.data.weather[0].icon}.png`)

  $('#description').text(currentWeatherInfo.data.weather[0].description);
  $('#temp').text(`${Math.ceil(currentWeatherInfo.data.main.temp)}\u00B0C`);
  $('#feels_like').text(`${Math.ceil(currentWeatherInfo.data.main.feels_like)}\u00B0C`);

  var limitedHourly = hourlyForecast.data.slice(0, 4);
  var limitedDaily = dailyForecast.data.slice(1, 5);

  var hourlyCards = limitedHourly.map(function(data) {
      return `<div class="col p-1 ps-0">
                  <div class="card mb-3 text-center">
                    <h5>${convertTimeToAMPM(data.dt_txt.split(" ")[1])}</h5>
                    <div class="card-body text-truncate text-center">
                      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" class="img-fluid rounded-start" alt="...">
                      <p class="card-text">${Math.ceil(data.main.temp)}\u00B0C</p>
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
                  <div class="text-wrap text-center" style="white-space: nowrap;">${Math.ceil(data.max_temp)} - ${Math.ceil(data.min_temp)}\u00B0C</div>
                </div>
              </div>`;
    
  }).join('');
  
  dailyContainer.append(dailyCards);
}

//conver to 2 decimal number
function convertToDecimal(number){
  var roundedNumber = Math.ceil(number * 100) / 100;
  return roundedNumber.toFixed(2);
}

//Display currency det and converter
async function currency(currencyData, baseResult, selectedResult){

  var selectedSymbol = selectedResult.data[0].annotations.currency.symbol;
  var baseSymbol = baseResult.data[0].annotations.currency.symbol;

  $('#currencyResult').text(selectedSymbol + '0');
  $('#conversionInput').val('');

  var baseCurrency_iso = baseResult.data[0].annotations.currency.iso_code;
  var selectedCurrency_iso = selectedResult.data[0].annotations.currency.iso_code;

  $('#currencyName').text(`Currency name: ${selectedResult.data[0].annotations.currency.name}`)
  $('#symbol').html(`Symbol: ${selectedSymbol}`)
  $('#code').text(`Currency code: ${selectedCurrency_iso}`)
  $('#conversion').html(`Conversion rate: ${baseSymbol}1 is ${selectedSymbol + convertToDecimal(currencyData.data[selectedCurrency_iso])}`)
  
  $('label[for="conversionInput"]').text(`${baseSymbol} to ${selectedSymbol}`);

  var convertedResult = ''

  $('#conversionInput').on('input', async function() {
    var amount = $(this).val();
    if(amount){
      convertedResult = await fetchResultFromPhp('php/convertCurrency.php', {from: baseCurrency_iso, to: selectedCurrency_iso, amount: amount});
      $('#currencyResult').text(selectedSymbol + convertToDecimal(convertedResult.data));
    } else {
      $('#currencyResult').text(selectedSymbol + '0');
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
async function featureGroupFun(featureGroup, countryData, map, airports, cities){
  try{

    //var countryName = countryData.data[0].components.country;
    var countryCode = countryData.data[0].components.country_code.toUpperCase();
    var iso = countryData.data[0].components['ISO_3166-1_alpha-2'];

    // Style the county boundary
    var countyBoundaryStyle = {
      color: 'red',
      weight: 2,
      opacity: 0.8,
    };

    var airportIcon = L.ExtraMarkers.icon({
      prefix: 'fa',
      icon: 'fa-plane',
      iconColor: 'black',
      markerColor: 'white',
      shape: 'square'
    });
    
    var cityIcon = L.ExtraMarkers.icon({
      prefix: 'fa',
      icon: 'fa-city',
      markerColor: 'green',
      shape: 'square'
    });


    $.getJSON('php/getCountryBoundaries.php', { iso: iso })
    .then(function(data) {
      return new Promise(function(resolve) {
        resolve(data);
      });
    })
    .then(async function(data) {
      var geojsonLayer = L.geoJSON(data.data, {
        style: countyBoundaryStyle
      });
      featureGroup.addLayer(geojsonLayer);

      map.fitBounds(geojsonLayer.getBounds())

      // var isInside = false;
      // if (featureGroup.getLayers().length > 0) {
        
      //   featureGroup.eachLayer(function(layer) {
      //     var layerGeoJSON = layer.toGeoJSON();
      //     var pt = turf.point([-77, 44]);

      //     // Check if the point is inside the current layer's geometry
      //     if (layerGeoJSON.geometry) {
      //       console.log(layerGeoJSON)
      //       if (layerGeoJSON.geometry.type === 'Polygon') {
      //         if (turf.booleanPointInPolygon(pt, layerGeoJSON)) {
      //           isInside = true;
      //         }
      //       } else if (layerGeoJSON.geometry.type === 'MultiPolygon') {
      //         layerGeoJSON.geometry.coordinates.forEach(function(polygon) {
      //           if (turf.booleanPointInPolygon(pt, turf.polygon(polygon))) {
      //             console.log(polygon)
      //             isInside = true;
      //           }
      //         });
      //       }
      //     }
      //   });
      // }

      //console.log('Is the point inside the MultiPolygon?', isInside);
      

      var wikiResults = await fetchResultFromPhp('php/wikiCountry.php', {iso: iso});
      wikiResults.data.forEach(result => {
        L.marker([result.lat, result.lng], {icon: cityIcon})
                .bindPopup(`<h5>${result.title}</h5><p>${result.summary}</p><a href="${result.wikipediaUrl}" target="_blank">More Info</a>`)
                .addTo(cities);
                
      });
  
      var airportResult = await fetchResultFromPhp('php/getAirports.php', {iso: iso})
  
      airportResult.data.forEach(result => {
        L.marker([result.lat, result.lng], {icon: airportIcon})
          .bindTooltip(result.name, {direction: 'top', sticky: true})
          .addTo(airports);
      });


    })
    .catch(function(error) {
      console.error('Error fetching GeoJSON data:', error.message);
    });

    map.addLayer(featureGroup)

    $('#preloader').hide();
    
  } catch(error){
    console.log('Error:', error.message);
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