// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/JSView","sap/ca/ui/model/format/NumberFormat","sap/ui/model/analytics/odata4analytics","sap/ushell/components/tiles/indicatorTileUtils/smartBusinessUtil","sap/suite/ui/microchart/AreaMicroChartItem","sap/suite/ui/microchart/AreaMicroChartPoint","sap/suite/ui/microchart/AreaMicroChartLabel","sap/suite/ui/microchart/AreaMicroChart","sap/m/TileContent","sap/m/NumericContent","sap/m/GenericTile","sap/ui/model/json/JSONModel"],function(e,a,i,t,r,n,l,s,o,u,c,h){"use strict";sap.ui.getCore().loadLibrary("sap.suite.ui.microchart");sap.ui.jsview("tiles.indicatorDualTrend.DualTrend",{getControllerName:function(){return"tiles.indicatorDualTrend.DualTrend"},createContent:function(){this.setHeight("100%");this.setWidth("100%");var e=function(e){return new r({color:"Good",points:{path:"/"+e+"/data",template:new n({x:"{day}",y:"{balance}"})}})};var a=function(e){return new l({label:"{/"+e+"/label}",color:"{/"+e+"/color}"})};var i={footer:"",header:"",subheader:""};var t=new s({width:"{/width}",height:"{/height}",size:"{/size}",target:e("target"),innerMinThreshold:e("innerMinThreshold"),innerMaxThreshold:e("innerMaxThreshold"),minThreshold:e("minThreshold"),maxThreshold:e("maxThreshold"),chart:e("chart"),minXValue:"{/minXValue}",maxXValue:"{/maxXValue}",minYValue:"{/minYValue}",maxYValue:"{/maxYValue}",firstXLabel:a("firstXLabel"),lastXLabel:a("lastXLabel"),firstYLabel:a("firstYLabel"),lastYLabel:a("lastYLabel"),minLabel:a("minLabel"),maxLabel:a("maxLabel")});var m=new o({unit:"{/unit}",size:"{/size}",content:t});var d=new u({value:"{/value}",scale:"{/scale}",unit:"{/unit}",indicator:"{/indicator}",size:"{/size}",formatterValue:true,truncateValueTo:6,valueColor:"{/valueColor}"});var b=new o({unit:"{/unit}",size:"{/size}",content:d});this.oGenericTile=new c({subheader:"{/subheader}",frameType:"TwoByOne",size:"{/size}",header:"{/header}",tileContent:[b,m]});var p=new h;p.setData(i);this.oGenericTile.setModel(p);return this.oGenericTile}})},true);
//# sourceMappingURL=DualTrend.view.js.map