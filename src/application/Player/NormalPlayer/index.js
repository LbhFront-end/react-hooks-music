/* eslint-disable react/no-danger-with-children */
import React, { useRef, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import animations from 'create-keyframe-animation';
import ProgressBar from '../../../baseUI/ProgressBar'
import Scroll from '../../../baseUI/Scroll';
import {
  NormalPlayerContainer,
  ProgressWrapper,
  Top,
  Middle,
  Bottom,
  Operators,
  CDWrapper,
  LyricContainer,
  LyricWrapper
} from "./style";
import { getName, prefixStyle, formatPlayTime } from '../../../api/utils';
import { playMode } from './../../../api/config';



function NormalPlayer(props) {
  const normalPlayerRef = useRef();
  const cdWrapperRef = useRef();
  const currentState = useRef('');
  const lyricScrollRef = useRef();
  const lyricLineRefs = useRef([]);
  const {
    song,
    mode,
    playing,
    percent,
    duration,
    currentTime,
    fullScreen,
    clickPlaying,
    toggleFullScreen,
    onProgressChange,
    handlePrev,
    handleNext,
    changeMode,
    togglePlayList,
    currentLineNum,
    currentPlayingLyric,
    currentLyric
  } = props;
  const transform = prefixStyle('transform');
  // 计算偏移的辅助函数
  const _getPostAndScale = () => {
    const targetWidth = 40;
    const paddingLeft = 40;
    const paddingBottom = 30;
    const paddingTop = 80;
    const width = window.innerHeight * 0.8;
    const scale = targetWidth / width;
    // 两个圆心的横坐标距离和纵坐标距离
    const x = -(window.innerWidth / 2 - paddingLeft)
    const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
    return {
      x, y, scale
    }
  }

  const enter = () => {
    normalPlayerRef.current.style.display = 'block';
    const { x, y, scale } = _getPostAndScale();
    let animation = {
      0: { transform: `translate3d(${x}px,${y}px,0) scale(${scale})` },
      60: { transform: `translate3d(0,0,0) scale(1.1)` },
      100: { transform: `translate3d(0,0,0) scale(1)` },
    }
    animations.registerAnimation({
      name: 'move',
      animation,
      presets: {
        duration: 400,
        easing: 'linear'
      }
    });
    animations.runAnimation(cdWrapperRef.current, 'move')
  }

  const afterEnter = () => {
    const cdWrapperDom = cdWrapperRef.current;
    animations.unregisterAnimation('move');
    cdWrapperDom.style.animation = '';
  }

  const leave = () => {
    const cdWrapperDom = cdWrapperRef.current
    if (!cdWrapperDom) return;
    cdWrapperDom.style.transform = 'all 0.4s';
    const { x, y, scale } = _getPostAndScale();
    cdWrapperDom.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
  }

  const afterLeave = () => {
    const cdWrapperDom = cdWrapperRef.current
    if (!cdWrapperDom) return;
    cdWrapperDom.style.transform = '';
    cdWrapperDom.style[transform] = '';
    normalPlayerRef.current.style.display = 'none';
    currentState.current = "";
  }

  const getPlayMode = () => {
    let content;
    if (mode === playMode.sequence) {
      content = "&#xe625;";
    } else if (mode === playMode.loop) {
      content = "&#xe653;";
    } else {
      content = "&#xe61b;";
    }
    return content;
  };

  const toggleCurrentState = () => {
    if (currentState.current !== 'lyric') {
      currentState.current = 'lyric'
    } else {
      currentState.current = '';
    }
  }

  useEffect(() => {
    if (!lyricScrollRef.current) return;
    let bScroll = lyricScrollRef.current.getBScroll();
    if (currentLineNum > 5) {
      let lineEl = lyricLineRefs.current[currentLineNum - 5].current;
      bScroll.scrollToElement(lineEl, 1000)
    } else {
      bScroll.scrollTo(0, 0, 1000)
    }
  }, [currentLineNum])

  return (
    <CSSTransition
      classNames='normal'
      in={fullScreen}
      timeout={400}
      mountOnEnter
      onEnter={enter}
      onEntered={afterEnter}
      onExit={leave}
      onExited={afterLeave}
    >

      <NormalPlayerContainer ref={normalPlayerRef}>
        <div className="background">
          <img
            src={song.al.picUrl + "?param=300x300"}
            width="100%"
            height="100%"
            alt="歌曲图片"
          />
        </div>
        <div className="background layer" />
        <Top className="top">
          <div className="back" onClick={() => toggleFullScreen(false)}>
            <i className="iconfont icon-back">&#xe662;</i>
          </div>
          <h1 className="title">{song.name}</h1>
          <h1 className="subtitle">{getName(song.ar)}</h1>
        </Top>
        <Middle ref={cdWrapperRef} onClick={toggleCurrentState}>
          <CSSTransition
            timeout={400}
            classNames='fade'
            in={currentState.current !== 'lyric'}
          >
            <CDWrapper style={{ visibility: currentState.current !== 'lyric' ? 'visible' : 'hidden' }}>
              <div className="cd">
                <img
                  className={`image play ${playing ? '' : 'pause'}`}
                  src={song.al.picUrl + "?param=400x400"}
                  alt=""
                />
              </div>
              <p className="playing_lyric">{currentPlayingLyric}</p>
            </CDWrapper>
          </CSSTransition>
          <CSSTransition
            timeout={400}
            classNames='fade'
            in={currentState.current === 'lyric'}
          >
            <LyricContainer>
              <Scroll ref={lyricScrollRef}>
                <LyricWrapper
                  style={{ visibility: currentState.current === 'lyric' ? 'visible' : 'hidden' }}
                  className='lyric_wrapper'
                >
                  {
                    currentLyric
                      ? currentLyric.lines.map((item, index) => {
                        lyricLineRefs.current[index] = React.createRef()
                        return (
                          <p
                            className={`text ${currentLineNum === index ? 'current' : ''}`}
                            key={item + index}
                            ref={lyricLineRefs.current[index]}
                          >
                            {item.txt}
                          </p>
                        )
                      })
                      :
                      (<p className="text pure"> 纯音乐，请欣赏。</p>)
                  }
                </LyricWrapper>
              </Scroll>
            </LyricContainer>
          </CSSTransition>
        </Middle>
        <Bottom className="bottom">
          <ProgressWrapper>
            <span className="time time-l">{formatPlayTime(currentTime)}</span>
            <div className="progress-bar-wrapper">
              <ProgressBar
                percent={percent}
                percentChange={onProgressChange}
              />
            </div>
            <div className="time time-r">{formatPlayTime(duration)}</div>
          </ProgressWrapper>
          <Operators>
            <div className="icon i-left" onClick={changeMode}>
              <i
                className="iconfont"
                dangerouslySetInnerHTML={{ __html: getPlayMode() }}
              />
            </div>
            <div className="icon i-left" onClick={handlePrev}>
              <i className="iconfont">&#xe6e1;</i>
            </div>
            <div className="icon i-center">
              <i
                className="iconfont"
                onClick={e => clickPlaying(e, !playing)}
                dangerouslySetInnerHTML={{
                  __html: playing ? "&#xe723;" : "&#xe731;"
                }}
              />
            </div>
            <div className="icon i-right" onClick={handleNext}>
              <i className="iconfont">&#xe718;</i>
            </div>
            <div className="icon i-right" onClick={() => togglePlayList(true)}>
              <i className="iconfont">&#xe640;</i>
            </div>
          </Operators>
        </Bottom>
      </NormalPlayerContainer>
    </CSSTransition>
  )
}

export default React.memo(NormalPlayer)