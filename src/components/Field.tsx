import React, { MouseEvent, useEffect } from 'react'
import { ACTIONS } from '../constants'
import { ReducerActionType, StateType } from '../types/types'
import thinkingGif from '../assets/images/thinking.gif';
import { playSnd } from '../utils/soundUtils';

import buttonSound from '../assets/sounds/button.mp3'

const button = new Audio(buttonSound);

type PropsType = {
    state: StateType,
    dispatch: React.Dispatch<ReducerActionType>
}

function Field({ dispatch, state }: PropsType) {

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        playSnd(button)
        dispatch({ type: ACTIONS.MOVE, payload: { id: +e.currentTarget.id } })
        
    }

    useEffect(() => {
        if (!state.game.isOver && state.rival === 'computer' && state.turn === 'x') {
            setTimeout(() => {
                playSnd(button)
                dispatch({ type: ACTIONS.COMPUTER_MOVE })
            }, 1000)
        }
    }, [state.turn, state.game.isOver])

    return (
        <div className='game'>
            <div className="counters">
                <div className="section section_o">
                    <div className="o"></div>
                    <p>{state.winCounter.o} wins</p>
                </div>
                <div className="section section_draw">
                    <div className="draw"></div>
                    <p>{state.winCounter.d} draws</p>
                </div>
                <div className={`section section_x ${state.rival === 'computer' ? 'computer' : ''}`}>
                    <div className="x"></div>
                    <p>{state.winCounter.x} wins</p>
                </div>
            </div>
            <div className="reset-buttons">
                <button onClick={() => dispatch({ type: ACTIONS.RESET_HISTORY })} className="btn">Reset win History</button>
                <button onClick={() => dispatch({ type: ACTIONS.RESET_GAME })} className="btn">Reset Game</button>
            </div>
            <div className={`field ${state.turn === 'o' ? 'turnO' : 'turnX'}`}>
                {
                    state.field.map((cell, i) => <button disabled={cell !== '' || (state.rival === 'computer' && state.turn === 'x') || state.game.isOver} key={i} onClick={handleClick} className={`cell ${cell}`} id={i.toString()}></button>)
                }
            </div>

            <div className="turn">
                <div className="turn-label-o"></div>
                <div className="turn-label-x"></div>
            </div>

           { state.rival === 'computer' && state.turn === 'x' && !state.game.isOver &&
            <div className="gif gif-think">
                <img src={thinkingGif} />
            </div>
           }

        </div>
    )
}

export default Field