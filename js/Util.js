/** Returns a random integer in the specified range */
export function getRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min));
}
/** Returns a 5 color heatmap representation of the
 * value as a HSL string. */
export function hslHeatMapColor(value) {
    const h = (1.0 - value) * 240;
    console.log("Hue: " + h + "; value: " + value);
    return "hsl(" + h + ", 100%, 50%)";
}
