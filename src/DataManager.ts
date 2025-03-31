import { Grid } from './Grid.js';
import { Data } from './Data.js';
import { RandomData } from './RandomData.js';
import { LetterData } from './LetterData.js';
import { MovieLensData } from './MovieLensData.js';

export class DataManager {
    //Array of data sources
    data:Data[] = [];

    //Index of the current data source
    dataIndex:number;

    constructor(){
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
    getDataIndex():number{
        return this.dataIndex;
    }

    /** Returns the current data */
    getCurrentData():Data{
        if(!this.data[this.dataIndex])
            throw "Error getting data. Index out of range";

        return this.data[this.dataIndex];
    }

    /** Returns the current data */
    getData(index:number):Data{
        if(!this.data[index])
            throw "Error getting data. Index out of range: " + index;

        return this.data[index];
    }

    //Sets the data index to change data source
    setDataIndex(newIndex:number){
        this.dataIndex = newIndex;
    }

    update(){
        this.data[this.dataIndex].update();
    }

}