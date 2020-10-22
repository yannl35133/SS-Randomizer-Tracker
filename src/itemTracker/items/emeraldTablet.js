import React from 'react';
import emeraldTabletPic from '../../assets/tablets/emerald_tablet.png'
import noTablet from '../../assets/tablets/no_emerald.png'

export default class emeraldTablet extends React.Component{
    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    render(){
        const current = this.props.current
        switch(current){
            case 0:
                return <div id={"emerald-Tablet"}>
                    <img src={noTablet} onClick={this.handleClick} alt={"No Emerald Tablet"}/>
                </div>
            case 1:
                return <div id={"emerald-Tablet"}>
                    <img src={emeraldTabletPic} onClick={this.handleClick} alt={"Emerald Tablet"}/>
                </div>
            default:
                return
        }
    }

    handleClick(){
        this.props.onChange("emeraldTablet")
    }
}