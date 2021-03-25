import React, { Component } from 'react';
import { Row, Col } from 'antd';
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList"
import { NEARBY_SATELLITE, SAT_API_KEY, STARLINK_CATEGORY } from "../constants";
import axios from "axios";

class Main extends Component {
    state = {
        sateInfo: null,
        isLoadingList: false
    }
    render () {
        const { sateInfo } = this.state;
        return (
            <Row className='main'>
                <Col span={8} className="left-side">
                    <SatSetting onShow={this.showNearBySatellite}/>
                    <SatelliteList satInfo={sateInfo} isLoading={this.state.isLoadingList}/>
                </Col>
                <Col span={16} className="right-side">
                    right
                </Col>
            </Row>
        );
    }

    showNearBySatellite = settings => {
        console.log('settings: ', settings);
        // this.setState({
        //     settings: settings
        // });
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