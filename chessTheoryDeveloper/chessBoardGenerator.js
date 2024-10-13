//diagramm
var cy = cytoscape({
	container: document.getElementById('cy'), // container to render in

	elements: [ // list of graph elements to start with
            ],

	style: [ // the stylesheet for the graph
		{
			selector: 'node',
			style: {
				'shape': 'rectangle',
				'width': 50,
				'height': 50,
				'background-color': 'saddlebrown',
				'label': 'data(id)', // Set the label to display the id
				'text-halign': 'center', // Center the text horizontally
				'text-valign': 'center',

			},
                },
		{
			selector: 'edge',
			style: {
				'width': 3,
				'line-color': 'black',
				'target-arrow-color': 'black',
				'target-arrow-shape': 'triangle'
			}
                }
            ],

	layout: {
		name: 'breadthfirst'
	}
});


// Get the chessboard element 
var chessHistory = [{
	piece: "none",
	from: {
		x: -1,
		y: -1
	},
	to: {
		x: -1,
		y: -1
	},
	take: false
}]
let gameOn = true
let chessWidth = 8;
let chessHeight = 8;
let castle = {
	bool: false,
	x: 0,
	y: 0
};
let enPassant = {
	bool: false,
	x: 0,
	y: 0
}
let chessBoard = document.getElementById("chessboard");
let promotionSquare = document.getElementById("promotion");
let chessBoardArray = []
let letters = "abcdefgh"
// Define colors for light and dark squares
let lightSquareColor = "white";
let darkSquareColor = "black";

let q = document.getElementById("queen")
let r = document.getElementById("rook")
let b = document.getElementById("bishop")
let n = document.getElementById("knight")


var chessPieces = []
var blackChessPieces = []
var whiteChessPieces = []
var draggedPiece;
var color = "white"
var pawn = createChessPiecePrototype("", {
	white: "https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/wp.png",
	black: "https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/bp.png"
}, m_pawn)
var rook = createChessPiecePrototype("R", {
	white: "https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/wr.png",
	black: "https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/br.png"
}, m_rook)
var bishop = createChessPiecePrototype("B", {
	white: "https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/wb.png",
	black: "https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/bb.png"
}, m_bishop)
var queen = createChessPiecePrototype("Q", {
	white: "https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/wq.png",
	black: "https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/bq.png"
}, m_queen)
var knight = createChessPiecePrototype("N", {
	white: "https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/wn.png",
	black: "https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/bn.png"
}, m_knight)
var king = createChessPiecePrototype("K", {
	white: "https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/wk.png",
	black: "https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/bk.png"
}, m_king)

cy.on('tap', 'node', function (evt) {
	selectedNode = evt.target;
	console.log('tapped ' + selectedNode.id(), evt.target.data('chessPos'),evt.target.data('color'));
	for(let i = 0;i < chessBoard.children.length;i++){
		clearSquare(chessBoard.children[i])
	}
	decodeChessPieces(selectedNode.data("chessPos")).forEach(function(piece){
		let p = createChessPiece(piece.type,piece.pos,piece.color)
		console.log(piece.type)
		p.turns = piece.turns
	})
	color = selectedNode.data("color")
})

function moveWritter(move) {
	var x = move.take ? "x" : ""
	var c = move.color == "white" ? whiteChessPieces.slice() : blackChessPieces.slice()
	c.splice(c.findIndex(function (el) {
		return el.pos.x == move.to.x && el.pos.y == move.to.y
	}), 1)
	var fromChar = letters[move.from.x]
	var from = c.some(function (p) {
		if (p.pos.x == move.from.x) {
			fromChar = move.from.y
		} else {
			fromChar = letters[move.from.x]
		}
		return p.type.condition({
			piece: move.take ? (move.color == "white" ? "black" : "white") : 0,
			x: move.to.x,
			y: move.to.y
		}, p) && p.type.name == move.piece
	}) ? fromChar : ""
	var to = letters[move.to.x] + move.to.y
	return move.piece + from + x + to
}
// Counter for square IDs
let squareId = 0;

