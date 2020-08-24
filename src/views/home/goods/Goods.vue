<template>
  <div>
    <!-- 面包屑导航 -->
    <bread-crumb>
      <span slot="left">首页</span>
      <span slot="center">商品管理</span>
      <span slot="right">商品列表</span>
    </bread-crumb>

    <!-- 卡片区域 -->
    <card>
      <el-row :gutter="20" slot="add">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            clearable
            @clear="this.getGoodsList"
            class="input-with-select"
            v-model="queryInfo.query"
          >
            <el-button slot="append" @click="this.getGoodsList" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="goAddPage">添加商品</el-button>
          </div>
        </el-col>
      </el-row>

      <el-table :data="goodslist" stripe border slot="content">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" width="500px" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）"></el-table-column>
        <el-table-column prop="goods_number" label="商品重量"></el-table-column>
        <el-table-column prop="add_time" label="创建时间">
          <template slot-scope="scope">{{scope.row.add_time|formatDate}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 编辑 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" @click="removeGoodsList(scope.row.goods_id)"  size="mini"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        slot="pagination"
      ></el-pagination>
    </card>
  </div>
</template>

<script>
import BreadCrumb from "components/BreadCrumb";
import Card from "components/Card";
import { showDataMixin } from "common/mixin";

export default {
  name: "Goods",
  mixins: [showDataMixin],
  components: {
    BreadCrumb,
    Card,
  },
  data() {
    return {
      addDialogVisible: false,
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      goodslist: [],
    };
  },
  created() {
    this.getGoodsList();
  },

  computed: {},
  methods: {
    // -----分页-----
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },

    // -----添加-----
    goAddPage(){
      this.$router.push('/goods/add')
    },

    // -----删除-----
    async removeGoodsList(id){
       const confirmResult=await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(confirmResult==='confirm'){
          const {data:res}=await this.$http.delete('goods/'+id)
          this.showError(res,"删除商品失败！")
          this.$message.success("删除商品成功！")
          this.getGoodsList()
        }
    }
  },
};
</script>

<style scoped>
.el-table {
  min-width: 1300px;
}
</style>
