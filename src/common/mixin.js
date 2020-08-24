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
    // 获取分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      this.showError(res, "获取用户数据列表失败！");
      this.catelist = res.data.result||res.data;
      this.total = res.data.total;
    },

    // 获取参数数据列表
    async getParamData() {
      console.log(this.selectedCateKeys);
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTableData=[]
        this.onlyTableData=[]
        return;
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      );
      this.showError(res, "获取参数列表失败！");
      console.log(res.data);
      res.data.forEach(item => {
        item.attr_vals=item.attr_vals?item.attr_vals.split(','):[]
        item.inputVisible=false
        item.inputValue=""
      });
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },

    // 获取商品信息
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      this.total = res.data.total;
      this.goodslist = res.data.goods;
      this.showError(res, "展示商品列表数据失败");
      console.log(res.data);
    },
  }
}