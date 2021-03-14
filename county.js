const Tag = {
	NONE: 0,
	WHITE: 1,
	GRAY: 2,
	BLACK: 4
}

const Colors = {
	WHITE: '#FFF',
	RED: '#F00',
	GREEN: '#0F0',
	BLUE: '#00F',
	MAGENTA: '#808',
	PINK: '#F19CBB',
	DARK_GREEN: '#013220',
	DARK_ORCHID: '#9932CC',
	ASPARGUS: '#87A96B',
	AERO: '#7CB9E8',
	AMBER: '#FFBF00',
}

class County {
	constructor(name) {
		this.name = name;
		this.tag = Tag.WHITE;
		this.color = Colors.WHITE;

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