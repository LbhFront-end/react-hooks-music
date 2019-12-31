import React, { useRef, useEffect } from 'react'
import { connect } from 'react-redux'
import { forceCheck } from 'react-lazyload';
import Slider from '../../components/Slider'
import RecommendList from '../../components/List'
import Scroll from '../../baseUI/Scroll'
import Loading from '../../baseUI/Loading'
import * as actionsType from './store/actionCreators'
import { Content } from './style';

function Recommend(props) {
  const { bannerList, recommendList, enterLoading, getBannerDataDispatch, getRecommendListDateDispatch } = props;
  const scrollRef = useRef();
  useEffect(() => {
    if (!bannerList.size) {
      getBannerDataDispatch();
    }
    if (!recommendList.size) {
      getRecommendListDateDispatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bannerListJS = bannerList ? bannerList.toJS() : []
  const recommendListJS = recommendList ? recommendList.toJS() : []
  return (
    <Content>
      <Scroll className="list" ref={scrollRef} onScroll={forceCheck}>
        <div>
          <Slider bannerList={bannerListJS} />
          <RecommendList recommendList={recommendListJS} />
        </div>
      </Scroll>
      {enterLoading ? <Loading /> : null}

    </Content>
  )
}

const mapStateToProps = (state) => ({
  bannerList: state.getIn(['recommend', 'bannerList']),
  recommendList: state.getIn(['recommend', 'recommendList']),
  enterLoading: state.getIn(['recommend', 'enterLoading']),
})
const mapDispatchToProps = (dispatch) => {
  return {
    getBannerDataDispatch() {
      dispatch(actionsType.getBannerList())
    },
    getRecommendListDateDispatch() {
      dispatch(actionsType.getRecommendList())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Recommend))