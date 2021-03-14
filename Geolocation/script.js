var map;
var latitude;
var longitude;
var service;

if(navigator.geolocation) { // uspesno prezemena korisnicka lokacija
    navigator.geolocation.getCurrentPosition(function (position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        initialize();
    }, function () {
        handle_geolocation_error("Geolokaciskite servisi se onevozmozeni za pronaogjanje apteki/bolnici blizu vas. Ve molime odobrete prezemanje vasa lokacija."); // browserot poddrzuva geolokacija, ama korisnikot ne go odobril toa
    });
}
else { // browserot ne poddrzuva geolokacija
    handle_geolocation_error("Vasiot prelistuvac ne poddrzuva geolokaciski servisi. Ve molime promenete go vasiot momentalen prelistuvac za ovozmozuvanje na geolokaciskite servisi.");
}

function handle_geolocation_error(error_msg) {
    var error_pos = new google.maps.LatLng(41.9981, 21.4254);

    map = new google.maps.Map(document.getElementById("map"), {
        center: error_pos,
        zoom: 8
    });

    var error_infoWindow = new google.maps.InfoWindow({
        position: error_pos,
        content: error_msg
    });

    error_infoWindow.open(map);
}

//=================================================================================

function initialize() {
    var center = new google.maps.LatLng(latitude, longitude);

    map = new google.maps.Map(document.getElementById("map"), {
        center: center,
        zoom: 14
    });

    //=========USER VISUALIZATION=========//

    var USER_MARKER = new google.maps.Marker({
        position: {lat: latitude, lng: longitude},
        map: map,
        icon: "icon.png"
    });

    var USER_INFO = new google.maps.InfoWindow({
       content: "<h3>ЈАС</h3>"
    });

    USER_MARKER.addListener("click", function () {
       USER_INFO.open(map, USER_MARKER); // na dadenata mapa, na dadeniot marker, prikazi go infoto
    });

    //====================================//

    var request_hospitals = {
        location: center,
        radius: 2000,
        type: ['hospital']
    };

    var request_pharmacies = {
        location: center,
        radius: 2000,
        type: ['pharmacy']
    };

    service = new google.maps.places.PlacesService(map);

    service.nearbySearch(request_hospitals, hospitals_callback); // pronajdi mesta, prati gi kako rezultati i status vo callback funkcija za proverka
    service.nearbySearch(request_pharmacies, pharmacies_callback);
}

//=========PLACE VISUALIZATION=========//

async function hospitals_callback(results, status) {
    if(status == google.maps.places.PlacesServiceStatus.OK) { // ako se e vo red, kreiraj markeri za sekoja lokacija
        for(var i = 0; i<results.length; i++) {
            create_hospital_markers(results[i], "hospital.png"); // results[i] e JSON fajl za sekoe mesto
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}
async function pharmacies_callback(results, status) {
    if(status == google.maps.places.PlacesServiceStatus.OK) {
        for(var i = 0; i<results.length; i++) {
            create_pharmacy_markers(results[i], "pharmacy.png");
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

function create_hospital_markers(place, icon) {
    if(place.hasOwnProperty("opening_hours")) {
        var request = {
            placeId: place.place_id,
            fields: ['opening_hours', 'utc_offset_minutes', 'geometry', 'name', 'vicinity']
        };

        service.getDetails(request, check_callback_hospitals);
    }
    else {
        var placeLocation = place.geometry.location; // zemi ja lokacijata na soodvetnoto mesto preku geometry objektot od JSON fajlot

        var PLACE_MARKER = new google.maps.Marker({
            position: placeLocation,
            map: map,
            icon: icon
        });

        var PLACE_INFO = new google.maps.InfoWindow({
            content: "<h2>" + place.name + "<br>" + place.vicinity + "</h2>"
        });

        PLACE_MARKER.addListener("click", function () {
            PLACE_INFO.open(map, PLACE_MARKER);
        });
    }
}

async function create_pharmacy_markers(place, icon) {
    if(place.hasOwnProperty("opening_hours")) {
        var request = {
            placeId: place.place_id,
            fields: ['opening_hours','utc_offset_minutes', 'geometry', 'name', 'vicinity']
        };

        service.getDetails(request, check_callback_pharmacies);
    }
    else {
        var placeLocation = place.geometry.location; // zemi ja lokacijata na soodvetnoto mesto preku geometry objektot od JSON fajlot

        var PLACE_MARKER = new google.maps.Marker({
            position: placeLocation,
            map: map,
            icon: icon
        });

        var PLACE_INFO = new google.maps.InfoWindow({
            content: "<h2>" + place.name + "<br>" + place.vicinity + "</h2>"
        });

        PLACE_MARKER.addListener("click", function () {
            PLACE_INFO.open(map, PLACE_MARKER);
        });
    }
}

function check_callback_hospitals(result, status) {
    if(status == google.maps.places.PlacesServiceStatus.OK) {
        var is_open = "";
        var placeLocation = result.geometry.location; // zemi ja lokacijata na soodvetnoto mesto preku geometry objektot od JSON fajlot

        var PLACE_MARKER = new google.maps.Marker({
            position: placeLocation,
            map: map,
            icon: "hospital.png"
        });

        const isOpenNow = result.opening_hours.isOpen();

        if(isOpenNow == true) {
            is_open = "<h2 style='color: green'>Отворено</h2>";
        }
        else {
            is_open = "<h2 style='color: red'>Затворено</h2>";
        }

        var PLACE_INFO = new google.maps.InfoWindow({
            content: "<h2>" + result.name + "<br>" + result.vicinity + "<br>" + is_open + "</h2>"
        });

        PLACE_MARKER.addListener("click", function () {
            PLACE_INFO.open(map, PLACE_MARKER);
        });
    }
    else {
        console.log("QUERY LIMIT EXCEEDED ->" + status);
    }
}

function check_callback_pharmacies(result, status) {
    if(status == google.maps.places.PlacesServiceStatus.OK) {
        var is_open = "";
        var placeLocation = result.geometry.location; // zemi ja lokacijata na soodvetnoto mesto preku geometry objektot od JSON fajlot

        var PLACE_MARKER = new google.maps.Marker({
            position: placeLocation,
            map: map,
            icon: "pharmacy.png"
        });

        const isOpenNow = result.opening_hours.isOpen();

        if(isOpenNow == true) {
            is_open = "<h2 style='color: green'>Отворено</h2>";
        }
        else {
            is_open = "<h2 style='color: red'>Затворено</h2>";
        }

        var PLACE_INFO = new google.maps.InfoWindow({
            content: "<h2>" + result.name + "<br>" + result.vicinity + "<br>" + is_open + "</h2>"
        });

        PLACE_MARKER.addListener("click", function () {
            PLACE_INFO.open(map, PLACE_MARKER);
        });
    }
    else {
        console.log("QUERY LIMIT EXCEEDED ->" + status);
    }
}

//====================================//