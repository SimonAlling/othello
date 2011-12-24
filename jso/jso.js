// JS Othello by Simon Alling
// HTML5, CSS3 and JavaScript only.
// Works with iPad with iOS 3.2 and later.

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
jso.loadingDir = 0;
jso.timerRotate = 0;
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
	bricksFinal : 0,
	ctx : 0
};
jso.black = {
	bricks : 0,
	bricksTotal : 32,
	bricksFinal : 0,
	ctx : 0
};
jso.playing = false;
jso.changesMade = false;


function opp(color) {
	if (color === 'black') {
		return 'white';
	}
	else if (color === 'white') {
		return 'black';
	}
	else {
		alert('ERROR: Function opp requires that either "black" or "white" be passed to it.');
		return false;
	}
}

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
	var elementsWithId = {};
	var allElements = document.getElementsByTagName('*'); // get all elements in the document
	for (i = 0; i < allElements.length; i++) {
		if ((allElements[i]).getAttribute('id')) { // test if the current element has an ID...
			elementsWithId[(allElements[i]).getAttribute('id')] = allElements[i]; // ... and if it does, add the element to returnedElements
		}
	}
	return elementsWithId;
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
	if (jso.fillCount === jso.white.bricksTotal-2) {
		clearTimeout(t);
	}
}

function rotateLoading() {
	jso.loadingDir++;
	if (jso.loadingDir == 3600) {
		jso.loadingDir = 0; // ensure that it doesn't reach extreme values
	}
	var newRot = jso.loadingDir * 90;
	n.loadingImg.style.WebkitTransform = 'rotate('+ newRot +'deg)';
	jso.timerRotate = setTimeout('rotateLoading()', 250);
}

function hideLoading() {
	n.loading.style.opacity = '0';
	setTimeout(function() { n.loading.style.display = 'none'; }, 500)
}

function doPrepare() {
	if (jso.black.bricks == (jso.bricksTotal/2)-2) {
		clearTimeout(jso.prep);
		n.held.style.display = 'inline-block';
		drawBrick('black', 3, 3);
		drawBrick('white', 4, 3);
		drawBrick('white', 3, 4);
		drawBrick('black', 4, 4);
		setTimeout(function() { n.can.style.opacity = '1'; }, 200);
		n.turnOverlayWhite.style.display = 'block';
		n.turnOverlayBlack.style.display = 'block';
		setTimeout('hideLoading()', 400);
		
		
	// FAKE GAME, REMOVE 
/*	try {
	
	jso.board[4][3].state = 1;
	jso.board[4][3].color = 'black';
	drawBrick('black', 4, 3);
	jso.board[6][1].state = 1;
	jso.board[6][1].color = 'white';
	drawBrick('white', 6, 1);
	
	} catch(e)  { alert(e); }
*/
			// END OF FAKE
		
		
		
		
		nextTurn();
	}
	else {
		jso.prep = setTimeout("doPrepare()", 200);
	}
	
	
}

function resetGame() {
	jso.playing = true;
	jso.changesMade = false;
	hideConfirm();
	n.turnOverlayWhite.style.display = 'none';
	n.turnOverlayBlack.style.display = 'none';
	n.menuResume.style.display = 'none';
	jso.white.bricks = 0;
	jso.black.bricks = 0;
	jso.ctx.clearRect(0,0,768,768); // Clear board canvas
	jso.white.ctx.clearRect(0,0,768,768); // Clear holder canvases
	jso.black.ctx.clearRect(0,0,768,768);
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

}

function prepareGame() {
	clearTimeout(jso.timerRotate);
	n.loading.style.opacity = '1';
	n.loading.style.display = 'block'; 
	rotateLoading();
	resetGame();
	setTimeout("fillHolders();", 600);
	doPrepare();
}

