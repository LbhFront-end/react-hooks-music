import React, { useState, useRef, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { CSSTransition } from "react-transition-group";
import Scroll from '../../baseUI/Scroll';
import Header from '../../baseUI/Header';
import Loading from "../../baseUI/Loading";
import MusicNote from "../../baseUI/MusicNote";
import SongsList from "../SongsList";
import { HEADER_HEIGHT } from '../../api/config';
import { getSingerInfo, changeEnterLoading } from "./store/actionCreators";
import { Container, SongListWrapper, ImgWrapper, CollectButton, BgLayer } from './style'


function Singer(props) {
  const [showStatus, setShowStatus] = useState(true);
  const collectButton = useRef();
  const imageWrapper = useRef();
  const songScrollWrapper = useRef();
  const songScroll = useRef();
  const header = useRef();
  const layer = useRef();
  const musicNoteRef = useRef();
  // 图片初始高度
  const initialHeight = useRef(0);
  // 往上偏移的尺寸，露出圆角
  const OFFSET = 5;
  const { songsCount, artist: immutableArtist, songs: immutableSongs, loading, getSingerDataDispatch, match: { params: { id } } } = props;
  const artist = immutableArtist.toJS();
  const songs = immutableSongs.toJS();

  const setShowStatusFalse = useCallback(() => {
    setShowStatus(false);
  }, []);

  const handleScroll = pos => {
    let height = initialHeight.current;
    const newY = pos.y;
    const imageDOM = imageWrapper.current;
    const buttonDOM = collectButton.current;
    const headerDOM = header.current;
    const layerDOM = layer.current;
    const minScrollY = -(height - OFFSET) + HEADER_HEIGHT;

    const percent = Math.abs(newY / height);
    //说明: 在歌手页的布局中，歌单列表其实是没有自己的背景的，layerDOM其实是起一个遮罩的作用，给歌单内容提供白色背景
    //因此在处理的过程中，随着内容的滚动，遮罩也跟着移动
    if (newY > 0) {
      //处理往下拉的情况,效果：图片放大，按钮跟着偏移
      imageDOM.style["transform"] = `scale(${1 + percent})`;
      buttonDOM.style["transform"] = `translate3d(0, ${newY}px, 0)`;
      layerDOM.style.top = `${height - OFFSET + newY}px`;
    } else if (newY >= minScrollY) {
      //往上滑动，但是还没超过Header部分
      layerDOM.style.top = `${height - OFFSET - Math.abs(newY)}px`;
      layerDOM.style.zIndex = 1;
      imageDOM.style.paddingTop = "75%";
      imageDOM.style.height = 0;
      imageDOM.style.zIndex = -1;
      buttonDOM.style["transform"] = `translate3d(0, ${newY}px, 0)`;
      buttonDOM.style["opacity"] = `${1 - percent * 2}`;
    } else if (newY < minScrollY) {
      //往上滑动，但是超过Header部分
      layerDOM.style.top = `${HEADER_HEIGHT - OFFSET}px`;
      layerDOM.style.zIndex = 1;
      //防止溢出的歌单内容遮住Header
      headerDOM.style.zIndex = 100;
      //此时图片高度与Header一致
      imageDOM.style.height = `${HEADER_HEIGHT}px`;
      imageDOM.style.paddingTop = 0;
      imageDOM.style.zIndex = 99;
    }
  };

  const musicAnimation = (x, y) => {
    musicNoteRef.current.startAnimation({ x, y })
  }

  useEffect(() => {
    getSingerDataDispatch(id)
    let h = imageWrapper.current.offsetHeight;
    initialHeight.current = h;
    songScrollWrapper.current.style.top = `${h - OFFSET}px`;
    // 把遮罩先放在下面，以裹住歌曲列表
    layer.current.style.top = `${h - OFFSET}px`;
    songScroll.current.refresh();
    //eslint-disable-next-line
  }, []);

  return (
    <CSSTransition
      in={showStatus}
      timeout={300}
      classNames="fly"
      appear={true}
      unmountOnExit
      onExited={() => props.history.goBack()}
    >
      <>
        <Container>
          <Header
            handleClick={setShowStatusFalse}
            title={artist.name}
            ref={header}
          />
          <ImgWrapper ref={imageWrapper} bgUrl={artist.picUrl}>
            <div className="filter"></div>
          </ImgWrapper>
          <CollectButton ref={collectButton}>
            <i className="iconfont">&#xe62d;</i>
            <span className="text">收藏</span>
          </CollectButton>
          <BgLayer ref={layer} />
          <SongListWrapper ref={songScrollWrapper} play={songsCount}>
            <Scroll ref={songScroll} onScroll={handleScroll}>
              <SongsList
                songs={songs}
                showCollect={false}
                musicAnimation={musicAnimation}
              // showBackground={false}
              />
            </Scroll>
          </SongListWrapper>
          <MusicNote ref={musicNoteRef} />
        </Container>
        {loading ? (<Loading />) : null}
      </>
    </CSSTransition>
  )
}

const mapStateToProps = state => ({
  artist: state.getIn(['singerInfo', 'artist']),
  songs: state.getIn(['singerInfo', 'songsOfArtist']),
  loading: state.getIn(['singerInfo', 'loading']),
  songsCount: state.getIn(['player', 'playList']).size
})
const mapDispatchToProps = dispatch => {
  return {
    getSingerDataDispatch(id) {
      dispatch(changeEnterLoading(true))
      dispatch(getSingerInfo(id))
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Singer))