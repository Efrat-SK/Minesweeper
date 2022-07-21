'use strict'

var gChosenLevel = 0
var gLevels

var gGame

const MINE = '<img src="img/Mine.png"/>'
const FLAG = '<img src="img/Flag.png"/>'

var gBoard
var gMinesLocations
var gNumNonMineCell

var gStartTime
var gameInterval

function init() {

    gLevels = [
        { SIZE: 4, MINES: 2 },
        { SIZE: 8, MINES: 12 },
        { SIZE: 12, MINES: 30 }
    ]

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0, ////////////////////////////////////////////////////////////////////////////////////////
        minesWereRevealed: false,
        flagWasMarked: false
    }


    gNumNonMineCell = gLevels[gChosenLevel].SIZE ** 2 - gLevels[gChosenLevel].MINES

    gBoard = buildBoard()
    console.log('gBoard: ', gBoard)///////////////////////////////////////////////////to cut
    renderBoard(gBoard)

    clearInterval(gameInterval)

}

function chooseLevel(elBtn) {
    var level = elBtn.innerText
    console.log('level: ', level)

    switch (level) {
        case 'Beginner':
            gChosenLevel = 0
            break;
        case 'Medium':
            gChosenLevel = 1
            break;
        case 'Expert':
            gChosenLevel = 2
            break;
    }
    init()
}

function buildBoard() {

    //creat table
    var board = createBoard(gLevels[gChosenLevel].SIZE)

    return board
}

function setMinesNegsCount(board) {

    for (var i = 0; i < gLevels[gChosenLevel].SIZE; i++) {
        for (var j = 0; j < gLevels[gChosenLevel].SIZE; j++) {

            var coantNeg = countNeighbors(i, j, board)
            board[i][j].minesAroundCount = coantNeg
        }
    }
}

function timer() { /////////////////////////////////////////////////////////////to improve

    // secsPassed =?

    var currTime = new Date().getTime()
    var timePassed = new Date(currTime - gStartTime)

    var elTimer = document.querySelector('.timer')

    var mins = timePassed.getMinutes() < 10 ? '0' : ''
    var secs = timePassed.getSeconds() < 10 ? '0' : ''
    var milSecs = timePassed.getMilliseconds() < 100 ? (timePassed.getMilliseconds() < 10 ? '00' : '0') : ''

    elTimer.innerText = `Game time:
    ${mins + timePassed.getMinutes()}:${secs + timePassed.getSeconds()}:${timePassed.getMilliseconds() + milSecs}`
}

function cellLeftClicked(elCell, i, j) {

    isFirstClick(i, j)
    if (!gGame.isOn) return

    //if flag or showen - do nothing
    if (gBoard[i][j].isMarked || gBoard[i][j].isShown) {
        return
    }

    elCell.style.backgroundColor = '#CCFF99'

    //if mine - show all mines , end game
    if (gBoard[i][j].isMine) {
        for (var i = 0; i < gMinesLocations.length; i++) {
            var mineLocation = gMinesLocations[i]

            var selector = `[data-i="${mineLocation.i}"][data-j="${mineLocation.j}"]`
            elCell = document.querySelector(selector)
            renderCell(elCell, MINE)
        }
        gGame.minesWereRevealed = true
        endGame()
        return
    }

    //if number - show number
    else if (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount > 0) {
        gBoard[i][j].isShown = true
        renderCell(elCell, gBoard[i][j].minesAroundCount)
        gGame.shownCount++
    }
    //if empy - nigberloop showing
    else {
        gBoard[i][j].isShown = true
        gGame.shownCount++
        expandShown(gBoard, elCell, i, j)
    }
    checkGameOver()
}

function expandShown(board, elCell, cellI, cellJ) {


    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine || board[i][j].isMarked) continue
            else {
                var selector = `[data-i="${i}"][data-j="${j}"]`
                elCell = document.querySelector(selector)
                cellLeftClicked(elCell, i, j)
            }
        }
    }

}

function cellRightClicked(elCell, i, j) {
    isFirstClick(i, j)
    if (!gGame.isOn) return
    cellMarked(elCell, i, j)
    checkGameOver()
}

function cellMarked(elCell, i, j) {
    gGame.flagWasMarked = true
    //if marked - remove mark
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false
        renderCell(elCell, '')
        gGame.markedCount--
    }
    //if not marked - mark
    else if (!gBoard[i][j].isMarked && !gBoard[i][j].isShown) {
        gBoard[i][j].isMarked = true
        renderCell(elCell, FLAG)
        gGame.markedCount++
    }
}

function isFirstClick(cellI, cellJ) {
    //if first click - change gGame.isOn = true
    if (gGame.shownCount === 0 && !gGame.flagWasMarked && !gGame.minesWereRevealed) {
        gGame.isOn = true

        gStartTime = new Date().getTime()
        gameInterval = setInterval(timer, 31)

        //set mines rundomly
        locateMines(gLevels[gChosenLevel].MINES, gBoard, cellI, cellJ)

        //setMinesNegsCount(board)
        setMinesNegsCount(gBoard)
    }
}

function locateMines(minesAmount, board, cellI, cellJ) {

    gMinesLocations = []

    for (var i = 0; i < minesAmount; i++) {
        var randomCell = getRandomEmpyCell(board, cellI, cellJ)
        board[randomCell.i][randomCell.j].isMine = true
        gMinesLocations.push(randomCell)
    }
    console.log('gMinesLocations: ', gMinesLocations)
}

function getRandomEmpyCell(board, cellI, cellJ) {
    const emptyCells = []

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {

            if (!board[i][j].isMine && i !== cellI && j !== cellJ) {
                emptyCells.push({ i, j })
            }
        }
    }
    const idx = getRandomInt(0, emptyCells.length)
    return emptyCells[idx]
}

function checkGameOver() {
    //if all mines are marked and all oter cell shown
    if (gGame.markedCount === gLevels[gChosenLevel].MINES && gGame.shownCount === gNumNonMineCell) {
        console.log('win!')
        clearInterval(gameInterval)
        gGame.isOn = false
    }
}

function endGame() {
    clearInterval(gameInterval)
    gGame.isOn = false
    console.log('game over...')
}