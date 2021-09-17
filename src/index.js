import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store } from './app/store';
import {Provider, useSelector} from 'react-redux';
import * as serviceWorker from './serviceWorker';

import * as Tone from 'tone'
import music from "./music2.mp3";
import {
  build,
  playActiveToneBySoft,
  secToActivePosition,
  setSeq,
  shiftActivePosition
} from "./features/counter/counterSlice";

//Tone.js------------------------------
let musicLength=0
let tempo,note4n,note1m,note2m

let musicOnLoad=()=>{
  console.log(player.loaded)
  console.log('loaded')

  musicLength = player.buffer.duration
  tempo=130
  note4n = 60/tempo
  note1m = 4*60/tempo
  note2m = 2*4*60/tempo
  /*
  let numberOf4n=Math.ceil(musicLength*tempo/60)
  console.log(numberOf4n)
   */
  store.dispatch(build(musicLength))
  //dispatch(build(numberOf4n))
}

//主音源再生用のオブジェクト
export const player = new Tone.Player(music,()=>musicOnLoad()).toDestination();

player.loop = true;
player.autostart = false;
player.isPlay=false
player.volume.value=-18
let seq =new Tone.Sequence((time, note) => {
  synth.triggerAttackRelease(note, 0.1, time);
  // subdivisions are given as subarrays
}, [0]);

//refactoring
export const newPlayer = new Tone.Player(music,()=>musicOnLoad()).toDestination();
newPlayer.loop = false;
newPlayer.autostart = false;
newPlayer.isPlay=false
newPlayer.volume.value=-18


export let synthScore=[]
let tickReso = 32
export const testRun = (startStep,endStep,score)=>{
  let tick =0
  let bpm =113
  let tickParStep = tickReso / 4

  let startSec = startStep *60/bpm
  let endTick = endStep * tickParStep
  let isDispatched = true
  let isLoop=true



  Tone.Transport.scheduleRepeat((time) => {
    let step= Math.floor(tick/tickParStep)+startStep

        let obj={}
        obj.flgBeatPoint = true
        obj.doSoftSynth = true

    if (newPlayer.state == "stopped" && (isDispatched || isLoop)) {
      //停止中
      newPlayer.start(time,startSec,newPlayer.buffer.duration)
      isDispatched=false
    } else {
      //再生中

      if (obj.progress >= obj.end) {

        if (obj.isLoop) {
          //戻す
        } else {
          //再生停止
        }
      }
    }
    //Synth part
    if (tick%tickParStep==0) {
      if (obj.doSoftSynth) {
        //Play soft Synth
        synth.triggerAttackRelease(score[step], 0.3, time);
      }
    }

    //戻す
    if(step>endStep){
      newPlayer.stop()
      tick=0
      Tone.Transport.stop()
    }
    tick+=1
  }, "32n", 0)
  Tone.Transport.bpm.value=113
  Tone.Transport.start()
}

export const resumeTest=()=>{
  console.log('seconds',Tone.Transport.seconds)
  if(newPlayer.state=="stopped"){

    Tone.Transport.start()
    newPlayer.start()
  }else {
    Tone.Transport.stop()
    newPlayer.stop()
  }
}

export const setSoftSynthSequence=(notes)=>{
  let i =0
  let seqs = []
  for(let arg of notes){
    seqs.push(toNoteString(arg))
    seqs.push(0)
  }
  seq.events=seqs
}

//シークバーによる再生を、シークバーの進捗と四分音符ボタンの位置に同期させるFunction
export const playWithProgress = (isLoop,start,end)=>{

  if(!player.isPlay){

    let interval = 0.2
    let position =0
    Tone.Transport.scheduleRepeat((time) => {
      //再生状況をプログレスバーに反映するためのコールバック
      //ToDO:コールバックでstatusを確認して、stoppedならもっかい再生という
      //処理に変更すればシンプルかもしれない。

      if(!player.isPlay) {
        //再生開始時

        if(isLoop){
          //ループがTrue時は、stop/startが効かない。setLoopPointsで再生

          player.setLoopPoints(start, end)
          player.start()

        }else {
          player.stop()
          player.start(0, start, end)
        }
        player.isPlay = true
        player.sec = start

        //store.dispatch(setSeq())
        //seq.start()

      }else{
        //再生中
        player.sec += interval
        //曲の終わりまで来たら、手動で巻き戻し
        if(player.sec>=end) player.sec = start
        //ActivePositionを更新
        store.dispatch(secToActivePosition(player.sec))

      }
      if (player.state=='stopped'){
        //何らかの処理でplayerが止まったら、ちゃんと止める
        Tone.Transport.stop()
        store.dispatch(secToActivePosition(0))
        player.isPlay = false
      }


    }, interval, 0);

  }else{
    //すでに再生中に呼ばれたら、止める
    player.isPlay=false
    player.stop()
    Tone.Transport.stop()
  }

}

//ソフトシンセ用のブロック
//export const loop = new Tone.Loop((time) => {
  //store.dispatch(playActiveToneBySoft())
//})//.start(0);
/*
Tone.Transport.scheduleRepeat((time) => {
   store.dispatch(playActiveToneBySoft(time))
}, "4n");
*/
export const synth = new Tone.Synth().toDestination();
synth.volume.value=0


export const toNoteString=(num)=>{
  // 24 = C2
  // noteNumber = noteSymbol + noteHeight
  const toToneLetter=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B',]
  let noteNumber=num
  let noteSymbol = toToneLetter[noteNumber%12]
  let noteHeight = ~~(noteNumber/12)
  let note = String(noteSymbol)+String(noteHeight)
  return note
}

export const timeColoned =(sec)=>{
  let date = new Date(null);
  date.setSeconds(sec); // specify value for SECONDS here
  let result = date.toISOString().substr(14, 5);
  return result
}

//------------
require('react-dom');
window.React2 = require('react');
console.log('reactcheck');
console.log(window.React1 === window.React2);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
