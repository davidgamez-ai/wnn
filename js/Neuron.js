export class Neuron {
    //Indexes of the nodes in the grid that neuron has connections to
    inputNodes;
    //Node where output of neuron is passed to.
    outputNode;
    //Table storing states
    table = {};
    //Training on
    static training;
    constructor(inputNodes, outputNode) {
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
}
