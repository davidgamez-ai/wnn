import * as Const from './Constants.js';
import * as DOMUtil from './DOMUtil.js';
import { Network } from './Network.js';
import { Layer, NetworkSpecification, DataParameters } from './Types.js';
import { DEBUG, DEBUG_NETWORK, DEBUG_TRAINING } from './Debug.js';
import { Grid } from './Grid.js';
import { DataManager } from './DataManager.js';
import { Data } from './Data.js';
import { Neuron } from './Neuron.js';
import * as Util from './Util.js';

// JS Panel import (See: https://jspanel.de/)
// declare let jsPanel:any; //Possible fix to import issue in TypeScript.
import { jsPanel } from '../third-party/jspanel/jspanel.js';

export class Main {
    //Network that is being controlled
    network:Network;

    //Manages the data sources for the network
    dataManager:DataManager;

    //Canvases in panels display the neuron activity.
    //There is a one-to-one mapping between canvases and grids.
    canvasArray:HTMLCanvasElement[];

    //Display size of neurons
    neuronDisplaySize:number = 10;

    constructor(){
        //Create a data manager
        this.dataManager = new DataManager();

        //Build the modals
        this.buildDataModal();
        this.buildNetworkModal();
    }


    addEventListeners(){
        //Next button for simulation
        DOMUtil.getButton(Const.NEXT_BUTTON).onclick = ()=>{
            this.update();
        }

        //Training on/off
        DOMUtil.getInput(Const.TRAINING_CHECKBOX).onclick = (event:any)=>{
            if(event && event.target){
                if(event.target.checked){
                    Neuron.training = true;
                    if(DEBUG_TRAINING) console.log("Training on");
                }
                else{
                    Neuron.training = false;
                    if(DEBUG_TRAINING) console.log("Training off");
                }
            }
           
        }
    }

    update():void {
        //Load data into input and output (if training)
        this.dataManager.update();

        //Update neurons
        this.network.update();

        //Draw network grids
        this.draw();
    }


    draw():void{
        for(let g:number = 0; g<this.network.grids.length; ++g){
            const canvas:HTMLCanvasElement = this.canvasArray[g];

            //Get context for panel
            const context:CanvasRenderingContext2D|null = canvas.getContext("2d");
            if(!context)
                throw "Panel context error";

            //Clear panel
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            //Draw neuron activity
            const grid:Grid = this.network.grids[g];
            for(let x:number=0; x<grid.width; ++x){
                for(let y:number=0; y<grid.height; ++y){
                    //Convert value to heat map color
                    context.fillStyle = Util.hslHeatMapColor(grid.nodes[x][y].value);
                    
                    //Draw activity of the neuron
                    context.fillRect(x * this.neuronDisplaySize, y * this.neuronDisplaySize, this.neuronDisplaySize, this.neuronDisplaySize);
                }
            }
        }
    }

