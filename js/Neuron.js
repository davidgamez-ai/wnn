import { DEBUG_NEURON } from './Debug.js';
export class Neuron {
    constructor(inputNodes, outputNode) {
        //Table storing states
        this.table = {};
        //Run some checks on input and output nodes.
        if (!inputNodes)
            throw "Input nodes must be defined for neuron";
        for (let node of inputNodes) {
            if (!node)
                throw "One of the input nodes is undefined.";
        }
        if (!outputNode)
            throw "Output node must be defined for neuron";
        this.inputNodes = inputNodes;
        this.outputNode = outputNode;
    }
    //Reads input and sets state of output
    update() {
        if (DEBUG_NEURON)
            console.log("Updating neuron");
        //Build string representing state of input nodes
        let activationPattern = "";
        for (let node of this.inputNodes) {
            activationPattern += node.value;
        }
        if (Neuron.training) {
            //Store association between key and output
            this.table[activationPattern] = this.outputNode.value;
            return;
        }
        //Not trainign mode. Look for string in table
        if (this.table[activationPattern] !== undefined) {
            //Found string, output should be true
            this.outputNode.value = this.table[activationPattern];
            return;
        }
        //Input pattern not found. Calculate minimum Hamming distance
        let minHD = 1; //Set to maximum possible distance initially
        for (let storedPattern in this.table) {
            //Hamming distance between current intput pattern and stored pattern
            let hd = this.hammingDistance(activationPattern, storedPattern);
            if (hd < minHD)
                minHD = hd;
        }
        //Check that minHD is between 0 and 1
        if (minHD < 0 || minHD > 1)
            throw "Hamming distance out of range: " + minHD;
        //Set HD as output state
        this.outputNode.value = minHD;
    }
    /** Returns Hamming distance normalized to between 0 and 1 */
    hammingDistance(str1, str2) {
        if (str1.length !== str2.length) {
            throw new Error('Strings must be of the same length');
        }
        let distance = 0;
        for (let i = 0; i < str1.length; ++i) {
            if (str1[i] !== str2[i])
                distance += 1;
        }
        return distance / str1.length;
    }
}
