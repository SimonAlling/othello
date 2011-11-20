// Demotivational Poster Creator by Simon Alling

var jso = {}; // top object
var n = {}; // storing all elements that have an ID attribute
jso.bWidth = 8; // board width in squares
jso.bHeight = 8; // board height in squares
jso.sqSize = 88; // size of one square
jso.heldSize = 104; // size of the brick being held
jso.thickness = 18; // brick thickness
jso.borderWidth = 8; // width of border between squares
jso.bricksTotal = 64; // total number of bricks
jso.fillCount = 0;
jso.prep = 0; // to loop prepareGame
jso.holding = 0; // indicates whether or not a brick is being held
jso.turn = 'white'; // whose turn it is (initial value is opposite to first turn)
jso.confirmBlackVis = 0;
jso.confirmWhiteVis = 0;
jso.confirmOffsetTop = 51; // white confirm buttons actual offsetTop
jso.board = [];
for (x = 0; x < jso.bWidth; x++) {
	jso.board[x] = [];
	for (y = 0; y < jso.bHeight; y++) {
		jso.board[x][y] = {
			state : 0,
			color : 0
		};
	}
}
jso.ctx = 0; // stores context of board canvas

jso.move = {
	x : 0,
	y : 0
};
jso.white = {
	bricks : 0,
	bricksTotal : 32,
	ctx : 0
};
jso.black = {
	bricks : 0,
	bricksTotal : 32,
	ctx : 0
};

var isEventSupported = (function(){
	var TAGNAMES = {
	  'select':'input','change':'input',
	  'submit':'form','reset':'form',
	  'error':'img','load':'img','abort':'img'
	};
	function isEventSupported(eventName) {
		var el = document.createElement(TAGNAMES[eventName] || 'div');
		eventName = 'on' + eventName;
		var isSupported = (eventName in el);
		if (!isSupported) {
			el.setAttribute(eventName, 'return;');
			isSupported = typeof el[eventName] == 'function';
		}
		el = null;
		return isSupported;
	}
	return isEventSupported;
})();
  
function checkComp() {
	var fail = false;
	var ie = false;
	if (navigator.appName == "Microsoft Internet Explorer") {
		fail = true;
		ie = true;
	}
	if (!(addEventListener)) fail = true;
	if (fail) {
		var msg = "DPC doesn't work in your browser. Please install a better one.";
		if (ie) msg = "You're using Internet Explorer, the worst browser there is. Please do every web developer a favor by installing a good browser.";
		alert(msg);
	}
}

function isJsonString(str) {
	try {
		JSON.parse(str);
	} catch(e) {
		return false;
	}
	return true;
}

function getElementsWithId() {
	// returns an object with all elements that have an ID attribute
	// the result is returned like so:
	// myReturn['foo'] = document.getElementById('foo');
	// myReturn['bar'] = document.getElementById('bar');
	var myReturn = {};
	var allElements = document.getElementsByTagName('*'); // get all elements in the document
	for (i = 0; i < allElements.length; i++) {
		if ((allElements[i]).getAttribute('id')) { // test if the current element has an ID
			myReturn[(allElements[i]).getAttribute('id')] = allElements[i]; // if so, add the element to the returned object
		}
	}
	return myReturn;
}

function addBrick(color) {
	var currentBricks = jso[color].bricks;
	var img = new Image();
	img.onload = function() {
		jso[color].ctx.drawImage(img, currentBricks * jso.thickness, 0);
	};
	img.src = 'jso/pic/brick-side.png';
	jso[color].bricks++;
}

function removeBrick(color) {
	var currentBricks = jso[color].bricks;
	jso[color].ctx.clearRect((currentBricks * jso.thickness)-18, 0, 18, 88);
	jso[color].bricks = jso[color].bricks - 1;
}

function fillHolders() {
	jso.fillCount++;
	addBrick('white');
	addBrick('black');
	var t = setTimeout('fillHolders()', 20);
	if (jso.fillCount === jso.white.bricksTotal) {
		clearTimeout(t);
	}
}

