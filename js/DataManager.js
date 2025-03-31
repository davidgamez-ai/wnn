import { RandomData } from './RandomData.js';
import { LetterData } from './LetterData.js';
import { MovieLensData } from './MovieLensData.js';
export class DataManager {
    //Array of data sources
    data = [];
    //Index of the current data source
    dataIndex;
    constructor() {
        //Populate the data array with all available data sources
        //Random data
        this.data.push(new RandomData());
        //MovieLens data
        this.data.push(new MovieLensData());
        //Letter data
        this.data.push(new LetterData());
        //Default 
        this.dataIndex = 0;
    }
    /** Returns the current data index */
    getDataIndex() {
        return this.dataIndex;
    }
    /** Returns the current data */
    getCurrentData() {
        if (!this.data[this.dataIndex])
            throw "Error getting data. Index out of range";
        return this.data[this.dataIndex];
    }
    /** Returns the current data */
    getData(index) {
        if (!this.data[index])
            throw "Error getting data. Index out of range: " + index;
        return this.data[index];
    }
    //Sets the data index to change data source
    setDataIndex(newIndex) {
        this.dataIndex = newIndex;
    }
    update() {
        this.data[this.dataIndex].update();
    }
}
