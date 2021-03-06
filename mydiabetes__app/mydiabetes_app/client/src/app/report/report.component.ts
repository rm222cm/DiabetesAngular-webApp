import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  NgZone
} from '@angular/core';
import { InsulinDosagesService } from '../services/insulin-dosages.service';
import { single, multi1, multi, linear } from '../data/data.model';
import * as Jquery from 'jquery';
import { Options, LabelType, ChangeContext } from 'ng5-slider';

import { DatePipe } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
declare var makeDistroChart: any;
declare var makeDistroChartBox: any;
declare var makeDistroCrabsChart: any;
declare var Slider: any;
declare var ActivitySlider: any;
declare var CarbsSlider: any;
declare var GlucoseSlider: any;
declare var d3: any;


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe],
})
export class ReportComponent implements OnInit {

  @ViewChild('dataContainer') dataContainer: ElementRef;
  @ViewChild('sliderButton') sliderButton: ElementRef;
  islanguageEnglish = true;
  constructor(
    private insulinService: InsulinDosagesService,
    private translate: TranslateService,
    private http: HttpClient,
    private datePipe: DatePipe,
    private ngZone: NgZone
  ) {
    Object.assign(this, { single });
    Object.assign(this, { linear });
    translate.onLangChange.subscribe(result => {
      this.islanguageEnglish = (result.lang === 'sv') ? false : true;
      localStorage.setItem('lang', result.lang);

      const insulinSlider = document.querySelector('#brush-slider');
      const activitySlider = document.querySelector('#acitivity-slider');
      const carbsSlider = document.querySelector('#carbs-slider');
      const glucoseSlider = document.querySelector('#glucose-slider');
      insulinSlider.innerHTML = '';
      activitySlider.innerHTML = '';
      carbsSlider.innerHTML = '';
      glucoseSlider.innerHTML = '';
      this.getReportData();
    });
  }

  single: any[];
  multi: any;
  linear: any;
  multi1: any[];
  insilinArray: any[] = [];
  activityobj: any;
  carbsobj: any;
  golucoseobj: any;

  view: any[] = [1024, 480];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Time/Date';
  xAxisLabel1 = 'Time/Date';
  showYAxisLabel = true;
  yAxisLabel = 'Dosage Unit';
  yAxisLabel1 = 'Duration';
  yAxisLabelGlucose = (this.islanguageEnglish) ? 'Glucose Level' : 'Glukosnivån';

  legend = true;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  timeline = true;

  colorScheme = {
    domain: ['#9ecae6', '#c6aed0', '#d29494', '#d59c9c'],
  };

  colorScheme1 = {
    domain: ['#3CB371', '#64c12abf', '#c12abcbf', '#432aa9bf'],
  };
  colorSchemeCarbs = {
    domain: ['#ffdb58', '#64c12abf', '#c12abcbf', '#432aa9bf'],
  };
  colorSchemeGlucose = {
    domain: ['slateblue', '#64c12abf', '#c12abcbf', '#432aa9bf'],
  };
  glucoseType = ['', 'Before Meal', 'After Meal', 'Any other time'];
  insulinType = ['Before Meal1', 'After Meal', 'Any other time'];
  carbsType = ['', 'Carbohydrates', 'Protein', 'Fibers'];
  startDate = new Date(new Date().setDate(new Date().getDate() - 365))
    .toISOString()
    .substring(0, 10);
  endDate = new Date().toISOString().substring(0, 10);
  reportData: any[] = [];
  isLoading = true;
  autoScale = true;
  objectKeys = Object.keys;
  groupedReport: any;
  showInsulin = true;
  showActivity = true;
  showCarbs = true;
  showGlucose = true;
  htmlData = false;
  legendsarray: any = ['1', '2', '3'];
  legendsactivity: any = ['walking', 'jogging', 'running', 'lifting_weight'];
  legendscarbs: any = ['1', '2', '3'];
  slider: any;

  dateRange: Date[] = this.createDateRange();
  value: number = new Date(this.startDate).getTime();
  maxValue: number = new Date(this.endDate).getTime();

  options: Options = {
    stepsArray: this.dateRange.map((date: Date) => {
      return { value: date.getTime() };
    }),
    translate: (value: number, label: LabelType): string => {
      return new Date(value).toDateString();
    },
  };

  createDateRange(): Date[] {
    const dates: Date[] = [];
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    for (
      let new_date = startDate;
      new_date <= endDate;
      new Date(new_date.getDate() + 1)
    ) {
      new_date = new Date(new_date.setDate(new_date.getDate() + 1));

      dates.push(new_date);
    }

    return dates;
  }

  ngOnInit() {
    window['angularComponentReference'] = { component: this, zone: this.ngZone, loadAngularFunction: () => this.insulinSliderEnd() };
    window['angularActivityReference'] = { component: this, zone: this.ngZone, loadAngularFunction: () => this.activitySliderEnd() };
    window['angularCarbsReference'] = { component: this, zone: this.ngZone, loadAngularFunction: () => this.carbsSliderEnd() };
    window['angularGlucoseReference'] = { component: this, zone: this.ngZone, loadAngularFunction: () => this.glucoseSliderEnd() };
    this.getReportData();
    this.drawRectanleWithText();
  }

