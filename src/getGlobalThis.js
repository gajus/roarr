/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */

// @see https://mathiasbynens.be/notes/globalthis
(function() {
	if (typeof globalThis === 'object') return;
	Object.prototype.__defineGetter__('__magic__', function() {
		return this;
	});
	__magic__.globalThis = __magic__; // lolwat
	delete Object.prototype.__magic__;
}());

export default globalThis;
