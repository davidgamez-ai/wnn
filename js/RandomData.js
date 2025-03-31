import { Data } from "./Data.js";
import { Neuron } from "./Neuron.js";
export class RandomData extends Data {
    percent = 25;
    constructor() {
        super("Random Data");
    }
    update() {
        //Update input
        for (let x = 0; x < this.input.width; ++x) {
            for (let y = 0; y < this.input.height; ++y) {
                if (Math.random() * 100 < this.percent) {
                    this.input.nodes[x][y].value = 1;
                }
                else {
                    this.input.nodes[x][y].value = 0;
                }
            }
        }
        //Update output if we are in training mode
        if (Neuron.training) {
            for (let x = 0; x < this.output.width; ++x) {
                for (let y = 0; y < this.output.height; ++y) {
                    if (Math.random() * 100 < this.percent) {
                        this.output.nodes[x][y].value = 1;
                    }
                    else {
                        this.output.nodes[x][y].value = 0;
                    }
                }
            }
        }
    }
    /** Amount of randomness can vary between 0 and 100% */
    getParameters() {
        return {
            "Percent": {
                min: 0,
                max: 100,
                value: this.percent
            }
        };
    }
    /** Updates the percentage of randomness. */
    setParameters(parameters) {
        //Run some checks
        if (!parameters["Percent"])
            throw "RandomData: Percent parameter not found";
        const newPercent = parameters["Percent"].value;
        if (newPercent < 0 || newPercent > 100)
            throw "RandomData: New percent out of range: " + newPercent;
        //Store new percent
        this.percent = newPercent;
    }
}
