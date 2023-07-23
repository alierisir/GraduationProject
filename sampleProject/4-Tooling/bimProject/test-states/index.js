import { Color, LineBasicMaterial, MeshBasicMaterial} from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
import {
    IFCWALLSTANDARDCASE,
    IFCSLAB,
    IFCDOOR,
    IFCWINDOW,
    IFCFURNISHINGELEMENT,
    IFCMEMBER,
    IFCPLATE
} from 'web-ifc';


const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

// Create grid and axes
viewer.grid.setGrid();
viewer.axes.setAxes();

//5.1 Base IFC Viewer
const propsGUI = document.getElementById("ifc-property-menu-root");
let shadowActive=false
const url="./samples/01.ifc"
loadIfc(url)

async function loadIfc(url) {
    const model = await viewer.IFC.loadIfcUrl(url);
    const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID);
    createTreeMenu(ifcProject);
    await setupAllCategories()
    // Setup camera controls
	const controls = viewer.context.ifcCamera.cameraControls;
	controls.setPosition(7.6, 4.3, 24.8, false);
	controls.setTarget(-7.1, -0.3, 2.5, false);

	// Generate all plans
	await viewer.plans.computeAllPlanViews(model.modelID);

	const lineMaterial = new LineBasicMaterial({ color: 'black' });
	const baseMaterial = new MeshBasicMaterial({
		polygonOffset: true,
		polygonOffsetFactor: 1, // positive value pushes polygon further away
		polygonOffsetUnits: 1,
	});
	await viewer.edges.create('example', model.modelID, lineMaterial, baseMaterial);
    // Floor plan viewing

	const allPlans = viewer.plans.getAll(model.modelID);

	const container = document.getElementById('button-container');

	for (const plan of allPlans) {
		const currentPlan = viewer.plans.planLists[model.modelID][plan];
		console.log(currentPlan);

		const button = document.createElement('button');
		container.appendChild(button);
		button.textContent = currentPlan.name;
		button.onclick = () => {
			viewer.plans.goTo(model.modelID, plan);
			viewer.edges.toggle('example', true);
		};
	}

	const button = document.createElement('button');
	container.appendChild(button);
	button.textContent = 'Exit';
	button.onclick = () => {
		viewer.plans.exitPlanView();
		viewer.edges.toggle('example', false);
	};
    model.removeFromParent()
}

//5.2 Selection and Pre-Selection feature
window.ondblclick = async () => {
    if (viewer.dimensions.active === true) viewer.dimensions.create()
    else getIFCProps()
}

//5.3 IFC Properties
window.onkeydown = async (event) => {
    if (event.key === 'z' || event.key === 'Z') getIFCProps();    
    else if(event.key ==="q"||event.key==="Q") toggleDimensions();
    else if(event.key ==="x"||event.key==="X") viewer.dimensions.deleteAll();
    else if(event.key ==="p"||event.key==="P") togglePostProduction();
    else if(event.key ==="s"||event.key==="S") toggleShadows();
    else if(event.key ==="Escape") unSelectClear();
}

function unSelectClear(){
    viewer.IFC.selector.unpickIfcItems()
    removeAllChildren(propsGUI)
}

async function getIFCProps() {
    const result = await viewer.IFC.selector.pickIfcItem();
        if (!result){
            viewer.IFC.selector.unpickIfcItems();
            removeAllChildren(propsGUI)
        }else{
        const { modelID, id } = result;
        const props = await viewer.IFC.getProperties(modelID, id, true, false);
        createPropertiesMenu(props);
        }
}

async function toggleShadows(){
    if (shadowActive===false) {
        await viewer.shadowDropper.renderShadow(0)
        shadowActive=true
    }else{
        viewer.shadowDropper.deleteShadow(0)
        shadowActive=false
    }
}

async function togglePostProduction(){ 
    if (viewer.context.renderer.postProduction.active===false){
        viewer.context.renderer.postProduction.active=true;
        await viewer.context.ifcCamera.cameraControls.zoom(0.001,true)
    } 
    else viewer.context.renderer.postProduction.active=false 
}

