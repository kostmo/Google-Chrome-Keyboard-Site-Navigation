var LINK_RELATION_KEYS = ["prev", "next"];

var matching_expressions = {}
var navigation_urls = {}	// These will be lists of all of the "rel" targets encountered.

for (var i=0; i<LINK_RELATION_KEYS.length; i++) {
	var key = LINK_RELATION_KEYS[i];
	matching_expressions[key] = new RegExp(key, "i");	// Define case-insensitive regular expressions

	navigation_urls[key] = [];
}


// Keyboard keys
var navigation_keycodes = {
	"prev": 37,	// left arrow
	"next": 39,	// right arrow
}

var find_multiple_targets = localStorage["find_multiple_targets"];

// Search through the relevant tags to find the "rel" attribute with a value of "next" or "prev"
var qualifying_tags = ["link", "a", "area"];	// see http://www.whatwg.org/specs/web-apps/current-work/multipage/links.html#linkTypes
for (var key in navigation_urls) {
	for (var j=0; j<qualifying_tags.length; j++) {
		var tag_name = qualifying_tags[j];
		var elements = document.getElementsByTagName( tag_name );
		for (var i=0; i<elements.length; i++) {
			var element = elements[i];
			var rel_attribute = element.getAttribute("rel");
			if (matching_expressions[key].test(rel_attribute)) {
				navigation_urls[key].push( element.getAttribute("href") )
				if (!find_multiple_targets) break
			}
		}
	}
}


/**
* TODO - If multiple next/prev targets are available,
* may present a list to choose between them.
*/
function keyListener(e) {
	if (e.ctrlKey)
		for (var key in navigation_urls)
			if (e.keyCode == navigation_keycodes[key] && navigation_urls[key].length)
				window.location = navigation_urls[key][0];	// Uses the first one encountered
}



// If either the "next" or "prev" is defined, show the URL bar icon and enable the keyboard shortcuts
if ( LINK_RELATION_KEYS.some( function(element, index, array) {return navigation_urls[element].length;} ) ) {
	chrome.extension.sendRequest(navigation_urls, function(response) {});
	window.addEventListener('keyup', keyListener, false);
}
