var cache = {};

function cache_add(key, value, f = null) {
	if (f != null && typeof f == 'function') {
		cache[key] = f();
	} else {
		cache[key] = value;
	}
	return cache[key];
}

function cache_replace(key, value, f = null) {
	return cache_add(key, value, f);
}

function cache_remove(key) {
	delete cache[key];
}

function cache_get(key) {
	return cache[key];
}

function cache_getOrAdd(key, value, f = null) {
	if (!cache[key]) {
		return cache_add(key, value, f);
	}
	return cache[key];
}

function cache_exists(key) {
	return cache[key] != undefined;
}

module.exports = { cache_add, cache_replace, cache_remove, cache_get, cache_getOrAdd, cache_exists };