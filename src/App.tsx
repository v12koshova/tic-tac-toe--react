import React, { useReducer, useState } from 'react';
import Field from './components/Field';
import { ReducerActionType, StateType } from './types/types';
import { ACTIONS } from './constants';
import { checkField, computerMove } from './utils/gameUtils';
import ModalWindowManager from './components/ModalWindowManager';
import { playSnd } from './utils/soundUtils';
import buttonSound from './assets/sounds/button.mp3'

const button = new Audio(buttonSound);

const initialState: StateType = {
  field: ['', '', '', '', '', '', '', '', ''],
  turn: "o",
  winCounter: { o: 0, x: 0, d: 0 },
  game: { isOver: false },
  rival: '',
  modalType: "initial",
};

const reducer = (state: StateType, action: ReducerActionType): StateType => {
  switch (action.type) {
    case ACTIONS.MOVE: {
      if (action.newFieldState) {
        playSnd(button)
        const turn = state.rival === 'friend' ? state.turn : 'o'
        const newState: StateType = checkField(state, action.newFieldState, turn)
        return newState
      }
    }
    case ACTIONS.COMPUTER_MOVE: {
      if (state.rival === 'computer' && !state.game.isOver) {
        playSnd(button)
        return computerMove(state)
      }
      return state;
    }

    case ACTIONS.NEW_GAME: {
      if (action.newFieldState) {
        return { ...state, field: action.newFieldState, game: { isOver: false } };
      }
    }

    case ACTIONS.RESET_HISTORY: {
      return { ...state, winCounter: { o: 0, x: 0, d: 0 }, }
    }
    case ACTIONS.RESET_GAME: {
      return initialState
    }

    case ACTIONS.RIVAL: {
      if (action.rival && action.modalType !== undefined) {
        return {
          ...state,
          rival: action.rival,
          modalType: action.modalType
        }
      }
      return state
    }

    case ACTIONS.CREATE_ROOM: {
      if (action.roomName) {
        return {
          ...state, modalType: '', online: {
            roomId: action.roomName,
            player: 'o'
          }
        }
      }
    }

    case ACTIONS.JOIN_ROOM: {
      if (action.roomName && action.player) {
        return {
          ...state, modalType: '',
          online: {
            roomId: action.roomName,
            player: action.player
          }
        }
      }
    }

    case ACTIONS.SET_COUNTER: {
      if (action.counter && action.turn) {
        return {
          ...state,
          winCounter: action.counter,
          turn: action.turn
        }
      }
    }

    default:
      throw new Error('Undefined type of action')
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <div className="App">
      <Field dispatch={dispatch} state={state} />
      {state.modalType && <ModalWindowManager dispatch={dispatch} state={state} />}
    </div>
  );
}

export default App;
