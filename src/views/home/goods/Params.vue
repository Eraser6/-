<template>
  <div>
    <bread-crumb>
      <span slot="left">首页</span>
      <span slot="center">商品管理</span>
      <span slot="right">参数列表</span>
    </bread-crumb>

    <card>
      <el-row slot="add">
        <el-col>
          <el-alert title="注意：只允许为第三级分类设置相关参数！" :closable="false" show-icon type="warning"></el-alert>
        </el-col>
        <el-col class="cat_opt">
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateProps"
            @change="cateChanged"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 页签 -->
      <el-tabs slot="content" v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            :disabled="isBtnDisabled"
            type="primary"
            size="mini"
            @click="addParamsDialogVisible=true"
          >添加参数</el-button>

          <!-- 动态表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" @close="handleClose(i,scope.row)" :key="i" closable>{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="editParamDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParamById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            size="mini"
            @click="addParamsDialogVisible=true"
          >添加属性</el-button>

          <!-- 静态表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="editParamDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParamById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </card>

    <!-- 添加属性弹出框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addParamsDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑属性对话框 -->
    <el-dialog
      title="编辑属性"
      :visible.sync="editParamDialogVisible"
      width="50%"
      @close="editParamDialogClosed"
    >
      <el-form
        :model="editParamForm"
        :rules="editParamFormRules"
        ref="editParamFormRef"
        label-width="70px"
      >
        <el-form-item label="分类名称" prop="attr_name">
          <el-input v-model="editParamForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParam">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import BreadCrumb from "components/BreadCrumb";
import Card from "components/Card";
import { showDataMixin } from "common/mixin";

export default {
  name: "",
  mixins: [showDataMixin],
  data() {
    return {
      selectedCateKeys: [],
      catelist: [],
      // 被激活的页签名称
      activeName: "many",
      manyTableData: [],
      onlyTableData: [],
      addParamsDialogVisible: false,
      editParamDialogVisible: false,
      editParamForm: {},
      editParamFormRules: {},

      addForm: {
        attr_name: "",
      },
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: "请输入参数名称",
            trigger: "blur",
          },
        ],
      },
      editParamFormRules: {
        attr_name: [
          {
            required: true,
            message: "请输入参数名称",
            trigger: "blur",
          },
        ],
      },
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
        checkStrictly: "true",
      },
    };
  },
  created() {
    this.getCateList();
  },
  components: {
    BreadCrumb,
    Card,
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    // 动态计算标题文本
    titleText() {
      return this.activeName === "many" ? "动态参数" : "静态属性";
    },
  },
  methods: {
    // 联级点击事件
    cateChanged() {
      this.getParamData();
    },

    // 页签点击事件
    handleTabClick() {
      this.getParamData();
      console.log(this.activeName);
    },

    // -----添加-----
    // 对话框关闭时间
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },

    // 监听点击确定添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        console.log(this.addForm);
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        this.showError(res, "添加参数失败!");
        this.$message.success("添加参数成功！");
        this.addParamsDialogVisible = false;
        this.getParamData();
      });
    },

    // -----编辑-----
    editParamDialogClosed() {
      this.$refs.editParamFormRef.resetFields();
    },

    async editParamDialog(id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/` + id
      );
      console.log(res);
      this.editParamForm = res.data;
      this.showError(res, "获取属性数据失败！");
      this.getParamData();
      this.editParamDialogVisible = true;
    },
    // 属性编辑
    editParam() {
      this.$refs.editParamFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/` + this.editParamForm.attr_id,
          this.editParamForm
        );
        console.log(res);
        this.showError(res, "获取属性数据失败！");
        this.getParamData();
        this.editParamDialogVisible = false;
      });
    },

    // 参数编辑
    // 监听文本框失去焦点
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false;
        row.inputValue = '';
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
     this.saveAttrVals(row)
    },

    // 监听点击加号
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    // 保存attr_vals值到数据库
    async saveAttrVals(row){
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel:row.attr_sel,
          attr_vals:row.attr_vals.join(',')
        }
      );
      this.showError(res,"修改参数项失败！")
      this.$message.success('修改参数项成功！')
    },

    // -----删除-----
    async removeParamById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该属性, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult === "confirm") {
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/` + id
        );
        console.log(res);
        this.showError(res, "删除分类失败！");
        this.$message.success("删除分类成功");
        this.getParamData();
      }
    },

    // 监听标签删除
    async handleClose(i,row){
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    }
  },
};
</script>

<style scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin-right: 15px;
}

.input-new-tag {
  width: 120px;
}
</style>
