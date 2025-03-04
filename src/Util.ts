export class Util {
    public static getRandom(min:number, max:number){
        return min + Math.floor(Math.random() * (max-min))
    }
}