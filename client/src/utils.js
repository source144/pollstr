export const setWebTitle = pageName => {
	if (pageName && typeof pageName === 'string')
		document.title = `Pollstr | ${pageName} | Polling Intuitively`
	else document.title = `Pollstr | Polling Intuitively`
}