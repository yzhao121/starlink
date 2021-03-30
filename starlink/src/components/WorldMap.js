import React, {Component} from 'react';
import { WORLD_MAP_URL, SATELLITE_POSITION_URL, SAT_API_KEY } from '../constants';
import axios from 'axios';
import { feature } from 'topojson-client';
import { geoKavrayskiy7 } from "d3-geo-projection";
import { select as d3Select } from "d3-selection";
import { geoPath, geoGraticule } from "d3-geo";
import { schemeCategory10 } from "d3-scale-chromatic";
import * as d3Scale from "d3-scale";
import { timeFormat as d3TimeFormat } from "d3-time-format";
import {Spin} from "antd"

const width = 960;
const height = 600;

class WorldMap extends Component {

    constructor() {
        super();
        this.refMap = React.createRef();
        this.refTrack = React.createRef();
        this.map = null;
        this.color = d3Scale.scaleOrdinal(schemeCategory10);
        this.state = {
            isLoading: false,
            isDrawing: false
        };
    }

    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then(res => {
                const { data } = res;
                // get map data, we only care about countries here
                const land = feature(data, data.objects.countries).features;
                this.generateMap(land);
            })
            .catch(
                e => console.log('err in fetch world map data ', e)
            )
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // fetch satellite position
        if (prevProps.satData !== this.props.satData) {
            const {
                latitude,
                longitude,
                elevation,
                altitude,
                duration
            } = this.props.observeData;

            // accelerate 60 times
            const endTime = duration * 60;

            this.setState({
                isLoading: true
            });

            const urls = this.props.satData.map(sat => {
                const { satid } = sat;
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${SAT_API_KEY}`;
                return axios.get(url);
            });

            Promise.all(urls)
                .then(results => {
                    console.log(results);
                    const arr = results.map(res => res.data);
                    this.setState({
                        isLoading: false,
                        isDrawing: true
                    });
                    // tracking satellite
                    if (!prevState.isDrawing) {
                        this.track(arr);
                    } else {
                        const oHint = document.getElementsByClassName("hint")[0];
                        oHint.innerHTML =
                            "Please wait for these satellite animation to finish before selection new ones!";
                    }
                })
                .catch(err => {
                    console.log("err in fetch satellites positions: ", err);
                })
        }
    }

    track = data => {
        // check if there is position
        if (data.length === 0 || !data[0].hasOwnProperty('positions')) {
            throw new Error('No position data.');
            return;
        }

        const len = data[0].positions.length;
        const {context2} = this.map;

        let now = new Date();
        let i = 0;

        // setInterval returns a time id
        let timer = setInterval(() => {
            // get current time
            let ct = new Date();

            // calculate passed time
            let timePassed = i === 0 ? 0 : ct - now;
            let time = new Date(now.getTime() + 60 * timePassed);

            // clear the last position
            context2.clearRect(0, 0, width, height);

            // display timer
            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 10); // display time

            // when to clear timer
            if (i >= len) {
                this.setState({ isDrawing: false });
                clearInterval(timer); // timer is an return id
                const oHint = document.getElementsByClassName("hint")[0];
                oHint.innerHTML = "";
                return;
            }

            // for each satellite
            data.forEach(sat => {
                const {info, positions} = sat;
                this.drawSat(info, positions[i]);
            });

            i += 60;
        }, 1000);
    }

    drawSat = (sat, pos) => {
        const { satlongitude, satlatitude } = pos;

        if (!satlongitude || !satlatitude) return;

        const { satname } = sat;
        const nameWithNumber = satname.match(/\d+/g).join(""); // use rgx filter letters

        const { projection, context2 } = this.map;
        const xy = projection([satlongitude, satlatitude]);

        context2.fillStyle = this.color(nameWithNumber);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI); // draw a circle
        context2.fill();

        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(nameWithNumber, xy[0], xy[1] + 14);
    }

    generateMap = land => {
        // create a projection and then inject the data into it
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width/2, height/2])
            .precision(.1);

        // get map canvas
        const canvas = d3Select(this.refMap.current)
            .attr('width', width)
            .attr('height', height);

        // get track canvas
        const canvas2 = d3Select(this.refTrack.current)
            .attr('width', width)
            .attr('height', height);

        // preparation
        let context = canvas.node().getContext('2d');
        let context2 = canvas2.node().getContext('2d');

        const graticule = geoGraticule();
        let path = geoPath().projection(projection).context(context); // paint brush

        // data <--> map
        land.forEach(ele => {
            context.fillStyle = '#B3DDEF'; // fill color
            context.strokeStyle = '#000'; // border color
            context.globalAlpha = 0.7; // definition 清晰度
            context.beginPath();
            path(ele); // receive countries data
            context.fill();
            context.stroke();

            // wash the paint brush, and staining
            context.strokeStyle = 'rgba(220, 220, 220, 0.1)'; // graticule's style (a is definition)
            context.beginPath();
            path(graticule()); // receive graticule data
            context.lineWidth = 0.1;
            context.stroke();

            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline()); // receive border data
            context.stroke();
        })

        this.map = {
            context: context,
            context2: context2,
            projection: projection
        }
    }

    render() {
        const { isLoading } = this.state;
        return (
            <div className='map-box'>
                {isLoading ? (
                    <div className="spinner">
                        <Spin tip="Loading..." size="large" />
                    </div>
                ) : null}
                <canvas className='map' ref={this.refMap}/>
                <canvas className='track' ref={this.refTrack} />
                <div className='hint' />
            </div>
        );
    }
}

export default WorldMap;