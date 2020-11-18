import React from 'react'
import { Col, Row } from 'react-bootstrap'
import SeaChart from './items/additional/seaChart'
import CavesKey from './items/additional/cavesKey'
import SpiralCharge from './items/additional/spiralCharge'

class AdditionalItems extends React.Component {
    
    render() {
        const firstStyle = {
            paddingRight: 0,
            paddingLeft: "25px"
        }
        const style = {
            padding: 0,
            margin: 0
        }
        return (
            <Row>
                <Col style={firstStyle}>
                    <p style={style}>Caves</p>
                    <CavesKey current={this.props.items.cavesKey} styleProps={this.props.styleProps} onChange={this.props.handleItemClick}/>
                </Col>
                <Col style={style}>
                    <SeaChart current={this.props.items.seaChart} styleProps={this.props.styleProps} onChange={this.props.handleItemClick}/>
                </Col>
                <Col style={style}>
                    <SpiralCharge current={this.props.items.spiralCharge} styleProps={this.props.styleProps} onChange={this.props.handleItemClick}/>
                </Col>
            </Row>
        )
    }
}
export default AdditionalItems