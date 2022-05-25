const game = (() => {

    const player = ((name, marker) => {
        const setName = (a)=> {name = a};
        const getName = ()=> name;

        const setMarker = (m)=>{marker = m};
        const getMarker = ()=> marker;

        const makeMove = function(spaceIndex) {
            if (!gameBoard.checkSpace(spaceIndex)) {
                gameBoard.setSpace(spaceIndex, this);
                return true;
            } else {
                return false;
            }
        }
        return { setName, getName, setMarker, makeMove, getMarker }
    });

    const gameBoard = (() => {
        var spaces = Array(9).fill(null);
        const checkSpace = (spaceIndex) => spaces[spaceIndex];
        const setSpace = (spaceIndex, player)=> {
            spaces[spaceIndex] = player
            let space = document.querySelector(`[data-space="${spaceIndex}"]`)
            space.innerText = player.getMarker();
        }

        
        const addListeners = (player)=>{
            let allSpaces = document.querySelectorAll('.game-board div');
            allSpaces.forEach((space)=>{
                space.onclick = ()=>
                {playTurn(player,space)}})
        }

        return {setSpace, checkSpace, addListeners, playTurn}

    })();

    var players = [];

    var playTurn = (player,space) => {
        let attempt = player.makeMove(space.getAttribute('data-space'));
        if (!attempt) return;
        nextPlayerIndex = Math.abs(players.indexOf(player) - 1)
        gameBoard.addListeners(players[nextPlayerIndex])
    };

    const playGame = ()=>{

        // players.push(player(prompt('Player: 1')));
        // players.push(player(prompt('Player: 2')));
        players.push(player('keff','F'));
        a = players[0];
        players.push(player('awe','Q'));
        b = players[1]

        gameBoard.addListeners(a)
    }

    return{playGame, players, board:gameBoard, player}
})();

game.playGame();
