/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.95408631772268, "KoPercent": 0.04591368227731864};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9855371900826446, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.95, 500, 1500, "Delete"], "isController": false}, {"data": [0.95, 500, 1500, "Post-1"], "isController": false}, {"data": [0.9855, 500, 1500, "GetAll"], "isController": false}, {"data": [0.85, 500, 1500, "Post"], "isController": false}, {"data": [0.925, 500, 1500, "Post-0"], "isController": false}, {"data": [0.975, 500, 1500, "Delete-0"], "isController": false}, {"data": [1.0, 500, 1500, "Delete-1"], "isController": false}, {"data": [0.9736842105263158, 500, 1500, "Put-0"], "isController": false}, {"data": [0.9473684210526315, 500, 1500, "Put-1"], "isController": false}, {"data": [0.996, 500, 1500, "GetById"], "isController": false}, {"data": [0.775, 500, 1500, "Put"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2178, 1, 0.04591368227731864, 145.24839302112, 1, 2100, 104.0, 297.10000000000014, 397.0, 995.21, 77.80516557710857, 900.0050305545137, 10.61143494579002], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["Delete", 20, 0, 0.0, 340.79999999999995, 203, 792, 295.5, 587.3000000000002, 782.2499999999999, 792.0, 1.1621825788831426, 22.786439417601255, 0.3884913054215817], "isController": false}, {"data": ["Post-1", 20, 0, 0.0, 260.75000000000006, 105, 794, 202.5, 583.7000000000005, 784.4999999999999, 794.0, 0.8852691218130312, 17.470578634029746, 0.10720055771954674], "isController": false}, {"data": ["GetAll", 1000, 0, 0.0, 213.12900000000008, 18, 2100, 198.0, 303.0, 400.0, 1005.9100000000001, 35.72576899717767, 706.8660183183881, 4.326167339501983], "isController": false}, {"data": ["Post", 20, 0, 0.0, 511.25000000000006, 208, 1328, 399.5, 1090.1000000000004, 1317.1499999999999, 1328.0, 0.8648274669203494, 17.164291544149442, 0.33613411311943264], "isController": false}, {"data": ["Post-0", 20, 0, 0.0, 250.4, 15, 1001, 195.0, 605.9000000000002, 981.6499999999997, 1001.0, 0.8756950829721091, 0.09834466263846929, 0.2343168483733964], "isController": false}, {"data": ["Delete-0", 20, 0, 0.0, 158.60000000000002, 2, 590, 99.5, 395.7000000000002, 580.7999999999998, 590.0, 1.1695906432748537, 0.13135051169590642, 0.24933753654970758], "isController": false}, {"data": ["Delete-1", 20, 0, 0.0, 181.94999999999996, 94, 309, 198.0, 285.20000000000016, 308.25, 309.0, 1.2034418436729044, 23.460240819995185, 0.1457292857572658], "isController": false}, {"data": ["Put-0", 19, 0, 0.0, 196.36842105263156, 7, 990, 188.0, 297.0, 990.0, 990.0, 1.0989646596101568, 0.12341888267106252, 0.326085679478281], "isController": false}, {"data": ["Put-1", 19, 0, 0.0, 337.84210526315786, 112, 1216, 288.0, 917.0, 1216.0, 1216.0, 1.0980120203421175, 21.763110678889277, 0.1329623930883033], "isController": false}, {"data": ["GetById", 1000, 0, 0.0, 48.442999999999934, 1, 1198, 5.0, 95.0, 101.0, 316.99, 36.69186174506495, 112.72714555661554, 4.801474095545608], "isController": false}, {"data": ["Put", 20, 1, 5.0, 527.6999999999999, 203, 1411, 397.0, 1105.6, 1395.7499999999998, 1411.0, 1.1433144686446006, 21.655481388984168, 0.4708356556908478], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["404\/Not Found", 1, 100.0, 0.04591368227731864], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2178, 1, "404\/Not Found", 1, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Put", 20, 1, "404\/Not Found", 1, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
