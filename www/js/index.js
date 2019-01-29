
$(function(){
    // Events
    $("#ddlCountries").on('change', function(){        
        // Clean Country details, Regions section and Cities section
        $("#mainCountryContent").css("display", "none");
        $("#ddlRegionsContent").css("display", "none");
        $("#ddlRegions").empty();
        $("#mainRegionContent").css("display", "none");
        $("#alertCities").css("display", "none");
        $("#ddlCitiesContent").css("display", "none");
        $("#ddlCities").empty();
        $("#mainCityContent").css("display", "none");

        var selectedValue = this.value;
        getCountryDetails(selectedValue);
        getRegions(selectedValue);
    });
    
    $("#ddlRegions").on('change', function(){
        // Clean Region details and Cities section
        $("#mainRegionContent").css("display", "none");
        $("#alertCities").css("display", "none");
        $("#ddlCitiesContent").css("display", "none");
        $("#ddlCities").empty();
        $("#mainCityContent").css("display", "none");

        var countryWikiDataId = $("#ddlCountries").val();
        var selectedValue = this.value;
        getRegionDetails(countryWikiDataId, selectedValue);
        // getCities(countryWikiDataId, selectedValue);
    });

    $("#ddlCities").on('change', function(){
        // Clean City details
        $("#alertCities").css("display", "none");
        $("#mainCityContent").css("display", "none");

        var selectedValue = this.value;
        getCityDetails(selectedValue);
    });

    getAllCountries();

});

var getAllCountries = function(){
    $.ajax({
        url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/countries?limit=200',
        type: "GET",
        headers: {
            'X-RapidAPI-Key': 'f2f3fe7fc6msh7d3b7d213e65ea9p1254d9jsn6802cfa460ed'
        },
        success: function(result){
            console.log("SUCCESS - getCountries");
            console.log(result);
            var ddlCountries = $("#ddlCountries");
            result.data.map(function(country, index){
                var option = document.createElement('option');
                option.value = country.wikiDataId;
                option.setAttribute('wikiDataId', country.wikiDataId);
                option.setAttribute('code', country.code);
                option.setAttribute('name', country.name);
                option.text = country.name;
                ddlCountries.append(option);
            });
            sortSelectOptions("#ddlCountries");
            var selectOption = document.createElement('option');
            selectOption.text = "Select a country...";
            ddlCountries.prepend(selectOption);
            ddlCountries.val($("#ddlCountries option:first").val());
        },
        error: function(error){
            console.log("ERROR - getCountries");
            console.log(error);
        }
    });
}

var getCountryDetails = function(countryWikiDataId){
    $.ajax({
        url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/countries/' + countryWikiDataId,
        type: "GET",
        headers: {
            'X-RapidAPI-Key': 'f2f3fe7fc6msh7d3b7d213e65ea9p1254d9jsn6802cfa460ed'
        },
        success: function(result){
            console.log("SUCCESS - getCountryDetails");
            console.log(result);
            $("#txtCountryName").text(result.data.name);
            $("#txtCountryCurrency").text(result.data.currencyCodes[0]);
            $("#imgCountryFlag").attr('src', result.data.flagImageUri);
            $("#mainCountryContent").css("display", "block");
        },
        error: function(error){
            console.log("ERROR - getCountryDetails");
            console.log(error);
        }
    });
}

var getRegions = function(countryWikiDataId){
    // Regions can be states, provinces, districts, or otherwise major political divisions.
    $.ajax({
        url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/countries/' + countryWikiDataId + '/regions?limit=200',
        type: "GET",
        headers: {
            'X-RapidAPI-Key': 'f2f3fe7fc6msh7d3b7d213e65ea9p1254d9jsn6802cfa460ed'
        },
        success: function(result){
            console.log("SUCCESS - getRegions");
            console.log(result);
            var ddlRegions = $("#ddlRegions");
            result.data.map(function(region, index){
                var option = document.createElement('option');
                option.value = region.isoCode;
                option.setAttribute('wikiDataId', region.wikiDataId);
                option.setAttribute('countryCode', region.countryCode);
                option.setAttribute('name', region.name);
                option.setAttribute('fipsCode', region.fipsCode);
                option.setAttribute('isoCode', region.isoCode);
                option.text = region.name;
                ddlRegions.append(option);
            });
            sortSelectOptions("#ddlRegions");
            var selectOption = document.createElement('option');
            selectOption.text = "Select a region...";
            ddlRegions.prepend(selectOption);
            ddlRegions.val($("#ddlRegions option:first").val());
            $("#ddlRegionsContent").css("display", "block");
        },
        error: function(error){
            console.log("ERROR - getRegions");
            console.log(error);
        }
    });
}

