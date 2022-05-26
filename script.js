const game = (() => {

    const player = ((name, marker) => {
        const setName = (a) => { name = a };
        const getName = () => name;

        const setMarker = (m) => { marker = m };
        const getMarker = () => marker;

        const makeMove = function (spaceIndex) {
            if (!gameBoard.checkSpace(spaceIndex)) {
                gameBoard.setSpace(spaceIndex, this);
                return true;
            } else {
                gameBoard.colorSpace.cantPlace(spaceIndex);
                return false;
            }
        }
        return { setName, getName, setMarker, makeMove, getMarker }
    });

    const gameBoard = (() => {
        var spaces = [];
        const docSpace = (spaceIndex) => document.querySelector(`[data-space="${spaceIndex}"]`);
        const checkSpace = (spaceIndex) => spaces[spaceIndex];
        const setSpace = (spaceIndex, player) => {
            spaces[spaceIndex] = player
            let space = docSpace(spaceIndex)
            space.innerText = player.getMarker();
            space.classList.toggle('appear');
            space.classList.toggle('player-' + (players.indexOf(player) + 1))
        }

        const listeners = (() => {
            let allSpaces = document.querySelectorAll('.game-board div');
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
        const colorSpace = (() => {
            const win = (winLine) => {
                for (let i = 0; i < 3; i++) {
                    let space = docSpace(winLine[i])
                    setTimeout(() => space.classList.toggle('win'), i * 230)
                }
            }
            const raiseAll = () => {
                setTimeout(() => {
                    for (let i = 0; i < 9; i++) docSpace(i).classList.add('appear')
                }, 800)
            }
            const cantPlace = (spaceIndex) => {
                let space = docSpace(spaceIndex);
                space.classList.toggle('cant-place')
                setTimeout(() => space.classList.toggle('cant-place'), 300)
            }
            return { win, raiseAll, cantPlace }
        })();

        return { setSpace, checkSpace, listeners, playTurn, checkWin, colorSpace }

    })();

    var players = [];

    var playTurn = (player, space) => {
        let attempt = player.makeMove(space.getAttribute('data-space'));
        if (!attempt) return;

        let winLine = gameBoard.checkWin()
        if (winLine) { winner(player, winLine); return; }

        nextPlayerIndex = (players.indexOf(player) === 1) ? 0 : 1;
        gameBoard.listeners.add(players[nextPlayerIndex])
    };

    const winner = (player, winLine) => {
        gameBoard.colorSpace.win(winLine)
        gameBoard.colorSpace.raiseAll();
        gameBoard.listeners.clear();
        setTimeout(()=>victoryScreen(player),900)
    }

    const victoryScreen = (player)=>{
        let victory = document.querySelector('.victory')
        victory.querySelector('#winner').innerText = player.getName() + " wins!";
        victory.setAttribute('data-winner', `player-${players.indexOf(player)+1}`);
        victory.classList.remove('hidden')
    }

    // Manage non-gameboard interactive elements
    const UI = (() => {
        let palyerNameInput = document.querySelectorAll('input');
        let settings = document.querySelectorAll('.settings div')
        const initialize = () => {
            palyerNameInput.forEach((input) => input.addEventListener('input', setPlayerName))
            settings.forEach((button) => { button.onclick = setSetting })
        }
        const setSetting = (e) => {
            settings.forEach((button) => {
                if (button.innerText === e.target.innerText)
                    button.classList.add('selected')
                else button.classList.remove('selected')
            })
        }
        const setPlayerName = (e) => {
            let index = e.target.getAttribute('data-player-index');
            players[index].setName(e.target.value)
        }
        return { initialize }
    })();

    const playGame = () => {

        // players.push(player(prompt('Player: 1')));
        // players.push(player(prompt('Player: 2')));
        players.push(player('Player 1', 'X'));
        player1 = players[0]
        players.push(player('Player 2', 'O'));
        player2 = players[1]

        UI.initialize()

        gameBoard.listeners.add(player1)
    }

    return { playGame, players, board: gameBoard, player }
})();

game.playGame();
