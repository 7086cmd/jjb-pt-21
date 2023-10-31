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
    setup() {
        if (sessionStorage.getItem('_m_usr_ifo') != undefined && sessionStorage.getItem('_m_usr_ifo') != null) {
            window.location.href = '/member'
        }
        let { ref, reactive, toRefs } = Vue
        let { useQuasar, Dialog, Loading, LoadingBar, Cookies, LocalStorage, SessionStorage, Dark, BottomSheet, AddressbarColor, Notify, useMeta } = Quasar
        let $q = useQuasar()

        let datas = null
        let listr = []
        let structure = []
        $q.loading.show({
            message: 'Fetching data...'
        })
        let loginPrepairStruction = reactive({
            namelist: [],
            password: '',
            label: ''
        })
        if (localStorage.length == 0) {
            $q.loading.hide()
            $q.loading.show({
                message: 'Not loaded. Reload page is opening...'
            })
            setTimeout(() => {
                window.location.href = '/class/login'
            }, 3000)
        }
        else {
            let ifo = localStorage.getItem('_g_usr_ifo')
            let grd = 0
            if (new Date().getMonth + 1 >= 9) {
                grd = new Date().getFullYear() + 2
            }
            else {
                grd = new Date().getFullYear() + 1
            }
            if (ifo !== null && ifo !== '' && ifo !== undefined) {
                if (sessionStorage.length != 0) {
                    let uifo = JSON.parse(window.atob(sessionStorage.getItem('_m_usr_ifo')))
                    axios({
                        method: 'get',
                        url: `/api/member/pwd/${grd - JSON.parse(window.atob(ifo)).gradeid}/${JSON.parse(window.atob(ifo)).classid}/${uifo.number}/check?password=${window.btoa(uifo.password)}&from=memberclient`,
                        data: {
                            password: `${window.btoa(uifo.password)}`
                        }
                    }).then(response => {
                        if (response.data.status == 'ok') {
                            router.push({ path: '/member' })
                            window.location.href = '/member'
                        }
                        else {
                            sessionStorage.removeItem('_m_usr_ifo')
                        }
                    })
                }
                axios({
                    method: 'get',
                    url: `/api/pwd/${grd - JSON.parse(window.atob(ifo)).gradeid}/${JSON.parse(window.atob(ifo)).classid}/check?password=${JSON.parse(window.atob(ifo)).password}&from=classclient`,
                    data: {
                        password: JSON.parse(window.atob(ifo)).password
                    }
                }).then(response => {
                    if (response.data.result == 'success') {
                        $q.loading.hide()
                        axios({
                            method: 'get',
                            url: `/api/member/${grd - JSON.parse(window.atob(ifo)).gradeid}/${JSON.parse(window.atob(ifo)).classid}/check?password=${JSON.parse(window.atob(ifo)).password}&from=classclient`,
                            data: {
                                password: JSON.parse(window.atob(ifo)).password
                            }
                        }).then(response => {
                            structure = response.data.data.details
                            for (let i = 0; i in response.data.data.details; i++) {
                                listr.push(response.data.data.details[i].name)
                                loginPrepairStruction.namelist.push(response.data.data.details[i].name)
                            }
                            $q.loading.hide()
                        })
                    }
                    else {
                        $q.loading.hide()
                        $q.loading.show({
                            message: 'Password Wrong. Reload page is opening...'
                        })
                        setTimeout(() => {
                            window.location.href = '/class/login'
                        })
                    }
                })
            }
        }
        let showr = () => {
            console.log(loginPrepairStruction.namelist)
        }
        let login = () => {
            let ifo = localStorage.getItem('_g_usr_ifo')
            let grd = 0
            if (new Date().getMonth >= 9) {
                grd = new Date().getFullYear() + 2
            }
            else {
                grd = new Date().getFullYear() + 1
            }
            for (let i = 0; i in structure; i++) {
                if (loginPrepairStruction.label == structure[i].name) {
                    console.log(loginPrepairStruction.password)
                    axios({
                        method: 'get',
                        url: `/api/member/pwd/${grd - JSON.parse(window.atob(ifo)).gradeid}/${JSON.parse(window.atob(ifo)).classid}/${structure[i].number}/check?password=${window.btoa(loginPrepairStruction.password)}&from=classclient`,
                        data: {
                            password: `${window.btoa(loginPrepairStruction.password)}`
                        }
                    }).then(response => {
                        if (response.data.status == 'ok') {
                            sessionStorage.setItem('_m_usr_ifo', window.btoa(JSON.stringify({
                                classid: JSON.parse(window.atob(ifo)).classid,
                                gradeid: grd - JSON.parse(window.atob(ifo)).gradeid,
                                number: structure[i].number,
                                password: window.btoa(loginPrepairStruction.password)
                            })))
                            let jumpp = setTimeout(() => {
                                router.push({ path: '/member' })
                                window.location.href = '/member'
                            }, 3000)
                            $q.dialog({
                                title: '登录成功',
                                message: '3s后自动跳至界面...'
                            }).onOk(() => {
                                clearTimeout(jumpp)
                                router.push({ path: '/member' })
                                window.location.href = '/member'
                            })
                        }
                        else {
                            $q.dialog({
                                title: '登陆失败',
                                message: response.data.reason
                            })
                        }
                    })
                }
            }
        }
        return {
            password: ref(''),
            isPwd: ref(true),
            grade: ref('年级'),
            gropt: ref(['初一', '初二', '初三']),
            cla: ref('班级'),
            clapt: ref(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']),
            load: ref(null),
            pwderr: ref(false),
            reduction: ref({}),
            isLogin: ref(false),
            logining: ref(false),
            sx1: ref(''),
            namelist: ref(listr),
            loginingname: ref(listr[0]),
            loginPrepairStruction,
            showr,
            login
        }
    }
})
app.use(Quasar, {
    config: {}
})
app.use(router)
Quasar.lang.set(Quasar.lang.zhCN)
app.mount('#app')