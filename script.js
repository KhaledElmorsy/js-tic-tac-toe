const game = (() => {

    const player = ((name, marker, type) => {
        const setName = (a) => { name = a };
        const getName = () => name;
        const getMarker = () => marker;
        const getType = () => type;
        const setType = (t) => { type = t };

        const makeMove = function (spaceIndex) {
            if (!gameBoard.checkSpace(spaceIndex)) {
                gameBoard.setSpace(spaceIndex, this);
                return true;
            } else {
                gameBoard.spaceStyle.cantPlace(spaceIndex);
                return false;
            }
        }
        const computerMove = function () {
            let boardCopy = gameBoard.simpleCopyBoard();
            const possibleMoves = ((boardCopy) => boardCopy.reduce((moves, space, i) =>
                (!space) ? moves.concat(i) : moves, []))
            let allMoves = possibleMoves(boardCopy);

            const randomMove = () => allMoves[Math.floor(Math.random() * allMoves.length)];

            // Minmax Move
            const minmaxMove = (board = boardCopy, marker = 'O', depth = 0) => {
                let scores = [];
                let moves = possibleMoves(board);
                let currentlyComputer = (marker === 'O');
                depth += 1;   // Depth lowers priority of late wins
                // Iterate through moves
                for (let i = 0; i < moves.length; i++) {
                    // Copy board and make a move
                    let tempBoard = board.slice(0);
                    let currentMove = moves[i];
                    tempBoard[currentMove] = marker;
                    // Check if move wins
                    let win = gameBoard.checkWin(tempBoard);
                    // If yes, add score
                    if (win) {
                        scores.push((currentlyComputer) ? 10 - depth : -10 + depth);
                    }
                    else if (tempBoard.filter((space) => space).length === 9) { // If tie add 0
                        scores.push(0)
                    } else {  // Otherwise switch players and get score of current board setup
                        nextPlayerMarker = (currentlyComputer) ? 'X' : 'O';
                        scores.push(minmaxMove(tempBoard, nextPlayerMarker, depth).bestScore)
                    }
                }
                let bestScore = (currentlyComputer) ?
                    scores.reduce((max, score) => (score > max) ? score : max) :
                    scores.reduce((min, score) => (score < min) ? score : min)
                let bestMove = moves[scores.indexOf(bestScore)]
                return { bestScore, bestMove }
            }

            if (type === 'Easy') return randomMove();
            else return minmaxMove().bestMove;
        }

        return { setName, getName, getType, setType, makeMove, getMarker, computerMove }
    });

    const gameBoard = (() => {
        var spaces = Array(9).fill(null);
        let allSpaces = document.querySelectorAll('.game-board div');
        const getTotalTurns = () => spaces.filter((space) => space).length;
        const spaceElement = (spaceIndex) => document.querySelector(`[data-space="${spaceIndex}"]`);
        const checkSpace = (spaceIndex) => spaces[spaceIndex];
        const setSpace = (spaceIndex, player) => {
            spaces[spaceIndex] = player
            let space = spaceElement(spaceIndex)
            space.innerText = player.getMarker();
            space.classList.toggle('appear');
            space.classList.toggle('player-' + (players.indexOf(player) + 1))
        }
        const listeners = (() => {
            const add = (player) => {
                allSpaces.forEach((space) => {
                    space.onclick = () => { playTurn(player, space) }
                })
            }
            const clear = () => { allSpaces.forEach((space) => space.onclick = null) }

            return { add, clear }
        })();
        const simpleCopyBoard = () => spaces.map((space) => (space) ? space.getMarker() : null)
        const checkWin = (board = spaces) => {
            const checkSame = (start, step) => {
                return (board[start] === board[start + step]
                    && board[start] === board[start + 2 * step]
                    && board[start] != undefined)
            }
            for (let i = 0; i <= 2; i++) if (checkSame(i, 3)) return [i, i + 3, i + 6]; // Check verticals
            for (let i = 0; i <= 6; i += 3) if (checkSame(i, 1)) return [i, i + 1, i + 2]; // Check horizontals
            if (checkSame(0, 4)) return [0, 4, 8]; // Check negative diagonal
            if (checkSame(2, 2)) return [2, 4, 6]; // Check positive diagonal
            return null;
        }
        const spaceStyle = (() => {
            const markWinLine = (winLine) => {
                for (let i = 0; i < 3; i++) {
                    let space = spaceElement(winLine[i])
                    setTimeout(() => space.classList.toggle('win'), i * 230)
                }
            }
            const raiseAll = () => {
                setTimeout(() => {
                    for (let i = 0; i < 9; i++) spaceElement(i).classList.add('appear')
                }, 800)
            }
            const cantPlace = (spaceIndex) => {
                let space = spaceElement(spaceIndex);
                space.classList.toggle('cant-place')
                setTimeout(() => space.classList.toggle('cant-place'), 300)
            }
            return { markWinLine, raiseAll, cantPlace }
        })();
        const fullClear = () => {
            spaces = Array(9).fill(null);
            listeners.clear();
            allSpaces.forEach((space) => {
                space.innerText = "";
                space.classList.remove('win', 'appear', 'player-1', 'player-2')
            })
        }

        return {
            setSpace, checkSpace, listeners,
            checkWin, spaceStyle, fullClear,
            getTotalTurns, simpleCopyBoard
        }

    })();

    var players = [];

    var playTurn = (player, space) => {
        let spaceIndex = space.getAttribute('data-space');
        let attempt = player.makeMove(spaceIndex);
        if (!attempt) return;

        let gameOver = gameResult(player);

        if (players[1].getType() != 'Human' && !gameOver) {
            let move = players[1].computerMove();
            players[1].makeMove(move);
            gameOver = gameResult(players[1]);
            nextPlayerIndex = 0;
        } else {
            nextPlayerIndex = (players.indexOf(player) === 1) ? 0 : 1;
        }

        if (!gameOver) gameBoard.listeners.add(players[nextPlayerIndex])
    }

    const gameResult = (player) => {
        let winLine = gameBoard.checkWin()
        if (winLine) winner(player, winLine);

        let tieState = (gameBoard.getTotalTurns() === 9)
        if (tieState && !winLine) victoryScreen.show(player, true);

        if (winLine || tieState) {
            gameBoard.listeners.clear();
            return true;
        }
    }

    const winner = (player, winLine) => {
        gameBoard.spaceStyle.markWinLine(winLine);
        gameBoard.spaceStyle.raiseAll();
        setTimeout(() => victoryScreen.show(player, false), 900)
    }

    const victoryScreen = (() => {
        let victory = document.querySelector('.victory')
        let winner = victory.querySelector('#winner')

        const show = (player, tie) => {
            if (tie) winner.innerText = "It's a tie";
            else winner.innerText = player.getName() + " wins!";

            victory.setAttribute('data-winner', `player-${players.indexOf(player) + 1}`);
            victory.classList.remove('hidden');
        }
        const hide = () => victory.classList.add('hidden');

        return { show, hide }
    })();

    // Manage non-gameboard interactive elements
    const UI = (() => {
        let palyerNameInput = document.querySelectorAll('input');
        let settings = document.querySelectorAll('.settings div')
        const initialize = () => {
            palyerNameInput.forEach((input) => input.addEventListener('input', setPlayerName))
            settings.forEach((button) => { button.onclick = setSetting })
            document.querySelector('#play-again').onclick = restartGame;
        }
        const setSetting = (e) => {
            let chosenSetting = e.target.innerText;
            settings.forEach((button) => {
                if (button.innerText === chosenSetting) {
                    button.classList.add('selected')
                } else button.classList.remove('selected')
            })
            players[1].setType(chosenSetting);
            restartGame();
        }
        const setPlayerName = (e) => {
            let index = e.target.getAttribute('data-player-index');
            players[index].setName(e.target.value)
        }
        return { initialize }
    })();

    const restartGame = () => {
        gameBoard.fullClear();
        gameBoard.listeners.add(players[0]);
        victoryScreen.hide();
    }

    const playGame = () => {
        players.push(player('Player 1', 'X'));
        players.push(player('Player 2', 'O'));
        players[1].setType('Human') // Default

        UI.initialize()
        gameBoard.listeners.add(players[0])
    }

    return { playGame, players, board: gameBoard, player }
})();

game.playGame();
