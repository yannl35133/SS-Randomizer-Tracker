import React from 'react';
import amberTabletPic from '../../assets/tablets/amber_tablet.png'
import noTablet from '../../assets/tablets/no_amber.png'

export default class amberTablet extends React.Component{
    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    render(){
        const current = this.props.current
        switch(current){
            case 0:
                return <div id={"amber-Tablet"}>
                    <img src={noTablet} onClick={this.handleClick} alt={"No Amber Tablet"}/>
                </div>
            case 1:
                return <div id={"amber-Tablet"}>
                    <img src={amberTabletPic} onClick={this.handleClick} alt={"Amber Tablet"}/>
                </div>
            default:
                return
        }
    }

    handleClick(){
        this.props.onChange("amberTablet")
    }
}