function prepareGame() {
	if (jso.black.bricks == jso.bricksTotal/2) {
		clearTimeout(jso.prep);
		n.held.style.display = 'inline-block';
		for (i = 0; i < 2; i++) {
			removeBrick('white');
			removeBrick('black');
		}
		placeBrick('black', 3, 3);
		placeBrick('white', 4, 3);
		placeBrick('white', 3, 4);
		placeBrick('black', 4, 4);
		nextTurn();
	}
	else {
		jso.prep = setTimeout("prepareGame()", 200);
	}
}

function setCanvasContexts() {
	jso.white.ctx = n.white.getContext('2d');
	jso.black.ctx = n.black.getContext('2d');
	jso.ctx = n.can.getContext('2d');
}

function def(input, value) {
	if (input === '' || !input) return value;
	else return input;
}

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return [curleft,curtop];
}

function touchIsWithin(event, startX, startY, endX, endY) {
	var x = event.changedTouches[0].pageX;
	var y = event.changedTouches[0].pageY;
//	alert(startX + ', ' + startY + '\n' + endX + ', ' + endY);
	if (x > startX && x < endX) {
		if (y > startY && y < endY) {
			return true;
		}
	}
	return false;
}

function touching(event, box) {
	var x = event.changedTouches[0].pageX;
	var y = event.changedTouches[0].pageY;
	if (x > findPos(box)[0] && x < (findPos(box)[0]+box.offsetWidth)) {
		if (y > findPos(box)[1] && y < (findPos(box)[1]+box.offsetHeight)) {
			return true;
		}
	}
	return false;
}

function nextTurn() {
	if (jso.holding === 0) {
		if (jso.turn == 'black') {
			// change to WHITE
			jso.turn = 'white';
			hideConfirm();
		}
		else {
			// change to BLACK
			jso.turn = 'black';
			hideConfirm();
		}
		resetHeld(jso.turn);
	}
}

function hideConfirm() {
	jso.confirmWhiteVis = 0;
	jso.confirmBlackVis = 0;
	n.confirmWWhite.style.top = '140px';
	n.confirmWBlack.style.top = '140px';
	n.confirmOverlay.style.zIndex = '700';
}

function confirmMove() {
	n.confirmOverlay.style.zIndex = '950';
	if (jso.turn === 'black') {
		jso.confirmBlackVis = 1;
		n.confirmWBlack.style.top = '4px';
	}
	else {
		jso.confirmWhiteVis = 1;
		n.confirmWWhite.style.top = '4px';
	}
}

function refreshHeld() {
	n.held.style.left = jso.move.x - (jso.heldSize/2) + 'px';
	n.held.style.top = jso.move.y - (jso.heldSize/2) + 'px';
}

function resetHeld(color) {
	if (!color) {
		alert('ERROR: Function resetHeld requires that a color be specified.');
		return;
	}
	n.held.src = 'jso/pic/tp.png';
	// place held on appropriate brick holder
	if (color === 'black') {
		n.held.style.left = '96px';
		n.held.style.top = '912px';
	}
	else if (color === 'white') {
		var emptySpace = (jso.thickness * ((jso.bricksTotal/2) - jso[color].bricks));
		n.held.style.left = (96 + emptySpace) + 'px';
		n.held.style.top = '24px';
	}
	n.held.height = jso.sqSize; // set held dimensions to match remaining bricks
	n.held.width = jso[color].bricks * jso.thickness;
	setTimeout(function() { n.held.style.display = 'inline-block'; }, 5);
}

function seize(event, color) {
	if (jso.holding === 0) {
		removeBrick(color);
		if (jso.turn == 'black') {
			n.held.src = 'jso/pic/brick-black-held.png';
		}
		else {
			n.held.src = 'jso/pic/brick-white-held.png';
		}
		n.held.width = jso.heldSize;
		n.held.height = jso.heldSize;
		jso.holding = 1;
		jso.move.x = event.targetTouches[0].pageX;
		jso.move.y = event.targetTouches[0].pageY;
		refreshHeld();
	}
}

function move(event) {
	if (jso.holding === 1) {
		jso.move.x = event.targetTouches[0].pageX;
		jso.move.y = event.targetTouches[0].pageY;
		refreshHeld();
	}
}

