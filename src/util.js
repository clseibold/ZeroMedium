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

// Got this from this stack overflow answer: https://stackoverflow.com/questions/6003271/substring-text-with-html-tags-in-javascript/6003713#6003713
// By user113716
function html_substr( str, count ) {

    var div = document.createElement('div');
    div.innerHTML = str;

    walk( div, track );

    function track( el ) {
        if( count > 0 ) {
            var len = el.data.length;
            count -= len;
            if( count <= 0 ) {
                el.data = el.substringData( 0, el.data.length + count );
            }
        } else {
            el.data = '';
            //el.parentNode.removeChild(el); // Experimental
            el.outerHTML = "";
            delete el;
        }
    }

    function walk( el, fn ) {
        var node = el.firstChild;
        do {
            if( node.nodeType === 3 ) {
                fn(node);
            } else if( node.nodeType === 1 && node.childNodes && node.childNodes[0] ) {
                walk( node, fn );
            }
        } while( node = node.nextSibling );
    }
    return div.innerHTML;
}

module.exports = {
	sanitizeStringForUrl: sanitizeStringForUrl,
	sanitizeStringForUrl_SQL: sanitizeStringForUrl_SQL,
	html_substr: html_substr
}