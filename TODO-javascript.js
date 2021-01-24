// https://stackoverflow.com/questions/60740655/how-to-find-matching-string-in-array-in-knex
 
data = [
{
	'username': 'elen',
	'email': 'elen@test.com',
	'active': true,
	'employed': false,
	'state': 'married',
	'profiles': [
		{'name': 'elenLove', 'job': 'actor' },
		{'name': 'elenDoe', 'job': 'spy'}
	],
	'hobbies': ['run', 'movies'],
	'status': {
		'home': { 
			'ownsHome': true,
			'addresses': [
				{'town': 'Mexico', 'address': '123 mexicoStr'},
				{'town': 'Atlanta', 'address': '4B atlanta 45-48'},
			]
		},
		'car': {
			'ownsCar': true,
			'cars': [
				{'brand': 'Nissan', 'plate': 'TOKY-114'},
				{'brand': 'Benz', 'plate': 'ELEN-1225'}
			]
		}
	}
}
,
{
	'username': 'alex',
	'email': 'alex@gmail.com',
	'active': true,
	'employed': true,
	'state': 'single',
	'profiles': [
		{'name': 'alexpan', 'job': 'doctor' },
		{'name': 'alexSketo', 'job': 'speaker'}
	],
	'hobbies': ['biology', 'tennis'],
	'status': {
		'home': { 
			'ownsHome': true,
			'addresses': [
				{'town': 'Adelaida', 'address': '999b Adella'},
				{'town': 'California', 'address': 'calli 34-21 4b'},
			]
		},
		'car': {
			'ownsCar': false,
			'cars': [
				{'brand': 'Toyota', 'plate': 'ALEx858'},
				{'brand': 'Toyota', 'plate': 'CAROL-520'}
			]
		}
	}
}
,
{
	'username': 'joe',
	'email': 'test_user@test.com',
	'active': false,
	'employed': false,
	'state': 'single',
	'profiles': [
		{'name': 'joeStar', 'job': 'actor' },
		{'name': 'joeDoe', 'job': 'spy'}
	],
	'hobbies': ['surf', 'movies'],
	'status': {
		'home': { 
			'ownsHome': true,
			'addresses': [
				{'town': 'Mexico', 'address': '123 mexicoStr'},
				{'town': 'Athens', 'address': '456 Kalirois'},
			]
		},
		'car': {
			'ownsCar': false,
			'cars': [
				{'brand': 'Toyota', 'plate': 'TOYO-3453'},
				{'brand': 'Nissan', 'plate': 'COREA-3424'},
				{'brand': 'Benz', 'plate': 'BENZ-7865'}
			]
		}
	}
}
,
{
	'username': 'nick',
	'email': 'nick_user@test.com',
	'active': false,
	'employed': true,
	'state': 'single',
	'profiles': [
		{'name': 'nick1', 'job': 'actor' },
		{'name': 'nickTheGreek', 'job': 'player'}
	],
	'hobbies': ['surf', 'tennis'],
	'status': {
		'home': { 
			'ownsHome': false,
			'addresses': [
				{'town': 'Adelaida', 'address': '1223b AUStr'},
				{'town': 'Athens', 'address': '1216 PL Marouda'},
			]
		},
		'car': {
			'ownsCar': true,
			'cars': [
				{'brand': 'Toyota', 'plate': 'TOYO-2113'},
				{'brand': 'Nissan', 'plate': 'NISS-3433'}
			]
		}
	}
}
];

