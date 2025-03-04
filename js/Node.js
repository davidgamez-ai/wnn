/** Models a point in a grid */
export class Node {
    constructor(value) {
        if (value)
            this.value = value;
        else
            this.value = 0;
    }
}
