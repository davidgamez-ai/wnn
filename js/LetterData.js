import { Data } from "./Data.js";
import { Neuron } from "./Neuron.js";
export class LetterData extends Data {
    constructor(input, output) {
        super(input, output);
        this.letters = [
            {
                "i": [
                    [1, 1, 1],
                    [0, 1, 0],
                    [0, 1, 0]
                ],
                "o": [
                    [1, 0, 0]
                ]
            },
            {
                "i": [
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 1, 1]
                ],
                "o": [
                    [0, 1, 0]
                ]
            },
            {
                "i": [
                    [1, 0, 1],
                    [1, 1, 1],
                    [1, 0, 1]
                ],
                "o": [
                    [0, 0, 1]
                ]
            }
        ];
        this.letterIndex = 0;
        // 3x3 letters as input
        this.inputWidth = 3;
        this.inputHeight = 3;
        // Training to recognize three letters
        this.outputWidth = 3;
        this.outputHeight = 1;
        this.name = "Letter Data";
    }
    /** Random data is compatible with all inputs and outputs. */
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
        //Update input
        const inputPattern = this.letters[this.letterIndex].i;
        for (let x = 0; x < this.inputWidth; ++x) {
            for (let y = 0; y < this.inputHeight; ++y) {
                this.input.nodes[x][y].value = inputPattern[y][x];
            }
        }
        //Update output
        if (Neuron.training) {
            const outputPattern = this.letters[this.letterIndex].o;
            for (let x = 0; x < this.outputWidth; ++x) {
                for (let y = 0; y < this.outputHeight; ++y) {
                    //Need to switch x and y around on output pattern to make it work
                    this.output.nodes[x][y].value = outputPattern[y][x];
                }
            }
        }
        //Increase letter index or loop round to zero
        this.letterIndex++;
        this.letterIndex %= this.letters.length;
    }
}
