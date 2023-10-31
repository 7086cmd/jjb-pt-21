let routes = [
    {
        path: '/', template: ``
    },
    { path: '/about', template: `About Page` },
]
let router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes
})
let app = Vue.createApp({
    data() {
        return {
            password: '',
            isPwd: true,
            grade: '年级',
            gropt: ['初一', '初二', '初三'],
            cla: '班级',
            clapt: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
            load: Vue.ref(null),
            pwderr: Vue.ref(false),
            reduction: {},
            isLogin: false,
            logining: Vue.ref(false),
            sx1: '',
            $q: Quasar.useQuasar()
        }
    },
    methods: {
        login() {
            let grade = 0
            let grd = 0
            if (this.grade == '初一') {
                grade = 1
            }
            else if (this.grade == '初二') {
                grade = 2
            }
            else if (this.grade == '初三') {
                grade = 3
            }
            this.$q.loading.show({
                message: '正在登录...'
            })
            if (new Date().getMonth() >= 9) {
                grd = new Date().getFullYear() + 1
            }
            else {
                grd = new Date().getFullYear()
            }
            axios({
                method: 'get',
                url: `/api/pwd/${String(grd - grade)}/${String(this.cla)}/check?password=${window.btoa(this.password)}`,
                data: {
                    password: window.btoa(this.password)
                }
            }).then(response => {
                console.log(response.data)
                this.$q.loading.hide()
                if (response.data.result == 'success') {
                    localStorage.setItem('_g_usr_ifo', window.btoa(JSON.stringify({
                        gradeid: String(grade),
                        classid: String(this.cla),
                        password: window.btoa(this.password)
                    })), 365)
                    let jumpp = setTimeout(() => {
                        router.push({ path: '/class' })
                        window.location.href = '/class'
                    }, 3000)
                    this.$q.dialog({
                        title: '登录成功',
                        message: '3s后自动跳至界面...'
                    }).onOk(() => {
                        clearTimeout(jumpp)
                        router.push({ path: '/class' })
                        window.location.href = '/class'
                    })

                } else {
                    this.$q.dialog({
                        title: '登录失败',
                        message: '密码错误'
                    })
                    localStorage.removeItem('_g_usr_ifo')
                }
            })
        }
    },
    setup() {
        let ifo = localStorage.getItem('_g_usr_ifo')
        if (ifo !== null && ifo !== '' && ifo !== undefined) {
            let grd = 0
            if (new Date().getMonth() >= 9) {
                grd = new Date().getFullYear() + 1
            }
            else {
                grd = new Date().getFullYear()
            }
            axios({
                method: 'get',
                url: `/api/pwd/${String(grd - (JSON.parse(window.atob(ifo)).gradeid))}/${JSON.parse(window.atob(ifo)).classid}/check?password=${JSON.parse(window.atob(ifo)).password}`,
                data: {
                    password: JSON.parse(window.atob(ifo)).password
                }
            }).then(response => {
                console.log(response.data)
                if (response.data.result == 'success') {
                    console.log('cookie good.')
                    router.push({ path: '/class' })
                } else {
                    localStorage.removeItem('_g_usr_ifo')
                }
            })
        }
        let $q = Quasar.useQuasar()
    }
})
app.use(Quasar, {
    config: {}
})
app.use(router)
Quasar.lang.set(Quasar.lang.zhCN)
app.mount('#app')
router.push({ path: '/class/login' })
// router.push('/')