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

    constructor(input:Grid, output:Grid){
        this.input = input;
        this.output = output;
    }

    abstract update():void;

    /** Checks whether the input and output grids are compatible with the data source.
     *  Can also run other tests, for example if connecting to a web service or file.
     */
    abstract test():boolean;

    /** Returns the parameters for this data type */
    abstract getParameters():DataParameters;

    /** Sets the parameteters for this data type */
    abstract setParameters(parameters:DataParameters):void;

}