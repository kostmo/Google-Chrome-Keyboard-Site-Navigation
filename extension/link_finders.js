function TextLinkFinder(prev_text, next_text) {

	this._className = "TextLinkFinder";
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
			var tag_element = target_tags[i];
			var pattern = this.navigation_patterns[direction_designator];

			// XXX Note the extra check for whether the "href" attribute is empty/null
			if (this.isPatternMatch(tag_element, pattern) && tag_element.getAttribute("href"))
				return tag_element.getAttribute("href");
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

	this.isPatternMatch = function(tag_element, pattern) {
		return this.getSubjectText(tag_element).indexOf(pattern) >= 0;
	}
}

// ============================================================================
function HtmlLinkFinder(prev_text, next_text) {
	this._className = "HtmlLinkFinder";
	this.navigation_patterns = {"prev": prev_text, "next": next_text};
}
HtmlLinkFinder.prototype = new TextLinkFinder
HtmlLinkFinder.prototype.getSubjectText = function(element) {
	return element.innerHTML
}

// ============================================================================
function ImageMapLinkFinder(prev_text, next_text) {
	this._className = "ImageMapLinkFinder";
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

// ============================================================================
function LinkRelationFinder() {
	this._className = "LinkRelationFinder";
	this.navigation_patterns = matching_expressions;
}
LinkRelationFinder.prototype = new TextLinkFinder
LinkRelationFinder.base = TextLinkFinder.prototype;
LinkRelationFinder.prototype.getSubjectText = function(element) {
	return element.getAttribute("rel");
}
LinkRelationFinder.prototype.isPatternMatch = function(tag_element, pattern) {
	return pattern.test(this.getSubjectText(tag_element));
}
LinkRelationFinder.prototype.find_direction_link = function(direction_designator) {

	// Search through the relevant tags to find the "rel" attribute with a value of "next" or "prev"
	var qualifying_tags = ["link", "a", "area"];	// see http://www.whatwg.org/specs/web-apps/current-work/multipage/links.html#linkTypes
	for (var j=0; j<qualifying_tags.length; j++) {
		var result = this.find_link(direction_designator, qualifying_tags[j]);
		if (result) return result;
	}
}

// ============================================================================
function LinkHeuristicFinder() {
	this._className = "LinkHeuristicFinder";
	this.navigation_patterns = matching_expressions;
}
LinkHeuristicFinder.prototype = new TextLinkFinder
LinkHeuristicFinder.base = TextLinkFinder.prototype;
LinkHeuristicFinder.prototype.getSubjectText = function(element) {
	return element.getAttribute("rel");
}
LinkHeuristicFinder.prototype.isPatternMatch = function(tag_element, pattern) {
	return pattern.test(this.getSubjectText(tag_element));
}
LinkHeuristicFinder.prototype.find_direction_link = function(direction_designator) {

	var directional_synonyms = {
		"next": ["next", "forward", "ahead", ">"],
		"prev": ["prev", "back", "reverse", "<"]};

	var synonym_list = directional_synonyms[direction_designator];

	var target_tags = document.getElementsByTagName("a");
	for (var i=0; i<target_tags.length; i++) {
		var tag_element = target_tags[i];
		if (tag_element.getAttribute("href")) {
//			console.log("Testing " + tag_element.innerText);

			for (var j=0; j<synonym_list.length; j++) {
				var synonym_regexp = new RegExp(synonym_list[j], "i");	// Case-insensitive matching
				if ( synonym_regexp.test(tag_element.innerText) ) {
//					console.log("Found the word \"" + direction_designator + "\" in " + tag_element.innerText);
					return tag_element.getAttribute("href");
				}
			}
		}
	}
}

// ============================================================================
function ImageLinkFinder(prev_text, next_text) {
	this._className = "ImageLinkFinder";
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
		var tag_element = target_tags[i];
		var tag_element_image_children = tag_element.getElementsByTagName( "img" );

		for (var j=0; j<tag_element_image_children.length; j++) {
			var image_tag = tag_element_image_children[j];

			var search_candidate = image_tag.getAttribute("src");
			var search_target = this.navigation_patterns[direction_designator];

//			console.log("Candidate: " + search_candidate + "; Target: " + search_target);
			if (this.isPatternMatch(search_candidate, search_target))
				return tag_element.getAttribute("href");
		}
	}
}
