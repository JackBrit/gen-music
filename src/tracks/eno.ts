import * as Tone from 'tone';
import { getRandomBetween, scheduleRandomRepeat } from '../utils';

export async function playEnoPiece(): Promise<Tone.Analyser> {
return new Promise((resolve) => {
  const freeverb = new Tone.Freeverb({ roomSize: 0.5, dampening: 2000, wet: 0.5 });
  const reverbControllerLfo = new Tone.LFO({ min: 0.2, max: 1, frequency: 0.25 });
  const analyser = new Tone.Analyser('fft', 64);
  
  reverbControllerLfo.connect(freeverb.wet);
  reverbControllerLfo.start();

  const sampler = new Tone.Sampler({
    baseUrl: '/samples/upright-piano/',
    urls: {
        "A0": "a0.wav",
        "C#1": "csharp1.wav",
        "F1": "f1.wav",
        "C#2": "csharp2.wav",
        "F2": "f2.wav",
        "A2": "a2.wav",
        "C#3": "csharp3.wav",
        "F3": "f3.wav",
        "A3": "a3.wav",
        "C#4": "csharp4.wav",
        "F4": "f4.wav",
        "A4": "a4.wav",
        "C#5": "csharp5.wav",
        "F5": "f5.wav",
        "A5": "a5.wav",
        "C#6": "csharp6.wav",
        "F6": "f6.wav",
        "A6": "a6.wav",
        "C#7": "csharp7.wav",
        "F7": "f7.wav",
        "A7": "a7.wav",
        "C8": "c8.wav"
    },
    volume: -6,
    onload: () => {
        const bpm = 125;
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.start();
        resolve(analyser);
    }
  });

   sampler.chain(freeverb, analyser, Tone.Destination);

    scheduleRandomRepeat(function(time) {
        sampler.triggerAttack('F4', time);
    }, 1, 50, getRandomBetween(4, 16));
    scheduleRandomRepeat(function(time) {
        sampler.triggerAttack('Ab4', time);
    }, 15, 30, getRandomBetween(0, 15));
    scheduleRandomRepeat(function(time) {
        sampler.triggerAttack('C5', time);
    }, 5, 70, getRandomBetween(15, 25));
    scheduleRandomRepeat(function(time) {
        sampler.triggerAttack('Db5', time);
    }, 30, 35, getRandomBetween(2, 15));
    scheduleRandomRepeat(function(time) {
        sampler.triggerAttack('Eb5', time);
    }, 17, 25);
    scheduleRandomRepeat(function(time) {
        sampler.triggerAttack('F5', time);
    }, 12, 43);
    scheduleRandomRepeat(function(time) {
        sampler.triggerAttack('Ab5', time);
    }, 15, 30, 5);

    });
}
