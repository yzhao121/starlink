import React, {Component} from 'react';
import { WORLD_MAP_URL } from '../constants';
import axios from 'axios';
import { feature } from 'topojson-client';
import { geoKavrayskiy7 } from "d3-geo-projection";
import { select as d3Select } from "d3-selection";
import { geoPath, geoGraticule } from "d3-geo";


const width = 960;
const height = 600;

class WorldMap extends Component {

    constructor() {
        super();
        this.refMap = React.createRef();
    }

    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then(res => {
                const { data } = res;
                // draw map
                const land = feature(data, data.objects.countries).features;
                this.generateMap(land);
            })
            .catch(
                e => console.log('err in fecth world map data ', e)
            )
    }

    generateMap = land => {
        // create a projection and then inject the data into it
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width/2, height/2])
            .precision(.1);

        // get canvas
        const canvas = d3Select(this.refMap.current)
            .attr('width', width)
            .attr('height', height);

        // preparation
        let context = canvas.node().getContext('2d');
        const graticule = geoGraticule();
        let path = geoPath().projection(projection).context(context); // paint brush

        // data <--> map
        land.forEach(ele => {
            context.fillStyle = '#B3DDEF';
            context.strokeStyle = '#000';
            context.globalAlpha = 0.7;
            context.beginPath();
            path(ele);
            context.fill();
            context.stroke();

            context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();

            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline());
            context.stroke();
        })
    }

    render() {
        return (
            <div>
                <canvas ref={this.refMap}/>
            </div>
        );
    }
}

export default WorldMap;