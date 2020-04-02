import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation
} from "@angular/core";
import { InsulinDosagesService } from "../services/insulin-dosages.service";
import { single, multi1, multi, linear } from "../data/data.model";
import * as Jquery from "jquery";
import { Options, LabelType, ChangeContext } from "ng5-slider";

import { DatePipe } from "@angular/common";

import { HttpClient } from "@angular/common/http";
declare var makeDistroChart: any;
declare var makeDistroChartBox: any;
declare var rSlider: any;
declare var d3: any;

@Component({
  selector: "app-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe]
})
export class ReportComponent implements OnInit {
  @ViewChild("dataContainer") dataContainer: ElementRef;
  @ViewChild("sliderButton") sliderButton: ElementRef;
  constructor(
    private insulinService: InsulinDosagesService,
    private http: HttpClient,
    private datePipe: DatePipe
  ) {
    Object.assign(this, { single });
    Object.assign(this, { linear });
    // Object.assign(this, { multi1 });
    //console.log("multi1");
    //console.log(multi1);
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
  xAxisLabel = "Time/Date";
  xAxisLabel1 = "Time/Date";
  showYAxisLabel = true;
  yAxisLabel = "Dosage Unit";
  yAxisLabel1 = "Duration";
  yAxisLabelGlucose = "Glucose Level";

  legend = true;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  timeline = true;

  colorScheme = {
    domain: ["#9ecae6", "#c6aed0", "#d29494", "#d59c9c"]
  };

  colorScheme1 = {
    domain: ["#3CB371", "#64c12abf", "#c12abcbf", "#432aa9bf"]
  };
  colorSchemeCarbs = {
    domain: ["#ffdb58", "#64c12abf", "#c12abcbf", "#432aa9bf"]
  };
  colorSchemeGlucose = {
    domain: ["slateblue", "#64c12abf", "#c12abcbf", "#432aa9bf"]
  };
  glucoseType = ["", "Before Meal", "After Meal", "Any other time"];
  insulinType = ["Before Meal1", "After Meal", "Any other time"];
  carbsType = ["", "Carbohydrates", "Protein", "Fibers"];
  startDate = new Date(new Date().setDate(new Date().getDate() - 3650))
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
  legendsarray: any = ["1", "2", "3"];
  legendsactivity: any = ["walking", "jogging", "running", "lifting_weight"];
  // legendscarbs: any = ['carbohydrates', 'proteins', 'fibers'];
  legendscarbs: any = [ "1", "2", "3"];

  dateRange: Date[] = this.createDateRange();
  value: number = new Date(this.startDate).getTime();
  maxValue: number = new Date(this.endDate).getTime();

  options: Options = {
    stepsArray: this.dateRange.map((date: Date) => {
      return { value: date.getTime() };
    }),
    translate: (value: number, label: LabelType): string => {
      return new Date(value).toDateString();
    }
  };

  createDateRange(): Date[] {
    const dates: Date[] = [];
    let startDate = new Date(this.startDate);
    let endDate = new Date(this.endDate);
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
    this.getReportData();
  }

  onUserChange(changeContext: ChangeContext): void {

    this.startDate = new Date(changeContext.value).toDateString();
    this.endDate = new Date(changeContext.highValue).toDateString();
    this.getReportData();
  }

  zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  formatDT(__dt) {
    var year = __dt.getFullYear();
    var month = this.zeroPad(__dt.getMonth() + 1, 2);
    var date = this.zeroPad(__dt.getDate(), 2);
    var hours = this.zeroPad(__dt.getHours(), 2);
    var minutes = this.zeroPad(__dt.getMinutes(), 2);
    var seconds = this.zeroPad(__dt.getSeconds(), 2);
    return (
      year +
      "-" +
      month +
      "-" +
      date +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds
    );
  }

  slider() {}

  DosageTypeChange(event, target) {


    if (event) {
      this.legendsarray.push(target);
    } else {
      let found = this.legendsarray.find(e => e == target);
      if (found) {
        let index = this.legendsarray.indexOf(target);
        this.legendsarray.splice(index, 1);
      }
    }
    this.getInsulinReportData(this.legendsarray);
  }

  activitiesTypeChange(event, target) {

    if (event) {
      this.legendsactivity.push(target);

    } else {
      let found = this.legendsactivity.find(e => e == target);
      if (found) {
        let index = this.legendsactivity.indexOf(target);
        this.legendsactivity.splice(index, 1);
      }
    }
    this.getActivityReportData(this.legendsactivity);
  }

  carbsTypeChange(event, target) {

    if (event) {
      this.legendscarbs.push(target);
    } else {
      const found = this.legendscarbs.find(e => e == target);
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
      carbsType: query
    };
    this.isLoading = true;

    this.insulinService.getCarbsReportData(data).subscribe((res: any) => {

      let count3 = 0;
      let obj3 = [{ name: "Crabs", series: [] }];

      for (let [key, value] of Object.entries(res.data)) {
        obj3[0].series[count3] = {};
        obj3[0].series[count3].name = new Date(value["carbsTime"]);
        obj3[0].series[count3].value = 5;
        obj3[0].series[count3].carbsTime = new Date(value["carbsTime"]);
        obj3[0].series[count3].carbsType = this.carbsType[value["carbsType"]];
        obj3[0].series[count3].carbsItem = value["carbsItem"];
        count3++;
        this.carbsobj = obj3;
      }
    });

  }

  boxPlot(this_data) {
    let chart1;

    this_data.forEach(function(d) {
      d.value = +d.value;
    });

    document.getElementById("chart-distro1").innerHTML = "";
    chart1 = makeDistroChartBox({
      data: this_data,
      xName: "date",
      yName: "value",
      axisLabels: { xAxis: null, yAxis: "Dosage Units" },
      selector: "#chart-distro1",
      chartSize: { height: 530, width: 960 },
      constrainExtremes: true
    });
    chart1.renderBoxPlot();
  }

  scatterPlot(this_data) {

    let chart2;

    this_data.forEach(function(d) {
      d.value = +d.value;
    });

    document.getElementById("chart-distro2").innerHTML = "";
    chart2 = makeDistroChart({
      data: this_data,
      xName: "date",
      yName: "value",
      axisLabels: { xAxis: null, yAxis: "Activity Duration" },
      selector: "#chart-distro2",
      chartSize: { height: 530, width: 960 },
      constrainExtremes: true
    });
    chart2.renderDataPlots();
    chart2.dataPlots.show({
      showPlot: true,
      plotType: 40,
      showBeanLines: false,
      colors: null
    });
    this.sliderButton.nativeElement.click();
  }

  onSelectInsulin(event) {
    var elements = document.querySelectorAll(".legend-label-text");
    let arr = [];
    elements.forEach(el => {
      if (el.textContent.trim() == event) {
        if (el["style"].textDecoration == "line-through") {
          el["style"].textDecoration = "";
          if (event == "After Meal") {
            const index = this.insilinArray.indexOf(2);
            if (index > -1) {
              this.insilinArray.splice(index, 1);
            }

            this.getInsulinReportData(this.insilinArray);
          } else if (event == "Before Meal") {
            const index = this.insilinArray.indexOf(1);
            if (index > -1) {
              this.insilinArray.splice(index, 1);
            }

            this.getInsulinReportData(this.insilinArray);
          } else if (event == "Any other time") {
            const index = this.insilinArray.indexOf(3);
            if (index > -1) {
              this.insilinArray.splice(index, 1);
            }

            this.getInsulinReportData(this.insilinArray);
          }
        } else {
          el["style"].textDecoration = "line-through";
          if (event == "After Meal") {
            const index = this.insilinArray.indexOf(2);
            if (index < 0) {
              this.insilinArray.push(2);
            }

            this.getInsulinReportData(this.insilinArray);
          } else if (event == "Before Meal") {
            const index = this.insilinArray.indexOf(1);
            if (index < 0) {
              this.insilinArray.push(1);
            }

            this.getInsulinReportData(this.insilinArray);
          } else if (event == "Any other time") {
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
    if (target == "INSULIN") {
      this.showInsulin = !this.showInsulin;
    }
    if (target == "ACTIVITY") {
      this.showActivity = !this.showActivity;
    }
    if (target == "CARBS") {
      this.showCarbs = !this.showCarbs;
    }
    if (target == "GLUCOSE") {
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
        endDate: this.endDate
      })
      .subscribe((res: any) => {

        this.insulinService.downloadFile(res.data, "jsontocsv");
      }),
      error =>
      () => console.info("OK");
  }

  generateHistoricalCSV() {
    this.insulinService.getHistoricalCsvData({}).subscribe((res: any) => {
      this.insulinService.downloadFile(res.data, "jsontocsv");
    }),
      error =>
      () => console.info("OK");
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
      return xs.reduce(function(rv, x) {
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
      endDate: this.endDate
    };
    this.isLoading = true;
    this.insulinService.getReportData(data).subscribe(
      (res: any) => {
        this.reportData = this.parseData(res.data);
        this.reportData.map(elem => {
          const myDate = elem.entryTime;
          elem["commonTime"] = myDate;
          if (elem.type == "insulin") {
            if (elem.insulinType) {
              elem["insulinType"] = elem.insulinType;
            } else {
              elem["insulinType"] = "";
            }
            if (elem.dosageType == "1") {
              elem["name"] = "Before Meal";
            } else if (elem.dosageType == "2") {
              elem["name"] = "After Meal";
            } else {
              elem["name"] = "Any other time";
            }

            elem["value"] = elem.dosageUnits;
          } else if (elem.type == "activity") {
            elem["value"] = Math.abs(
              elem.activityDuration.hour * 60 + elem.activityDuration.minute
            );
            elem["name"] = this.datePipe.transform(elem.entryTime, "MMM,y");
          } else if (elem.type == "glucose") {
          } else if (elem.type == "carbs") {
          }
          return elem;
        });

        this.groupedReport = this.groupBy(this.reportData, "type");

        const insulin = this.groupedReport.insulin; // this.groupBy(this.groupedReport.insulin, 'entryTime');
        const activity = this.groupedReport.activity; // this.groupBy(this.groupedReport.activity, 'activityType');
        const carbs = this.groupedReport.carbs; // this.groupBy(this.groupedReport.activity, 'activityType');
        const glucose = this.groupedReport.glucose; // this.groupBy(this.groupedReport.activity, 'activityType');
        let obj1 = [];
        let objvoilin = [];
        let objscatter = [];
        let obj2 = [{ name: "Activity", series: [] }];
        let obj3 = [{ name: "Crabs", series: [] }];
        let obj4 = [{ name: "Glucose", series: [] }];
        let count = 0;
        let count2 = 0;
        let count3 = 0;
        let count4 = 0;

        for (let [key, value] of Object.entries(insulin)) {
          obj1[count] = {};
          objvoilin[count] = {};
          obj1[count].name = this.datePipe.transform(
            value["dosageTime"],
            "MMM,y"
          );
          objvoilin[count].date = value["name"];
          objvoilin[count].value = value["value"];
          if (value["name"] === "Before Meal") {
            objvoilin[count].order = 1;
          } else if (value["name"] === "After Meal") {
            objvoilin[count].order = 2;
          } else {
            objvoilin[count].order = 3;
          }
          obj1[count].series = [
            {
              name: value["name"],
              value: value["value"],
              insulinType: value["insulinType"],
              dosageTime: value["dosageTime"]
            }
          ];
          count++;

          this.multi = obj1;
          if (count === insulin.length) {
            objvoilin.sort((a, b) =>
              a.order > b.order ? 1 : b.order > a.order ? -1 : 0
            );

            this.boxPlot(objvoilin);
          }

        }
        for (let [key, value] of Object.entries(activity)) {
          obj2[0].series[count2] = {};
          objscatter[count2] = {};
          obj2[0].series[count2].name = new Date(value["activityTime"]);
          obj2[0].series[count2].value = value["value"];
          obj2[0].series[count2].activityTime = value["activityTime"];
          obj2[0].series[count2].activityType = value["activityType"];
          objscatter[count2].date = value["activityType"];
          objscatter[count2].value = value["value"];
          let hour_text = " hour, ";
          let minute_text = " minute ";
          if (value["activityDuration"]["hour"] > 1) {
            hour_text = " hours, ";
          }
          if (value["activityDuration"]["minute"] > 1) {
            minute_text = " minutes ";
          }
          obj2[0].series[count2].activityDuration =
            value["activityDuration"]["hour"] +
            hour_text +
            value["activityDuration"]["minute"] +
            minute_text;

          // Added activity time and duration
          objscatter[count2].activityTime = obj2[0].series[count2].activityTime;
          objscatter[count2].activityDuration = obj2[0].series[count2].activityDuration;

          count2++;
          this.activityobj = obj2;
          if (count2 === activity.length) {
            //console.log("this.objscatter");
            //console.log(objscatter);

            this.scatterPlot(objscatter);
          }
        }
        // -------------------------------Carb charts ---------------------------------//
        // -------------------------------Carb charts ---------------------------------//
        // -------------------------------Carb charts ---------------------------------//

        for (let [key, value] of Object.entries(carbs)) {
          obj3[0].series[count3] = {};
          obj3[0].series[count3].name = new Date(value["carbsTime"]);
          obj3[0].series[count3].value = 5;
          obj3[0].series[count3].carbsTime = new Date(value["carbsTime"]);
          obj3[0].series[count3].carbsType = this.carbsType[value["carbsType"]];
          obj3[0].series[count3].carbsItem = value["carbsItem"];
          count3++;
          this.carbsobj = obj3;
        }

        // -------------------------------glucose charts ---------------------------------//
        // -------------------------------glucose charts ---------------------------------//
        // -------------------------------glucose charts ---------------------------------//
        for (let [key, value] of Object.entries(glucose)) {
          obj4[0].series[count4] = {};
          obj4[0].series[count4].name = new Date(value["glucoseTime"]);
          obj4[0].series[count4].value = value["glucoseLevelUnits"];
          obj4[0].series[count4].glucoseTime = new Date(value["glucoseTime"]);
          obj4[0].series[count4].glucoseType = this.glucoseType[
            value["glucoseType"]
          ];
          obj4[0].series[count4].glucoseLevelUnits = value["glucoseLevelUnits"];
          count4++;
          this.golucoseobj = obj4;
        }
        this.isLoading = false;
      },
      error => {
        //console.log(error);
      }
    );
  }

  getActivityReportData(activityType) {
    const activity = this.groupedReport.activity;

    const data = {
      startDate: this.startDate,
      endDate: this.endDate,
      activity: activityType
    };
    this.isLoading = true;
    this.insulinService.getactivityReportData(data).subscribe(
      (res: any) => {
        let new_data_activity = this.parseData(res.data);

        // -------------------------------------------- //
        // --------------------------------------------//
        // --------------------------------------------//
        new_data_activity.map(elem => {
          const myDate = elem.entryTime; // new Date(elem.entryTime).setHours(0, 0, 0, 0);
          elem["commonTime"] = myDate;
            if (elem.type == "activity") {
            elem["value"] = Math.abs(
              elem.activityDuration.hour * 60 + elem.activityDuration.minute
            );
            elem["name"] = this.datePipe.transform(elem.entryTime, "MMM,y");
          }
          return elem;
        });
        console.log("new_data_activity")
        console.log(new_data_activity)
        let groupedDataActivity = this.groupBy(new_data_activity, "type");
        console.log("groupedDataActivity")
        console.log(groupedDataActivity)
        const activity = groupedDataActivity.activity;
        // --------------------------------------------//
        // --------------------------------------------//
        let obj2 = [{ name: "Activity", series: [] }];
        let count2 = 0;
        let objscatter = [];

        for (let [key, value] of Object.entries(activity)) {
          console.log(count2, activity.length)
          obj2[0].series[count2] = {};
          objscatter[count2] = {};
          obj2[0].series[count2].name = new Date(value["activityTime"]);
          obj2[0].series[count2].value = value["value"];
          obj2[0].series[count2].activityTime = value["activityTime"];
          obj2[0].series[count2].activityType = value["activityType"];
          objscatter[count2].date = value["activityType"];
          objscatter[count2].value = value["value"];
          let hour_text = " hour, ";
          let minute_text = " minute ";
          if (value["activityDuration"]["hour"] > 1) {
            hour_text = " hours, ";
          }
          if (value["activityDuration"]["minute"] > 1) {
            minute_text = " minutes ";
          }
          obj2[0].series[count2].activityDuration =
            value["activityDuration"]["hour"] +
            hour_text +
            value["activityDuration"]["minute"] +
            minute_text;

          // Added activity time and duration
          objscatter[count2].activityTime = obj2[0].series[count2].activityTime;
          objscatter[count2].activityDuration = obj2[0].series[count2].activityDuration;

          count2++;
          this.activityobj = obj2;
          if (count2 === activity.length) {
            console.log("this.objscatter");
            console.log(objscatter);

            this.scatterPlot(objscatter);
          }
        }

        this.isLoading = false;
      },
      error => {
        //console.log(error);
      }
    );
  }

  getInsulinReportData(dosageType) {

    const data = {
      startDate: this.startDate,
      endDate: this.endDate,
      dosageType: dosageType
    };
    this.isLoading = true;
    this.insulinService.getInsulinReportData(data).subscribe(
      (res: any) => {
        this.reportData = this.parseData(res.data);
        this.reportData.map(elem => {
          const myDate = elem.entryTime; // new Date(elem.entryTime).setHours(0, 0, 0, 0);
          elem["commonTime"] = myDate;
          if (elem.type == "insulin") {
            if (elem.insulinType) {
              elem["insulinType"] = elem.insulinType;
            } else {
              elem["insulinType"] = "";
            }
            if (elem.dosageType == "1") {
              elem["name"] = "Before Meal";
            } else if (elem.dosageType == "2") {
              elem["name"] = "After Meal";
            } else {
              elem["name"] = "Any other time";
            }

            elem["value"] = elem.dosageUnits;
          }
          return elem;
        });
        //console.log("reportData", this.reportData);
        this.groupedReport = this.groupBy(this.reportData, "type");
        const insulin = this.groupedReport.insulin;

        if (insulin !== undefined) {
          let obj1 = [];
          let count = 0;
          for (let [key, value] of Object.entries(insulin)) {
            obj1[count] = {};
            obj1[count] = {};
            obj1[count].name = this.datePipe.transform(
              value["dosageTime"],
              "MMM,y"
            );
            obj1[count].date = value["name"];
            obj1[count].value = value["value"];
            if (value["name"] === "Before Meal") {
              obj1[count].order = 1;
            } else if (value["name"] === "After Meal") {
              obj1[count].order = 2;
            } else {
              obj1[count].order = 3;
            }
            obj1[count].series = [
              {
                name: value["name"],
                value: value["value"],
                insulinType: value["insulinType"],
                dosageTime: value["dosageTime"]
              }
            ];
            count++;
            // //console.log('count');
            // //console.log(count);
            this.multi = obj1;
            if (count === insulin.length) {
              // //console.log("this.objvoilin");
              // //console.log( objvoilin);
              obj1.sort((a, b) =>
                a.order > b.order ? 1 : b.order > a.order ? -1 : 0
              );

              this.boxPlot(obj1);
            }
            // }
          }
        } else {
          let obj = [];
          this.boxPlot(obj);
        }

        this.isLoading = false;
      },
      error => {
        //console.log(error);
      }
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

    if (type == "START") {
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
      if (keys.includes("glucoseType")) {
        item.type = "glucose";
      } else if (keys.includes("activityType")) {
        item.type = "activity";
      } else if (keys.includes("carbsType")) {
        item.type = "carbs";
      } else if (keys.includes("dosageType")) {
        item.type = "insulin";
      }
    }
    return data;
  }
}
