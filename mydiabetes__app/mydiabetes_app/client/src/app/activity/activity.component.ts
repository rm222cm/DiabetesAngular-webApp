import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';

import { SimpleModalComponent, ModalDialogService } from 'ngx-modal-dialog';

import { ActivityInfo } from './activity-info';
import { ActivityLevelService } from '../services/activity-level.service';
import { GlucoseService } from '../services/glucose.service';
import { FormBuilder, Validators } from '@angular/forms';

import { InsulinDosagesService } from '../services/insulin-dosages.service';
import * as moment from 'moment'

declare let $: any;
import * as Chartist from 'chartist';
import 'chartist-plugin-tooltips'

import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
  
  //checboxes
  activityCheckBoxGroup = {
    glucoseCheck : true,
    insulinCheck : true,
    activityCheck : true,
    carbsCheck : true
  }

  displayModal: boolean;
  currentDate = new Date();
  startDate = new Date().toISOString().substring(0, 10);
  endDate = new Date().toISOString().substring(0, 10);
  latestGlucoseLevelUnits: string = '';
  isLanguageEnglish = true;

  activityForm = this.fb.group({
    activityType: ['', Validators.required],
    activityDuration: { hour: 0, minute: 0 },
    activityTime: [{ hour: this.currentDate.getHours(), minute: this.currentDate.getMinutes() }],
    durationHour: ['',Validators.required],
    durationMinute: ['',Validators.required],
  })

  get activityFormCtrl(): any {
    return this.activityForm['controls'];
  }

  formProcess: boolean = false;

  errMsg: any = {
    class: 'hidden',
    msg: ''
  }

  constructor(private activityLevelService: ActivityLevelService, private glucoseService: GlucoseService, private insulinService: InsulinDosagesService, private router: Router, private modalService: ModalDialogService, private viewRef: ViewContainerRef, private fb: FormBuilder,private translate: TranslateService) { }

  ngOnInit() {

    this.translate.onLangChange.subscribe(result => {

      this.isLanguageEnglish = (result.lang === 'sv') ? false : true;

    });

  }
  loadGraph(){
    this.loadChartData();
  }
  getLatestGlucoseLevelUnits() {
    this.glucoseService.getLatestGlucoseLevel({}).subscribe((res: any) => {
      if (res.data)
        this.latestGlucoseLevelUnits = res.data;
      else
        this.latestGlucoseLevelUnits = '0';
    });
  }

  openModal(): void {
    setTimeout(() => {
      this.displayModal = true;
    }, 3000);
  }

  onChange() {
    this.errMsg = {
      class: 'hidden',
      msg: ''
    }
  }
  onDateChange(value) {
    this.loadChartData()
  }
  isSubmitted = false
  // durationHour
  // durationMinutes
  onSubmit(): void {

    this.isSubmitted = true
    const info = this.activityForm.value;
    // info.latestGlucoseLevelUnits = this.latestGlucoseLevelUnits;
    info.activityDuration.hour = +info.durationHour
    info.activityDuration.minute = +info.durationMinute
    let formInfo = {
      ...info
    }
    delete formInfo.durationHour
    delete formInfo.durationMinute

    let date = new Date();
    date.setHours(formInfo.activityTime.hour, formInfo.activityTime.minute, 0);
    formInfo.activityTime = date;

    if (this.activityForm.invalid) {
      return
    }
    this.glucoseService.getLatestGlucoseLevelByTime({ compareTime: formInfo.activityTime }).subscribe((res: any) => {

      if (res.data) {
        formInfo.latestGlucoseLevelUnits = res.data;
      } else {
        formInfo.latestGlucoseLevelUnits = '0';
      }
      this.activityLevelService.create(formInfo)
        .subscribe((res: any) => {

          this.formProcess = false;
          if (res.err) {
            this.errMsg.class = null;
            this.errMsg.msg = res.err;
            return;
          }
          ;
          let title, text;
          if (res.msg === 'success') {
            title = this.translate.instant('loginpop.title'),
            text = this.translate.instant('popupmessage.activitysuccess')
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
                text: this.translate.instant('loginpop.continue'),
                onAction: () => {
                  if (res.msg === 'success') {

                    this.activityForm.reset()
                    this.isSubmitted = false
                    this.activityForm.get('activityType').setValue('')
                    this.activityForm.get('activityTime').setValue({ hour: this.currentDate.getHours(), minute: this.currentDate.getMinutes() })
                    this.activityForm.get('activityDuration').setValue({ hour: 0, minute: 0 });
                    this.loadChartData();
                    this.activityCheckBoxGroup.glucoseCheck = true
                    this.activityCheckBoxGroup.insulinCheck = true
                    this.activityCheckBoxGroup.activityCheck = true
                    this.activityCheckBoxGroup.carbsCheck = true
                  }
                  return true;
                }
              }
            ],
          });
        });
    })

  }

  onTimeChange(value) {
    
  }

  onStartDateChange(value) {
    
  }

  onEndDateChange(value) {
 
  }

  

  generateCSV() {
    this.insulinService.getCsvData({
      startDate: this.startDate,
      endDate: this.endDate
    }).subscribe((res: any) => {

      this.insulinService.downloadFile(res.data, 'jsontocsv');
    }
    ),
      error => console.log('Error downloading the file.'),
      () => console.info('OK');

  }

  generateHistoricalCSV() {
    this.insulinService.getHistoricalCsvData({}).subscribe((res: any) => {

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
      glucoseRef[i].style.display = (this.activityCheckBoxGroup.glucoseCheck) ? 'block' : 'none'
    }
    for (var i = insulinRef.length - 1; i >= 0; --i) {
      insulinRef[i].style.display = (this.activityCheckBoxGroup.insulinCheck) ? 'block' : "none"
    }
    for (var i = carbsRef.length - 1; i >= 0; --i) {
      carbsRef[i].style.display = (this.activityCheckBoxGroup.carbsCheck) ? 'block' : 'none'
    }
    for (var i = activityRef.length - 1; i >= 0; --i) {
      activityRef[i].style.display = (this.activityCheckBoxGroup.activityCheck) ? 'block' : 'none'
    }
  }

  chartData: any;
  lableData = []
  lableDateFormat(dateStr) {
    return new Date(dateStr).getUTCFullYear() + '/' + new Date(dateStr).getUTCMonth() + 1 + '/' + new Date(dateStr).getUTCDate() + '/' + new Date(dateStr).getUTCHours() + ":" + new Date(dateStr).getUTCMinutes()
  }
  loadChartData() {
    this.insulinService.getChartData({
      startDate: this.startDate,
      endDate: this.endDate
    }).subscribe(res => {

      this.chartData = res['data']
      // res['data']['insulinLabel'].forEach(elem => this.lableData.push(elem))
      // res['data']['activityLabel'].forEach(elem => this.lableData.push(elem))
      this.lableData = []
      res['data']['insulin'].map(elem => {
        elem.x = new Date(elem.x).getTime()
        elem.meta = "Insulin"
        return elem
      })
      res['data']['activity'].map(elem => {
        elem.x = new Date(elem.x).getTime()
        elem.meta = "Activity"
        return elem
      })
      res['data']['carbs'].map(elem => {
        elem.x = new Date(elem.x).getTime()
        elem.meta = "Carbs"
        return elem
      })
      res['data']['glucose'].map(elem => {
        elem.x = new Date(elem.x).getTime()
        elem.meta = "Glucose"
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

      this.loadChart();
    })
  }


  loadChart() {
    this.activityCheckBoxGroup.glucoseCheck = true
    this.activityCheckBoxGroup.insulinCheck = true
    this.activityCheckBoxGroup.activityCheck = true
    this.activityCheckBoxGroup.carbsCheck = true
    var chartwidth = $("#modal-body2").width()*0.95;

    var chart = new Chartist.Line('#chartist-chart1', {
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
          data: this.chartData['activity']
        },
        {
          name: 'series-4',
          data: this.chartData['carbs']
        }

      ]
    }, {
        axisX: {

          type: Chartist.FixedScaleAxis,
          divisor: 5,
          labelInterpolationFnc: function (value) {
            return moment(value).format('MM/DD/YYYY HH:mm');
            // return value
          }
        },


        // axisX: {
        //   type: Chartist.AutoScaleAxis,
        //   onlyInteger: false
        // },
        height: 400,
        width: chartwidth,
        fullWidth: true,
        // Within the series options you can use the series names
        // to specify configuration that will only be used for the
        // specific series.
        plugins: [
          Chartist.plugins.tooltip({
            transformTooltipTextFnc: function(tooltip) {
              let xy = tooltip.split(",");
              // let tooltipX = moment(+xy[0]).format('YYYY/MM/DD HH:mm');
              let tooltipX = moment(+xy[0]).format('MM/DD/YYYY HH:mm');
              return `${tooltipX}`;
            }
          })
        ],
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
          },
          'series-4': {
            showLine: false
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
