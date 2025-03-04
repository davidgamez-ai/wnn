export class Util {
    static getRandom(min, max) {
        return min + Math.floor(Math.random() * (max - min));
    }
}
