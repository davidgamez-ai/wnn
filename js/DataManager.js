import { RandomData } from './RandomData.js';
import { LetterData } from './LetterData.js';
import { MovieLensData } from './MovieLensData.js';
export class DataManager {
    //Array of compatible data sources
    data = [];
    //Index of the current data source
    dataIndex;
    constructor(input, output) {
        //Populate the data array with all available data sources
        //MovieLens data
        const movieLensData = new MovieLensData(input, output);
        //Letter data
        const letterData = new LetterData(input, output);
        if (letterData.test())
            this.data.push(letterData);
        //Random data - no need to test this
        this.data.push(new RandomData(input, output));
        //Default 
        this.dataIndex = 0;
    }
    //Sets the data index to change data source
    setDataIndex(newIndex) {
        this.dataIndex = newIndex;
    }
    update() {
        this.data[this.dataIndex].update();
    }
}
