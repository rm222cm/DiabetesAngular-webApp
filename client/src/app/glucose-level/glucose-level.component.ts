import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { GlucoseService } from '../services/glucose.service';
import { SimpleModalComponent, ModalDialogService, ModalDialogComponent } from 'ngx-modal-dialog';

import * as moment from 'moment'
declare let $: any;
import * as Chartist from 'chartist'; 
import { InsulinDosagesService } from '../services/insulin-dosages.service';
import { DiabetesGraphComponent } from '../diabetes-graph/diabetes-graph.component';

@Component({
  selector: 'app-glucose-level',
  templateUrl: './glucose-level.component.html',
  styleUrls: ['./glucose-level.component.scss']
})
export class GlucoseLevelComponent implements OnInit {
  //checboxes
  glucoseCheck = true
  insulinCheck = true
  activityCheck = true
  carbsCheck = true

  currentDate = new Date();
  startDate = new Date().toISOString().substring(0, 10);
  endDate = new Date().toISOString().substring(0, 10);
  latestGlucoseLevelUnits: string = '';

  glucoseReactForm = this.fb.group({
    glucoseType: ['', Validators.required],
    glucoseTime: [{ hour: this.currentDate.getHours(), minute: this.currentDate.getMinutes() }],
    glucoseLevelUnits: ['', Validators.required]
  });

  formProcess: boolean = false;

  errMsg: any = {
    class: 'hidden',
    msg: ''
  }

  get glucoseFormCtrl(): any {
    return this.glucoseReactForm['controls'];
  }

  constructor(private glucoseService: GlucoseService, private insulinService: InsulinDosagesService, private router: Router, private fb: FormBuilder, private viewRef: ViewContainerRef, private modalService: ModalDialogService) { }

  ngOnInit() {
    this.loadChartData();
  }

  onChange() {
    this.errMsg = {
      class: 'hidden',
      msg: ''
    }
  }

  



  isSubmitted = false;

  onSubmit(): void {
    this.isSubmitted = true
    const info = this.glucoseReactForm.value;

    let date = new Date();
    date.setHours(info.glucoseTime.hour, info.glucoseTime.minute, 0);
    info.glucoseTime = date

    console.log('info', info);

    if (!this.glucoseReactForm.valid) {
      return;
    }

    this.glucoseService.create(info)
      .subscribe((res: any) => {
        this.formProcess = false;
        if (res.err) {
          this.errMsg.class = null;
          this.errMsg.msg = res.err;
          console.log('res', this.errMsg);
          return;
        }
        console.log('back', res);
        let title, text;
        if (res.msg === 'success') {
          title = 'Success',
            text = 'Glucose amount has been added successfully.'
        } else {
          title = 'Warning',
            text = res.msg
        }
        this.modalService.openDialog(this.viewRef, {
          title,
          childComponent: SimpleModalComponent,
          data: { text },
          actionButtons: [
            {
              text: 'continue',
              onAction: () => {
                if (res.msg === 'success') {
                  this.glucoseReactForm.reset()
                  this.isSubmitted = false
                  this.glucoseReactForm.get('glucoseType').setValue('')
                  this.glucoseReactForm.get('glucoseTime').setValue({ hour: this.currentDate.getHours(), minute: this.currentDate.getMinutes() });
                  this.loadChartData();
                }
                return true;
              }
            }
          ],
        });
      });
  }

  openNewDialog() {
    let text = 'test'
    this.modalService.openDialog(this.viewRef, {
      title: 'Diabetes graph',
      data: { text },
      childComponent: DiabetesGraphComponent,
    });
  }

  onTimeChange(value) {
    console.log(value);
  }
  onDateChange(value) {
    console.log('start date change', this.startDate)
    console.log('end date change', this.endDate)
    this.loadChartData()
  }

  onStartDateChange(value) {
    console.log(value);
  }

