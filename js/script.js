//  game board module
const gameBoardModule = (function () {
  const board = [];
  const row = 3;
  const column = 3;

  addToArray();

  function addToArray() {
    for (let i = 0; i < row; i++) {
      board[i] = [];
      for (let j = 0; j < column; j++) {
        board[i][j] = boardCellFactory(i, j);
      }
    }
  }

  function getBoard() {
    return board;
  }

  function resetBoard() {
    board.forEach((boardRow) => {
      boardRow.forEach((cell) => {
        cell.updateCellValue('');
      });
    });
  }

  const getRow = () => row;
  const getColumn = () => column;

  return {
    addToArray,
    getBoard,
    resetBoard,
    getRow,
    getColumn,
  };
})();

//  board cell object factory
function boardCellFactory(row, column) {
  let cellValue = '';
  const cellIndex = `${row}-${column}`;

  const getCellValue = () => cellValue;

  const updateCellValue = (newValue) => {
    cellValue = newValue;
  };

  const getCellIndex = () => cellIndex;

  return {
    getCellValue,
    updateCellValue,
    getCellIndex,
    getCellRow: () => row,
    getCellColumn: () => column,
  };
}

//  players object factory
function playersFactory(name, number, value, isAi) {
  let playerScore = 0;
  let playerName = name;
  let playerValue = value;
  let isComputer = isAi;

  const setPlayerName = (newName) => {
    playerName = newName;
  };

  const getPlayerName = () => playerName;

  const getPlayerValue = () => playerValue;

  const getPlayerScore = () => playerScore;

  const updatePlayerValue = (newValue) => {
    playerValue = newValue;
  };

  const updatePlayerScore = () => {
    playerScore += 1;
  };

  const resetPlayerScore = () => {
    playerScore = 0;
  };

  const getPlayerNumber = () => number;

  const setIsComputer = (newValue) => {
    isComputer = newValue;
  };
  const getIsComputer = () => isComputer;

  function computerAi(board) {
    const emptyCells = [];
    board.forEach((row) => {
      row.forEach((cell) => {
        if (cell.getCellValue() === '') emptyCells.push(cell);
      });
    });

    const cellIndex = Math.floor(Math.random() * emptyCells.length);

    const cellRow = emptyCells[cellIndex].getCellRow();
    const cellColumn = emptyCells[cellIndex].getCellColumn();

    return [cellRow, cellColumn];
  }

  return {
    setPlayerName,
    getPlayerName,
    getPlayerValue,
    getPlayerScore,
    updatePlayerValue,
    updatePlayerScore,
    resetPlayerScore,
    getPlayerNumber,

    computerAi,
    getIsComputer,
    setIsComputer,
  };
}

