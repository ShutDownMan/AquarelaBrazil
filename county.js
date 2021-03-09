TAG_WHITE = 0x0;

class County {
	constructor(name) {
		this.name = name;
		this.tag = TAG_WHITE;

		this.neighbours = [];
	}

	addNeighbour(neighbourCounty) {
		this.neighbours.push(neighbourCounty);
	}

	
	addNeighbours(neighbourCountys) {
		neighbourCountys.forEach(county => {
			this.addNeighbour(county);
		});
	}

}