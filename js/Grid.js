import { Node } from './Node.js';
export class Grid {
    constructor(width, height, name) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.size = width * height;
        //Create array for rows
        this.nodes = new Array();
        for (let w = 0; w < width; ++w) {
            this.nodes[w] = new Array(); //Create array for columns
            for (let h = 0; h < height; ++h) {
                this.nodes[w][h] = new Node(0); //Add a node at each point in the grid
            }
        }
    }
    /** Returns node at this point in grid */
    get(x, y) {
        //Check that index is in range
        if (x >= this.width)
            throw `Grid:get(...) x is out of range: ${x}`;
        if (y >= this.height)
            throw `Grid:get(...) y is out of range: ${y}`;
        if (!this.nodes[x][y])
            throw `Invalid coordinates. x: ${x}, y: ${y}`;
        return this.nodes[x][y];
    }
}
