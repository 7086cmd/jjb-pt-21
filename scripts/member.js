if (sessionStorage.length == 0) {
    window.location.href = '/member/login'
}
const { createApp, ref, watch, reactive } = Vue
let ifffo = JSON.parse(window.atob(localStorage.getItem('_g_usr_ifo')))
let uifffo = JSON.parse(window.atob(sessionStorage.getItem('_m_usr_ifo')))
let socket = io.connect(`ws://localhost:1108?type=member&gradeid=${ifffo.gradeid}&classid=${ifffo.classid}&number=${uifffo.number}`)
const { useQuasar } = Quasar
const app = Vue.createApp({
    setup() {
        let dt = new Date()
        let $q = useQuasar()
        $q.loading.show({
            message: 'Logining ...'
        })
        socket.on('new_d_result', data => {
            $q.loading.hide()
            $q.dialog({
                title: '结果',
                message: '成功'
            })
        })
        socket.on('newpwdstatus', data => {
            $q.loading.hide()
            if (JSON.parse(data).status == 'ok') {
                $q.dialog({
                    title: '修改密码成功',
                    message: '请记住您的密码'
                })
                sessionStorage.clear()
                window.location.href = '/member/login'
            }
            else {
                $q.dialog({
                    title: '修改密码失败',
                    message: data.content
                })
            }
        })
        let yopt = []
        let copt = []
        let nopt = []
        for (let i = 0; i <= 15; i++) {
            copt.push(String(i))
        }
        for (let i = 0; i <= 50; i++) {
            nopt.push(String(i))
        }

        if (dt.getMonth() + 1 >= 9) {
            yopt.push(dt.getFullYear())
            yopt.push(dt.getFullYear() - 1)
            yopt.push(dt.getFullYear() - 2)
        }
        else {
            yopt.push(dt.getFullYear() - 1)
            yopt.push(dt.getFullYear() - 2)
            yopt.push(dt.getFullYear() - 3)
        }
        let listday = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
        let page1Reactive = reactive({
            date: `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日 ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()} ${listday[dt.getDay()]}`,
            structure: {}
        })
        let namer = ``
        let dt2 = ref(`${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`)
        let newDReactive = reactive({
            class: undefined,
            grade: undefined,
            number: undefined,
            type: '',
            description: ``,
            date: `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`,
            deduction: undefined,
            typenum: 0,
            numberDeducer: parseInt(ifffo.gradeid) * 10000 + parseInt(ifffo.classid) * 100 + parseInt(uifffo.number),
            deducer: ''
        })
        let timezone = 0
        let allTypes = [
            '所有的（请选择）',
            '奔跑',
            '边走边吃',
            '未带校徽',
            '边走边喝',
            '踩草坪',
            '踩马路牙子',
            '提前吃饭',
            '等餐大闹'
        ]
        let clearAllDuction = () => {
            newDReactive = reactive({
                class: undefined,
                grade: undefined,
                number: undefined,
                type: '',
                description: ``,
                date: `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`,
                deduction: undefined,
                typenum: 0,
                numberDeducer: parseInt(ifffo.gradeid) * 10000 + parseInt(ifffo.classid) * 100 + parseInt(uifffo.number),
                deducer: ''
            })
        }
        let submitDeduction = () => {
            let ystart = 0
            let yend = 0
            if (dt.getMonth() + 1 >= 9) {
                ystart = dt.getFullYear()
                yend = dt.getFullYear() - 2
            }
            else {
                ystart = dt.getFullYear() - 1
                yend = dt.getFullYear() - 3
            }
            if (parseInt(newDReactive.number) > 50 || parseInt(newDReactive.number) < 1 || parseInt(newDReactive.number) == undefined) {
                $q.dialog({
                    message: '学号信息填错'
                })
            }
            else if (parseInt(newDReactive.class) > 15 || parseInt(newDReactive.class) < 1 || parseInt(newDReactive.class) == undefined) {
                $q.dialog({
                    message: '班级信息填错'
                })
            }
            else if (parseInt(newDReactive.grade) > ystart || parseInt(newDReactive.grade) < yend || parseInt(newDReactive.grade) == undefined) {

                $q.dialog({
                    message: '年级信息填错'
                })
            }
            else if (newDReactive.deduction != 0.1 && newDReactive.deduction != 0.2 && newDReactive.deduction != 0.05) {
                $q.dialog({
                    message: '分数不行'
                })
            }
            else if (newDReactive.type == '所有的（请选择）' || newDReactive.type == '') {
                $q.dialog({
                    message: '类型选择不对'
                })
            }
            else {
                $q.loading.show({
                    message: '正在操作...'
                })
                let r = 0
                for (let i = 0; i in allTypes; i++) {
                    if (newDReactive.type == allTypes[i]) {
                        r = i + 1
                    }
                }
                socket.emit('new_d', JSON.stringify({
                    id: 0,
                    person: parseInt(newDReactive.grade) * 10000 + parseInt(newDReactive.class) * 100 + parseInt(newDReactive.number),
                    typical: r,
                    reason: newDReactive.type,
                    date: new Date(dt2.value).getTime(),
                    deduction: newDReactive.deduction,
                    numberDeductor: parseInt(uifffo.number),
                    deductor: namer,
                    description: newDReactive.description
                }))
            }
        }
        setInterval(() => {
            let dte = new Date()
            if (pge.page == 'home') {
                document.getElementById('time').innerHTML = `${dte.getFullYear()}年${dte.getMonth()}月${dte.getDate()}日 ${dte.getHours()}:${dte.getMinutes()}:${dte.getSeconds()} ${listday[dt.getDay()]}`
            }
            page1Reactive.date = `${dte.getFullYear()}年${dte.getMonth()}月${dte.getDate()}日 ${dte.getHours()}:${dte.getMinutes()}:${dte.getSeconds()} ${listday[dt.getDay()]}`
        }, 500)
        let tips = reactive({
            tips: ['您好，欢迎使用蛟川书院纪检部管理平台', '您可以通过选项来选择您所需要的功能']
        })
        let uifo = JSON.parse(window.atob(sessionStorage.getItem('_m_usr_ifo')))
        let ifo = localStorage.getItem('_g_usr_ifo')
        let grd = 0
        if (new Date().getMonth >= 9) {
            grd = new Date().getFullYear() + 2
        }
        else {
            grd = new Date().getFullYear() + 1
        }
        axios({
            method: 'get',
            url: `/api/member/pwd/${grd - JSON.parse(window.atob(ifo)).gradeid}/${JSON.parse(window.atob(ifo)).classid}/${uifo.number}/check?password=${uifo.password}&from=memberclient`,
            data: {
                password: `${uifo.password}`
            }
        }).then(response => {
            console.log(response.data)
            if (response.data.status != 'ok') {
                window.location.href = '/member/login'
                sessionStorage.clear()
            }
            else {
                $q.loading.hide()
                newDReactive.deducer = response.data.user.name
                setTimeout(() => {
                    document.getElementById('user').style = 'display: block; text-align: right'
                    document.getElementById('user').innerHTML = `你好，${response.data.user.name}`
                    page1Reactive.structure = response.data.user
                    namer = response.data.user.name
                }, 400)
            }
        })
        const leftDrawerOpen = ref(false)
        const rightDrawerOpen = ref(false)
        let toTag = (tag) => {
            if (tag == 'new_d') {
                tips.tips.push('这里是新建扣分栏目')
                tips.tips.push('请您按照提示输入违纪者的信息')
            }
            if (tag == 'exit') {
                tips.tips.push('再见！')
                setTimeout(() => {
                    sessionStorage.clear()
                    window.location.href = '/member/login'
                }, 1000)
            }
            pge.page = tag
        }
        let pge = reactive({
            page: 'home'
        })
        watch(() => pge.page, () => {
            if (pge.page == 'panel') {

                setTimeout(() => {
                    document.getElementById('scord1').innerHTML = page1Reactive.score
                }, 2000)
            }
            if (pge.page == 'root') {
                window.location.href = '/'
            }
            if (pge.page == 'exit') {
                tips.tips.push('再见！')
                setTimeout(() => {
                    sessionStorage.clear()
                    window.location.href = '/member/login'
                }, 1000)
            }
            if (pge.page == 'editpwd') {
                $q.dialog({
                    title: '原密码',
                    message: '请输入原密码',
                    prompt: {
                        model: '',
                        type: 'password' // optional
                    },
                    cancel: true,
                    persistent: true
                }).onOk(data => {
                    let ifo = sessionStorage.getItem('_m_usr_ifo')
                    let grd = 0
                    if (new Date().getMonth() + 1 >= 9) {
                        grd = new Date().getFullYear() + 2
                    }
                    else {
                        grd = new Date().getFullYear() + 1
                    }
                    let inputing1 = data
                    axios({
                        method: 'get',
                        url: `/api/member/pwd/${JSON.parse(window.atob(ifo)).gradeid}/${JSON.parse(window.atob(ifo)).classid}/${uifo.number}/check?password=${window.btoa(inputing1)}&from=memberclient`,
                        data: {
                            password: window.btoa(inputing1)
                        }
                    }).then(response => {
                        console.log(response.data)
                        if (response.data.status == 'ok') {
                            $q.dialog({
                                title: '新密码',
                                message: '请输入修改后的密码(第一遍)',
                                prompt: {
                                    model: '',
                                    type: 'password' // optional
                                },
                                cancel: true,
                                persistent: true
                            }).onOk(newpwd1 => {
                                $q.dialog({
                                    title: '新密码',
                                    message: '请输入修改后的密码(第二遍)',
                                    prompt: {
                                        model: '',
                                        type: 'password' // optional
                                    },
                                    persistent: true
                                }).onOk(newpwd2 => {
                                    if (newpwd1 == newpwd2) {
                                        socket.emit('newpwdmember', JSON.stringify({
                                            newpwd: window.btoa(newpwd1),
                                            numb: uifo.number
                                        }))
                                    }
                                    else {
                                        $q.dialog({
                                            title: '失败',
                                            message: '两次输入的密码不一致',
                                            persistent: true
                                        })
                                    }
                                })
                            })
                        }
                        else {
                            $q.dialog({
                                title: '失败',
                                message: '原密码输入错误',
                                cancel: true,
                                persistent: true
                            })
                        }
                    })
                })
            }
        })
        watch(() => dt2, () => {
            timezone = new Date(dt2.value).getTime()
        })
        return {
            leftDrawerOpen,
            toggleLeftDrawer() {
                leftDrawerOpen.value = !leftDrawerOpen.value
            },
            rightDrawerOpen,
            toggleRightDrawer() {
                rightDrawerOpen.value = !rightDrawerOpen.value
            },
            pge,
            page1Reactive,
            toTag,
            newDReactive,
            tips,
            allTypes,
            submitDeduction,
            clearAllDuction,
            date: dt2,
            yopt,
            copt,
            nopt
        }
    }
})

app.use(Quasar, {
    config: {}
})
Quasar.lang.set(Quasar.lang.zhCN)
app.mount('#q-app')