  onUserChange(changeContext: ChangeContext): void {
    const lowDate = new Date(changeContext.value);
    let lowDateString = `${lowDate.getFullYear()}`;

    if (lowDate.getMonth() + 1 < 10) {
      lowDateString += `-0${lowDate.getMonth() + 1}`;
    } else {
      lowDateString += `-${lowDate.getMonth() + 1}`;
    }

    if (lowDate.getDate() < 10) {
      lowDateString += `-0${lowDate.getDate()}`;
    } else {
      lowDateString += `-${lowDate.getDate()}`;
    }

    const highDate = new Date(changeContext.highValue);
    let highDateString = `${highDate.getFullYear()}`;

    if (highDate.getMonth() + 1 < 10) {
      highDateString += `-0${highDate.getMonth() + 1}`;
    } else {
      highDateString += `-${highDate.getMonth() + 1}`;
    }

    if (highDate.getDate() < 10) {
      highDateString += `-0${highDate.getDate()}`;
    } else {
      highDateString += `-${highDate.getDate()}`;
    }

    this.startDate = lowDateString;
    this.endDate = highDateString;

    this.getReportData();
  }

  zeroPad(num, places) {
    let zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join('0') + num;
  }

  formatDT(__dt) {
    let year = __dt.getFullYear();
    let month = this.zeroPad(__dt.getMonth() + 1, 2);
    let date = this.zeroPad(__dt.getDate(), 2);
    let hours = this.zeroPad(__dt.getHours(), 2);
    let minutes = this.zeroPad(__dt.getMinutes(), 2);
    let seconds = this.zeroPad(__dt.getSeconds(), 2);
    return (
      year +
      '-' +
      month +
      '-' +
      date +
      ' ' +
      hours +
      ':' +
      minutes +
      ':' +
      seconds
    );
  }

  DosageTypeChange(event, target) {
    if (event) {
      this.legendsarray.push(target);
    } else {
      const found = this.legendsarray.find((e) => e == target);
      if (found) {
        const index = this.legendsarray.indexOf(target);
        this.legendsarray.splice(index, 1);
      }
    }
    this.getInsulinReportData(this.legendsarray);
  }

  insulinSliderEnd() {

    this.setDates();
    this.getInsulinReportData(this.legendsarray);
  }

  activitySliderEnd() {

    this.setDates();
    this.getActivityReportData(this.legendsactivity);
  }

  carbsSliderEnd() {

    this.setDates();
    this.getCarbsReportData(this.legendscarbs);
  }

  glucoseSliderEnd() {

    this.setDates();
    this.getGlucoseReportData();
  }

  getGlucoseReportData() {

    const data = {
      toDate: this.startDate,
      fromDate: this.endDate
    };

    this.isLoading = true;

    this.insulinService.getGlucoseReportData(data).subscribe(response => {

      let data = response['data'];

      const obj4 = [{ name: 'Glucose', series: [] }];
      const glucose = this.groupedReport.glucose;
      const glucoseLabels = [];
      let count4 = 0;
      const sliderObjGlucose = {};

      for (const [key, value] of Object.entries(data)) {

        obj4[0].series[count4] = {};
          obj4[0].series[count4].date_time = new Date(value['glucoseTime']);
          if (isNaN(value['glucoseLevelUnits'])) {
            value['glucoseLevelUnits'] = 0;
          }
          if (value['glucoseLevelUnits'] > 90) {
            value['glucoseLevelUnits'] = 30;
          }
          obj4[0].series[count4].total_km = value['glucoseLevelUnits'];
          obj4[0].series[count4].name = new Date(
            value['glucoseTime']
          ).getFullYear();
          obj4[0].series[count4].glucoseType = this.glucoseType[
            value['glucoseType']
          ];
          obj4[0].series[count4].glucoseLevelUnits = value['glucoseLevelUnits'];

          sliderObjGlucose[count4 + 1] = parseFloat(obj4[0].series[count4].glucoseLevelUnits);
          glucoseLabels.push(`${value['glucoseLevelUnits']} mmol/L`);
          count4++;
          this.golucoseobj = obj4;

      }

      const glucoseSlider = document.querySelector('#glucose-slider');

      if (!glucoseSlider.getElementsByTagName('svg').length) {
        const dates1 = [new Date(this.startDate), new Date(this.endDate)];
        GlucoseSlider(sliderObjGlucose, glucoseLabels, dates1, {});
      }
      this.isLoading = false;

      this.golucoseobj[0].series = this.golucoseobj[0].series.filter((v, i) =>   i % 2 === 1 );
      this.golucoseobj[0].series = this.golucoseobj[0].series.slice(0, 10);
      console.log(this.golucoseobj[0].series);

      if (this.golucoseobj[0].series.length <= 10) {
        this.drawGolucoseLineChart123(this.golucoseobj[0].series);
      }

    },
      (error) => {});

  }

  setDates() {

    this.startDate = localStorage.getItem('startDate');
    this.endDate = localStorage.getItem('endDate');

    localStorage.removeItem('startDate');
    localStorage.removeItem('endDate');

  }

  activitiesTypeChange(event, target) {
    if (event) {
      this.legendsactivity.push(target);
    } else {
      const found = this.legendsactivity.find((e) => e == target);
      if (found) {
        const index = this.legendsactivity.indexOf(target);
        this.legendsactivity.splice(index, 1);
      }
    }
    this.getActivityReportData(this.legendsactivity);
  }

  carbsTypeChange(event, target) {
    if (event) {
      this.legendscarbs.push(target);
    } else {
      const found = this.legendscarbs.find((e) => e == target);
      if (found) {
        const index = this.legendscarbs.indexOf(target);
        this.legendscarbs.splice(index, 1);
      }
    }

    this.getCarbsReportData(this.legendscarbs);
  }

