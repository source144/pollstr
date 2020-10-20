String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

exports.errorObject = (message) => {
	return { error: message ? message.replace(/['"]+/g, '').trim() : "" };
}