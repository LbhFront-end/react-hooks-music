import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import Scroll from '../../baseUI/Scroll';
import Loading from '../../baseUI/Loading';
import { getRankList } from './store/index';
import { filterIndex } from './../../api/utils';
import { Container, List, ListItem, SongList, EnterLoading } from './style';


function Rank(props) {
  const { songsCount, rankList: list, loading, getRankListDataDispatch } = props;
  let rankList = list ? list.toJS() : [];
  useEffect(() => {
    getRankListDataDispatch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  let globalStartIndex = filterIndex(rankList);
  let officialList = rankList.slice(0, globalStartIndex);
  let globalList = rankList.slice(globalStartIndex)

  let displayStyle = loading ? { "display": "none" } : { "display": "" };

  const enterDetail = (id) => {
    props.history.push(`rank/${id}`)
  }

  const renderRankList = (list, global) => {
    return (
      <List globalRank={global}>
        {
          list.map((item) => {
            return (
              <ListItem key={item.id} tracks={item.tracks} onClick={() => enterDetail(item.id)}>
                <div className="img_wrapper">
                  <img src={item.coverImgUrl} alt="" />
                  <div className="decorate"></div>
                  <span className="update_frequecy">{item.updateFrequency}</span>
                </div>
                {renderSongList(item.tracks)}
              </ListItem>
            )
          })
        }
      </List>
    )
  }

  const renderSongList = (list) => {
    return list.length ? (
      <SongList>
        {
          list.map((item, index) => {
            return <li key={index}>{index + 1}. {item.first} - {item.second}</li>
          })
        }
      </SongList>
    ) : null;
  }

  return (
    <Container play={songsCount}>
      <Scroll>
        <div>
          <h1 className="offical" style={displayStyle}> 官方榜 </h1>
          {renderRankList(officialList)}
          <h1 className="global" style={displayStyle}> 全球榜 </h1>
          {renderRankList(globalList, true)}
          {loading ? <EnterLoading><Loading /></EnterLoading> : null}
        </div>
      </Scroll>
      {renderRoutes(props.route.routes)}
    </Container>
  )
}

const mapStateToProps = (state) => ({
  rankList: state.getIn(['rank', 'rankList']),
  loading: state.getIn(['rank', 'loading']),
  songsCount: state.getIn(['player', 'playList']).size
})

const mapDispatchToProps = (dispatch) => {
  return {
    getRankListDataDispatch() {
      dispatch(getRankList())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Rank))