    /** Builds the modal that enables the user to select a data source and configure its parameters. */
    buildDataModal(){
       // Get the modal
       const dataParametersModal:HTMLDivElement = DOMUtil.getDiv(Const.DATA_MODAL);

       // Get the button that opens the modal
       DOMUtil.getButton(Const.DATA_BUTTON).onclick = ()=> {
            //Get contents div
            const contentsDiv:HTMLDivElement = DOMUtil.getDiv(Const.DATA_MODAL_CONTENTS);

            //Load up data sources
            const dataSourceSelect:HTMLSelectElement = DOMUtil.getSelect(Const.DATA_SOURCE_SELECT);

            //Remove any previous data sources.
            dataSourceSelect.length = 0;

            //Add a list of possible data sources
            for(let i:number=0; i<this.dataManager.data.length; ++i){
                const newOption = document.createElement("option");
                newOption.value = i.toString();
                newOption.text = this.dataManager.data[i].name;
                dataSourceSelect.add(newOption);
            }

            //Listen for changes in the selected data source
            DOMUtil.getSelect(Const.DATA_SOURCE_SELECT).onchange = (event:any)=> {
                if(event && event.target){
                    //Selected index
                    const dataIndex:number = event.target.value;

                    //Tell data manager to use this data source
                    this.dataManager.setDataIndex(dataIndex);

                    //Get selected data source
                    const data:Data = this.dataManager.getCurrentData();

                    //Display parameters for this data source
                    let contentsStr = `<h2>${data.name} Parameters</h2>`;
                    const params:DataParameters = data.getParameters(); 
                    for(let param in params){
                        if(params[param].options){//Drop down list of options
                            contentsStr += `<p><select id="DataParameter_${param}">`;
                            for(let option of params[param].options){
                                if(option === params[param].value)//Selected user
                                    contentsStr += `<option selected value="${option}">${option}</option>`;
                                else
                                    contentsStr += `<option value="${option}">${option}</option>`;
                            }
                            contentsStr += "</select></p>";
                        }
                        else if (params[param].min !== undefined && params[param].max !== undefined){//Single value with min and max
                            contentsStr += `<p>${param} <input id="DataParameter_${param}" type="number" min="${params[param].min}" max="${params[param].max}" value="${params[param].value}"></p>`
                        }
                        else{
                            console.log(params[param]);
                            throw "Parameter type not recognized";
                        }
                    }

                    //Add parameters to page
                    contentsDiv.innerHTML = contentsStr;

                    //Add button to save parameters
                    const saveParamButton = document.createElement("button");
                    saveParamButton.innerHTML = "Save";

                    //Add event handler to button
                    saveParamButton.onclick = ()=>{
                        //Extract parameters from input and update them
                        for(let param in params){
                            const newValue:number = parseInt(DOMUtil.getInput(`DataParameter_${param}`).value);
                            //console.log(`${param} new value: ${value}`);
                            params[param].value = newValue;
                        }

                        //Save parameters
                        this.dataManager.getCurrentData().setParameters(params);
                    }

                    //Add save button to page
                    contentsDiv.append(saveParamButton);
                }
            }

            //Show modal
            dataParametersModal.style.display = "block";
       }

       // Get the <span> element that closes the modal
       DOMUtil.getSpan(Const.DATA_MODAL_CLOSE).onclick = ()=> {
            dataParametersModal.style.display = "none";
       }

       // When the user clicks anywhere outside of the modal, close it
       window.onclick = (event:any) => {
           if (event.target == dataParametersModal) {
               dataParametersModal.style.display = "none";
           }
       }
    }

 
    /** Builds modal to configure network. */
    buildNetworkModal(){
        // Get the modal
        const configureModal:HTMLDivElement = DOMUtil.getDiv(Const.NETWORK_MODAL);

        // Get the button that opens the modal
        DOMUtil.getButton(Const.NETWORK_BUTTON_ID).onclick = ()=> {
            //Selected data source
            const data:Data = this.dataManager.getCurrentData();
            
            //Fix the input space if appropriate
            if(data.inputWidth !== Const.UNRESTRICTED){
                DOMUtil.getInput(Const.INPUT_WIDTH_INPUT).value = data.inputWidth.toString();
            }
            if(data.inputHeight !== Const.UNRESTRICTED){
                DOMUtil.getInput(Const.INPUT_HEIGHT_INPUT).value = data.inputHeight.toString();
            }

            //Set defaults for first layer to save time - these can be changed by user for multi layer architecture
            if(data.outputWidth !== Const.UNRESTRICTED){
                DOMUtil.getInput(Const.LAYER_WIDTH_INPUT).value = data.outputWidth.toString();
            }
            if(data.outputHeight !== Const.UNRESTRICTED){
                DOMUtil.getInput(Const.LAYER_HEIGHT_INPUT).value = data.outputHeight.toString();
            }

            //Show modal
            configureModal.style.display = "block";
        }

        // Get the <span> element that closes the modal
        DOMUtil.getSpan(Const.NETWORK_MODAL_CLOSE).onclick = ()=> {
            configureModal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = (event:any) => {
            if (event.target == configureModal) {
                configureModal.style.display = "none";
            }
        }

        // Get the button that adds a layer
        DOMUtil.getButton(Const.ADD_LAYER_BUTTON).onclick = ()=> {
            //Get the layer data
            const layer:Layer = {
                name: DOMUtil.getInput(Const.LAYER_NAME_INPUT).value,
                width: parseInt(DOMUtil.getInput(Const.LAYER_WIDTH_INPUT).value),
                height: parseInt(DOMUtil.getInput(Const.LAYER_HEIGHT_INPUT).value),
                connectionsPerNeuron: parseInt(DOMUtil.getInput(Const.CONNECTIONS_PER_NEURON_INPUT).value),
                neuronType: parseInt(DOMUtil.getInput(Const.NEURON_TYPE_INPUT).value),
                connectionPattern: parseInt(DOMUtil.getInput(Const.CONNECTION_PATTERN_INPUT).value),
            };

            //Add to layer combo
            const layerCombo:HTMLSelectElement = DOMUtil.getSelect(Const.LAYERS_SELECT);
            const newOption = document.createElement("option");
            newOption.value = JSON.stringify(layer);
            newOption.text = layer.name;
            layerCombo.add(newOption);
        }

       //Start build
       DOMUtil.getButton(Const.BUILD_BUTTON_ID).onclick = ()=> {
            //Errors
            let errorStr = "";

            //Get network configuration
            const inputWidth:number = parseInt(DOMUtil.getInput(Const.INPUT_WIDTH_INPUT).value);
            const inputHeight:number = parseInt(DOMUtil.getInput(Const.INPUT_HEIGHT_INPUT).value);

            //Get the layers
            const layersSelect = DOMUtil.getSelect(Const.LAYERS_SELECT);

            //Check that there is at least one layer and display error message if not.
            if(layersSelect.length === 0){
                errorStr += "You must add at least one layer\n";
                return;
            }

            //Extract data about layers
            const layersArray:Layer[] = [];
            for(let i=0; i<layersSelect.length; ++i){
                const layer:Layer = JSON.parse(layersSelect.options[i].value);
                layersArray.push(layer);
            }

            //Create network specification
            const netSpec:NetworkSpecification = {
                inputWidth: inputWidth,
                inputHeight:inputHeight,
                layers: layersArray
            }
            if(DEBUG_NETWORK) console.log(netSpec);

            //Check that input dimensions match data source and dimensions of top layer match data source
            const data:Data = this.dataManager.getCurrentData();//Selected data source
            if(data.inputWidth !== Const.UNRESTRICTED){
                //Check input width
                if(netSpec.inputWidth !== data.inputWidth)
                    errorStr += `Data input width (${data.inputWidth}) must match network input width (${netSpec.inputWidth}).\n`;
                if(netSpec.inputHeight !== data.inputHeight)
                    errorStr += `Data input width (${data.inputHeight}) must match network input width (${netSpec.inputHeight}).\n`;

                //Assume that top layer is training layer 
                //#FIXME# - ALLOW USER TO SET THIS LATER
                const topLayer:Layer = netSpec.layers[netSpec.layers.length-1];
                if(topLayer.width !== data.outputWidth)
                    errorStr += `Data output width (${data.outputWidth}) must match top layer width (${topLayer.width}).\n`;
                if(topLayer.height !== data.outputHeight)
                    errorStr += `Data output height (${data.outputWidth}) must match top layer height (${topLayer.height}).\n`;
            }

            //Handle errors and quit if necessary
            DOMUtil.getParagraph(Const.MODAL_ERROR).innerHTML = errorStr;
            if(errorStr.length > 0){
                return;
            }
     
            //Create network
            this.network = new Network(netSpec);

            //Link network to data source
            data.setInput(this.network.getInputGrid());
            data.setInput(this.network.getOutputGrid());

            //Create panels to display neuron activity.
            this.addPanels();

            //Add event listeners
            this.addEventListeners();
           
           //Hide modal
           configureModal.style.display = "none";

           //Reset panel for next time
           layersSelect.length = 0;
       }
    }

    addPanels(){
        this.canvasArray = [];
        let idCtr:number = 0;
        for(let grid of this.network.grids){
            //Build the panel
            const canvasId:string = "Canvas" + idCtr;
            const newPanel:HTMLDivElement = this.buildPanel(grid.width * this.neuronDisplaySize, grid.height*this.neuronDisplaySize, grid.name, canvasId);

            //Get canvas from panel
            const canvas:HTMLCanvasElement|null = document.querySelector("#" + canvasId);
            if(!canvas)
                throw "Canvas not found when adding panels";

            //Set canvas to size of panel
            canvas.style.width = newPanel.style.width;
            canvas.style.height = newPanel.style.height;

            //Add to canvas array
            this.canvasArray.push(canvas);

            ++idCtr;
        }
    }

    buildPanel(width:number, height:number, name:string, canvasId:string):HTMLDivElement{
        const panel:any = jsPanel.create({
            theme: 'dark',
            headerTitle: name,
            contentSize: {
                width: Math.max(200, width),
                height: Math.max(200, height)
            },
            animateIn: 'jsPanelFadeIn',
            onwindowresize: true,
            content: `<canvas width="${width}" height="${height}" id="${canvasId}">`,
        });
        return panel;
    } 
}