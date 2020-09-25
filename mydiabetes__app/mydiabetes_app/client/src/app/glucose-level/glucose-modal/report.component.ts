import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  NgZone
} from "@angular/core";
import { InsulinDosagesService } from "../../services/insulin-dosages.service";
import { single, multi1, multi, linear } from "../../data/data.model";
import * as Jquery from "jquery";
import { Options, LabelType, ChangeContext } from "ng5-slider";

import { DatePipe } from "@angular/common";
import { TranslateService } from '@ngx-translate/core';

import { HttpClient } from "@angular/common/http";
declare var makeDistroChart: any;
declare var makeDistroChartBox: any;
declare var makeDistroCrabsChart: any;
declare var rSlider: any;
declare var d3: any;
declare var d3version4: any;
declare var GlucoseSlider: any;
@Component({
  selector: "app-glucose-modal",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe],
})
export class GlucoseModalComponent implements OnInit {
  @ViewChild("dataContainer") dataContainer: ElementRef;
  @ViewChild("sliderButton") sliderButton: ElementRef;
  islanguageEnglish = true;
  constructor(
    private insulinService: InsulinDosagesService,
    private http: HttpClient,
    private translate: TranslateService,
    private datePipe: DatePipe,
    private ngZone: NgZone
  ) {
    Object.assign(this, { single });
    Object.assign(this, { linear });
    this.islanguageEnglish = (translate.currentLang === 'sv')? false : true;
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
    domain: ["#9ecae6", "#c6aed0", "#d29494", "#d59c9c"],
  };

  colorScheme1 = {
    domain: ["#3CB371", "#64c12abf", "#c12abcbf", "#432aa9bf"],
  };
  colorSchemeCarbs = {
    domain: ["#ffdb58", "#64c12abf", "#c12abcbf", "#432aa9bf"],
  };
  colorSchemeGlucose = {
    domain: ["slateblue", "#64c12abf", "#c12abcbf", "#432aa9bf"],
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
  legendscarbs: any = ["1", "2", "3"];

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
    window['angularGlucoseReference'] = { component: this, zone: this.ngZone, loadAngularFunction: () => this.glucoseSliderEnd() };
    this.getReportData();
  }

  glucoseSliderEnd() {

    this.setDates();
    this.getReportData();
  }

  setDates() {

    this.startDate = localStorage.getItem('startDate');
    this.endDate = localStorage.getItem('endDate');

    localStorage.removeItem('startDate');
    localStorage.removeItem('endDate');

  }

  onUserChange(changeContext: ChangeContext): void {
    let lowDate = new Date(changeContext.value);
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

    let highDate = new Date(changeContext.highValue);
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


  DosageTypeChange(event, target) {
    if (event) {
      this.legendsarray.push(target);
    } else {
      let found = this.legendsarray.find((e) => e == target);
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
      let found = this.legendsactivity.find((e) => e == target);
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
      let obj3 = [{ name: "Crabs", series: [] }];
      let objcrabscatter = [];

      for (let [key, value] of Object.entries(res.data)) {
        obj3[0].series[count3] = {};
        objcrabscatter[count3] = {};
        obj3[0].series[count3].name = new Date(value["carbsTime"]);
        obj3[0].series[count3].value = 5;
        obj3[0].series[count3].carbsTime = new Date(value["carbsTime"]);
        obj3[0].series[count3].carbsType = this.carbsType[value["carbsType"]];
        obj3[0].series[count3].carbsItem = value["carbsItem"];
        this.carbsobj = obj3;

        // objcrabscatter[count3].carabsTime =  value["carbsTime"] ;
        // objcrabscatter[count3].carbsType = obj3[0].series[count3].carbsType;
        objcrabscatter[count3].carabsTime =  value["carbsTime"] ;
        objcrabscatter[count3].carbsType = value["carbsType"];
        objcrabscatter[count3].carbsItem = obj3[0].series[count3].carbsItem;
        count3++;

        if (count3 === res.data.length) {
          this.carbsScatterPlot(objcrabscatter);
        }
      }

    });
  }

  onResize(event) {
    if(this.golucoseobj) {
      
      this.drawGolucoseLineChart123(this.golucoseobj[0].series);
    }
  }

