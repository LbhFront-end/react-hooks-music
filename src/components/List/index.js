import React from 'react';
import Lazyload from 'react-lazyload';
import { withRouter } from 'react-router-dom';
import { getCount } from '../../api/utils';
import { ListWrapper, List, ListItem } from './style';

function RecommendList(props) {
  const { recommendList } = props;

  const enterDetail = (id)=>{
    props.history.push (`/recommend/${id}`)
  }
  return (
    <ListWrapper>
      <h1 className="title">推荐歌单</h1>
      <List>
        {
          recommendList.map((item) => (
            <ListItem key={item.id} onClick={()=>enterDetail(item.id)}>
              <div className="img_wrapper">
                <div className="decorate"></div>
                <Lazyload placeholder={<img src={require('./music.png')} width="100%" height="100%" alt="music" />}>
                  <img src={item.picUrl + "?param=300x300"} width="100%" height="100%" alt="music" />
                </Lazyload>
                <div className="play_count">
                  <i className="iconfont play">&#xe885;</i>
                  <span className="count">{getCount(item.playCount)}</span>
                </div>
              </div>
              <div className="desc">{item.name}</div>
            </ListItem>
          ))
        }
      </List>
    </ListWrapper>
  )
}

export default React.memo(withRouter(RecommendList))