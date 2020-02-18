import { Component, OnInit } from '@angular/core';
import { InsulinDosagesService } from '../services/insulin-dosages.service';
import { start } from 'repl';
import { single,multi1,multi,linear } from '../data/data.model';
import { DatePipe } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  providers:[DatePipe]
})
export class ReportComponent implements OnInit {

  constructor(private insulinService: InsulinDosagesService, private http: HttpClient, private datePipe: DatePipe) {

    
    Object.assign(this, { single });
    Object.assign(this, { linear });
    // Object.assign(this, { multi1 });
    console.log('multi1')
    console.log(multi1)
  }

  single: any[];
  multi: any;
  linear: any;
  multi1: any[];
  activityobj: any;

  view: any[] = [1024, 180];

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


  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  timeline: boolean = true;

  colorScheme = {
    domain: ['#9ecae6', '#c6aed0', '#d29494', '#d59c9c']
  };

  colorScheme1 = {
    domain: ['#3CB371', '#64c12abf', '#c12abcbf', '#432aa9bf']
  };
  glucoseType = [
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

  ngOnInit() {
    console.log(this.startDate + '  ' + this.endDate);
    this.getReportData();
  }
  onSelectInsulin(event) {
    var elements = document.querySelectorAll('.legend-label-text') ;
    elements.forEach(function(el){

      if(el.textContent.trim() == event  ){
        if(el['style'].textDecoration == 'line-through'){
          el['style'].textDecoration = '';
        } else {
          el['style'].textDecoration = 'line-through';
        }
      }
    })
    if(event == 'After Meal'){

    } else if(event == 'Before Meal'){

    }else if(event == 'Any other time'){

    }
  }

  onChecked(value, target) {
    console.log('value, target');
    console.log(value, target);
    if(target == 'INSULIN'){
      this.showInsulin = !this.showInsulin;
    }
    if(target == 'ACTIVITY'){
      this.showActivity = !this.showActivity;
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
    console.log(this.endDate); // May 01 2000
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
    if(xs){

      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    } else {
      return {};
    }
  }

  formatPercent(val) {
    // console.log('val')
    // console.log(val)
    // if (val <= 100) {
    //   return val + '%';
    // }
  } 
  getReportData() {
    console.log('getReportData')
    const data = {
      startDate: this.startDate,
      endDate: this.endDate
    };
    this.isLoading = true;
    this.insulinService.getReportData(data).subscribe((res: any) => {

      this.reportData = this.parseData(res.data);
      this.reportData.map(elem => {
        var myDate = elem.entryTime; // new Date(elem.entryTime).setHours(0, 0, 0, 0);
        elem['commonTime'] = myDate;
        if(elem.type == 'insulin'   ){
          if(elem.insulinType){
            elem['insulinType'] =  elem.insulinType;
          } else {
            elem['insulinType'] =  '';
          }
          if(elem.dosageType == '1'){
            elem['name'] =  'Before Meal';
          } else  if(elem.dosageType == '2'){
            elem['name'] =  'After Meal';
          } else {
            elem['name'] =  'Any other time';
          }
          
          elem['value'] = elem.dosageUnits;
            // if( elem.dosageUnits > 90){

            //   elem['value'] = 90;
            // }
            // elem['name'] = elem.insulinType || 'other';
          

        } else if(elem.type == 'activity'){
          elem['value'] =  Math.abs((elem.activityDuration.hour * 60) + (elem.activityDuration.minute));
          elem['name'] = this.datePipe.transform(elem.entryTime, 'MMM,y');
        } else if(elem.type == 'glucose'){

        } else if(elem.type == 'carbs'){

        }
          return elem;
      });
      console.log('reportData', this.reportData);
      this.groupedReport = this.groupBy(this.reportData, 'type');
      console.log('groupedReport', this.groupedReport);
      let insulin  = this.groupedReport.insulin; // this.groupBy(this.groupedReport.insulin, 'entryTime');
      let activity  = this.groupedReport.activity; // this.groupBy(this.groupedReport.activity, 'activityType');
      let obj1=[];
      let obj2=[{'name':'Activity','series':[]}];
      let count = 0;
      let count2 = 0;
      for (let [key, value] of Object.entries(insulin)) {
        // if( this.datePipe.transform(value['dosageTime'], 'MM-dd-yy') != '02-10-20')
        // {
          obj1[count] = {};
          obj1[count].name =  this.datePipe.transform(value['dosageTime'], 'MMM,y');
          obj1[count].series = [
            {
              "name": value['name'],
              "value": value['value'],
              "insulinType": value['insulinType'],
              "dosageTime": value['dosageTime']
            }]
          count++;
          this.multi = obj1;        
        // }

      }
      for (let [key, value] of Object.entries(activity)) {
        obj2[0].series[count2] = {};
        obj2[0].series[count2].name =  new Date(value['activityTime']);
        obj2[0].series[count2].value = value['value'];
        obj2[0].series[count2].activityTime = value['activityTime'];
        obj2[0].series[count2].activityType = value['activityType'];
        let hour_text = ' hour, ';
        let minute_text = ' minute ';
        if(value['activityDuration']['hour']>1){
          hour_text = ' hours, ';
        }
        if(value['activityDuration']['minute']>1){
          minute_text = ' minutes ';
        }
        obj2[0].series[count2].activityDuration =  value['activityDuration']['hour'] + hour_text + value['activityDuration']['minute'] + minute_text;
       
        count2++;
        this.activityobj = obj2;
      }
        console.log(' this.this.multi');
        console.log( JSON.stringify(this.multi));
        console.log( this.multi);
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
