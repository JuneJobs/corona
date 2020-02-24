/*global kakao*/

'use strict'
import React, {Component} from 'react';
//import logo from './logo.svg';
import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));
let map ={};
class App extends Component {
  componentDidMount() {
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=4b131f115191c34846fd3b9a97f3c957&autoload=false&libraries=services";
    document.head.appendChild(script);
    script.onload = () => {
      kakao.maps.load(() => {
        let markerGenerator = (lat, lng, point_info) => {
          let imageSrc = '',   
              imageSize = new kakao.maps.Size(26, 26), 
              imageOption = {offset: new kakao.maps.Point(13, 26)}; 
          if(point_info.type === 'virus_area') {
            imageSrc = 'https://ifh.cc/g/XXmGk.png';
          } else {
            imageSrc = 'https://ifh.cc/g/qYBKp.png';
          }
          let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption),
              position = new kakao.maps.LatLng(lat, lng),
              marker = new kakao.maps.Marker({
                map: map,
                title: 'test',
                position: position,
                image: markerImage
          });
          let content = '';
          if(point_info.type === 'virus_area') {
            content = `
              <div style="font-size:14px;font-weight:bold;color: fuchsia;background-color:white;">${point_info.name}</div>
              <div style="font-size:12px;font-weight:bold;color: firebrick;background-color:white; ">${point_info.day}</div>
            `;
          } else {
            content = `<div style="font-size:10px;font-weight:bold;color: green;background-color:white;">${point_info.name}</div>`;
          }
          var customOverlay = new kakao.maps.CustomOverlay({
            position: position,
            content: content   
          });
          customOverlay.setMap(map);
        }
       
        let runDrawer = (point_info) => {
          let geocoder = new kakao.maps.services.Geocoder();
          geocoder.addressSearch(point_info.address, function(result, status) {
            if (status === kakao.maps.services.Status.OK) {

              let LatLng = new kakao.maps.LatLng(result[0].y, result[0].x);
              let geoLoc = {
                lat: LatLng.Ha,
                lng: LatLng.Ga
              }
              markerGenerator(geoLoc.lat, geoLoc.lng, point_info);
            }
          });
        }
        map = new kakao.maps.Map(document.getElementById('map'), {
          center: new kakao.maps.LatLng(35.871733, 128.601654),
          level: 8
        });

        map.addOverlayMapTypeId(kakao.maps.MapTypeId.TERRAIN);
        let point = [{
          name: '경대병원 (선별)',
          address: '대한민국 대구광역시 중구 삼덕동2가 동덕로 130',
          type: 'hospital',
          day: ''
        }, {
          name : '대구의료원 (선별)',
          address : '대구광역시 서구 평리로 157',
          type: 'hospital',
          day: ''
        }, {
          name : '영남대병원 (선별)',
          address : '대구광역시 남구 현충로 170',
          type: 'hospital',
          day: ''
        }, {
          name : '계명대동산병원 (선별)',
          address : '대한민국 대구광역시 달서구 신당동 달구벌대로 1035',
          type: 'hospital',
          day: ''
        }, {
          name : '대가대병원 (선별)',
          address : '대구광역시 남구 두류공원로17길 33',
          type: 'hospital',
          day: ''
        }, {
          name : '달서구보건소 (선별)',
          address : '대구광역시 달서구 학산로 45',
          type: 'hospital',
          day: ''
        }, {
          name : '동구보건소 (선별)',
          address : '대구광역시 동구 동촌로 79(',
          type: 'hospital',
          day: ''
        }, {
          name : '칠곡경대병원 (선별)',
          address : '대한민국 대구광역시 북구 국우동 호국로 807',
          type: 'hospital',
          day: ''
        }, {
          name : '달성군보건소 (선별)',
          address : '대한민국 대구광역시 달성군 현풍면 비슬로130길 17',
          type: 'hospital',
          day: ''
        }, {
          name : '북구보건소 (선별)',
          address : '대한민국 대구광역시 북구 침산동 성북로 49',
          type: 'hospital',
          day: ''
        }, {
          name : '서구보건소 (선별)',
          address : '대한민국 대구광역시 서구 평리동 국채보상로 257',
          type: 'hospital',
          day: ''
        }, {
          name : '수성구보건소 (선별)',
          address : '대한민국 대구광역시 수성구 중동 수성로 213',
          type: 'hospital',
          day: ''
        }, {
          name : '중구보건소 (선별)',
          address : '대한민국 대구광역시 중구 태평로3가 174-1',
          type: 'hospital',
          day: ''
        }, {
          name : '새로난한방병원',
          address : '대구광역시 수성구 달구벌대로 2492',
          type: 'virus_area',
          day: '2/7~17'
        }, {
          name : '대구교회',
          address : '대구광역시 남구 대명로 81',
          type: 'virus_area',
          day: '2/9, 2/16'
        }, {
          name : '퀸벨호텔',
          address : '대구광역시 동구 동촌로 200',
          type: 'virus_area',
          day: '2/15'
        }, {
          name : '동대구역',
          address : '대구광역시 동구 동대구로 550',
          type: 'virus_area',
          day: '1/25'
        }, {
          name : 'S-OIL 미니주유소',
          address : '대구광역시 수성구 동대구로 142 미니주유소',
          type: 'virus_area',
          day: '1/25'
        }, {
          name : '대구서부터미널',
          address : '대한민국 대구광역시 남구 대명11동 1135-1',
          type: 'virus_area',
          day: '2/17'
        }];
        /* 템플릿
        , {
          name : '',
          address : '',
          type: 'virus_area',
          day: ''
        }
        
        */
        point.map((item)=> {
          runDrawer(item);
        });
      });
    };
  }
  render() {
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">
              (대구) 코로나19 확진자 위치별 방문일자
            </Typography>
          </Toolbar>
            <div style={{marginLeft: 26 + 'px', fontSize: 11 + 'px'}}>
              [데이터 출저]: 질병관리본부 제공 (20일자) <br/>
              (홈화면에 단축 아이콘 추가) 안드로이드 => 우측상단 메뉴[:]버튼>[홈 화면에 추가]클릭<br/>
              (홈화면에 단축 아이콘 추가) 아이폰 => 사파리 하단 공유[^]클릭>홈화면에 추가[+]클릭<br/>
              위치별로 확진자가 방문한 일정 표현. 선별 진료소: 의심 증상자가 출입 전에 진료받는 곳  <br/>
              추가정보 및 잘못된 정보 제보는 corona.developer@gmail.com 으로 부탁드립니다. <br/>
            </div>
            <br/>
        </AppBar>
        <div className="App" id="map"></div>
      </div>
    );
  }
}

export default App;
