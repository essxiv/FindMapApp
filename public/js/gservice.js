angular.module('gservice', [])
.factory('gservice', function($rootScope, $http) {

    var googleMapService = {}
    googleMapService.clickLat = 0
    googleMapService.clickLong = 0

    var locations = []
    var selectedLat = 34.043370
    var selectedLong = -118.264827

    googleMapService.refresh = function(latitude, longitude) {
        locations = []
        selectedLat = latitude
        selectedLong = longitude

        $http({
            method: 'GET',
            url: '/users'
        }).then(function(success) {
            locations = convertToMapPoints(success)
            initialize(latitude, longitude)
        }).catch(function(error){
            console.log(error)
        })
    }

    var convertToMapPoints = function(response) {
        var locations = []

        for (var i = 0; i < response.length; i++) {
            var user = response[i]

            var  contentString =
                '<p><b>Username</b>: ' + user.username +
                '<br><b>Age</b>: ' + user.age +
                '<br><b>Gender</b>: ' + user.gender +
                '<br><b>Favorite Language</b>: ' + user.favlang +
                '</p>'

            locations.push({
                latlon: new google.maps.LatLng(user.location[i], user.location[0]),
                message: new google.maps.InfoWindow({
                    content: contentString,
                    maxWidth: 320
                }),
                username: user.username,
                gender: user.gender,
                age: user.age,
                favlang: user.favlang
            })
        }
        return locations
    }

    var initialize = function(latitude, longitude) {
        var myLatLng = { lat: selectedLat, lng: selectedLong }

        if (!map) {
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 3,
                center: myLatLng
            })
        }

        locations.forEach(function(n, i) {
            var marker = new google.maps.Marker({
                position: n.latlon,
                map: map,
                title: "Big Map",
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            })

            google.maps.event.addListener(marker, 'click', function(e) {
                currentSelectedMarker = n
                n.message.open(map, marker)
            })
        })

        var initialLocation = new google.maps.LatLng(latitude, longitude)
        var marker = new google.maps.Marker({
            position: initialLocation,
            animation: google.maps.Animation.BOUNCE,
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        })
        lastMarker = marker

        map.panTo(new google.maps.LatLng(latitude, longitude))

        google.maps.event.addListener(map, 'click', function(e) {
            var marker = new google.maps.Marker({
                position: e.latLng,
                animation: google.maps.Animation.BOUNCE,
                map: map,
                icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            })

            if (lastMarker) {
                lastMarker.setMap(null)
            }

            lastMarker = marker
            map.panTo(marker.position)
            googleMapService.clickLat = marker.getPosition().lat()
            googleMapService.clickLong = marker.getPosition().lng()
            $rootScope.$broadcast('clicked')
        })
    }

    google.maps.event.addDomListener(window, 'load', googleMapService.refresh(selectedLat, selectedLong))

    return googleMapService
})