function promote1(color) {
	promotionSquare.style.display = "grid"

	q.style.backgroundImage = `url('https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/${color[0]}q.png')`
	r.style.backgroundImage = `url('https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/${color[0]}r.png')`
	b.style.backgroundImage = `url('https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/${color[0]}b.png')`
	n.style.backgroundImage = `url('https://images.chesscomfiles.com/chess-themes/pieces/neo_wood/150/${color[0]}n.png')`
	q.addEventListener("click", function () {
		draggedPiece.chessPiece.type = queen
		gameOn = true
		draggedPiece.style.backgroundImage = `url(${draggedPiece.chessPiece.type.image[color]})`
		promotionSquare.style.display = "none"
		draggedPiece = ""
	})
	r.addEventListener("click", function () {
		draggedPiece.chessPiece.type = rook
		gameOn = true
		draggedPiece.style.backgroundImage = `url(${draggedPiece.chessPiece.type.image[color]})`
		promotionSquare.style.display = "none"
		draggedPiece = ""
	})
	b.addEventListener("click", function () {
		draggedPiece.chessPiece.type = bishop
		draggedPiece.style.backgroundImage = `url(${draggedPiece.chessPiece.type.image[color]})`
		gameOn = true
		promotionSquare.style.display = "none"
		draggedPiece = ""
	})
	n.addEventListener("click", function () {
		draggedPiece.chessPiece.type = knight
		draggedPiece.style.backgroundImage = `url(${draggedPiece.chessPiece.type.image[color]})`
		gameOn = true
		promotionSquare.style.display = "none"
		draggedPiece = ""
	})
	gameOn = false
}


// Function to create a chess square with the given color
function createChessSquare(color) {
	let chessSquare = document.createElement("div");
	chessSquare.classList = "square " + color;
	chessSquare.id = squareId;
	chessSquare.draggable = false
	chessSquare.setAttribute("y", 8 - Math.floor(squareId / chessWidth))
	chessSquare.setAttribute("x", squareId - chessWidth * Math.floor(squareId / chessWidth))
	chessBoard.append(chessSquare);
	chessSquare.addEventListener("dragover", handleDragOver);
	chessSquare.addEventListener("drop", handleDrop);
	squareId++;
}

function updateChessBoardArray() {
	chessBoardAr = [];
	chessPieces = []
	chessBoard.childNodes.forEach((square, index) => {
		//if (index != 0) {
		if (square.children.length == 0) {
			chessBoardAr.push({
				piece: 0,
				x: square.getAttribute("x"),
				y: square.getAttribute("y")
			});
		} else {
			chessBoardAr.push({
				piece: square.children[0].chessPiece,
				x: square.getAttribute("x"),
				y: square.getAttribute("y")
			});
			chessPieces.push(square.children[0].chessPiece)
		}
		//}
		return chessBoardAr
	});
	blackChessPieces = chessPieces.filter((item) => {
		return item.color == "black"
	})

	whiteChessPieces = chessPieces.filter((item) => {
		return item.color == "white"
	})
	return chessBoardAr
}
// Create the chessboard pattern

function createChessPiece(type, pos, color) {
	let htmlEl = document.createElement("div");
	//let image = document.createElement("img")
	htmlEl.classList = "chessPiece";
	htmlEl.draggable = true;
	htmlEl.style.backgroundSize = "100%"
	htmlEl.style.backgroundImage = `url(${type.image[color]})`
	//	image.classList = "centered-image"
	//	image.src = type.image[color]
	//	image.draggable = false
	//htmlEl.append(image)
	document.getElementById(pos.x + (8 - pos.y) * chessWidth).append(htmlEl);
	let chessPiece = {
		type: type,
		pos: pos,
		color: color,
		turns: 0,
	};
	htmlEl.addEventListener("dragstart", handleDragStart);
	chessPieces.push(chessPiece)
	if (color == "white") {
		whiteChessPieces.push(chessPiece)
	} else {
		blackChessPieces.push(chessPiece)
	}
	htmlEl.chessPiece = chessPiece;
	return htmlEl;
}

function createChessPiecePrototype(name, image, condition) {
	let chessPiecePrototype = {
		name: name,
		image: image,
		condition: condition
	};
	return chessPiecePrototype;
}

