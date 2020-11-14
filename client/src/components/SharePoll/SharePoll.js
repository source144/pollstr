import React from 'react'
import QRCode from 'qrcode.react'
import useWindowDimension from '../util/useWindowDimension'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify'

export default (poll) => {
	// TODO : for testing
	if (poll.poll) poll = poll.poll;

	const { width } = useWindowDimension();
	const isMobile = width <= 960;

	console.log(poll);
	const url = `${window.location.protocol}//${window.location.host}/poll/${poll.id}`;

	const onCopyHandler = (e) => {
		if (e && e.preventDefault) e.preventDefault();

		toast('Poll Link Copied!');
	}
	const handleShareToApps = (e) => {
		if (e) e.preventDefault();
		if (!navigator || !navigator.share) return;

		const shareData = {
			title: poll.title,
			text: poll.description,
			url: url,
		}

		navigator.share(shareData)
			.then(() => {
				// Succesfully sharing to other apps
			})
			.catch((e) => {
				// Succesfully sharing to other apps
			})
	}
	return (
		<div className="form-centered-container">
			<div className="form-form-wrapper">
				<div onSubmit={(e) => { e.preventDefault() }} formNoValidate className='form-form'>
					<div className="form-switch poll-created-description">Use this QR Code to Acces Poll</div>
					<div className="poll-created-qr">
						<QRCode value={url} size={200} />
					</div>
					{/* <div className="form-switch poll-created-description">Or, use copy the following link</div> */}
					<div className="form-item form-item--clipboard">
						<div className='form-item-wrapper'>
							<input
								value={url}
								className='form-item__input form-item__input--clipboard'
								type="text"
								placeholder="e.g. ********"
								name={`url-${poll.id}`}
								formNoValidate />
							<CopyToClipboard text={url} onCopy={onCopyHandler}>
								<span className='form-item__input-icon form-item__input-icon--clipboard'><i className="fas fa-copy"></i></span>
							</CopyToClipboard>
						</div>
					</div>
				</div>
				{isMobile ? <div
					onClick={handleShareToApps}
					className="form-switch poll-created-description">
					Or, you can also <a to={`/poll/${poll.id}`} className='form-switch-action'>share to other Apps</a></div> : undefined}
			</div>
		</div >
	)
}