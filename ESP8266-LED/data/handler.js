const currentEffectELem = document.querySelector('.content_main .current_effect');
const effectsList = document.querySelector('.content .effects_list');
const effectElems = document.querySelectorAll('.effects_list span');

const togglePlay = document.querySelector('.toggle_play');
const prevButton = document.querySelector('.prev_btn');
const nextButton = document.querySelector('.next_btn');
const toggleLoop = document.getElementById('toggle_loop');
const toggleRandom = document.getElementById('toggle_random');

const rangeBrightness = document.querySelector('.range_brightness');
const brightnessValue = document.querySelector('.brightness_value');
const rangeDuration = document.querySelector('.range_duration');
const durationValue = document.querySelector('.duration_value');

effectsList.style.height = document.documentElement.clientHeight - (panel.clientHeight + header.clientHeight) + 'px';


const COUNT = effectsList.children.length; // effects count
let currentEffect = 1;

let webSocket;

function initWebSocket() {
	console.log('Trying to open a WebSocket connection...');
	webSocket = new WebSocket('ws://' + window.location.hostname + ':81/');
	webSocket.onopen = onOpen;
	webSocket.onclose = onClose;
	webSocket.onerror = onError;
	webSocket.onmessage = onMessage;
}

function onMessage(payload) {

	messageHandler(payload.data);
	console.log('Received: ', payload.data);
}

function onClose(e) {
	console.log('Connection closed ', e);
	setTimeout(initWebSocket, 1000);
}

function onError(e) {
	console.log(`[error] ${ e }`);
}

function onOpen() {
	console.log('Connection is success');

}

function messageHandler(payload) {
	let getData = payload.substring(1);
	
	switch(payload[0]) {
		case 'E':
			togglePlay.checked = true;
			currentEffect = +(getData);
			updateList(localStorage.getItem('theme')); // handled by the server
		break;
		case 'B':
			updateRange(rangeBrightness, brightnessValue, getData);
		break;
		case 'D':
			updateRange(rangeDuration, durationValue, getData, isDuration=true);
		break;
		case 'P':
			if (getData === '1') {
				togglePlay.checked = true;
			}
			else {
				togglePlay.checked = false;
			}
		break;
		case 'L':
			if (getData === '1') {
				togglePlay.checked = true;
				toggleLoop.checked = true;
				toggleRandom.checked = false;
			}
			else {
				toggleLoop.checked = false;
			}
		break;
		case 'R':
			if (getData === '1') {
				togglePlay.checked = true;
				toggleRandom.checked = true;
				toggleLoop.checked = false;
			}
			else {
				toggleRandom.checked = false;
			}
		break;
		case '#':
			colorPicker.setColorByHex(payload);
			canvasColorPicker.style.boxShadow = `0px 0px 10px 10px ${colorPicker.getCurColorHex()} inset, 0 0 10px ${colorPicker.getCurColorHex()}`;
		break;
	}

}

function sendEffect() {
	
	for (let item of effectElems) {

		item.onclick = function() {

			currentEffect = this.dataset.effect;
			togglePlay.checked = true;
	
			// updateList(localStorage.getItem('theme'));
			updateList('rgba(120,120,120,.8'); // not handled by the server yet

			const payload = 'E' + this.dataset.effect;

			console.log(payload);
			console.log("Current: ", currentEffect)
			webSocket.send(payload);

		};
	}
}

function updateList(color) {
	currentEffectELem.innerText = effectElems[currentEffect - 1].innerText;
	Array.from(effectElems, item => item.style.background = ''); // clear
	// if (+(effectElems[currentEffect - 1].dataset.effect) > 17) {
	// 	background = '#cd5300';
	// }
	currentEffectELem.style.background = color;
	effectElems[currentEffect - 1].style.background = color;

}


(() => {

	updateRange(rangeBrightness, brightnessValue, 25);
	updateRange(rangeDuration, durationValue, 10, isDuration=true);

	let lastSend = 0;

	rangeBrightness.oninput = function() {

		updateRange(rangeBrightness, brightnessValue, this.value);
		
		let payload = 'B' + this.value;

		const now = (new Date).getTime();
		if (lastSend > now - 50) return; // send data no more than 50ms
		lastSend = now;

		console.log(payload);
		webSocket.send(payload);
	};

	rangeBrightness.onchange = function() { // fixes if move the range quickly
		const payload = 'B' + this.value;
		console.log(payload);
		webSocket.send(payload);
	}

	// only for the interface range
	rangeDuration.oninput = function() {
		updateRange(rangeDuration, durationValue, this.value, isDuration=true);

	};
	rangeDuration.onchange = function() {
		const payload = 'D' + this.value;

		console.log(payload);
		webSocket.send(payload);
	}

})();

function updateRange(range, output, value, isDuration=false) {
	const min = range.min;
	const max = range.max;

	range.style.backgroundSize = (value - min) * 100 / (max - min) + '% 100%';
	range.value = value;

	output.value = isDuration ? value + 's' : value;

};


togglePlay.onclick = function() {

	let payload;
	if (this.checked) {
		payload = 'P1';
	}
	else {
		payload = 'P0';
	}

	console.log(payload);
	webSocket.send(payload);
}

toggleLoop.onclick = function() {
	
	let payload;
	if (this.checked) {
		togglePlay.checked = true;
		toggleRandom.checked = false;
		payload = 'L1';
	}
	else {
		payload = 'L0';
	}

	console.log(payload);
	webSocket.send(payload);

}

toggleRandom.onclick = function() {

	let payload;
	if (this.checked) {
		togglePlay.checked = true;
		toggleLoop.checked = false;
		payload = 'R1';
	}
	else {
		payload = 'R0';
	}
	
	console.log(payload);
	webSocket.send(payload);

}

prevButton.onclick = function() {

	togglePlay.checked = true;

	if (currentEffect === 1) {
		currentEffect = effectsList.children.length;
		console.log('one')
	}
	else {
		--currentEffect;
	}

	updateList('rgba(120,120,120,.8');

	const payload = 'E' + currentEffect;

	console.log(payload);
	webSocket.send(payload);
}

nextButton.onclick = function() {

	if (!togglePlay.checked) {
		currentEffect = 0;
	}

	togglePlay.checked = true;
	
	if (currentEffect === effectsList.children.length) {
		currentEffect = 1;
	}
	else {
		++currentEffect;
	}

	updateList('rgba(120,120,120,.8');

	const payload = 'E' + currentEffect;

	console.log(payload);
	webSocket.send(payload);
}
