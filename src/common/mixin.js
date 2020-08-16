export const showDataMixin={

  methods:{
    // 展示数据
    showError(res,message) {
      if (res.meta.status !== 200) {
        return this.$message.error(message);
      }
    },

    // 获取用户数据列表
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取用户数据列表失败！");
      this.userlist = res.data.users;
      this.total = res.data.total;
    },

    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      this.showError(res, "获取用户数据列表失败！");
      this.catelist = res.data.result;
      this.total = res.data.total;
    }
  }
}