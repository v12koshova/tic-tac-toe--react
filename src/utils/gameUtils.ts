import { WINNER_COMBINATIONS } from "../constants";
import { FieldType, GameOverType, StateType } from "../types/types";

export const checkField = (state: StateType, newFieldState: FieldType, player: 'x' | 'o') => {
  let gameState: GameOverType = {
    isOver: false
  }
  for (let i = 0; i < WINNER_COMBINATIONS.length; i++) {
    if (WINNER_COMBINATIONS[i].every(c => newFieldState[c] === player)) {
      WINNER_COMBINATIONS[i].forEach(c => newFieldState[c] = `${player} win`)
      gameState = {
        isOver: true,
        result: player
      }
      break;

    }
  }
  if (!gameState.isOver && newFieldState.every(c => c !== '')) {
    gameState = { isOver: true, result: 'd' };
  }

  if (gameState.isOver && gameState.result) {
    return {
      ...state,
      field: newFieldState,
      game: { ...gameState },
      winCounter: {
        ...state.winCounter,
        [gameState.result]: state.winCounter[gameState.result] + 1,
      },
    };
  }

  return { ...state, field: newFieldState, turn: (player === 'o' ? 'x' : 'o') as 'x' | 'o' }
}

export const setRandomCell = (newFieldState: FieldType): number => {
  const cell = Math.floor(Math.random() * 9)
  if (newFieldState[cell] !== '') {
    return setRandomCell(newFieldState)
  }
  return cell
}

export const findMove = (newFieldState: FieldType, player: 'x' | 'o') => {
  for (let i = 0; i < WINNER_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNER_COMBINATIONS[i];

    if (newFieldState[a] === player && newFieldState[b] === player && newFieldState[c] === "") {
      return c;
    }
    if (newFieldState[a] === player && newFieldState[c] === player && newFieldState[b] === "") {
      return b;
    }
    if (newFieldState[b] === player && newFieldState[c] === player && newFieldState[a] === "") {
      return a;
    }
  }
  return null;
}

export const computerMove = (state: StateType) => {

  const newFieldState: FieldType = [...state.field]

  let cell = findMove(newFieldState, 'x')
  if (cell === null) {
    cell = findMove(newFieldState, 'o');
    if (cell === null) {
      cell = setRandomCell(newFieldState)
    }
  }
  newFieldState[cell] = 'x'
  let newState = checkField(state, newFieldState, 'x')
  return newState

}