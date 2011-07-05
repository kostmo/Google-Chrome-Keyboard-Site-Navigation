function LinkRelationFinder() {

	this.find_direction_link = function(direction_designator) {

		// Search through the relevant tags to find the "rel" attribute with a value of "next" or "prev"
		var qualifying_tags = ["link", "a", "area"];	// see http://www.whatwg.org/specs/web-apps/current-work/multipage/links.html#linkTypes

		for (var j=0; j<qualifying_tags.length; j++) {
			var tag_name = qualifying_tags[j];
			var qualifying_tag_elements = document.getElementsByTagName( tag_name );
			for (var i=0; i<qualifying_tag_elements.length; i++) {
				var qualifying_tag_element = qualifying_tag_elements[i];
				var rel_attribute = qualifying_tag_element.getAttribute("rel");
				if (matching_expressions[direction_designator].test(rel_attribute))
					return qualifying_tag_element.getAttribute("href");
			}
		}
	}

	this.get_prev_next_urls = function() {

		var prev_next_urls_dict = {}

		for (var direction_designator in navigation_urls) {
			var direction_link = this.find_direction_link(direction_designator);
			if (direction_link)
				prev_next_urls_dict[direction_designator] = direction_link;
		}

		return prev_next_urls_dict;
	}
}




function ImageLinkFinder(prev_img, next_img) {
	this.navigation_images = {
		"prev": prev_img,
		"next": next_img
	}

	this.find_direction_link = function(direction_designator) {
		var anchor_tags = document.getElementsByTagName( "a" );
		for (var i=0; i<anchor_tags.length; i++) {
			var anchor_tag = anchor_tags[i];
			var anchor_tag_image_children = anchor_tag.getElementsByTagName( "img" );

			for (var j=0; j<anchor_tag_image_children.length; j++) {
				var image_tag = anchor_tag_image_children[j];

				var search_candidate = image_tag.getAttribute("src");
				var search_target = this.navigation_images[direction_designator];

				if (
					(typeof search_target == "string") && search_candidate == search_target
					|| (search_target instanceof RegExp) && search_target.test(search_candidate)
				)
					return anchor_tag.getAttribute("href");
			}
		}
	}

	this.get_prev_next_urls = function() {

		var prev_next_urls_dict = {}

		for (var direction_designator in navigation_urls) {
			var direction_link = this.find_direction_link(direction_designator);
			if (direction_link)
				prev_next_urls_dict[direction_designator] = direction_link;
		}

		return prev_next_urls_dict;
	}
}



function TextLinkFinder(prev_text, next_text) {
	this.navigation_texts = {
		"prev": prev_text,
		"next": next_text
	}

	this.get_prev_next_urls = function() {

		var prev_next_urls_dict = {}
		var anchor_tags = document.getElementsByTagName( "a" );

		for (var direction_designator in navigation_urls) {
			for (var i=0; i<anchor_tags.length; i++) {
				var anchor_tag = anchor_tags[i];
				var navigation_text = this.navigation_texts[direction_designator];

				// XXX Note the extra check for whether the "href" attribute is empty/null
				if (anchor_tag.innerText.indexOf(navigation_text) >= 0 && anchor_tag.getAttribute("href")) {
					prev_next_urls_dict[direction_designator] = anchor_tag.getAttribute("href");
					break;
				}
			}
		}

		return prev_next_urls_dict;
	}
}


// TODO Combine this with TextLinkFinder
function HtmlLinkFinder(prev_text, next_text) {
	this.navigation_texts = {
		"prev": prev_text,
		"next": next_text
	}

	this.get_prev_next_urls = function() {

		var prev_next_urls_dict = {}
		var anchor_tags = document.getElementsByTagName( "a" );

		for (var direction_designator in navigation_urls) {
			for (var i=0; i<anchor_tags.length; i++) {
				var anchor_tag = anchor_tags[i];
				var navigation_text = this.navigation_texts[direction_designator];
				if (anchor_tag.innerHTML.indexOf(navigation_text) >= 0) {
					prev_next_urls_dict[direction_designator] = anchor_tag.getAttribute("href");
					break;
				}
			}
		}

		return prev_next_urls_dict;
	}
}



function ImageMapLinkFinder(prev_coords, next_coords) {
	this.navigation_texts = {
		"prev": prev_coords,
		"next": next_coords
	}

	this.get_prev_next_urls = function() {

		var prev_next_urls_dict = {}
		var area_tags = document.getElementsByTagName( "area" );

		for (var direction_designator in navigation_urls) {
			for (var i=0; i<area_tags.length; i++) {
				var area_tag = area_tags[i];
				var navigation_text = this.navigation_texts[direction_designator];
				var area_tag_coords = area_tag.getAttribute("coords");

				// XXX Note the extra check for whether the "href" attribute is empty/null
				if (area_tag_coords == navigation_text && area_tag.getAttribute("href")) {
					prev_next_urls_dict[direction_designator] = area_tag.getAttribute("href");
					break;
				}
			}
		}

		return prev_next_urls_dict;
	}
}

