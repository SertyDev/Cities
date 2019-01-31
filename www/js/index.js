
function onDeviceReady() {
    document.removeEventListener('deviceready', onDeviceReady, false);

    // Set AdMobAds options:
    admob.setOptions({
        publisherId: "ca-app-pub-1591850117134901~2445809522",
        interstitialAdId: "ca-app-pub-1591850117134901/3291400607",
        bannerAtTop: false,
        isTesting: true,
        autoShowBanner: true
    });

    admob.createBannerView();

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
    });

    $("#ddlCities").on('change', function(){
        // Clean City details
        $("#alertCities").css("display", "none");
        $("#mainCityContent").css("display", "none");

        var selectedValue = this.value;
        getCityDetails(selectedValue);
    });

    getAllCountries();

}

document.addEventListener("deviceready", onDeviceReady, false);

function getAllCountries(){
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

function getCountryDetails(countryWikiDataId){
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

function getRegions(countryWikiDataId){
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

function getRegionDetails(countryWikiDataId, regionIsoCode){
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

function getCities(countryWikiDataId, regionIsoCode){
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

function getCityDetails(cityId){
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
            getCityDateTime(cityId);
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

function getCityDateTime(cityId){
    $.ajax({
        url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities/' + cityId + '/dateTime',
        type: "GET",
        headers: {
            'X-RapidAPI-Key': 'f2f3fe7fc6msh7d3b7d213e65ea9p1254d9jsn6802cfa460ed'
        },
        success: function(result){
            console.log("SUCCESS - getCityDateTime");
            console.log(result);
            var isoDateTime = result.data;
            var date = isoDateTime.split('T')[0];
            var time = isoDateTime.split('T')[1].split('.')[0];
            $("#txtCityDate").text(date);
            $("#txtCityTime").text(time);
        },
        error: function(error){
            console.log("ERROR - getCityDateTime");
            console.log(error);
        }
    });
}

function generateMap(city, latitude, longitude){
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

    // $("body").css("cssText", "background-color: #FFC04C !important;");
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
