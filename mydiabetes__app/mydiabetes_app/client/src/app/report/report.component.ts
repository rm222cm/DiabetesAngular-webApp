import { Component, OnInit } from '@angular/core';
import { InsulinDosagesService } from '../services/insulin-dosages.service';
import { start } from 'repl';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  glucoseType = [
    'Before Meal',
    'After Meal',
    'Any other time',
  ]
  insulinType = [
    'Before Meal',
    'After Meal',
    'Any other time',
  ]
  carbsType = [
    'Carbohydrates',
    'Protein',
    'Fibers',
  ]
  startDate = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().substring(0, 10);
  endDate = new Date().toISOString().substring(0, 10);
  reportData: any[] = [];
  isLoading: boolean = true;

  constructor(private insulinService: InsulinDosagesService) {
  }
  objectKeys = Object.keys;

  ngOnInit() {
    console.log(this.startDate + "  " + this.endDate);
    this.getReportData();
  }

  previousDayData() {
    let day = new Date(this.startDate);
    this.startDate = new Date(new Date(this.startDate).setDate(day.getDate() - 1)).toISOString().substring(0, 10);
    console.log(this.startDate); // May 01 2000    
    this.getReportData();
  }

  nextDayData() {
    let day = new Date(this.endDate);
    this.endDate = new Date(new Date(this.endDate).setDate(day.getDate() + 1)).toISOString().substring(0, 10);
    console.log(this.endDate); // May 01 2000    
    this.getReportData();
  }

  generateCSV() {
    this.insulinService.getCsvData({
      startDate: this.startDate,
      endDate: this.endDate
    }).subscribe((res: any) => {
      console.log(res)
      this.insulinService.downloadFile(res.data, 'jsontocsv');
    }
    ),
      error => console.log('Error downloading the file.'),
      () => console.info('OK');

  }

  generateHistoricalCSV() {
    this.insulinService.getHistoricalCsvData({}).subscribe((res: any) => {
      console.log(res)
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
  };
  groupedReport: any
  getReportData() {
    let data = {
      startDate: this.startDate,
      endDate: this.endDate
    };
    this.isLoading = true;
    this.insulinService.getReportData(data).subscribe((res: any) => {
      this.reportData = this.parseData(res.data);
      this.reportData.map(elem => {
        var myDate = new Date(elem.entryTime).setHours(0,0,0,0)
        elem['commonTime'] = myDate
        return elem
      })
      this.groupedReport = this.groupBy(this.reportData, 'commonTime')
      console.log('reportData',this.reportData);
      console.log('groupedReport',this.groupedReport);
      this.isLoading = false;
    },
      error => {
        console.log(error);

      });
  }

  onDateChange(value, type) {
    console.log(value);

    if (type == 'START')
      this.startDate = value;
    else
      this.endDate = value;
    this.getReportData();
  }

  parseData(data): any {
    let keys;
    for (let item of data) {
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
