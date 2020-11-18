import React, { useRef } from 'react'
import QRCode from 'qrcode.react'
import useWindowDimension from '../util/useWindowDimension'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify'
import Share from '../util/ShareOnMobile'

export default (poll) => {
	// TODO : for testing
	if (poll.poll) poll = poll.poll;

	const { width } = useWindowDimension();
	const isMobile = width <= 960;

	const copyBtn = useRef();
	const url = `${window.location.protocol}//${window.location.host}/poll/${poll.id}`;

	const onCopyHandler = (e) => {
		if (e && typeof e.preventDefault === 'function') e.preventDefault();

		toast('Poll Link Copied!');
	}

	// (iOS 14.1 bug - no solution..)
	// If native share API fails
	// Simply copy the link
	const handleShareToAppsFallback = () => copyBtn && copyBtn.current && copyBtn.current.click();

	const handleShareToApps = (e) => {
		if (e && typeof e.preventDefault === 'function') e.preventDefault();
		const shareData = {
			title: poll.title,
			text: poll.title ? [poll.title, ''].join('\n') : 'Check out this poll!\n',
			url: url,
		}

		Share(shareData, handleShareToAppsFallback)
			.then(() => {
				// Succesfully sharing to other apps
				console.log("Share opened")
			})
			.catch((e) => {
				// Share API failed
				console.log("Share failed", e);
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
								name={`url-${poll.id}`}
								formNoValidate
								disabled
							/>
							<CopyToClipboard text={url} onCopy={onCopyHandler}>
								<span ref={copyBtn} className='form-item__input-icon form-item__input-icon--clipboard'><i className="fas fa-copy"></i></span>
							</CopyToClipboard>
						</div>
					</div>
				</div>
				{isMobile ? <>
					<div
						onClick={handleShareToApps}
						className="form-switch poll-created-description">
						Or, you can also <a href={url} onClick={e => e.preventDefault()} className='form-switch-action'>share to other Apps</a></div>
				</> : <div className="form-switch poll-created-description">Or, you can also use <a href={url} target="_blank" rel="noopener noreferrer" className='form-switch-action'>This Link</a></div>}
			</div>
		</div >
	)
}