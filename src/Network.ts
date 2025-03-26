import { Grid } from "./Grid.js";
import { Neuron } from "./Neuron.js";
import { HammingNeuron } from "./HammingNeuron.js";
import { NetworkSpecification } from "./Types.js";
import { Util } from "./Util.js";
import { NodeObject } from "./Types.js";
import { HAMMING_NEURON, RANDOM_CONNECTIONS } from "./Constants.js";

export class Network {
    /* Grids of the network
        The first layer in the array is the input.
        The last layer in the array is the output. 
        There can also be grids in the hidden layers.
        Neurons have grids as inputs and outputs. */
    grids:Grid[];

    /** Neuron layers.
     *  These are the connections between grids.
     *  First array is the layer.
     *  Next two arrays are the two dimensional neurons.
     */
    neuronLayers:Neuron[][][];

    constructor(networkSpecification:NetworkSpecification){
        this.grids = [];
        this.neuronLayers = [];

        this.checkNetworkSpecification(networkSpecification);

        this.buildNetwork(networkSpecification);
    }

    /** Checks network specification for inconsistencies */
    checkNetworkSpecification(netSpec:NetworkSpecification){
        for(let layer of netSpec.layers){
            //Check the layers.
        }
    }

    /** Builds the neural network */
    buildNetwork(netSpec:NetworkSpecification):void{
        //Create input layer
        let inputGrid:Grid = new Grid(netSpec.inputWidth, netSpec.inputHeight, "Input");
        this.grids.push(inputGrid);

        //Add layers of neurons 
        let previousGrid = inputGrid;
        for(let layer of netSpec.layers){//Work through the layers
            //Create output grid for this layer
            const outputGrid:Grid = new Grid(layer.width, layer.height, "Layer 1 Output");

            //Holds neurons for the layer.
            const neuronArray:Neuron[][] = [];
            for(let x:number = 0; x<layer.width; ++x){
                //Add array to hold x values
                neuronArray[x] = [];

                for(let y:number = 0; y<layer.height; ++y){
                    //Adjust behaviour depending on connection pattern.

                    //Random connections to any node in previous layer.
                    if(layer.connectionPattern === RANDOM_CONNECTIONS){
                        const nodes:NodeObject = {};

                        while(Object.keys(nodes).length < layer.connectionsPerNeuron){
                            //Select random node
                            const randomIndex = Math.round(Util.getRandom(0, previousGrid.size));
                            
                            //Convert to x and y coordinats and add to nodes object
                            const tmpX:number = randomIndex % netSpec.inputWidth;
                            const tmpY:number = Math.floor(randomIndex / netSpec.inputWidth);
                            nodes[randomIndex.toString()] = inputGrid.get(tmpX,tmpY);
                        }

                        //Create the specified type of neuron and add to neuron array.
                        let neuron:Neuron;
                        switch(layer.neuronType){
                            case(HAMMING_NEURON): 
                                neuron = new HammingNeuron(Object.values(nodes), outputGrid.get(x, y));
                            break;
                            default: throw "Neuron type not recognized: " + layer.neuronType;
                        }
                        neuronArray[x].push(neuron);
                    }
                }
            }
            //Add neurons to array
            this.neuronLayers.push(neuronArray);

            //Add grid
            this.grids.push(outputGrid);

            //Previous grid now becomes output grid
            previousGrid = outputGrid;
        }
    }

    /** Updates the neurons */
    update():void {
        for(let layer of this.neuronLayers){//Work through layers
            for(let x:number=0; x<layer.length; ++x){
                for(let y:number=0; y<layer[x].length; ++y){
                    layer[x][y].update();
                }
            }
        }
    }

}