function toggleDimensions() {
    if (shadowActive===true) {
        viewer.shadowDropper.deleteShadow(0);
        shadowActive=false
    }
    if(viewer.dimensions.active === true && viewer.dimensions.previewActive === true){
        viewer.dimensions.active = false;
        viewer.dimensions.previewActive = false;
    }else if(viewer.dimensions.active === false && viewer.dimensions.previewActive === false){
        viewer.dimensions.active = true;
        viewer.dimensions.previewActive = true;
    }
}

// Properties menu creation

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

// 5.4 IFC Spatial Tree

const toggler = document.getElementsByClassName("caret");
for (let i = 0; i < toggler.length; i++) {
    toggler[i].onclick = () => {
        toggler[i].parentElement.querySelector(".nested").classList.toggle("active");
        toggler[i].classList.toggle("caret-down");
    }
}

// Spatial tree menu

function createTreeMenu(ifcProject) {
    const root = document.getElementById("tree-root");
    removeAllChildren(root);
    const ifcProjectNode = createNestedChild(root, ifcProject);
    ifcProject.children.forEach(child => {
        constructTreeMenuNode(ifcProjectNode, child);
    })
}

function nodeToString(node) {
    return `${node.type} - ${node.expressID}`
}

function constructTreeMenuNode(parent, node) {
    const children = node.children;
    if (children.length === 0) {
        createSimpleChild(parent, node);
        return;
    }
    const nodeElement = createNestedChild(parent, node);
    children.forEach(child => {
        constructTreeMenuNode(nodeElement, child);
    })
}

function createNestedChild(parent, node) {
    const content = nodeToString(node);
    const root = document.createElement('li');
    createTitle(root, content);
    const childrenContainer = document.createElement('ul');
    childrenContainer.classList.add("nested");
    root.appendChild(childrenContainer);
    parent.appendChild(root);
    return childrenContainer;
}

function createTitle(parent, content) {
    const title = document.createElement("span");
    title.classList.add("caret");
    title.onclick = () => {
        title.parentElement.querySelector(".nested").classList.toggle("active");
        title.classList.toggle("caret-down");
    }
    title.textContent = content;
    parent.appendChild(title);
}

function createSimpleChild(parent, node) {
    const content = nodeToString(node);
    const childNode = document.createElement('li');
    childNode.classList.add('leaf-node');
    childNode.textContent = content;
    parent.appendChild(childNode);

    childNode.onmouseenter = () => viewer.IFC.selector.prepickIfcItemsByID(0, [node.expressID]);
    childNode.onclick = async () => {
        viewer.IFC.selector.pickIfcItemsByID(0, [node.expressID],true);
        const props = await viewer.IFC.getProperties(0, node.expressID, true, false);
        createPropertiesMenu(props);
    }
    childNode.onmouseleave = () => viewer.IFC.selector.unPrepickIfcItems();
}

// 5.5-Visibility
const scene = viewer.context.getScene();
// List of categories names
const categories = {
    IFCWALLSTANDARDCASE,
    IFCSLAB,
    IFCFURNISHINGELEMENT,
    IFCDOOR,
    IFCWINDOW,
    IFCPLATE,
    IFCMEMBER
};

// Gets the name of a category
function getName(category) {
    const names = Object.keys(categories);
    return names.find(name => categories[name] === category);
}

// Gets the IDs of all the items of a specific category
async function getAll(category) {
    return viewer.IFC.loader.ifcManager.getAllItemsOfType(0, category, false);
}

// Creates a new subset containing all elements of a category
async function newSubsetOfType(category) {
    const ids = await getAll(category);
    return viewer.IFC.loader.ifcManager.createSubset({
        modelID: 0,
        scene,
        ids,
        removePrevious: true,
        customID: category.toString()
    })
}

// Stores the created subsets
const subsets = {};

async function setupAllCategories() {
	const allCategories = Object.values(categories);
	for (let i = 0; i < allCategories.length; i++) {
		const category = allCategories[i];
		await setupCategory(category);
	}
}

// Creates a new subset and configures the checkbox
async function setupCategory(category) {
	subsets[category] = await newSubsetOfType(category);
	setupCheckBox(category);
}

// Sets up the checkbox event to hide / show elements
function setupCheckBox(category) {
	const name = getName(category);
	const checkBox = document.getElementById(name);
	checkBox.addEventListener('change', (event) => {
		const checked = event.target.checked;
		const subset = subsets[category];
		if (checked) scene.add(subset);
		else subset.removeFromParent();
	});
}