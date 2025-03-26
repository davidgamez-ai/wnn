import { Node } from './Node.js';
import { LookupTable } from './Types.js';
import { DEBUG_NEURON, DEBUG_TRAINING } from './Debug.js';

export abstract class Neuron {
    //Indexes of the nodes in the grid that neuron has connections to
    inputNodes:Node[];

    //Node where output of neuron is passed to.
    outputNode:Node;

    //Table storing states
    table:LookupTable = {};

    //Training on
    public static training:boolean;
    
    constructor(inputNodes:Node[], outputNode:Node){
        //Run some checks on input and output nodes.
        if(!inputNodes)
            throw "Input nodes must be defined for neuron";
        for(let node of inputNodes){
            if(!node)
                throw "One of the input nodes is undefined.";
        }
        if(!outputNode)
            throw "Output node must be defined for neuron";

        this.inputNodes = inputNodes;
        this.outputNode = outputNode;
    }

    /** Reads input and sets state of output */
    abstract update():void;
    
}