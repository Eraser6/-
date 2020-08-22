<template>
  <div>
    <bread-crumb>
      <span slot="left">首页</span>
      <span slot="center">商品管理</span>
      <span slot="right">商品分类</span>
    </bread-crumb>

    <card>
      <!-- 首部 -->
      <el-row slot="add">
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        slot="content"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        :show-row-hover="false"
        index-text
        class="treeTable"
      >
        <!-- 是否有效 -->
        <template v-slot:isok="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:option="scope">
          <el-button icon="el-icon-edit" type="primary" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
          <el-button icon="el-icon-delete" type="danger" size="mini" @click="removeEditCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

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

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="70px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="70px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import BreadCrumb from "components/BreadCrumb";
import Card from "components/Card";
import { showDataMixin } from "common/mixin";

export default {
  name: "Category",
  mixins: [showDataMixin],
  components: {
    BreadCrumb,
    Card,
  },
  created() {
    this.getCateList();
  },
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      catelist: [],
      total: 0,
      // 父级分类数据
      parentCateList: [],
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      editCateForm:{},
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "option",
        },
      ],
      addCateDialogVisible: false,
      editCateDialogVisible:false,
      addCateFormRules: {
        cat_name: [{ required: true, message: "分类名称", trigger: "blur" }],
      },
      editCateFormRules: {
        cat_name: [{ required: true, message: "分类名称", trigger: "blur" }],
      },
    };
  },
  methods: {
    // -----分页-----
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },

    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },

    // -----添加-----

    // 展示添加分类框
    showAddCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },

    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.pid = 0;
    },

    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        type: 2,
      });
      this.showError(res, "获取父级分类数据失败！");
      this.parentCateList = res.data;
    },

    // 选择项发生变化
    parentCateChanged() {
      console.log(this.selectedKeys);
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateForm.cat_level = this.selectedKeys.length
        console.log(this.addCateForm.cat_level);
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },

    // 点击确定，添加新分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("categories",this.addCateForm);
        if(res.meta.status!==201){
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList();
        this.addCateDialogVisible=false
        console.log(this.addCateForm);
        console.log(this.selectedKeys);
      });
    },

    // -----编辑-----
    // 通过id获取商品分类
    async showEditCateDialog(id){
      console.log(id);
      const {data:res} = await this.$http.get('categories/'+id)
      console.log(res);
      this.editCateForm=res.data
      this.showError(res,"分类名称获取失败")
      this.editCateDialogVisible=true
    },
    // 监听关闭
    editCateDialogClosed(){
      this.$refs.editCateFormRef.resetFields();
    },
    // 监听点击确认编辑分类
    editCate(){
      this.$refs.editCateFormRef.validate(async valid=>{
        if(!valid)return
        console.log(this.editCateForm);
        const {data:res}=await this.$http.put('categories/'+this.editCateForm.cat_id,this.editCateForm)
        console.log(res);
        this.showError(res,"分类更新失败！")
        this.getCateList()
        this.editCateDialogVisible=false
      })
    },

    // -----删除-----
    // 删除分类
    async removeEditCate(id){
      const confirmResult=await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(confirmResult==='confirm'){
          const {data:res} =await this.$http.delete('categories/'+id)
          console.log(res);
          this.showError(res,"删除分类失败！")
          this.$message.success('删除分类成功')
          this.getCateList()
        }

    }
  },
};
</script>

<style scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
