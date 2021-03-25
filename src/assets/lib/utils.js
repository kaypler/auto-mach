/* eslint-disable */

// 设置异步间隔延迟
export function delay(interval = 0) {
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      resolve();
    }, interval);
  });
}

// 把文件按照二进制读取
export function readFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = ev => {
      resolve(ev.target.result);
    }
  });
}

// 格式化时间
export function toTimeStr(date, formatter = 'yyyy-MM-dd') {
  if (!date) return;

  if (typeof(date) === 'string' || typeof(date) === 'number') {
    date = new Date(date);
  }
  const o = { 
    "M+" : date.getMonth()+1,  
    "d+" : date.getDate(),
    "h+" : date.getHours(),
    "m+" : date.getMinutes(),
    "s+" : date.getSeconds(),
    "q+" : Math.floor((date.getMonth()+3)/3),
    "S" : date.getMilliseconds(), 
  }; 
  if (/(y+)/.test(formatter)) {
    formatter = formatter.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length)); 
  }

  for (let k in o) {
    if (new RegExp("("+ k +")").test(formatter))  {
      formatter = formatter.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (o[k]+'').padStart(2, '0'));  
    }  
  }

   return formatter; 
}

// 数组中寻找元素名
export const getNameFromArray = (arr = [], id, key, name) => {
  const obj = arr.find(a => a[key] == id) || {};
  return obj[name] || '';
}

// 数组中寻找特定元素
export const searchFromArray = (arr = [], fn) => {
  return arr.find(fn);
}

// 数组中是否包含给定的子数组
export const includeSubArray = (arr = [], subArr = [], key) => {
  let flag = true;
  for (let i = 0; i < subArr.length; i++) {
    if (!arr.find(a => (key ? a[key] === subArr[i] : a === subArr[i]))) {
      flag = false;
      break;
    }
  }

  return flag;
}

export const debounce = (callback, timeout, immediate) => {
  let timer;
  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timer = null;
      if (!immediate) callback.apply(context, args); // 设置为尾部调用才延时触发
    }
    const callNow = immediate && !timer;
    clearTimeout(timer);
    timer = setTimeout(later, timeout);
    callNow && callback.apply(context, args); // 设置为首部调用立即触发
  }
}

// // 字段对应表
// export const columns = {
//   '车主姓名（只能1个）': 'name',
//   '联系电话（1个）': 'phone',
//   '楼栋': 'buildName',
//   '单元': 'unit',
//   '房号': 'roomNo',
//   '月卡类型': 'typeName',
//   '车牌号码（可以多个车牌号码）': 'carnos',
//   '车位编号（可以多个车位号）': 'placeCodes',
// }
// 字段对应表
export const columns = {
  '4': 'name',
  '9': 'phone',
  '1': 'buildName',
  '2': 'unit',
  '3': 'roomNo',
  '11': 'typeName',
  '15': 'carnos',
  '14': 'placeCodes',
}