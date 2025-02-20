import React, { useEffect, useRef, useState } from 'react'
import { ReducerActionType } from '../types/types'
import { ACTIONS } from '../constants'
import { auth, db } from '../firebase'
import { get, ref } from 'firebase/database'
import { createRoom, joinRoom } from '../utils/gameUtils'
import { signInAnonymously, User } from 'firebase/auth'

type RoomModalWindowType = {
    dispatch: React.Dispatch<ReducerActionType>
}

function RoomModalWindow({ dispatch }: RoomModalWindowType) {
    const [room, setRoom] = useState<'join' | 'create'>('join')
    const [rooms, setRooms] = useState<string[]>([])
    const nameRef = useRef<HTMLInputElement | null>(null);
    const roomInputRef = useRef<HTMLInputElement | null>(null);
    const roomSelectRef = useRef<HTMLSelectElement | null>(null);

    useEffect(() => {
        if (room === 'join') {
            async function getRooms() {
                try {
                    const snapshot = await get(ref(db, 'rooms'))
                    if (snapshot.exists()) {
                        const rooms = snapshot.val()
                        const freeRooms = Object.keys(rooms).filter((r: string) =>
                            Object.values(rooms[r].players).some(p => p === "")
                        );

                        setRooms(freeRooms)
                    }
                } catch {
                    throw new Error
                }

            }
            getRooms()
        }
    }, [])

    const handleJoinRoom = async () => {
        if (roomSelectRef.current?.value && nameRef.current?.value) {
            try {
                await signInAnonymously(auth);

                const player = await joinRoom(roomSelectRef.current?.value, nameRef?.current?.value)
                dispatch({ type: ACTIONS.JOIN_ROOM, roomName: roomSelectRef.current?.value, player })
            } catch (err) {
                console.log('Failed to join a room:', err);
            }
        }
    }

    const handleCreateRoom = async () => {
        if (roomInputRef.current?.value && nameRef.current?.value) {
            try {
                await signInAnonymously(auth);
                await createRoom(roomInputRef.current?.value, nameRef.current?.value)
                dispatch({ type: ACTIONS.CREATE_ROOM, roomName: roomInputRef?.current.value, name: nameRef?.current.value })

            } catch (err) {
                console.log('Failed to create a room:', err);
            }
        }
    }

    return (
        <div className="modal">
            <div className="modal-box">
                <p className="modal-text"><span className="o-color">Tic </span> Tac <span className="x-color"> Toe</span></p>

                <p className='rainbow'> {room === 'join' ? 'Join a room' : 'Create a room'}</p>

                <div className="modal-buttons">
                    <input ref={nameRef} className='btn input' placeholder='Your name' />


                    {
                        room === 'join' && (
                            <>
                                <select className='btn input' ref={roomSelectRef}>
                                    <option value=''>Room</option>
                                    {
                                        rooms.map((room, i) => <option key={`${room}${i}`} value={room}>{room}</option>)
                                    }
                                </select>

                                <button onClick={handleJoinRoom} className="btn">Join the room</button>

                                <button onClick={() => setRoom('create')} className="btn btn-create">Want to create a room?</button>
                            </>
                        )
                    }

                    {
                        room === 'create' && (
                            <>
                                <input ref={roomInputRef} className='btn input' placeholder='Room name' />

                                <button onClick={handleCreateRoom} className="btn">Create a room</button>

                                <button onClick={() => setRoom('join')} className="btn btn-create">Already have a room?</button>

                            </>
                        )
                    }
                    <button onClick={() => dispatch({ type: ACTIONS.RESET_GAME })} className="btn-back"></button>
                </div>

            </div>
        </div>
    )
}

export default RoomModalWindow