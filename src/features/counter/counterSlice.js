import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchCount } from './counterAPI';
import {player} from '../../index'


import * as Tone from 'tone'
import music from './music2.mp3';
import {useDispatch} from "react-redux"; //tempo 113
//import {player} from "./Counter"
//my-app/src/features/counter/counterSlice.js
//my-app/src/index.js
const initialState = {
  activePosition:0,
  loaded:0,
  value: 0,
  bpm:113,
  wait:0,
  expand:1.0,
  status: 'idle',
  audioLength:0,
  numberOf4n:3,
};


// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const incrementAsync = createAsyncThunk(
  'counter/fetchCount',
  async (amount) => {
    const response = await fetchCount(amount);
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    initPlayer:(state)=>{

    },
    build:(state,action)=>{
      state.musicLength = action.payload
      state.numberOf4n = Math.ceil(action.payload * state.bpm /60)
      state.loaded=1
    },
    playThis:(state,action)=>{
      let i = action.payload
      let note4n=state.musicLength/state.numberOf4n
      player.setLoopPoints(note4n*i, note4n*(i+1));
      player.start()
    },

    playFull:(state)=>{
      //player.setLoopPoints(0, note4n);
      //player.start()
    },
    changeBpm:(state,action)=>{
      state.bpm=Number(action.payload)
      state.numberOf4n = Math.ceil(state.musicLength * state.bpm /60)
    },
    changeWait:(state,action)=>{
      state.wait=action.payload
    },
    changeExpand:(state,action)=>{
      state.expand=action.payload
    },
    shiftActivePosition:(state,action)=>{
      state.activePosition=action.payload
    },

    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(incrementAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.value += action.payload;
      });
  },
});

export const {
  increment,
  decrement,
  incrementByAmount,
  initPlayer,
  playFull,
  build,
  playThis,
  changeBpm,
  changeWait,
  changeExpand,
  shiftActivePosition,
} = counterSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectCount = (state) => state.counter.value;
export const select4n = (state) => state.counter.numberOf4n;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
export const incrementIfOdd = (amount) => (dispatch, getState) => {
  console.log('uncre')
  const currentValue = selectCount(getState());
  if (currentValue % 2 === 1) {
    dispatch(incrementByAmount(amount));
  }
};

export default counterSlice.reducer;
