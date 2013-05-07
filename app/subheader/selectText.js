(function(define) {
define(function() {

	/**
	 * Selects a text string from the provided strings array
	 */
	return function(strings, selector) {
		var len = strings && strings.length;
		return len ? strings[(selector || defaultSelector)(len)] : '';
	};

	function defaultSelector(n) {
		return Math.floor(Math.random() * n);
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
