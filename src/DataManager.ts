import { Grid } from './Grid.js';
import { Data } from './Data.js';
import { RandomData } from './RandomData.js';
import { LetterData } from './LetterData.js';

export class DataManager {
    //Array of compatible data sources
    data:Data[] = [];

    //Index of the current data source
    dataIndex:number;


    constructor(input:Grid, output:Grid){
        //Populate the data array with all available data sources

        //Letter data
        const letterData = new LetterData(input, output);
        if(letterData.test())
            this.data.push(letterData);
                
        //Random data - no need to test this
        this.data.push(new RandomData(input, output));

        //Default is the random data
        this.dataIndex = 0;
    }

    //Sets the data index to change data source
    setDataIndex(newIndex:number){
        this.dataIndex = newIndex;
    }

    update(){
        this.data[this.dataIndex].update();
    }

}