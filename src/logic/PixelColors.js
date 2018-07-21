Array.prototype.append = function (item) {
    this.push(item);
    return this;
}

var getContext = function(width, height) {
    var canvas = document.createElement("canvas");
    width && canvas.setAttribute('width', width);
    height && canvas.setAttribute('height', height);  
    return canvas.getContext('2d');
};

var PixelColors = {};

PixelColors.getImageData = async function(file, loaded) {
    var imgObj = new Image();

    var data = await getData(file);
    imgObj.onload = function () {
        var context = getContext(imgObj.width || imgObj.naturalWidth, 
                            imgObj.height || imgObj.naturalHeight);
        context.drawImage(imgObj, 0, 0);

        var imageData = context.getImageData(0, 0, imgObj.width, imgObj.height);
        var img = {
            colorList: [],
            height: 0,
            width: 0
        };
        for (let i = 0; i < imageData.data.length; i += 4) {
            var rgb = [];
            var rgbString = '';
            rgb[0] = imageData.data[i];
            rgb[1] = imageData.data[i + 1];
            rgb[2] = imageData.data[i + 2];
            rgbString = rgb.join("-");
            img.colorList.push(i+"-"+rgbString);
        }
        img.width = imgObj.width;
        img.height = imgObj.height;

        loaded && loaded(img);
    };

    imgObj.src = data;
};

PixelColors.mostCommonColors = function(data, count, callback) {
    return new Promise(function(resolve, reject) {
        var colorCounts = {},
            topColorList = [];

        data.forEach(color => {
            colorCounts[color.replace(/^([^-]+)-/gi, "")] ? colorCounts[color.replace(/^([^-]+)-/gi, "")]++ : colorCounts[color.replace(/^([^-]+)-/gi, "")] = 1;
        });

        topColorList = getTopColors(colorCounts, count);
        resolve(topColorList);
    });
};

function colorRow(colorList, width) {
    var colorRows = [[]];
    for (var i = 0, j = 0; i < colorList.length; i++) {
        if (i % width === 0 && i > 0) {
            j++;
            colorRows.push([]);
        }
        colorRows[j].push(colorList[i].replace(/^([^-]+)-/gi, "").split("-").map(newColor => parseInt(newColor, 10)));
    }
    return colorRows;
}

function pixelate(colorRow, pixelWidth) {
    var pixels = [];
    for (var i = 0; i < colorRow.length; i += pixelWidth) {
        for (var j = 0; j < colorRow[i].length; j += pixelWidth) {
            var pixel = [];
            for (var k = 0; k < pixelWidth; k++) {
                pixel.push(colorRow[i][k]);
                for (var l = 1; l !== pixelWidth; l++) {
                    colorRow[i + l] && pixel.push(colorRow[i + l][k]);
                }
            }
            pixels.push(pixel);
        }
    }
    return pixels;
}

function average(topColors, pixels) {
    var pixelColors = [];
    pixels.forEach(pixel => {
        var averageColor = [0, 0, 0]
                    .map((value, index) => pixel.reduce((total, current) => total + current[index], 0))
                    .map(value => Math.round(value / pixel.length));
        console.log(closest(topColors, averageColor));
        pixelColors.push(...closest(topColors, averageColor).append(255));
    });
    return pixelColors;
}

PixelColors.pixelated = function (img, topColors, pixelWidth) {
    return new Promise((resolve, reject) => {
        var _img = Object.assign({}, img);

        topColors = topColors.map(color => {
            return color[0].split("-").map(value => parseInt(value, 10));
        });

        var rows = colorRow(_img.colorList, _img.width);
        var pixels = pixelate(rows, pixelWidth);
        
        var pixelColors = average(topColors, pixels);
        
        var context = getContext(img.width, img.height);
        var imageData = context.createImageData(Math.ceil(img.width / pixelWidth), Math.ceil(img.height / pixelWidth));
        imageData.data.set(new Uint8ClampedArray(pixelColors));
        context.putImageData(imageData, 0, 0);

        resolve(context.canvas.toDataURL());
    });
}

function closest(array, value) {
    var scores = {};
    array.forEach(num => {
        var reduction = num.reduce((total, current, index) => total + Math.abs(value[index] - current), 0);
        scores[reduction] = num.join("-");
    });
    var closestKey = Math.min(...Object.keys(scores).map(key => parseInt(key, 10)));
    console.log(scores)
    return scores[closestKey].split("-").map(n => parseInt(n, 10));
}

var getTopColors = function (colorCount, count) {
    var colors = Object.entries(colorCount);
    colors.sort((a, b) => a - b);
    return colors.splice(0, count);
}

var getData = function (file) {
    if (file) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader()
            reader.onload = function(e) { resolve(e.target.result) }
            reader.readAsDataURL(file);
        });
    }
}

export default PixelColors