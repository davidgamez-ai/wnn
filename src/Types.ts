import { Node } from "./Node.js";


export interface NetworkSpecification {
    inputWidth:number,
    inputHeight:number,
    layers: Layer[]
}

export interface Layer {
    name:string,
    width:number,
    height:number,
    connectionsPerNeuron:number,
    neuronType:number,
    connectionPattern:number
}

export interface NodeObject {
    [key: string]: Node
}

export interface LookupTable {
    [key: string]: number
}

/** Parameters for a data source */
export interface DataParameters {
    [key:string]: {
        value:number,
        min:number,
        max:number
    }
}

