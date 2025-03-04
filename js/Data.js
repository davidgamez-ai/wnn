import { UNRESTRICTED } from './Constants.js';
export class Data {
    constructor(input, output) {
        //Input and output dimensions of the data
        this.inputWidth = UNRESTRICTED;
        this.inputHeight = UNRESTRICTED;
        this.outputWidth = UNRESTRICTED;
        this.outputHeight = UNRESTRICTED;
        //Name of data
        this.name = "unnamed";
        this.input = input;
        this.output = output;
    }
}
