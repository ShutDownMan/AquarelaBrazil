async function fillCounty(county, color) {
	return new Promise(function (resolve, reject) {
		foundElem = s.select(`#${county.name}`);

		console.log(foundElem);
	
		foundElem.node.style.fill = color;
	});
}