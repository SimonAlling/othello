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
jso.gonnaFlipAll = [];
jso.autoPassed = 0; // how many times in a row any player has been forced to pass
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
jso.redSquare = {
	'present' : false,
	'x' : 0,
	'y' : 0
};

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
		drawBrick('black', 3, 3);
		drawBrick('white', 4, 3);
		drawBrick('white', 3, 4);
		drawBrick('black', 4, 4);
		nextTurn();
	}
	else {
		jso.prep = setTimeout("prepareGame()", 200);
	}
}

function setCanvasContexts() {
	jso.white.ctx = n.white.getContext('2d');
	jso.black.ctx = n.black.getContext('2d');
	jso.white.brickctx = n.brickWhite.getContext('2d');
	jso.black.brickctx = n.brickBlack.getContext('2d');
	jso.ctx = n.can.getContext('2d');
	
	// Draw bricks on invisible canvases
	var imgB = new Image();
	imgB.onload = function() {
		jso.black.brickctx.drawImage(imgB, 0, 0);
	};
	imgB.src = 'jso/pic/brick-black.png';
	
	var imgW = new Image();
	imgW.onload = function() {
		jso.white.brickctx.drawImage(imgW, 0, 0);
	};
	imgW.src = 'jso/pic/brick-white.png';
	
	// "Unavailable" icon
	try {
	
	var imgU = new Image();
	imgU.onload = function() {
		n.un.getContext('2d').drawImage(imgU, 264, 30, 88, 88, 0, 0, 88, 88);
	};
	imgU.src = 'jso/pic/sprites.png';
	
	} catch(e) {alert('setcc | ' + e);}
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

function canPlay(c) {

	var myReturn = false;
	for (x in jso.board) {
		for (y in jso.board[x]) {
			if (validateMove(c, x, y) === true) {
				myReturn = true;
				break;
			}
		}
	}
	return myReturn;
}

function nextTurn() {
	if (jso.holding === 0) {
		if (jso.turn == 'black') {
			// change to WHITE
			jso.turn = 'white';
		}
		else {
			// change to BLACK
			jso.turn = 'black';
		}
		hideConfirm();
		resetHeld(jso.turn);
		if (canPlay(jso.turn) === true) {
			jso.autoPassed = 0;
	alert(jso.turn + ' can play.');
		}
		else {
			jso.autoPassed++;
			nextTurn();
		}
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
		if (jso.redSquare.present === true) {
			unred(jso.redSquare.x, jso.redSquare.y);
		}
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
			var x = pixToSq(jso.move.x);
			var y = pixToSq(jso.move.y-128);
			placeBrick(jso.turn, x, y);
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

function flipBrick(x, y) {
	var c = 'white';
	if (jso.board[x][y].color === 'white') {
		c = 'black';
	}
	clearSq(x, y);
	drawBrick(c, x, y);
}

function flips(c, xStart, yStart, xInc, yInc) {
	var f = 0;
	var hasPassedOwn = false;
	var oc = 'white'; // opponent's color
	if (c === 'white') oc = 'black';
	var curX = xStart+xInc;
	var curY = yStart+yInc;
	var gonnaFlip = [];
	while (curX > -1 && curX < jso.bWidth+1 && curY > -1 && curY < jso.bHeight+1) {
	
		if ((curX >= jso.bHeight || curY >= jso.bHeight || curX <= -1 || curY <= -1)) {
			f = 0;
			gonnaFlip = [];
			break;
		}
		else if (jso.board[curX][curY].state === 1 && jso.board[curX][curY].color === c) {
			break;
		}
		else if ((jso.board[curX][curY].state === 0)) {
			f = 0;
			gonnaFlip = [];
			break;
		}
		else if (jso.board[curX][curY].state === 1 && jso.board[curX][curY].color === oc) {
			f++;
			gonnaFlip.push([curX, curY]);
			curX += xInc;
			curY += yInc;
		}
	}
	jso.gonnaFlipAll = jso.gonnaFlipAll.concat(gonnaFlip);
	return f;
}

function validateMove(color, x, y) {
	var myReturn = false;
	var numFlipped = 0;
	jso.gonnaFlipAll = [];
	numFlipped += (flips(color, x, y, 0, -1));
	numFlipped += (flips(color, x, y, 1, -1));
	numFlipped += (flips(color, x, y, 1, 0));
	numFlipped += (flips(color, x, y, 1, 1));
	numFlipped += (flips(color, x, y, 0, 1));
	numFlipped += (flips(color, x, y, -1, 1));
	numFlipped += (flips(color, x, y, -1, 0));
	numFlipped += (flips(color, x, y, -1, -1));
	if (jso.board[x][y].state === 0 && numFlipped > 0) { myReturn = true; }
	return myReturn;
}

function drawBrick(color, xPos, yPos) {
		jso.board[xPos][yPos].state = 1;
		jso.board[xPos][yPos].color = color;
		var xCoord = sqToPix(xPos);
		var yCoord = sqToPix(yPos);
		if (color === 'black') {
			jso.ctx.drawImage(n.brickBlack, xCoord, yCoord);
		}
		else {
			jso.ctx.drawImage(n.brickWhite, xCoord, yCoord);
		}
}

function red(x, y) {
	// make square (x, y) red if placing a brick there is not allowed
	jso.redSquare.present = true; // tell engine that red square exists
	jso.redSquare.x = x; // coords of red square
	jso.redSquare.y = y;
	jso.ctx.fillStyle = 'rgba(200,0,0,0.3)'; // gonna use semi-transparent red to fill the square
	var fillX = sqToPix(x); // pixel coords of square
	var fillY = sqToPix(y);
//	jso.ctx.fillRect(fillX, fillY, jso.sqSize, jso.sqSize); // fill square with red
	jso.ctx.drawImage(n.un, fillX, fillY); // draw "Unavailable" icon on square
}

function unred(x, y) {
	// clear red square and make it non-red
	jso.redSquare.present = false;
	clearSq(x, y);
}

function placeBrick(color, xPos, yPos) {
	if (!color || xPos === undefined || yPos === undefined) {
		alert('ERROR: Function placeBrick requires that parameters color, xPos, and yPos be specified.');
		return;
	}
	if (validateMove(color, xPos, yPos)) {
		drawBrick(color, xPos, yPos);
		confirmMove();
	}
	else {
		cancelMove();
		red(xPos, yPos);
	}
}

function clearSq(x, y) {
	jso.board[x][y].state = 0;
	jso.board[x][y].color = 0;
	var xCoord = sqToPix(x);
	var yCoord = sqToPix(y);
	jso.ctx.clearRect(xCoord, yCoord, jso.sqSize, jso.sqSize);
}

function cancelMove() {
	var x = pixToSq(jso.move.x);
	var y = pixToSq(jso.move.y-128);
	addBrick(jso.turn);
	resetHeld(jso.turn);
	clearSq(x, y);
}

function confirm() {
	for (i in jso.gonnaFlipAll) {
		flipBrick(jso.gonnaFlipAll[i][0], jso.gonnaFlipAll[i][1]);
	}
	nextTurn();
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
			hideConfirm();
			cancelMove();
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
			confirm();
		}
	}, false);
	n.confirmBlackNo.addEventListener('touchend', function() {
		if (jso.confirmBlackVis === 1 && touching(event, n.confirmBlackNo)) {
			hideConfirm();
			cancelMove();
		}
	}, false);
	n.confirmBlackYes.addEventListener('touchend', function() {
		if (jso.confirmBlackVis === 1 && touching(event, n.confirmBlackYes)) {
			confirm();
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

	

