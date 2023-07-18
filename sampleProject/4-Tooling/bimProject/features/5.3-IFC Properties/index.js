import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

// Create grid and axes
viewer.grid.setGrid();
viewer.axes.setAxes();

//5.1 Base IFC Viewer
const url="./samples/01.ifc"
viewer.IFC.loadIfcUrl(url)

//5.2 Selection and Pre-Selection feature
window.ondblclick = async () => await viewer.IFC.selector.pickIfcItem();
window.onmousemove = async () => await viewer.IFC.selector.prePickIfcItem();

//5.3 IFC Properties
window.onkeydown = async (event) => {
    if (event.key === 'z' || event.key === 'Z') {
        const result = await viewer.IFC.selector.highlightIfcItem();
        if (!result){
            viewer.IFC.selector.unHighlightIfcItems();
            removeAllChildren(propsGUI)
        }
        const { modelID, id } = result;
        const props = await viewer.IFC.getProperties(modelID, id, true, false);
        createPropertiesMenu(props); //instead of console.log we create a new function that creates menu
    };
}

// Properties menu creation

const propsGUI = document.getElementById("ifc-property-menu-root");
function createPropertiesMenu(properties) {
    console.log(properties);
    removeAllChildren(propsGUI);
    delete properties.psets;
    delete properties.mats;
    delete properties.type;
    for (let key in properties) {
        createPropertyEntry(key, properties[key]);
    }

}

function createPropertyEntry(key, value) {
    const propContainer = document.createElement("div");
    propContainer.classList.add("ifc-property-item");
    if(value === null || value === undefined) value = "undefined";
    else if(value.value) value = value.value;
    const keyElement = document.createElement("div");
    keyElement.textContent = key;
    propContainer.appendChild(keyElement);
    const valueElement = document.createElement("div");
    valueElement.classList.add("ifc-property-value");
    valueElement.textContent = value;
    propContainer.appendChild(valueElement);
    propsGUI.appendChild(propContainer);
}

function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}