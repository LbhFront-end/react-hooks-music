import React, { useRef, memo, useEffect } from 'react';
import Scroll from '../Scroll';
import { PropTypes } from 'prop-types';
import { List, ListItem } from './style';

function Horizen(props) {
  const categoryRef = useRef(null);
  const {
    title,
    list,
    oldVal,
    handleClick
  } = props;

  useEffect(() => {
    let categoryDOM = categoryRef.current;
    let tagElems = categoryDOM.querySelectorAll('span')
    let totalWidth = 0;
    Array.from(tagElems).forEach(ele => {
      totalWidth += ele.offsetWidth;
    });
    categoryDOM.style.width = `${totalWidth}px`
    console.log(totalWidth)
    console.log(categoryDOM.style)
  }, [])

  return (
    <Scroll direction='horizental'>
      <div ref={categoryRef}>
        <List>
          <span>{title}</span>
          {
            list.map((item) => (
              <ListItem
                key={item.key}
                className={`${oldVal === item.key ? 'selected' : ''}`}
                onClick={() => handleClick(item.key)}
              >
                {item.name}
              </ListItem>
            ))
          }
        </List>
      </div>
    </Scroll>
  )
}

Horizen.defaultProps = {
  list: [],
  oldVal: '',
  newVal: '',
  handleClick: null
}

Horizen.propTypes = {
  list: PropTypes.array,
  oldVal: PropTypes.string,
  newVal: PropTypes.string,
  handleClick: PropTypes.func,
}

export default memo(Horizen)