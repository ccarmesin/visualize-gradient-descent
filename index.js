import * as vis from 'vis';

import {
    GoogleCharts
} from 'google-charts';


const gradientDiv = document.getElementById('gradient_div'),
    functionLbl = document.getElementById('functionLbl'),
    aRange = document.getElementById('aRange'),
    aLabel = document.getElementById('aLabel'),
    expRange = document.getElementById('expRange'),
    expLabel = document.getElementById('expLabel');

let a, exp;

/**
 *
 * Draw the function containing a and exp to the Google line chart. Calulates the values in steps of .01
 * 
 */
async function drawChart() {

    //Load the charts library with a callback
    GoogleCharts.load(() => {

        const data = [];

        data.push(['x', 'y']);
        for (let x = 0; x <= 1; x += .01) {

            const dataObject = [x, f(x)];
            data.push(dataObject);

        }

        const dataArray = google.visualization.arrayToDataTable(data);

        const options = {
            legend: 'none',
            width: 500,
            height: 500,
            hAxis: {
                title: 'x',
                viewWindow: {
                    min: 0,
                    max: 1
                }
            },
            vAxis: {
                title: 'y',
                viewWindow: {
                    min: 0,
                    max: 1
                }
            }
        };

        const chart = new google.visualization.LineChart(document.getElementById('chart_div'));

        chart.draw(dataArray, options);
    });

}

/**
 *
 * Draw a 3dGraph of the loss function for the given function
 * 
 */
async function drawLoss() {

    // Create and populate a data table.
    let data = new vis.DataSet();

    const steps = 30; // Number of datapoints will be steps*steps, if higher you will see more
    const axisMax = 3;
    const axisStep = axisMax / steps;

    for (let a = 0; a < axisMax; a += axisStep) {

        for (let exp = 0; exp < axisMax; exp += axisStep) {

            // Calculate the error for these values
            let error = meanSquaredError(a, exp);
            data.add({
                x: a,
                y: exp,
                z: error
            });

        }

    }

    // Specify options
    let options = {
        onclick: onGraphClick,
        xLabel: 'a',
        yLabel: 'exponent',
        zLabel: 'error',
        style: 'surface',
        showPerspective: true,
        showGrid: true,
        showShadow: false,
        keepAspectRatio: true,
        verticalRatio: 0.5
    };

    // Create a graph3d
    new vis.Graph3d(gradientDiv, data, options);

}

/**
 *
 * Fetch the input from the inputFields and draw function parameter values to the ui
 *
 * @param event when touching ne of the two range bars
 * 
 */
async function fetchFunction(event) {

    a = parseFloat(aRange.value);
    exp = parseFloat(expRange.value);

    if (event.target.id === 'aRange')
        a = parseFloat(event.target.value);
    else
        exp = parseFloat(event.target.value);

    aLabel.innerText = `a(${a})`;
    expLabel.innerText = `exponent(${exp})`;

    functionLbl.innerText = `f(x) = ${a} * x^${exp}`;

}

/**
 *
 * Draw a given polynomial function to th ui
 * 
 */
async function drawFunction() {

    // Definition the polynomial function
    // y = a * x^exp

    let width = overlayDiv.width;

    // Get context
    let ctx = overlayFunctionDiv.getContext('2d');
    ctx.clearRect(0, 0, overlayFunctionDiv.width, overlayFunctionDiv.height);
    ctx.beginPath();

    for (let x = 0; x <= 1; x += .1) {

        const y = a * Math.pow(x, exp);

        const pixelX = width * x,
            pixelY = width * (1 - y);

        // Every line starts with moveTo and continues with lineTo
        if (x === 0)
            ctx.moveTo(pixelX, pixelY);
        else
            ctx.lineTo(pixelX, pixelY);

    }

    // Finally draw the line to canvas
    ctx.stroke();

}

/**
 *
 * Calculate the meanSquaredError up to xMax in steps
 *
 * @param m slope of the line
 * @param b intercept of the line
 * 
 */
function meanSquaredError(a, exp) {

    let meanSquared = 0,
        xMax = 3,
        steps = .1,
        n = xMax / steps;

    for (let x = 0; x <= xMax; x += steps) {

        // Calculate y
        let guessY = a * Math.pow(x, exp),
            labelY = f(x);

        // Calculate error for this step
        let error = guessY - labelY;
        error *= error;
        meanSquared += error;

        // Increase n(counter)
        n++;

    }

    // Divide summed error by the number of operations to get the mean
    meanSquared /= n;

    // Return 15 if error is bigger than that(just for a good looking gradient)
    if (meanSquared > 15)
        return 15;
    else
        return meanSquared;

}

/**
 *
 * Handles a click event in a 3dGraph
 *
 * @param point contains click information(See http://visjs.org/docs/graph3d/)
 * 
 */
async function onGraphClick(point) {

    let a = point.x.toFixed(1),
        exp = point.y.toFixed(1),
        error = point.z.toFixed(1);

    console.log(a, exp, error);

}

/**
 *
 * Calculate y for given x value
 *
 * @param x
 * 
 * @return y
 */
function f(x) {

    return a * Math.pow(x, exp);

}

/**
 *
 * Visualize live parameters
 *
 * @param event when touching ne of the two range bars
 *
 */
function visualize(event) {

    fetchFunction(event);
    drawChart();
    drawLoss();

}

visualize();

aRange.addEventListener('input', event => visualize(event));

expRange.addEventListener('input', event => visualize(event));
