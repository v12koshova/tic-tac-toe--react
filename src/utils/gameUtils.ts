import { get, ref, set, update } from "firebase/database";
import { WINNER_COMBINATIONS } from "../constants";
import { FieldType, GameOverType, StateType, TurnType } from "../types/types";
import { db } from "../firebase";

export const checkField = (state: StateType, newFieldState: FieldType, player: TurnType) => {
  let gameState: GameOverType = {
    isOver: false
  }
  let winnerField: FieldType = [...newFieldState]

  for (let i = 0; i < WINNER_COMBINATIONS.length; i++) {
    if (WINNER_COMBINATIONS[i].every(c => newFieldState[c] === player)) {
      WINNER_COMBINATIONS[i].forEach(c => winnerField[c] = `${player} win`)
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
      field: winnerField,
      game: { ...gameState },
      winCounter: {
        ...state.winCounter,
        [gameState.result]: state.winCounter[gameState.result] + 1,
      },
      modalType: 'result'
    };
  }

  return { ...state, field: newFieldState, turn: (player === 'o' ? 'x' : 'o') as TurnType }
}

export const setRandomCell = (newFieldState: FieldType): number => {
  const cell = Math.floor(Math.random() * 9)
  if (newFieldState[cell] !== '') {
    return setRandomCell(newFieldState)
  }
  return cell
}

export const findMove = (newFieldState: FieldType, player: TurnType) => {
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

export const createRoom = async (roomName: string, name: string) => {
  const newRef = ref(db, `rooms/${roomName}`)
  set(newRef, {
    players: {
      o: name,
      x: ''
    },
    modals: {
      o: false,
      x: true
    },
    field: ['', '', '', '', '', '', '', '', ''],
    winCounter: {
      'x': 0,
      'o': 0,
      'd': 0
    },
    turn: 'o'
  })
}


export const joinRoom = async (roomName: string, name: string) => {
  const dataRef = ref(db, `rooms/${roomName}`)
  const snapshot = await get(dataRef)

  if (snapshot.exists()) {
    const player = snapshot.val().players['o'] ? 'x' : 'o'

    update(ref(db, `rooms/${roomName}`), {
      ...snapshot.val(),
      players: {
        ...snapshot.val().players,
        [player]: name
      },
      modals: {
        ...snapshot.val().modals,
        [player]: false
      },
    })
    return player

  } else {
    throw new Error
  }

}

export const getInfo = async (roomName: string) => {
  try {
    const snapshot = await get(ref(db, `rooms/${roomName}`))
    if (snapshot.exists()) {
      const values = snapshot.val()
      return {
        winCounter: { ...values.winCounter },
        players: { ...values.players },
        turn: values.turn
      }
    }
  } catch {
    console.error('Failed to get counter');
  }
}

