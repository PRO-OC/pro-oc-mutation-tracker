// Testing purpose: https://ereg.ksrzis.cz/Registr/CUDZadanky/PacientDetail/Index/10301493
// Testing purpose: Omicron https://ereg.ksrzis.cz/Registr/CUDZadanky/PacientDetail/Index/11263038

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
        "Y505H",
        "K417T",
        "P681R"
    ]
};

function translateRegion(oldRegion) {
    switch(oldRegion) {
        case REGION_CZECH_REPUBLIC:
            return REGION_CZECHIA;
        default:
            return oldRegion;
    }
}

const REGION_CZECHIA = "Czechia";
const REGION_CZECH_REPUBLIC = "Czech Republic";
const REGION_EUROPE = "Europe";
const REGION_WORD = "World";
const REGIONS = [REGION_CZECH_REPUBLIC, REGION_EUROPE, REGION_WORD];

const MONTH_DAYS_AVERAGE_COUNT = 30;

const ALL_TIMES = "AllTimes";
const PAST_1_MONTH = "Past1M";
const PAST_1_MONTH_TEXT = "Poslední 1 měsíc";
const PAST_3_MONTHS = "Past3M";
const PAST_3_MONTHS_TEXT = "Poslední 3 měsíce";
const PAST_6_MONTHS = "Past6M";
const PAST_6_MONTHS_TEXT = "Poslední 6 měsíce";
const TIME_FRAMES = [PAST_1_MONTH, PAST_3_MONTHS, PAST_6_MONTHS];

const PANGOLIN_LINEAGE_DISPLAY_TRESHOLD_IN_PERCENTS = 10;

const LINEAGE_LABEL_WHO = "WHO";
const LINEAGE_LABEL_WHO_TEXT = "Název varianty dle WHO";
const LINEAGE_LABEL_PHE = "PHE";
const LINEAGE_LABEL_PHE_TEXT = "Název varianty dle PHE";
const LINEAGE_LABEL_NEXTSTRAIN = "Nextstrain";
const LINEAGE_LABEL_NEXTSTRAIN_TEXT = "Název varianty dle Nextstrain";

const STATS_OVERALL_COUNT = "overallCount";
const STATS_MUTATIONS_SPECIFIED_COUNT = "mutationSpecifiedCount";
const STATS_PRECALCULATED_PERCENTS = "percents";

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
            date.setDate(date.getDate() - 1 * MONTH_DAYS_AVERAGE_COUNT);
            break;
        case PAST_3_MONTHS:
            date.setDate(date.getDate() - 3 * MONTH_DAYS_AVERAGE_COUNT);
            break;
        case PAST_6_MONTHS:
            date.setDate(date.getDate() - 6 * MONTH_DAYS_AVERAGE_COUNT);
            break;
        default:
            return date;
    }

    return (date).toISOString().split("T")[0];
}

function getLAPIScovSpectrumUrl() {
    return "https://lapis.cov-spectrum.org/gisaid/v1/sample/aggregated";
}

