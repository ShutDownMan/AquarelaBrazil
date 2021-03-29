
async function firstFitNodes(counties) {
	let colorSetPossible = Object.keys(Colors);
	let colorSetAvailable = [];
	
	/// foreach county in the map
	for(let currentNode of counties) {
		colorsUsed = await firstFitColorCounty(currentNode, colorSetPossible, colorSetAvailable);
	}
	
	logAlgoResult();
}

function firstFitColorCounty(currentNode, colorSetPossible, colorSetAvailable) {
	return new Promise((resolve) => {
		callingQueue.push(() => {
			let possibleColors = [];
			
			do {
				possibleColors = [...colorSetAvailable];
				
				console.log(currentNode.name);
				
				/// check if color available in neighbours
				currentNode.neighbours.forEach(function (neighbourNode) {
					nodesFetched++;
					// intersect neighbours colors with colorSetAvailable
					
					let startInd = possibleColors.indexOf(neighbourNode.color);
					if(startInd != -1) {
						constraintsTested++;
						possibleColors.splice(startInd, 1);
					}
					
					console.log(possibleColors);
				});
				
				console.log(colorSetAvailable.length);
				
				// no available colors, must add new one
				if(!possibleColors.length) {
					colorSetAvailable.push(Colors[colorSetPossible[colorSetAvailable.length + 1]]);
					possibleColors.push(colorSetAvailable[colorSetAvailable.length - 1]);
				}
				
			} while(!possibleColors.length); //< repeat while there are no possible colors
			
			// console.log('possible! - ' + possibleColors[0]);
			
			/// set color for current node
			currentNode.color = possibleColors[0];
			fillCounty(currentNode);
			
			resolve(colorSetAvailable.length);
		});
	});
	
}

async function welshPowellNodes(counties, inSorting='default') {
	let currentColorIndex = 1;
	
	// get highest degree uncolored
	for(let county of counties) {
		nodesFetched++;
		if(county.tag === Tag.WHITE) {
			await recursiveWelshPowell(county, counties, currentColorIndex, inSorting);
			
			currentColorIndex += 1;
			colorsUsed = currentColorIndex - 1;
		}
	}
	
	logAlgoResult();
}

async function recursiveWelshPowell(currentNode, counties, currentColorIndex, inSorting) {
	if(!counties.length) return true;
	
	return new Promise(function (resolve) {
		let activeColor = Object.keys(Colors)[currentColorIndex];
		
		currentNode.tag = Tag.BLACK;
		
		// color highest as active color
		currentNode.color = Colors[activeColor];
		fillCounty(currentNode, Colors[activeColor]);
		
		// remove neighbours from list
		let countiesPrime = counties.filter(function (node) {
			nodesFetched++;
			return !(currentNode.hasNeighbour(node.name)) && (node.tag === Tag.WHITE);
		});
		
		/// sort by neighbour number
		sortCounties(countiesPrime, inSorting);
		
		// recursive call
		callingQueue.push(() => {
			let value = recursiveWelshPowell(countiesPrime[0], countiesPrime, currentColorIndex, inSorting)
			resolve(value);
		});
	});
}

async function bogoColoringNodes(counties, colorLimit=9) {
	let colorSetPossible = Object.keys(Colors);
	let colorSetAvailable = [];
	let solved = false;
	
	colorsUsed = colorLimit;

	/// get available colors
	for(let i = 0; i < colorLimit; ++i) {
		colorSetAvailable.push(colorSetPossible[i + 1]);
		console.log(colorSetAvailable)
	}
	
	/// do while not solved
	do {
		solved = await bogoColoringIteration(counties, colorSetAvailable);
	} while(!solved);
}

async function bogoColoringIteration(counties, colors) {
	return new Promise((resolve, reject) => {
		/// for each county
		counties.forEach((county) => {
			nodesFetched++;
			callingQueue.push(() => {
				/// set a random color
				county.color = Colors[colors[Math.trunc(Math.random() * colors.length) % colors.length]];
				fillCounty(county);
			});
			
			/// push to calling queue
			callingQueue.push(() => {
				/// get if graph is solved
				let solved = isSolved(counties);
				
				/// return result
				resolve(solved);
			});
		});
	});
}

function isSolved(counties) {
	let solved = true;
	/// for each county
	counties.forEach((county) => {
		nodesFetched++;
		/// for each neighbour
		county.neighbours.forEach((neigh) => {
			/// test if they have the same color
			constraintsTested++;
			if(county.color === neigh.color) {
				// bogo didn't work!
				solved = false;
			}
		});
	});
	
	return solved;
}

async function bruteForce(counties, maxColors=9) {
	let colorsInd = Array(counties.length);
	let colorSetAvailable = Object.keys(Colors);
	
	/// initialize nodes with different colors
	for(let i = 0; i < counties.length; ++i) {
		colorsInd[i] = i % maxColors;
	}
	
	colorsUsed = maxColors;

	let solved = false;
	do {
		/// try while not solved
		solved = await bruteForceIteration(counties, colorsInd, colorSetAvailable);
	} while(!solved);
	
	return counties;
}

function bruteForceIteration(counties, colorsInd, colorSetAvailable) {
	return new Promise((resolve) => {
		callingQueue.push(() => {
			
			/// text next color for first node
			maxColors = colorSetAvailable.length - 1;
			let rest = ((colorsInd[0] + 1) % maxColors === 0) ? 1 : 0;
			colorsInd[0] += 1; colorsInd[0] %= maxColors;
			
			/// carry for the next nodes
			for(let i = 1; rest && i < counties.length; ++i) {
				nodesFetched++;
				/// add if there's rest for the current node
				colorsInd[i] += rest;
				rest = +((colorsInd[i] + rest) % maxColors === 0);
				colorsInd[i] %= maxColors;
			}
			
			/// color nodes
			counties.forEach((county, index) => {
				county.color = Colors[colorSetAvailable[colorsInd[index] + 1]];
				fillCounty(county);
			});
			
			/// return if solved
			resolve(isSolved(counties));
		});
	});
}