//  game flow module
const gameFlowModule = (function () {
  const gameBoard = gameBoardModule;
  const board = gameBoard.getBoard();
  const players = [playersFactory('Neo', 1, '0', false), playersFactory('Agent Smith', 2, '1', true)];
  let startingPlayer = players[0].getPlayerNumber();
  let activePlayer = players[0];
  let tie = false;
  const winCells = [];

  const switchTurn = (roundOver) => {
    if (roundOver === true) {
      if (startingPlayer === 1) {
        activePlayer = players[1];
        startingPlayer = players[1].getPlayerNumber();
      } else if (startingPlayer === 2) {
        activePlayer = players[0];
        startingPlayer = players[0].getPlayerNumber();
      }
      return;
    }
    if (activePlayer === players[0]) activePlayer = players[1];
    else if (activePlayer === players[1]) activePlayer = players[0];
  };

  const checkGameOver = () => {
    let isTie = true;
    let win = false;
    let columnValue;

    board.forEach((row, i) => {
      if (win === true) return;
      row.forEach((cell, j) => {
        columnValue = cell.getCellValue();

        //  check for row match
        if (j === 0) {
          if (columnValue !== '' && columnValue === row[j + 1].getCellValue() && columnValue === row[j + 2].getCellValue()) {
            win = true;
            winCells.push(cell.getCellIndex(), row[j + 1].getCellIndex(), row[j + 2].getCellIndex());
            return;
          }
        }

        //  check for column match
        if (i === 0) {
          if (columnValue !== '' && columnValue === board[i + 1][j].getCellValue() && columnValue === board[i + 2][j].getCellValue()) {
            win = true;
            winCells.push(cell.getCellIndex(), board[i + 1][j].getCellIndex(), board[i + 2][j].getCellIndex());
            return;
          }
        }
        //  check for diagonal match
        if (i === 0 && j === 0) {
          if (columnValue !== '' && columnValue === board[1][1].getCellValue() && columnValue === board[2][2].getCellValue()) {
            win = true;
            winCells.push(cell.getCellIndex(), board[1][1].getCellIndex(), board[2][2].getCellIndex());
            return;
          }
        }

        //  check for other diagonal match
        if (i === 0 && j === 2) {
          if (columnValue !== '' && columnValue === board[1][1].getCellValue() && columnValue === board[2][0].getCellValue()) {
            win = true;
            winCells.push(cell.getCellIndex(), board[1][1].getCellIndex(), board[2][0].getCellIndex());
            return;
          }
        }

        //  check if the board is full, if full then it's a tie
        if (columnValue === '') {
          isTie = false;
        }
      });
    });

    //  active player wins a round or ends in a tie
    if (win) {
      activePlayer.updatePlayerScore();
      return win;
    }

    if (isTie) {
      tie = true;
      return isTie;
    }

    //  when no one wins nor tied
    return false;
  };

  const placeMarker = (row, column) => {
    if (board[row][column].getCellValue() === '') {
      board[row][column].updateCellValue(activePlayer.getPlayerValue());
    }
  };

  const restartGame = () => {
    gameBoard.resetBoard();
    players.forEach((player) => {
      player.resetPlayerScore();
    });
    tie = false;
    activePlayer = players[0];
    startingPlayer = players[0].getPlayerNumber();
  };

  const togglePlayerOrComputer = (playerSelectedIndex, otherPlayerIndex) => {
    if (players[playerSelectedIndex].getIsComputer() === false) {
      players[playerSelectedIndex].setIsComputer(true);
      players[playerSelectedIndex].setPlayerName('Agent Smith');
      if (players[otherPlayerIndex].getIsComputer() === true) {
        players[otherPlayerIndex].setIsComputer(false);
        if (otherPlayerIndex === 0) players[otherPlayerIndex].setPlayerName('Neo');
        else players[otherPlayerIndex].setPlayerName('Morpheus');
      }
      restartGame();
    } else if (players[playerSelectedIndex].getIsComputer() === true) {
      players[playerSelectedIndex].setIsComputer(false);
      if (playerSelectedIndex === 0) {
        players[playerSelectedIndex].setPlayerName('Neo');
      } else players[playerSelectedIndex].setPlayerName('Morpheus');
      restartGame();
    }
  };

  return {
    players,
    activePlayer,
    getActivePlayer: () => activePlayer,
    getTie: () => tie,
    resetTie: () => {
      tie = false;
    },
    winCells,
    switchTurn,
    placeMarker,
    checkGameOver,
    restartGame,
    togglePlayerOrComputer,
  };
})();

