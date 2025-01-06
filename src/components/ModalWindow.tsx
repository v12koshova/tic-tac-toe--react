import React, { useEffect, useState } from 'react'
import { GameOverType, ReducerActionType } from '../types/types'
import { ACTIONS } from '../constants'
import congrats from '../assets/sounds/congrats.mp3'
import { playSnd } from '../utils/soundUtils';

export const end = new Audio(congrats);

type PropsType = {
  game: GameOverType,
  dispatch: React.Dispatch<ReducerActionType>,
  rival: string
}

function ModalWindow({ game, dispatch, rival }: PropsType) {
  const [modalOpen, setModalOpen] = useState(false)
  const [gif, setGif] = useState('tic-tac-toe--react/images/happy0.gif')

  useEffect(() => {
    if (game.isOver) {
      const index:number = Math.floor(Math.random() * 5)

      if (rival === 'computer' && game.result === 'o') {
        setGif(`tic-tac-toe--react/images/sad${index}.gif`)
      } else if (rival === 'computer' && game.result === 'x') {
        setGif(`tic-tac-toe--react/images/happy${index}.gif`)
      } else {
        setGif(`tic-tac-toe--react/images/waiting${index}.gif`)
      }
      
      setTimeout(() => setModalOpen(true), 1500)
      setTimeout(() => playSnd(end), 1500)
    } else {
      setModalOpen(false)
    }
  }, [game.isOver])

  return (
    <>
   { modalOpen && 
    <div className="modal">
        <div className="modal-box">
                <p className="rainbow modal-text">
                  <span className={game.result}></span>
                  {
                    game.result === 'd' ? 'Draw!' : 'congratulation!!!!'
                  }
                
                  </p>
                <button onClick={() => dispatch({ type: ACTIONS.NEW_GAME })} className="btn">New game</button>
                <div className="gif gif-result">
                  <img src={gif} />
                </div>
        </div>
    </div>
  }
  </>
  )
}

export default ModalWindow