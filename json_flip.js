// task: swap json orientation 

var multi = [
  {
    "name": "Germany",
    "series": [
      {
        "name": "2010",
        "value": 7300000
      },
      {
        "name": "2011",
        "value": 8940000
      }
    ]
  },  {
    "name": "USA",
    "series": [
      {
        "name": "2010",
        "value": 7870000
      },
      {
        "name": "2011",
        "value": 8270000
      }
    ]
  },  {
    "name": "France",
    "series": [
      {
        "name": "2010",
        "value": 5000002
      },
      {
        "name": "2011",
        "value": 5800000
      }
    ]
  }
];

// this is our target
var multi_flip = [
    {
        "name": "2010",
        "series": [
            {
                "name": "Germany",
                "value": 7300000
            },
            {
                "name": "USA",
                "value": 7870000
            },
            {
                "name": "France",
                "value": 5000002
            }
        ]
    }, {
        "name": "2011",
        "series": [
            {
                "name": "Germany",
                "value": 8940000
            },
            {
                "name": "USA",
                "value": 8270000
            },
            {
                "name": "France",
                "value": 5800000
            }
        ]
    }
];

function isObjectEqual(o1, o2, ignorePropsArr = []) {
    // Deep Clone objects
    let _obj1 = JSON.parse(JSON.stringify(o1)),
        _obj2 = JSON.parse(JSON.stringify(o2));
    // Remove props to ignore
    ignorePropsArr.map(p => {
        eval('_obj1.' + p + ' = _obj2.' + p + ' = "IGNORED"');
    });
    // compare as strings
    let s1 = JSON.stringify(_obj1),
        s2 = JSON.stringify(_obj2);
    // return [s1==s2,s1,s2];
    return s1 == s2;
}

function cloneSimpleObject(origin) {
    return JSON.parse(JSON.stringify(origin));
}

function getObjPropVals (arr, prop) {
    // returns an array of all values of <prop> property in all objects of the array
    var retArr = [];
    len = arr.length
    for (var i = 0; i < len; i++) {
        retArr.push(arr[i][prop]);
    }
    return retArr;
}

function pushObjectIfUniqueProp (arr, obj, prop) {
    // pushes the object in the array if there is no other object with object.prop === val in the array
    const found = arr.some(i => {
        return i[prop] === obj[prop];
    });
    if (!found) arr.push(obj);
    return !found;
}

function flipNGXchartJson_singleRun(arr) {
    let flippedData = [];    
    let flippedDataObj = {};    
    arr.map(outerItem => {
        /* item sample:
            {
                "name": "Germany",
                "series": [
                {
                    "name": "2010",
                    "value": 7300000
                },
                {
                    "name": "2011",
                    "value": 8940000
                }]
            }      
        */
        let outerName = outerItem['name'];
        outerItem['series'].map(seriesItem => {
            if (!flippedDataObj[seriesItem['name']]) {
                flippedDataObj[seriesItem['name']] = {};
            }
            flippedDataObj[seriesItem['name']][outerName] = seriesItem['value']
        });
        /* now we have: 
        {
            "2010" : {
                "Germany": 7300000,
                "USA"    : 7870000,
                "France" : 5000002
            },
            "2011" : {
                "Germany": 8940000,
                "USA"    : 8270000,
                "France" : 5800000
            }
        }
        */
    });
    Object.keys(flippedDataObj).forEach(outerName => {
        let collection = flippedDataObj[outerName];
        let series = [];
        Object.keys(collection).forEach(pairKey => {
            series.push(
                {
                    'name': pairKey,
                    'value': collection[pairKey]
                }
            )
        });
        flippedData.push(
            {
                'name': outerName,
                'series': series
            }
        );
    });
    return flippedData;
}
// let result1 = flipNGXchartJson_singleRun(multi);
// console.log(isObjectEqual(result1[0], multi_flip[0]));
// console.log(isObjectEqual(result1[1], multi_flip[1]));

function flipNGXchartJson (arr) {    
    let flippedData = [];
    let outerObjPlaceHolder = {
        "name": "",
        "series": []
    };
    let arrCopy = cloneSimpleObject(arr);
    // turn all series names into: "{name}:{outerName}"
    arrCopy.map(outerItem => {
        let outerName = outerItem['name'];
        outerItem['series'].map(seriesItem => {
            seriesItem['name'] += ':' + outerName; 
        });
    });
    // flatten all pairs
    let flattenData = [].concat.apply([], getObjPropVals(arrCopy, 'series'));
    /* we now have flattenData:
        [
            {name: "2010:Germany", value: 7300000},
            {name: "2011:Germany", value: 8940000},
            {name: "2010:USA", value: 7870000},
            {name: "2011:USA", value: 8270000},
            {name: "2010:France", value: 5000002},
            {name: "2011:France", value: 5800000},
        ]
    */
    flattenData.map(pairItem => {
        let outerName = pairItem['name'].split(':')[0];
        let outerObj = cloneSimpleObject(outerObjPlaceHolder);
        outerObj['name'] = outerName;
        pushObjectIfUniqueProp(flippedData, outerObj, 'name');
    });
    /* we now have flippedData:
    [ 
        {name: "2010", series: []},
        {name: "2010", series: []} 
    ]    
    */
    flattenData.map(pairItem => {
        // find the proper object item by its name value
        let outerObj = flippedData.filter(i => i['name'] === pairItem['name'].split(':')[0])[0];
        // only keep the second part for the inner object
        pairItem['name'] = pairItem['name'].split(':')[1];
        outerObj['series'].push(pairItem);    
    });

    return flippedData;
}
// let result2 = flipNGXchartJson(multi);
// console.log(isObjectEqual(result2[0], multi_flip[0]));
// console.log(isObjectEqual(result2[1], multi_flip[1]));

