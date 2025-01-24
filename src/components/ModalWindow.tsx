import React, { useEffect, useState } from 'react'
import { FieldType, GameOverType, ReducerActionType, StateType } from '../types/types'
import { ACTIONS } from '../constants'
import congrats from '../assets/sounds/congrats.mp3'
import { playSnd } from '../utils/soundUtils';
import { get, ref, set, update } from 'firebase/database';
import { db } from '../firebase';

export const end = new Audio(congrats);

type PropsType = {
  state: StateType,
  dispatch: React.Dispatch<ReducerActionType>,
}

function ModalWindow({ state, dispatch }: PropsType) {
  const { game, rival } = state
  const [modalOpen, setModalOpen] = useState(false)
  const [gif, setGif] = useState(process.env.PUBLIC_URL + '/images/happy0.gif')

  useEffect(() => {
    if (game.isOver) {
      const index: number = Math.floor(Math.random() * 5)

      if (rival === 'computer' && game.result === 'o') {
        setGif(process.env.PUBLIC_URL + `/images/sad${index}.gif`)
      } else if (rival === 'computer' && game.result === 'x') {
        setGif(process.env.PUBLIC_URL + `/images/happy${index}.gif`)
      } else {
        setGif(process.env.PUBLIC_URL + `/images/waiting${index}.gif`)
      }

      setTimeout(() => setModalOpen(true), 1500)
      setTimeout(() => playSnd(end), 1500)
      if (state.online) {
        set(ref(db, `rooms/${state.online.roomId}/modals/${state.online.player}`), true)
        set(ref(db, `rooms/${state.online.roomId}/turn`), `${state.turn}`)
      }
    } else {
      setModalOpen(false)
      if (state.online) {
        set(ref(db, `rooms/${state.online.roomId}/modals/${state.online.player}`), false)
      }
    }
  }, [game.isOver])



  const handleNewGame = () => {
    const clearField: FieldType = ['', '', '', '', '', '', '', '', ''];

    if (state.online) {
      set(ref(db, `rooms/${state.online.roomId}/field`), clearField)
      update(ref(db, `rooms/${state.online.roomId}/winCounter`), {
        ...state.winCounter,
      })
    }

    dispatch({ type: ACTIONS.NEW_GAME, newFieldState: clearField })

  }

  return (
    <>
      {modalOpen &&
        <div className="modal">
          <div className="modal-box">

            {game.result &&
              <>
                <p className="rainbow modal-text">
                  <span className={game.result}></span>
                  {
                    game.result === 'd' ? 'Draw!' : 'congratulation!!!!'
                  }

                </p>
                <button onClick={handleNewGame} className="btn">New game</button>
                <div className="gif gif-result">
                  <img src={gif} />
                </div>
              </>
            }

          </div>
        </div>
      }
    </>
  )
}

export default ModalWindow