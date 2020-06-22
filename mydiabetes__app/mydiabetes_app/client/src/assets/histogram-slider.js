const e = require("express");

function Slider(histogram, legendColors, date, customOptions) {

    // let sliderWidth = 0;

    // if (window.screen.width <= 480 && window.screen.width >= 320) {

    //   sliderWidth = 300;

    // } else if (window.screen.width <= 767 && window.screen.width >= 481) {

    //   sliderWidth = 360;

    // } else if (window.screen.width <= 1024 && window.screen.width >= 768) {

    //   sliderWidth = 360;

    // } else if (window.screen.width <= 1280 && window.screen.width >= 1025) {

    //   sliderWidth = 500;

    // } else if (window.screen.width >= 1281) {

    //   sliderWidth = 650;

    // }

    let style = `<style> #brush-slider svg { font-family: -apple-system, system-ui, "avenir next", avenir, helvetica, "helvetica neue", ubuntu, roboto, noto, "segoe ui", arial, sans-serif; } #brush-slider rect.overlay { stroke: #888; } #brush-slider rect.selection { stroke: none; fill: steelblue; fill-opacity: 0.4; } #labelleft, #labelright, #label-max, #label-min { font-size: 12px; } #brush-slider #labelleft, #brush-slider #labelright { dominant-baseline: hanging; } #brush-slider #label-min, #brush-slider #label-max { dominant-baseline: central; text-anchor: end; } </style>`;

    const defaultOptions = {
        'w': 400, // 400
        'h': 150,
        'margin': {
          top: 20,
          bottom: 20,
          left: 50,
          right: 30,
        },
        bucketSize: 1,
        defaultRange: [0, 100],
        format: d3v4.timeFormat("%d-%b-%y")
      };

      const [ min, max ] = d3v4.extent(Object.keys(histogram).map(d => +d));
    //   const [ min_val, max_val ] = d3.extent(Object.values(histogram).map(d => +d));
      const range = [min, max + 1]
    
      // set width and height of svg
      const { w, h, margin, defaultRange, bucketSize, format } = {...defaultOptions, ...customOptions};
    
      // dimensions of slider bar
      const width = w - margin.left - margin.right;
      const height = h - margin.top - margin.bottom;

    // create x scale
    const x = d3v4.scaleTime()
    .domain([date[0], date[1]])  // data space
    .range([0, width]);  // display space
    const y = d3v4.scaleLinear()
    .domain([0, d3v4.max(Object.keys(histogram))])
    .range([0, height]);

    // create svg and translated g
    var svg = d3v4.select('#brush-slider').append('svg')
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    var groups = svg.selectAll(".groups")
    .data(d3v4.range(range[0], range[1]+1))
    .enter()
    .append("g").attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr("class", "gbar")

    let counter = 0; //1295
    let hist1 = 0;      // 0

    if (window.location.href.includes('report')) {

      counter = 15840;

    } else if (window.location.href.includes('service')) {
      counter = 1300;
    }


    groups.append('rect')
    .attr('x', function(d) { let sum = x(d) + counter; counter+=8; return sum; })
    .attr('y', function(d) { hist1 = y(histogram[d]) || 0; if(hist1 > 110)  return height -  110 ; else return height - hist1;})
    .attr('width', (width - 170)  / (range[1] - range[0]))
    .attr('height', function(d) { let hist1 =  y(histogram[d]) || 0; if(hist1 > 110)  return 110 ; else return hist1;})
    .style('fill', function(d, i) { return legendColors[i]})
    .attr("id", function(d, i){   
      return 'rect-'+i;        // slug = label downcased, this works
    });


    counter = 15843;

    if (window.location.href.includes('report')) {
      counter = 15843;
    } else if (window.location.href.includes('service')) {
      counter = 1303;
    }

    hist1 = 0;

    groups.append('text')
    .style('fill', 'black')
    .attr('writing-mode', 'vertical-rl')
    .attr('font-size', 7)
    .attr('x', function(d) { let sum = x(d) + counter; counter+=8; return sum; })
    .attr('y', '30%')
    .text(function(d, i)  {

      let id = 'rect-'+i;
      let height = document.getElementById(id).getAttribute('height');
      let lang = localStorage.getItem('lang');

      if(height > 0) {

        if (legendColors[i] === '#1F77B4') {
          return (lang === 'sv')? 'Före Måltid' : 'Before Meal';
          } else if(legendColors[i] === '#008000') {
            return (lang === 'sv')? 'Någon annan tid' :  'Any other time';
          } else {
            return (lang === 'sv')? 'Efter Måltid' : 'After Meal';
          }

      } else {
        return '';
      }

    });


    // labels
    var labelMax = g.append('text')
    .attr('id', 'label-min')
    .attr('x', '-0.6em')
    .attr('y', height)
    .text(min);

    var labelMax = g.append('text')
    .attr('id', 'label-max')
    .attr('x', '-0.6em')
    .attr('y', 0)
    .text(max);

    var labelL = g.append('text')
    .attr('id', 'labelleft')
    .attr('x', 0)
    .attr('y', height + 5);

    var labelR = g.append('text')
    .attr('id', 'labelright')
    .attr('x', 0)
    .attr('y', height + 5);

    // define brush
    var brush = d3v4.brushX()
    .extent([[0, 0], [width, height]])
    .on('brush', function() {
        var s = d3v4.event.selection;
        // update and move labels
        labelL.attr('x', s[0]).text(format(Math.round(x.invert(s[0])) * bucketSize));
        labelR.attr('x',300).text(format((Math.round(x.invert(s[1])) - 1) * bucketSize));
        // move brush handles      
        handle
        .attr("display", null)
        .attr("transform", (d, i) => "translate(" + [ s[i], - height / 4] + ")");
        // update view
        // if the view should only be updated after brushing is over, 
        // move these two lines into the on('end') part below
        svg.node().value = s.map(d => bucketSize * Math.round(x.invert(d)));
        svg.node().dispatchEvent(new CustomEvent("input"));
    })
    .on('end', function() {
        if (!d3v4.event.sourceEvent) return;
        var d0 = d3v4.event.selection.map(x.invert);
        var d1 = d0.map(Math.round)

        let start_date = formatDate(d1[0])
        let end_date = formatDate(d1[1])

        localStorage.setItem('startDate', start_date);
        localStorage.setItem('endDate', end_date);

        setTimeout(() => {
          let button = document.getElementById('insulin-chart-slider-clicker');
          button.click();
        }, 2000);


        d3v4.select(this).transition().call(d3v4.event.target.move, d1.map(x))
    });

    // append brush to g
  var gBrush = g.append("g")
  .attr("class", "brush")
  .call(brush);

    // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
    var brushResizePath = function(d) {
    var e = +(d.type == "e"),
        x = e ? 1 : -1,
        y = height / 2;
    return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) +
        "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) +
        "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
    }

    var handle = gBrush.selectAll(".handle--custom")
    .data([{type: "w"}, {type: "e"}])
    .enter().append("path")
    .attr("class", "handle--custom")
    .attr("stroke", "#888")
    .attr("fill", '#eee')
    .attr("cursor", "ew-resize")
    .attr("d", brushResizePath);

    // override default behaviour - clicking outside of the selected area 
    // will select a small piece there rather than deselecting everything
    // https://bl.ocks.org/mbostock/6498000
    gBrush.selectAll(".overlay")
    .each(function(d) { d.type = "selection"; })
    .on("mousedown touchstart", brushcentered);

    function brushcentered() {
        var dx = x(1) - x(0), // Use a fixed width when recentering.
        cx = d3v4.mouse(this)[0],
        x0 = cx - dx / 2,
        x1 = cx + dx / 2;
        d3v4.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
      }
      
      // select entire range
      //  gBrush.call(brush.move, range.map(x))
      
      // select default range
      gBrush.call(brush.move, defaultRange
            .map(d => width * (d / 100))
            .map(x.invert)
            .map(Math.round)
            .map(x));
      
      svg.append('style').text(style);
      return svg.node();
}

function formatDate(date) {
  let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}