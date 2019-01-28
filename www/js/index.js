
$(function(){
    // Events
    $("#ddlCountries").on('change', function(){
        var selectedValue = this.value;
        getCountryDetails(selectedValue);
        getRegions(selectedValue);
    });
    
    $("#ddlRegions").on('change', function(){
        var countryWikiDataId = $("#ddlCountries").val();
        var selectedValue = this.value;
        getRegionDetails(countryWikiDataId, selectedValue);
        // getCities(countryWikiDataId, selectedValue);
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
            $("#txtRegionCapital").text(result.data.capital);
            if(result.data.numCities > 0){
                getCities(countryWikiDataId, regionIsoCode);
            }else{
                $("#ddlCitiesContent").css("display", "none");
                $("#ddlCities").empty();
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
                    option.value = city.city;
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

function sortSelectOptions(selectElement) {
	var options = $(selectElement + " option");

	options.sort(function(a,b) {
		if (a.text.toUpperCase() > b.text.toUpperCase()) return 1;
		else if (a.text.toUpperCase() < b.text.toUpperCase()) return -1;
		else return 0;
	});

	$(selectElement).empty().append(options);
}
