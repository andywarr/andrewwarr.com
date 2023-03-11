import React from 'react'

import './Infobar.css'

export default class Infobar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="infobar">
                <div>
                    <div>This site will use your device orientation if you'll let it</div>
                    <div>
                        <button id="requestDeviceOrientation" onClick = {this.props.handleDeviceOrientationPermission} role="button">Allow</button>
                    </div>
                    <div id="close" onClick = {this.props.handleCloseInfobar}></div>
                </div>
            </div>
        );
    }
}