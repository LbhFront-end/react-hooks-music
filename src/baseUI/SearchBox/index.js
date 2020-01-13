import React, { useRef, useEffect, useMemo, useState } from 'react';
import { SearchBoxWrapper } from './style';
import { debounce } from '../../api/utils';

const SearchBox = (props) => {
  const queryRef = useRef();
  const [query, setQuery] = useState('')

  const { newQuery, handleQuery } = props;
  const displayStyle = query ? { display: 'block' } : { display: 'none' }

  let handleQueryDebounce = useMemo(() => {
    return debounce(handleQuery, 500)
  }, [handleQuery])

  const handleChange = (e) => {
    setQuery(e.currentTarget.value)
  }

  const clearQuery = () => {
    setQuery('')
    queryRef.current.focus();
  }

  useEffect(() => {
    queryRef.current.focus();
  }, [])

  useEffect(() => {
    handleQueryDebounce(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    if (newQuery !== query) {
      setQuery(newQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newQuery])

  return (
    <SearchBoxWrapper>
      <i className='iconfont icon-back' onClick={() => props.back()}>&#xe655;</i>
      <input value={query} type="text" ref={queryRef} className='box' placeholder='搜索歌曲、歌手、专辑' onChange={handleChange} />
      <i className='iconfont icon-delete' onClick={clearQuery} style={displayStyle}>&#xe600;</i>
    </SearchBoxWrapper>
  )
}

export default React.memo(SearchBox)