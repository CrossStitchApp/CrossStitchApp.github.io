import React from "react";
import PixelColors from '../logic/PixelColors.js';

class ImageComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imageRef: React.createRef(),
            imageSrc: "",
            topColorList: [],
            colorsHTML: [],
            img: {}
        }
        this.styles = {
            width: "10%",
            imageRendering: "pixelated"
        }
    }

    updateImage = function () {
        PixelColors.getImageData(this.state.imageRef.current.files[0], async (img) => {
            this.setState({img: img});

            var topColorList = await PixelColors.mostCommonColors(this.state.img.colorList, 32);
            this.setState({topColorList: topColorList, colorsHTML: topColorList.map(function(color) {
                return (
                    <span key={color[0]} style={{backgroundColor: "rgb(" + color[0].split("-").join(",") + ")"}}>{color[0]}</span>
                );
            })});

            var newImage = await PixelColors.pixelated(this.state.img, this.state.topColorList, 2);
            this.setState({imageSrc: newImage});
        });
    }.bind(this);

    render() {
        return (
            <div className="component-app">
                <input type='file' onChange={this.updateImage} ref={this.state.imageRef} />
                <br/>
                <br/>
                <img style={this.styles} alt="" src={this.state.imageSrc}/>
                {this.state.colorsHTML}
            </div>
        );
    }
}
export default ImageComponent;