function filterObjects(arr, filterObj, direction="IN", glue="AND", exactMatch=true) { 
	if (!['IN', 'OUT'].includes(direction) || !['AND', 'OR'].includes(glue)) {
		throw "filterObjects argument error";
	}
	// todo exactMatch
	let ruleOUT  = (direction === "OUT");
	let applyAND = (glue === "AND");
	let ruleIN   = !ruleOUT;
	let applyOR  = !applyAND;
	let results  = [];
	let glueMethod = applyOR ? "some" : "every"
	
	const isObject = function (obj) {
		return typeof(obj) == "object" && !Array.isArray(obj) && obj != null && obj != "" && !(obj instanceof String) ;
	};
	const isObjectEqual = function (o1, o2, ignorePropsArr=[]) {
		// Deep Clone objects
		let _obj1 = JSON.parse(JSON.stringify(o1)),
			_obj2 = JSON.parse(JSON.stringify(o2));
		// Remove props to ignore
		ignorePropsArr.map( p => { 
			eval('_obj1.'+p+' = _obj2.'+p+' = "IGNORED"');
		});
		// compare as strings
		let s1 = JSON.stringify(_obj1),
			s2 = JSON.stringify(_obj2);
		// return [s1==s2,s1,s2];
		return s1==s2;
	};
	
	arr.map( (item, i) => {

		console.log('loop for data at', i);
		let isMatch = false;
		
		isMatch = Object.keys(filterObj)[glueMethod]( filterKey => {
			const filterValue = filterObj[filterKey];
			const itemValue = item[filterKey];
			let isMatchBool = false;		
			console.log('comparing filterValue', filterValue, 'itemValue', item[filterKey])

			if (Array.isArray(filterValue) && !isObject(filterValue[0])) {						
				if (Array.isArray(itemValue)) { 
					console.log('if1-1');	
					isMatchBool = filterValue.some( fv => itemValue.includes(fv));
				} else {
					console.log('if1-2');	
					isMatchBool = filterValue.includes(itemValue);
				}
			} else if (isObject(filterValue)) {	
				if (Array.isArray(itemValue)) { 
					console.log('if2-1'); 
					console.log('--recursion circle ON');
					let rec_results = filterObjects(itemValue, filterValue, "IN", "AND", true);					
					console.log('--recursion, results:', rec_results);
					console.log('--recursion circle OFF');
					isMatchBool = (rec_results.length > 0);
				}
				else {
					console.log('if2-2');	
					console.log('WIP object');
				}
			} else {				
				if (Array.isArray(itemValue)) { 
					console.log('if3-1');	
					isMatchBool = itemValue.includes(filterValue);
				} else {
					console.log('if3-2');	
					isMatchBool = filterValue === itemValue;
				}
			}
			console.log('-gave:'+isMatchBool);
			return isMatchBool;
		});

		if ((isMatch && ruleIN) || (!isMatch && !ruleIN)) {
			results.push(item);
		}
		 
	});
		
	return results;
	
}


itemFlatten = {
	"username": 'nick',
	"email": 'nick_user@test.com',
	"active": false,
	"employed": true,
	"state": "single",
	"profiles": [
		{"name": 'nick1', "job": 'actor' },
		{"name": 'nickTheGreek', "job": 'player'}
	],
	"hobbies": ['surf', 'tennis'],
	"status.home.ownsHome": false,
	"status.home.addresses": [
		{"town": 'Adelaida', "address": '1223b AUStr'},
		{"town": 'Athens', "address": '1216 PL Marouda'},
	],
	"status.car.ownsCar": true,
	"status.car.cars": [
		{"brand": 'Toyota', "plate": 'TOYO-2113'},
		{"brand": 'Nissan', "plate": 'NISS-3433'}
	]
}

filterObj1 = {
	'active': true
}

filterObj2 = {
	'active': true,
	'employed': true
}

filterObj3 = {
	'state': 'single',
	'employed': true
}

filterObj4 = {
	'employed': true,
	'hobbies': 'surf'
}

filterObj5 = {
	'employed': true,
	'email': ['elen@test.com', 'alex@gmail.com']
}

filterObj6 = {
	'employed': true,
	'hobbies': ['surf', 'biology']
}


filterObj101a = {
	'hobbies': 'tennis',
	'profiles': {
		'job': 'actor'
	}
}
filterObj101b = {
	'hobbies': 'tennis',
	'profiles': [
		{'job': 'actor'}
	]
}

filterObj102a = {
	'hobbies': 'tennis',
	'profiles': {
		'job': ['actor', 'doctor']
	}
}
filterObj102b = {
	'hobbies': 'tennis',
	'profiles': [
		{'job': ['actor', 'doctor']}
	]
}
filterObj102c = {
	'hobbies': 'tennis',
	'profiles': [
		{'job': 'actor'},
		{'job': 'doctor'}
	]
}

filterObj102Flatten = {
	'status.home.ownsHome': false
}


filterObj103a = {
	'status': {
		'home': { 
			'ownsHome': false
		}
	}
}

filterObj103b = {
	'status': {
		'car': { 
			'cars': [
				{'brand': 'Toyota'}
			]
		}
	}
}


filterObjects (data, filterObj1, 'IN', 'OR', true);





 