function flipNGXchartJson_savas_john(arr) {
    let flippedData = [];
    let mergedStrings = [];
    let arrCopy = cloneSimpleObject(arr);
    // turn all series names into trixies: "2010_Germany_730000"
    arrCopy.map(outerItem => {
        let outerName = outerItem['name'];
        outerItem['series'].map(seriesItem => {
            mergedStrings.push(`${seriesItem['name']}_${outerName}_${seriesItem['value']}`);
        });
    });
    mergedStrings.sort();
    let prevYear = 0;
    let outerObjEntry = null;
    mergedStrings.push('666_dirtyAs_Hell');
    mergedStrings.map(str => {
        let splitted = str.split('_')
        let year = splitted[0];
        if (prevYear != year) {
            // push the prev outer obj enrty
            if (outerObjEntry !== null) {
                flippedData.push(outerObjEntry);
            }
            // create a new outer obj enrty
            outerObjEntry = {
                'name': year,
                'series': []
            }
        }
        outerObjEntry['series'].push(
            {
                'name': splitted[1],
                'value': splitted[2]
            }
        );
        prevYear = year;      
    });
    return flippedData;
}
// let result3 = flipNGXchartJson_savas_john(multi);
// equality fails due to sorted pairs
// console.log(isObjectEqual(result3[0], multi_flip[0]));
// console.log(isObjectEqual(result3[1], multi_flip[1]));

function flipNGXchartJson_savas(arr) {
    let years = new Set();
    let yearIndexes = {};
    const results = arr.map(outerItem => {
        let outerName = outerItem['name'];
        return outerItem['series'].map(seriesItem => {
            return [seriesItem['name'], outerName, seriesItem['value']];
        });
    }).reduce((previous, rowArrays) => {
        for (const parts of rowArrays) {
            let year = parts[0];
            let seriesObj = {
                name: parts[1],
                value: parts[2]
            };
            if (!years.has(year)) {
                years.add(year);

                previous.push(
                    {
                        name: year,
                        series: [seriesObj]
                    });

                yearIndexes[year] = previous.length - 1;
            } else {
                previous[yearIndexes[year]].series.push(seriesObj);
            }
        }
        return previous;
    }, []);
    return results;
}
// let result4 = flipNGXchartJson_savas(multi);
// equality fails due to sorted pairs
// console.log(isObjectEqual(result4[0], multi_flip[0]));
// console.log(isObjectEqual(result4[1], multi_flip[1]));

let iter = 10000;
var test1 = performanceTest(flipNGXchartJson_singleRun, multi, iter);
var test2 = performanceTest(flipNGXchartJson, multi, iter);
var test3 = performanceTest(flipNGXchartJson_savas_john, multi, iter);
var test4 = performanceTest(flipNGXchartJson_savas, multi, iter);
//console.log('performanceTest: ', test1, test2, test3);
console.table(
    { 'flipNGXchartJson_singleRun' : test1,
      'flipNGXchartJson'           : test2,
      'flipNGXchartJson_savas_john': test3,
      'flipNGXchartJson_savas'     : test4
    }
);

function performanceTest(testFunction, data, iterations) {
    /* counts execution time of a function */
    /* sample 
        function keepInRange0(val, min, max){	val = val < min ? min : val; val = val > max ? max : val;	return val;	}
        function keepInRange1(val, min, max){	val = Math.min(max, val); val = Math.max(min, val);	return val;	}
        var testData = [ 	[5,1,10],	[.1,1,10],	[.00000000000000000000000000000000000000000000000000000000000000001,1,10],			[100000000000000000000000000000000000000000000000000000000000000001,1,10] ];
        performanceTest(keepInRange0, testData, 1000000);
        performanceTest(keepInRange1, testData, 1000000);
    */
    var sum = 0, dataIndex = 0, dataLength = data.length;
    var start = performance.now();
    // for (var i = 0; i < iterations; i++, dataIndex++) {
    //     testFunction(...data[dataIndex]);
    //     dataIndex = (dataIndex < dataLength - 1) ? dataIndex : -1;
    // }
    for (var i = 0; i < iterations; i++) {
        testFunction(data);
    }
    var time = performance.now() - start;
    return time;
}
