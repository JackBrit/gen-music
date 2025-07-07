import * as Tone from 'tone';
import { getRandomBetween, scheduleRandomRepeat } from '../utils';

export async function playEnoPiece(): Promise<Tone.Analyser> {
  return new Promise(resolve => {
    const freeverb = new Tone.Freeverb({ roomSize: 0.7, dampening: 2000, wet: 0.8 });
    const reverbControllerLfo = new Tone.LFO({ min: 0.1, max: 0.8, frequency: 0.8 });
    const analyser = new Tone.Analyser('fft', 64);

    reverbControllerLfo.connect(freeverb.wet);
    reverbControllerLfo.start();

    const sampler = new Tone.Sampler({
      baseUrl: '/samples/upright-piano/',
      // prettier-ignore
      urls: {
        "A0": "a0.mp3",
        "C#1": "csharp1.mp3",
        "F1": "f1.mp3",
        "C#2": "csharp2.mp3",
        "F2": "f2.mp3",
        "A2": "a2.mp3",
        "C#3": "csharp3.mp3",
        "F3": "f3.mp3",
        "A3": "a3.mp3",
        "C#4": "csharp4.mp3",
        "F4": "f4.mp3",
        "A4": "a4.mp3",
        "C#5": "csharp5.mp3",
        "F5": "f5.mp3",
        "A5": "a5.mp3",
        "C#6": "csharp6.mp3",
        "F6": "f6.mp3",
         "A6": "a6.mp3",
        "C#7": "csharp7.mp3",
        "F7": "f7.mp3",
        "A7": "a7.mp3", 
        "C8": "c8.mp3"
    },
      volume: -3,
      onload: () => {
        const bpm = 125;
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.start();
        resolve(analyser);
      }
    });

    sampler.chain(freeverb, analyser, Tone.Destination);

    scheduleRandomRepeat(
      function (time) {
        sampler.triggerAttack('F4', time);
      },
      1,
      50,
      getRandomBetween(4, 16)
    );
    scheduleRandomRepeat(
      function (time) {
        sampler.triggerAttack('Ab4', time);
      },
      15,
      30,
      getRandomBetween(0, 15)
    );
    scheduleRandomRepeat(
      time => {
        sampler.triggerAttack('C5', time);
      },
      5,
      70,
      getRandomBetween(15, 25)
    );
    scheduleRandomRepeat(
      time => {
        sampler.triggerAttack('Db5', time);
      },
      30,
      35,
      getRandomBetween(2, 15)
    );
    scheduleRandomRepeat(
      time => {
        sampler.triggerAttack('Eb5', time);
      },
      1,
      30,
      getRandomBetween(5, 15)
    );
    scheduleRandomRepeat(
      time => {
        sampler.triggerAttack('F5', time);
      },
      12,
      43
    );
    scheduleRandomRepeat(
      time => {
        sampler.triggerAttack('Ab5', time);
      },
      15,
      30,
      5
    );
  });
}
