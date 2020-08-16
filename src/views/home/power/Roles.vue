<template>
  <div>
    <bread-crumb>
      <span slot="left">首页</span>
      <span slot="center">权限管理</span>
      <span slot="right">角色列表</span>
    </bread-crumb>
    <card>
      <el-row slot="add">
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolelist" slot="content" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1===0?'bdtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  :class="[i2===0?'':'bdtop','vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                      type="success"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row}}
            </pre>-->
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="showEditDialog(scope.row.id)"
              icon="el-icon-edit"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="roleForm" :rules="roleFormRules" ref="addRoleFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName" class="role_label">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" class="role_label">
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="roleFormRules" ref="editRoleFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleN$ame">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightdialogVisible" width="30%">
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addlotRights">确 定</el-button>
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
      // 角色列表数据
      rolelist: [],
      // 权限数据
      rightslist: [],
      roleId:'',
      // 树形属性绑定
      treeProps: {
        label: "authName",
        children: "children",
      },
      defKeys:[],
      addDialogVisible: false,
      editDialogVisible: false,
      setRightdialogVisible: false,
      roleForm: {
        roleName: "",
        roleDesc: "",
      },
      editForm: {},
      // ---规则---
      roleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "角色名称长度在2~10个字符之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 15,
            message: "角色描述长度在2~15个字符之间",
            trigger: "blur",
          },
        ],
      },
    };
  },
  components: {
    BreadCrumb,
    Card,
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      const message = "";
      this.showError(res, message);
      this.rolelist = res.data;
      // console.log(this.rolelist);
    },

    // -----添加-----
    addDialogClosed() {
      this.$refs.addRoleFormRef.resetFields();
    },

    // 添加新角色
    addUser() {
      this.$refs.roleFormRef.validate(async (valid) => {
        console.log(valid);
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.roleForm);
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加新角色失败！");
        }
        this.$message.success("添加新角色成功");
        this.addDialogVisible = false;
        this.getRolesList();
      });
    },

    // -----分配权限-----
    async showSetRightDialog(role) {
      this.defKeys=[]
      this.roleId=role.id
      const { data: res } = await this.$http.get("rights/tree");
      const message = "获取权限数据失败！";
      this.showError(res, message);
      this.rightslist = res.data;
      // console.log(this.rightslist);
      // 获取三级节点id
      this.getLeafKeys(role,this.defKeys)

      this.setRightdialogVisible = true;
    },

    //  获取三级权限id并保存
    getLeafKeys(node,arr){
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item=>
        this.getLeafKeys(item,arr)
      )
    },

    // 为角色分配权限
    async addlotRights(){
      const keys=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys);
      const idStr=keys.join(',')
      const {data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      console.log(res);
      const message="分配权限失败"
      this.showError(res,message)
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightdialogVisible=false
    },


    // -----编辑-----
    editDialogClosed() {
      this.$refs.editRoleFormRef.resetFields();
    },

    // 根据id编辑角色
    async showEditDialog(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get("roles/" + id);
      const message = "查询用户信息失败";
      this.showError(res, message);
      this.editForm = res.data;
      console.log(this.editForm);
    },

    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editRoleFormRef.validate(async (valid) => {
        console.log(valid);
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          }
        );
        const message = "更新用户信息失败！";
        this.showError(res, message);
        this.editDialogVisible = false;
        this.getRolesList();
        this.$message.success("更新角色信息成功");
      });
    },

    // -----删除-----
    // 删除角色
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      console.log(confirmResult);
      if (confirmResult === "confirm") {
        const { data: res } = await this.$http.delete("roles/" + id);
        const message = "删除角色失败！";
        this.showError(res, message);
        this.getRolesList();
        this.$message.success("删除角色成功");
      }
    },

    // 删除权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(async () => {
          this.$message({
            type: "success",
            message: "删除成功!",
          });
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          );
          console.log(res);
          const message = "删除权限失败";
          this.showError(res, message);

          // this.getRolesList()
          role.children = res.data;
        })
        .catch((err) => err);
    },
  },
};
</script>

<style scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
