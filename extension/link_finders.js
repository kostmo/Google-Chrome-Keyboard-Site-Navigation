function TextLinkFinder(prev_text, next_text) {

	this.navigation_patterns = {"prev": prev_text, "next": next_text};

	this.get_prev_next_urls = function() {
		var prev_next_urls_dict = {}
		for (var direction_designator in navigation_urls) {
			var direction_link = this.find_direction_link(direction_designator, this.getSubjectElementType());
			if (direction_link)
				prev_next_urls_dict[direction_designator] = direction_link;
		}
		return prev_next_urls_dict;
	}


	this.find_link = function(direction_designator, subject_element) {
		var target_tags = document.getElementsByTagName( subject_element );
		for (var i=0; i<target_tags.length; i++) {
			var anchor_tag = target_tags[i];
			var pattern = this.navigation_patterns[direction_designator];

			// XXX Note the extra check for whether the "href" attribute is empty/null
			if (this.isPatternMatch(anchor_tag, pattern) && anchor_tag.getAttribute("href"))
				return anchor_tag.getAttribute("href");
		}
	}

	this.find_direction_link = function(direction_designator, subject_element) {
		return this.find_link(direction_designator, subject_element);
	}

	this.getSubjectText = function(element) {
		return element.innerText;
	}

	this.getSubjectElementType = function() {
		return "a";
	}

	this.isPatternMatch = function(anchor_tag, pattern) {
		return this.getSubjectText(anchor_tag).indexOf(pattern) >= 0;
	}
}


function ImageMapLinkFinder(prev_text, next_text) {
//	TextLinkFinder.call(this, prev_text, next_text);
	this.navigation_patterns = {"prev": prev_text, "next": next_text};
}
ImageMapLinkFinder.prototype = new TextLinkFinder
ImageMapLinkFinder.prototype.getSubjectText = function(element) {
	return element.getAttribute("coords");
}
ImageMapLinkFinder.prototype.getSubjectElementType = function(element) {
	return "area";
}



function HtmlLinkFinder(prev_text, next_text) {
	this.navigation_patterns = {"prev": prev_text, "next": next_text};
}
HtmlLinkFinder.prototype = new TextLinkFinder
HtmlLinkFinder.prototype.getSubjectText = function(element) {
	return element.innerHTML
}




function LinkRelationFinder() {
	this.navigation_patterns = matching_expressions;
}
LinkRelationFinder.prototype = new TextLinkFinder
LinkRelationFinder.base = TextLinkFinder.prototype;
LinkRelationFinder.prototype.getSubjectText = function(element) {
	return element.getAttribute("rel");
}
LinkRelationFinder.prototype.isPatternMatch = function(anchor_tag, pattern) {
	return pattern.test(this.getSubjectText(anchor_tag));
}
LinkRelationFinder.prototype.find_direction_link = function(direction_designator) {

	// Search through the relevant tags to find the "rel" attribute with a value of "next" or "prev"
	var qualifying_tags = ["link", "a", "area"];	// see http://www.whatwg.org/specs/web-apps/current-work/multipage/links.html#linkTypes
	for (var j=0; j<qualifying_tags.length; j++) {
		var result = this.find_link(direction_designator, qualifying_tags[j]);
		if (result) return result;
	}
}



function ImageLinkFinder(prev_text, next_text) {
	this.navigation_patterns = {"prev": prev_text, "next": next_text};
}
ImageLinkFinder.prototype = new TextLinkFinder
ImageLinkFinder.prototype.isPatternMatch = function(search_candidate, pattern) {
	return (typeof pattern == "string") && search_candidate == pattern
		|| (pattern instanceof RegExp) && pattern.test(search_candidate)
}
ImageLinkFinder.prototype.find_direction_link = function(direction_designator) {
	var target_tags = document.getElementsByTagName( "a" );
	for (var i=0; i<target_tags.length; i++) {
		var anchor_tag = target_tags[i];
		var anchor_tag_image_children = anchor_tag.getElementsByTagName( "img" );

		for (var j=0; j<anchor_tag_image_children.length; j++) {
			var image_tag = anchor_tag_image_children[j];

			var search_candidate = image_tag.getAttribute("src");
			var search_target = this.navigation_patterns[direction_designator];

			if (this.isPatternMatch(search_candidate, search_target))
				return anchor_tag.getAttribute("href");
		}
	}
}
