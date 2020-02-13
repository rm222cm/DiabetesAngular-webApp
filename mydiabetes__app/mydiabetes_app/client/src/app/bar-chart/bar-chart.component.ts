import { Component, OnInit, SimpleChanges } from '@angular/core';

import { ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import Chart from 'chart.js';
import * as moment from 'moment';
import { interpolateRgbBasis } from 'd3';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {
  @Input() insulinData;
  @Input() reportData;

  @ViewChild('chart') private chartContainer: ElementRef;

  beforeMeal = [];
  afterMeal = [];
  otherMeal = [];

  constructor() {}

  ngOnInit() {}

  ngOnChanges(simpleChanges: SimpleChanges): void {
    if (
      simpleChanges.insulinData.currentValue !==
      simpleChanges.insulinData.previousValue
    ) {
      this.insulinData = this.filterData(
        simpleChanges.insulinData.currentValue
      );
    }

    if (
      simpleChanges.reportData.currentValue !==
      simpleChanges.reportData.previousValue
    ) {
      this.reportData = simpleChanges.reportData.currentValue.filter(
        el => el.type == 'insulin'
      );
    }
    if (this.insulinData) { this.createChart(); }
  }

  private filterData(dt) {
    const keys = Object.keys(dt);
    const filteredData = [];

    keys.forEach(key => {
      const filtered = dt[key].filter(el => el.type == 'insulin');
      if (filtered.length) {
        filteredData.push(filtered);
        this.filterInsulin(filtered);
      }
    });
    return filteredData;
  }

  private filterInsulin(filtered) {
    let beforeMeal, afterMeal, otherMeal;
    filtered.forEach(d => {
      if (d.dosageType == 1 && !beforeMeal && d.dosageUnits <= 100) {
        this.beforeMeal.push(d.dosageUnits);
        beforeMeal = true;
      }
      if (d.dosageType == 2 && !afterMeal && d.dosageUnits <= 100) {
        this.afterMeal.push(d.dosageUnits);
        afterMeal = true;
      }
      if (d.dosageType == 3 && !otherMeal && d.dosageUnits <= 100) {
        this.otherMeal.push(d.dosageUnits);
        otherMeal = true;
      }
    });
  }

  private createChart(): void {
    const canvas = this.chartContainer.nativeElement.getContext('2d');
    // tslint:disable-next-line: no-unused-expression
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.filterData(this.insulinData).map(d => {
          return this.formatXTime(d[0].dosageTime);
        }),
        datasets: [
          {
            label: 'Before meal',
            backgroundColor: 'rgba(62, 149, 205, .5)',
            data: this.beforeMeal,
            maxBarThickness: 45,
            borderColor: 'rgba(62, 149, 205, 1)',
            borderWidth: 1
          },
          {
            label: 'After meal',
            backgroundColor: 'rgba(142,94,162,.5)',
            data: this.afterMeal,
            maxBarThickness: 45,
            borderColor: 'rgba(142,94,162,1)',
            borderWidth: 1
          },
          {
            label: 'Other time',
            backgroundColor: 'rgba(165,42,42,.5)',
            data: this.otherMeal,
            maxBarThickness: 45,
            borderColor: 'rgba(165,42,42,1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        // tooltips: {
        //   callbacks: {
        //     label:  (item, data) => {
        //       console.log(item, data);
        //       const index= item.index;
        //       const value  = item.value;
        //       const insulinType = this.insulinData.filter(el => {
        //         console.log(el.dosageUnits, 'el')
        //         console.log(value, 'el')
        //         return el.dosageUnits == value
        //       })
        //       console.log(insulinType, 'type');
        //     }
        //   }
        // },
        title: {
          display: true,
          text: 'Insulin Dosage/Units'
        },
        scales: {
          yAxes: [{
              scaleLabel: {
                display: true,
              labelString: 'Dosage Units'
              }
          }],
          xAxes: [{
            // ticks: {
            //   display: false,
            // },
            scaleLabel: {
              display: true,
            labelString: 'Time/Date'
            }
        }]
      }
      }
    });
  }

  formatXTime(dt) {
    return moment(dt).format('YYYY MMM DD');
  }

  formatTime(dt) {
    return moment(dt).format('MM/DD/YYYY, h:mm:ss a');
  }
}
