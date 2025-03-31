import { UNRESTRICTED } from './Constants.js';
export class Data {
    //Input and output dimensions of the data
    inputWidth = UNRESTRICTED;
    inputHeight = UNRESTRICTED;
    outputWidth = UNRESTRICTED;
    outputHeight = UNRESTRICTED;
    //Name of data
    name = "unnamed";
    //The input that is being modified by the data
    input;
    //The output that is being modified by the data (for training)
    output;
    constructor(name) {
        this.name = name;
    }
    setInput(input) {
        if (input.width !== this.inputWidth || input.height !== this.inputHeight)
            throw "Input not compatible with this data source.";
        this.input = input;
    }
    setOutput(output) {
        if (output.width !== this.outputWidth || output.height !== this.outputHeight)
            throw "Output not compatible with this data source.";
        this.output = output;
    }
}
