import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import LazyLoad, { forceCheck } from 'react-lazyload';
import Horizen from '../../baseUI/Horizen';
import Scroll from '../../baseUI/Scroll';
import Loading from '../../baseUI/Loading';
import { categoryTypes, alphaTypes } from '../../api/config';
import {
  getSingerList,
  getHotSingerList,
  changeEnterLoading,
  changePageCount,
  refreshMoreSingerList,
  changePullUpLoading,
  changePullDownLoading,
  refreshMoreHotSingerList
} from './store/actionCreators';
import { NavContainer, ListContainer, List, ListItem, EnterLoading } from './style';
import { CategoryDataContext, CHANGE_CATEGORY, CHANGE_ALPHA } from './data';


function Singers(props) {
  const { data, dispatch } = useContext(CategoryDataContext)
  const { category, alpha } = data.toJS();
  const {
    singerList,
    pageCount,
    updateDispatch,
    pullUpLoading,
    pullDownLoading,
    pullUpRefreshDispatch,
    pullDownRefreshDispatch,
    getHostSingerDispatch,
    enterLoading
  } = props;
  const singerListJS = singerList.toJS();
  useEffect(() => {
    if (!singerList.size) {
      getHostSingerDispatch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let handleUpdateAlpha = (val) => {
    dispatch({
      type: CHANGE_ALPHA,
      data: val
    })
    updateDispatch(category, val)
  }
  let handleUpdateCategory = (val) => {
    dispatch({
      type: CHANGE_CATEGORY,
      data: val
    })
    updateDispatch(val, alpha)
  }

  const handlePullUp = () => {
    pullUpRefreshDispatch(category, alpha, category === '', pageCount)
  }
  const handlePullDown = () => {
    pullDownRefreshDispatch(category, alpha)
  }

  const enterDetail = (id) => {
    props.history.push(`/singers/${id}`);
  };

  return (
    <>
      <NavContainer>
        <Horizen
          list={categoryTypes}
          title='分类（默认热门）'
          handleClick={(val) => handleUpdateCategory(val)}
          oldVal={category}
        />
        <Horizen
          list={alphaTypes}
          title='首字母'
          handleClick={(val) => handleUpdateAlpha(val)}
          oldVal={alpha}
        />
      </NavContainer>
      <ListContainer>
        {
          enterLoading ?
            <EnterLoading>
              <Loading />
            </EnterLoading> : null
        }

        <Scroll
          pullUp={handlePullUp}
          pullDown={handlePullDown}
          pullUpLoading={pullUpLoading}
          pullDownLoading={pullDownLoading}
          onScroll={forceCheck}
        >
          <List>
            {
              singerListJS.map(item => (
                <ListItem key={item.id} onClick={() => enterDetail(item.id)}>
                  <div className="img_wrapper">
                    <LazyLoad placeholder={<img width="100%" height="100%" src={require('./singer.png')} alt="music" />}>
                      <img src={`${item.picUrl}?param=300x300`} width="100%" height="100%" alt="music" />
                    </LazyLoad>
                  </div>
                  <span className="name">{item.name}</span>
                </ListItem>
              ))
            }
          </List>
        </Scroll>
      </ListContainer>
      {renderRoutes(props.route.routes)}
    </>
  )
}
const mapStateToProps = (state) => ({
  singerList: state.getIn(['singers', 'singerList']),
  enterLoading: state.getIn(['singers', 'enterLoading']),
  pullUpLoading: state.getIn(['singers', 'pullUpLoading']),
  pullDownLoading: state.getIn(['singers', 'pullDownLoading']),
  pageCount: state.getIn(['singers', 'pageCount']),
})

const mapDispatchToProps = (dispatch) => {
  return {
    getHostSingerDispatch() {
      dispatch(getHotSingerList())
    },
    updateDispatch(category, alpha) {
      dispatch(changePageCount(0));
      dispatch(changeEnterLoading(true))
      dispatch(getSingerList(category, alpha))
    },
    pullUpRefreshDispatch(category, alpha, hot, count) {
      dispatch(changePullUpLoading(true))
      dispatch(changePageCount(count + 1))
      if (hot) {
        dispatch(refreshMoreHotSingerList())
      } else {
        dispatch(refreshMoreSingerList(category, alpha))
      }
    },
    pullDownRefreshDispatch(category, alpha) {
      dispatch(changePullDownLoading(true))
      dispatch(changePageCount(0));
      if (category === '' && alpha === '') {
        dispatch(getHotSingerList())
      } else {
        dispatch(getHotSingerList(category, alpha))
      }
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Singers))