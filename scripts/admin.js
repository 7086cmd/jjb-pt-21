if (localStorage.getItem('_a_usr_ifo') == undefined) {
    window.location.href = '/admin/login'
}
const { createApp, ref, watch, reactive } = Vue
let socket = io.connect(`ws://localhost:1108?type=admin`)
const { useQuasar, exportFile } = Quasar
const app = Vue.createApp({
    setup() {
        let dt = new Date()
        let $q = useQuasar()
        $q.loading.show({
            message: 'Logining ...'
        })
        let uifo = JSON.parse(window.atob(localStorage.getItem('_a_usr_ifo')))
        let ddata = ref([])
        let mdata = ref([])
        let cdata = ref([])
        let fdata = ref([])
        let memberData = reactive({
            rows: [],
            filter: '',
            selected: ''
        })

        let deductionsData = reactive({
            rows: [],
            filter: '',
            selected: ''
        })
        socket.on('new_m_result', data => {
            if (data == 'ok') {
                $q.dialog({
                    title: '添加成功',
                    message: '成员添加成功'
                })
            }
            else {
                $q.dialog({
                    title: '添加失败',
                    message: data
                })
            }
        })
        axios({
            method: 'get',
            url: `/api/admin/pwd/login/check?password=${uifo.password}&from=adminclient`,
            data: {
                password: `${uifo.password}`
            }
        }).then(response => {
            if (response.data.status != 'ok') {
                window.location.href = '/admin/login'
                localStorage.removeItem('_a_usr_ifo')
            }
            else {
                $q.loading.hide()
            }
        })
        let newMembStruct = reactive({
            name: '',
            gradeid: '',
            classid: '',
            number: '',
            password: '',
            totalviolation: 0,
            score: 100,
            totaldeducted: 0,
            totalfeedbacks: 0,
            totalabsents: 0,
            deducted: []
        })
        const leftDrawerOpen = ref(false)
        const rightDrawerOpen = ref(false)
        let pge = reactive({
            page: 'home'
        })
        let toTag = (tag) => {
            pge.page = tag
        }
        watch(() => pge.page, () => {
            if (pge.page == 'root') {
                window.location.href = '/'
            }
            else if (pge.page == 'exit') {
                setTimeout(() => {
                    localStorage.removeItem('_a_usr_ifo')
                    window.location.href = '/admin/login'
                }, 1000)
            }
            else if (pge.page == 'deduction' || pge.page == 'member') {
                $q.loading.show({
                    message: 'Fetching Data...'
                })
                axios({
                    method: 'get',
                    url: `/api/admin/get/all/${pge.page}?password=${uifo.password}&from=adminclient`,
                    data: {
                        password: `${uifo.password}`
                    }
                }).then(response => {
                    console.log(JSON.stringify(response.data))
                    if (response.data.status == 'ok') {
                        $q.loading.hide()
                        ddata.value = response.data.details
                        mdata.value = response.data.details
                        $q.dialog({
                            title: '获取成功',
                            message: `总共${response.data.details.length}条数据`
                        })
                    }
                    else {
                        $q.loading.hide()
                        $q.dialog({
                            title: '获取失败',
                            message: response.data.message
                        })
                        pge.page = 'home'
                    }
                })
            }
            else if (pge.page != 'home' && pge.page != 'newmenb') {
                $q.loading.show({
                    message: 'Fetching Data...'
                })
                axios({
                    method: 'get',
                    url: `/api/admin/get/single/${pge.page}?password=${uifo.password}&from=adminclient`,
                    data: {
                        password: `${uifo.password}`
                    }
                }).then(response => {
                    if (response.data.status == 'ok') {
                        $q.loading.hide()
                        fdata.value = response.data.details
                        cdata.value = response.data.details
                        $q.dialog({
                            title: '获取成功',
                            message: `总共${response.data.details.length}条数据`
                        })
                    }
                    else {
                        $q.loading.hide()
                        $q.dialog({
                            title: '获取失败',
                            message: response.data.message
                        })
                        pge.page = 'home'
                    }
                })

            }
        })
        let exportTable = () => {
            // console.log('hello')
            // let base = `"扣分编号","扣分人","违纪者","扣分类型","扣分数","时间"\r\n`
            // let r = JSON.parse(JSON.stringify(ddata.value))
            // for (let i = 0; i in r; i++) {
            //     base += `"${r[i].id}","${r[i].deductor}(${r[i].numberDeductor})","${r[i].person}","${r[i].reason}","${r[i].deduction}","${new Date(r[i].date).toLocaleDateString()}"\r\n`
            //     if (i == ddata.value.length - 1) {
            //         $q.dialog({
            //             title: '由于开发时的问题',
            //             message: '请将其转码为ANSI后打开，不然会乱码。'
            //         })
            //         exportFile(
            //             `export.csv`,
            //             base,
            //             'text/csv'
            //         )
            //     }
            // }
            window.open(`/api/admin/get/csv/all/deduction.csv?password=${uifo.password}&from=adminclient`, '_blank')
        }
        let submitNewMember = () => {
            let conf = {
                name: encodeURIComponent(newMembStruct.name),
                gradeid: newMembStruct.gradeid,
                classid: newMembStruct.classid,
                number: newMembStruct.number + newMembStruct.gradeid * 10000 + newMembStruct.classid * 100,
                password: window.btoa(String(newMembStruct.number + newMembStruct.gradeid * 10000 + newMembStruct.classid * 100)),
                totalviolation: 0,
                score: 100,
                totaldeducted: 0,
                totalfeedbacks: 0,
                totalabsents: 0,
                deducted: []
            }
            document.getElementById('pwdshow').innerHTML = '请记住密码：' + String(pwd)
            socket.emit('new_member', window.btoa(JSON.stringify(conf)))
        }
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
            toTag,
            ddata,
            mdata,
            deductionsData,
            memberData,
            fdata,
            cdata,
            newMembStruct,
            submitNewMember,
            exportTable
        }
    }
})

app.use(Quasar, {
    config: {}
})
Quasar.lang.set(Quasar.lang.zhCN)
app.mount('#q-app')