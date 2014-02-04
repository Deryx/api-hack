$(function() {
    var auth = {
        // 
        // Updated with my own Yelp auth tokens
        // 
        consumerKey: 'hGEUfs4j4qnmYDe8qFteGA',
        consumerSecret: 'fOKVDDB5AKsCSHTFFa-CLRA1gNY',
        accessToken: 'XPELaGGKTEX5zZUgE8B4tTvvM3rMDpD3',
        // This example is a proof of concept for using Yelp's v2 API with javascript. 
        // I wouldnk't actually want to expose my access token secret like this in a real app, but I might have to for my API hack...
        accessTokenSecret: 'zcTu6xvV3hjyGaslbqWSks1y2Ns',
        serviceProvider: {
            signatureMethod: 'HMAC-SHA1'
        }
    };

    /*updated terms to indicate that devs can enter more than one search term*/
    var terms = "food+pizza";
    var near = "New+York+City";

    /*Object used by Oath to provide dev secrets on OAuth signature*/
    var accessor = {
        consumerSecret: auth.consumerSecret,
        tokenSecret: auth.accessTokenSecret
    };

    // Cleaned up parameter call 
    
    var parameters = [
        ['term', terms],
        ['location', near],
        // Even if developer doesn't have a call back function defined, user has to pass in a name string for the OAuth signature on the URL
        ['callback', 'cb'],
        ['oauth_consumer_key', auth.consumerKey],
        ['oauth_consumer_secret', auth.consumerSecret],
        ['oauth_token', auth.accessToken],
        ['oauth_signature_method', 'HMAC-SHA1']
        ];
    /*action represents simple search for YELP business, and GET for pulling back data*/
    var message = {
        'action': 'http://api.yelp.com/v2/search',
        'method': 'GET',
        'parameters': parameters
    }

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    
    var parameterMap = OAuth.getParameterMap(message.parameters);
    parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);
    console.log(parameterMap);

    var geocoder;
    var map;
    function initialize() {
        geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(-34.397, 150.644);
        var mapOptions = {
        zoom: 8,
        center: latlng
        }
        // map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    }

    function codeAddress(address) {
        /* TODO: assign address var to business variables */
        var address = address;
        geocoder.geocode( { 'address': address}, function(results, status) {
            
            /*marker for google maps*/
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }
    /*actual callback function that displays image property of first yelp business returned from search query*/
    function cb (data) {
        console.log(data);
    	
        for (var i = data.businesses.length - 1; i >= 0; i--) {
            // assign local variables address and city for geolocation
            var address = data.businesses[i].location.address[0];
            var city = data.businesses[i].location.city

            $('#foo').append('<p><img src=' + 
                data.businesses[i].image_url + ' alt="yelp photo">' + 
                address + ' ' + 
                data.businesses[i].location.city + ' ' +
                data.businesses[i].location.country_code + 
                codeAddress()
                 ' </p>');
        }
         // $('#foo').append('<img src=' + data.businesses[0].image_url + ' alt="yelp photo" height="250">');
         // console.log("hi");
    }

    // specifically, OAuth will not allow for non specific or randomly generated json call back name by convenience methods i.e. $.get wouldn't work
    // user must specifiy the callback method name 
    $.ajax({
    	url: message.action,
    	data: parameterMap,
    	cache: true,
    	dataType: 'jsonp',
    	// jsonpCallback: 'cb',
    	success: function(data, textStats, XMLHttpRequest) {
            cb(data);
            console.log(data);
    		console.log(data.businesses[0].image_url);
            // $('#foo').append('<img src=' + data.businesses[0].image_url + ' alt="yelp photo" height="250">');
    		// $('body').text("hi");
    	}
    })
    .done(function() {
    	console.log("success");
    })
    .fail(function() {
    	console.log("error");
    })
    .always(function() {
    	console.log("complete");
    });
});    