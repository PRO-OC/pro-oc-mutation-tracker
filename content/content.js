// Testing purpose: https://ereg.ksrzis.cz/Registr/CUDZadanky/PacientDetail/Index/1004845

// TODO: all
// TODO: no static
var mutationSectionsTable = {
    "S": [
        "A570D",
        "Del69-70",
        "E484K",
        "K417N",
        "N439K",
        "N501Y",
        "P681H",
        "T761I",
        "L452R",
        "Y505H"
    ]
};

// TODO: no static
const VARIANT_ALIASES = {   
    "A": "",
    "B": "",
    "C": "B.1.1.1",
    "D": "B.1.1.25",
    "G": "B.1.258.2",
    "K": "B.1.1.277",
    "L": "B.1.1.10",
    "M": "B.1.1.294",
    "N": "B.1.1.33",
    "P": "B.1.1.28",
    "Q": "B.1.1.7",
    "R": "B.1.1.316",
    "S": "B.1.1.217",
    "U": "B.1.177.60",
    "V": "B.1.177.54",
    "W": "B.1.177.53",
    "Y": "B.1.177.52",
    "Z": "B.1.177.50",
    "AA": "B.1.177.15",
    "AB": "B.1.160.16",
    "AC": "B.1.1.405",
    "AD": "B.1.1.315",
    "AE": "B.1.1.306",
    "AF": "B.1.1.305",
    "AG": "B.1.1.297",
    "AH": "B.1.1.241",
    "AJ": "B.1.1.240",
    "AK": "B.1.1.232",
    "AL": "B.1.1.231",
    "AM": "B.1.1.216",
    "AN": "B.1.1.200",
    "AP": "B.1.1.70",
    "AQ": "B.1.1.39",
    "AS": "B.1.1.317",
    "AT": "B.1.1.370",
    "AU": "B.1.466.2",
    "AV": "B.1.1.482",
    "AW": "B.1.1.464",
    "AY": "B.1.617.2",
    "AZ": "B.1.1.318",
    "BA": "B.1.1.529",
    "BB": "B.1.621.1",
    "XA": ["B.1.1.7","B.1.177"],
    "XB": ["B.1.634","B.1.631"],
    "XC": ["AY.29","B.1.1.7"]
}


// WHO https://www.who.int/en/activities/tracking-SARS-CoV-2-variants/
// TODO: no static
const VARIANT_WHO_CONCERN = 'concern';
const VARIANT_WHO_INTEREST = 'interest';

const WHO_VARIANT_LABELS = {
    'B.1.1.7': {
      label: 'Alpha',
      type: VARIANT_WHO_CONCERN,
    },
    'B.1.351': {
      label: 'Beta',
      type: VARIANT_WHO_CONCERN,
    },
    'P.1': {
      label: 'Gamma',
      type: VARIANT_WHO_CONCERN,
    },
    'B.1.617.2': {
      label: 'Delta',
      type: VARIANT_WHO_CONCERN,
    },
    'B.1.427': {
      label: 'Epsilon',
      type: VARIANT_WHO_INTEREST
    },
    'B.1.429': {
      label: 'Epsilon',
      type: VARIANT_WHO_INTEREST
    },
    'P.2': {
      label: 'Zeta',
      type: VARIANT_WHO_INTEREST
    },
    'B.1.525': {
      label: 'Eta',
      type: VARIANT_WHO_INTEREST
    },
    'P.3': {
      label: 'Theta',
      type: VARIANT_WHO_INTEREST
    },
    'B.1.526': {
      label: 'Iota',
      type: VARIANT_WHO_INTEREST
    },
    'B.1.617.1': {
      label: 'Kappa',
      type: VARIANT_WHO_INTEREST
    },
    'B.1.621': {
      label: 'Mu',
      type: VARIANT_WHO_INTEREST
    },
    'C.37': {
      label: 'Lambda',
      type: VARIANT_WHO_INTEREST
    },
    'B.1.1.529': {
      label: 'Omicron',
      type: VARIANT_WHO_CONCERN,
    },
};

const REGION_CZECHIA = "Czech Republic";
const REGION_EUROPE = "Europe";
const REGION_WORD = "World";
const REGIONS = [REGION_CZECHIA, REGION_EUROPE, REGION_WORD];

const MONTH_DAYS_COUNT = 30;

const PAST_1_MONTH = "Past1M";
const PAST_1_MONTH_TEXT = "Poslední 1 měsíc";
const PAST_3_MONTHS = "Past3M";
const PAST_3_MONTHS_TEXT = "Poslední 3 měsíce";
const PAST_6_MONTHS = "Past6M";
const PAST_6_MONTHS_TEXT = "Poslední 6 měsíce";
const TIME_FRAMES = [PAST_1_MONTH, PAST_3_MONTHS, PAST_6_MONTHS];

const PANGOLIN_LINEAGE_DISPLAY_TRESHOLD_IN_PERCENTS = 10;


