import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from 'views/login/Login'
import Home from 'views/home/Home'
import Users from 'views/home/users/Users'
import Rights from 'views/home/power/Rights'
import Roles from 'views/home/power/Roles'
import Category from 'views/home/goods/Category'
import Params from 'views/home/goods/Params'
import Goods from 'views/home/goods/Goods'
import Add from 'views/home/goods/Add'
import Order from 'views/home/order/Order'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect:'/users',
    children: [
      {path:'/users',component:Users},
      {path:'/rights',component:Rights},
      {path:'/roles',component:Roles},
      {path:'/categories',component:Category},
      {path:'/params',component:Params},
      {path:'/goods',component:Goods},
      {path:'/goods/add',component:Add},
      {path:'/orders',component:Order},
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
routes})

// 挂载路由导航守卫
// to 将要访问的路径；from 从哪个路径跳转而来；next 表示放行
router.beforeEach((to, from, next) => {
  if (to.path === '/login')return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr)return next('/login')
  next()
})

export default router