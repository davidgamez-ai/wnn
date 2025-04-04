import { Data } from "./Data.js";
import { Neuron } from "./Neuron.js";
import { movieLens } from "./data/MovieLens.js";
import { DEBUG_DATA } from "./Debug.js";
export class MovieLensData extends Data {
    //Object containing MovieLens ratings
    movieLensRatings;
    //Current user
    user;
    //List of user IDs
    users = [];
    //Maps between tags and nodes in the input grid
    tagMap;
    //Keeps track of which rating we are loading
    ratingCtr;
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
    /** Updates inputs using tags.
     *  #FIXME# This would be more efficient if ratings stored tags in an object.
     */
    update() {
        //Reset input
        for (let w = 0; w < this.input.width; ++w) {
            for (let h = 0; h < this.input.height; ++h) {
                this.input.nodes[w][h].value = 0; //Reset input
            }
        }
        //Get current rating
        const ratingData = this.movieLensRatings[this.user].rating[this.ratingCtr];
        //Selectively set input nodes to 1 if tags are present.
        for (let tag of ratingData.tags) {
            //Double check tag is in map
            if (!this.tagMap[tag])
                throw "Tag missing from tag map: " + tag;
            this.tagMap[tag].value = 1;
        }
        //Calculate index of output neuron that should be active
        if (Neuron.training) {
            //Calculate output index
            const outputIndex = Math.round(2 * ratingData.rating) + 1;
            if (outputIndex < 0 || outputIndex > 11)
                throw "Output index out of range: " + outputIndex;
            if (DEBUG_DATA)
                console.log(`Output index: ${outputIndex}`);
            for (let w = 0; w < this.output.width; ++w) {
                if (w === outputIndex)
                    this.output.get(w, 1).value = 1;
                else
                    this.output.get(w, 1).value = 0;
            }
        }
        //Increase rating counter and reset if necessary
        ++this.ratingCtr;
        if (DEBUG_DATA)
            console.log(`Rating counter: ${this.ratingCtr}`);
        if (this.ratingCtr === this.movieLensRatings[this.user].rating.length) {
            this.ratingCtr = 0;
        }
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
        //Reset rating counter
        this.ratingCtr = 0;
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
