import React from 'react';
import rubyTabletPic from '../../assets/tablets/ruby_tablet.png'
import noTablet from '../../assets/tablets/no_ruby.png'

export default class rubyTablet extends React.Component{
    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    render(){
        const current = this.props.current
        switch(current){
            case 0:
                return <div id={"ruby-Tablet"}>
                    <img src={noTablet} onClick={this.handleClick} alt={"No Ruby Tablet"}/>
                </div>
            case 1:
                return <div id={"ruby-Tablet"}>
                    <img src={rubyTabletPic} onClick={this.handleClick} alt={"Ruby Tablet"}/>
                </div>
            default:
                return
        }
    }

    handleClick(){
        this.props.onChange("rubyTablet")
    }
}