  drawGolucoseLineChart123(lineData) {
    var node = document.querySelector("#chartArea");
    node.innerHTML = "";
    let glucoseLabel = (this.islanguageEnglish) ? 'Glucose Level' : 'Glukosnivån';

    var margin = { top: 50, right: 10, bottom: 60, left: 50 };
    var width, height;

    if (window.matchMedia('(max-width: 767px)')['matches']) {

      width = 390 - margin.left - margin.right,
      height = 310 - margin.top - margin.bottom;

    } else {
      width = 590 - margin.left - margin.right,
      height = 310 - margin.top - margin.bottom;

    }

    var x = d3.time.scale().range([0, width]);

    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg
      .axis()
      .scale(x)
      .ticks(d3.time.hours, 24)
      .tickSize(4)
      .orient("bottom");

    var xMinorAxis = d3.svg
      .axis()
      .scale(x)
      .ticks(d3.time.hours, 12)
      .orient("bottom");

    var yAxis = d3.svg.axis().scale(y).orient("left");

    var line = d3.svg
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.total_km);
      });

    var div = d3
      .select("#chartArea")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("background-color", "#FFFFFF")
      .style("font-weight", "bold").style('font-size', '12px');

    var svg = d3
      .select("#chartArea")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var parseDate = d3.time.format("%Y-%m-%d %X");
    var formatTime = d3.time.format("%e %b %-I:%M %p");
    var formatCount = d3.format(",");

    function make_y_axis() {
      return d3.svg.axis().scale(y).orient("left");
    }

    var data = lineData;

    data = data.filter((month, idx) => idx < 10);

    data.forEach(function (d) {
      d.date = d.date_time;
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
      .append("g")
      .attr("class", "grid")
      .call(make_y_axis().tickSize(-width, 0, 0).tickFormat(""));

    svg.append("path").datum(data).attr("class", "line").attr("d", line);

    var g = svg.selectAll().data(data).enter().append("g");

    g.append("circle")
      .attr("r", 4.5)
      .attr("cx", function (d) {
        return x(d.date);
      })
      .attr("cy", function (d) {
        return y(d.total_km);
      });

    g.append("line")
      .attr("class", "x")
      .attr("id", "dashedLine")

      .style("opacity", 0)
      .attr("x1", function (d) {
        return x(d.date);
      })
      .attr("y1", function (d) {
        return y(d.total_km);
      })
      .attr("x2", function (d) {
        return x(d3.min(x));
      })
      .attr("y2", function (d) {
        return y(d.total_km);
      });

    g.append("line")
      .attr("class", "y")
      .attr("id", "dashedLine")
      .style("opacity", 0)
      .attr("x1", function (d) {
        return x(d.date);
      })
      .attr("y1", function (d) {
        return y(d.total_km);
      })
      .attr("x2", function (d) {
        return x(d.date);
      })
      .attr("y2", height);

    g.selectAll("circle")
      .on("mouseover", function (d) {
        div.transition().duration(200).style("opacity", 0.7);
        let date = new Date(d.date);
        var day: any;
        var month: any;
        var hours: any;
        var minutes: any;
        var seconds: any;
        day = date.getDay();

        month = date.getMonth() + 1;
        var year = date.getFullYear();
        hours = date.getHours();
        minutes = date.getMinutes();
        seconds = date.getSeconds();

        if (day < 10) {
          day = "0" + day;
        }

        if (month < 10) {
          month = "0" + month;
        }

        if (Number(hours) < 10) {
          hours = "0" + hours;
        }

        if (Number(minutes) < 10) {
          minutes = "0" + minutes;
        }

        if (Number(seconds) < 10) {
          seconds = "0" + seconds;
        }

        if (window.matchMedia('(max-width: 767px)')['matches']) {

          div.html(
            "Glucose Specification Time: " +
              d.glucoseType +
              "<br/>" +
              `${glucoseLabel}: ` +
              formatCount(d.total_km) + ' mmol/L ' +
              "<br/>" +
              "Glucose checking Time: " +
              `${day}-${month}-${year} (${hours}:${minutes}:${seconds})`
          )
          .style("left", d3.event.pageX - 10 + "px")
          .style("top", d3.event.pageY - 1218 + "px")
          .style("width", "45%");

        } else {

          div.html(
            "Glucose Specification Time: " +
              d.glucoseType +
              "<br/>" +
              `${glucoseLabel}: ` +
              formatCount(d.total_km) + ' mmol/L ' +
              "<br/>" +
              "Glucose checking Time: " +
              `${day}-${month}-${year} (${hours}:${minutes}:${seconds})`
          )
          .style("left", d3.event.pageX - 310 + "px")
          .style("top", d3.event.pageY - 166 + "px")
          .style("width", "45%");

        }



        d3.select(this.nextElementSibling)
          .transition()
          .duration(200)
          .style("opacity", 0.7);

        d3.select(this.nextElementSibling.nextElementSibling)
          .transition()
          .duration(200)
          .style("opacity", 0.7);
      })

      .on("mouseout", function (d) {
        div.transition().duration(500).style("opacity", 0);

        d3.select(this.nextElementSibling)
          .transition()
          .duration(500)
          .style("opacity", 0);

        d3.select(this.nextElementSibling.nextElementSibling)
          .transition()
          .duration(500)
          .style("opacity", 0);
      });

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll(".tick text")
      .call(wrap, 35);

    svg
      .append("g")
      .attr("class", "xMinorAxis")
      .attr("transform", "translate(0," + height + ")")
      .style({ stroke: "Black", fill: "none", "stroke-width": "1px" })
      .call(xMinorAxis)
      .selectAll("text")
      .remove();

    svg
      .append("text") // text label for the y-axis
      .attr("y", 20 - margin.left)
      .attr("x", 50 - height / 2)
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end")
      .style("font-size", "16px")
      .text(glucoseLabel);


    svg.append("g").attr("class", "y axis").call(yAxis);


    // http://bl.ocks.org/mbostock/7555321
    // This code wraps label text if it has too much text
    function wrap(text, width) {
      text.each(function () {
        var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text
            .text(null)
            .append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", dy + "em");
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text
              .append("tspan")
              .attr("x", 0)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word);
          }
        }
      });
    }

  }

  boxPlot(this_data) {

  }

  scatterPlot(this_data) {
  
    // let chartarr = [];
    // let walkingarr = [];
    // let joggingarr = [];
    // let runningarr = [];
    // let liftingarr = [];
    // walkingarr = this_data.filter((e) => e.date == "walking");
    // joggingarr = this_data.filter((e) => e.date == "jogging");
    // runningarr = this_data.filter((e) => e.date == "running");
    // liftingarr = this_data.filter((e) => e.date == "lifting_weight");
    // if (walkingarr.length > 0) {
    // chartarr=  chartarr.concat(walkingarr);
    // } 
    //  if (joggingarr.length > 0) {
    //   chartarr= chartarr.concat(joggingarr);
    // } 
    // if (runningarr.length > 0) {
    //   chartarr= chartarr.concat(runningarr);
    // }   if (liftingarr.length > 0) {
    //   chartarr=  chartarr.concat(liftingarr);
    // }
    //    let chart2;
    // chartarr.forEach(function (d) {
    //   d.value = +d.value % 60;
    // });

    // document.getElementById("chart-distro2").innerHTML = "";
    // chart2 = makeDistroChart({
    //   data: chartarr,
    //   xName: "date",
    //   yName: "value",
    //   axisLabels: { xAxis: null, yAxis: "Activity Duration" },
    //   selector: "#chart-distro2",
    //   chartSize: { height: 240, width: 960 },
    //   constrainExtremes: true,
    // });
    // chart2.renderDataPlots();
    // chart2.dataPlots.show({
    //   showPlot: true,
    //   plotType: 9,
    //   showBeanLines: false,
    //   colors: null,
    // });
    // this.sliderButton.nativeElement.click();
  }

  carbsScatterPlot(this_data) {

  }

  onSelectInsulin(event) {
    // var elements = document.querySelectorAll(".legend-label-text");
    // let arr = [];
    // elements.forEach((el) => {
    //   if (el.textContent.trim() == event) {
    //     if (el["style"].textDecoration == "line-through") {
    //       el["style"].textDecoration = "";
    //       if (event == "After Meal") {
    //         const index = this.insilinArray.indexOf(2);
    //         if (index > -1) {
    //           this.insilinArray.splice(index, 1);
    //         }

    //         this.getInsulinReportData(this.insilinArray);
    //       } else if (event == "Before Meal") {
    //         const index = this.insilinArray.indexOf(1);
    //         if (index > -1) {
    //           this.insilinArray.splice(index, 1);
    //         }

    //         this.getInsulinReportData(this.insilinArray);
    //       } else if (event == "Any other time") {
    //         const index = this.insilinArray.indexOf(3);
    //         if (index > -1) {
    //           this.insilinArray.splice(index, 1);
    //         }

    //         this.getInsulinReportData(this.insilinArray);
    //       }
    //     } else {
    //       el["style"].textDecoration = "line-through";
    //       if (event == "After Meal") {
    //         const index = this.insilinArray.indexOf(2);
    //         if (index < 0) {
    //           this.insilinArray.push(2);
    //         }

    //         this.getInsulinReportData(this.insilinArray);
    //       } else if (event == "Before Meal") {
    //         const index = this.insilinArray.indexOf(1);
    //         if (index < 0) {
    //           this.insilinArray.push(1);
    //         }

    //         this.getInsulinReportData(this.insilinArray);
    //       } else if (event == "Any other time") {
    //         const index = this.insilinArray.indexOf(3);
    //         if (index < 0) {
    //           this.insilinArray.push(3);
    //         }

    //         this.getInsulinReportData(this.insilinArray);
    //       }
    //     }
    //   }
    // });
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
        endDate: this.endDate,
      })
      .subscribe((res: any) => {
        this.insulinService.downloadFile(res.data, "jsontocsv");
      }),
      (error) => () => console.info("OK");
  }

  generateHistoricalCSV() {
    this.insulinService.getHistoricalCsvData({}).subscribe((res: any) => {
      this.insulinService.downloadFile(res.data, "jsontocsv");
    }),
      (error) => () => console.info("OK");
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

        const insulin = this.groupedReport.insulin;
        const activity = this.groupedReport.activity;
        const carbs = this.groupedReport.carbs;
        const glucose = this.groupedReport.glucose;
        let obj1 = [];
        let objvoilin = [];
        let objscatter = [];
        let objcrabscatter = [];
        let obj2 = [{ name: "Activity", series: [] }];
        let obj3 = [{ name: "Crabs", series: [] }];
        let obj4 = [{ name: "Glucose", series: [] }];
        let count = 0;
        let sliderObjGlucose = {};
        let glucoseLabels = [];
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
              dosageTime: value["dosageTime"],
            },
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
          objscatter[count2].activityDuration =
            obj2[0].series[count2].activityDuration;

          count2++;
          this.activityobj = obj2;
          if (count2 === activity.length) {
            this.scatterPlot(objscatter);
          }
        }
        // -------------------------------Carb charts ---------------------------------//
        // -------------------------------Carb charts ---------------------------------//
        // -------------------------------Carb charts ---------------------------------//

        for (let [key, value] of Object.entries(carbs)) {
          obj3[0].series[count3] = {};
          objcrabscatter[count3] = {};
          obj3[0].series[count3].name = new Date(value["carbsTime"]);
          obj3[0].series[count3].value = 5;
          obj3[0].series[count3].carbsTime = new Date(value["carbsTime"]);
          obj3[0].series[count3].carbsType = this.carbsType[value["carbsType"]];
          obj3[0].series[count3].carbsItem = value["carbsItem"];
          this.carbsobj = obj3;

          objcrabscatter[count3].carabsTime =  value["carbsTime"] ;
          objcrabscatter[count3].carbsType = value["carbsType"];
          objcrabscatter[count3].carbsItem = obj3[0].series[count3].carbsItem;
          count3++;

          if (count3 === carbs.length) {
            this.carbsScatterPlot(objcrabscatter);
          }
        }

        // -------------------------------glucose charts ---------------------------------//
        // -------------------------------glucose charts ---------------------------------//
        // -------------------------------glucose charts ---------------------------------//
        for (let [key, value] of Object.entries(glucose)) {
          obj4[0].series[count4] = {};
          obj4[0].series[count4].date_time = new Date(value["glucoseTime"]);
          if (isNaN(value["glucoseLevelUnits"])) {
            value["glucoseLevelUnits"] = 0;
          }
          if (value["glucoseLevelUnits"] > 90) {
            value["glucoseLevelUnits"] = 30;
          }
          obj4[0].series[count4].total_km = value["glucoseLevelUnits"];
          obj4[0].series[count4].name = new Date(
            value["glucoseTime"]
          ).getFullYear();
          obj4[0].series[count4].glucoseType = this.glucoseType[
            value["glucoseType"]
          ];
          obj4[0].series[count4].glucoseLevelUnits = value["glucoseLevelUnits"];

          sliderObjGlucose[count4 + 1] = parseFloat(obj4[0].series[count4].glucoseLevelUnits);
          glucoseLabels.push(`${value['glucoseLevelUnits']} mmol/L`);
          count4++;
          this.golucoseobj = obj4;
        }

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
        let new_data_activity = this.parseData(res.data);

        // -------------------------------------------- //
        // --------------------------------------------//
        // --------------------------------------------//
        new_data_activity.map((elem) => {
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
        let groupedDataActivity = this.groupBy(new_data_activity, "type");
        const activity = groupedDataActivity.activity;
        // --------------------------------------------//
        // --------------------------------------------//
        let obj2 = [{ name: "Activity", series: [] }];
        let count2 = 0;
        let objscatter = [];

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
                dosageTime: value["dosageTime"],
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
          let obj = [];
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
    if (type == "START") {
      this.startDate = value;
      this.value = new Date(this.startDate).getTime();
    } else {
      this.endDate = value;
      this.maxValue = new Date(this.endDate).getTime();
    }
    let glucoseSlider = document.querySelector('#glucose-slider');
    glucoseSlider.innerHTML = '';

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
