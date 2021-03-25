import React, {Component} from 'react';
import { Button, Spin } from "antd";

class SatelliteList extends Component {
    render() {
        const satList = this.props.satInfo ? this.props.satInfo.above : [];
        const { isLoading } = this.props;
        return (
            <div className="sat-list-box">
                <div className="btn-container">
                    <Button className="sat-list-btn" type="primary" size="large">
                        Track on the map
                    </Button>
                </div>
                <hr />
                {
                    isLoading ?
                        <div className='spin-box'>
                            <Spin tip="Loading..." size="large" />
                        </div>
                        :
                        <p>data</p>
                }
            </div>
        );
    }
}

export default SatelliteList;