function translateMutationsToCovSpectrumOrgAdvancedSearch(mutations) {
    var variantQuery = "";

    mutations.forEach(function(mutation) {
        if(variantQuery.length) {
            variantQuery += " & ";
        }
        variantQuery += translateMutationToCovSpectrumOrgAdvancedSearch(mutation);
    });

    return variantQuery;
}

function translateMutationToCovSpectrumOrgAdvancedSearch(mutation) {
    for(var section in mutationSectionsTable) {
        for(const[i, mut] of mutationSectionsTable[section].entries()) {
            if(mut == mutation.Kod) {
                var resultString = "";

                // deletion
                //
                // input        [del][startPos]-[endPos]
                // output       [section]:[startPos]- ... (!)[endPos]-
                //
                // (!) is optional exclamation mark = when is mutation negative
                if(mutation.Kod.includes("-")) {
                    var delimeterPos = mutation.Kod.indexOf("-");
                    var startDelPos = mutation.Kod.substr(3, delimeterPos - 3);
                    var endDelPos = mutation.Kod.substr(delimeterPos + 1, mutation.Kod.length - delimeterPos + 1);
                    for(var pos = startDelPos; pos <= endDelPos; pos++) {
                        if(resultString.length) {
                            resultString += " & ";
                        }
                        if(mutation.Vysledek == "Negativní") {
                            resultString += "!";
                        }
                        resultString += section + ":" + pos + "-";
                    }
                } 
                // replace
                //
                // input       [old][pos][new]
                // output      [section]:[oldChar][pos][newChar]
                else {
                    if(mutation.Vysledek == "Negativní") {
                        resultString += "!";
                    }
                    resultString += section + ":" + mutation.Kod;
                }

                return resultString;
            }
        }
    }
}

function getDateFromFromTimeFrame(timeFrame) {
    var date = new Date();

    switch(timeFrame) {
        case PAST_1_MONTH:
            date.setDate(date.getDate() - 1 * MONTH_DAYS_COUNT);
            break;
        case PAST_3_MONTHS:
            date.setDate(date.getDate() - 3 * MONTH_DAYS_COUNT);
            break;
        case PAST_6_MONTHS:
            date.setDate(date.getDate() - 6 * MONTH_DAYS_COUNT);
            break;
        default:
            return date;
    }

    return (date).toISOString().split("T")[0];
}

function getLAPIScovSpectrumUrl() {
    return "https://lapis.cov-spectrum.org/gisaid/v1/sample/aggregated";
}

function getLAPISCovSpectrumUrlParams(region, timeFrame, mutations, fields = "") {
    var urlParams = new URLSearchParams();
    if(region != REGION_WORD) {
        if(region == REGION_EUROPE) {
            urlParams.set("region", region);    
        } else {
            urlParams.set("country", region);
        }
    }
    if(fields) {
        urlParams.set("fields", "pangoLineage");
    }
    urlParams.set("host", "Human");
    urlParams.set("dateFrom", getDateFromFromTimeFrame(timeFrame));
    var variantQuery = translateMutationsToCovSpectrumOrgAdvancedSearch(mutations);
    if(variantQuery) {
        urlParams.set("variantQuery", variantQuery);
    }
    return urlParams;
}

async function getLAPIScovSpectrumSampleAggregated(region, timeFrame, mutations = [], fields = "") {

    return new Promise(function (resolve, reject) {
        var url = getLAPIScovSpectrumUrl();
        var urlParams = getLAPISCovSpectrumUrlParams(region, timeFrame, mutations, fields);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url + "?" + urlParams.toString(), true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function() {
            if(xhr.readyState === XMLHttpRequest.DONE) {
                if(xhr.status == 200) {
                    var responseJson = JSON.parse(xhr.response);
                    resolve(responseJson.data);
                } else {
                    resolve(null);
                }
            }
        }
        xhr.send();
    });
}

async function getPangolinLineageWHOLabel(pangolinLineageAlias) {
    var pangolinLineage = VARIANT_ALIASES[pangolinLineageAlias.split(".")[0]];
    if(!pangolinLineage) {
        pangolinLineage = pangolinLineageAlias;
    }
    var label = "";
    for(var lineage in WHO_VARIANT_LABELS) {
        if(lineage == pangolinLineage) {
            label = WHO_VARIANT_LABELS[lineage].label;
        }
    }
    return label;
}

async function getPangolinLineagesToWhichBelongThisCombinationOfMutations(region, timeFrame, mutations) {
    var pangoLineages = await getLAPIScovSpectrumSampleAggregated(region, timeFrame, mutations, "pangoLineage");
    pangoLineages.sort(function(a, b) {
        return b.count - a.count;
    });
    return pangoLineages;
}

async function getProportionAmongAllSequencedSamplesInTheSelectedTimeFrame(region, timeFrame, mutations) {
    var withMutations = await getLAPIScovSpectrumSampleAggregated(region, timeFrame, mutations);
    var overall = await getLAPIScovSpectrumSampleAggregated(region, timeFrame);
    var percents = Math.round((withMutations[0].count / overall[0].count) * 100);
    return percents;
}

