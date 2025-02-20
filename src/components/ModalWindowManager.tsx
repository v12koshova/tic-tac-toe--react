import React from 'react'
import { ReducerActionType, StateType } from '../types/types'
import InitialModalWindow from './InitialModalWindow'
import ModalWindow from './ModalWindow'
import RoomModalWindow from './RoomModalWindow'

type ModalWindowManagerType = {
    state: StateType,
    dispatch: React.Dispatch<ReducerActionType>
}

function ModalWindowManager({ dispatch, state }: ModalWindowManagerType) {
    switch (state.modalType) {
        case 'initial':
            return <InitialModalWindow dispatch={dispatch} />
        case 'online':
            return <RoomModalWindow dispatch={dispatch} />
        case 'result':
            return <ModalWindow state={state} dispatch={dispatch} />
        default:
            return <></>
    }

}

export default ModalWindowManager