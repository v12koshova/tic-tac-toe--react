import React, { useReducer } from 'react';
import InitialModalWindow from './components/InitialModalWindow';
import Field from './components/Field';
import { FieldType, ReducerActionType, StateType } from './types/types';
import ModalWindow from './components/ModalWindow';
import { ACTIONS } from './constants';
import { checkField, computerMove } from './utils/gameUtils';


const initialState: StateType = {
  field: ['', '', '', '', '', '', '', '', ''],
  turn: "o",
  winCounter: { o: 0, x: 0, d: 0 },
  game: { isOver: false },
  rival: ''
};

const reducer = (state: StateType, action: ReducerActionType): StateType => {

  switch (action.type) {
    case ACTIONS.MOVE: {
      if (action.payload) {
        const newFieldState = [...state.field]
        newFieldState[action.payload.id as number] = state.turn

        const turn = state.rival === 'friend' ? state.turn : 'o'
        let newState: StateType = checkField(state, newFieldState, turn)

        return newState
      }
      return state
    }
    case ACTIONS.COMPUTER_MOVE: {
      if (state.rival === 'computer' && !state.game.isOver) {
        return computerMove(state)
      }
      return state;
    }

    case ACTIONS.NEW_GAME: {
      const clearField: FieldType = ['', '', '', '', '', '', '', '', ''];
      return { ...state, field: clearField , game: { isOver: false } };
    }

    case ACTIONS.RESET_HISTORY: {
      return { ...state, winCounter: { o: 0, x: 0, d: 0 }, }
    }
    case ACTIONS.RESET_GAME: {
      return initialState
    }

    case ACTIONS.RIVAL: {
      if (action.payload && action.payload.rival) {
        return {
          ...state,
          rival: action.payload.rival
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
      {!state.rival && <InitialModalWindow dispatch={dispatch} />}
      <Field dispatch={dispatch} state={state} />
      <ModalWindow game={state.game} rival={state.rival} dispatch={dispatch} />
    </div>
  );
}

export default App;
