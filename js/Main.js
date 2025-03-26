import * as Const from './Constants.js';
import * as DOMUtil from './DOMUtil.js';
import { Network } from './Network.js';
import { DEBUG_NETWORK, DEBUG_TRAINING } from './Debug.js';
import { DataManager } from './DataManager.js';
import { Neuron } from './Neuron.js';
import * as Util from './Util.js';
// JS Panel import (See: https://jspanel.de/)
// declare let jsPanel:any; //Possible fix to import issue in TypeScript.
import { jsPanel } from '../third-party/jspanel/jspanel.js';
export class Main {
    //Network that is being controlled
    network;
    //Manages the data sources for the network
    dataManager;
    //Canvases in panels display the neuron activity.
    //There is a one-to-one mapping between canvases and grids.
    canvasArray;
    //Display size of neurons
    neuronDisplaySize = 10;
    constructor() {
        this.buildNetworkSpecificationModal();
        this.buildDataParametersModal();
    }
    addEventListeners() {
        //Next button for simulation
        DOMUtil.getButton(Const.NEXT_BUTTON).onclick = () => {
            this.update();
        };
        //Selection of data source
        DOMUtil.getSelect(Const.DATA_SOURCE_SELECT).onchange = (event) => {
            if (event && event.target) {
                //Update the data manager to use the selected data source
                this.dataManager.setDataIndex(event.target.value);
                //Build an appropriate modal to show parameters for this data source
                this.buildDataParametersModal();
            }
        };
        //Training on/off
        DOMUtil.getInput(Const.TRAINING_CHECKBOX).onclick = (event) => {
            if (event && event.target) {
                if (event.target.checked) {
                    Neuron.training = true;
                    if (DEBUG_TRAINING)
                        console.log("Training on");
                }
                else {
                    Neuron.training = false;
                    if (DEBUG_TRAINING)
                        console.log("Training off");
                }
            }
        };
    }
    update() {
        //Load data into input and output (if training)
        this.dataManager.update();
        //Update neurons
        this.network.update();
        //Draw network grids
        this.draw();
    }
    draw() {
        for (let g = 0; g < this.network.grids.length; ++g) {
            const canvas = this.canvasArray[g];
            //Get context for panel
            const context = canvas.getContext("2d");
            if (!context)
                throw "Panel context error";
            //Clear panel
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height);
            //Draw neuron activity
            const grid = this.network.grids[g];
            for (let x = 0; x < grid.width; ++x) {
                for (let y = 0; y < grid.height; ++y) {
                    //Convert value to heat map color
                    context.fillStyle = Util.hslHeatMapColor(grid.nodes[x][y].value);
                    //Draw activity of the neuron
                    context.fillRect(x * this.neuronDisplaySize, y * this.neuronDisplaySize, this.neuronDisplaySize, this.neuronDisplaySize);
                }
            }
        }
    }
    /** Adds data sources */
    loadDataSources() {
        if (!this.network)
            throw "Network should have been created prior to loading data sources.";
        if (!this.dataManager)
            throw "Data Manager should have been created prior to loading data sources.";
        const dataSourceSelect = DOMUtil.getSelect(Const.DATA_SOURCE_SELECT);
        //Remove any previous data sources.
        dataSourceSelect.length = 0;
        for (let i = 0; i < this.dataManager.data.length; ++i) {
            const newOption = document.createElement("option");
            newOption.value = i.toString();
            newOption.text = this.dataManager.data[i].name;
            dataSourceSelect.add(newOption);
        }
    }
    buildDataParametersModal() {
        // Get the modal
        const dataParametersModal = DOMUtil.getDiv(Const.DATA_PARAMETERS_MODAL);
        // Get the button that opens the modal
        DOMUtil.getButton(Const.DATA_PARAMETERS_BUTTON).onclick = () => {
            //Get contents div
            const contentsDiv = DOMUtil.getDiv(Const.DATA_PARAMETERS_MODAL_CONTENTS);
            //Get current data manager
            const data = this.dataManager.getData();
            //Add contents
            let contentsStr = `<h2>${data.name} Parameters`;
            const params = data.getParameters();
            for (let param in params) {
                contentsStr += `<p>${param} <input `;
            }
            contentsDiv.innerHTML = contentsStr;
            //Show modal
            dataParametersModal.style.display = "block";
        };
        // Get the <span> element that closes the modal
        DOMUtil.getSpan(Const.DATA_PARAMETERS_MODAL_CLOSE).onclick = () => {
            dataParametersModal.style.display = "none";
        };
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = (event) => {
            if (event.target == dataParametersModal) {
                dataParametersModal.style.display = "none";
            }
        };
    }
    buildNetworkSpecificationModal() {
        // Get the modal
        const configureModal = DOMUtil.getDiv(Const.NETWORK_SPECIFICATION_MODAL);
        // Get the button that opens the modal
        DOMUtil.getButton(Const.START_BUTTON_ID).onclick = () => {
            configureModal.style.display = "block";
        };
        // Get the <span> element that closes the modal
        DOMUtil.getSpan(Const.NETWORK_SPECIFICATION_MODAL_CLOSE).onclick = () => {
            configureModal.style.display = "none";
        };
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = (event) => {
            if (event.target == configureModal) {
                configureModal.style.display = "none";
            }
        };
        // Get the button that adds a layer
        DOMUtil.getButton(Const.ADD_LAYER_BUTTON).onclick = () => {
            //Get the layer data
            const layer = {
                name: DOMUtil.getInput(Const.LAYER_NAME_INPUT).value,
                width: parseInt(DOMUtil.getInput(Const.LAYER_WIDTH_INPUT).value),
                height: parseInt(DOMUtil.getInput(Const.LAYER_HEIGHT_INPUT).value),
                connectionsPerNeuron: parseInt(DOMUtil.getInput(Const.CONNECTIONS_PER_NEURON_INPUT).value),
                neuronType: parseInt(DOMUtil.getInput(Const.NEURON_TYPE_INPUT).value),
                connectionPattern: parseInt(DOMUtil.getInput(Const.CONNECTION_PATTERN_INPUT).value),
            };
            //Add to layer combo
            const layerCombo = DOMUtil.getSelect(Const.LAYERS_SELECT);
            const newOption = document.createElement("option");
            newOption.value = JSON.stringify(layer);
            newOption.text = layer.name;
            layerCombo.add(newOption);
        };
        //Start build
        DOMUtil.getButton(Const.BUILD_BUTTON_ID).onclick = () => {
            //Reset errors
            const modalError = DOMUtil.getParagraph(Const.MODAL_ERROR);
            modalError.innerHTML = "";
            //Get network configuration
            const inputWidth = parseInt(DOMUtil.getInput(Const.INPUT_WIDTH_INPUT).value);
            const inputHeight = parseInt(DOMUtil.getInput(Const.INPUT_HEIGHT_INPUT).value);
            //Get the layers
            const layersSelect = DOMUtil.getSelect(Const.LAYERS_SELECT);
            //Check that there is at least one layer and display error message if not.
            if (layersSelect.length === 0) {
                modalError.innerHTML = "You must add at least one layer";
                return;
            }
            //Extract data about layers
            const layersArray = [];
            for (let i = 0; i < layersSelect.length; ++i) {
                const layer = JSON.parse(layersSelect.options[i].value);
                layersArray.push(layer);
            }
            //Create network specification
            const networkSpecification = {
                inputWidth: inputWidth,
                inputHeight: inputHeight,
                layers: layersArray
            };
            if (DEBUG_NETWORK)
                console.log(networkSpecification);
            //Create network
            this.network = new Network(networkSpecification);
            //Create panels to display neuron activity.
            this.addPanels();
            //Create data manager
            const grids = this.network.grids;
            this.dataManager = new DataManager(grids[0], grids[grids.length - 1]);
            //Load compatible data sources into the data select
            this.loadDataSources();
            //Add event listeners
            this.addEventListeners();
            //Hide modal
            configureModal.style.display = "none";
            //Reset panel for next time
            layersSelect.length = 0;
        };
    }
    addPanels() {
        this.canvasArray = [];
        let idCtr = 0;
        for (let grid of this.network.grids) {
            //Build the panel
            const canvasId = "Canvas" + idCtr;
            const newPanel = this.buildPanel(grid.width * this.neuronDisplaySize, grid.height * this.neuronDisplaySize, grid.name, canvasId);
            //Get canvas from panel
            const canvas = document.querySelector("#" + canvasId);
            if (!canvas)
                throw "Canvas not found when adding panels";
            //Set canvas to size of panel
            canvas.style.width = newPanel.style.width;
            canvas.style.height = newPanel.style.height;
            //Add to canvas array
            this.canvasArray.push(canvas);
            ++idCtr;
        }
    }
    buildPanel(width, height, name, canvasId) {
        const panel = jsPanel.create({
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
