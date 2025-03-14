/** Models a point in a grid */
export class Node {
    //Value of the node
    value:number;

    //Label of the node
    label:string;

    constructor(value?:number, label?:string){
        if(value)
            this.value = value;
        else
            this.value = 0;

        if(label)
            this.label = label;
        else
            this.label = "";
    }

}

