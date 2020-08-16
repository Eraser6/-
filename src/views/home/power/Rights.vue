<template>
  <div>
    <bread-crumb>
      <span slot="left">首页</span>
      <span slot="center">权限管理</span>
      <span slot="right">权限列表</span>
    </bread-crumb>

    <card>
      <el-table :data="rightsList" border stripe slot="content">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="权限路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level==='0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level==='1'" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </card>


  </div>
</template>

<script>
import BreadCrumb from "components/BreadCrumb";
import Card from "components/Card";
import { showDataMixin } from "common/mixin";

export default {
  name: "",
  mixins: [showDataMixin],
  components: {
    BreadCrumb,
    Card
  },
  data(){
    return{
      rightsList:[]
    }
  },
  created(){
    this.getRightsList()
  },
  methods:{
    async getRightsList(){
      const {data:res}=await this.$http.get('rights/list')
      const message = "获取权限列表失败";
      this.showError(res, message);
      this.rightsList=res.data
    console.log(res);
    // console.log(this.rightsList);
    }
  }
};
</script>

<style scoped>
</style>