function translateTimeFrame(timeFrame) {
    switch(timeFrame) {
        case PAST_1_MONTH:
            return PAST_1_MONTH_TEXT;
        case PAST_3_MONTHS:
            return PAST_3_MONTHS_TEXT;
        case PAST_6_MONTHS:
            return PAST_6_MONTHS_TEXT;
    }
}

async function addAdditionalMutationInformation(regions, timeFrames) {

    var headersWithMutationsNodes = document.evaluate("//th[contains(text(), 'Kód mutace')]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    for (i = 0; i < headersWithMutationsNodes.snapshotLength; i++) {

        // mutations
        var mutationRow = headersWithMutationsNodes.snapshotItem(i).parentNode.nextSibling;

        var mutations = [];
        while(mutationRow) {
            mutations.push({
                'Kod': mutationRow.childNodes[0].innerText,
                'Vysledek': mutationRow.childNodes[1].innerText 
            });
            mutationRow = mutationRow.nextSibling;
        }

        // data
        var data = {};
        for(const [x, region] of regions.entries()) {
            data[region] = [];
            for(const [y, timeFrame] of timeFrames.entries()) {
                var value = await getProportionAmongAllSequencedSamplesInTheSelectedTimeFrame(region, timeFrame, mutations);
                data[region].push(value);
            }
        }

        // region table
        var tableRegionsHeaders = ["Oblast"].concat(timeFrames.map(function(timeFrame) {
            return translateTimeFrame(timeFrame); 
        }));
        var tableRegionsRows = Object.keys(data).map(function(region) {
            return [region].concat(data[region].map(function(value) {
                return value + "%";
            }));
        });
        var tableRegions = getTable(
            "Počet celogenomově sekvenovaných vzorků obsahujících tyto mutace",
            tableRegionsHeaders,
            tableRegionsRows
        );
        headersWithMutationsNodes.snapshotItem(i).parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.insertBefore(
            tableRegions,
            headersWithMutationsNodes.snapshotItem(i).parentNode.parentNode.parentNode.parentNode.parentNode.nextSibling
        );

        // classification table    
        var tableClassificationRows = [];
        var withMutations = await getLAPIScovSpectrumSampleAggregated(REGION_CZECHIA, PAST_1_MONTH, mutations);
        var pangolinLineages = await getPangolinLineagesToWhichBelongThisCombinationOfMutations(REGION_CZECHIA, PAST_1_MONTH, mutations);
        for(const [i, pangolin] of pangolinLineages.entries()) {

            var percents = Math.round((pangolin.count / withMutations[0].count) * 100);
            if(percents < PANGOLIN_LINEAGE_DISPLAY_TRESHOLD_IN_PERCENTS) {
                break;
            }

            var pangoLineageWHOName = await getPangolinLineageWHOLabel(pangolin.pangoLineage);

            var pangoLineageRow = [
                pangolin.pangoLineage,
                pangoLineageWHOName,
                percents + "%"
            ];

            tableClassificationRows.push(pangoLineageRow);
        }

        var tableClassification = getTable(
            "Odhad varianty podle dat pro Česká Republika za poslední 1 měsíc",
            ["Kód varianty", "Název varianty dle WHO", "Klasifikace v %"],
            tableClassificationRows
        );

        headersWithMutationsNodes.snapshotItem(i).parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.insertBefore(
            tableClassification,
            headersWithMutationsNodes.snapshotItem(i).parentNode.parentNode.parentNode.parentNode.parentNode.nextSibling
        );
    }
}

var accordionZadankyActions = document.querySelector('#accordionZadanky > div > .actions');

if(accordionZadankyActions) {
    addAdditionalMutationInformation(REGIONS, TIME_FRAMES);
}

function getTable(captionText, headers, rows) {
    var trElement = document.createElement("tr");
    var tdElement = document.createElement("td");
    tdElement.setAttribute("colspan", "7");
    var tableElement = document.createElement("table");
    tableElement.setAttribute("style", "width: 80%;margin-left: 10%;margin-right: 10%; background-color: #d5f6f6;color: #000;");
    var captionElement = document.createElement("caption");
    captionElement.innerText = captionText;
    var tbodyElement = document.createElement("tbody");
    var trHeaderElement = document.createElement("tr");

    // headers
    for(const [x, header] of headers.entries()) {
        var thHeaderElement = document.createElement("th");
        thHeaderElement.setAttribute("class", "k-header");
        thHeaderElement.setAttribute("style", "background-color:#fff2eb");
        thHeaderElement.innerText = header;
        trHeaderElement.appendChild(thHeaderElement);
    }
    tbodyElement.appendChild(trHeaderElement);

    // rows
    for(const [x, row] of rows.entries()) {
        var trRowElement = document.createElement("tr");
        row.forEach(function(col) {
            var tdRowElement = document.createElement("td");
            tdRowElement.innerText = col;
            trRowElement.appendChild(tdRowElement);
        });
        tbodyElement.appendChild(trRowElement);
    }

    tableElement.appendChild(captionElement);
    tableElement.appendChild(tbodyElement);
    tdElement.appendChild(tableElement);
    trElement.appendChild(tdElement);

    return trElement;
}