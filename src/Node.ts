/** Models a point in a grid */
export class Node {
    //Value of the node
    value:number;

    constructor(value?:number){
        if(value)
            this.value = value;
        else
            this.value = 0;
    }

}

