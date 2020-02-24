/*global kakao */
/*global dc*/
/*global d3*/
/*global crossfilter*/
/*global volumeChart */
/*global locationChart */
'use strict'

import React, {Component} from 'react';
//import logo from './logo.svg';
import './App.css';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import infectee_data from './data/infectee.csv';

let hospital_data = [{
    key: 'h1',
    name: '경대병원 (선별)',
    address: '대한민국 대구광역시 중구 삼덕동2가 동덕로 130'
  }, {
    key: 'h2',
    name : '대구의료원 (선별)',
    address : '대구광역시 서구 평리로 157'
  }, {
    key: 'h3',
    name : '영남대병원 (선별)',
    address : '대구광역시 남구 현충로 170'
  }, {
    key: 'h4',
    name : '계명대동산병원 (선별)',
    address : '대한민국 대구광역시 달서구 신당동 달구벌대로 1035'
  }, {
    key: 'h5',
    name : '대가대병원 (선별)',
    address : '대구광역시 남구 두류공원로17길 33',
    day: ''
  }, {
    key: 'h6',
    name : '달서구보건소 (선별)',
    address : '대구광역시 달서구 학산로 45'
  }, {
    key: 'h7',
    name : '동구보건소 (선별)',
    address : '대구광역시 동구 동촌로 79'
  }, {
    key: 'h8',
    name : '칠곡경대병원 (선별)',
    address : '대한민국 대구광역시 북구 국우동 호국로 807'
  }, {
    key: 'h9',
    name : '달성군보건소 (선별)',
    address : '대한민국 대구광역시 달성군 현풍면 비슬로130길 17'
  }, {
    key: 'h10',
    name : '북구보건소 (선별)',
    address : '대한민국 대구광역시 북구 침산동 성북로 49'
  }, {
    key: 'h11',
    name : '서구보건소 (선별)',
    address : '대한민국 대구광역시 서구 평리동 국채보상로 257'
  }, {
    key: 'h12',
    name : '수성구보건소 (선별)',
    address : '대한민국 대구광역시 수성구 중동 수성로 213'
  }, {
    key: 'h13',
    name : '중구보건소 (선별)',
    address : '대한민국 대구광역시 중구 태평로3가 174-1'
  }, {
    key: 'h14',
    name : '구)계명대동산병원 (선별)',
    address : '대한민국 대구광역시 중구 성내2동 달성로 56'
  }];
  /* 템플릿
  , {
    name : '',
    type: 'virus_area',
    day: ''
  }
  
  */
let map ={};
let volumeChart = {};
let locationChart = {};
let infecteeChart = {};
let dataTable = {};
let virus_markers = [];
let virus_overlay = [];
let virus_infowindow = [];
class App extends Component {
    componentDidMount() {
        
        
        //마커 생성함수
        let marker_generator = (lat, lng, point_info) => {
            let imageSrc = '',   
                imageSize = new kakao.maps.Size(24, 24), 
                imageOption = {offset: new kakao.maps.Point(12, 24)}; 
            if(point_info.type === 'virus_area') {
                imageSrc = 'https://ifh.cc/g/4vHXo.png';
            } else {
                imageSrc = 'https://ifh.cc/g/spCCq.png';
            }
            
            let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption),
                position = new kakao.maps.LatLng(lat, lng),
                marker = new kakao.maps.Marker({
                    map: map,
                    title: 'test',
                    position: position,
                    image: markerImage
                });
            //마커 설명 추가
            let content = '';
            if(point_info.type === 'virus_area') {
                content = `
                    <div style="font-size:0.6em;font-weight:bold;color: red;background-color:white;padding;margin-top: 1em;">${point_info.name}</div>
                `;
            } else {
                //content = `<div style="font-size:0.6em;font-weight:bold;color: green;">${point_info.name}</div>`;
            }
            var customOverlay = new kakao.maps.CustomOverlay({
                position: position,
                content: content   
            });


            if(point_info.type === 'virus_area') {

                let iwContent = `<div>`;
                point_info.items.map((item)=> {
                    let data_format = item.date.split('/');
                    iwContent +=`<div style="padding:5px;height: 20px;width: 200px;">${data_format[0]}월 ${data_format[1]}일, ${item.infectee}환자 방문</div>`; // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
                });
                iwContent += `<div>`;
                
                let iwRemoveable = true; // removeable 속성을 ture 로 설정하면 인포윈도우를 닫을 수 있는 x버튼이 표시됩니다

                // 인포윈도우를 생성합니다
                var infowindow = new kakao.maps.InfoWindow({
                    content : iwContent,
                    removable : iwRemoveable
                });
                kakao.maps.event.addListener(marker, 'click', function() {
                    // 마커 위에 인포윈도우를 표시합니다
                    infowindow.open(map, marker);  
                });
                virus_markers.push(marker);
                virus_overlay.push(customOverlay);
                virus_infowindow.push(infowindow);
            }
            customOverlay.setMap(map);
        }

