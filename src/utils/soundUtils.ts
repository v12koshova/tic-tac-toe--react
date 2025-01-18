export const playSnd = (snd: HTMLAudioElement) => {
  snd.currentTime = 0;
  snd.play()
}