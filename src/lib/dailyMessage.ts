const DAILY_MESSAGES = [
  "The stars noticed you came back.\nI've been waiting for you, {name}.",
  "I saved your seat by the window.\nThe cards feel warmer when you're here.",
  "Luna sat on The Sun card all morning.\nI think that's a very good omen for you.",
  "The candles turned pink at dawn.\nThat usually means someone special is near.",
  "The tea leaves spelled your name today.\nThe universe is not subtle, {name}.",
  "A tiny wish is circling the lantern.\nKeep yours ready, {name}.",
  "The Moon card was warm to the touch.\nTrust your dreams tonight.",
];

const TAP_GREETINGS = [
  "Welcome back, {name}.",
  "I was hoping you'd visit today.",
  "The cards missed you. (So did I.)",
  "Perfect timing — the kettle just sang.",
  "There's a wish waiting for you, {name}.",
];

function dailyIndex() {
  const d = new Date();
  return (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % DAILY_MESSAGES.length;
}

export function getDailyMessage(username: string) {
  return DAILY_MESSAGES[dailyIndex()].replaceAll("{name}", username);
}

export function getDailyMessageHeadline(username: string) {
  return getDailyMessage(username).split("\n")[0];
}

export function getTapGreeting(username: string) {
  const d = new Date();
  const idx = (d.getHours() + d.getDate()) % TAP_GREETINGS.length;
  return TAP_GREETINGS[idx].replaceAll("{name}", username);
}
