import React, { MouseEvent, useEffect, useRef, useState } from 'react'
import { ACTIONS } from '../constants'
import { ReducerActionType, StateType } from '../types/types'
import thinkingGif from '../assets/images/thinking.gif';
import waitingGif from '../assets/images/waiting5.gif';
import { onDisconnect, onValue, ref, update, remove } from 'firebase/database';
import { db } from '../firebase';
import { getInfo } from '../utils/gameUtils';
import { flushSync } from 'react-dom';


type PropsType = {
    state: StateType,
    dispatch: React.Dispatch<ReducerActionType>
}

function Field({ dispatch, state }: PropsType) {
    const [gameOn, setGameOn] = useState(false)
    const [players, setPlayers] = useState({ x: '', o: '' })
    const [handleRoom, setHandleRoom] = useState<'set' | 'delete'>('delete')

    useEffect(() => {
        if (!state.online) {
            setGameOn(true)
        }
    }, [state.modalType])

    const handleUpdateCounter = async () => {
        if (state.online?.roomId) {
            const data = await getInfo(state.online.roomId)
            setPlayers(data?.players)
            dispatch({ type: ACTIONS.SET_COUNTER, counter: data?.winCounter, turn: data?.turn })
        }
    }

    const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
        const newFieldState = [...state.field]
        newFieldState[+e.currentTarget.id] = state.turn

        if (state.online) {
            await update(ref(db, `rooms/${state.online.roomId}`), {
                field: newFieldState,
                turn: state.turn === 'o' ? 'x' : 'o'
            })
        } else {
            dispatch({ type: ACTIONS.MOVE, newFieldState })
        }
    }

    useEffect(() => {
        if (state.rival === 'computer' && !state.game.isOver && state.turn === 'x') {
            setTimeout(() => {
                dispatch({ type: ACTIONS.COMPUTER_MOVE })
            }, 1000)
        }
    }, [state.turn, state.game.isOver])


    useEffect(() => {
        if (state.online) {
            const gameRef = ref(db, `rooms/${state.online.roomId}/field`);
            const unsubscribe = onValue(gameRef, (snapshot) => {
                if (snapshot.exists() &&
                    snapshot.val().some((cell: string) => cell !== '')) {
                    dispatch({ type: ACTIONS.MOVE, newFieldState: snapshot.val() })
                } else {
                    console.log("No game data found!");
                }
            });

            return () => unsubscribe();
        }
    }, [state.online?.roomId]);


    useEffect(() => {

        if (state.online) {

            const playersRef = ref(db, `rooms/${state.online.roomId}/players/`);
            const roomRef = ref(db, `rooms/${state.online.roomId}/`);

            if (handleRoom === 'delete') {
                onDisconnect(roomRef).remove();

            }  else if (handleRoom === 'set') {
                onDisconnect(roomRef).cancel()
                onDisconnect(ref(db, `rooms/${state.online.roomId}/players/${state.online?.player}`)).set('');
                onDisconnect(ref(db, `rooms/${state.online.roomId}/modals/${state.online?.player}`)).set(true);
            }

            const unsubscribe = onValue(playersRef, (snapshot) => {

                handleUpdateCounter()

                if (snapshot.exists()) {
                    const values = Object.values(snapshot.val())
                    const activePlayers = Object.values(values).filter(p => p !== '').length;

                    if (activePlayers === 2) {
                        setHandleRoom('set')
                    } else if (activePlayers === 1) {
                        setHandleRoom('delete')
                    }

                    if (!values.every(p => p === '')) {
                        setGameOn(values.every(p => p !== ''))
                    }
                }

            });

            return () => unsubscribe();
        }
    }, [state.online?.roomId, handleRoom]);


    const handleResetWinHistory = async () => {
        dispatch({ type: ACTIONS.RESET_HISTORY })

        if (state.online) {
            update(ref(db, `rooms/${state.online?.roomId}/winCounter`), {
                x: 0,
                o: 0,
                d: 0
            })
        }
    }
    const handleResetGame = async () => {
        flushSync(() => {
            dispatch({ type: ACTIONS.RESET_GAME })
        })

        if (state.online) {
            await update(ref(db, `rooms/${state.online?.roomId}/players`), { [state.online.player]: '' })
            setPlayers({x: '', o: ''})
        }

        dispatch({ type: ACTIONS.RESET_GAME })
    }


    return (
        <div className='game'>
            <div className="counters">
                <div className="section section_o">
                    <div className="o"></div>
                    <p>{state.winCounter.o} wins</p>
                    {
                        state.online && players && <p>{players['o']}</p>
                    }
                </div>
                <div className="section section_draw">
                    <div className="draw"></div>
                    <p>{state.winCounter.d} draws</p>
                    {
                        state.online && players && <p>vs</p>
                    }
                </div>
                <div className={`section section_x ${state.rival === 'computer' ? 'computer' : ''}`}>
                    <div className="x"></div>
                    <p>{state.winCounter.x} wins</p>
                    {
                        state.online && players && <p>{players['x']}</p>
                    }
                </div>
            </div>
            <div className="reset-buttons">
                <button onClick={handleResetWinHistory} className="btn">Reset win History</button>
                <button onClick={handleResetGame} className="btn">Reset Game</button>
            </div>
            <div className={`field ${state.turn === 'o' ? 'turnO' : 'turnX'}`}>
                {
                    state.field.map((cell, i) => <button
                        disabled={cell !== '' ||
                            state.rival === 'computer' && state.turn === 'x' ||
                            state.online?.player === 'x' && state.turn === 'o' ||
                            state.online?.player === 'o' && state.turn === 'x' ||
                            !gameOn ||
                            state.game.isOver}
                        key={i} onClick={handleClick} className={`cell ${cell}`} id={i.toString()}></button>)
                }
            </div>

            <div className="turn">
                <div className="turn-label-o"></div>
                <div className="turn-label-x"></div>
            </div>

            {
                state.rival === 'computer' && state.turn === 'x' &&
                !state.game.isOver && <div className="gif gif-think">
                    <img src={thinkingGif} />
                </div>
            }
            {state.online?.player === 'x' && state.turn === 'o' ||
                state.online?.player === 'o' && state.turn === 'x' ||
                state.online && !gameOn && <div className="gif gif-think">
                    <p className='text rainbow'>Waiting...</p>
                    <img src={waitingGif} />
                </div>
            }

        </div>
    )
}

export default Field