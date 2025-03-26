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
    constructor(input, output) {
        this.input = input;
        this.output = output;
    }
    /** Checks whether the input and output grids are compatible with the data source.
    */
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
}
