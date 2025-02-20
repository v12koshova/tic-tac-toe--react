import React, { MouseEvent, useEffect, useState } from 'react'
import { ACTIONS } from '../constants'
import { ReducerActionType, StateType } from '../types/types'
import thinkingGif from '../assets/images/thinking.gif';
import waitingGif from '../assets/images/waiting5.gif';
import { onDisconnect, onValue, ref, update } from 'firebase/database';
import { db } from '../firebase';
import { getInfo } from '../utils/gameUtils';
import { flushSync } from 'react-dom';


type FieldType = {
    state: StateType,
    dispatch: React.Dispatch<ReducerActionType>
}

function Field({ dispatch, state }: FieldType) {
    const [gameOn, setGameOn] = useState(false)
    const [players, setPlayers] = useState({ x: '', o: '' })
    const [handleRoom, setHandleRoom] = useState<'set' | 'delete'>('delete')
    const { online, modalType, field, turn, rival } = state

    useEffect(() => {
        if (!online) {
            setGameOn(true)
        }
    }, [modalType])

    const handleUpdateCounter = async () => {
        if (online?.roomId) {
            const data = await getInfo(online.roomId)
            setPlayers(data?.players)
            dispatch({ type: ACTIONS.SET_COUNTER, counter: data?.winCounter, turn: data?.turn })
        }
    }

    const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
        const newFieldState = [...field]
        newFieldState[+e.currentTarget.id] = turn

        if (online) {
            await update(ref(db, `rooms/${online.roomId}`), {
                field: newFieldState,
                turn: turn === 'o' ? 'x' : 'o'
            })
        } else {
            dispatch({ type: ACTIONS.MOVE, newFieldState })
        }
    }

    useEffect(() => {
        if (rival === 'computer' && !state.game.isOver && turn === 'x') {
            setTimeout(() => {
                dispatch({ type: ACTIONS.COMPUTER_MOVE })
            }, 1000)
        }
    }, [turn, state.game.isOver])


    useEffect(() => {
        if (online) {
            const gameRef = ref(db, `rooms/${online.roomId}/field`);
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
    }, [online?.roomId]);


    useEffect(() => {

        if (online) {

            const playersRef = ref(db, `rooms/${online.roomId}/players/`);
            const roomRef = ref(db, `rooms/${online.roomId}/`);

            if (handleRoom === 'delete') {
                onDisconnect(roomRef).remove();

            } else if (handleRoom === 'set') {
                onDisconnect(roomRef).cancel()
                onDisconnect(ref(db, `rooms/${online.roomId}/players/${online?.player}`)).set('');
                onDisconnect(ref(db, `rooms/${online.roomId}/modals/${online?.player}`)).set(true);
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
    }, [online?.roomId, handleRoom]);


    const handleResetWinHistory = async () => {
        dispatch({ type: ACTIONS.RESET_HISTORY })

        if (online) {
            update(ref(db, `rooms/${online?.roomId}/winCounter`), {
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

        if (online) {
            await update(ref(db, `rooms/${online?.roomId}/players`), { [online.player]: '' })
            setPlayers({ x: '', o: '' })
        }
    }


    return (
        <div className='game'>
            <div className="counters">
                <div className="section section_o">
                    <div className="o"></div>
                    <p>{state.winCounter.o} wins</p>
                    {
                        online && players && <p>{players['o']}</p>
                    }
                </div>
                <div className="section section_draw">
                    <div className="draw"></div>
                    <p>{state.winCounter.d} draws</p>
                    {
                        online && players && <p>vs</p>
                    }
                </div>
                <div className={`section section_x ${rival === 'computer' ? 'computer' : ''}`}>
                    <div className="x"></div>
                    <p>{state.winCounter.x} wins</p>
                    {
                        online && players && <p>{players['x']}</p>
                    }
                </div>
            </div>
            <div className="reset-buttons">
                <button onClick={handleResetWinHistory} className="btn">Reset win History</button>
                <button onClick={handleResetGame} className="btn">Reset Game</button>
            </div>
            <div className={`field ${turn === 'o' ? 'turnO' : 'turnX'}`}>
                {
                    field.map((cell, i) => <button
                        disabled={cell !== '' ||
                            rival === 'computer' && turn === 'x' ||
                            online?.player === 'x' && turn === 'o' ||
                            online?.player === 'o' && turn === 'x' ||
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
                rival === 'computer' && turn === 'x' &&
                !state.game.isOver && <div className="gif gif-think">
                    <img src={thinkingGif} />
                </div>
            }
            {online?.player === 'x' && turn === 'o' ||
                online?.player === 'o' && turn === 'x' ||
                online && !gameOn && <div className="gif gif-think">
                    <p className='text rainbow'>Waiting...</p>
                    <img src={waitingGif} />
                </div>
            }

        </div>
    )
}

export default Field