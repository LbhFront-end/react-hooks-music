import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import MiniPlayer from './MiniPlayer';
import NormalPlayer from './NormalPlayer';
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



function Player(props) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [preSong, setPerSong] = useState({})
  const [modeText, setModeText] = useState('');
  const audioRef = useRef();
  const toastRef = useRef();
  let percent = isNaN(currentTime / duration) ? 0 : currentTime / duration
  const {
    fullScreen,
    playing,
    sequencePlayList: immutableSequencePlayList,
    // playList: immutablePlayList,
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

  // let currentSong = immutableCurrentSong.toJS();
  // let playList = immutablePlayList.toJS();
  let sequencePlayList = immutableSequencePlayList.toJS();
  const currentSong = {
    al: { picUrl: "https://p1.music.126.net/JL_id1CFwNJpzgrXwemh4Q==/109951164172892390.jpg" },
    name: "木偶人",
    ar: [{ name: "薛之谦" }]
  }
  const playList = [
    {
      id: '1374051000',
      al: { picUrl: "https://p1.music.126.net/JL_id1CFwNJpzgrXwemh4Q==/109951164172892390.jpg" },
      name: "木偶人",
      ar: [{ name: "薛之谦" }]
    }
  ]

  const clickPlaying = (e, state) => {
    e.stopPropagation();
    togglePlayingDispatch(state)
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

  useEffect(() => {
    if (
      !playList.length ||
      currentIndex === -1 ||
      !playList[currentIndex] ||
      playList[currentIndex].id === preSong.id
    ) {
      return;
    }

    let current = playList[currentIndex];
    changeCurrentSongDispatch(current);// 赋值 currentSong
    setPerSong(current)
    audioRef.current.src = getSongUrl(current.id);
    setTimeout(() => {
      audioRef.current.play()
    });
    togglePlayingDispatch(true);// 播放状态
    setCurrentTime(0);// 从头开始播放
    setDuration((286000 / 1000) | 0);// 时长
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
          />
        )
      }


      <audio
        onEnded={handleEnd}
        onTimeUpdate={updateTime}
        ref={audioRef}
      />
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