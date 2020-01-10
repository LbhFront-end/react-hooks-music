import React, { useRef, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import Confirm from "../../../baseUI/Confirm";
import Scroll from "../../../baseUI/Scroll";
import { PlayListWrapper, ScrollWrapper, ListHeader, ListContent } from './style';
import { changeShowPlayList, changePlayMode, changeCurrentIndex, changePlayList, changeSequecePlayList, changeCurrentSong, changePlayingState } from '../store/actionCreators';
import { prefixStyle, getName, findIndex, shuffle } from '../../../api/utils';
import { playMode } from './../../../api/config';


function PlayList(props) {
  const {
    changeCurrentIndexDispatch,
    changePlayListDispatch,
    changeModeDispatch,
    togglePlayListDispatch,
    clearDispatch,
    showPlayList,
    currentIndex,
    currentSong: immutableCurrentSong,
    playList: immutablePlayList,
    sequencePlayList: SequencePlayList,
    mode
  } = props;
  const playListRef = useRef();
  const listWrapperRef = useRef();
  const confirmRef = useRef();
  const listContentRef = useRef();
  const [isShow, setIsShow] = useState(false);
  const [canTouch, setCanTouch] = useState(true);
  const [startY, setStartY] = useState(0);
  const [initialed, setInitialed] = useState(0);
  const [distance, setDistance] = useState(0);
  const transform = prefixStyle('transform');

  const currentSong = immutableCurrentSong.toJS()
  const playList = immutablePlayList.toJS()
  const sequencePlayList = SequencePlayList.toJS()

  const onEnterCB = useCallback(() => {
    setIsShow(true)
    listWrapperRef.current.style[transform] = 'translate3d(0,100%,0)'
  }, [transform])

  const onEnteringCB = useCallback(() => {
    listWrapperRef.current.style['transition'] = 'all 0.3s';
    listWrapperRef.current.style[transform] = 'translate3d(0,0,0)'
  }, [transform])

  const onExitingCB = useCallback(() => {
    listWrapperRef.current.style['transition'] = 'all 0.3s';
    listWrapperRef.current.style[transform] = 'translate3d(0,100%,0)'
  }, [transform])

  const onExitedCB = useCallback(() => {
    setIsShow(false)
    listWrapperRef.current.style[transform] = 'translate3d(0,100%,0)'
  }, [transform])

  const changeMode = (e) => {
    let newMode = (mode + 1) % 3;
    if (newMode === 0) {
      // 顺序模式
      changePlayListDispatch(sequencePlayList);
      let index = findIndex(currentSong, sequencePlayList);
      changeCurrentIndexDispatch(index);
    } else if (newMode === 1) {
      // 单曲循环
      changePlayListDispatch(sequencePlayList);
    } else if (newMode === 2) {
      // 随机播放
      let newList = shuffle(sequencePlayList);
      let index = findIndex(currentSong, newList);
      changePlayListDispatch(newList);
      changeCurrentIndexDispatch(index);
    }
    changeModeDispatch(newMode);
  }

  const getCurrentIcon = item => {
    const current = currentSong.id === item.id;
    const className = current ? 'icon-play' : '';
    const content = current ? '&#xe6e3' : '';
    return (<i className={`current iconfont ${className}`} dangerouslySetInnerHTML={{ __html: content }} />)
  }

  const getPlayMode = () => {
    let content, text;
    if (mode === playMode.sequence) {
      content = "&#xe625;";
      text = "顺序播放";
    } else if (mode === playMode.loop) {
      content = "&#xe653;";
      text = "单曲循环";
    } else {
      content = "&#xe61b;";
      text = "随机播放";
    }
    return (
      <div>
        <i className="iconfont" onClick={(e) => changeMode(e)} dangerouslySetInnerHTML={{ __html: content }}></i>
        <span className="text" onClick={(e) => changeMode(e)}>{text}</span>
      </div>
    )
  }

  const handleChangeCurrentIndex = (index) => {
    if (currentIndex === index) return;
    changeCurrentIndexDispatch(index)
  }

  const handleShowClear = () => {
    confirmRef.current.show();
  }

  const handleConfirmClear = () => {
    clearDispatch();
  };

  const handleScroll = (pos) => {
    let state = pos.y === 0;
    setCanTouch(state)
  }

  const handleTouchStart = (e) => {
    if (!canTouch || initialed) return;
    listWrapperRef.current.style['transition'] = '';
    setStartY(e.nativeEvent.touches[0].pageY)
    setInitialed(true)
  };
  const handleTouchMove = (e) => {
    if (!canTouch || !initialed) return;
    let distance = e.nativeEvent.touches[0].pageY - startY;
    if (distance < 0) return;
    setDistance(distance)
    listWrapperRef.current.style.transform = `translate3d(0,${distance}px,0)`
  };
  const handleTouchEnd = (e) => {
    setInitialed(false);
    if (distance >= 150) {
      togglePlayListDispatch(false)
    } else {
      listWrapperRef.current.style['transition'] = 'all 0.3s';
      listWrapperRef.current.style[transform] = 'translate3d(0,0,0)'
    }
  };


  return (
    <CSSTransition
      in={showPlayList}
      timeout={300}
      classNames='list-fade'
      onEnter={onEnterCB}
      onEntering={onEnteringCB}
      onExiting={onExitingCB}
      onExited={onExitedCB}
    >
      <PlayListWrapper
        ref={playListRef}
        style={isShow === true ? { display: 'block' } : { display: 'none' }}
        onClick={() => togglePlayListDispatch(false)}
      >
        <div
          className="list_wrapper"
          ref={listWrapperRef}
          onClick={e => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <ListHeader>
            <h1 className="title">
              {getPlayMode()}
              <span className="iconfont clear" onClick={handleShowClear}>&#xe63d;</span>
            </h1>
          </ListHeader>
          <ScrollWrapper>
            <Scroll
              ref={listContentRef}
              bounceTop={false}
              onScroll={pos => handleScroll(pos)}
            >
              <ListContent>
                {
                  playList.map((item, index) => (
                    <li className="item" key={item.id} onClick={() => handleChangeCurrentIndex(index)}>
                      {getCurrentIcon(item)}
                      <span className="text">{item.name} - {getName(item.ar)}</span>
                      <span className="like">
                        <i className="iconfont">&#xe601;</i>
                      </span>
                      <span className="delete">
                        <i className="iconfont">&#xe63d;</i>
                      </span>
                    </li>
                  ))
                }
              </ListContent>
            </Scroll>
          </ScrollWrapper>
        </div>
        <Confirm
          ref={confirmRef}
          text='是否删除全部'
          cancelBtnText='取消'
          confirmBtnText='确定'
          handleConfirm={handleConfirmClear}
        />
      </PlayListWrapper>
    </CSSTransition>
  )
}
const mapStateToProps = (state) => ({
  showPlayList: state.getIn(['player', 'showPlayList']),
  currentIndex: state.getIn(['player', 'currentIndex']),
  currentSong: state.getIn(['player', 'currentSong']),
  playList: state.getIn(['player', 'playList']),
  sequencePlayList: state.getIn(['player', 'sequencePlayList']),
  mode: state.getIn(['player', 'mode'])
})
const mapDispatchToProps = (dispatch) => {
  return {
    togglePlayListDispatch(data) {
      dispatch(changeShowPlayList(data))
    },
    changeCurrentIndexDispatch(data) {
      dispatch(changeCurrentIndex(data))
    },
    changeModeDispatch(data) {
      dispatch(changePlayMode(data))
    },
    changePlayListDispatch(data) {
      dispatch(changePlayList(data))
    },
    clearDispatch() {
      dispatch(changePlayList([]))
      dispatch(changeSequecePlayList([]))
      dispatch(changeCurrentIndex(-1))
      dispatch(changeShowPlayList(false))
      dispatch(changeCurrentSong({}))
      dispatch(changePlayingState(false))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(PlayList))