function checkSquare(square) {
	let sq = {
		piece: 0,
		x: parseInt(square.getAttribute("x")),
		y: parseInt(square.getAttribute("y"))
	}
	if (square.children.length != 0) {
		sq.piece = square.children[0].chessPiece.color
	}
	return sq
}

function m_pawn(square, piece, extra = false) {
	const direction = piece.color == "white" ? 1 : -1;
	const promotingRow = piece.color == "white" ? 8 : 1;
	const startRow = piece.color == "white" ? 2 : 7;
	const lastMove = chessHistory[chessHistory.length - 1]
	// Non-capturing move: forward by 1 square
	if (square.piece == 0 && piece.pos.x == square.x && square.y == piece.pos.y + direction) {
		return true;
	}
	// Capturing move: diagonal by 1 square, with an enemy piece
	if (square.piece != 0 && square.piece != piece.color && Math.abs(piece.pos.x - square.x) == 1 && square.y == piece.pos.y + direction) {
		return true;
	}
	//en passant
	if (lastMove.piece == "" && Math.abs(lastMove.from.y - lastMove.to.y) == 2 && Math.abs(lastMove.to.x - square.x) == 0 && Math.abs(piece.pos.x - square.x) == 1 && square.y == piece.pos.y + direction) {
		if (extra) {
			enPassant = {
				bool: true,
				x: lastMove.to.x,
				y: lastMove.to.y
			}
		}
		return true;
	}
	// Two-square initial move (only from the starting row)
	if (square.piece == 0 && piece.pos.x == square.x && piece.pos.y == startRow && square.y == piece.pos.y + 2 * direction && posToTheoreticalSquare(square.x, square.y - direction).piece == 0) {
		return true;
	}

	return false; // If no valid moves are found, return false
}

function m_rook(square, piece, extra = false) {
	let dx = square.x - piece.pos.x; // Difference in x-axis
	let dy = square.y - piece.pos.y; // Difference in y-axis

	// Ensure that the rook is moving in a straight line (either x-axis or y-axis)
	if (dx !== 0 && dy !== 0) {
		return false; // Invalid move (not horizontal or vertical)
	}

	let stepX = (dx !== 0) ? Math.sign(dx) : 0; // Step direction for x (1 for right, -1 for left, 0 if no x movement)
	let stepY = (dy !== 0) ? Math.sign(dy) : 0; // Step direction for y (1 for up, -1 for down, 0 if no y movement)

	let currentX = piece.pos.x + stepX;
	let currentY = piece.pos.y + stepY;

	// Move in the direction of the step (horizontal or vertical)
	while (currentX !== square.x || currentY !== square.y) {
		let currentSquare = posToSquare(currentX, currentY);
		let currentPiece = posToTheoreticalSquare(currentX, currentY);;

		// If there's a piece in the way, the move is invalid
		if (currentPiece.piece != 0) {
			return false;
		}

		// Update current position based on the step
		currentX += stepX;
		currentY += stepY;
	}
	let targetPiece = square.piece;
	if (targetPiece == 0 || targetPiece != piece.color) {
		return true; // Valid move (either empty square or capture)
	}

	return false; // Path is clear
}

function m_bishop(square, piece, extra = false) {
	let dx = square.x - piece.pos.x; // Difference in x-axis
	let dy = square.y - piece.pos.y; // Difference in y-axis

	// Ensure the bishop is moving diagonally (|dx| must equal |dy|)
	if (Math.abs(dx) !== Math.abs(dy)) {
		return false; // Not a valid diagonal move
	}

	// Determine the step direction for both axes (1 or -1)
	let stepX = Math.sign(dx); // Step direction for x-axis
	let stepY = Math.sign(dy); // Step direction for y-axis

	let currentX = piece.pos.x + stepX;
	let currentY = piece.pos.y + stepY;

	// Check each square along the diagonal path
	while (currentX !== square.x || currentY !== square.y) {
		let currentSquare = posToSquare(currentX, currentY);
		let currentPiece = posToTheoreticalSquare(currentX, currentY);

		// If there is any piece along the path, the move is blocked
		if (currentPiece.piece != 0) {
			return false;
		}

		// Move to the next diagonal square
		currentX += stepX;
		currentY += stepY;
	}

	// At the target square, check if it contains an opponent's piece or is empty
	let targetPiece = square.piece;
	if (targetPiece == 0 || targetPiece != piece.color) {
		return true; // Valid move (either empty square or capture)
	}

	return false; // If the target square contains a friendly piece, the move is invalid
}

