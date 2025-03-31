import { Data } from "./Data.js";
import { movieLens } from "./data/MovieLens.js";
export class MovieLensData extends Data {
    //Object containing MovieLens ratings
    movieLensRatings;
    //Current user
    user;
    //List of user IDs
    users = [];
    //Maps between tags and nodes in the input grid
    tagMap;
    constructor() {
        super("MovieLens");
        //Convert movieLensData to object
        this.movieLensRatings = JSON.parse(movieLens);
        //Load the user IDs
        for (let user in this.movieLensRatings) {
            this.users.push(parseInt(user));
        }
        //Set size of output. Each neuron encodes 0.5 of rating.
        this.outputWidth = 11; // 0=0, 1=0.5, 2=1 ... 11=5;
        this.outputHeight = 1;
        //Set starting user
        this.user = 2;
        this.updateInputSize();
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
        return {
            "User": {
                options: this.users,
                value: this.user
            }
        };
    }
    setParameters(parameters) {
        this.user = parameters["User"].value;
        this.updateInputSize();
    }
    /** Set size of input and output space based on selected user */
    updateInputSize() {
        this.inputWidth = this.movieLensRatings[this.user].completeTags.length;
        this.inputHeight = 1;
        console.log(`MovieLens. User: ${this.user}. Setting parameters. InputWidth: ${this.inputWidth}; InputHeight: ${this.inputHeight}; OutputWidth: ${this.outputWidth}; OutputHeight: ${this.outputHeight}`);
    }
    /** Override */
    setInput(input) {
        super.setInput(input);
        //Reset tag map
        this.tagMap = {};
        //Generate mapping between tags and nodes in input grid
        let tagCtr = 0;
        const completeTags = this.movieLensRatings[this.user].completeTags; //Local reference for convenience
        for (let row = 0; row < input.width; ++row) {
            for (let col = 0; col < input.height; ++col) {
                //Map tag to node
                this.tagMap[completeTags[tagCtr]] = input.get(row, col);
                //Set label in node
                input.get(row, col).label = completeTags[tagCtr];
                ++tagCtr;
            }
        }
        console.log(this.tagMap);
    }
}
