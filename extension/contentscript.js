String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


var LINK_RELATION_KEYS = ["prev", "next"];

var recognition_type = null;
var matching_expressions = {}
var navigation_urls = {}	// These will be lists of all of the "rel" targets encountered.

for (var i=0; i<LINK_RELATION_KEYS.length; i++) {
	var direction_designator = LINK_RELATION_KEYS[i];
	matching_expressions[direction_designator] = new RegExp(direction_designator, "i");	// Define case-insensitive regular expressions

	navigation_urls[direction_designator] = [];
}


// Keyboard keys
var navigation_keycodes = {
	"prev": 37,	// left arrow
	"next": 39,	// right arrow
}

// TODO Not used
var find_multiple_targets = localStorage["find_multiple_targets"];

function get_manual_override(hostname) {
	for (var site_url in manual_site_overrides)
		if (hostname.endsWith(site_url))
			return manual_site_overrides[site_url];

	return false;
}

/*	Give precedence to manually-specified website overrides.
	If that doesn'ts work, use built-in "link relation" tags.
	If that doesn't work, search link text for "next" or "previous".
*/
function find_links() {
	var manual_linkfinder = get_manual_override(window.location.hostname);
	if (manual_linkfinder) {
		recognition_type = "manual";
	} else {
		manual_linkfinder = new LinkRelationFinder();
		recognition_type = "inherent";
	}

	var prevnext = manual_linkfinder.get_prev_next_urls();

	var found_links = false;
	for (var direction_designator in prevnext) {
		found_links = true;
		navigation_urls[direction_designator].push( prevnext[direction_designator] );
	}

	if (!found_links) {

		var linkfinder = new LinkHeuristicFinder();
		var prevnext = linkfinder.get_prev_next_urls();

		for (var direction_designator in prevnext) {
			found_links = true;
			navigation_urls[direction_designator].push( prevnext[direction_designator] );
		}

		if (found_links) {
			recognition_type = "guess";
		}
	}

	console.log("Done.");
}



/**
* TODO - If multiple next/prev targets are available,
* may present a list to choose between them.
*/
function keyListener(e) {

//	console.log("Tagname: " + document.activeElement.tagName);

	if (["TEXTAREA", "INPUT"].indexOf(document.activeElement.tagName) < 0)
		if (e.ctrlKey)
			for (var direction_designator in navigation_urls)
				if (e.keyCode == navigation_keycodes[direction_designator] && navigation_urls[direction_designator].length)
					window.location = navigation_urls[direction_designator][0];	// Uses the first one encountered
}




find_links();

// If either the "next" or "prev" is defined, show the URL bar icon and enable the keyboard shortcuts
if ( LINK_RELATION_KEYS.some( function(element, index, array) {return navigation_urls[element].length;} ) ) {


	var response_dict = {};
	response_dict["recognition_type"] = recognition_type;
	response_dict["navigation_options"] = navigation_urls;

	chrome.extension.sendRequest(response_dict, function(response) {});
	window.addEventListener('keyup', keyListener, false);
}