  onEndDateChange(value) {
    console.log(value);
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


  onChecked(value, target) {
    let glucoseRef: any = document.getElementsByClassName('ct-series-a')
    let insulinRef: any = document.getElementsByClassName('ct-series-b')
    let activityRef: any = document.getElementsByClassName('ct-series-c')
    let carbsRef: any = document.getElementsByClassName('ct-series-d')
    for (var i = glucoseRef.length - 1; i >= 0; --i) {
      glucoseRef[i].style.display = (this.glucoseCheck) ? 'block' : 'none'
    }
    for (var i = insulinRef.length - 1; i >= 0; --i) {
      insulinRef[i].style.display = (this.insulinCheck) ? 'block' : "none"
    }
    for (var i = carbsRef.length - 1; i >= 0; --i) {
      carbsRef[i].style.display = (this.carbsCheck) ? 'block' : 'none'
    }
    for (var i = activityRef.length - 1; i >= 0; --i) {
      activityRef[i].style.display = (this.activityCheck) ? 'block' : 'none'
    }
  }


  

  chartData: any;
  lableData = []
  lableDateFormat(dateStr) {
    return new Date(dateStr).getUTCFullYear() + '/' + new Date(dateStr).getUTCMonth() + 1 + '/' + new Date(dateStr).getUTCDate() + '/' + new Date(dateStr).getUTCHours() + ":" + new Date(dateStr).getUTCMinutes()
  }
  loadChartData() {
    console.log('start date', this.startDate)
    console.log('end date', this.endDate)
    this.insulinService.getChartData({
      startDate: this.startDate,
      endDate: this.endDate
    }).subscribe(res => {
      console.log('res', res)
      this.chartData = res['data']
      // res['data']['insulinLabel'].forEach(elem => this.lableData.push(elem))
      // res['data']['activityLabel'].forEach(elem => this.lableData.push(elem))
      this.lableData = []
      res['data']['insulin'].map(elem => {
        elem.x = new Date(elem.x).getTime()
        return elem
      })
      res['data']['activity'].map(elem => {
        elem.x = new Date(elem.x).getTime()
        return elem
      })
      res['data']['carbs'].map(elem => {
        elem.x = new Date(elem.x).getTime()
        return elem
      })
      res['data']['glucose'].map(elem => {
        elem.x = new Date(elem.x).getTime()
        return elem
      })


      res['data']['insulinLabel'].forEach(elem => {
        this.lableData.push(elem)
      })
      res['data']['activityLabel'].forEach(elem => {
        this.lableData.push(elem)
      })
      res['data']['carbsLabel'].forEach(elem => {
        this.lableData.push(elem)
      })
      res['data']['glucoseLabel'].forEach(elem => {
        this.lableData.push(elem)
      })
      console.log('load chart data res', this.lableData)
      this.loadChart();
    })
  }


  loadChart() {
    console.log('label data', this.lableData)
    console.log('insulin', this.chartData['insulin'])
    console.log('glucose', this.chartData['glucose'])
    console.log('activity', this.chartData['activity'])
    console.log('carbs', this.chartData['carbs'])
    var chart = new Chartist.Line('#chartist-chart', {
      series: [
        {
          name: 'series-1',
          data: this.chartData['glucose']
        },
        {
          name: 'series-2',
          data: this.chartData['insulin']
        },
        {
          name: 'series-3',
          data: this.chartData['carbs']
        },
        {
          name: 'series-4',
          data: this.chartData['activity']
        }

      ]
    }, {
        axisX: {

          type: Chartist.FixedScaleAxis,
          divisor: 5,
          labelInterpolationFnc: function (value) {
            return moment(value).format('YYYY/MM/DD HH:mm');
            // return value
          }
        },


        // axisX: {
        //   type: Chartist.AutoScaleAxis,
        //   onlyInteger: false
        // },
        height: 500,
        width: 1100,
        fullWidth: true,
        // Within the series options you can use the series names
        // to specify configuration that will only be used for the
        // specific series.
        series: {
          'series-2': {
            // lineSmooth: Chartist.Interpolation.simple(),
            showLine: false
          },
          'series-3': {
            showLine: false
          },
          'series-1': {
            showPoint: true
          }
        }
      }, [
        // You can even use responsive configuration overrides to
        // customize your series configuration even further!
        ['screen and (max-width: 320px)', {
          series: {
            'series-2': {
              lineSmooth: Chartist.Interpolation.none(),
              showArea: false
            },
            'series-3': {
              lineSmooth: Chartist.Interpolation.none(),
              showPoint: true
            }
          }
        }]
      ]);

    // Let's put a sequence number aside so we can use it in the event callbacks
    var seq = 0,
      delays = 80,
      durations = 500;

    // Once the chart is fully created we reset the sequence
    chart.on('created', function () {
      seq = 0;
    });

    // On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations
    chart.on('draw', function (data) {
      seq++;

      if (data.type === 'line') {
        // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
        data.element.animate({
          opacity: {
            // The delay when we like to start the animation
            begin: seq * delays + 1000,
            // Duration of the animation
            dur: durations,
            // The value where the animation should start
            from: 0,
            // The value where it should end
            to: 1
          }
        });
      } else if (data.type === 'label' && data.axis === 'x') {
        data.element.animate({
          y: {
            begin: seq * delays,
            dur: durations,
            from: data.y + 100,
            to: data.y,
            // We can specify an easing function from Chartist.Svg.Easing
            easing: 'easeOutQuart'
          }
        });
      } else if (data.type === 'label' && data.axis === 'y') {
        data.element.animate({
          x: {
            begin: seq * delays,
            dur: durations,
            from: data.x - 100,
            to: data.x,
            easing: 'easeOutQuart'
          }
        });
      } else if (data.type === 'point') {
        data.element.animate({
          x1: {
            begin: seq * delays,
            dur: durations,
            from: data.x - 10,
            to: data.x,
            easing: 'easeOutQuart'
          },
          x2: {
            begin: seq * delays,
            dur: durations,
            from: data.x - 10,
            to: data.x,
            easing: 'easeOutQuart'
          },
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'easeOutQuart'
          }
        });
      } else if (data.type === 'grid') {
        // Using data.axis we get x or y which we can use to construct our animation definition objects
        var pos1Animation = {
          begin: seq * delays,
          dur: durations,
          from: data[data.axis.units.pos + '1'] - 30,
          to: data[data.axis.units.pos + '1'],
          easing: 'easeOutQuart'
        };

        var pos2Animation = {
          begin: seq * delays,
          dur: durations,
          from: data[data.axis.units.pos + '2'] - 100,
          to: data[data.axis.units.pos + '2'],
          easing: 'easeOutQuart'
        };

        var animations = {};
        animations[data.axis.units.pos + '1'] = pos1Animation;
        animations[data.axis.units.pos + '2'] = pos2Animation;
        animations['opacity'] = {
          begin: seq * delays,
          dur: durations,
          from: 0,
          to: 1,
          easing: 'easeOutQuart'
        };

        data.element.animate(animations);
      }
    });
  }

}
