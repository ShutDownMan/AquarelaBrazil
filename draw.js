async function fillCounty(county, color=county.color) {
	return new Promise(function (resolve, reject) {
		foundElem = s.select(`#${county.name}`);

		console.log(color);
	
		foundElem.node.style.fill = color;
	});
}