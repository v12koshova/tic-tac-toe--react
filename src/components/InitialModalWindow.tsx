import React from 'react'
import { ReducerActionType } from '../types/types'
import { ACTIONS } from '../constants'
import hiGif from '../assets/images/hello.gif'

type PropsType = {
    dispatch: React.Dispatch<ReducerActionType>
}

function InitialModalWindow({ dispatch }: PropsType) {
    return (
        <div className="modal">
            <div className="modal-box">
                <p className="modal-text"><span className="o-color">Tic </span> Tac <span className="x-color"> Toe</span></p>

                <div className="modal-buttons">
                    <button onClick={() => dispatch({ type: ACTIONS.RIVAL, rival: 'computer', modalType: '' })} className="btn computer-btn">Play with the computer</button>
                    <button onClick={() => dispatch({ type: ACTIONS.RIVAL, rival: 'friend', modalType: '' })} className="btn">Play with a friend</button>
                    <button onClick={() => dispatch({ type: ACTIONS.RIVAL, rival: 'friend', modalType: 'online' })} className="btn">Online game</button>
                </div>

            </div>
            <div className="gif gif-hi"><img src={hiGif} /></div>
        </div>
    )
}

export default InitialModalWindow