function getCovSpectrumUrl(region, timeFrame, mutations) {
    
    // params
    var urlParams = new URLSearchParams();
    var variantQuery = translateMutationsToCovSpectrumOrgAdvancedSearch(mutations);
    if(variantQuery) {
        urlParams.set("variantQuery", variantQuery);
    }

    var url = "https://cov-spectrum.org/explore/" + region + "/AllSamples/" + timeFrame + "/variants?" + urlParams.toString();

    return url;
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

// repository url: https://github.com/cov-lineages/lineages-website
// file: lineage.html
async function getPangolinLineageLabels(pangolinLineageAlias) {

    return new Promise(function (resolve, reject) {

        var pageName = "c" + pangolinLineageAlias + ".json";
        var directory = "https://raw.githubusercontent.com/cov-lineages/constellations/main/constellations/definitions/";

        var whoName = "";
        var pheNames = [];
        var nextStrain = "";

        $.ajax({
            type: 'HEAD',
            url: directory + pageName,
            success: function() {

                d3.json(directory + pageName, function(json) {

                    if(json["variant"]["WHO_label"]) {
                        whoName = json["variant"]["WHO_label"];
                    }

                    d3.text("https://raw.githubusercontent.com/phe-genomics/variant_definitions/main/README.md", function(text) {

                        var lines = text.split("\n");

                        for(var line of lines) {

                            if(line.indexOf(pangolinLineageAlias) > 0) {
                                var split = line.split(">");

                                pheNames.push(split[1].split("<")[0]);

                                if(line.indexOf("nextstrain:") > 0) {
                                    split = line.split("nextstrain:");
                                    var split2 = split[1].split(">");
                                    if(split2[1].split("<")[0]) {
                                        nextStrain = split2[1].split("<")[0];
                                    }
                                }
                            }
                        }

                        resolve({
                            [LINEAGE_LABEL_PHE]: pheNames.length ? pheNames.join(", ") : "",
                            [LINEAGE_LABEL_WHO]: whoName,
                            [LINEAGE_LABEL_NEXTSTRAIN]: nextStrain
                        });
                    });
                });
            },
            error: function() {
                resolve({
                    [LINEAGE_LABEL_PHE]: pheNames.length ? pheNames.join(", ") : "",
                    [LINEAGE_LABEL_WHO]: whoName,
                    [LINEAGE_LABEL_NEXTSTRAIN]: nextStrain,
                });
            }
        });
    });
}

async function getPangolinLineagesToWhichBelongThisCombinationOfMutations(region, timeFrame, mutations) {
    var pangoLineages = await getLAPIScovSpectrumSampleAggregated(region, timeFrame, mutations, "pangoLineage");
    pangoLineages.sort(function(a, b) {
        return b.count - a.count;
    });
    return pangoLineages;
}

async function getStatsOfAllSequencedSamplesInTheSelectedTimeFrameAndSpecifiedMutations(region, timeFrame, mutations) {
    
    var withMutations = await getLAPIScovSpectrumSampleAggregated(region, timeFrame, mutations);
    var withMutationsCount = withMutations[0].count;
    var overall = await getLAPIScovSpectrumSampleAggregated(region, timeFrame);
    var overallCount = overall[0].count;
    var percents = Math.round((withMutations[0].count / overall[0].count) * 100);

    var result = {
        [STATS_OVERALL_COUNT]: overallCount,
        [STATS_MUTATIONS_SPECIFIED_COUNT]: withMutationsCount,
        [STATS_PRECALCULATED_PERCENTS]: percents,
    }

    return result;
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

function getCovLineagesLineageUrl(lineageName) {
    return "https://cov-lineages.org/lineage.html?lineage=" + lineageName;
}

function getNextstrainTrackingVariantsUrl() {
    return "https://covariants.org/";
}

function getPHETrackingVariantsUrl() {
    return "https://github.com/phe-genomics/variant_definitions/blob/main/README.md";
}

function getWHOTrackingVariantsUrl() {
    return "https://www.who.int/en/activities/tracking-SARS-CoV-2-variants#PageContent_C238_Col01";
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
                // returns format 10 (char `%` for percents is not included) 
                var stats = await getStatsOfAllSequencedSamplesInTheSelectedTimeFrameAndSpecifiedMutations(region, timeFrame, mutations);
                data[region][timeFrame] = stats;
            }
        }

        // region table
        var tableRegionsHeaders = ["Oblast"].concat(timeFrames.map(function(timeFrame) {
            return translateTimeFrame(timeFrame); 
        }));
        var tableRegionsRows = Object.keys(data).map(function(region) {
            return [region].concat(Object.keys(data[region]).map(function(timeFrame) {
                const stats = data[region][timeFrame];
                // timeFrame 1 month is not supported
                if(timeFrame == PAST_1_MONTH) {
                    return stats[STATS_PRECALCULATED_PERCENTS] + "%" + " <sup>" + stats[STATS_MUTATIONS_SPECIFIED_COUNT] + "/" + stats[STATS_OVERALL_COUNT] + "</sup>";
                } else {
                    return "<a href='" + getCovSpectrumUrl(translateRegion(region), timeFrame, mutations) + "'>" + stats[STATS_PRECALCULATED_PERCENTS] + "%" + "</a><sup>" + stats[STATS_MUTATIONS_SPECIFIED_COUNT] + "/" + stats[STATS_OVERALL_COUNT] + "</sup>";
                }
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
        var withMutations = await getLAPIScovSpectrumSampleAggregated(REGION_CZECH_REPUBLIC, PAST_1_MONTH, mutations);
        var pangolinLineages = await getPangolinLineagesToWhichBelongThisCombinationOfMutations(REGION_CZECH_REPUBLIC, PAST_1_MONTH, mutations);
        for(const [i, pangolin] of pangolinLineages.entries()) {

            var percents = Math.round((pangolin.count / withMutations[0].count) * 100);
            if(percents < PANGOLIN_LINEAGE_DISPLAY_TRESHOLD_IN_PERCENTS) {
                break;
            }

            var pangoLineageLabels = await getPangolinLineageLabels(pangolin.pangoLineage);

            // Why data (variable pangolinLineages) are from past 1 month and link is since ages up to now?
            //
            // Because timeFrame in UI (no) does not support atm custom time frame range and API (yes) supports.
            var pangoLineageRow = [
                "<a href='" + getCovLineagesLineageUrl(pangolin.pangoLineage) + "'>" + pangolin.pangoLineage + "</a>",
                "<a href='" + getWHOTrackingVariantsUrl() + "'>" + pangoLineageLabels[LINEAGE_LABEL_WHO] + "</a>",
                "<a href='" + getPHETrackingVariantsUrl() + "'>" + pangoLineageLabels[LINEAGE_LABEL_PHE] + "</a>",
                "<a href='" + getNextstrainTrackingVariantsUrl() + "'>" + pangoLineageLabels[LINEAGE_LABEL_NEXTSTRAIN] + "</a>",
                "<a href='" + getCovSpectrumUrl(REGION_CZECHIA, ALL_TIMES, mutations) + "'>" + percents + "%" + "</a>"
            ];

            tableClassificationRows.push(pangoLineageRow);
        }

        var tableClassification = getTable(
            "Klasifikace varianty podle celogenomově sekvenovaných vzorků v České Republice za poslední 1 měsíc [ > 10%]",
            ["Kód varianty", LINEAGE_LABEL_WHO_TEXT, LINEAGE_LABEL_PHE_TEXT, LINEAGE_LABEL_NEXTSTRAIN_TEXT, "Klasifikace v %"],
            tableClassificationRows
        );

        headersWithMutationsNodes.snapshotItem(i).parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.insertBefore(
            tableClassification,
            headersWithMutationsNodes.snapshotItem(i).parentNode.parentNode.parentNode.parentNode.parentNode.nextSibling
        );
    }
}

var accordionZadankyActions = document.querySelector('#accordionZadanky');

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
    captionElement.innerHTML = captionText;
    var tbodyElement = document.createElement("tbody");
    var trHeaderElement = document.createElement("tr");

    // headers
    for(const [x, header] of headers.entries()) {
        var thHeaderElement = document.createElement("th");
        thHeaderElement.setAttribute("class", "k-header");
        thHeaderElement.setAttribute("style", "background-color:#fff2eb");
        thHeaderElement.innerHTML = header;
        trHeaderElement.appendChild(thHeaderElement);
    }
    tbodyElement.appendChild(trHeaderElement);

    // rows
    for(const [x, row] of rows.entries()) {
        var trRowElement = document.createElement("tr");
        row.forEach(function(col) {
            var tdRowElement = document.createElement("td");
            tdRowElement.innerHTML = col;
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