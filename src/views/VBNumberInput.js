import React from 'react';
import PropTypes from 'prop-types';
import Styles from '../styles';

//An FSC (functional stateless component) that provides an input device.
const VBNumberInput = (props) => {
  var style = Object.assign(Styles.VBNumberInput, {gridArea: props.position})
  return (
    <div style={style}>
      {props.inputName}: <input type="number" min="1" max={props.maxValue} value={props.inputValue}
        onChange={props.changeHandler}
        style={{width: '50px'}}/>
    </div>
  )
}

VBNumberInput.propTypes = {
  inputName: PropTypes.string.isRequired,
  inputValue: PropTypes.number.isRequired,
  changeHandler: PropTypes.func.isRequired,
  maxValue: PropTypes.number
};

export default VBNumberInput;