// module that display the game on the webpage
const displayControllerModule = (function () {
  const game = gameFlowModule;
  const gameBoard = gameBoardModule;
  const board = gameBoard.getBoard();
  const boardContainer = document.querySelector('.game-board');
  let winCells;
  let isGameOver = false;
  let isComputerTurn = false;
  let winnerName;

  createCellElements();
  const cellElements = document.querySelectorAll('.game-board>div');

  const playerContainer1 = createPlayerInfoElements(game.players[0]);
  const playerContainer2 = createPlayerInfoElements(game.players[1]);

  createRestartButton();

  createEndGamePopup();

  showTurn();

  //  create board cells in DOM
  function createCellElements() {
    for (let i = 0; i < gameBoard.getRow(); i++) {
      for (let j = 0; j < gameBoard.getColumn(); j++) {
        const cellElement = document.createElement('div');
        cellElement.setAttribute('data-row', i);
        cellElement.setAttribute('data-column', j);
        cellElement.setAttribute('data-index', board[i][j].getCellIndex());

        boardContainer.appendChild(cellElement);

        cellElement.addEventListener('click', clickCell);
      }
    }
  }

  //  create div that contains player info in DOM
  function createPlayerInfoElements(player) {
    const playerNumber = player.getPlayerNumber();

    const playerName = document.createElement('div');
    playerName.classList.add(`player${playerNumber}-name`);
    playerName.textContent = player.getPlayerName();

    const playerMark = document.createElement('div');
    playerMark.textContent = `(${player.getPlayerValue().toUpperCase()})`;

    const playerScore = document.createElement('div');
    playerScore.classList.add(`player${playerNumber}-score`);
    playerScore.textContent = player.getPlayerScore();

    const playerOrAiToggle = document.createElement('button');
    playerOrAiToggle.classList.add('selectButton');
    const toggleIcon = document.createElement('i');
    if (playerNumber === 2) {
      toggleIcon.setAttribute('class', 'fa-solid fa-computer');
    } else {
      toggleIcon.setAttribute('class', 'fa-regular fa-user');
    }
    playerOrAiToggle.appendChild(toggleIcon);

    const playerContainer = document.querySelector(`[data-player="${playerNumber}"]`);
    playerContainer.append(playerOrAiToggle, playerName, playerMark, playerScore);

    playerName.addEventListener('click', () => {
      clickEditName(player, playerName);
    });

    playerOrAiToggle.addEventListener('click', (e) => {
      if (e.target.closest('[data-player="1"]')) {
        toggleIcon.setAttribute('class', 'fa-regular fa-user');
        toggleAiOrPlayer(0, 1);
        computerTurn();
      } else if (e.target.closest('[data-player="2"]')) {
        toggleAiOrPlayer(1, 0);
        computerTurn();
      }
    });

    return playerContainer;
  }

  function createRestartButton() {
    const restartContainer = document.getElementById('restart');
    const restartButton = document.createElement('button');
    restartButton.innerHTML = '<i class="fa-solid fa-power-off"></i>';
    restartContainer.appendChild(restartButton);

    restartButton.addEventListener('click', () => {
      game.restartGame();
      resetCellElements();
      updateScoreDisplay();
      showTurn(true);
    });
  }

  //  pop up a modal after a round end, congrats the winner and let player to continue
  function createEndGamePopup() {
    const backdrop = document.querySelector('.backdrop');
    backdrop.style.visibility = 'hidden';

    const popUp = document.createElement('div');
    popUp.classList.add('endPopup');
    backdrop.appendChild(popUp);

    const congrats = document.createElement('p');
    congrats.classList.add('message');
    popUp.appendChild(congrats);

    const popUpElements = [backdrop, popUp, congrats];
    popUpElements.forEach((element) => {
      element.addEventListener('click', (e) => {
        e.stopPropagation();
        clickToNextRound(backdrop, congrats);
      });
    });
  }

  function toggleAiOrPlayer(playerNum, otherPlayerNum) {
    game.togglePlayerOrComputer(playerNum, otherPlayerNum);
    const playerName = document.querySelector(`.player${playerNum + 1}-name`);
    playerName.textContent = game.players[playerNum].getPlayerName();
    const otherPlayerName = document.querySelector(`.player${otherPlayerNum + 1}-name`);
    otherPlayerName.textContent = game.players[otherPlayerNum].getPlayerName();

    const toggleIcon = document.querySelector(`[data-player='${playerNum + 1}'] i`);
    if (game.players[playerNum].getIsComputer() === true) {
      toggleIcon.setAttribute('class', 'fa-solid fa-computer');
    } else {
      toggleIcon.setAttribute('class', 'fa-regular fa-user');
    }
    updateScoreDisplay();
    resetCellElements();
  }

  function showEndGamePopup() {
    document.querySelector('.backdrop').style.visibility = 'visible';
    const endMessage = document.querySelector('.message');
    game.getTie() ? (endMessage.textContent = 'It is a TIE!') : (endMessage.textContent = `${winnerName} wins!`);
  }

  //  update the DOM player score section with new players' scores
  function updateScoreDisplay() {
    const playerScores = document.querySelectorAll('.player1-score, .player2-score');
    playerScores[0].textContent = game.players[0].getPlayerScore();
    playerScores[1].textContent = game.players[1].getPlayerScore();
  }

  function resetCellElements() {
    cellElements.forEach((cell) => {
      cell.textContent = '';
    });
  }

  function showTurn(reset) {
    if (game.getActivePlayer().getPlayerNumber() === 1 || reset === true) {
      playerContainer2.setAttribute('style', 'filter:saturate(0.8) brightness(0.5);');
      playerContainer1.removeAttribute('style');
    } else if (game.getActivePlayer().getPlayerNumber() === 2) {
      playerContainer1.setAttribute('style', 'filter:saturate(0.8) brightness(0.5);');
      playerContainer2.removeAttribute('style');
    }
  }

  function clickEditName(player, nameDisplay) {
    const newName = prompt('Enter A New Name(maximum 10 characters)');
    if (newName != null && newName.length <= 10) {
      player.setPlayerName(newName);
      nameDisplay.textContent = player.getPlayerName();
    }
  }

  function clickToNextRound(overlay, message) {
    gameBoard.resetBoard();
    game.resetTie();
    resetCellElements();
    overlay.style.visibility = 'hidden';
    message.textContent = '';
    cellElements.forEach((cell) => cell.removeAttribute('class'));
    winCells.forEach((cell) => cell.removeAttribute('class'));
    winCells.length = 0;
    showTurn();
    isGameOver = false;

    if (game.getActivePlayer().getIsComputer() === true) {
      computerTurn();
    }
  }

  //  An async callback function that get passed into the click event handler and gets called when a cellElement is clicked
  function clickCell(event) {
    if (event.currentTarget.textContent !== '' || isComputerTurn === true || isGameOver === true) return;
    const row = event.target.getAttribute('data-row');
    const column = event.target.getAttribute('data-column');

    game.placeMarker(row, column);

    const cellMark = board[row][column].getCellValue();

    if (cellMark === '0') {
      event.target.textContent = '0';
    } else if (cellMark === '1') {
      event.target.textContent = '1';
    }

    isGameOver = game.checkGameOver();

    if (isGameOver === true) {
      winCells = document.querySelectorAll(`[data-index="${game.winCells[0]}"], [data-index="${game.winCells[1]}"], [data-index="${game.winCells[2]}"]`);
      game.winCells.length = 0;
      if (game.getTie() === true) {
        cellElements.forEach((element) => {
          element.classList.add('animation');
        });
      }
      winCells.forEach((element) => element.classList.add('animation'));
      winnerName = game.getActivePlayer().getPlayerName();
      updateScoreDisplay();
      setTimeout(showEndGamePopup, 1000);
    }

    game.switchTurn(isGameOver);
    showTurn();

    if (game.getActivePlayer().getIsComputer() === true) {
      isComputerTurn = true;
      setTimeout(computerTurn, 500);
    }
  }

  //  when the active player is computer after the turn switch
  function computerTurn() {
    if (game.getActivePlayer().getIsComputer() === true && isGameOver !== true) {
      const computerMarkIndex = game.getActivePlayer().computerAi(board);
      const rowNum = computerMarkIndex[0];
      const columnNum = computerMarkIndex[1];
      const index = `${rowNum}-${columnNum}`;

      game.placeMarker(rowNum, columnNum);

      const cellMark = board[rowNum][columnNum].getCellValue();
      isGameOver = game.checkGameOver();

      if (cellMark === '0') {
        document.querySelector(`[data-index="${index}"]`).textContent = '0';
      } else if (cellMark === '1') {
        document.querySelector(`[data-index="${index}"]`).textContent = '1';
      }

      if (isGameOver === true) {
        winCells = document.querySelectorAll(`[data-index="${game.winCells[0]}"], [data-index="${game.winCells[1]}"], [data-index="${game.winCells[2]}"]`);
        game.winCells.length = 0;
        if (game.getTie() === true) {
          cellElements.forEach((element) => {
            element.classList.add('animation');
          });
        }
        winCells.forEach((element) => element.classList.add('animation'));
        winnerName = game.getActivePlayer().getPlayerName();
        updateScoreDisplay();
        setTimeout(showEndGamePopup, 1000);
      }
      game.switchTurn(isGameOver);
      showTurn();
      isComputerTurn = false;
    }
  }
})();

//displayControllerModule.createCellElements();
