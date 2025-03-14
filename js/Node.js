/** Models a point in a grid */
export class Node {
    //Value of the node
    value;
    //Label of the node
    label;
    constructor(value, label) {
        if (value)
            this.value = value;
        else
            this.value = 0;
        if (label)
            this.label = label;
        else
            this.label = "";
    }
}
