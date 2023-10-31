let setCookie = (cname, cvalue, exdays) => {
    let d = new Date()
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
    let expires = "expires=" + d.toGMTString()
    document.cookie = cname + "=" + cvalue + "; " + expires
}
let getCookie = cname => {
    let name = cname + "="
    let ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim()
        if (c.indexOf(name) == 0) { return c.substring(name.length, c.length) }
    }
}
let app = Vue.createApp({
    setup() {
        let { reactive, ref, watch } = Vue
        let { useQuasar } = Quasar
        let $q = useQuasar()
        let login = val => {
            window.location.href = `/${val}/login`
        }
        let isLogin = ref(false)
        let new_coop = () => {
            $q.dialog({
                title: '未开放',
                message: '请通过腾讯通告知初二（11）班'
            })
        }
        return {
            login,
            isLogin,
            new_coop
        }
    }
})
app.use(Quasar, {
    config: {}
})
Quasar.lang.set(Quasar.lang.zhCN)
app.mount('#app')
