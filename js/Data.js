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
}
