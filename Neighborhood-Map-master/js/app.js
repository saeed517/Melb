//"use strict";

function googleError() {
  alert('Google Maps did not load');
}

// ----- MODEL -----

var markersModel = [{
  title: "White Foam Cafe",
  category: "coffee",
  address: "2956 Ash Shaikh Abdullah Al Anqari, Salah Ad Din, 24.729777, 46.694475، Riyadh 12434",
  phone: "011 470 8567",
  status: ko.observable("OK"),
  position: { lat:  24.729777, lng: 46.694475}
},
{
  title: "DR CAFE Coffee",
  category: "coffee",
  address: "Prince Sultan Bin Abdulaziz Rd, Al Olaya, Riyadh 13935",
  phone: "059 482 8363",
  status: ko.observable("OK"),
  position: { lat: 24.688984, lng: 46.685024}
},
{
  title: "French Bakery",
  category: "coffee",
  address: "Takhassusi St, Al Olaya, Riyadh 12331",
  phone: "011 464 1441",
  status: ko.observable("OK"),
  position: { lat: 24.695242, lng: 46.670388}
},
{
  title: "Bateel Cafe",
  category: "coffee",
  address: "Olaya St, Al Olaya, Riyadh 12213",
  phone: "050 558 6690",
  status: ko.observable("OK"),
  position: { lat: 24.700234, lng: 46.681920}
},
{
  title: "Capio Diem",
  category: "coffee",
  address: "13243 Khalid Ibn Al Walid St, Al Quds, Riyadh 13214",
  phone: "011 321 3211",
  status: ko.observable("OK"),
  position: { lat: 24.767499, lng: 46.759363}
},
];
//---- VIEWMODEL ----

// Foursquare API Url parameters in global scope
var BaseUrl = "https://api.foursquare.com/v2/venues/search",
fsClient_id = "XRSEP0C0TKGAHTTLWOOFIUY51ADVSQS1AI5P1JZWDFWMDK1E",
fsClient_secret = "43RMOGHZ1MZPU0ED0QH1Z3EP3VSCG04N3XE3BGHKKWUY25NI",
fsVersion = "20161507";


var ResultMarkers = function(members) {
  var self = this;

  self.myCafes = ko.observableArray(markersModel);

  var mapCont = document.getElementsByClassName('map-container');
  
  self.searchReq = ko.observable(''); //user input to Search box
  // use the self.searchReq() observable to filter the cafes observabeArray's cafe objects
  // http://w...content-available-to-author-only...t.net/2011/04/utility-functions-in-knockoutjs.html
  // http://o...content-available-to-author-only...l.org/2011/06/23/live-search-with-knockoutjs/
  // return a matching subset of cafe objects

  // Filtered version of data model, based on Search input
  self.filteredMarkers = ko.computed(function() {
    var filter = self.searchReq().toLowerCase();
    // if there is no filter
    if (!filter) {
      self.myCafes().forEach(function(marker){
        marker.status('true');
        if (marker.marker) {
          marker.marker.setVisible(true);
        }
      });
      return self.myCafes();

    // if there is a filter
  } else {
    return ko.utils.arrayFilter(self.myCafes(), function(marker) {
      var string = marker.title.toLowerCase();
      var result = (string.search(filter) >= 0);
      marker.status(result);
      marker.marker.setVisible(result);
      return result;
    });
  }
});    

  //Use street address in model to find LatLng
  self.setPosition = function(location) {
    var geocoder = new google.maps.Geocoder();
    //use address to find LatLng with geocoder
    geocoder.geocode({
      'address': location.address
    }, function(results, status) {
      if (status === 'OK') {
        location.marker.position = results[0].geometry.location;
        location.marker.setAnimation(google.maps.Animation.DROP);
      } else if (status === 'OVER_QUERY_LIMIT') {
        // console.log("in over limit"); // If status is OVER_QUERY_LIMIT, then wait and re-request
        setTimeout(function() {
          geocoder.geocode({
            'address': location.address
          }, function(results, status) {
            location.marker.position = results[0].geometry.location;
            // location.marker.setAnimation(google.maps.Animation.DROP);
          });
        }, 2000);

      } else {
        //If status is any other error code, then set status to Error, which will remove it from list and map
        location.status('ERROR');
        // console.log('Error code: ', status, 'for Location:', location.title);
      }
    });
  };

  //Iterate through data model, get LatLng location then set up infowindow
  self.initialize = function() {
    for (var current in members) {
      self.setPosition(members[current]);
      self.setBubble(current);
    }
  };

  //Toggle bounce animation for map marker on click of Location list button (via data-binding)
  self.toggleBounce = function(currentMarker) {
    google.maps.event.trigger(currentMarker.marker, 'click');
  };
};

ResultMarkers.prototype.initMap = function() {
  var self = this;

  self.mapOptions = {
    center: new google.maps.LatLng(24.717151, 46.682448), //set map center in Riyadh
    zoom: 14
  };

  self.map = new google.maps.Map(document.getElementById("map"), self.mapOptions);


  self.myCafes().forEach(function(cafe) {
    var marker = new google.maps.Marker({
      map: self.map,
      position: cafe.position,
      title: cafe.title

    });
    cafe.marker = marker;

    self.infowindow = new google.maps.InfoWindow({
      maxWidth: 250
    });


    marker.addListener('click', function() {
      self.infowindow.setContent('<h4>' + marker.title + '</h4>');
      self.infowindow.open(self.map, marker);
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 2100);
  // Ajax request url
  var url = BaseUrl;
  // Configuration of the ajax request
  $.ajax({
    url: url,
    dataType: 'json',
    data: {
      client_id: fsClient_id,
      client_secret: fsClient_secret,
      v: fsVersion,
      near: "Riyadh",
      async: true,
      query: cafe.marker.title
    },
    success: function(data) {
      console.log(data);
      var locationData = data.response.venues[0];
      var phone;
      if (locationData.contact.formattedPhone) {
        phone = locationData.contact.formattedPhone;
      } else {
        phone = 'Phone Number Not Available';
      }
      var contentString = "<div id='Window'>" +
      "<h5>" + locationData.name + "</h5>" +
      "<p>" + locationData.location.address + "</p>" +
      "<p>" + phone + "</p>" +
      "</div>";
      self.infowindow.setContent(contentString);
    },
    error: function() {
    // console.log(e)
    alert('Foursquare data is unavailable. Please try refreshing later.');
  }
});
});
  });
};

var myMarkers = new ResultMarkers(markersModel);
ko.applyBindings(myMarkers);
