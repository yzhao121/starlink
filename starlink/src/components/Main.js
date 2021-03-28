import React, { Component } from 'react';
import { Row, Col } from 'antd';
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import WorldMap from "./WorldMap";
import { NEARBY_SATELLITE, SAT_API_KEY, STARLINK_CATEGORY } from "../constants";
import axios from "axios";

class Main extends Component {
    state = {
        satInfo: null,
        isLoadingList: false
    }
    render () {
        const { satInfo } = this.state;
        return (
            <Row className='main'>
                <Col span={8} className="left-side">
                    <SatSetting onShow={this.showNearBySatellite}/>
                    <SatelliteList satInfo={satInfo} isLoading={this.state.isLoadingList}
                                    onShowMap={this.showMap}/>
                </Col>
                <Col span={16} className="right-side">
                    <WorldMap />
                </Col>
            </Row>
        );
    }

    showNearBySatellite = settings => {
        console.log('settings: ', settings);
        // fetch satellite data
        this.fetchSatellite(settings);
    }

    fetchSatellite = settings => {
        // step1: get settings
        const { latitude, longitude, elevation, altitude } = settings;

        //set loading flag
        this.setState({
            isLoadingList: true
        });

        //step2: prepared for request
        const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;


        axios.get(url)
            .then(response => {
                console.log('res -> ', response);
                this.setState({
                    satInfo: response.data,
                    isLoadingList: false
                });
            })
            .catch(err => {
                console.log('err -> ', err);
                this.setState({
                    isLoadingList: false
                })
            })
    }
}

export default Main;