function setCanvasContexts() {
	jso.white.ctx = n.white.getContext('2d');
	jso.black.ctx = n.black.getContext('2d');
	jso.white.brickctx = n.brickWhite.getContext('2d');
	jso.black.brickctx = n.brickBlack.getContext('2d');
	jso.white.brickHeldctx = n.brickWhiteHeld.getContext('2d');
	jso.black.brickHeldctx = n.brickBlackHeld.getContext('2d');
	jso.ctx = n.can.getContext('2d');
	jso.held = n.held.getContext('2d');
	jso.held.drawImage(n.brickBlackHeld, 0, 0);
	
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
	
	// Held
	var imgBH = new Image();
	imgBH.onload = function() {
		jso.black.brickHeldctx.drawImage(imgBH, 0, 0);
	};
	imgBH.src = 'jso/pic/brick-black-held.png';
	
	var imgWH = new Image();
	imgWH.onload = function() {
		jso.white.brickHeldctx.drawImage(imgWH, 0, 0);
	};
	imgWH.src = 'jso/pic/brick-white-held.png';
	
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

function stopGame() {
	setTimeout(function() {
		n.held.style.display = 'none';
		jso.black.bricksFinal = 0;
		jso.white.bricksFinal = 0;
		// Loop through board and sum bricks up
		for (x in jso.board) {
			for (y in jso.board[x]) {
				if (jso.board[x][y].state === 1) {
					jso[(jso.board[x][y].color)].bricksFinal++; // Increase corresponding bricksFinal
				}
			}
		}
		var msgWhite = '';
		var msgBlack = '';
		if (jso.black.bricksFinal > jso.white.bricksFinal) {
			msgWhite = 'You lost with ' + jso.white.bricksFinal + ' to ' + jso.black.bricksFinal + '.';
			msgBlack = 'You won with ' + jso.black.bricksFinal + ' to ' + jso.white.bricksFinal + '.';
		}
		else if (jso.white.bricksFinal > jso.black.bricksFinal) {
			msgWhite = 'You won with ' + jso.white.bricksFinal + ' to ' + jso.black.bricksFinal + '.';
			msgBlack = 'You lost with ' + jso.black.bricksFinal + ' to ' + jso.white.bricksFinal + '.';
		}
		else {
			msgWhite = msgBlack = 'Tie: Both players have ' + jso.black.bricksFinal + ' bricks on the board.';
		}
		setTimeout(function() {
			n.turnOverlayWhiteText.innerHTML = msgWhite;
			n.turnOverlayWhite.style.zIndex = '1100';
			n.turnOverlayWhite.style.opacity = '1';
			n.turnOverlayBlackText.innerHTML = msgBlack;
			n.turnOverlayBlack.style.zIndex = '1100';
			n.turnOverlayBlack.style.opacity = '1';
		}, 100);
	}, 20);
}

function passTurn(color) {
	// previous player had to pass
	if (canPlay(opp(color)) === false || (jso.black.bricks + jso.white.bricks === 0)) {
		stopGame();
	}
	else {
		if (color === 'black') {
			n.turnOverlayBlackText.innerHTML = 'No possible move.';
		}
		else {
			n.turnOverlayWhiteText.innerHTML = 'No possible move.';
		}
		setTimeout(function() {
			nextTurn();
		}, 6500);
	}
}

function canPlay(c) {
	var myReturn = false;
	for (x = 0; x < jso.board.length; x++) {
		for (y = 0; y < jso.board[x].length; y++) {
			if (validateMove(c, x, y) === true) {
				myReturn = true;
				break;
			}
		}
	}
	return myReturn;
}

function nextTurn() {
try {


	n.turnOverlayBlackText.innerHTML = "It's White's turn.";
	n.turnOverlayWhiteText.innerHTML = "It's Black's turn.";
	if (jso.holding === 0) {
		var prevTurn = jso.turn;
			if (jso.turn == 'black') {
				// change to WHITE
				jso.turn = 'white';
				setTimeout(function() {
					n.turnOverlayBlack.style.zIndex = '1100';
					n.turnOverlayBlack.style.opacity = '1';
				}, 50);	
			}
			else {
				// change to BLACK
				jso.turn = 'black';
				setTimeout(function() {
					n.turnOverlayWhite.style.zIndex = '1100';
					n.turnOverlayWhite.style.opacity = '1';
				}, 50);
			}
		hideConfirm();
		resetHeld(jso.turn);
		if (canPlay(jso.turn) === true) {
		//	alert(jso.turn + ' can play.');
			if (jso[jso.turn].bricks === 0) {
				removeBrick(prevTurn);
				addBrick(jso.turn);
			}
			jso.autoPassed = 0;
			if (jso.turn == 'white') {
				n.turnOverlayWhite.style.opacity = '0';
				setTimeout(function() {
					n.turnOverlayWhite.style.zIndex = '-100';
				}, 150);
			}
			else {
				n.turnOverlayBlack.style.opacity = '0';
				setTimeout(function() {
					n.turnOverlayBlack.style.zIndex = '-100';
				}, 150);
			}
		}
		else {
		//	debug('print', jso.turn + ' can NOT play.<br />' + jso.autoPassed); // REMOVE
		//	alert(jso.turn + ' can NOT play.');
			jso.autoPassed++;
			passTurn(jso.turn);
		}
	}
	
	} catch(e) { alert(e); }
}

function hideConfirm() {
	jso.confirmWhiteVis = 0;
	jso.confirmBlackVis = 0;
	n.confirmWWhite.style.WebkitTransform = 'translate3d(0, 140px, 0)';
	n.confirmWBlack.style.WebkitTransform = 'translate3d(0, 140px, 0)';
	n.confirmOverlay.style.zIndex = '700';
}

function confirmMove() {
	n.confirmOverlay.style.zIndex = '2300';
	if (jso.turn === 'black') {
		jso.confirmBlackVis = 1;
		n.confirmWBlack.style.WebkitTransform = 'translate3d(0, 4px, 0)';
	}
	else {
		jso.confirmWhiteVis = 1;
		n.confirmWWhite.style.WebkitTransform = 'translate3d(0, 4px, 0)';
	}
}

function refreshHeld() {
	n.held.style.left = jso.move.x - (jso.heldSize/2) + 'px';
	n.held.style.top = jso.move.y - (jso.heldSize/2) + 'px';
}

function resetHeld(color) {
	setTimeout(function() {
		if (!color) {
			// Felmeddelande
			alert('ERROR: Function resetHeld requires that a color be specified.');
			return;
		}
		n.held.height = jso.sqSize; // set held dimensions to match remaining bricks
		var isMoreThanMin = false;
		if (jso[color].bricks > 3) {
			isMoreThanMin = true;
		}
		if (isMoreThanMin === true) {
			n.held.width = jso[color].bricks * jso.thickness;
		}
		else {
			n.held.width = 4*jso.thickness;
		}
		jso.held.clearRect(0, 0, n.held.width, n.held.height);
		// Place #held on appropriate brick holder
		if (color === 'black') {
			n.held.style.left = '96px';
			n.held.style.top = '912px';
		}
		else if (color === 'white') {
			if (isMoreThanMin === true) {
				var emptySpace = (jso.thickness * ((jso.bricksTotal/2) - jso[color].bricks));
				n.held.style.left = (96 + emptySpace) + 'px';
				n.held.style.top = '24px';
			}
			else {
				var emptySpace = (jso.thickness * ((jso.bricksTotal/2) - 4));
				n.held.style.left = (96 + emptySpace) + 'px';
				n.held.style.top = '24px';
			}
		}
	n.held.style.display = 'inline-block'; }, 2);
}

function seize(event, color) {
	if (jso.holding === 0) {
		if (jso.redSquare.present === true) {
			unred(jso.redSquare.x, jso.redSquare.y);
		}
		removeBrick(color);
		n.held.width = jso.heldSize;
		n.held.height = jso.heldSize;
		jso.holding = 1;
		jso.move.x = event.targetTouches[0].pageX;
		jso.move.y = event.targetTouches[0].pageY;
		refreshHeld();
		if (jso.turn == 'black') {
			jso.held.drawImage(n.brickBlackHeld, 0, 0, jso.heldSize, jso.heldSize);
		}
		else {
			jso.held.drawImage(n.brickWhiteHeld, 0, 0, jso.heldSize, jso.heldSize);
		}
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
	if (!jso.changesMade) {
		jso.changesMade = true;
	}
	if (jso.holding === 1) {
		if ((jso.move.y > n.can.offsetTop && jso.move.y < (n.can.offsetTop+n.can.height)) && square(pixToSq(jso.move.x), pixToSq(jso.move.y-128)).state === 0) {
			n.held.style.display = 'none';
			var x = pixToSq(jso.move.x);
			var y = pixToSq(jso.move.y-128);
			setTimeout(function() { placeBrick(jso.turn, x, y); }, 1);
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
	var oc = 'white'; // opponent's color
	if (c === 'white') oc = 'black';
	var curX = 0;
	curX = xStart;
	var curY = 0;
	curY = yStart;
	var gonnaFlip = [];
	while (curX > -1 && curX < jso.bWidth+1 && curY > -1 && curY < jso.bHeight+1) {
			curX = parseInt(curX + xInc);
			curY = parseInt(curY + yInc);
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
try {
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
	
} catch(e) {alert(e);}
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

function newGame() {
	if (jso.changesMade === false) {
		hideMenu();
		prepareGame();
	}
	else {
		hideMenu();
		prepareGame();
	}
}

function showSettings() {
	n.menuWrapper.style.WebkitTransform = 'translate3d(-768px, 0, 0)';
	n.settingsWrapper.style.WebkitTransform = 'translate3d(-768px, 0, 0)';
}

function assignListeners() {
	var buttons = document.getElementsByClassName('button'); // REMOVE
	n.menuNew.addEventListener('touchend', function() {
		if (touching(event, n.menuNew)) {
			newGame();
		}
	}, false);
	n.menuSettings.addEventListener('touchend', function() {
		if (touching(event, n.menuSettings)) {
			showSettings();
		}
	}, false);
	n.menuResume.addEventListener('touchend', function() {
		if (touching(event, n.menuResume)) {
			hideMenu();
		}
	}, false);
	// Menu button white
	n.openMenuWhite.addEventListener('touchend', function() {
		if (touching(event, n.openMenuWhite)) {
			openMenu();
		}
	}, false);
	// Menu button black
	n.openMenuBlack.addEventListener('touchend', function() {
		if (touching(event, n.openMenuBlack)) {
			openMenu();
		}
	}, false);
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

function openMenu() {
	if (jso.playing === true) {
		n.menuResume.style.display = 'block';
	}
	var t = setTimeout(function() {
		n.menuWrapper.style.WebkitTransform = 'translate3d(0, 0, 0)';
	}, 100);
}

function hideMenu() {
	var t = setTimeout(function() {
		n.menuWrapper.style.WebkitTransform = 'translate3d(768px, 0, 0)';
	}, 100);
}

function prepareMenu() {
	n.menuWrapper.style.display = 'block';
	n.menuWrapper.style.zIndex = '3000';
	if (jso.playing === true) {
		n.menuResume.style.display = 'block';
	}
	n.splashWrapper.style.WebkitTransform = 'translate3d(128px, 64px, 0)';
	n.menuResume.style.WebkitTransform = 'translate3d(0, 0, 0)';
	n.menuNew.style.WebkitTransform = 'translate3d(0, 0, 0)';
	n.menuSettings.style.WebkitTransform = 'translate3d(0, 0, 0)';
}

window.onerror = function(e) {
	alert(e);
}

function load() {
	// Runs on page load.
	checkComp();
	n = getElementsWithId(); // All elements with ID
	assignListeners();
	setCanvasContexts();
	setTimeout(prepareMenu, 500);
}

function BlockMove(event) {
	// Tell Safari not to move the window.
	event.preventDefault();
}

// DEBUGGING FUNCTION
function debug(action, variable) {
	switch(action) {
		case 'print':
			n.debug.style.backgroundColor = 'red';
			n.debug.innerHTML = variable;
			break;
		default:
			alert('ERROR: Debugging action unknown.');
			return false;
	}
}