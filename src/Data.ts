import { Grid } from './Grid.js';
import { UNRESTRICTED } from './Constants.js';
import { DataParameters } from './Types.js';

export abstract class Data {
    //Input and output dimensions of the data
    inputWidth:number = UNRESTRICTED;
    inputHeight:number = UNRESTRICTED;
    outputWidth:number = UNRESTRICTED;
    outputHeight:number = UNRESTRICTED;

    //Name of data
    name:string = "unnamed";

    //The input that is being modified by the data
    input:Grid;

    //The output that is being modified by the data (for training)
    output:Grid; 

    constructor(name:string){
        this.name = name;
    }

    /** Updates the inputs and outputs with data */
    abstract update():void;

    setInput(input:Grid){
        if(input.width !== this.inputWidth || input.height !== this.inputHeight)
            throw "Input not compatible with this data source."
        this.input = input;
    }

    setOutput(output:Grid){
        if(output.width !== this.outputWidth || output.height !== this.outputHeight)
            throw "Output not compatible with this data source."
        this.output = output;
    }

    /** Returns the parameters for this data type */
    abstract getParameters():DataParameters;

    /** Sets the parameteters for this data type */
    abstract setParameters(parameters:DataParameters):void;

}