  getCarbsReportData(query) {
    const data = {
      toDate: this.startDate,
      fromDate: this.endDate,
      carbsType: query,
    };
    this.isLoading = true;

    this.insulinService.getCarbsReportData(data).subscribe((res: any) => {
      let count3 = 0;
      const obj3 = [{ name: 'Crabs', series: [] }];
      const objcrabscatter = [];

      for (const [key, value] of Object.entries(res.data)) {
        obj3[0].series[count3] = {};
        objcrabscatter[count3] = {};
        obj3[0].series[count3].name = new Date(value['carbsTime']);
        obj3[0].series[count3].value = 5;
        obj3[0].series[count3].carbsTime = new Date(value['carbsTime']);
        obj3[0].series[count3].carbsType = this.carbsType[value['carbsType']];
        obj3[0].series[count3].carbsItem = value['carbsItem'];
        this.carbsobj = obj3;

        objcrabscatter[count3].carabsTime =  value['carbsTime'] ;
        objcrabscatter[count3].carbsType = value['carbsType'];
        objcrabscatter[count3].carbsItem = obj3[0].series[count3].carbsItem;
        objcrabscatter[count3].time = new Date(value['carbsTime']).getHours();
        objcrabscatter[count3].tooltipTime = new Date(value['carbsTime']);
        count3++;

        if (count3 === res.data.length) {
          this.carbsScatterPlot(objcrabscatter);
        }
      }

    });
  }

  onResize(event) {
    if (this.golucoseobj) {
      this.drawGolucoseLineChart123(this.golucoseobj[0].series);
    }
  }

