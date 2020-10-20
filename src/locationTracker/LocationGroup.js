import React from 'react';
import Location from './Location'

class LocationGroup extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.expanded) {
            return (
                <div className={"location-group-" + this.props.groupName}>
                    <ul>{this.props.groupName}</ul>
                    <ul>
                        {this.props.locations.map((value, index) => {
                            return <Location key={index} name={value}/>
                        })}
                    </ul>
                </div>
            );
        } else return (
            <div className={"location-group-" + this.props.groupName}>
                <ul>{this.props.groupName}</ul>
            </div>
        )
    }
}

export default LocationGroup;