let app = Vue.createApp({
    setup() {
        let { ref, reactive, toRefs } = Vue
        let { useQuasar, exportFile } = Quasar
        let $q = useQuasar()
        let pwd = ref('')
        let login = () => {
            axios({
                method: 'get',
                url: `/api/admin/pwd/login/check?password=${window.btoa(pwd.value)}&from=adminclient`,
                data: {
                    password: `${window.btoa(pwd.value)}`
                }
            }).then(response => {
                console.log(response.data)
                if (response.data.status == 'ok') {
                    localStorage.setItem('_a_usr_ifo', window.btoa(JSON.stringify({
                        password: window.btoa(pwd.value)
                    })))
                    let jumpp = setTimeout(() => {
                        window.location.href = '/admin'
                    }, 3000)
                    $q.dialog({
                        title: '登录成功',
                        message: '3s后自动跳至界面...'
                    }).onOk(() => {
                        clearTimeout(jumpp)
                        window.location.href = '/admin'
                    })
                }
                else {
                    $q.dialog({
                        title: '登陆失败',
                        message: response.data.message
                    })
                }
            })
        }
        let isPwd = ref(true)
        return {
            password: pwd,
            login,
            isPwd
        }
    }
})
app.use(Quasar, {
    config: {}
})
Quasar.lang.set(Quasar.lang.zhCN)
app.mount('#app')