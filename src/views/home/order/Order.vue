<template>
  <div>
    <bread-crumb>
      <span slot="left">首页</span>
      <span slot="center">订单管理</span>
      <span slot="right">订单列表</span>
    </bread-crumb>

    <card>
      <el-row :gutter="20" slot="add">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            clearable
            @clear="this.getOrderList"
            class="input-with-select"
            v-model="queryInfo.query"
          >
            <el-button slot="append" @click="this.getOrderList" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="orderlist" stripe border slot="content">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status==='0'">未付款</el-tag>
            <el-tag type="primary" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time|formatDate}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEdit(scope.row.order_id)"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgressBox(scope.row.order_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 编辑属性对话框 -->
    <el-dialog title="编辑属性" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="省市区/县" prop="address1" class="form-label">
          <el-cascader v-model="editForm.address1" :options="cityData" :props="{expandTrigger: 'hover'}"></el-cascader>
        </el-form-item>

        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddgress">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import BreadCrumb from "components/BreadCrumb";
import Card from "components/Card";
import { showDataMixin } from "common/mixin";
import cityData from "./citydata.js";

export default {
  name: "Order",
  mixins: [showDataMixin],
  components: {
    BreadCrumb,
    Card,
  },
  data() {
    return {
      orderlist: [],
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      editDialogVisible: false,
      editForm: {},
      selectedOrderKeys: [],
      editProps: {
        value: "order_id",
        expandTrigger: "hover",
      },
      editForm: {
        address1: [],
        address2: "",
      },
      editFormRules: {
        address1: [
          {
            required: true,
            message: "请选择省市区县",
            trigger: "blur",
          },
        ],
        address2: [
          {
            required: true,
            message: "请输入详细地址",
            trigger: "blur",
          },
        ],
      },
      cityData,
      progressVisible: false,
      progressInfo: [],
    };
  },
  created() {
    this.getOrderList();
  },
  computed: {},
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      console.log(res.data);
      this.orderlist = res.data.goods;
      this.total = res.data.total;
      console.log(this.queryInfo.query);
      this.showError(res, "获取订单数据失败！");
    },

    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },

    // 监听点击编辑
    async showEdit(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get("orders/" + id);
      console.log(res);
      this.showError(res, "获取订单详情失败！");
      this.editForm = res.data;
    },

    // 监听修改地址确认
    editAddgress() {
      console.log(this.editForm);
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "orders/" + this.editForm.order_id,
          this.editForm
        );
        console.log(res);
        if(res.meta.status!==201){
          return this.$message.error('更新地址失败！')
        }
        this.getOrderList();
        this.editDialogVisible=false
      });
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    async showProgressBox(id) {
      const { data: res } = await this.$http.get("/kuaidi/1106975712662");
      this.progressVisible = true;
      this.showError(res, "物流进度获取失败！");
      this.progressInfo = res.data;
      console.log(this.progressInfo);
    },
  },
};
</script>

<style scoped>
.addr {
  margin: 0 0 15px 10px;
}

.el-form-item__label {
  width: 75px !important;
}

.el-cascader {
  width: 100%;
}
</style>
