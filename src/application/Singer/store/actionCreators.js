import { fromJS } from 'immutable';
import { CHANGE_ARTISI, CHANGE_SONGS_OF_ARTISI, CHANGE_ENTER_LOADING } from './constants';
import { getSingerInfoRequest } from './../../../api/request';

const changeArtist = (data) => ({
  type: CHANGE_ARTISI,
  data: fromJS(data)
})

const changeSongs = (data) => ({
  type: CHANGE_SONGS_OF_ARTISI,
  data: fromJS(data)
})

export const changeEnterLoading = (data) => ({
  type: CHANGE_ENTER_LOADING,
  data
})

export const getSingerInfo = (id) => {
  return dispatch => {
    getSingerInfoRequest(id).then(data => {
      dispatch(changeArtist(data.artist));
      dispatch(changeSongs(data.hotSongs))
      dispatch(changeEnterLoading(false))
    })
  }
}