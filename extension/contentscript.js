var matching_expressions = {
	"prev": /prev/i,
	"next": /next/i,
}

var navigation_urls = {
	"prev": null,
	"next": null,
}

var navigation_keycodes = {
	"prev": 37,	// left arrow
	"next": 39,	// right arrow
}

var qualifying_tags = ["link", "a"];
for (var j=0; j<qualifying_tags.length; j++) {
	var tag_name = qualifying_tags[j];
	var elements = document.getElementsByTagName( tag_name );
	for (var i=0; i<elements.length; i++) {
		var element = elements[i];
		var rel_attribute = element.getAttribute("rel");
		for (var key in navigation_urls)
			if (matching_expressions[key].test(rel_attribute))
				navigation_urls[key] = element.getAttribute("href")
	}
}

/**
* Keyboard keyup listener callback.
*/
function keyListener(e) {
	if (e.ctrlKey)
		for (var key in navigation_urls)
			if (e.keyCode == navigation_keycodes[key] && navigation_urls[key])
				window.location = navigation_urls[key];
}

if (navigation_urls["next"] || navigation_urls["prev"]) {
	chrome.extension.sendRequest(navigation_urls, function(response) {});
	window.addEventListener('keyup', keyListener, false);
}
