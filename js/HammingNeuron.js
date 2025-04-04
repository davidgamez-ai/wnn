import { DEBUG_NEURON } from './Debug.js';
import { Neuron } from './Neuron.js';
export class HammingNeuron extends Neuron {
    //Table storing states
    table = {};
    constructor(inputNodes, outputNode) {
        super(inputNodes, outputNode);
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
        //Not training mode. Table is empty, output is zero
        if (Object.keys(this.table).length === 0) {
            this.outputNode.value = 0;
            return;
        }
        //Not training mode. Look for exact match for pattern in table
        if (this.table[activationPattern] !== undefined) {
            //Found string, output should be true
            this.outputNode.value = this.table[activationPattern];
            return;
        }
        //Input pattern not an exact match. Calculate minimum Hamming distance
        let minHD = 1; //Set to maximum possible distance initially
        const minHDOutputs = []; //Stores the outputs at the minimum Hamming distance
        for (let storedPattern in this.table) {
            //Hamming distance between current intput pattern and stored pattern
            let hd = this.hammingDistance(activationPattern, storedPattern);
            if (hd < minHD) { //Min Hamming distance has changed
                minHD = hd;
                minHDOutputs.length = 0; //Reset array
                minHDOutputs.push(this.table[storedPattern]);
            }
            else if (hd === minHD) { //Another pattern with the same minimum
                minHDOutputs.push(this.table[storedPattern]);
            }
            //Nothing to do if HD is greater than current minimum
        }
        //Check that minHD is between 0 and 1
        if (minHD < 0 || minHD > 1)
            throw "Hamming distance out of range: " + minHD;
        //Average the outputs
        let averageOutput = 0;
        for (let output of minHDOutputs)
            averageOutput += output;
        averageOutput /= minHDOutputs.length;
        //Check that average output is between 0 and 1
        if (averageOutput < 0 || averageOutput > 1)
            throw "Averaged output out of range!";
        /*Weight average output by Hamming distance
            If there is a large distance, the final output will be low.
            If there is a small distance, the final output will be close to the average output */
        const finalOutput = (1 - minHD) * averageOutput;
        //Set average output as output state
        this.outputNode.value = finalOutput;
    }
    /** Returns Hamming distance normalized to between 0 (exact match) and 1 (maximum possible distance) */
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