function m_queen(square, piece, extra = false) {
	let dx = square.x - piece.pos.x; // Difference in x-axis
	let dy = square.y - piece.pos.y; // Difference in y-axis

	// Determine the step direction for both axes (1, -1, or 0)
	let stepX = Math.sign(dx); // Step direction for x-axis
	let stepY = Math.sign(dy); // Step direction for y-axis

	// Ensure valid queen movement (either straight line or diagonal)
	if (!(dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy))) {
		return false; // Invalid queen move (not straight or diagonal)
	}

	let currentX = piece.pos.x + stepX;
	let currentY = piece.pos.y + stepY;

	// Traverse the path until reaching the target square
	while (currentX !== square.x || currentY !== square.y) {
		let currentSquare = posToSquare(currentX, currentY);
		let currentPiece = posToTheoreticalSquare(currentX, currentY);;

		// If there's a piece in the way, the move is invalid
		if (currentPiece.piece != 0) {
			return false;
		}

		// Update current position based on the step
		currentX += stepX;
		currentY += stepY;
	}

	// At the target square, check if it contains an opponent's piece or is empty
	let targetPiece = square.piece;
	if (targetPiece == 0 || targetPiece != piece.color) {
		return true; // Valid move (either empty square or capture)
	}

	return false; // Invalid move if a friendly piece is on the target square
}

function m_knight(square, piece, extra = false) {
	let dx = Math.abs(square.x - piece.pos.x); // Absolute difference in x-axis
	let dy = Math.abs(square.y - piece.pos.y); // Absolute difference in y-axis

	// Check if the move is in an "L" shape: 2 squares in one direction, 1 in the other
	if ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) {
		// Check if the destination square is either empty or contains an opponent's piece
		if (square.piece == 0 || square.piece != piece.color) {
			return true;
		}
	}

	return false; // Invalid knight move
}

function m_king(square, piece, extra = false) {
	let dx = Math.abs(square.x - piece.pos.x); // Absolute difference in x-axis
	let dy = Math.abs(square.y - piece.pos.y); // Absolute difference in y-axis
	let dirX = Math.sign(square.x - piece.pos.x)
	let theRook = piece.color == "white" ? (dirX == -1 ? WLR : WSR) : (dirX == -1 ? BLR : BSR)
	let opp = piece.color == "white" ? blackChessPieces : whiteChessPieces;
	// The king moves one square in any direction
	if (dx <= 1 && dy <= 1) {
		// Check if the destination square is either empty or contains an opponent's piece
		if (square.piece == 0 || square.piece != piece.color) {
			return true;
		}
	} else if (square.piece == 0 && dx == 2 && piece.turns == 0 && theRook.chessPiece.turns == 0 && checkcheck(opp, {
			color: piece.color,
			pos: {
				x: piece.pos.x + dirX,
				y: piece.pos.y
			}
		}) && posToTheoreticalSquare(square.x - dirX, square.y).piece == 0 && posToTheoreticalSquare(square.x - 1, square.y).piece == 0) {
		if (extra) {
			castle = {
				bool: true,
				x: square.x - dirX,
				y: square.y,
				rook: theRook
			}
		}
		return true
	}

	return false; // Invalid king move
}

function posToSquare(x, y) {
	return chessBoard.children[x + (8 - y) * 8]
}

function posToTheoreticalSquare(x, y) {
	return chessBoardArray.find(function (el) {
		return el.x == x && el.y == y
	})
}


