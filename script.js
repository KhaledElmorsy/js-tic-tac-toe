const game = (() => {

    const player = ((name, marker, type) => {
        const setName = (a) => { name = a };
        const getName = () => name;
        const setMarker = (m) => { marker = m };
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
        const computerMove = function(){
            const randomMove = ()=>{
                let legalMove = false;
                let move;
                while(!legalMove){
                    move = Math.floor(Math.random()*9);
                    legalMove = !gameBoard.checkSpace(move)
                }
                return move;
            }
            // Minmax Move
            const minmaxMove = ()=>{

            }

            if (type==='Easy') return randomMove();
            else return minmaxMove();
        }

        return { setName, getName, setMarker, getType, setType, makeMove, getMarker, computerMove }
    });

    const gameBoard = (() => {
        var spaces = [];
        let allSpaces = document.querySelectorAll('.game-board div');

        const getTotalTurns = ()=> spaces.filter((space)=>space).length;
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

        const checkWin = () => {
            const checkSame = (start, step) => {
                return (spaces[start] === spaces[start + step]
                    && spaces[start] === spaces[start + 2 * step]
                    && spaces[start] != undefined)
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
            spaces = [];
            listeners.clear();
            allSpaces.forEach((space) => {
                space.innerText = "";
                space.classList.remove('win', 'appear', 'player-1', 'player-2')
            })
        }

        return { setSpace, checkSpace, listeners, playTurn, checkWin
                , spaceStyle, fullClear, getTotalTurns }

    })();

    var players = [];

    var playTurn = (player, space) => {
        let spaceIndex = space.getAttribute('data-space');
        let attempt = player.makeMove(spaceIndex);
        if (!attempt) return;
        
        let gameOver = gameResult(player);

        if (players[1].getType() != 'Human' && !gameOver){
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

        let tieState = (gameBoard.getTotalTurns()===9)
        if (tieState && !winLine) victoryScreen.show(player,true);

        if (winLine || tieState){
            gameBoard.listeners.clear();
            return true;
        }
     }

    const winner = (player, winLine) => {
        gameBoard.spaceStyle.markWinLine(winLine);
        gameBoard.spaceStyle.raiseAll();
        setTimeout(() => victoryScreen.show(player,false), 900)
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
        
        return {show, hide}
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
                if (button.innerText === chosenSetting){
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
