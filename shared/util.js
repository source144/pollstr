String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

exports.errorObject = (message) => {
	return { message: message ? message.replace(/['"]+/g, '').trim() : "" };
}