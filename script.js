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
        var spaces = [];
        const checkSpace = (spaceIndex) => spaces[spaceIndex];
        const setSpace = (spaceIndex, player)=> {
            spaces[spaceIndex] = player
            let space = document.querySelector(`[data-space="${spaceIndex}"]`)
            space.innerText = player.getMarker();
        }

        
        const listeners = (()=>{
            let allSpaces = document.querySelectorAll('.game-board div');
            const add = (player)=> {allSpaces.forEach((space)=>{
                space.onclick = ()=> {playTurn(player,space)}})}
            const clear = ()=> {allSpaces.forEach((space)=> space.onclick = null)}
            
            return {add, clear}
        })();

        const checkWin = ()=>{
            const checkSame = (start,step,result)=>{
                return result || (spaces[start] === spaces[start + step]
                     && spaces[start] === spaces[start + 2 * step]
                     && spaces[start]!=undefined)
                }
            let result;
            for (let i = 0; i<2 ;i++) result = checkSame(i,3,result); // Check verticals
            for (let i = 0; i<6 ;i+=3) result = checkSame(i,1,result); // Check horizontals
            result = checkSame(0,4,result); // Check negative diagonal
            result = checkSame(2,2,result); // Check positive diagonal
            return result;
        }

        return {setSpace, checkSpace, listeners, playTurn, checkWin}

    })();

    var players = [];

    var playTurn = (player,space) => {
        let attempt = player.makeMove(space.getAttribute('data-space'));
        if (!attempt) return;

        if(gameBoard.checkWin()) {winner(player); return;}

        nextPlayerIndex = Math.abs(players.indexOf(player) - 1)
        gameBoard.listeners.add(players[nextPlayerIndex])
    };

    const winner = (player) =>{
        setTimeout(()=> {alert(player.getName() + " WON!")},200);
        gameBoard.listeners.clear();
    }

    const playGame = ()=>{

        // players.push(player(prompt('Player: 1')));
        // players.push(player(prompt('Player: 2')));
        players.push(player('keff','F'));
        a = players[0];
        players.push(player('awe','Q'));
        b = players[1]

        gameBoard.listeners.add(a)
    }

    return{playGame, players, board:gameBoard, player}
})();

game.playGame();
