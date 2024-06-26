import { GameHandler } from "./game-handler.js";
import { getCookie } from "./utils.js";

let board = []

const setInfoPanel = mode => {
    const container = document.querySelector("#panel-container")
    for (let child of container.children) {
        child.classList.add("d-none")
    }

    const panel = container.querySelector(`[data-mode=${mode}]`)
    panel?.classList.remove("d-none")
}

const setPlayerTurnText = (player, firstTurn, gameOver = false) => {
    const label = document.querySelector("#label-turn")
    if (gameOver) {
        label.textContent = "Game over"
    }
    else {
        if (firstTurn) {
            label.textContent = gameHandler.playerType == "O" ? "Your turn" : "Opponent's turn"
        }
        else {
            label.textContent = gameHandler.playerType != player ? "Your turn" : "Opponent's turn"
        }
    }
}

const setResultPanel = mode => {
    const container = document.querySelector("#result-message-container")
    for (let child of container.children) {
        child.classList.add("d-none")
    }

    const panel = container.querySelector(`[data-mode=${mode}]`)
    panel?.classList.remove("d-none")
}

const gameStartHandler = (player, opponentName) => {
    clearBoard()
    setInfoPanel("in-game")
    document.querySelector("#label-opponent-name").textContent = opponentName
    document.querySelector("#label-player").textContent = player
    document.querySelector("#opponent-avatar").src = new URL(`/get-avatar?username=${opponentName}`, window.location.href)
    setPlayerTurnText(player, true)
}

const moveHandler = (player, result, boardState, newestMove) => {
    addPlayerIcon(board[newestMove], player)

    if (["winO", "winX", "draw"].includes(result)) {
        if (result == "draw") setResultPanel("draw")
        else {
            const winner = result[3]
            setResultPanel(winner == gameHandler.playerType ? "win" : "lose")
        }

        setTimeout(() => setInfoPanel("join"), 2000)
        setPlayerTurnText(player, false, true)
    }
    else {
        setPlayerTurnText(player, false)
    }
}

const onOpponentDisconnected = () => {
    setResultPanel("disconnected")
    setTimeout(() => setInfoPanel("join"), 2000)
}

const gameHandler = new GameHandler(gameStartHandler, moveHandler, onOpponentDisconnected)

const enableJoinButton = (enabled) => {
    if (enabled) {
        document.querySelector("#btn-join-match").classList.remove("disabled")
    }
    else {
        document.querySelector("#btn-join-match").classList.add("disabled")
    }
}

const joinGame = (playerName) => {
    gameHandler.joinQueue(playerName)
    setInfoPanel("matchmaking")
    setResultPanel("hidden")
}

const addPlayerIcon = (elem, type) => {
    const icons = {
        "X": document.querySelector("#img-x"),
        "O": document.querySelector("#img-o"),
    }

    const img = icons[type].cloneNode()
    img.removeAttribute("id")
    img.classList.remove("d-none")
    elem.appendChild(img)
}

const clearBoard = () => {
    board.forEach(elem => { 
        while (elem.firstChild) elem.removeChild(elem.lastChild)
    })
}

const setupBoard = () => {
    board = []
    document.querySelectorAll(".tictactoe-cell").forEach((elem, i) => {
        board.push(elem)
        elem.addEventListener("click", () => gameHandler.makeMove(i))
    })
}

const setup = () => {
    gameHandler.connectToAPI()
    enableJoinButton(getCookie("AccessToken") !== undefined)

    document.querySelector("#btn-join-match").addEventListener("click", _ => joinGame())

    setupBoard()

    console.log("Hello")
}

setup()