function drop(event) {
	if (jso.holding === 1) {
		if ((jso.move.y > n.can.offsetTop && jso.move.y < (n.can.offsetTop+n.can.height)) && square(pixToSq(jso.move.x), pixToSq(jso.move.y-128)).state === 0) {
			n.held.style.display = 'none';
			confirmMove();
		}
		else {
			n.held.style.display = 'none';
			addBrick(jso.turn);
			resetHeld(jso.turn);
		}
		jso.holding = 0;
	}
}

function sqToPix(sq) {
	// calculate pixel coordinates for square sq (one dimension)
	return (sq * (jso.sqSize+jso.borderWidth)) + (jso.borderWidth/2);
}

function pixToSq(pix) {
	// calculate square coordinates for pixel coordinate pix (one dimension)
	return Math.floor((pix / (jso.sqSize+jso.borderWidth)));
}

function square(xPos, yPos) {
	var state = 0;
	var color = 0;
	state = jso.board[xPos][yPos].state;
	if (jso.board[xPos][yPos].color === 0) color = 0;
	else color = jso.board[xPos][yPos].color;
	return {
		'state' : state,
		'color' : color
	};
}

function validateMove() {

}

function placeBrick(color, xPos, yPos) {
	if (!color || !xPos || !yPos) {
		alert('ERROR: Function placeBrick requires that parameters color, xPos, and yPos be specified.');
		return;
	}
	jso.board[xPos][yPos].state = 1;
	jso.board[xPos][yPos].color = color;
	var xCoord = sqToPix(xPos);
	var yCoord = sqToPix(yPos);
	var img = new Image();
	img.onload = function() {
		jso.ctx.drawImage(img, xCoord, yCoord);
	}
	if (color === 'black') {
		img.src = 'jso/pic/brick-black.png';
	}
	else {
		img.src = 'jso/pic/brick-white.png';
	}
}

function assignListeners() {
	var buttons = document.getElementsByClassName('button');
	n.held.addEventListener('touchstart', function() { seize(event, jso.turn); }, false);
	n.held.addEventListener('touchmove', function() { move(event); }, false);
	n.held.addEventListener('touchend', function() { drop(event); }, false);
	n.confirmWhiteNo.addEventListener('touchend', function() {
		if (touchIsWithin(
			event,
			(768-(findPos(n.confirmWhiteNo)[0] + n.confirmWhiteNo.offsetWidth)),
			(jso.confirmOffsetTop),
			(768 - findPos(n.confirmWhiteNo)[0]),
			(jso.confirmOffsetTop+n.confirmWhiteNo.offsetHeight-1)
		)) {
			addBrick(jso.turn);
			resetHeld(jso.turn);
			hideConfirm();
		}
	}, false);
	n.confirmWhiteYes.addEventListener('touchend', function() {
		if (touchIsWithin(
			event,
			(768-(findPos(n.confirmWhiteYes)[0] + n.confirmWhiteYes.offsetWidth)),
			(jso.confirmOffsetTop),
			(768 - findPos(n.confirmWhiteYes)[0]),
			(jso.confirmOffsetTop+n.confirmWhiteYes.offsetHeight-1)
		)) {
			if (validateMove()) {
				nextTurn();
			}
			else {
				addBrick(jso.turn);
				resetHeld(jso.turn);
				hideConfirm();	
			}
		}
	}, false);
	n.confirmBlackNo.addEventListener('touchend', function() {
		if (jso.confirmBlackVis === 1 && touching(event, n.confirmBlackNo)) {
			addBrick(jso.turn);
			resetHeld(jso.turn);
			hideConfirm();
		}
	}, false);
	n.confirmBlackYes.addEventListener('touchend', function() {
		if (jso.confirmBlackVis === 1 && touching(event, n.confirmBlackYes)) {
			if (validateMove()) {
				nextTurn();
			}
			else {
				addBrick(jso.turn);
				resetHeld(jso.turn);
				hideConfirm();	
			}
		}
	}, false);
}

function load() {
	// runs on page load
	checkComp();
	n = getElementsWithId(); // all elements with ID
	assignListeners();
	setCanvasContexts();
	setTimeout("fillHolders();", 400);
	prepareGame();
}

function BlockMove(event) {
	// Tell Safari not to move the window.
	event.preventDefault();
}

	

