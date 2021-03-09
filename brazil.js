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
	sc.addNeighbours([pr, sc]);
	se.addNeighbours([ba, al]);
	sp.addNeighbours([pr, ms, mg, rj]);
	to.addNeighbours([mt, am, ma, pi, ba, go]);

	counties.push(ac, al, am, am, ap, ba, ce, df, es, go, ma, mg, ms, mt, pa, pb, pe, pi, pr, rj, rn, ro, rr, rs, sc, se, sp, to);

	counties.forEach(county => {
		fillCounty(county, 'white');
	});

	solveCounties(counties);
}

function solveCounties(counties) {
	
}