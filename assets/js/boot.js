/*
 * Runs synchronously in <head>, before first paint.
 *
 * Anything that starts hidden and is revealed by JavaScript is gated behind
 * the `js` class in CSS. Without JavaScript the class never appears, so the
 * page renders fully visible with no extra no-JS stylesheet gymnastics.
 */
document.documentElement.classList.add("js");
