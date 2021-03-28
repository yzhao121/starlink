import React, {Component} from 'react';
import {Button, Spin, List, Checkbox, Avatar} from "antd";
import satellite from "../assets/images/logo.svg"

class SatelliteList extends Component {

    state = {
        selected: []
    }

    onChange = e => {
        console.log(e.target);
        // step1: get data info and checked
        const {dataInfo, checked} = e.target;

        //step2: add or remove selected satellite to/from selected array
        const {selected} = this.state;
        const list = this.addOrRemove(dataInfo, checked, selected);

        //step3: set state
        this.setState({
            selected: list
        })
    }

    addOrRemove = (item, status, list) => {
        // case1: check is true
        //      --> sat not in the list, add it
        //      --> sat in the list, do nothing
        const found = list.some(entry => entry.satid === item.satid);
        if (status && !found) {
            list = [...list, item];
        }

        // case2: check is false
        //      --> sat not in the list, do nothing
        //      --> sat in the list, remove
        if (!status && found) {
            list = list.filter(entry => {
                return entry.satid !== item.satid;
            });
        }
        return list;
    }

    onShowSatOnMap = () => {
        this.props.onShowMap(this.selected);
    }

    render() {
        const satList = this.props.satInfo ? this.props.satInfo.above : [];
        const { isLoading } = this.props;
        const { selected } = this.state;
        return (
            <div className="sat-list-box">
                <div className="btn-container">
                    <Button className="sat-list-btn" type="primary" size="large"
                            onClick={this.onShowSatOnMap}
                            disabled={selected.length === 0}
                    >
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
                        <List
                            className="sat-list"
                            itemLayout="horizontal"
                            size="small"
                            dataSource={satList}
                            renderItem={item => (
                                <List.Item
                                    actions={[
                                        <Checkbox dataInfo={item} onChange={this.onChange} />
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar size={50} src={satellite} />}
                                        title={<p>{item.satname}</p>}
                                        description={`Launch Date: ${item.launchDate}`}
                                    />
                                </List.Item>
                            )}
                        />
                }
            </div>
        );
    }
}

export default SatelliteList;