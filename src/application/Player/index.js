import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import MiniPlayer from './MiniPlayer';
import NormalPlayer from './NormalPlayer';
import PlayList from './PlayList';
import Toast from "../../baseUI/Toast";
import {
  changePlayingState,
  changeShowPlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayList,
  changePlayMode,
  changeFullScreen
} from "./store/actionCreators";
import { getSongUrl, isEmptyObject, findIndex, shuffle } from './../../api/utils';
import { playMode } from './../../api/config';
import { getLyricRequest } from '../../api/request';
import Lyric from './../../api/lyric-parser';



function Player(props) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [preSong, setPerSong] = useState({})
  const [modeText, setModeText] = useState('');
  const [currentPlayingLyric, setPlayingLyric] = useState('');
  const audioRef = useRef();
  const toastRef = useRef();
  const songReady = useRef();
  const currentLyric = useRef();
  const currentLineNum = useRef(0)
  let percent = isNaN(currentTime / duration) ? 0 : currentTime / duration
  const {
    fullScreen,
    playing,
    sequencePlayList: immutableSequencePlayList,
    playList: immutablePlayList,
    currentSong: immutableCurrentSong,
    mode,
    currentIndex,
    showPlayList,
    togglePlayingDispatch,
    toggleFullScreenDispatch,
    togglePlayListDispatch,
    changeCurrentIndexDispatch,
    changeModeDispatch,
    changePlayListDispatch,
    changeCurrentSongDispatch
  } = props;

  let currentSong = immutableCurrentSong.toJS();
  let playList = immutablePlayList.toJS();
  let sequencePlayList = immutableSequencePlayList.toJS();

  const clickPlaying = (e, state) => {
    e.stopPropagation();
    togglePlayingDispatch(state)
    if (currentLyric.current) {
      currentLyric.current.togglePlay(currentTime * 1000)
    }
  }

  const updateTime = e => {
    setCurrentTime(e.target.currentTime)
  }

  const onProgressChange = curPercent => {
    const newTime = curPercent * duration;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
    if (!playing) {
      togglePlayingDispatch(true)
    }
    if (currentLyric.current) {
      currentLyric.current.seek(newTime * 1000)
    }
  }

  const handleLoop = () => {
    audioRef.current.currentTime = 0;
    togglePlayingDispatch(true);
    audioRef.current.play();
  }

  const handlePrev = () => {
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex - 1;
    if (index < 0) index = playList.length - 1;
    if (!playing) togglePlayingDispatch(true)
    changeCurrentIndexDispatch(index)
  }

  const handleNext = () => {
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex + 1;
    if (index === playList.length) index = 0;
    if (!playing) togglePlayingDispatch(true)
    changeCurrentIndexDispatch(index)
  }

  const changeMode = () => {
    let newMode = (mode + 1) % 3;
    if (newMode === 0) {
      changePlayListDispatch(sequencePlayList);
      let index = findIndex(currentSong, sequencePlayList);
      changeCurrentIndexDispatch(index)
      setModeText('顺序播放')
    } else if (newMode === 1) {
      changeCurrentIndexDispatch(sequencePlayList)
      setModeText('单曲循环')
    } else if (newMode === 2) {
      let newList = shuffle(sequencePlayList)
      let index = findIndex(currentSong, newList)
      changePlayListDispatch(newList)
      changeCurrentIndexDispatch(index)
      setModeText('随机播放')
    }
    changeModeDispatch(newMode)
    toastRef.current.show();
  }

  const handleEnd = () => {
    if (mode === playMode.loop) {
      handleLoop();
    } else {
      handleNext();
    }
  }

  const handleError = () => {
    songReady.current = true;
    alert('播放出错')
  }

  const getLyric = id => {
    let lyric = '';
    if (currentLyric.current) {
      currentLyric.current.stop();
    }
    getLyricRequest(id).then(data => {
      lyric = data.lrc.lyric
      if (!lyric) {
        currentLyric.current = null
        return;
      }
      currentLyric.current = new Lyric(lyric, handleLyric)
      currentLyric.current.play();
      currentLineNum.current = 0;
      currentLyric.current.seek(0)
    }).catch(() => {
      songReady.current = true;
      audioRef.current.play();
    })
  }

  const handleLyric = ({ lineNum, txt }) => {
    if (!currentLyric.current) return
    currentLineNum.current = lineNum
    setPlayingLyric(txt)
  }

  useEffect(() => {
    if (
      !playList.length ||
      currentIndex === -1 ||
      !playList[currentIndex] ||
      playList[currentIndex].id === preSong.id ||
      !songReady
    ) {
      return;
    }

    let current = playList[currentIndex];
    setPerSong(current)
    songReady.current = false;
    changeCurrentSongDispatch(current);// 赋值 currentSong
    audioRef.current.src = getSongUrl(current.id);
    setTimeout(() => {
      audioRef.current.play().then(() => {
        songReady.current = false;
      })
    });
    togglePlayingDispatch(true);// 播放状态
    getLyric(current.id);// 从头开始播放
    setCurrentTime(0);// 从头开始播放
    setDuration((current.dt / 1000) | 0);// 时长
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playList, currentIndex]);

  useEffect(() => {
    playing ? audioRef.current.play() : audioRef.current.pause();
  }, [playing])

  return (
    <div>
      {
        isEmptyObject(currentSong) ? null : (
          <MiniPlayer
            song={currentSong}
            playing={playing}
            percent={percent}
            fullScreen={fullScreen}
            clickPlaying={clickPlaying}
            setFullScreen={toggleFullScreenDispatch}
            togglePlayList={togglePlayListDispatch}
          />
        )
      }
      {
        isEmptyObject(currentSong) ? null : (
          <NormalPlayer
            song={currentSong}
            mode={mode}
            playing={playing}
            percent={percent}
            duration={duration}
            currentTime={currentTime}
            fullScreen={fullScreen}
            clickPlaying={clickPlaying}
            toggleFullScreen={toggleFullScreenDispatch}
            onProgressChange={onProgressChange}
            handlePrev={handlePrev}
            handleNext={handleNext}
            changeMode={changeMode}
            currentLyric={currentLyric.current}
            currentPlayingLyric={currentPlayingLyric}
            currentLineNum={currentLineNum.current}
            togglePlayList={togglePlayListDispatch}
          />
        )
      }

      <audio
        onEnded={handleEnd}
        onError={handleError}
        onTimeUpdate={updateTime}
        ref={audioRef}
      />
      <PlayList />
      <Toast text={modeText} ref={toastRef} />
    </div>
  )
}

const mapStateToProps = (state) => ({
  fullScreen: state.getIn(['player', 'fullScreen']),
  playing: state.getIn(['player', 'playing']),
  sequencePlayList: state.getIn(['player', 'sequencePlayList']),
  playList: state.getIn(['player', 'playList']),
  mode: state.getIn(['player', 'mode']),
  currentIndex: state.getIn(['player', 'currentIndex']),
  showPlayList: state.getIn(['player', 'showPlayList']),
  currentSong: state.getIn(['player', 'currentSong']),
})

const mapDispatchToProps = (dispatch) => {
  return {
    togglePlayingDispatch(data) {
      dispatch(changePlayingState(data))
    },
    toggleFullScreenDispatch(data) {
      dispatch(changeFullScreen(data))
    },
    togglePlayListDispatch(data) {
      dispatch(changeShowPlayList(data))
    },
    changeCurrentIndexDispatch(data) {
      dispatch(changeCurrentIndex(data))
    },
    changeCurrentSongDispatch(data) {
      dispatch(changeCurrentSong(data))
    },
    changeModeDispatch(data) {
      dispatch(changePlayMode(data))
    },
    changePlayListDispatch(data) {
      dispatch(changePlayList(data))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Player))