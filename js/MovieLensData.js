import { Data } from "./Data.js";
import { movieLens } from "./data/MovieLens.js";
export class MovieLensData extends Data {
    movieLensRatings;
    constructor(input, output) {
        super(input, output);
        //Convert movieLensData to object
        this.movieLensRatings = JSON.parse(movieLens);
        //Work out the maximum size of input to accommodate all user ratings.
        for (let user in this.movieLensRatings) {
            console.log(this.movieLensRatings[user].completeTags.length);
        }
        this.inputWidth = 3;
        this.inputHeight = 3;
        // Ratings range from 0-5
        this.outputWidth = 6;
        this.outputHeight = 1;
        this.name = "MovieLens";
    }
    /**  */
    test() {
        if (this.input.width !== this.inputWidth)
            return false;
        if (this.input.height !== this.inputHeight)
            return false;
        if (this.output.width !== this.outputWidth)
            return false;
        if (this.output.height !== this.outputHeight)
            return false;
        return true;
    }
    update() {
        // //Update input
        // const inputPattern = this.letters[this.letterIndex].i;
        // for(let x:number=0; x<this.inputWidth; ++x){
        //     for(let y:number=0; y<this.inputHeight; ++y){
        //         this.input.nodes[x][y].value = inputPattern[y][x];
        //     }
        // }
        // //Update output
        // if(Neuron.training){
        //     const outputPattern = this.letters[this.letterIndex].o;
        //     for(let x:number=0; x<this.outputWidth; ++x){
        //         for(let y:number=0; y<this.outputHeight; ++y){
        //             //Need to switch x and y around on output pattern to make it work
        //             this.output.nodes[x][y].value = outputPattern[y][x];
        //         }
        //     }
        // }
        // //Increase letter index or loop round to zero
        // this.letterIndex++;
        // this.letterIndex %= this.letters.length;
    }
    getParameters() {
        return {};
    }
    setParameters(parameters) {
    }
}
