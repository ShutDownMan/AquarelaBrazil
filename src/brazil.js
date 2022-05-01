console.log("Started page!");

const mainCanvas = document.getElementById('main_canvas');
var counties = [];

var speedRangeValue = undefined;
onChangeSpeedRange(document.querySelector("#speedRange").value);

var selectedAlgo = undefined;
onChangeSelectAlgorithm(document.querySelector("#algorithms").value);

var preSortingAlgo = undefined;
onChangeSelectPreSortingAlgo(document.querySelector("#pre-sorting-algo").value);

var inSortingAlgo = undefined;
onChangeSelectInSortingAlgo(document.querySelector("#in-sorting-algo").value);

var logBoxElem = document.querySelector("#log-box");

var colorsUsed = 0;
var constraintsTested = 0;
var nodesFetched = 0;

var colorsUsedElem = document.querySelector("#colors-used");;
var constraintsTestedElem = document.querySelector("#constraints-tested");;
var nodesFetchedElem = document.querySelector("#nodes-fetched");;

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
	
	logBoxElem = document.querySelector("#log-box");
	
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
	pr.addNeighbours([ms, sp, sc]);
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
	
	logBox("Graph setup complete.");
	
	reset();
}

var callingQueue = [];

async function toggleStart(btnElem=undefined) {
	/// if no tick running
	if(!mapTickTimeout) {
		if(btnElem) btnElem.innerHTML = "PAUSE";
		
		logBox("Playing.", time=true);
		
		if(!callingQueue.length) {
			resetCounties();
			
			solveNodes(counties, algorithm=selectedAlgo, preSorting=preSortingAlgo, inSorting=inSortingAlgo);
		}
		
		/// run tick
		mapTickTimeout = setTimeout(mapTick, speedRangeValue);
	} else {
		if(btnElem) btnElem.innerHTML = "PLAY";
		
		logBox("Paused.");
		
		clearTimeout(mapTickTimeout);
		mapTickTimeout = undefined;
	}
}

function resetCounties() {
	counties.forEach(county => {
		county.tag = Tag.WHITE;
		county.color = Colors.GRAY;
		fillCounty(county);
	});
}

var mapTickTimeout = undefined;
async function reset() {
	colorsUsed = 0;
	constraintsTested = 0;
	nodesFetched = 0;

	if(mapTickTimeout) clearTimeout(mapTickTimeout);
	mapTickTimeout = undefined;
	
	btnElem = document.querySelector("#toggle-start-btn");
	if(btnElem) btnElem.innerHTML = "PLAY";
	
	/// reset calling queue and map
	callingQueue = [];
	resetCounties();

	resetLogBox();
	
	logBox("Map reset.");
	
	// TODO: if randomize order
}

function mapTick() {
	// console.log(callingQueue);
	
	colorsUsedElem.innerHTML = "Colors used:<br>" + colorsUsed;
	constraintsTestedElem.innerHTML = "Constraints tested:<br>" + constraintsTested;
	nodesFetchedElem.innerHTML = "Nodes Fetched:<br>" + nodesFetched;

	/// if there's still calls to be made
	if(callingQueue.length) {
		/// call it
		(callingQueue.shift()).call();
		// console.log('shift call');
		
		/// if tick exists, create a new one
		if(mapTickTimeout) mapTickTimeout = setTimeout(mapTick, speedRangeValue);
	} else {
		mapTickTimeout = undefined;
		
		btnElem = document.querySelector("#toggle-start-btn");
		if(btnElem) btnElem.innerHTML = "PLAY";
		
		/// reset calling queue and map
		callingQueue = [];
		counties.forEach(county => {
			county.tag = Tag.WHITE;
			county.color = Colors.GRAY;
		});	
	}
}

function onChangeSpeedRange(value) {
	let a = 0.00108561384454;
	let b = -0.0803550010002;
	let c = -2.08144061484;
	speedRangeValue = a*(value*10)**2 + b*(value*10) + c;
	
	if(!mapTickTimeout) mapTickTimeout = setTimeout(mapTick, speedRangeValue);
	
	console.log("onChangeSpeedRange")
}

