import { Data } from "./Data.js";
import { Grid } from "./Grid.js";
import { Neuron } from "./Neuron.js";

export class RandomData extends Data {
    percent:number = 0.25;

    constructor(input:Grid, output:Grid){
        super(input, output); 
        this.name = "Random Data";
    }

    /** Random data is compatible with all inputs and outputs. */
    test():boolean {
        return true;
    }

    update():void {
        //Update input
        for(let x:number=0; x<this.input.width; ++x){
            for(let y:number=0; y<this.input.height; ++y){
                if(Math.random() < this.percent){
                    this.input.nodes[x][y].value = 1;
                }
                else{
                    this.input.nodes[x][y].value = 0;
                }
            }
        }

        //Update output if we are in training mode
        if(Neuron.training){
            for(let x:number=0; x<this.output.width; ++x){
                for(let y:number=0; y<this.output.height; ++y){
                    if(Math.random() < this.percent){
                        this.output.nodes[x][y].value = 1;
                    }
                    else{
                        this.output.nodes[x][y].value = 0;
                    }
                }
            }
        }
    }
    
}