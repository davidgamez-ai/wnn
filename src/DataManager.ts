import { Grid } from './Grid.js';
import { Data } from './Data.js';
import { RandomData } from './RandomData.js';
import { LetterData } from './LetterData.js';
import { MovieLensData } from './MovieLensData.js';

export class DataManager {
    //Array of compatible data sources
    data:Data[] = [];

    //Index of the current data source
    dataIndex:number;


    constructor(input:Grid, output:Grid){
        //Populate the data array with all available data sources

        //MovieLens data
        const movieLensData = new MovieLensData(input, output);

        //Letter data
        const letterData = new LetterData(input, output);
        if(letterData.test())
            this.data.push(letterData);
                
        //Random data - no need to test this
        this.data.push(new RandomData(input, output));

        //Default 
        this.dataIndex = 0;
    }

    /** Returns the current data index */
    getDataIndex():number{
        return this.dataIndex;
    }

    /** Returns the current data */
    getData():Data{
        if(this.data[this.dataIndex])
            throw "Error getting data. Index out of range";

        return this.data[this.dataIndex];
    }

    //Sets the data index to change data source
    setDataIndex(newIndex:number){
        this.dataIndex = newIndex;
    }

    update(){
        this.data[this.dataIndex].update();
    }

}