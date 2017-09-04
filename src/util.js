function sanitizeStringForUrl(s) {
	var url = s.toLowerCase();
	// Get rid of spaces
	url = url.replace(/ /g, '-');
	// Get rid of any punctuation
	url = url.replace(/(\?|\.|,|!|#|\*)/g, '').replace(/&/, '-');
	// Get rid of other symbols
	url = url.replace(/(\^|\(|\)|\+|=|\/|\\|\{|\}|\[|\]|:|;|'|"|`|~)/g, '');

	return url;
}

// SQL version
function sanitizeStringForUrl_SQL(column) {
	return "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(" + column + ", \"'\", ''), '~', ''), '`', ''), '\"', ''), '\\;', ''), ':', ''), ']', ''), '[', ''), '}', ''), '{', ''), '\', ''), '/', ''), '=', ''), '+', ''), ')', ''), '(', ''), '^', ''), '&', '-'), '*', ''), '#', ''), '!', ''), ',', ''), '.', ''), '?', ''), ' ', '-')"
}

module.exports = {
	sanitizeStringForUrl: sanitizeStringForUrl,
	sanitizeStringForUrl_SQL: sanitizeStringForUrl_SQL
}