  drawGolucoseLineChart123(lineData) {

    let node = document.querySelector('#chartArea');
    node.innerHTML = '';

    const glucoseLabel = (this.islanguageEnglish) ? 'Glucose Level' : 'Glukosnivån';

    let margin = { top: 50, right: 10, bottom: 60, left: 50 };
    let width, height;

    if (window.matchMedia('(max-width: 767px)')['matches']) {

      width = 390 - margin.left - margin.right,
      height = 310 - margin.top - margin.bottom;

    } else {
      width = 590 - margin.left - margin.right,
      height = 310 - margin.top - margin.bottom;

    }

    let x = d3.time.scale().range([0, width]);

    let y = d3.scale.linear().range([height, 0]);

    let xAxis = d3.svg
      .axis()
      .scale(x)
      .ticks(d3.time.hours, 24)
      .tickSize(4)
      .orient('bottom');

    let xMinorAxis = d3.svg
      .axis()
      .scale(x)
      .ticks(d3.time.hours, 12)
      .orient('bottom');

    let yAxis = d3.svg.axis().scale(y).orient('left');

    let line = d3.svg
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.total_km);
      });

    let div = d3
      .select('#chartArea')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('background-color', '#FFFFFF')
      .style('font-weight', 'bold').style('font-size', '12px');

    let svg = d3
      .select('#chartArea')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let format =  d3.time.format('%m-%d-%Y');
    let formatTime = d3.time.format('%e %b %-I:%M %p');
    let formatCount = d3.format(',');

    function make_y_axis() {
      return d3.svg.axis().scale(y).orient('left');
    }

    var data = lineData;

    var newData = [];
    data.forEach(element => {

      let currentItem = JSON.parse(JSON.stringify(element));

      currentItem.date_time = currentItem.date_time.toString().split('T')[0];
      let found = false;

      if (newData.length > 0) {

        for (let i = 0; i < newData.length; i++) {

          if (currentItem.date_time === newData[i].date_time) {
            found = true;
          }

        }

        if (found === false) {
          newData.push(currentItem);
        }

      } else {
        newData.push(currentItem);
      }
    });

    newData.forEach(element => {
      element.date_time = new Date(element.date_time);
    });

    data = newData;
    data.forEach(function (d) {
      d.date = d.date_time ;
      d.total_km = +d.total_km;
    });

    x.domain(
      d3.extent(data, function (d) {
        return d.date;
      })
    );
    y.domain(
      d3.extent(data, function (d) {
        return d.total_km;
      })
    );

    // Draw the y Grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .call(make_y_axis().tickSize(-width, 0, 0).tickFormat(''));

    svg.append('path').datum(data).attr('class', 'line').attr('d', line);

    let g = svg.selectAll().data(data).enter().append('g');

    g.append('circle')
      .attr('r', 4.5)
      .attr('cx', function (d) {
        return x(d.date);
      })
      .attr('cy', function (d) {
        return y(d.total_km);
      });

    g.append('line')
      .attr('class', 'x')
      .attr('id', 'dashedLine')

      .style('opacity', 0)
      .attr('x1', function (d) {
        return x(d.date);
      })
      .attr('y1', function (d) {
        return y(d.total_km);
      })
      .attr('x2', function (d) {
        return x(d3.min(x));
      })
      .attr('y2', function (d) {
        return y(d.total_km);
      });

    g.append('line')
      .attr('class', 'y')
      .attr('id', 'dashedLine')
      .style('opacity', 0)
      .attr('x1', function (d) {
        return x(d.date);
      })
      .attr('y1', function (d) {
        return y(d.total_km);
      })
      .attr('x2', function (d) {
        return x(d.date);
      })
      .attr('y2', height);

    g.selectAll('circle')
      .on('mouseover', function (d) {
        div.transition().duration(200).style('opacity', 0.7);
        const date = new Date(d.date);
        let day: any;
        let month: any;
        let hours: any;
        let minutes: any;
        let seconds: any;
        day = date.getDay();

        month = date.getMonth() + 1;
        let year = date.getFullYear();
        hours = date.getHours();
        minutes = date.getMinutes();
        seconds = date.getSeconds();

        if (day < 10) {
          day = '0' + day;
        }

        if (month < 10) {
          month = '0' + month;
        }

        if (Number(hours) < 10) {
          hours = '0' + hours;
        }

        if (Number(minutes) < 10) {
          minutes = '0' + minutes;
        }

        if (Number(seconds) < 10) {
          seconds = '0' + seconds;
        }

        if (window.matchMedia('(max-width: 767px)')['matches']) {

          div.html(
            'Glucose Specification Time: ' +
              d.glucoseType +
              '<br/>' +
              `${glucoseLabel}: ` +
              formatCount(d.total_km) + ' mmol/L ' +
              '<br/>' +
              'Glucose checking Time: ' +
              `${day}-${month}-${year} (${hours}:${minutes}:${seconds})`
          )
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 1740 + 'px')
          .style('width', '45%');

        } else {

          div.html(
            'Glucose Specification Time: ' +
              d.glucoseType +
              '<br/>' +
              `${glucoseLabel}: ` +
              formatCount(d.total_km) + ' mmol/L ' +
              '<br/>' +
              'Glucose checking Time: ' +
              `${day}-${month}-${year} (${hours}:${minutes}:${seconds})`
          )
          .style('left', d3.event.pageX - 670 + 'px')
          .style('top', d3.event.pageY - 700 + 'px')
          .style('width', '45%');

        }

        d3.select(this.nextElementSibling)
          .transition()
          .duration(200)
          .style('opacity', 0.7);

        d3.select(this.nextElementSibling.nextElementSibling)
          .transition()
          .duration(200)
          .style('opacity', 0.7);
      })

      .on('mouseout', function (d) {
        div.transition().duration(500).style('opacity', 0);

        d3.select(this.nextElementSibling)
          .transition()
          .duration(500)
          .style('opacity', 0);

        d3.select(this.nextElementSibling.nextElementSibling)
          .transition()
          .duration(500)
          .style('opacity', 0);
      });

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
      .selectAll('.tick text')
      .call(wrap, 35);

    svg
      .append('g')
      .attr('class', 'xMinorAxis')
      .attr('transform', 'translate(0,' + height + ')')
      .style({ stroke: 'Black', fill: 'none', 'stroke-width': '1px' })
      .call(xMinorAxis)
      .selectAll('text')
      .remove();

    svg
      .append('text') // text label for the y-axis
      .attr('y', 20 - margin.left)
      .attr('x', 50 - height / 2)
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'end')
      .style('font-size', '16px')
      .text(glucoseLabel);


    svg.append('g').attr('class', 'y axis').call(yAxis);

    // http://bl.ocks.org/mbostock/7555321
    // This code wraps label text if it has too much text
    function wrap(text, width) {
      text.each(function () {
        let text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr('y'),
          dy = parseFloat(text.attr('dy')),
          tspan = text
            .text(null)
            .append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', dy + 'em');
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(' '));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(''));
            line = [word];
            tspan = text
              .append('tspan')
              .attr('x', 0)
              .attr('y', y)
              .attr('dy', ++lineNumber * lineHeight + dy + 'em')
              .text(word);
          }
        }
      });
    }

  }

  drawRectanleWithText() {


  }

  boxPlot(this_data) {
    let chart1;

    this_data.forEach((d) => {
      d.value = +d.value;
      if (!this.islanguageEnglish) {
        d.date = (d.date === 'Before Meal') ?
                 'Före Måltid' : (d.date === 'After Meal') ?
                  'Efter Måltid' : (d.date === 'Any other time') ? 'Någon annan tid' : '';
      }
    });

    const labelChart = (this.islanguageEnglish) ? 'Dosage Units' : 'Dosering';

    document.getElementById('chart-distro1').innerHTML = '';
    chart1 = makeDistroChartBox({
      data: this_data,
      xName: 'date',
      yName: 'value',
      axisLabels: { xAxis: null, yAxis: labelChart },
      selector: '#chart-distro1',
      chartSize: { height: 240, width: 960 },
      constrainExtremes: true,
    });
    chart1.renderBoxPlot();
  }

  scatterPlot(this_data) {

    let chartarr = [];
    let walkingarr = [];
    let joggingarr = [];
    let runningarr = [];
    let liftingarr = [];
    walkingarr = this_data.filter((e) => e.date == 'walking');
    joggingarr = this_data.filter((e) => e.date == 'jogging');
    runningarr = this_data.filter((e) => e.date == 'running');
    liftingarr = this_data.filter((e) => e.date == 'lifting_weight');
    if (walkingarr.length > 0) {
    chartarr =  chartarr.concat(walkingarr);
    }
     if (joggingarr.length > 0) {
      chartarr = chartarr.concat(joggingarr);
    }
    if (runningarr.length > 0) {
      chartarr = chartarr.concat(runningarr);
    }   if (liftingarr.length > 0) {
      chartarr =  chartarr.concat(liftingarr);
    }
       let chart2;
    chartarr.forEach((d) => {
      d.value = +d.value % 60;

      if (!this.islanguageEnglish) {

        d.date = (d.date === 'walking') ? 'Vandra' :
        (d.date === 'jogging') ? 'Joggning' :
         (d.date === 'running') ? 'Spring' :
          (d.date === 'lifting_weight') ? 'Lyftvikt' : '';

      }


    });

    const activityLabel = (this.islanguageEnglish) ? 'Activity Duration' : 'Aktivitetens Varaktighet';

    document.getElementById('chart-distro2').innerHTML = '';
    chart2 = makeDistroChart({
      data: chartarr,
      xName: 'date',
      yName: 'value',
      axisLabels: { xAxis: null, yAxis: activityLabel },
      selector: '#chart-distro2',
      chartSize: { height: 240, width: 960 },
      constrainExtremes: true,
    });
    chart2.renderDataPlots();
    chart2.dataPlots.show({
      showPlot: true,
      plotType: 9,
      showBeanLines: false,
      colors: null,
    });
    this.sliderButton.nativeElement.click();
  }

  carbsScatterPlot(this_data) {

    this_data.forEach(element => {
      if (element.carbsType.includes('Protein')) {
        element.carbsType = element.carbsType + 's';
      }
      element.carabsTime = new Date(element.carabsTime);
      let formattedDate = '';

      if ((element.carabsTime.getMonth() + 1) < 10) {
        formattedDate += `0${element.carabsTime.getMonth() + 1}`;
      } else {
        formattedDate += `${element.carabsTime.getMonth() + 1}`;
      }

      if (element.carabsTime.getDate() < 10) {
        formattedDate += `-0${element.carabsTime.getDate()}-`;
      } else {
        formattedDate += `-${element.carabsTime.getDate()}-`;
      }

      formattedDate += element.carabsTime.getFullYear();
      element.carabsTime = formattedDate;


    });


    let chart3;

    document.getElementById('chart-distro3').innerHTML = '';

    const carbsLabel = (this.islanguageEnglish) ? 'Meal Time' : 'Matdags';

    chart3 = makeDistroCrabsChart({
      data: this_data,
      yName: 'carabsTime',
      xName: 'time',
      axisLabels: { xAxis: null, yAxis: carbsLabel },
      selector: '#chart-distro3',
      chartSize: { height: 240, width: 960 },
      constrainExtremes: true,
    });
    chart3.renderDataPlots();
    chart3.dataPlots.show({
      showPlot: true,
      plotType: 40,
      showBeanLines: false,
      colors: null,
    });
  }

  onSelectInsulin(event) {
    let elements = document.querySelectorAll('.legend-label-text');
    const arr = [];
    elements.forEach((el) => {
      if (el.textContent.trim() == event) {
        if (el['style'].textDecoration == 'line-through') {
          el['style'].textDecoration = '';
          if (event == 'After Meal') {
            const index = this.insilinArray.indexOf(2);
            if (index > -1) {
              this.insilinArray.splice(index, 1);
            }

            this.getInsulinReportData(this.insilinArray);
          } else if (event == 'Before Meal') {
            const index = this.insilinArray.indexOf(1);
            if (index > -1) {
              this.insilinArray.splice(index, 1);
            }

            this.getInsulinReportData(this.insilinArray);
          } else if (event == 'Any other time') {
            const index = this.insilinArray.indexOf(3);
            if (index > -1) {
              this.insilinArray.splice(index, 1);
            }

            this.getInsulinReportData(this.insilinArray);
          }
        } else {
          el['style'].textDecoration = 'line-through';
          if (event == 'After Meal') {
            const index = this.insilinArray.indexOf(2);
            if (index < 0) {
              this.insilinArray.push(2);
            }

            this.getInsulinReportData(this.insilinArray);
          } else if (event == 'Before Meal') {
            const index = this.insilinArray.indexOf(1);
            if (index < 0) {
              this.insilinArray.push(1);
            }

            this.getInsulinReportData(this.insilinArray);
          } else if (event == 'Any other time') {
            const index = this.insilinArray.indexOf(3);
            if (index < 0) {
              this.insilinArray.push(3);
            }

            this.getInsulinReportData(this.insilinArray);
          }
        }
      }
    });
  }

  onChecked(value, target) {
    if (target == 'INSULIN') {
      this.showInsulin = !this.showInsulin;
    }
    if (target == 'ACTIVITY') {
      this.showActivity = !this.showActivity;
    }
    if (target == 'CARBS') {
      this.showCarbs = !this.showCarbs;
    }
    if (target == 'GLUCOSE') {
      this.showGlucose = !this.showGlucose;
    }
  }

  previousDayData() {
    const day = new Date(this.startDate);
    this.startDate = new Date(
      new Date(this.startDate).setDate(day.getDate() - 1)
    )
      .toISOString()
      .substring(0, 10);
    this.getReportData();
  }

  nextDayData() {
    const day = new Date(this.endDate);
    this.endDate = new Date(new Date(this.endDate).setDate(day.getDate() + 1))
      .toISOString()
      .substring(0, 10);
    this.getReportData();
  }

  generateCSV() {
    this.insulinService
      .getCsvData({
        startDate: this.startDate,
        endDate: this.endDate,
      })
      .subscribe((res: any) => {
        this.insulinService.downloadFile(res.data, 'jsontocsv');
      }),
      (error) => () => console.info('OK');
  }

  generateHistoricalCSV() {
    this.insulinService.getHistoricalCsvData({}).subscribe((res: any) => {
      this.insulinService.downloadFile(res.data, 'jsontocsv');
    }),
      (error) => () => console.info('OK');
  }

  groupBy(xs, key) {
    if (xs) {
      return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    } else {
      return {};
    }
  }

  groupByCustom(xs, key) {
    if (xs) {
      return xs.reduce(function (rv, x) {
        rv[x[key]] = rv[x[key]] || [];
        return rv;
      }, {});
    } else {
      return {};
    }
  }

  getReportData() {
    const data = {
      startDate: this.startDate,
      endDate: this.endDate,
    };
    this.isLoading = true;
    this.insulinService.getReportData(data).subscribe(
      (res: any) => {
        this.reportData = this.parseData(res.data);
        this.reportData.map((elem) => {
          const myDate = elem.entryTime;
          elem['commonTime'] = myDate;
          if (elem.type == 'insulin') {
            if (elem.insulinType) {
              elem['insulinType'] = elem.insulinType;
            } else {
              elem['insulinType'] = '';
            }
            if (elem.dosageType == '1') {
              elem['name'] = 'Before Meal';
            } else if (elem.dosageType == '2') {
              elem['name'] = 'After Meal';
            } else {
              elem['name'] = 'Any other time';
            }

            elem['value'] = elem.dosageUnits;
          } else if (elem.type == 'activity') {
            elem['value'] = Math.abs(
              elem.activityDuration.hour * 60 + elem.activityDuration.minute
            );
            elem['name'] = this.datePipe.transform(elem.entryTime, 'MMM,y');
          } else if (elem.type == 'glucose') {
          } else if (elem.type == 'carbs') {
          }
          return elem;
        });

        this.groupedReport = this.groupBy(this.reportData, 'type');

        const insulin = this.groupedReport.insulin;
        const activity = this.groupedReport.activity;
        const carbs = this.groupedReport.carbs;
        const glucose = this.groupedReport.glucose;
        const obj1 = [];
        const objvoilin = [];
        const objscatter = [];
        const objcrabscatter = [];
        const obj2 = [{ name: 'Activity', series: [] }];
        const obj3 = [{ name: 'Crabs', series: [] }];
        const obj4 = [{ name: 'Glucose', series: [] }];
        let count = 0;
        const sliderObjInsulin = {};
        let insulinLegendColor = [];
        const activityLegendColor = [];
        const carbsLegendColor = [];
        const glucoseLabels = [];
        const sliderObjActivity = {};
        const sliderObjCarbs = {};
        const sliderObjGlucose = {};

        let count2 = 0;
        let count3 = 0;
        let count4 = 0;

        for (const [key, value] of Object.entries(insulin)) {
          obj1[count] = {};
          objvoilin[count] = {};
          obj1[count].name = this.datePipe.transform(
            value['dosageTime'],
            'MMM,y'
          );
          objvoilin[count].date = value['name'];
          objvoilin[count].value = value['value'];
          if (value['name'] === 'Before Meal') {
            objvoilin[count].order = 1;
          } else if (value['name'] === 'After Meal') {
            objvoilin[count].order = 2;
          } else {
            objvoilin[count].order = 3;
          }
          obj1[count].series = [
            {
              name: value['name'],
              value: value['value'],
              insulinType: value['insulinType'],
              dosageTime: value['dosageTime'],
            },
          ];

          if (Number(value['value']) <= 100) {
            sliderObjInsulin[count + 1] = +value['value'];

            switch (value['name']) {
              case 'Any other time':
                insulinLegendColor.push('#008000');
                break;
              case 'Before Meal':
                insulinLegendColor.push('#1F77B4');
                break;
              case 'After Meal':
                insulinLegendColor.push('#FF7F0E');
            }

          }

          count++;

          this.multi = obj1;
          if (count === insulin.length) {
            objvoilin.sort((a, b) =>
              a.order > b.order ? 1 : b.order > a.order ? -1 : 0
            );

            this.boxPlot(objvoilin);

            delete sliderObjInsulin[40];
            delete sliderObjInsulin[41];
            delete sliderObjInsulin[42];
            delete sliderObjInsulin[43];
            delete sliderObjInsulin[44];
            delete sliderObjInsulin[45];
            delete sliderObjInsulin[46];
            delete sliderObjInsulin[47];
            delete sliderObjInsulin[48];
            delete sliderObjInsulin[49];
            delete sliderObjInsulin[50];
            delete insulinLegendColor[40];
            delete insulinLegendColor[41];
            delete insulinLegendColor[42];
            delete insulinLegendColor[43];
            delete insulinLegendColor[44];
            delete insulinLegendColor[45];
            delete insulinLegendColor[46];
            delete insulinLegendColor[47];
            delete insulinLegendColor[48];
            delete insulinLegendColor[49];
            delete insulinLegendColor[50];

            insulinLegendColor = insulinLegendColor.filter(function (el) {
              return el != null;
            });

            const dates = [new Date(this.startDate), new Date(this.endDate)];
            Slider(sliderObjInsulin, insulinLegendColor,  dates, {});
          }
        }
        for (const [key, value] of Object.entries(activity)) {
          obj2[0].series[count2] = {};
          objscatter[count2] = {};
          obj2[0].series[count2].name = new Date(value['activityTime']);
          obj2[0].series[count2].value = value['value'];
          obj2[0].series[count2].activityTime = value['activityTime'];
          obj2[0].series[count2].activityType = value['activityType'];
          objscatter[count2].date = value['activityType'];
          objscatter[count2].value = value['value'];
          let hour_text = ' hour, ';
          let minute_text = ' minute ';
          if (value['activityDuration']['hour'] > 1) {
            hour_text = ' hours, ';
          }
          if (value['activityDuration']['minute'] > 1) {
            minute_text = ' minutes ';
          }
          obj2[0].series[count2].activityDuration =
            value['activityDuration']['hour'] +
            hour_text +
            value['activityDuration']['minute'] +
            minute_text;

          // Added activity time and duration
          objscatter[count2].activityTime = obj2[0].series[count2].activityTime;
          objscatter[count2].activityDuration =
            obj2[0].series[count2].activityDuration;

              sliderObjActivity[count2 + 1] = +value['activityDuration']['hour'];

              switch (value['activityType']) {
                case 'walking':
                  activityLegendColor.push('#1f76b4');
                  break;
                case 'jogging':
                  activityLegendColor.push('#e17f0e');
                  break;
                case 'running':
                  activityLegendColor.push('#2ca02c');
                  break;
                case 'lifting_weight':
                  activityLegendColor.push('#d62727');
                  break;
              }

          count2++;
          this.activityobj = obj2;
          if (count2 === activity.length) {
            this.scatterPlot(objscatter);
            const dates = [new Date(this.startDate), new Date(this.endDate)];
            ActivitySlider(sliderObjActivity, activityLegendColor, dates, {});
          }
        }
        // -------------------------------Carb charts ---------------------------------//
        // -------------------------------Carb charts ---------------------------------//
        // -------------------------------Carb charts ---------------------------------//

        for (const [key, value] of Object.entries(carbs)) {
          obj3[0].series[count3] = {};
          objcrabscatter[count3] = {};
          obj3[0].series[count3].name = new Date(value['carbsTime']);
          obj3[0].series[count3].value = 5;
          obj3[0].series[count3].carbsTime = new Date(value['carbsTime']);
          obj3[0].series[count3].carbsType = this.carbsType[value['carbsType']];
          obj3[0].series[count3].carbsItem = value['carbsItem'];
          this.carbsobj = obj3;

          objcrabscatter[count3].carabsTime =  value['carbsTime'];
          objcrabscatter[count3].time = new Date(value['carbsTime']).getHours();
          objcrabscatter[count3].tooltipTime = new Date(value['carbsTime']);
          objcrabscatter[count3].carbsType = value['carbsType'];
          objcrabscatter[count3].carbsItem = obj3[0].series[count3].carbsItem;

          sliderObjCarbs[count3 + 1] = objcrabscatter[count3].time;

          switch (objcrabscatter[count3].carbsType) {
            case '1':
              carbsLegendColor.push('#1F77B4');
              break;
            case '2':
              carbsLegendColor.push('#FF7F0E');
              break;
            case '3':
              carbsLegendColor.push('#2CA02C');
              break;
          }

          count3++;

          if (count3 === carbs.length) {


            this.carbsScatterPlot(objcrabscatter);
            const dates = [new Date(this.startDate), new Date(this.endDate)];
            CarbsSlider(sliderObjCarbs, carbsLegendColor, dates, {});
          }
        }

        // -------------------------------glucose charts ---------------------------------//
        // -------------------------------glucose charts ---------------------------------//
        // -------------------------------glucose charts ---------------------------------//
        for (const [key, value] of Object.entries(glucose)) {
          obj4[0].series[count4] = {};
          obj4[0].series[count4].date_time = new Date(value['glucoseTime']);
          if (isNaN(value['glucoseLevelUnits'])) {
            value['glucoseLevelUnits'] = 0;
          }
          if (value['glucoseLevelUnits'] > 90) {
            value['glucoseLevelUnits'] = 30;
          }
          obj4[0].series[count4].total_km = value['glucoseLevelUnits'];
          obj4[0].series[count4].name = new Date(
            value['glucoseTime']
          ).getFullYear();
          obj4[0].series[count4].glucoseType = this.glucoseType[
            value['glucoseType']
          ];
          obj4[0].series[count4].glucoseLevelUnits = value['glucoseLevelUnits'];

          sliderObjGlucose[count4 + 1] = parseFloat(obj4[0].series[count4].glucoseLevelUnits);
          glucoseLabels.push(`${value['glucoseLevelUnits']} mmol/L`);
          count4++;
          this.golucoseobj = obj4;
        }

        this.golucoseobj[0].series = this.golucoseobj[0].series.slice(0, 10);

        const dates1 = [new Date(this.startDate), new Date(this.endDate)];
        GlucoseSlider(sliderObjGlucose, glucoseLabels, dates1, {});
        this.drawGolucoseLineChart123(this.golucoseobj[0].series);

        this.isLoading = false;
      },
      (error) => {}
    );
  }

  getActivityReportData(activityType) {
    const activity = this.groupedReport.activity;

    const data = {
      startDate: this.startDate,
      endDate: this.endDate,
      activity: activityType,
    };
    this.isLoading = true;
    this.insulinService.getactivityReportData(data).subscribe(
      (res: any) => {
        const new_data_activity = this.parseData(res.data);

        // -------------------------------------------- //
        // --------------------------------------------//
        // --------------------------------------------//
        new_data_activity.map((elem) => {
          const myDate = elem.entryTime; // new Date(elem.entryTime).setHours(0, 0, 0, 0);
          elem['commonTime'] = myDate;
          if (elem.type == 'activity') {
            elem['value'] = Math.abs(
              elem.activityDuration.hour * 60 + elem.activityDuration.minute
            );
            elem['name'] = this.datePipe.transform(elem.entryTime, 'MMM,y');
          }
          return elem;
        });
        const groupedDataActivity = this.groupBy(new_data_activity, 'type');
        const activity = groupedDataActivity.activity;
        // --------------------------------------------//
        // --------------------------------------------//
        const obj2 = [{ name: 'Activity', series: [] }];
        let count2 = 0;
        const objscatter = [];

        for (const [key, value] of Object.entries(activity)) {
          obj2[0].series[count2] = {};
          objscatter[count2] = {};
          obj2[0].series[count2].name = new Date(value['activityTime']);
          obj2[0].series[count2].value = value['value'];
          obj2[0].series[count2].activityTime = value['activityTime'];
          obj2[0].series[count2].activityType = value['activityType'];
          objscatter[count2].date = value['activityType'];
          objscatter[count2].value = value['value'];
          let hour_text = ' hour, ';
          let minute_text = ' minute ';
          if (value['activityDuration']['hour'] > 1) {
            hour_text = ' hours, ';
          }
          if (value['activityDuration']['minute'] > 1) {
            minute_text = ' minutes ';
          }
          obj2[0].series[count2].activityDuration =
            value['activityDuration']['hour'] +
            hour_text +
            value['activityDuration']['minute'] +
            minute_text;

          // Added activity time and duration
          objscatter[count2].activityTime = obj2[0].series[count2].activityTime;
          objscatter[count2].activityDuration =
            obj2[0].series[count2].activityDuration;

          count2++;
          this.activityobj = obj2;
          if (count2 === activity.length) {
            this.scatterPlot(objscatter);
          }
        }

        this.isLoading = false;
      },
      (error) => {}
    );
  }

  getInsulinReportData(dosageType) {
    const data = {
      startDate: this.startDate,
      endDate: this.endDate,
      dosageType: dosageType,
    };
    this.isLoading = true;
    this.insulinService.getInsulinReportData(data).subscribe(
      (res: any) => {
        this.reportData = this.parseData(res.data);
        this.reportData.map((elem) => {
          const myDate = elem.entryTime; // new Date(elem.entryTime).setHours(0, 0, 0, 0);
          elem['commonTime'] = myDate;
          if (elem.type == 'insulin') {
            if (elem.insulinType) {
              elem['insulinType'] = elem.insulinType;
            } else {
              elem['insulinType'] = '';
            }
            if (elem.dosageType == '1') {
              elem['name'] = 'Before Meal';
            } else if (elem.dosageType == '2') {
              elem['name'] = 'After Meal';
            } else {
              elem['name'] = 'Any other time';
            }

            elem['value'] = elem.dosageUnits;
          }
          return elem;
        });
        this.groupedReport = this.groupBy(this.reportData, 'type');
        const insulin = this.groupedReport.insulin;

        if (insulin !== undefined) {
          const obj1 = [];
          let count = 0;
          for (const [key, value] of Object.entries(insulin)) {
            obj1[count] = {};
            obj1[count] = {};
            obj1[count].name = this.datePipe.transform(
              value['dosageTime'],
              'MMM,y'
            );
            obj1[count].date = value['name'];
            obj1[count].value = value['value'];
            if (value['name'] === 'Before Meal') {
              obj1[count].order = 1;
            } else if (value['name'] === 'After Meal') {
              obj1[count].order = 2;
            } else {
              obj1[count].order = 3;
            }
            obj1[count].series = [
              {
                name: value['name'],
                value: value['value'],
                insulinType: value['insulinType'],
                dosageTime: value['dosageTime'],
              },
            ];
            count++;
            this.multi = obj1;
            if (count === insulin.length) {
              obj1.sort((a, b) =>
                a.order > b.order ? 1 : b.order > a.order ? -1 : 0
              );

              this.boxPlot(obj1);
            }
            // }
          }
        } else {
          const obj = [];
          this.boxPlot(obj);
        }

        this.isLoading = false;
      },
      (error) => {}
    );
  }

  replaceKeys(obj, find, replace) {
    return Object.keys(obj).reduce(
      (acc, key) =>
        Object.assign(acc, { [key.replace(find, replace)]: obj[key] }),
      {}
    );
  }

  onDateChange(value, type) {
    if (type == 'START') {
      this.startDate = value;
      this.value = new Date(this.startDate).getTime();
    } else {
      this.endDate = value;
      this.maxValue = new Date(this.endDate).getTime();
    }

    const insulinSlider = document.querySelector('#brush-slider');
    const activitySlider = document.querySelector('#acitivity-slider');
    const carbsSlider = document.querySelector('#carbs-slider');
    const glucoseSlider = document.querySelector('#glucose-slider');
    insulinSlider.innerHTML = '';
    activitySlider.innerHTML = '';
    carbsSlider.innerHTML = '';
    glucoseSlider.innerHTML = '';

    this.getReportData();
  }

  parseData(data): any {
    let keys;
    for (const item of data) {
      keys = Object.keys(item);
      if (keys.includes('glucoseType')) {
        item.type = 'glucose';
      } else if (keys.includes('activityType')) {
        item.type = 'activity';
      } else if (keys.includes('carbsType')) {
        item.type = 'carbs';
      } else if (keys.includes('dosageType')) {
        item.type = 'insulin';
      }
    }
    return data;
  }

  isInRange(insulinDosageDate) {

    const inputDate = new Date(insulinDosageDate);
    const rangeStartDate = new Date(this.startDate);
    const rangeEndDate = new Date(this.endDate);

    return (inputDate >= rangeStartDate && inputDate <= rangeEndDate) ? true : false;

  }

}
