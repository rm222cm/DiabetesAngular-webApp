import { Component, OnInit } from '@angular/core';
import { InsulinDosagesService } from '../services/insulin-dosages.service';
import { start } from 'repl';
import { single,multi, multi1 } from '../data/data.model';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  constructor(private insulinService: InsulinDosagesService, private http: HttpClient) {

    Object.assign(this, { multi });
    Object.assign(this, { multi1 });
  }

  single: any[];
  multi: any[];
  multi1: any[];

  view: any[] = [1024, 200];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
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
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
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
  startDate = new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().substring(0, 10);
  endDate = new Date().toISOString().substring(0, 10);
  reportData: any[] = [];
  isLoading = true;
  objectKeys = Object.keys;
  groupedReport: any;

  ngOnInit() {
    console.log(this.startDate + '  ' + this.endDate);
    this.getReportData();
  }
  onSelect(event) {
    console.log(event);
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
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }
  getReportData() {
    const data = {
      startDate: this.startDate,
      endDate: this.endDate
    };
    this.isLoading = true;
    this.insulinService.getReportData(data).subscribe((res: any) => {

      this.reportData = this.parseData(res.data);
      this.reportData.map(elem => {
        var myDate = new Date(elem.entryTime).setHours(0, 0, 0, 0);
        elem['commonTime'] = myDate;
        return elem;
      });
      this.groupedReport = this.groupBy(this.reportData, 'commonTime');
      console.log('reportData', this.reportData);
      console.log('groupedReport', this.groupedReport);
      this.isLoading = false;
    },
      error => {
        console.log(error);

      });
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
