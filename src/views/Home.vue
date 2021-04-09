/* eslint-disable */
<template>
  <div class="home" ref="home">
    <div class="table-top">
      <div class="table-query">
        <div class="query-item">
          <label>项目</label>
          <el-select
            v-model="search.projectId"
            filterable
            clearable
            placeholder="请选择项目"
            @change="handleProjectChange">
            <el-option
              v-for="item in projectList"
              :key="item.communityId"
              :label="item.name"
              :value="item.communityId">
            </el-option>
          </el-select>
        </div>

        <div class="query-item">
          <label>车场</label>
          <el-select
            v-model="search.placeId"
            filterable
            clearable
            placeholder="请选择车场"
            style="width: 180px;"
            @change="handlePlaceChange">
            <el-option
              v-for="item in placeList"
              :key="item.placeId"
              :label="item.placeName"
              :value="item.placeId">
            </el-option>
          </el-select>
        </div>

        <div class="query-item">
          <label>月卡类型</label>
          <el-select
            v-model="search.typeName" clearable placeholder="请选择" style="width: 120px;" @change="resetMatch">
            <el-option
              v-for="item in cardTypes"
              :key="item.value"
              :label="item.text"
              :value="item.value">
            </el-option>
          </el-select>
        </div>

        <div class="query-item">
          <label>是否已暂存</label>
          <el-select
            v-model="search.hasMatch"
            clearable
            placeholder="请选择"
            style="width: 100px;"
            @change="resetMatch">
            <el-option
              v-for="item in boolOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value">
            </el-option>
          </el-select>
        </div>

        <div class="query-item">
          <el-checkbox v-model="checkedCount">校验数量</el-checkbox>       
        </div>
      </div>

      <div class="table-btns">
        <el-upload
          action
          class="btn"
          accept=".xlsx, .xls"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="chooseFile"
        >
          <el-button type="primary" :loading="fetching" slot="trigger">开始匹配</el-button>
        </el-upload>
        <el-button class="btn" type="primary" :loading="saving" @click.native="saveAllStage">暂存所有</el-button>
        <el-button class="btn" type="primary" @click.native="exportErrors">导出错误列表</el-button>
      </div>
    </div>

    <div class="table-body">
      <el-table
        border
        ref="table"
        height="calc(100vh - 149px)"
        v-loading="fetching"
        element-loading-text="数据匹配中"
        :data="tableData">
        <el-table-column
          fixed
          prop="name"
          label="车主姓名"
          width="80">
        </el-table-column>
        <el-table-column
          fixed
          prop="phone"
          label="联系方式"
          width="100">
        </el-table-column>
        <el-table-column
          fixed
          prop="typeName"
          label="月卡类型"
          width="100"
          :filters="cardTypes"
          :filter-multiple="false"
          :filtered-value="filter.typeName">
        </el-table-column>
        <el-table-column
          prop="mainCarnos"
          label="主数据车牌"
          width="90">
        </el-table-column>
        <el-table-column
          prop="sourceCarnos"
          label="台账车牌"
          width="90">
        </el-table-column>
        <el-table-column
          label="主数据房屋"
          width="240">
          <template slot-scope="scope">
            <el-radio-group v-model="scope.row.houseId">
              <el-radio v-for="house in scope.row.mainHouses" :key="house.houseId" :label="house.houseId" disabled>{{house.houseName}}</el-radio>
            </el-radio-group>
          </template>
        </el-table-column>
        <el-table-column
          prop="sourceHouse"
          label="台账房屋"
          width="240">
        </el-table-column>
        <el-table-column
          label="主数据车位"
          width="240">
          <template slot-scope="scope">
            <el-checkbox-group v-model="scope.row.parkingIds">
              <el-checkbox 
                v-for="place in scope.row.mainPlaces" 
                :key="place.parkingId" 
                :label="place.parkingId"
                disabled>{{place.code}}</el-checkbox>
            </el-checkbox-group>
          </template>
        </el-table-column>
        <el-table-column
          prop="sourcePlace"
          label="台账车位"
          width="180">
        </el-table-column>
        <el-table-column
          label="是否已暂存"
          width="100"
          :filters="boolOptions"
          :filter-multiple="false"
          :filtered-value="filter.hasMatch">
          <template slot-scope="scope">
            <i v-if="scope.row.hasMatch" class="el-icon-check"></i>
          </template>
        </el-table-column>
        <el-table-column
          label="匹配状态"
          width="100"
          :filters="[{ text: '成功', value: 1 },{ text: '失败', value: 0 }]"
          :filter-multiple="false"
          :filtered-value="filter.matchStatus">
          <template slot-scope="scope">
            <el-tag :type="scope.row.matchStatus ? 'success' : 'error'">
              {{ scope.row.matchStatus ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="msg"
          label="错误信息"
          min-width="240">
        </el-table-column>
      </el-table>

      <div class="table-page">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageNum"
          :page-sizes="[10, 20, 50, 100, 200]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filterData.length">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import xlsx from 'xlsx';
import {
  selectProjects,
  selectPlaces,
  selectFixParks,
  listCardData,
  saveCardExt,
} from '@/api';
import {
  readFile,
  toTimeStr,
  getNameFromArray,
  searchFromArray,
  includeSubArray,
  columns,
} from '@/assets/lib/utils';

const generateKey = (name = '') => {
  return `${name.trim()}`;
}

const compareStr = (main = '', source = '') => {
  return String(main).trim() === String(source).trim();
}

const compareBuildName = (main = '', source = '') => {
  if (Number.isInteger(+source)) {
    source += '栋'
  }
  source = (source+'').trim();
  if (main.indexOf(source) == -1) {
    console.log(main, source);
  }
  return main.indexOf(source) !== -1;
}

const compareUnit = (main = '/', source = '/') => {
  if (main === '/' || source === '/') {
    return true;
  }

  if (Number.isInteger(+main)) {
    main += '单元';
  }
  if (Number.isInteger(+source)) {
    source += '单元';
  }
  
  source = (source+'').trim();
  if (main !== source) {
    console.log(main, source);
  }
  return main === source;
}

const compareRoomNo = (main = '', source = '') => {
  return parseInt(main) === parseInt(source) || main === source;
}

export default {
  name: 'Home',
  data() {
    return {
      fetching: false,
      saving: false,
      checkedCount: false,
      search: {
        projectId: '',
        placeId: '',
        typeName: '',
        hasMatch: '',
      },
      filter: {
        typeName: [],
        hasMatch: [],
        matchStatus: [],
      },
      pageNum: 1,
      pageSize: 20,
      cardTypes: [
        { text: '产权月卡', value: '产权月卡' },
        { text: '固定月卡', value: '固定月卡' },
        { text: '临时月卡', value: '临时月卡' },
      ],
      boolOptions: [
        { text: '是', value: 1 },
        { text: '否', value: 0 },
      ],
      projectList: [],
      placeList: [],
      fixParks: [],
      tableData: [],
      sourceMap: {},
      resultData: [],
      filterData: [],
      usedHouseIds: [],
      usedParkingIds: [],
    };
  },
  watch: {
    'filter': {
      handler(val) {
        console.log('filter', val);
        this.filterData = Object.keys(val).reduce((records, key) => {
          return records.filter(r => (val[key].length === 0 || val[key].indexOf(r[key]) != -1));
        }, this.resultData);
        this.fetchTable(true);
      },
      deep: true
    }
  },
  methods: {
    init() {
      selectProjects().then((data) => {
        this.projectList = data;
      });
    },
    clearData() {
      this.search.placeId = '';
      this.placeList = [];
      this.fixParks = [];
    },
    handleProjectChange(val) {
      this.clearData();
      if (val) {
        selectPlaces(val).then((data) => {
          this.placeList = data;
        });
      }
    },
    handlePlaceChange(val) {
      if (val) {
        selectFixParks({
          pageNum: 1,
          pageSize: 9999,
          projectId: this.search.projectId,
          placeId: val,
        }).then((data) => {
          this.fixParks = data.records;
        }).catch(err => {
          this.$message.error(err.message || '查询固定车位报错');
        });
      } else {
        this.fixParks = [];
      }
    },
    chooseFile(ev) {
      if (!this.search.placeId) {
        this.$message.error('请先选择项目车场');
        return;
      }

      const file = ev.raw;
      if (!file) return;

      this.fetching = true;
      Promise.all([
        this.parseExcel(file),
        this.fetchMainData(),
      ]).then((data) => {
        this.fetching = false;

        const [ sourceMap, mainData ] = data;
        this.startMatch(sourceMap, mainData);
      }).catch((err) => {
        console.log(err);
        this.fetching = false;
        this.$message.error(err.message || '系统开小差了');
      });
    },
    findUnmarked(resultData) {
      Object.keys(this.sourceMap).forEach(key => {
        this.sourceMap[key].forEach(item => {
          if (!item.marked) {
            resultData.push({
              name: item.name,
              phone: item.phone+'',
              cardId: '',
              typeName: item.typeName,
              mainCarnos: '',
              mainHouses: [],
              mainPlaces: [],
              sourceCarnos: item.carnos,
              sourceHouse: item.placeCodes,
              sourcePlace: `${item.buildName}_${item.unit}_${item.roomNo}`,
              houseId: '',
              parkingIds: [],
              hasMatch: false,
              matchStatus: 0,
              matchData: null,
              msg: '标准月卡列表没有此数据',
              updateDate: null,
            });
          }
        });
      });

      return resultData;
    },
    resetMatch() {
      this.fetching = true;
      this.fetchMainData().then((mainData) => {
        this.fetching = false;
        this.startMatch(this.sourceMap, mainData);
      }).catch(err => {
        this.fetching = false;
        this.$message.error(err.message || '系统开小差了');
      })
    },
    startMatch(sourceMap, mainData) {
      const resultData = mainData.map((item, index) => {
        const { name, phone, cardId, typeName, carnos, hasMatch, cardExtVo, updateDate, } = item;
        const { houses, ownerParkPlaces, memberParkPlaces, fixParkPlace, } = cardExtVo;
        const record = {
          name,
          phone,
          cardId,
          typeName,
          mainCarnos: carnos,
          mainHouses: houses,
          mainPlaces: ownerParkPlaces.concat(memberParkPlaces).concat(fixParkPlace),
          sourceCarnos: '',
          sourceHouse: '',
          sourcePlace: '',
          houseId: '',
          parkingIds: [],
          hasMatch: hasMatch,
          matchStatus: 0,
          matchData: null,
          msg: '',
          updateDate: updateDate,
        };

        const onlyKey = generateKey(name);
        const sources = sourceMap[onlyKey];

        this.matchItem(record, sources, (res) => {  
          return Object.assign(record, res);
        });      
        return record;
      });

      this.resultData = this.checkedCount ? this.findUnmarked(resultData) : resultData;
      this.filterData = this.resultData;
      console.log('usedParkingIds', this.usedParkingIds);
      // this.$refs.table.clearFilter();
      this.fetchTable(true);
    },
    matchItem(record, sources, resolve) {
      const res = Object.create(null);
      if (!sources) {
        res.msg = '台账查不到此数据';
        resolve(res);
      } else {
        this.matchPhone(record, sources, res, resolve);
      }
    },
    matchPhone(record, sources, res, resolve) {
      const phoneSources = sources.filter(s => compareStr(record.phone, s.phone));
      if (!phoneSources.length) {
        res.msg = '联系方式不匹配';
        resolve(res);
      } else {
        this.matchTypename(record, phoneSources, res, resolve);
      }
    },
    matchTypename(record, sources, res, resolve) {
      const typeSources = sources.filter(s => s.typeName === record.typeName);
      if (!typeSources.length) {
        res.msg = '月卡类型不匹配';
        resolve(res);
      } else {
        this.matchCarno(record, typeSources, res, resolve);
      }
    },
    matchCarno(record, sources, res, resolve) {
      // 车牌匹配即有唯一值
      let source = searchFromArray(sources, (s) => {
        let sourceCarnos = (s.carnos || '').trim();
        return sourceCarnos.length === record.mainCarnos.length &&
          includeSubArray(sourceCarnos.split('|'), record.mainCarnos.split('|'))
      });
      if (!source) {
        res.msg = '车牌不匹配';
        if (sources.length === 1) {
          res.sourceCarnos = sources[0].carnos;
        }
        resolve(res);
      } else {
        // 标记已匹配的记录
        source.marked = true;

        // 车牌匹配继续下一步房屋
        res.sourceCarnos = source.carnos;
        this.matchHouse(record, source, res, resolve);
      }
    },
    matchHouse(record, source, res, resolve) {
      // 匹配房产
      const houses = record.hasMatch ? record.mainHouses.filter(h => h.selected) : 
        record.mainHouses.filter(h => (!h.selectedByOther && !this.usedHouseIds.includes[h.houseId]));
      const sourceHouse = searchFromArray(houses, (h) => compareBuildName(h.buildName, source.buildName) &&
        compareUnit(h.unit, source.unit) && compareRoomNo(h.roomNo, source.roomNo));
      
      res.sourceHouse = `${source.buildName}_${source.unit || '/'}_${source.roomNo}`;
      if (!sourceHouse)  {
        res.msg = '房屋不匹配';
        resolve(res);
      } else {
        this.matchPlace(record, source, sourceHouse, res, resolve);
      }  
    },
    matchPlace(record, source, sourceHouse, res, resolve) {
      res.sourcePlace = source.placeCodes;
      res.houseId = sourceHouse.houseId;

      /// 悦公馆车牌为数字
      let sourcePlaceCodes = (source.placeCodes ? (source.placeCodes+'').trim() : '').split('|').filter(s => s !== '');
      if (!sourcePlaceCodes.length && record.typeName !== '临时月卡') {
        res.msg = '台账车位为空';
        resolve(res);
        return;
      }

      const isNum = sourcePlaceCodes.length && Number.isInteger(parseInt(sourcePlaceCodes[0]));
      if (isNum) {
        sourcePlaceCodes = sourcePlaceCodes.map(s => parseInt(s));
      }

      // 匹配车位，区分产权和其它车位 
      if (record.hasMatch) {
        const mainPlaces = record.mainPlaces.filter(p => p.selected == 1);
        const mainPlaceCodes = mainPlaces.map(p => {
          if (isNum) {
            const codes = p.code.split('-');
            return parseInt(codes[codes.length-1]);
          } else {
            return p.code;
          }
        });

        if (!includeSubArray(mainPlaceCodes, sourcePlaceCodes)) {
          res.msg = '车位不匹配';
          resolve(res);
        } else {
          // 匹配成功
          res.matchStatus = 1;
          res.parkingIds = mainPlaces.map(p => p.parkingId);
          resolve(res);
        }
      } else {
        let mainPlaces = record.typeName === '产权月卡' ? record.mainPlaces : this.fixParks;
        mainPlaces = mainPlaces.filter(p => (!p.selectedByOther && !this.usedParkingIds.includes[p.parkingId]));  

        const matchPlaces = sourcePlaceCodes.reduce((acc, code) => {
          const current = mainPlaces.find(p => {
            if (isNum) {
              const codes = p.code.split('-');
              return parseInt(codes[codes.length-1]) === code;
            } else {
              return p.code === code;
            }
          });
          if (current) {
            acc.push(current);
          }
          return acc;
        }, []); 

        if (matchPlaces.length !== sourcePlaceCodes.length) {
          res.msg = '车位不匹配';
          resolve(res);
        } else {
          // 匹配成功
          res.matchStatus = 1;
          res.parkingIds = matchPlaces.map(p => p.parkingId);
          if (record.typeName !== '产权月卡') {
            res.mainPlaces = matchPlaces;
          }

          res.matchData = {
            houseIds: [sourceHouse.houseId],
            selectedParkingIds: res.parkingIds,
          }

          // 记录匹配的数据，防止重复匹配
          this.usedHouseIds.push(sourceHouse.houseId);
          this.usedParkingIds.push(...res.parkingIds);
          resolve(res);
        }
      }
    },
    parseExcel(file) {
      return new Promise((resolve, reject) => {
        readFile(file).then((data) => {
          const workbook = xlsx.read(data, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = xlsx.utils.sheet_to_json(worksheet, {header: 1});
          // 去掉第一行备注
          if (jsonData[0].length == 1) {
            jsonData.splice(0, 1);
          }

          const headers = jsonData.splice(0, 1)[0];
          const keys = Object.keys(columns);
          const sourceMap = jsonData.reduce((map, item) => {
            const newOne = keys.reduce((obj, key) => Object.assign(obj, { [columns[key]]: item[key] }), Object.create(null));
            const onlyKey = generateKey(newOne.name);
            const sources = map[onlyKey] || [];
            sources.push(newOne);
            map[onlyKey] = sources;
            return map;
          }, Object.create(null));

          this.sourceMap = Object.freeze(sourceMap);
          console.log(sourceMap);
          resolve(sourceMap);
        }).catch(reject);
      });
    },
    fetchMainData() {
      const filterParams = Object.keys(this.search)
        .filter((key) => this.search[key] !== '')
        .reduce((obj, key) => Object.assign(obj, { [key]: this.search[key] }), {});
      const params = {
        pageNum: 1,
        pageSize: 9999,
        ...filterParams,
      };

      return new Promise((resolve, reject) => {
        listCardData(params).then((data) => {
          resolve(data.records);
        }).catch(reject);
      });
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.fetchTable(true);     
    },
    handleCurrentChange(val) {
      this.pageNum = val;
      this.fetchTable();
    },
    fetchTable(reset = false) {
      if (reset) {
        this.pageNum = 1;
      }

      this.tableData = this.filterData.slice((this.pageNum - 1)*this.pageSize, this.pageNum*this.pageSize);
      console.log(this.tableData)
    },
    batchSaveStage(rows) {
      return Promise.all(rows.map(row => {
        return saveCardExt({
          cardId: row.cardId,
          ...row.matchData,
        });
      }))
    },
    async saveAllStage() {
      const saveData = this.filterData.filter(item => item.matchData);
      if (!saveData.length) {
        this.$message.info('没有可以暂存的数据');
        return;
      }

      this.saving = true;
      let i = 0;
      while (i < saveData.length) {
        console.log(i);
        try {
          await this.batchSaveStage(saveData.slice(i, i + 3));
        } catch (error) {
          console.log(error);
          // this.$message.error()
        } finally {
          i += 3;
        }
      }

      await this.resetMatch();
      this.saving = false;
    },
    exportErrors() {
      let errorsData = this.filterData.filter((item) => (!!item.msg));
      if (!errorsData.length) {
        this.$message.info('无错误数据');
        return;
      }

      errorsData = errorsData.map((item) => ({
        '车主姓名': item.name,
        '联系方式': item.phone,
        '月卡类型': item.typeName,
        '主数据车牌': item.mainCarnos,
        '台账车牌': item.sourceCarnos,
        '主数据房屋': item.mainHouses.map(h => h.houseName).join('|'),
        '台账房屋': item.sourceHouse,
        '主数据车位': item.mainPlaces.map(p => p.code).join('|'),
        '台账车位': item.sourcePlace,
        '错误信息': item.msg,
      }));

      const projectName = getNameFromArray(this.projectList, this.search.projectId, 'communityId', 'name');
      const placeName = getNameFromArray(this.placeList, this.search.placeId, 'placeId', 'placeName');
      const sheet = xlsx.utils.json_to_sheet(errorsData);
      const book = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(book, sheet, 'sheet1');
      xlsx.writeFile(book, `${projectName}${placeName}主数据匹配结果表${toTimeStr(Date.now(), 'yyyyMMdd-hhmmss')}.xls`);
    },
  },
  created() {
    this.init();
  },
  mounted() {
    console.log('mounted')
  },
};
</script>

<style lang="less">
.home {
  height: 100%;
  padding: 30px;
  box-sizing: border-box;
}
.table-top {
  display: flex;
  justify-content: space-between;
}
.table-query {
  display: flex;
  flex: 8;
  flex-wrap: wrap;
  .query-item {
    display: flex;
    align-items: center;
    margin-right: 20px;
    margin-bottom: 10px;
    label {
      font-size: 13px;
      font-weight: normal;
      margin-right: 5px;
    }
  }
}
.table-btns {
  height: 32px;
  display: flex;
  flex: 2;
  justify-content: flex-end;
  .btn + .btn {
    margin-left: 15px;
  }
}
.table-page {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
.table {
  width: 100%;
  height: calc(100vh - 149px);
}
.close {
  padding: 5px;
  cursor: pointer;
  &:hover {
    color: black;
    font-weight: bold;
  }
}
</style>