function createChessBoard() {
	squareId = 0
	chessBoard.innerHTML = ""
	chessBoard.style.width = 80 * chessWidth + "px";
	chessBoard.style.height = 80 * chessHeight + "px";
	chessBoard.style.gridTemplateColumns = `repeat(${chessWidth}, 1fr)`
	chessBoard.style.gridTemplateRows = `repeat(${chessHeight}, 1fr)`
	let color = darkSquareColor;
	for (let i = 0; i < chessHeight; i++) {
		if (chessWidth % 2 == 0) {
			if (color == lightSquareColor) {
				color = darkSquareColor;
			} else {
				color = lightSquareColor;
			}
		}
		for (let j = 0; j < chessWidth; j++) {
			createChessSquare(color);
			if (color == lightSquareColor) {
				color = darkSquareColor;
			} else {
				color = lightSquareColor;
			}
		}
	}
}

function handleDrop(e) {
	if (draggedPiece.chessPiece.type.condition(checkSquare(this), draggedPiece.chessPiece, true) && gameOn) {
		let ogPos = draggedPiece.parentElement
		let ogPiece = this.children[0]
		let take = checkSquare(this).piece != 0
		clearSquare(this)
		console.log("actual move")
		movePiece(draggedPiece, this)
		chessBoardArray = updateChessBoardArray()
		let opp = draggedPiece.chessPiece.color == "white" ? blackChessPieces : whiteChessPieces;
		let king = draggedPiece.chessPiece.color == "white" ? whiteKing : blackKing
		if (checkcheck(opp, king)) {
			//console.log(chessHistory,checkSquare(this).x,letters)
			if (castle.bool) {
				console.log(castle)
				movePiece(castle.rook, posToSquare(castle.x, castle.y))
			}
			if (enPassant.bool) {
				clearSquare(posToSquare(enPassant.x, enPassant.y))
				take = true
			}
			//let move = draggedPiece.chessPiece.type.name + letters[checkSquare(ogPos).x] + (checkSquare(ogPos).y)
			let oppKing = draggedPiece.chessPiece.color == "white" ? blackKing : whiteKing;
			let move = {
				piece: draggedPiece.chessPiece.type.name,
				from: {
					x: checkSquare(ogPos).x,
					y: checkSquare(ogPos).y
				},
				to: {
					x: checkSquare(this).x,
					y: checkSquare(this).y
				},
				take: take,
				check: false,
				color: color
			}
			console.log(moveWritter(move))
			if (draggedPiece.chessPiece.type.condition({
					color: oppKing.color,
					x: oppKing.pos.x,
					y: oppKing.pos.y
				}, draggedPiece.chessPiece)) {
				move.check = true
			}
			//stalemate
			//every opposite color piece checking all legal moves-> one true -> false
			let thoseP = draggedPiece.chessPiece.color == "white" ? whiteChessPieces : blackChessPieces;
			//stalemate
			//			if (opp.every(function (p) {
			//					let checkSquares = getLegalMoves(p);
			//					console.log(checkSquares,p.type.name)
			//				
			//					return !checkSquares.some(function (square) {
			//						console.log(square,p.type.name)
			//						if(8 > square.x && square.x > -1 && 9 > square.y && square.y > 0){
			//							console.log(p.type.condition(checkSquare(posToSquare(square.x, square.y)), p),p.type.name,p)
			//							if(p.type.condition(checkSquare(posToSquare(square.x, square.y)), p) ){
			//								let pos = structuredClone(p.pos)
			//								let turns = p.turn
			//								moveTheoretically(p,square)
			//								console.log("checkcheck",p,p.pos.x,p.pos.y,thoseP,oppKing,JSON.parse(JSON.stringify(posToTheoreticalSquare(5,6).piece)),square)
			//								if(checkcheck(thoseP, oppKing)){
			//									moveTheoretically(p,pos)
			//									return true
			//								   }else{
			//									   moveTheoretically(p,pos)
			//									   return false
			//								   }
			//							}
			//					}else{
			//						return false
			//					}
			//					})
			//				})) {
			//				alert("stalemate")
			//			}
			let promotionRank = draggedPiece.chessPiece.color == "white" ? 8 : 1;
			if (draggedPiece.chessPiece.type.name == "" && checkSquare(this).y == promotionRank) {
				promote1(draggedPiece.chessPiece.color)
			} else {
				draggedPiece = ""
			}
			chessHistory.push(move)
			color = color == "white" ? "black" : "white"
			createNode(moveWritter(move))
		} else {
			console.log(ogPos)
			draggedPiece.chessPiece.turns -= 1
			movePiece(draggedPiece, ogPos)
			if (ogPiece != undefined) {
				this.append(ogPiece)
			}
			chessBoardArray = updateChessBoardArray()
		}
	}

}

