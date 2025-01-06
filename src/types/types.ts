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
  game: {
    isOver: boolean,
    result?: 'x' | 'o' | 'd'
  },
  rival: string
}
export type ReducerActionType = {
  type: string,
  payload?: {
    id?: number,
    rival?: string
  }
}

export type FieldType = string[]