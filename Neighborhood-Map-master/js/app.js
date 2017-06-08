"use strict";

//Error handling - checks if Google Maps has loaded
if (!window.google || !window.google.maps){
	$('#map-container').text('Error: Google Maps data could not be loaded');
	$('#map-list').text('Error: Google Maps data could not be loaded');
}

// ----- MODEL -----

var markersModel = [
{
	title: "White Foam Cafe",
	category: "coffee",                         
	address: "2956 Ash Shaikh Abdullah Al Anqari, Salah Ad Din, 24.729777, 46.694475، Riyadh 12434", 
	phone: "011 470 8567",                  
	status: ko.observable("OK"),                    
	marker: new google.maps.Marker({               
		position: new google.maps.LatLng(0,0),          
		icon: "img/coffee.png"                 
	})
},
{
	title: "DR CAFE Coffee",
	category: "coffee",
	address: "Prince Sultan Bin Abdulaziz Rd, Al Olaya, Riyadh 13935",
	phone: "059 482 8363",
	status: ko.observable("OK"),
	marker: new google.maps.Marker({
		position: new google.maps.LatLng(0,0),
		icon: "img/coffee.png"
	})
},
{
	title: "French Bakery",
	category: "coffee",
	address: "Takhassusi St, Al Olaya, Riyadh 12331",
	phone: "011 464 1441",
	status: ko.observable("OK"),
	marker: new google.maps.Marker({
		position: new google.maps.LatLng(0,0),
		icon: "img/coffee.png"
	})
},
{
	title: "Bateel Cafe",
	category: "coffee",
	address: "Olaya St, Al Olaya, Riyadh 12213",
	phone: "050 558 6690",
	status: ko.observable("OK"),
	marker : new google.maps.Marker({
		position: new google.maps.LatLng(0,0),
		icon: "img/coffee.png"
	})
},
{
	title: "Capio Diem",
	category: "coffee",
	address: "13243 Khalid Ibn Al Walid St, Al Quds, Riyadh 13214",
	phone: "011 321 3211",
	status: ko.observable("OK"),
	marker : new google.maps.Marker({
		position: new google.maps.LatLng(0,0),
		icon: "img/coffee.png"
	})
},
{
	title: "Best coffee",
	category: "coffee",
	address: "Al Wisham, Riyadh 12735",
	phone: "054 367 3716",
	status: ko.observable("OK"),
	marker : new google.maps.Marker({
		position: new google.maps.LatLng(0,0),
		icon: "img/coffee.png"
	})
},
];
//---- VIEWMODEL ----

// Foursquare API Url parameters in global scope
var BaseUrl = "https://api.foursquare.com/v2/venues/",
fsClient_id = "XRSEP0C0TKGAHTTLWOOFIUY51ADVSQS1AI5P1JZWDFWMDK1E",
fsClient_secret = "43RMOGHZ1MZPU0ED0QH1Z3EP3VSCG04N3XE3BGHKKWUY25NI",
fsVersion = "&v=20161507";


var resultMarkers = function(members){
	var self = this;

	self.mapOptions = {
    center: new google.maps.LatLng(24.717151, 46.682448), //set map center in Riyadh
    zoom: 14
};

var mapCont = document.getElementsByClassName('map-container');

self.map = new google.maps.Map(mapCont[0], self.mapOptions);
  self.searchReq = ko.observable(''); //user input to Search box
  self.infowindow = new google.maps.InfoWindow({ maxWidth:250 });

  // Filtered version of data model, based on Search input
  self.filteredMarkers = ko.computed(function() {
    //Remove all markers from map
    var len = members.length;
    for (var i = 0; i < len; i++) {
    	members[i].marker.setMap(null);
    	clearTimeout(members[i].timer);
    }
    //Place only the markers that match search request
    var arrayResults = [];
    arrayResults =  $.grep(members, function(a) {
    	var titleSearch = a.title.toLowerCase().indexOf(self.searchReq().toLowerCase());
    	var catSearch = a.category.toLowerCase().indexOf(self.searchReq().toLowerCase());
    	return ((titleSearch > -1 || catSearch > -1) && a.status() === 'OK');
    });
    //Iterate through results, set animation timeout for each
    var len = arrayResults.length;
    for (var i = 0; i < len; i++){
    	(function f(){
    		var current = i;
    		var animTimer = setTimeout(function(){arrayResults[current].marker.setMap(self.map);}, i * 300);
    		arrayResults[current].timer = animTimer;
    	}());
    }
    //Return list of locations that match search request, for button list
    return arrayResults;
});

//Adds infowindows to each marker and populates them with Foursquare API request data
self.setBubble = function(index){
    //Add event listener to each map marker to trigger the corresponding infowindow on click
    google.maps.event.addListener(members[index].marker, 'click', function () {

      //Request Foursquare info, then format it, and place it in infowindow
      FoursquareRequest(members[index].phone, function(data){

      	var contentString = "<div id='Window'>" +
      	"<h5>" +  "<a href='" + data.mobile_url + "' target='_blank'>" +data.name + "</a>" + "</h5>" +
      	"<p>" + data.location.address + "</p>" +
      	"<p>" + data.display_phone + "</p>" +
      	"<img src='" + data.rating_img_url_large + "'>" +
      	"<p>" + data.snippet_text + "</p>" +
      	"</div>";
      	self.infowindow.setContent(contentString);
      });

      self.infowindow.open(self.map, members[index].marker);
  });
};

  //Use street address in model to find LatLng
  self.setPosition = function(location){
  	var geocoder = new google.maps.Geocoder();
    //use address to find LatLng with geocoder
    geocoder.geocode({ 'address': location.address }, function(results, status) {
    	if (status === 'OK'){
    		location.marker.position = results[0].geometry.location;
    		location.marker.setAnimation(google.maps.Animation.DROP);
    	} else if (status === 'OVER_QUERY_LIMIT'){
        console.log("in over limit"); // If status is OVER_QUERY_LIMIT, then wait and re-request
        setTimeout(function(){
        	geocoder.geocode({ 'address': location.address }, function(results, status) {
        		location.marker.position = results[0].geometry.location;
        		location.marker.setAnimation(google.maps.Animation.DROP);
        	});
        }, 2000);

    } else {
        //If status is any other error code, then set status to Error, which will remove it from list and map
        location.status('ERROR');
        console.log('Error code: ', status, 'for Location:', location.title);
    }
});
};

//Iterate through data model, get LatLng location then set up infowindow
  self.initialize = function(){
    for (var current in members){
      self.setPosition(members[current]);
      self.setBubble(current);
    }
  };

//Toggle bounce animation for map marker on click of Location list button (via data-binding)
self.toggleBounce = function(currentMarker) {
	if (currentMarker.marker.getAnimation() !== null) {
		currentMarker.marker.setAnimation(null);
	} else {
      self.map.setCenter(currentMarker.marker.position); //center map on bouncing marker
      currentMarker.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){currentMarker.marker.setAnimation(null);}, 2800); //bounce for 2800 ms
  }
};
};

var myMarkers = new resultMarkers(markersModel);
ko.applyBindings(myMarkers);
google.maps.event.addDomListener(window, 'load', myMarkers.initialize);
