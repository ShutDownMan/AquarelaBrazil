function fillCounty(county, color=county.color) {
	foundElem = s.select(`#${county.name}`);
	
	// console.log(color);
	logBox(`Coloring ${county.name} with ${color}.`);
	
	foundElem.node.style.fill = color;
}