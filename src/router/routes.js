export default [
    {
        path: '/',
        name: 'index',
        title: '首页',
        component: () => import('../pages/home/index.vue'), //.vue不能省略
    }
]