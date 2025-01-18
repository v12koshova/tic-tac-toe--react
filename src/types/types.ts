export type WinCounterType = {
  o: number;
  x: number;
  d: number;
}

export type GameOverType = {
  isOver: boolean,
  result?: 'x' | 'o' | 'd'
}

export type StateType = {
  turn: 'x' | 'o',
  winCounter: {
    o: number,
    x: number,
    d: number
  },
  field: string[],
  game: GameOverType,
  rival: string,
  modalType: string,
  online?: {
    roomId: string,
    player: string
  }
}
export type ReducerActionType = {
  type: string,
  newFieldState?: string[],
  rival?: '' | 'computer' | 'friend',
  modalType?: 'initial' | 'online' | 'result' | '',
  roomName?: string,
  name?: string,
  player?: string,
  counter?:WinCounterType,
  turn?: 'x' | 'o'
}

export type FieldType = string[]