        //주소데이터 좌표계 변환 후 마커 표시 함수
        let run_drawer = (point_info) => {
            let geocoder = new kakao.maps.services.Geocoder();
            geocoder.addressSearch(point_info.address, function(result, status) {
            if (status === kakao.maps.services.Status.OK) {

                let LatLng = new kakao.maps.LatLng(result[0].y, result[0].x);
                let geoLoc = {
                lat: LatLng.Ha,
                lng: LatLng.Ga
                }
                marker_generator(geoLoc.lat, geoLoc.lng, point_info);
            }
            });
        }
        //그래프 그리기
        /**
         * Step 1: Create the dc.js chart objects
         */
        volumeChart = dc.barChart('#monthly-volume-chart');
        locationChart = dc.barChart('#location-chart');
        infecteeChart = dc.barChart('#infectee-chart');
        dataTable = dc.dataTable('.dc-data-table');
        /**
         * Step 2: Loead data from csv file
         */
        // FinalZipCode,location,incorporationDate,Year,IndustryCode,indust_nm
        d3.csv(infectee_data).then(function (data) {
            /**
             * Step3 Create Dimension that we'll need
             */
            var ndx = crossfilter(data);    //Convert CSV strings to Crossfilter Object
            var all = ndx.groupAll();       //Grouping Crossfilter Object's real data. It's used for using the function whitch is filtering top categories

            var dateFormatSpecifier = '%m/%d/%Y'; //Define day format to read CSV file. The format is  "month/day/year"
            var dateFormat = d3.timeFormat(dateFormatSpecifier); //Convert day string to javascript day object format
            var dateFormatParser = d3.timeParse(dateFormatSpecifier); //http://learnjsdata.com/time.html
            var numberFormat = d3.format('.2f'); //Rounds

            data.forEach(function (d) {
                d.dd = dateFormatParser(d.visit_date); //make date type using incorperationDate in CSV file.
                d.day = d3.timeDay(d.dd); // pre-calculate month for better performance
            });


            // Determine a histogram of percent changes
            var location = ndx.dimension(function (d) { //make data dimension for the graph
                return d.location_name; //the sum of the group by x value which is location data in dimension
            });
            var locationGroup = location.group(); //grouping dimension data by x axis 
            locationGroup = getTops(locationGroup);//get top 10 groups in locationGroup

            // Determine a histogram of percent changes
            var infectee = ndx.dimension(function (d) { //make data dimension for the graph
                return d.infectee_id;  //the sum of the group by x value which is IndustryCode data in dimension
            });
            var infecteeGroup = infectee.group(); //grouping dimension data by x axis 
            infecteeGroup = getTops(infecteeGroup); //get top 10 groups in infectee


            // Dimension by month
            var moveDays = ndx.dimension(function (d) {
                return d.day; //the sum of the group by x value which is month data in dimension
            });
            //Group by total volume within move, and scale down result
            var volumeByDayGroup = moveDays.group().reduceSum(function (d) {
                return 1; 
            });

            // Dimension by full date
            var dateDimension = ndx.dimension(function (d) {
                return d.dd;
            });
            
            locationChart
                .width(200)
                .height(70)
                .margins({ top: 10, right: 50, bottom: 20, left: 25 })
                .dimension(location)
                .group(locationGroup)
                .colors('#FFCC4E')
                .elasticY(true) //.elasticY and .elasticX determine whether the chart should rescale each axis to fit the data.
                .x(d3.scaleOrdinal().domain(locationGroup))
                .xUnits(dc.units.ordinal)
                .barPadding(0.05)
                .outerPadding(0.05)
                .renderHorizontalGridLines(true)
                .on('renderlet',function(chart){
                    chart.selectAll("g.x text")
                    .attr('dx', '-15')
                    .attr('transform', "rotate(-15)");
                })

            locationChart.yAxis().ticks(5);


            infecteeChart
                .width(200)
                .height(70)
                .margins({ top: 10, right: 50, bottom: 20, left: 25 })
                .dimension(infectee)
                .group(infecteeGroup)
                .colors('#F9C0C7')
                .elasticY(true) //.elasticY and .elasticX determine whether the chart should rescale each axis to fit the data.
                .x(d3.scaleOrdinal().domain(infecteeGroup))
                .xUnits(dc.units.ordinal)
                .barPadding(0.05)
                .outerPadding(0.05)
                .renderHorizontalGridLines(true)
    
            infecteeChart.yAxis().ticks(5);

            // Determine a histogram of percent changes
            volumeChart
                .width(400) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
                .height(70)    //height
                .margins({ top: 10, right: 50, bottom: 20, left: 25 })
                .dimension(moveDays)  //dimension
                .group(volumeByDayGroup)  //group
                .centerBar(true)
                .colors('#4EB8B9')
                .gap(1)
                .x(d3.scaleTime().domain([new Date(2020, 0, 10), new Date(2020, 2, 10)]))
                //.y(d3.scaleLinear().domain([0, 100]))
                .round(d3.timeDay.round)
                .alwaysUseRounding(true)
                .renderHorizontalGridLines(true) //Grid liner
                .xUnits(d3.timeDay);

            volumeChart.yAxis().ticks(5);

            dataTable /* dc.dataTable('.dc-data-table', 'chartGroup') */
                .dimension(dateDimension)
                // Data table does not use crossfilter group but rather a closure
                // as a grouping function
                .group(function (d) {
                    var format = d3.format('02d');
                    return '';
                })
                // (_optional_) max number of records to be shown, `default = 25`
                .size(100)
                // There are several ways to specify the columns; see the data-table documentation.
                // This code demonstrates generating the column header automatically based on the columns.
                .columns([{
                        label: "확진자",
                        format: function (d) {
                            return d.infectee_id;
                        },
                        
                    },{
                        label: "위치",
                        format: function (d) {
                            return d.location_name;
                        }
                    },{
                        label: "방문일자",
                        format: function (d) {
                            return d.visit_date;
                        }
                    },{
                        label: "주소",
                        format: function (d) {
                            return d.location_address;
                        }
                    }
                ])
                // (_optional_) sort using the given field, `default = function(d){return d;}`
                .sortBy(function (d) {
                    return d.dd;
                })
                // (_optional_) sort order, `default = d3.ascending`
                .order(d3.ascending)
                // (_optional_) custom renderlet to post-process chart using [D3](http://d3js.org)
                .on('renderlet', function (table) {
                    table.selectAll('.dc-table-group').classed('info', false);
                    if(document.querySelector(".dc-table-group") != undefined)
                        document.querySelector(".dc-table-group").parentNode.removeChild(document.querySelector(".dc-table-group"));
                    try {
                        // 위치 마커에 표시
                        if(virus_markers.length > 0) {
                            virus_markers.map((item) => {
                                item.setMap(null);
                            });
                            virus_markers = [];
                            virus_overlay.map((item) => {
                                item.setMap(null);
                            });
                            virus_overlay = [];
                            virus_infowindow.map((item) => {
                                item.setMap(null);
                            });
                            virus_infowindow = [];
                            
                        }
                        let value = document.getElementById("virus-area-table").tBodies[0].innerText.split(/['\t','\nig']+/);
                        //value.shift();
                         /*
                        [{
                            location: 'test', 
                            count: 2,
                            items: {}, {}
                        }]
                        */
                        let virus_area = []; 
                        let key_location =[];
                        value.map((items, index)=>{
                            if((index + 1) % 4 === 0) {
                                //중복 없는경우
                                let idx = key_location.indexOf(value[index-2]);
                                if(idx === -1) {
                                    key_location.push(value[index-2]);
                                    virus_area.push({
                                        name: value[index-2],
                                        address: value[index],
                                        count: 1,
                                        type: 'virus_area',
                                        items: [{
                                            infectee : value[index-3],
                                            date : value[index-1]
                                        }]
                                    });
                                } else {
                                    virus_area[idx].count ++;
                                    virus_area[idx].items.push({
                                        infectee : value[index-3],
                                        date : value[index-1]
                                    });
                                }
                            }
                        });
                        virus_area.map((item)=> {
                            run_drawer(item);
                        });
                    } catch (error) {
                        return;
                    }
                   
                });
            
        });