function movePiece(piece, square) {
	//console.log("moved")
	square.append(piece)
	piece.chessPiece.turns += 1
	piece.chessPiece.pos.x = parseInt(square.getAttribute("x"))
	piece.chessPiece.pos.y = parseInt(square.getAttribute("y"))
	//updateChessBoardArray();
}

function moveTheoretically(piece, square) {
	piece.pos.x = square.x
	piece.pos.y = square.y
}

function handleDragStart(e) {
	if (e.target.chessPiece.color == color) {
		draggedPiece = e.target;
	}
	//console.log(e.target.chessPiece)
}

function handleDragOver(e) {
	e.preventDefault();
}

function clearSquare(square) {
	console.log("clear")
	square.innerHTML = ""
}

function checkcheck(opp, king) {
	//	opp.forEach(function (p) {
	//		if (p.type.condition({
	//				piece: king.color,
	//				x: king.pos.x,
	//				y: king.pos.y
	//			}, p)) {
	//		}
	//	})
	return !opp.some(function (p) {
		//console.log(p,p.type.condition({piece:king.color,x:king.pos.x,y:king.pos.y},p))
		return p.type.condition({
			piece: king.color,
			x: king.pos.x,
			y: king.pos.y
		}, p)
	})
}
createChessBoard()

for (let i = 0; i < 8; i++) {
	createChessPiece(pawn, {
		x: i,
		y: 2
	}, "white")
	createChessPiece(pawn, {
		x: i,
		y: 7
	}, "black")
}
let WLR = createChessPiece(rook, {
	x: 0,
	y: 1
}, "white")
let WSR = createChessPiece(rook, {
	x: 7,
	y: 1
}, "white")
let BLR = createChessPiece(rook, {
	x: 0,
	y: 8
}, "black")
let BSR = createChessPiece(rook, {
	x: 7,
	y: 8
}, "black")

createChessPiece(knight, {
	x: 1,
	y: 1
}, "white")
createChessPiece(knight, {
	x: 6,
	y: 1
}, "white")
createChessPiece(knight, {
	x: 1,
	y: 8
}, "black")
createChessPiece(knight, {
	x: 6,
	y: 8
}, "black")

createChessPiece(bishop, {
	x: 2,
	y: 1
}, "white")
createChessPiece(bishop, {
	x: 5,
	y: 1
}, "white")
createChessPiece(bishop, {
	x: 2,
	y: 8
}, "black")
createChessPiece(bishop, {
	x: 5,
	y: 8
}, "black")

createChessPiece(queen, {
	x: 3,
	y: 1
}, "white")
createChessPiece(queen, {
	x: 3,
	y: 8
}, "black")
var blackKing = createChessPiece(king, {
	x: 4,
	y: 8
}, "black").chessPiece
var whiteKing = createChessPiece(king, {
	x: 4,
	y: 1
}, "white").chessPiece


