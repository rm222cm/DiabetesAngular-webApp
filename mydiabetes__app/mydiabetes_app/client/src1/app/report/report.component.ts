import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { InsulinDosagesService } from '../services/insulin-dosages.service';
import { single, multi1, multi, linear } from '../data/data.model';
// import * as d3 from 'd3'; 
import * as Jquery from 'jquery';

import { DatePipe } from '@angular/common';

import { HttpClient } from '@angular/common/http';
declare var makeDistroChart: any;
declare var makeDistroChartBox: any;
declare var rSlider: any;
declare var d3: any;

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe]
})
export class ReportComponent implements OnInit {
  @ViewChild('dataContainer') dataContainer: ElementRef;
  @ViewChild('sliderButton') sliderButton: ElementRef;
  constructor(private insulinService: InsulinDosagesService, private http: HttpClient,
     private datePipe: DatePipe) {


    Object.assign(this, { single });
    Object.assign(this, { linear });
    // Object.assign(this, { multi1 });
    console.log('multi1');
    console.log(multi1);
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
  yAxisLabelGlucose = 'Glucose Level';


  legend = true;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  timeline = true;

  colorScheme = {
    domain: ['#9ecae6', '#c6aed0', '#d29494', '#d59c9c']
  };

  colorScheme1 = {
    domain: ['#3CB371', '#64c12abf', '#c12abcbf', '#432aa9bf']
  };
  colorSchemeCarbs = {
    domain: ['#ffdb58', '#64c12abf', '#c12abcbf', '#432aa9bf']
  };
  colorSchemeGlucose = {
    domain: ['slateblue', '#64c12abf', '#c12abcbf', '#432aa9bf']
  };
  glucoseType = [
    '',
    'Before Meal',
    'After Meal',
    'Any other time',
  ];
  insulinType = [
    'Before Meal1',
    'After Meal',
    'Any other time',
  ];
  carbsType = [
    '',
    'Carbohydrates',
    'Protein',
    'Fibers',
  ];
  startDate = new Date(new Date().setDate(new Date().getDate() - 3650)).toISOString().substring(0, 10);
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

  ngOnInit() {
    console.log(this.startDate + '  ' + this.endDate);
    this.getReportData();

  }
  slider() {
    var slider2 = new rSlider({
      target: '#time_range',
      values: {min: 1, max : 100},
      step: 1,
      range: true,
      set: [14, 15.3],
      tooltip: true,
      scale: true,
      labels: true,
      width: null,
      onChange: function (vals) {
          console.log(vals);
      }
  });

  var slider3 = new rSlider({
    target: '#time_range1',
    values: [8, 8.3, 9, 9.3, 10, 10.3, 11, 11.3, 12, 12.3,
       13, 13.3, 14, 14.3, 15, 15.3, 16, 16.3, 17, 17.3, 18, 18.3, 19],
    step: 1,
    range: true,
    set: [14, 15.3],
    tooltip: true,
    scale: true,
    labels: true,
    width: null,
    onChange: function (vals) {
        console.log(vals);
    }
});
  console.log('slider2');
  console.log(slider2);
  }
  boxPlot(this_data) {
    // this.dataContainer.nativeElement.innerHTML = '';
    let chart1;
    // d3.csv(this_data, function(error, data) {
    // d3.csv('../../assets/DATA.CSV', function(error, data) {
      console.log('this_data');
      console.log(this_data);
      this_data.forEach(function (d) {d.value = +d.value; });

      chart1 = makeDistroChartBox({
          data: this_data,
          xName: 'date',
          yName: 'value',
          axisLabels: {xAxis: null, yAxis: 'Dosage Units'},
          selector: '#chart-distro1',
          chartSize: { height: 530, width: 960},
          constrainExtremes: true});
        chart1.renderBoxPlot();
      console.log('after', this_data);
        // chart1.renderDataPlots();
        // chart1.renderNotchBoxes({showNotchBox:false});
        // chart1.renderViolinPlot({showViolinPlot: true});

    // }); // d3.csv
  }

  scatterPlot(this_data) {
    // this.dataContainer.nativeElement.innerHTML = '';
    let chart2;
    // d3.csv(this_data, function(error, data) {
    // d3.csv('../../assets/DATA.CSV', function(error, data) {
      console.log('this_data');
      console.log(this_data);
      this_data.forEach(function (d) {d.value = +d.value; });

      chart2 = makeDistroChart({
          data: this_data,
          xName: 'date',
          yName: 'value',
          axisLabels: {xAxis: null, yAxis: 'Activity Duration'},
          selector: '#chart-distro2',
          chartSize: { height: 530, width: 960},
          constrainExtremes: true});
          chart2.renderDataPlots();
          chart2.dataPlots.show({showPlot: true, plotType: 40, showBeanLines: false, colors: null});
          this.sliderButton.nativeElement.click();
        // chart1.renderDataPlots();
        // chart1.renderNotchBoxes({showNotchBox:false});
        // chart1.renderViolinPlot({showViolinPlot: true});

    // }); // d3.csv
  }

  onSelectInsulin(event) {
    var elements = document.querySelectorAll('.legend-label-text') ;
    let arr = [];
    elements.forEach((el) => {

      if (el.textContent.trim() == event  ) {
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
    this.startDate = new Date(new Date(this.startDate).setDate(day.getDate() - 1)).toISOString().substring(0, 10);
    console.log(this.startDate); // May 01 2000
    this.getReportData();
  }

  nextDayData() {
    const day = new Date(this.endDate);
    this.endDate = new Date(new Date(this.endDate).setDate(day.getDate() + 1)).toISOString().substring(0, 10);
    // console.log(this.endDate); // May 01 2000
    this.getReportData();
  }

  generateCSV() {
    this.insulinService.getCsvData({
      startDate: this.startDate,
      endDate: this.endDate
    }).subscribe((res: any) => {
      console.log(res);
      this.insulinService.downloadFile(res.data, 'jsontocsv');
    }
    ),
      error => console.log('Error downloading the file.'),
      () => console.info('OK');

  }

  generateHistoricalCSV() {
    this.insulinService.getHistoricalCsvData({}).subscribe((res: any) => {
      console.log(res);
      this.insulinService.downloadFile(res.data, 'jsontocsv');
    }
    ),
      error => console.log('Error downloading the file.'),
      () => console.info('OK');

  }
  groupBy(xs, key) {
    if (xs) {

      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    } else {
      return {};
    }
  }
  groupByCustom(xs, key) {
    if (xs) {
      // console.log('xs,key');
      // console.log(xs, key);
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []);
        return rv;
      }, {});
    } else {
      return {};
    }
  }

  getReportData() {
    // console.log('getReportData');
    const data = {
      startDate: this.startDate,
      endDate: this.endDate
    };
    this.isLoading = true;
    this.insulinService.getReportData(data).subscribe((res: any) => {

      this.reportData = this.parseData(res.data);
      this.reportData.map(elem => {
        const myDate = elem.entryTime; // new Date(elem.entryTime).setHours(0, 0, 0, 0);
        elem['commonTime'] = myDate;
        if (elem.type == 'insulin'   ) {
          if (elem.insulinType) {
            elem['insulinType'] =  elem.insulinType;
          } else {
            elem['insulinType'] =  '';
          }
          if (elem.dosageType == '1') {
            elem['name'] =  'Before Meal';
          } else  if (elem.dosageType == '2') {
            elem['name'] =  'After Meal';
          } else {
            elem['name'] =  'Any other time';
          }

          elem['value'] = elem.dosageUnits;


        } else if (elem.type == 'activity') {
          elem['value'] =  Math.abs((elem.activityDuration.hour * 60) + (elem.activityDuration.minute));
          elem['name'] = this.datePipe.transform(elem.entryTime, 'MMM,y');
        } else if (elem.type == 'glucose') {

        } else if (elem.type == 'carbs') {

        }
          return elem;
      });
      // console.log('reportData', this.reportData);
      this.groupedReport = this.groupBy(this.reportData, 'type');
      // console.log('groupedReport', this.groupedReport);
      const insulin  = this.groupedReport.insulin; // this.groupBy(this.groupedReport.insulin, 'entryTime');
      const activity  = this.groupedReport.activity; // this.groupBy(this.groupedReport.activity, 'activityType');
      const carbs  = this.groupedReport.carbs; // this.groupBy(this.groupedReport.activity, 'activityType');
      const glucose  = this.groupedReport.glucose; // this.groupBy(this.groupedReport.activity, 'activityType');
      let obj1 = [];
      let objvoilin = [];
      let objscatter = [];
      let obj2 = [{'name': 'Activity', 'series': []}];
      let obj3 = [{'name': 'Crabs', 'series': []}];
      let obj4 = [{'name': 'Glucose', 'series': []}];
      let count = 0;
      let count2 = 0;
      let count3 = 0;
      let count4 = 0;
      // console.log("insulin.length");
      // console.log(insulin.length);
      // console.log(insulin);
      for (let [key, value] of Object.entries(insulin)) {

          obj1[count] = {};
          objvoilin[count] = {};
          obj1[count].name =  this.datePipe.transform(value['dosageTime'], 'MMM,y');
          objvoilin[count].date =  value['name'];
          objvoilin[count].value =  value['value'];
          if (value['name'] === 'Before Meal') {
            objvoilin[count].order = 1;
          } else if (value['name'] === 'After Meal') {
            objvoilin[count].order = 2;
          } else {
            objvoilin[count].order = 3;
          }
          obj1[count].series = [
            {
              'name': value['name'],
              'value': value['value'],
              'insulinType': value['insulinType'],
              'dosageTime': value['dosageTime']
            }];
          count++;
          // console.log('count');
          // console.log(count);
          this.multi = obj1;
          if (count === insulin.length ) {
            // console.log("this.objvoilin");
            // console.log( objvoilin);
            objvoilin.sort((a,b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0)); 

            this.boxPlot(objvoilin);
          }
        // }

      }
      for (let [key, value] of Object.entries(activity)) {
        obj2[0].series[count2] = {};
        objscatter[count2] = {};
        obj2[0].series[count2].name =  new Date(value['activityTime']);
        obj2[0].series[count2].value = value['value'];
        obj2[0].series[count2].activityTime = value['activityTime'];
        obj2[0].series[count2].activityType = value['activityType'];
        objscatter[count2].date =  value['activityType'];
        objscatter[count2].value =  value['value'];
        let hour_text = ' hour, ';
        let minute_text = ' minute ';
        if (value['activityDuration']['hour'] > 1) {
          hour_text = ' hours, ';
        }
        if (value['activityDuration']['minute'] > 1) {
          minute_text = ' minutes ';
        }
        obj2[0].series[count2].activityDuration =  value['activityDuration']['hour'] + hour_text +
         value['activityDuration']['minute'] + minute_text;

        count2++;
        this.activityobj = obj2;
         if (count2 === activity.length ) {
          console.log("this.objscatter");
          console.log( objscatter);

          this.scatterPlot(objscatter);
        }
      }
      // -------------------------------Carb charts ---------------------------------//
      // -------------------------------Carb charts ---------------------------------//
      // -------------------------------Carb charts ---------------------------------//
      for (let [key, value] of Object.entries(carbs)) {
        obj3[0].series[count3] = {};
        obj3[0].series[count3].name =  new Date(value['carbsTime']);
        obj3[0].series[count3].value = 5;
        obj3[0].series[count3].carbsTime = new Date(value['carbsTime']);
        obj3[0].series[count3].carbsType = this.carbsType[value['carbsType']];
        obj3[0].series[count3].carbsItem = value['carbsItem'];
        count3++;
        this.carbsobj = obj3;
      }
      // -------------------------------glucose charts ---------------------------------//
      // -------------------------------glucose charts ---------------------------------//
      // -------------------------------glucose charts ---------------------------------//
      for (let [key, value] of Object.entries(glucose)) {
        obj4[0].series[count4] = {};
        obj4[0].series[count4].name =  new Date(value['glucoseTime']);
        obj4[0].series[count4].value = value['glucoseLevelUnits'];
        obj4[0].series[count4].glucoseTime = new Date(value['glucoseTime']);
        obj4[0].series[count4].glucoseType = this.glucoseType[value['glucoseType']];
        obj4[0].series[count4].glucoseLevelUnits = value['glucoseLevelUnits'];
        count4++;
        this.golucoseobj = obj4;
      }
      this.isLoading = false;
    },
      error => {
        console.log(error);

      });
  }

  getInsulinReportData(dosageType) {
    console.log('getInsulinReportData');
    const data = {
      startDate: this.startDate,
      endDate: this.endDate,
      dosageType: dosageType
    };
    this.isLoading = true;
    this.insulinService.getInsulinReportData(data).subscribe((res: any) => {

      this.reportData = this.parseData(res.data);
      this.reportData.map(elem => {
        const myDate = elem.entryTime; // new Date(elem.entryTime).setHours(0, 0, 0, 0);
        elem['commonTime'] = myDate;
        if (elem.type == 'insulin'   ) {
          if (elem.insulinType) {
            elem['insulinType'] =  elem.insulinType;
          } else {
            elem['insulinType'] =  '';
          }
          if (elem.dosageType == '1') {
            elem['name'] =  'Before Meal';
          } else  if (elem.dosageType == '2') {
            elem['name'] =  'After Meal';
          } else {
            elem['name'] =  'Any other time';
          }

          elem['value'] = elem.dosageUnits;


        }
          return elem;
      });
      console.log('reportData', this.reportData);
      this.groupedReport = this.groupBy(this.reportData, 'type');
      const insulin  = this.groupedReport.insulin;
      let obj1 = [];
      let count = 0;



      for (let [key, value] of Object.entries(insulin)) {

          obj1[count] = {};
          obj1[count].name =  this.datePipe.transform(value['dosageTime'], 'MMM,y');
          obj1[count].series = [
            {
              'name': value['name'],
              'value': value['value'],
              'insulinType': value['insulinType'],
              'dosageTime': value['dosageTime']
            }];
          count++;
          this.multi = obj1;

      }

      console.log('this.multi');
      console.log(this.multi);

      this.isLoading = false;
    },
      error => {
        console.log(error);

      });
  }
  replaceKeys(obj, find, replace) {

    return Object.keys(obj).reduce (
      (acc, key) => Object.assign(acc, { [key.replace(find, replace)]: obj[key] }), {});
  }
  onDateChange(value, type) {
    console.log(value);

    if (type == 'START') {
      this.startDate = value;
    } else {
      this.endDate = value;
    }
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

}
