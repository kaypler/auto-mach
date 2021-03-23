/* eslint-disable */
import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'development' ? '' : 'https://parkutil.smartmideazy.com';
const http = axios.create({
  baseURL,
  timeout: 10*60*1000,
});

// 请求拦截器
http.interceptors.request.use(config => {
  return config;
});

// 响应拦截器
http.interceptors.response.use(response => {
  const res = response.data
  if (res.code == 200){
    return res.body;
  } else {
    return Promise.reject(res);
  }    
}, err => {
  if (err.message.includes('timeout')) {
    err.message = '请求超时';
  } 

  return Promise.reject(err);
});

/**
 * 查询项目列表
 */
 export const selectProjects = () => {
  return http.get('/park/segiu/selectProject');
}

/**
* 项目id查询车场
* @param {String} communityId 
*/
export const selectPlaces = (communityId) => {
  return http.get(`/park/segiu/selectPlaceByCommunityId?communityId=${communityId}`);
}

/**
 * 查询固定车位
 * @param {Object} params 
 * - params.name
 * - params.pageNum
 * - params.pageSize
 * - params.placeId
 * - params.projectId
 */
 export const selectFixParks = (params) => {
  return http.post('/park/segiu/selectFixParks', params);
}

/**
 * 分页查询匹配的数据
 * @param {Object} params 
 * @param {Number} params.pageNum 页码:第一页从1开始（必填）
 * @param {Number} params.pageSize 每页大小（必填）
 * @param {String} params.projectId 项目id（必填）
 * @param {String} params.buildId 楼栋id
 * @param {String} params.category 月卡分类:产权月卡、固定月卡、临时月卡
 * @param {String} params.custOrPhone 姓名或手机号码
 * @param {Number} params.hasCarPlace 是否拥有车位:0否，1：是
 * @param {Number} params.hasMatch 是否匹配:0否，1：是
 * @param {Number} params.hasMoreCard 是否多月卡:0否，1：是
 * @param {String} params.roomNo 房间号
 * @param {String} params.unit 单元
 */
 export const listCardData = (params) => {
  return http.post('/park/card/list', params);
}

/**
 * 点击暂存
 * @param {Object} params 
 * @param {String} params.cardId 月卡唯一id（必填）
 * @param {Array} params.houseIds 勾选的房屋id列表（必填）
 * @param {Object} params.selectedParkingIds 勾选的车位的id列表
 */
export const saveCardExt = (params) => {
  return http.post('/park/card/saveCardExt', params);
}