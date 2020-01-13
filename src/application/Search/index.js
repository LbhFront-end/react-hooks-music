import React, { useState, useEffect, useCallback } from 'react';
import { CSSTransition } from 'react-transition-group';
import SearchBox from '../../baseUI/SearchBox';
import { Container } from './style';

function Search(props) {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState('');

  const searchBack = useCallback(() => {
    setShow(false)
  }, [])

  const handleQuery = (q) => setQuery(q)

  useEffect(() => {
    setShow(true)
  }, [])

  return (
    <CSSTransition
      in={show}
      timeout={300}
      appear
      classNames='fly'
      unmountOnExit
      onExited={() => props.history.goBack()}
    >
      <Container>
        <div className="search_box_wrapper">
          <SearchBox back={searchBack} newQuery={query} handleQuery={handleQuery}></SearchBox>
        </div>
      </Container>
    </CSSTransition>
  )
}

export default React.memo(Search)