// This function generates possible legal moves for a piece based on its type and current position
function getLegalMoves(piece) {
	let moves = [];
	let pieceType = piece.type.name;
	let position = piece.pos;
	// Check the type of the piece and generate possible moves
	switch (pieceType) {
		case "":
			let dir = piece.color == "white" ? 1 : -1
			moves = [{
				x: position.x + 1,
				y: position.y + dir
			}, {
				x: position.x - 1,
				y: position.y + dir
			}, {
				x: position.x,
				y: position.y + dir
			}, {
				x: position.x,
				y: position.y + dir
			}, {
				x: position.x,
				y: position.y + dir * 2
			}, {
				x: position.x,
				y: position.y + dir * 2
			}]
			break;
		case "R":
			moves = getLinearMoves(position, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
			break;
		case "N":
			moves = [{
				x: position.x + 1,
				y: position.y + 2
			}, {
				x: position.x - 1,
				y: position.y + 2
			}, {
				x: position.x + 2,
				y: position.y + 1
			}, {
				x: position.x - 2,
				y: position.y + 1
			}, {
				x: position.x + 1,
				y: position.y - 2
			}, {
				x: position.x - 1,
				y: position.y - 2
			}, {
				x: position.x + 1,
				y: position.y - 2
			}, {
				x: position.x - 1,
				y: position.y - 2
			}]
			break;
		case "B":
			moves = getLinearMoves(position, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
			break;
		case "Q":
			moves = getLinearMoves(position, [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]);
			break;
		case "K":
			moves = [{
				x: position.x + 1,
				y: position.y
			}, {
				x: position.x - 1,
				y: position.y
			}, {
				x: position.x,
				y: position.y + 1
			}, {
				x: position.x,
				y: position.y - 1
			}, {
				x: position.x + 1,
				y: position.y + 1
			}, {
				x: position.x - 1,
				y: position.y - 1
			}, {
				x: position.x + 1,
				y: position.y - 1
			}, {
				x: position.x - 1,
				y: position.y + 1
			}]
			break;
		default:
			moves = []; // For other pieces or empty squares, no moves
	}

	return moves;
}

function getLinearMoves(position, directions) {
	let moves = [];
	for (let direction of directions) {
		let x = position.x + direction[0];
		let y = position.y + direction[1];

		while (8 > x && x > -1 && 9 > y && y > 0) {
			moves.push({
				x: x,
				y: y
			});
			x += direction[0];
			y += direction[1];
		}
	}
	return moves;
}
chessBoardArray = updateChessBoardArray()
function createNode(name){
	const parentPos = selectedNode.position();
	const parentName = selectedNode.id()
	let count= selectedNode.connectedEdges().length
	let depth = selectedNode.data("depth")
	if(parentName == "start"){
		count += 1
	}
	let dclone = encodeChessPieces(chessPieces)
	let node  = cy.add({
	group: 'nodes',
	data: {
		weight: 75,
		id: name,
		//for some reason it becomes its last child(without the first one)
		chessPos: dclone,
		color:color
	},
	//position: {x:parentPos.x+100,y:parentPos.y + Math.floor(count/2)*200/depth*1.5 * (count%2*2-1)},
	grabbable: false
})
	cy.add({
	group: 'edges',
	data: {
		id: parentName+"-"+name,
		source: parentName,
		target: name,
	},
})
	cy.layout({ name: 'dagre',rankDir: 'LR', animate: false}).run();
	selectedNode = node
}
var start = cy.add({
	group: 'nodes',
	data: {
		weight: 75,
		id: 'start',
		chessPos: encodeChessPieces(chessPieces),
		color:color
	},
	position: {
		y: 300,
		x: 300
	},
	grabbable: false
})

function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj; // Return the value if it's a primitive
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item)); // Recursively clone each item in an array
    }

    const clone = Object.create(Object.getPrototypeOf(obj)); // Create a new object with the same prototype
    Object.keys(obj).forEach(key => {
        clone[key] = deepClone(obj[key]); // Recursively clone each property
    });

    return clone;
}
function encodeChessPieces(chessPieces) {
    return chessPieces.map(piece => 
      `${piece.type.name}|${JSON.stringify(piece.pos)}|${piece.color}|${piece.turns}`
    ).join(';');
}
function decodeChessPieces(encodedString) {
    return encodedString.split(';').map(pieceStr => {
        const [typeStr, posStr, color, turns] = pieceStr.split('|');
        let type;
		switch(typeStr){
			case "":
				type = pawn
				break;
			case "K":
				type = king
				break;
			case "N":
				type = knight
				break;
			case "B":
				type = bishop
				break;
			case "R":
				type = rook
				break;
			case "Q":
				type = queen
				break;
			default:
				type = queen
		}

        // Attach the correct action function based on type.name
		console.log(posStr)
        return {
            type: type, 
            pos: JSON.parse(posStr), 
            color: color, 
            turns: parseInt(turns, 10)
        };
    });
}

var selectedNode = start;