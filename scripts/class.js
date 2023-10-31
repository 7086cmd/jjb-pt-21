if (localStorage.length == 0) {
    window.location.href = '/class/login'
}
let ifffo = JSON.parse(window.atob(localStorage.getItem('_g_usr_ifo')))
let socket = io.connect(`ws://localhost:1108?type=class&gradeid=${ifffo.gradeid}&classid=${ifffo.classid}`)

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
        let itv
        let rowsl, usred
        let $q = Quasar.useQuasar()
        let ifo = localStorage.getItem('_g_usr_ifo')
        let grd = 0
        socket.on('newpwdstatus', data => {
            window.location.href = '/class/login'
        })
        if (new Date().getMonth >= 9) {
            grd = new Date().getFullYear() + 2
        }
        else {
            grd = new Date().getFullYear() + 1
        }
        if (ifo !== null && ifo !== '' && ifo !== undefined) {
            socket.emit('log', grd - JSON.parse(window.atob(ifo)).gradeid)
            axios({
                method: 'get',
                url: `/api/pwd/${grd - JSON.parse(window.atob(ifo)).gradeid}/${JSON.parse(window.atob(ifo)).classid}/check?password=${JSON.parse(window.atob(ifo)).password}&from=classclient`,
                data: {
                    password: JSON.parse(window.atob(ifo)).password
                }
            }).then(response => {
                console.log(response.data)
                if (response.data.result == 'success') {
                    console.log('cookie good.')
                    let grade
                    if (JSON.parse(window.atob(ifo)).gradeid == '1') {
                        grade = '一'
                    }
                    else if (JSON.parse(window.atob(ifo)).gradeid == '2') {
                        grade = '二'
                    }
                    else if (JSON.parse(window.atob(ifo)).gradeid == '3') {
                        grade = '三'
                    }
                    this.classd = `初${grade}(${JSON.parse(window.atob(ifo)).classid})班`
                    usred = `初${grade}(${JSON.parse(window.atob(ifo)).classid})班`
                    // console.log(`初${grade}(${JSON.parse(window.atob(ifo)).classid})班`)
                    // document.getElementById('user').innerHTML = `初${grade}(${JSON.parse(window.atob(ifo)).classid})班`
                    setTimeout(() => {
                        axios({
                            method: 'get',
                            url: `/api/data/${grd - JSON.parse(window.atob(ifo)).gradeid}/${JSON.parse(window.atob(ifo)).classid}/deduction.json?password=${JSON.parse(window.atob(ifo)).password}`,
                            data: {
                                password: JSON.parse(window.atob(ifo)).password
                            }
                        }).then(res => {
                            let detail = res.data.details
                            for (let i = 0; i in res.data.details; i++) {

                                delete detail[i].deductor
                                delete detail[i].numberDeductor
                                delete detail[i].typical
                                console.log(detail[i].date)
                                let dt = new Date(detail[i].date)
                                detail[i].date = `${String(dt.getFullYear())}年${String(dt.getMonth())}月${String(dt.getDate())}日`
                            }
                            this.deduct = res.data.details
                            rowsl = detail
                            this.rows = detail
                        })
                        itv = setInterval(() => {
                            axios({
                                method: 'get',
                                url: `/api/data/${grd - JSON.parse(window.atob(ifo)).gradeid}/${JSON.parse(window.atob(ifo)).classid}/deduction.json?password=${JSON.parse(window.atob(ifo)).password}`,
                                data: {
                                    password: JSON.parse(window.atob(ifo)).password
                                }
                            }).then(res => {
                                let detail = res.data.details
                                for (let i = 0; i in res.data.details; i++) {

                                    delete detail[i].deductor
                                    delete detail[i].numberDeductor
                                    delete detail[i].typical
                                    console.log(detail[i].date)
                                    let dt = new Date()
                                    dt.setTime(detail[i].date)
                                    detail[i].date = `${dt.getFullYear()}年${dt.getMonth()}月${dt.getDate()}日`
                                }
                                this.deduct = res.data.details
                                rowsl = detail
                                this.rows = detail
                            })
                        }, 60000)
                    }, 800)
                } else {
                    console.log(localStorage.getItem('_g_usr_ifo'))
                    localStorage.removeItem('_g_usr_ifo')
                    // window.location.href = '/class/login'
                }
            })
        }
        else {

            console.log(localStorage.getItem('_g_usr_ifo'))
            // window.location.href = '/class/login'
        }
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
            classd: '',
            deduct: [],
            rows: rowsl,
            dedcol: [
                {
                    name: 'id',
                    label: '扣分编号',
                    field: '扣分编号'
                },
                {
                    name: 'reason',
                    label: '扣分原因',
                    field: '扣分原因'
                },
                {
                    name: 'deduction',
                    label: '扣分数',
                    field: '扣分数'
                },
                {
                    name: 'deductor',
                    label: '扣分者',
                    field: '扣分者'
                },
                {
                    name: 'numberDeductor',
                    label: '扣分者编号',
                    field: '扣分者编号'
                }
            ],
            tbtt: `所有的扣分`,
            userde: usred,
            frt: { from: `2021/9/1`, to: `${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDay()}` },
            ifrlnk: {
                type: ``,
                person: ``,
                date: ``
            },
            deser: '',
            appealc: [],
            columns: [
                {
                    name: 'id',
                    label: '编号',
                    field: row => row.name,
                    format: val => `${val}`,
                },
                {
                    name: 'reason',
                    label: '原因'
                },
                {
                    name: 'person',
                    label: '者'
                },
                {
                    name: 'date',
                    label: '日期'
                }
            ],
            charttab: 'type',
            $q: Quasar.useQuasar(),
            graphcts: [
                { label: '饼图', value: 'pie' },
                { label: '环图', value: 'ring' },
                { label: '折线图', value: 'line' },
                { label: '柱状图', value: 'histogram' },
                { label: '瀑布图', value: 'waterfall' }
            ],
            graphtpe: 'ring'
        }
    },
    methods: {
        login() {
            let grade = 0
            if (this.grade == '初一') {
                grade = 1
            }
            else if (this.grade == '初二') {
                grade = 2
            }
            else if (this.grade == '初三') {
                grade = 3
            }
            socket.emit('classinfo', window.btoa(JSON.stringify({
                classid: parseInt(this.cla),
                gradeid: grade,
                password: window.btoa(this.password)
            })))
            this.load = true
            this.logining = true
            axios({
                method: 'get',
                url: `/api/pwd/${String(grade)}/${String(this.cla)}/check?password=${window.btoa(this.password)}`,
                data: {
                    password: window.btoa(this.password)
                }
            }).then(response => {
                console.log(response.data)
                if (response.data.result == 'success') {
                    localStorage.setItem('_g_usr_ifo', window.btoa(JSON.stringify({
                        gradeid: String(grade),
                        classid: String(this.cla),
                        password: window.btoa(this.password)
                    })), 365)
                } else {
                    localStorage.removeItem('_g_usr_ifo')
                }
            })
        },
        logout() {
            localStorage.removeItem('_g_usr_ifo')
            router.push('/class/login')
            window.location.href = '/class/login'
        },
        upddate() {
            let clcfg = JSON.parse(window.atob(localStorage.getItem('_g_usr_ifo')))

            let yearg1 = 0
            if (new Date().getMonth() >= 9)
                yearg1 = new Date().getFullYear() + 1
            else
                yearg1 = new Date().getFullYear()
            let gradeid = yearg1 - parseInt(clcfg.gradeid)
            console.log(new Date().getFullYear(), parseInt(clcfg.gradeid), gradeid)
            let ctn
            try {
                ctn = `/${gradeid}/${clcfg.classid}/${this.graphtpe}?password=${clcfg.password}&start=${new Date(this.frt.from.split('/')[0], this.frt.from.split('/')[1], this.frt.from.split('/')[2], 0, 0, 0, 0).getTime()}&end=${new Date(this.frt.to.split('/')[0], this.frt.to.split('/')[1], parseInt(this.frt.to.split('/')[2]) + 1, 0, 0, 0, 0).getTime()}`
            } catch (e) {
                ctn = `/${gradeid}/${clcfg.classid}/${this.graphtpe}?password=${clcfg.password}&start=${new Date(this.frt.split('/')[0], this.frt.split('/')[1], this.frt.split('/')[2], 0, 0, 0, 0).getTime()}&end=${new Date(this.frt.split('/')[0], this.frt.split('/')[1], parseInt(this.frt.split('/')[2]) + 1, 0, 0, 0, 0).getTime()}`
            }
            console.log(ctn)
            this.ifrlnk.date = '/graphapi/date' + ctn

            this.ifrlnk.person = '/graphapi/person' + ctn

            this.ifrlnk.type = '/graphapi/type' + ctn
            // console.log(ctn)
        },
        callb() {
            if (JSON.stringify(this.appealc) == '[]') {
                this.$q.dialog({
                    title: '申斥失败',
                    message: '您未选择需要申斥的扣分项'
                })
            }
            else {
                this.$q.dialog({
                    title: '确定吗？',
                    message: '如果的确做过了，申斥被驳回，是会发送到政教处的哦',
                    cancel: true,
                    persistent: true
                }).onOk(() => {
                    socket.emit('new_callback', JSON.stringify(this.appealc[0]))
                    this.$q.dialog({
                        title: '已发送'
                    })
                }).onCancel(() => {
                    this.$q.dialog({
                        title: '申斥失败',
                        message: '您取消了申斥'
                    })
                })
            }
        },
        feedbackstart() {
            this.$q.dialog({
                title: '反馈',
                message: '反馈内容：',
                prompt: {
                    model: '',
                    type: 'textarea' // optional
                },
                cancel: true,
                persistent: true
            }).onOk(data => {
                socket.emit('feebacket', data)
                console.log('Hello, World!')
                this.$q.dialog({
                    title: '已发送'
                })
            })
        },
        extcharttpe(charttype) {
            this.graphtpe = charttype
            console.log(charttype)
            this.upddate()
        },
        regretpwd() {
            this.$q.dialog({
                title: '原密码',
                message: '请输入原密码',
                prompt: {
                    model: '',
                    type: 'password' // optional
                },
                cancel: true,
                persistent: true
            }).onOk(data => {

                let ifo = localStorage.getItem('_g_usr_ifo')
                let grd = 0
                if (new Date().getMonth >= 9) {
                    grd = new Date().getFullYear() + 2
                }
                else {
                    grd = new Date().getFullYear() + 1
                }
                let inputing1 = data
                axios({
                    method: 'get',
                    url: `/api/pwd/${grd - JSON.parse(window.atob(ifo)).gradeid}/${JSON.parse(window.atob(ifo)).classid}/check?password=${window.btoa(inputing1)}&from=classclient`,
                    data: {
                        password: window.btoa(inputing1)
                    }
                }).then(response => {
                    console.log(response.data)
                    if (response.data.result == 'success') {
                        this.$q.dialog({
                            title: '新密码',
                            message: '请输入修改后的密码(第一遍)',
                            prompt: {
                                model: '',
                                type: 'password' // optional
                            },
                            cancel: true,
                            persistent: true
                        }).onOk(newpwd1 => {
                            this.$q.dialog({
                                title: '新密码',
                                message: '请输入修改后的密码(第二遍)',
                                prompt: {
                                    model: '',
                                    type: 'password' // optional
                                },
                                persistent: true
                            }).onOk(newpwd2 => {
                                if (newpwd1 == newpwd2) {
                                    socket.emit('newpwd', window.btoa(newpwd1))
                                }
                                else {
                                    this.$q.dialog({
                                        title: '失败',
                                        message: '两次输入的密码不一致',
                                        persistent: true
                                    })
                                }
                            })
                        })
                    }
                    else {
                        this.$q.dialog({
                            title: '失败',
                            message: '原密码输入错误',
                            cancel: true,
                            persistent: true
                        })
                    }
                })
            })
        },
        toHome() {
            window.location.href = '/'
        }
    }
})
app.use(Quasar, {
    config: {}
})
app.use(router)
Quasar.lang.set(Quasar.lang.zhCN)
app.mount('#app')
router.push({ path: '/class/' })
// router.push('/')
socket.on('deduction', data => {
    app.reduction = data
    app.isLogin = true
    console.log(app.reduction)
})
socket.on('pwdcrsl', data => {
    console.log(data)
    console.log(app.isLogin)
    app.isLogin = true
    this.sx1 = "desplay: none;"
})