function onClickSpeedRange(value) {
	clearTimeout(mapTickTimeout);
	mapTickTimeout = undefined;
}

function onChangeSelectAlgorithm(value) {
	selectedAlgo = value;
	
	document.querySelector("#pre-sorting").style.display = "none";
	document.querySelector("#in-sorting").style.display = "none";
	
	switch(value) {
		case "first-fit":
		document.querySelector("#pre-sorting").style.display = "block";
		break;
		case "welsh-powell":
		document.querySelector("#in-sorting").style.display = "block";
		document.querySelector("#pre-sorting").style.display = "block";
		break;
		case "brute-force":
		document.querySelector("#pre-sorting").style.display = "block";
		break;
	}
	
	reset();
}

function onChangeSelectPreSortingAlgo(value) {
	preSortingAlgo = value;
	reset();
}

function onChangeSelectInSortingAlgo(value) {
	inSortingAlgo = value;
	reset();
}

async function solveNodes(counties, algorithm='default', preSorting='default', inSorting='default') {
	
	sortCounties(counties, preSorting);
	
	switch(algorithm) {
		default:
		case 'first-fit':
		logBox("First Fit algorithm running.");
		firstFitNodes(counties);
		break;
		case 'welsh-powell':
		logBox("Welsh Powell algorithm running.");
		welshPowellNodes(counties, inSorting=inSorting);
		break;
		case 'bogo-coloring':
		logBox("Bogo Coloring algorithm running.");
		bogoColoringNodes(counties);
		break;
		case 'brute-force':
		logBox("Brute Force algorithm running.");
		bruteForce(counties);
		break;
	}
}

function sortCounties(counties, algorithm='default') {
	
	switch(algorithm) {
		default:
		case "default-arranged":
		logBox("Leaving with default arrangement.");
		break;
		
		case "randomly-arranged":
		logBox("Randomly sorted.");
		shuffle(counties);
		break;
		
		case "alphabetically-arranged":
		logBox("Sorting by alphabetical order.");
		counties.sort((a, b) => {
			return (a.name < b.name) ? -1 : 1;
		});
		break;
		
		case "most-constrained":
		logBox("Sorting by most constrained first.");
		counties = counties.sort((a, b) => {
			return (a.neighbours.length > b.neighbours.length) ? -1 : 1;
		});
		break;
		
		case "least-constrained":
		logBox("Sorting by least constrained.");
		counties.sort((a, b) => {
			return (a.neighbours.length < b.neighbours.length) ? -1 : 1;
		});
		break;
	}
	
	return counties;
}

function logBox(text, time=true) {
	if(!logBoxElem) return;
	
	let finalText = "";
	
	if(time) {
		let currentDate = new Date();
		let dateStr = currentDate.toISOString();
		finalText += "[" + dateStr + "] ";
	}

	finalText += text + "<br>";
	
	logBoxElem.innerHTML += finalText;

	logBoxElem.scrollTop = logBoxElem.scrollHeight;
}

function resetLogBox() {
	if(!logBoxElem) return;

	logBoxElem.innerHTML = "";

	logBoxElem.scrollTop = logBoxElem.scrollHeight;
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
  
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
  
	  // Pick a remaining element...
	  randomIndex = Math.floor(Math.random() * currentIndex);
	  currentIndex -= 1;
  
	  // And swap it with the current element.
	  temporaryValue = array[currentIndex];
	  array[currentIndex] = array[randomIndex];
	  array[randomIndex] = temporaryValue;
	}
  
	return array;
  }
  

  function logAlgoResult() {
	logBox("Map solved.");
	logBox("Colors used: " + colorsUsed);
	logBox("Constraints tested: " + constraintsTested);
	logBox("Nodes Fetched: " + nodesFetched);
  }