        /**
         * Get Top x lanks from the source group.
         * @param {source_group} source_group 
         */
        function getTops(source_group) {
            return {
                all: function () {
                    return source_group.top(5);
                }
            };
        }

        //카카오톡 맵 API 스크립트 로드
        let script = document.createElement('script');
        script.async = true;
        script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=4b131f115191c34846fd3b9a97f3c957&autoload=false&libraries=services";
        document.head.appendChild(script);
        script.onload = () => {
            kakao.maps.load(() => {
                //맵 그리기
                map = new kakao.maps.Map(document.getElementById('map'), {
                  center: new kakao.maps.LatLng(35.871733, 128.601654),
                  level: 8
                });

                // 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
                // var zoomControl = new kakao.maps.ZoomControl();
                // map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
                //밝은색 지도로 변경
                map.addOverlayMapTypeId(kakao.maps.MapTypeId.TERRAIN);
                //마커 출력
                
                hospital_data.map((item)=> {
                    run_drawer(item);
                });

                        
                //simply call `.renderAll()` to render all charts on the page
                
                dc.renderAll();
                
                
            });
        }
    };

    render() {
        const parent_style={
            high: '100%'
        },map_style = {
            position: 'relative',
            high: '100%'
        }, floating_style = {
            position: 'absolute',
            fontSize: '0.8em',
            zIndex: 2,
            bottom: '15px',
            left: '0.4em',
        }, card1_style = {
            position: 'absolute',
            zIndex: 2,
            top: '4em',
            left: '0.4em',
            width: '24.5em'
        }, card2_style = {
            position: 'absolute',
            zIndex: 2,
            top: '19em',
            left: '0.4em',
            heigh: '5em',
            width: '12.1em'
        }, card3_style = {
            position: 'absolute',
            zIndex: 2,
            top: '19em',
            left: '12.8em',
            width: '12.1em'
        }, card4_style = {
            position: 'absolute',
            zIndex: 2,
            top: '12.3em',
            left: '0.4em',
            width: '24.5em'
        },display = {
            display: 'none'
        },table = {
            height:  '7.5em',
            width: '60em',
            fontSize: '0.6em',
            display: 'inline-block', 
            overflow: 'scroll'
        };
        let handleDailyClick = (e) => {
            volumeChart.filterAll();dc.redrawAll();
        }
        let handleLocationClick = (e) => {
            locationChart.filterAll();dc.redrawAll();
        }
        let handleInfecteeClick = (e) => {
            infecteeChart.filterAll();dc.redrawAll();
        }
        let handleTableClick = (e) => {
            if(e.target.__data__=== undefined) return;
            let geocoder = new kakao.maps.services.Geocoder();
            geocoder.addressSearch(e.target.__data__.location_address, function(result, status) {
              if (status === kakao.maps.services.Status.OK) {
  
                let LatLng = new kakao.maps.LatLng(result[0].y, result[0].x);
                let geoLoc = {
                  lat: LatLng.Ha,
                  lng: LatLng.Ga
                }
                var moveLatLon = new kakao.maps.LatLng(geoLoc.lat, geoLoc.lng);
                    
                // 지도 중심을 이동 시킵니다
                map.panTo(moveLatLon);
              }
            });
            
        }

        d3.select("tbody").style("overflow", "auto");
        return (
            <div style={parent_style}>
                <AppBar position="static" style={{ background: '#2E3B55' }}>
                    <Toolbar>
                        <Typography variant="h6">
                        대구지역 코로나19 환자 방문장소 확인
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div className="App" id="map" style={map_style}></div>
                <Card className="Card1" style={card1_style}>
                    <CardContent>
                        <strong>확진자 일별 지역 감염 횟수 (드래그 검색)</strong>
                        <div id="monthly-volume-chart">
                            <span className="reset" style={display}>range:
                                <span className="filter"></span>
                            </span>
                            <a className="reset" onClick={handleDailyClick} style={display}>reset</a>
                            <div className="clearfix"></div>
                        </div>
                    </CardContent>
                </Card>
                {/* <Card className="Card2" style={card2_style}>
                    <CardContent className ={cardContent}>
                        <strong>확진자 장소별 방문 일수</strong>
                        <div id="location-chart">
                            <span className="reset" style={display}>range:
                                <span className="filter"></span>
                            </span>
                            <a className="reset" onClick={handleLocationClick} style={display}>reset</a>
                            <div className="clearfix"></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="Card3" style={card3_style}>
                    <CardContent className ={cardContent}>
                        <strong>확진자 누적 방문 일수</strong>
                        <div id="infectee-chart">
                            <span className="reset" style={display}>range:
                                <span className="filter"></span>
                            </span>
                            <a className="reset" onClick={handleInfecteeClick} style={display}>reset</a>
                            <div className="clearfix"></div>
                        </div>
                    </CardContent>
                </Card> */}
                <Card className="Card4" style={card4_style}>
                    <CardContent>
                        <table className="table table-hover dc-data-table" id="virus-area-table" style={table} onClick={handleTableClick} ></table>
                    </CardContent>
                </Card>
                <div style={floating_style}>
                    [데이터 출저]: 질병관리본부 제공, 뉴스 제보<br/>
                    위치별로 확진자가 방문한 일정 표현. <br/>
                    추가정보 및 잘못된 정보 제보: <a href="mailto:corona.developer@gmail.com">corona.developer@gmail.com</a><br/>
                    지도 API: 카카오, 위치검색 API: 카카오, 시각화: dc.js 
                </div>
            </div>
        );
    };
};

export default App;