var getRegionDetails = function(countryWikiDataId, regionIsoCode){
    $.ajax({
        url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/countries/' + countryWikiDataId + '/regions/' + regionIsoCode,
        type: "GET",
        headers: {
            'X-RapidAPI-Key': 'f2f3fe7fc6msh7d3b7d213e65ea9p1254d9jsn6802cfa460ed'
        },
        success: function(result){
            console.log("SUCCESS - getRegionDetails");
            console.log(result);
            $("#txtRegionName").text(result.data.name);
            if(result.data.capital != null && result.data.capital != String.empty){
                $("#txtContentCapital").css("display", "block");
                $("#txtRegionCapital").text(result.data.capital);
            }else{
                $("#txtContentCapital").css("display", "none");
            }

            if(result.data.numCities > 0){
                $("#alertCities").css("display", "none");
                getCities(countryWikiDataId, regionIsoCode);
            }else{
                $("#ddlCitiesContent").css("display", "none");
                $("#ddlCities").empty();
                $("#alertCities").css("display", "block");
            }
            $("#mainRegionContent").css("display", "block");
        },
        error: function(error){
            console.log("ERROR - getRegionDetails");
            console.log(error);
        }
    });
}

var getCities = function(countryWikiDataId, regionIsoCode){
    $.ajax({
        url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/countries/' + countryWikiDataId + '/regions/' + regionIsoCode + '/cities?limit=2000',
        type: "GET",
        headers: {
            'X-RapidAPI-Key': 'f2f3fe7fc6msh7d3b7d213e65ea9p1254d9jsn6802cfa460ed'
        },
        success: function(result){
            console.log("SUCCESS - getCities");
            console.log(result);
            var ddlCities = $("#ddlCities");
            result.data.map(function(city, index){
                if(city.type === 'CITY'){
                    var option = document.createElement('option');
                    option.value = city.id;
                    option.setAttribute('wikiDataId', city.wikiDataId);
                    option.setAttribute('id', city.id);
                    option.setAttribute('city', city.city);
                    option.setAttribute('latitude', city.latitude);
                    option.setAttribute('longitude', city.longitude);
                    option.text = city.city;
                    ddlCities.append(option);
                }                
            });
            sortSelectOptions("#ddlCities");
            var selectOption = document.createElement('option');
            selectOption.text = "Select a city...";
            ddlCities.prepend(selectOption);
            ddlCities.val($("#ddlCities option:first").val());
            $("#ddlCitiesContent").css("display", "block");
        },
        error: function(error){
            console.log("ERROR - getCities");
            console.log(error);
        }
    });
}

var getCityDetails = function(cityId){
    $.ajax({
        url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities/' + cityId,
        type: "GET",
        headers: {
            'X-RapidAPI-Key': 'f2f3fe7fc6msh7d3b7d213e65ea9p1254d9jsn6802cfa460ed'
        },
        success: function(result){
            console.log("SUCCESS - getCityDetails");
            console.log(result);
            $("#txtCityName").text(result.data.city);
            $("#txtCityPopulation").text(result.data.population);
            $("#mainCityContent").css("display", "block");
            if(result.data.latitude != null && result.data.latitude != String.empty && result.data.longitude != null && result.data.longitude != String.empty){
                generateMap(result.data.city, result.data.latitude, result.data.longitude);
            }
        },
        error: function(error){
            console.log("ERROR - getCityDetails");
            console.log(error);
        }
    });
}

var generateMap = function(city, latitude, longitude){
    plugin.google.maps.environment.setEnv({
        'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyDlzyO-toLGDNiXPgkWC3GEgv_4OaOMjjY',
        'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyDlzyO-toLGDNiXPgkWC3GEgv_4OaOMjjY'
    });

    var coords = {"lat": latitude, "lng": longitude};
    var mapCanvas = document.getElementById("mapCanvas");

    var map = plugin.google.maps.Map.getMap(mapCanvas, {
        'camera': {
            'latLng': coords,
            'zoom': 10
        }
    });

    map.clear();

    map.moveCamera({
        target: coords,
        zoom: 10
    });

    map.addMarker({
        'position': coords,
        'title': city
    }, function(marker) {    
        marker.showInfoWindow();    
    });
}

function sortSelectOptions(selectElement) {
	var options = $(selectElement + " option");

	options.sort(function(a,b) {
		if (a.text.toUpperCase() > b.text.toUpperCase()) return 1;
		else if (a.text.toUpperCase() < b.text.toUpperCase()) return -1;
		else return 0;
	});

	$(selectElement).empty().append(options);
}
