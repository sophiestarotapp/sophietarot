/** Optional voice greeting via Web Speech API. Fails silently if unavailable. */
export function speakWelcome(username: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const line = `Welcome back, ${username}.`;
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(line);
  utter.rate = 0.95;
  utter.pitch = 1.08;
  utter.volume = 0.85;

  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        /female|samantha|victoria|zira|karen|moira|fiona/i.test(v.name)
    );
    if (preferred) utter.voice = preferred;
  };

  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
  window.speechSynthesis.speak(utter);
}

export function greetingTodayKey() {
  return new Date().toISOString().slice(0, 10);
}
