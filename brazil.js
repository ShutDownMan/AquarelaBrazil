console.log("Started page!");

const mainCanvas = document.getElementById('main_canvas');
var counties = [];

/// Loading svg
var s = Snap("#main_canvas");
Snap.load("/brazil.svg", function (loadedFragment) {
	/// append loaded file
	s.append(loadedFragment);
	
	/// get if user is clicking on svg
	var leftMouseDown = false;
	mainCanvas.onmousedown = function (e) {
		if (e.button !== 1) e.stopImmediatePropagation();
		if (e.button === 0) leftMouseDown = true;
	}
	mainCanvas.onmouseup = function (e) {
		if (e.button === 0) leftMouseDown = false;
	}
	
	/// Start panzoom
	var panZoomTiger = svgPanZoom(mainCanvas, {
		zoomEnabled: true,
		controlIconsEnabled: true,
		contain: true,
		center: true,
		minZoom: 0.9
	});
	
	setupGraph();
});

function setupGraph() {
	let ac = new County('BR-AC');
	let al = new County('BR-AL');
	let am = new County('BR-AM');
	let ap = new County('BR-AP');
	let ba = new County('BR-BA');
	let ce = new County('BR-CE');
	let df = new County('BR-DF');
	let es = new County('BR-ES');
	let go = new County('BR-GO');
	let ma = new County('BR-MA');
	let mg = new County('BR-MG');
	let ms = new County('BR-MS');
	let mt = new County('BR-MT');
	let pa = new County('BR-PA');
	let pb = new County('BR-PB');
	let pe = new County('BR-PE');
	let pi = new County('BR-PI');
	let pr = new County('BR-PR');
	let rj = new County('BR-RJ');
	let rn = new County('BR-RN');
	let ro = new County('BR-RO');
	let rr = new County('BR-RR');
	let rs = new County('BR-RS');
	let sc = new County('BR-SC');
	let se = new County('BR-SE');
	let sp = new County('BR-SP');
	let to = new County('BR-TO');
	
	ac.addNeighbours([ro, am]);
	al.addNeighbours([se, ba, pe]);
	am.addNeighbours([ac, rr, pa, mt, ro]);
	ap.addNeighbours([pa]);
	ba.addNeighbours([se, al, pe, pi, to, go, mg, es]);
	ce.addNeighbours([rn, pb, pe, pi]);
	df.addNeighbours([go, mg]);
	es.addNeighbours([ba, mg, rj]);
	go.addNeighbours([df, mt, to, ba, mg, ms]);
	ma.addNeighbours([pa, to, pi]);
	mg.addNeighbours([go, df, ba, es, rj, sp, ms]);
	ms.addNeighbours([mt, go, mg, sp, pr]);
	mt.addNeighbours([ro, am, pa, to, go, ms]);
	pa.addNeighbours([am, rr, ap, ma, to, mt]);
	pb.addNeighbours([rn, pe, ce]);
	pe.addNeighbours([ce, pb, al, ba, pi]);
	pi.addNeighbours([ma, ce, pe, ba, to]);
	pr.addNeighbours([ma, sp, sc]);
	rj.addNeighbours([sp, mg, es]);
	rn.addNeighbours([ce, pb]);
	ro.addNeighbours([ac, am, mt]);
	rr.addNeighbours([pa, am]);
	rs.addNeighbours([sc]);
	sc.addNeighbours([pr, rs]);
	se.addNeighbours([ba, al]);
	sp.addNeighbours([pr, ms, mg, rj]);
	to.addNeighbours([mt, pa, am, ma, pi, ba, go]);
	
	counties.push(ac, al, am, ap, ba, ce, df, es, go, ma, mg, ms, mt, pa, pb, pe, pi, pr, rj, rn, ro, rr, rs, sc, se, sp, to);
	
	counties.forEach(county => {
		fillCounty(county);
	});
	
	counties.sort((a, b) => {
		return (a.neighbours.length > b.neighbours.length) ? -1 : 1;
	});
	
	console.log(counties);
	
	solveNodes(counties, algorithm='welsh-powell');
}

var callingQueue = [];
async function clock() {
	if(callingQueue.length) {
		(callingQueue.shift()).call();
		console.log('shift call')
	}
}

function solveNodes(counties, algorithm='default') {
	/// console.log(colorSetPossible)
	
	
	switch(algorithm) {
		default:
		case 'first-fit':
		firstFitNodes(counties);
		break;
		case 'welsh-powell':
		welshPowellNodes(counties);
		break;
	}
}

async function firstFitNodes(counties) {
	let colorSetPossible = Object.keys(Colors);
	let colorSetAvailable = [];
	
	/// foreach county in Brazil
	counties.forEach(function (currentNode, index) {
		function colorCounty() {
			let possibleColors = [];
			
			do {
				possibleColors = [...colorSetAvailable];
				
				console.log(currentNode.name);
				
				/// check if color available in neighbours
				currentNode.neighbours.forEach(function (neighbourNode, index) {
					// intersect neighbours colors with colorSetAvailable
					// console.log(possibleColors);
					// console.log(possibleColors.indexOf(neighbourNode.color));
					
					let startInd = possibleColors.indexOf(neighbourNode.color);
					if(startInd != -1) {
						possibleColors.splice(startInd, 1);
					}
					
					console.log(possibleColors);
				});
				
				// no available colors, must add new one
				if(!possibleColors.length) {
					colorSetAvailable.push(Colors[colorSetPossible[colorSetAvailable.length + 1]]);
					possibleColors.push(colorSetAvailable[colorSetAvailable.length - 1]);
					
					// console.log(possibleColors);
					// console.log('not possible! - ' + colorSetAvailable.length);
				}
				
			} while(!possibleColors.length); //< repeat while there are no possible colors
			
			// console.log('possible! - ' + possibleColors[0]);
			
			/// set color for current node
			currentNode.color = possibleColors[0];
			fillCounty(currentNode);
		}
		callingQueue.push(colorCounty);
	});
	
	console.log('Used colors: ' + colorSetAvailable.length);
}

function welshPowellNodes(counties) {
	let currentColorIndex = 1;
	
	/// sort by neighbour number
	counties.sort((a, b) => {
		return (a.neighbours.length > b.neighbours.length) ? -1 : 1;
	});
	
	
	// get highest degree uncolored
	counties.forEach(function (node, index) {
		if(node.tag === Tag.WHITE) {
			recursiveWelshPowell(node, counties, currentColorIndex);
			
			currentColorIndex += 1;
		}
	});
	
	console.log('Used colors: ' + currentColorIndex);
}

function recursiveWelshPowell(currentNode, counties, currentColorIndex) {
	if(!counties.length) return;
	
	let activeColor = Object.keys(Colors)[currentColorIndex];
	
	// console.log(activeColor + ' - ' + Colors[activeColor]);
	
	currentNode.tag = Tag.BLACK;
	
	// color highest as active color
	currentNode.color = Colors[activeColor];
	callingQueue.push(() => {
		console.log(currentNode.name);
		fillCounty(currentNode, Colors[activeColor]);
	});
	
	// remove neighbours from list
	let countiesPrime = counties.filter(function (node) {
		return !(currentNode.hasNeighbour(node.name)) && (node.tag === Tag.WHITE);
	});
	
	console.log(countiesPrime);

	/// sort by neighbour number
	countiesPrime.sort((a, b) => {
		return (a.neighbours.length > b.neighbours.length) ? -1 : 1;
	});
	
	// recursive call
	recursiveWelshPowell(countiesPrime[0], countiesPrime, currentColorIndex);
}