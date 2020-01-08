import React, { useState, useRef, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import Header from '../../baseUI/Header';
import Loading from '../../baseUI/Loading';
import Scroll from '../../baseUI/Scroll';
import MusicNote from "../../baseUI/MusicNote";
import SongsList from '../SongsList';
import { Container, TopDesc, Menu } from './style';
import { isEmptyObject } from './../../api/utils';
import { getAlbumList, changeEnterLoading } from './store/actionCreators';
import style from '../../assets/global-style';
import { HEADER_HEIGHT } from '../../api/config';

function Album(props) {
  const [showStatus, setShowStatus] = useState(true);
  const [title, setTitle] = useState("歌单");
  const [isMarquee, setIsMarquee] = useState(false);
  const headerEle = useRef();
  const musicNoteRef = useRef();
  const { match: { params: { id } }, currentAlbum: currentAlbumImmutable, enterLoading, getAlbumDataDispatch } = props;
  let currentAlbum = currentAlbumImmutable.toJS();

  useEffect(() => {
    getAlbumDataDispatch(id)
  }, [getAlbumDataDispatch, id])

  const handleBack = useCallback(() => {
    setShowStatus(false);
  }, []);

  const handleScroll = useCallback((pos) => {
    let minScrollY = -HEADER_HEIGHT;
    let percent = Math.abs(pos.y / minScrollY);
    let headerDom = headerEle.current;
    if (pos.y < minScrollY) {
      headerDom.style.backgroundColor = style["theme-color"];
      headerDom.style.opacity = Math.min(1, (percent - 1) / 2);
      setTitle(currentAlbum && currentAlbum.name);
      setIsMarquee(true);
    } else {
      headerDom.style.backgroundColor = "";
      headerDom.style.opacity = 1;
      setTitle("歌单");
      setIsMarquee(false);
    }
  }, [currentAlbum])

  const musicAnimation = (x, y) => {
    musicNoteRef.current.startAnimation({ x, y });
  };

  const renderTopDesc = () => {
    return (
      <TopDesc background={currentAlbum.coverImgUrl}>
        <div className="background">
          <div className="filter"></div>
        </div>
        <div className="img_wrapper">
          <div className="decorate"></div>
          <img src={currentAlbum.coverImgUrl} alt="" />
          <div className="play_count">
            <i className="iconfont play">&#xe885;</i>
            <span className="count">{Math.floor(currentAlbum.subscribedCount / 1000) / 10} 万 </span>
          </div>
        </div>
        <div className="desc_wrapper">
          <div className="title">{currentAlbum.name}</div>
          <div className="person">
            <div className="avatar">
              <img src={currentAlbum.creator.avatarUrl} alt="" />
            </div>
            <div className="name">{currentAlbum.creator.nickname}</div>
          </div>
        </div>
      </TopDesc>
    )
  }

  const renderMenu = () => {
    return (
      <Menu>
        <div>
          <i className="iconfont">&#xe6ad;</i>
          评论
    </div>
        <div>
          <i className="iconfont">&#xe86f;</i>
          点赞
    </div>
        <div>
          <i className="iconfont">&#xe62d;</i>
          收藏
    </div>
        <div>
          <i className="iconfont">&#xe606;</i>
          更多
    </div>
      </Menu>
    )
  }



  return (
    <CSSTransition
      in={showStatus}
      timeout={300}
      classNames="fly"
      appear={true}
      unmountOnExit
      onExited={props.history.goBack}
    >
      <Container>
        <Header
          ref={headerEle}
          title={title}
          handleClick={handleBack}
          isMarquee={isMarquee}
        />
        {
          !isEmptyObject(currentAlbum) ? (
            <Scroll bounceTop={false} onScroll={handleScroll}>
              <div>
                {renderTopDesc()}
                {renderMenu()}
                <SongsList
                  songs={currentAlbum.tracks}
                  showCollect
                  showBackground
                  musicAnimation={musicAnimation}
                  collectCount={currentAlbum.subscribedCount}
                />
              </div>
            </Scroll>
          ) : null
        }
        {enterLoading ? <Loading /> : null}
        <MusicNote ref={musicNoteRef} />
      </Container>
    </CSSTransition>

  )
}

const mapStateToProps = (state) => ({
  currentAlbum: state.getIn(['album', 'currentAlbum']),
  enterLoading: state.getIn(['album', 'currentLoading'])
})

const mapDispatchToProps = (dispatch) => {
  return {
    getAlbumDataDispatch(id) {
      dispatch(changeEnterLoading(true))
      dispatch(getAlbumList(id))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Album));