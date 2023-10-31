const fs = require('fs')
const path = require('path')
const url = require('url')
const Koa = require('koa')
const Router = require('koa-router')
const IO = require('koa-socket')
const sha512 = require('js-sha512')
const qs = require('querystring')
const util = require('util')
const utf8toansi = require('utf8-to-ansi')
const iconv = require('iconv-lite')
// const YAML = require('json2yaml')
// const json2xml = require('json2xml')
// const json2toml = require('json2toml')
let app = new Koa()
let router = new Router()
let io = new IO()

let chartBase = String(fs.readFileSync(path.join(__dirname, './pages/chart.html')).toString())
// let pwdsen = fs.readFileSync(path.join(__dirname, './data/passwords.json'))
io.attach(app)
router.post('/api/toansi/file', async ctx => {
    ctx.response.type = 'csv'
    ctx.response.body = utf8toansi.utf8ToAnsi(qs.parse(ctx).body)
})
router.get('/chart/:type', async ctx => {
    let gratp = ctx.params.type
    let qses = qs.parse(ctx.querystring)
    let datat = JSON.parse(Buffer.from(qses.data, 'base64').toString())
    let tit = gratp
    tit[0] = String.fromCharCode(tit[0].charCodeAt() - 32)
    ctx.response.type = 'html'
    ctx.response.body = chartBase.replaceAll('<%=dat=>', JSON.stringify(datat)).replaceAll('<%=tpe=>', gratp).replaceAll('<%=tit=>', tit)
})
router.get('/class', async ctx => {
    ctx.response.type = 'html'
    ctx.response.body = fs.readFileSync(path.join(__dirname, './pages/class.html')).toString()
})
router.get('/member', async ctx => {
    ctx.response.type = 'html'
    ctx.response.body = fs.readFileSync(path.join(__dirname, './pages/member.html')).toString()
})
router.get('/admin', async ctx => {
    ctx.response.type = 'html'
    ctx.response.body = fs.readFileSync(path.join(__dirname, './pages/admin.html')).toString()
})
router.get('/plugins/prism.css', async ctx => {
    ctx.response.type = 'css'
    ctx.response.body = fs.readFileSync(path.join(__dirname, './prism/prism.css')).toString()
})
router.get('/plugins/prism.js', async ctx => {
    ctx.response.type = 'js'
    ctx.response.body = fs.readFileSync(path.join(__dirname, './prism/prism.js')).toString()
})
router.get('/class/login', async ctx => {
    ctx.response.type = 'html'
    ctx.response.body = fs.readFileSync(path.join(__dirname, './pages/class-login.html')).toString()
})
router.get('/admin/login', async ctx => {
    ctx.response.type = 'html'
    ctx.response.body = fs.readFileSync(path.join(__dirname, './pages/admin-login.html')).toString()
})
router.get('/member/login', async ctx => {
    ctx.response.type = 'html'
    ctx.response.body = fs.readFileSync(path.join(__dirname, './pages/member-login.html')).toString()
})
router.get('/', async ctx => {
    ctx.response.type = 'html'
    ctx.response.body = fs.readFileSync(path.join(__dirname, './pages/index.html')).toString()
})
router.get('/index', async ctx => {
    ctx.response.type = 'html'
    ctx.response.body = fs.readFileSync(path.join(__dirname, './pages/index.html')).toString()
})
router.get('/scripts/:filename', async ctx => {
    ctx.response.type = 'javascript'
    ctx.response.body = fs.readFileSync(path.join(__dirname, `./scripts/${ctx.params.filename}`)).toString()
})
router.get('/scripts', async ctx => {
    ctx.response.type = 'javascript'
    ctx.response.body = fs.createReadStream(path.join(__dirname, './scripts/index.js'))
})
router.get('/api/data/:gradeid/:classid/:filename', async ctx => {
    ctx.response.type = 'json'
    let qses = qs.parse(ctx.querystring)
    let classid = parseInt(ctx.params.classid)
    let gradeid = parseInt(ctx.params.gradeid) // Obtain class information through login data
    let password = Buffer.from(qses.password, 'base64').toString() // Parse password

    let rpasswordencoded
    try {
        rpasswordencoded = fs.readFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/password.json`)) // Read configs
        if (rpasswordencoded == '' || rpasswordencoded == '{}') { // is the file empty?
            ctx.response.body = JSON.stringify({
                type: 'error',
                message: 'You are not seted the password'
            }, '', 4)
        }
        else {
            let rpwde = JSON.parse(rpasswordencoded)
            if (rpwde.key == '') { // is the file empty?
                ctx.response.body = JSON.stringify({
                    type: 'error',
                    message: 'You are not seted the password'
                }, '', 4)
            }
            else {
                let encoded = sha512.sha512(password) // Use SHA512 to save, safer.
                if (encoded == rpwde.password) {
                    try {
                        ctx.response.body = fs.readFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/${ctx.params.filename}`))
                    } catch (e) {
                        ctx.response.body = JSON.stringify({
                            type: 'error',
                            message: 'Can not find the file.'
                        }, '', 4)

                    }
                }
                else
                    ctx.response.body = JSON.stringify({
                        type: 'error',
                        message: 'Password wrong.'
                    })

            }
        } // Check password
    } catch (e) {
        try {
            let yearg1
            let date = new Date()
            if (date.getMonth() < 9)
                yearg1 = date.getFullYear() - 1
            else if (date.getMonth >= 9)
                yearg1 = date.getFullYear()
            gradeid = yearg1 - gradeid + 2 // Obtain class information through login data
            rpasswordencoded = fs.readFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/password.json`)) // Read configs
            if (rpasswordencoded == '' || rpasswordencoded == '{}') { // is the file empty?
                ctx.response.body = JSON.stringify({
                    type: 'error',
                    message: 'You are not seted the password'
                }, '', 4)
            }
            else {
                let rpwde = JSON.parse(rpasswordencoded)
                if (rpwde.key == '') { // is the file empty?
                    ctx.response.body = JSON.stringify({
                        type: 'error',
                        message: 'You are not seted the password'
                    }, '', 4)
                }
                else {
                    let encoded = sha512.sha512(password) // Use SHA512 to save, safer.
                    if (encoded == rpwde.password) {
                        try {
                            ctx.response.body = fs.readFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/${ctx.params.filename}`))
                        } catch (e) {
                            ctx.response.body = JSON.stringify({
                                type: 'error',
                                message: 'Can not find the file.'
                            }, '', 4)

                        }
                    }
                    else
                        ctx.response.body = JSON.stringify({
                            type: 'error',
                            message: 'Password wrong.'
                        })

                }
            } // Check password
        } catch (error) {
            ctx.response.body = JSON.stringify({
                type: 'error',
                message: 'Wrong Class Or Grade'
            }, '', 4)
        }
    }

})
router.get('/api/member/:gradeid/:classid/check', async ctx => {
    ctx.response.type = 'json'
    let qses = qs.parse(ctx.querystring)
    let classid = parseInt(ctx.params.classid)
    let gradeid = parseInt(ctx.params.gradeid) // Obtain class information through login data
    let password = Buffer.from(qses.password, 'base64').toString() // Parse password

    let rpasswordencoded
    try {
        rpasswordencoded = fs.readFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/password.json`)) // Read configs
        if (rpasswordencoded == '' || rpasswordencoded == '{}') { // is the file empty?
            ctx.response.body = JSON.stringify({
                type: 'error',
                message: 'You are not seted the password'
            }, '', 4)
        }
        else {
            let rpwde = JSON.parse(rpasswordencoded)
            if (rpwde.key == '') { // is the file empty?
                ctx.response.body = JSON.stringify({
                    type: 'error',
                    message: 'You are not seted the password'
                }, '', 4)
            }
            else {
                let encoded = sha512.sha512(password) // Use SHA512 to save, safer.
                if (encoded == rpwde.password) {
                    try {
                        let r = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/member.json`)).toString())
                        let d = []
                        for (let i = 0; i in r; i++) {
                            d.push({
                                name: r.details[i].name,
                                number: r.details[i].number
                            })
                        }
                        ctx.response.body = JSON.stringify({
                            data: r
                        }, '', 4)
                    } catch (e) {
                        ctx.response.body = JSON.stringify({
                            type: 'error',
                            message: 'Can not find the file.'
                        }, '', 4)

                    }
                }
                else
                    ctx.response.body = JSON.stringify({
                        type: 'error',
                        message: 'Password wrong.'
                    })

            }
        } // Check password
    } catch (e) {
        ctx.response.body = JSON.stringify({
            type: 'error',
            message: 'Wrong Class Or Grade'
        }, '', 4)
    }

})
router.get('/api/pwd/:gradeid/:classid/check', async ctx => {
    ctx.response.type = 'json'
    let qses = qs.parse(ctx.querystring)
    let classid = parseInt(ctx.params.classid)
    let gradeid = parseInt(ctx.params.gradeid) // Obtain class information through login data
    let password = Buffer.from(qses.password, 'base64').toString() // Parse password
    let rpasswordencoded
    // try {
    rpasswordencoded = fs.readFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/password.json`)) // Read configs
    // if (rpasswordencoded == '' || rpasswordencoded == '{}') { // is the file empty?
    //     let pwdlst = {
    //         password: sha512.sha512(password)
    //     }
    //     fs.writeFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/password.json`), JSON.stringify(pwdlst, '', 4))
    // }
    // else {
    let rpwde = JSON.parse(rpasswordencoded)
    if (rpwde.key == '') { // is the file empty?
        let pwdlst = {
            password: sha512.sha512(password)
        }
        fs.writeFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/password.json`), JSON.stringify(pwdlst, '', 4))
    }
    else {
        let encoded = sha512.sha512(password) // Use SHA512 to save, safer.
        if (encoded == rpwde.password) {
            ctx.response.body = JSON.stringify({
                result: 'success'
            }, '', 4)
        }
        else
            ctx.response.body = JSON.stringify({
                result: 'error',
                message: 'Password wrong.'
            })
        // }
    } // Check password
    // }
    //     catch (error) {
    //         ctx.response.body = JSON.stringify({
    //             type: 'error',
    //             message: 'Wrong Class Or Grade'
    //         }, '', 4)
    //     }
})
router.get('/api/admin/pwd/login/check', async ctx => {
    try {
        let rpasswordencoded = JSON.parse(fs.readFileSync(path.join(__dirname, './data/admin/password.json')).toString()).password
        let rpwd = sha512.sha512(Buffer.from(new url.URLSearchParams(ctx.querystring).get('password'), 'base64').toString())
        if (new url.URLSearchParams(ctx.querystring).get('from') != 'adminclient') {
            ctx.type = 410
            ctx.type = 'json'
            ctx.body = JSON.stringify({
                status: 'error',
                message: 'Not correct client.'
            })
        }
        else {
            if (rpasswordencoded == rpwd) {
                ctx.type = 'json'
                ctx.body = JSON.stringify({
                    status: 'ok'
                })
            }
            else {
                ctx.type = 'json'
                ctx.body = JSON.stringify({
                    status: 'error',
                    message: 'Password Wrong.'
                })
            }
        }
    } catch (e) {
        ctx.status = 410
        ctx.type = 'json'
        ctx.body = JSON.stringify({
            status: 'error',
            message: new Error(e).message
        })
    }
})
router.get('/api/admin/get/all/:filename', async ctx => {
    try {
        let rpasswordencoded = JSON.parse(fs.readFileSync(path.join(__dirname, './data/admin/password.json')).toString()).password
        let rpwd = sha512.sha512(Buffer.from(new url.URLSearchParams(ctx.querystring).get('password'), 'base64').toString())
        if (new url.URLSearchParams(ctx.querystring).get('from') != 'adminclient') {
            ctx.response.type = 410
            ctx.response.type = 'json'
            ctx.response.body = JSON.stringify({
                status: 'error',
                message: 'Not correct client.'
            })
        }
        else {
            if (rpasswordencoded == rpwd) {
                let allMembers = []
                let grdec = 0
                if (new Date().getMonth + 1 >= 9) {
                    grdec = new Date().getFullYear() + 1
                }
                else {
                    grdec = new Date().getFullYear()
                }
                let getAllMembers = (grd, cla) => {
                    let grde = 0
                    if (new Date().getMonth + 1 >= 9) {
                        grde = new Date().getFullYear() + 1
                    }
                    else {
                        grde = new Date().getFullYear()
                    }
                    let det = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${grd}/${cla}/${ctx.params.filename}.json`)).toString()).details
                    if (det.length == 0) {
                        if (cla == 15 && grd == grde - 2) {
                            ctx.response.type = 'json'
                            ctx.response.body = JSON.stringify({
                                status: 'ok',
                                details: allMembers
                            })
                            return
                        }
                        else if (cla == 15) {
                            getAllMembers(grd - 1, 1)
                        }
                        else {
                            getAllMembers(grd, cla + 1)
                        }
                    }
                    else for (let i = 0; i in det; i++) {
                        delete det[i].password
                        delete det[i].deducted
                        allMembers.push(det[i])
                        if (i == det.length - 1) {
                            if (cla == 15 && grd == grde - 2) {
                                ctx.response.type = 'json'
                                ctx.response.body = JSON.stringify({
                                    status: 'ok',
                                    details: allMembers
                                })
                            }
                            else if (cla == 15) {
                                getAllMembers(grd - 1, 1)
                            }
                            else {
                                getAllMembers(grd, cla + 1)
                            }
                        }
                    }
                }
                getAllMembers(grdec, 1)
            }
            else {
                ctx.response.type = 'json'
                ctx.response.body = JSON.stringify({
                    status: 'error',
                    message: 'Password Wrong.'
                })
            }
        }
    } catch (e) {
        ctx.response.status = 410
        ctx.response.type = 'json'
        ctx.response.body = JSON.stringify({
            status: 'error',
            message: new Error(e).message
        })
    }
})
router.get('/api/admin/get/csv/all/deduction.csv', async ctx => {
    try {
        let rpasswordencoded = JSON.parse(fs.readFileSync(path.join(__dirname, './data/admin/password.json')).toString()).password
        let rpwd = sha512.sha512(Buffer.from(new url.URLSearchParams(ctx.querystring).get('password'), 'base64').toString())
        if (new url.URLSearchParams(ctx.querystring).get('from') != 'adminclient') {
            ctx.response.type = 410
            ctx.response.type = 'json'
            ctx.response.body = JSON.stringify({
                status: 'error',
                message: 'Not correct client.'
            })
        }
        else {
            if (rpasswordencoded == rpwd) {
                let allMembers = []
                let grdec = 0
                if (new Date().getMonth + 1 >= 9) {
                    grdec = new Date().getFullYear() + 1
                }
                else {
                    grdec = new Date().getFullYear()
                }
                let rtn = (tp, ct) => {
                    ctx.response.type = tp
                    ctx.response.body = ct
                }
                let proc = details => {
                    console.log(details)
                    let base = `"扣分编号","扣分人","违纪者","扣分类型","扣分数","时间"\r\n`
                    let r = details
                    if (r.length == 0) {
                        rtn('csv', iconv.encode(base, 'gbk'))
                        // rtn('csv', base)
                        // rtn('csv', utf8toansi.utf8ToAnsi(base))
                    }
                    else for (let i = 0; i in r; i++) {
                        base += `"${r[i].id}","${r[i].deductor}(${r[i].numberDeductor})","${r[i].person}","${r[i].reason}","${r[i].deduction}","${new Date(r[i].date).toLocaleDateString()}"\r\n`
                        if (i == r.length - 1) {
                            rtn('csv', iconv.encode(base, 'gbk'))
                            // rtn('csv', base)
                            // rtn('csv', utf8toansi.utf8ToAnsi(base))
                        }
                    }
                }
                let getAllMembers = (grd, cla) => {
                    let grde = 0
                    if (new Date().getMonth + 1 >= 9) {
                        grde = new Date().getFullYear() + 1
                    }
                    else {
                        grde = new Date().getFullYear()
                    }
                    let det = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${grd}/${cla}/deduction.json`)).toString()).details
                    if (det.length == 0) {
                        if (cla == 15 && grd == grde - 2) {
                            proc(allMembers)
                            // ctx.response.type = 'json'
                            // ctx.response.body = JSON.stringify({
                            //     status: 'ok',
                            //     details: allMembers
                            // })
                        }
                        else if (cla == 15) {
                            getAllMembers(grd - 1, 1)
                        }
                        else {
                            getAllMembers(grd, cla + 1)
                        }
                    }
                    else for (let i = 0; i in det; i++) {
                        delete det[i].password
                        delete det[i].deducted
                        allMembers.push(det[i])
                        if (i == det.length - 1) {
                            if (cla == 15 && grd == grde - 2) {
                                proc(allMembers)
                                // ctx.response.type = 'json'
                                // ctx.response.body = JSON.stringify({
                                //     status: 'ok',
                                //     details: allMembers
                                // })
                            }
                            else if (cla == 15) {
                                getAllMembers(grd - 1, 1)
                            }
                            else {
                                getAllMembers(grd, cla + 1)
                            }
                        }
                    }
                }
                getAllMembers(grdec, 1)
            }
            else {
                ctx.response.type = 'json'
                ctx.response.body = JSON.stringify({
                    status: 'error',
                    message: 'Password Wrong.'
                })
            }
        }
    } catch (e) {
        ctx.response.status = 410
        ctx.response.type = 'json'
        ctx.response.body = JSON.stringify({
            status: 'error',
            message: new Error(e).message
        })
    }
})
router.get('/api/admin/get/single/:filename', async ctx => {
    try {
        let rpasswordencoded = JSON.parse(fs.readFileSync(path.join(__dirname, './data/admin/password.json')).toString()).password
        let rpwd = sha512.sha512(Buffer.from(new url.URLSearchParams(ctx.querystring).get('password'), 'base64').toString())
        if (new url.URLSearchParams(ctx.querystring).get('from') != 'adminclient') {
            ctx.response.type = 'json'
            ctx.response.body = JSON.stringify({
                status: 'error',
                message: 'Not correct client.'
            })
        }
        else {
            if (rpasswordencoded == rpwd) {
                let grdec = 0
                if (new Date().getMonth + 1 >= 9) {
                    grdec = new Date().getFullYear() + 1
                }
                else {
                    grdec = new Date().getFullYear()
                }
                let allMembers = []
                let det = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${ctx.params.filename}.json`)).toString()).details
                if (det.length == 0) {
                    ctx.response.type = 'json'
                    ctx.response.body = JSON.stringify({
                        status: 'ok',
                        details: allMembers
                    })
                }
                else for (let i = 0; i in det; i++) {
                    delete det[i].password
                    delete det[i].deducted
                    allMembers.push(det[i])
                    if (i == det.length - 1) {
                        ctx.response.type = 'json'
                        ctx.response.body = JSON.stringify({
                            status: 'ok',
                            details: allMembers
                        })
                    }
                }
            }
            else {
                ctx.response.type = 'json'
                ctx.response.body = JSON.stringify({
                    status: 'error',
                    message: 'Password Wrong.'
                })
            }
        }
    } catch (e) {
        ctx.response.status = 410
        ctx.response.type = 'json'
        ctx.response.body = JSON.stringify({
            status: 'error',
            message: new Error(e).message
        })
    }
})
router.get('/api/member/pwd/:gradeid/:classid/:personid/check', async ctx => {
    let classid = parseInt(ctx.params.classid)
    let gradeid = parseInt(ctx.params.gradeid)
    let personid = parseInt(ctx.params.personid)
    let upwd = sha512.sha512(Buffer.from(new url.URLSearchParams(ctx.querystring).get('password'), 'base64').toString())
    let config = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/member.json`)).toString()).details
    for (let i = 0; i in config; i++) {
        if (config[i].number == personid) {
            if (upwd == config[i].password) {
                delete config[i].password
                ctx.response.type = 'json'
                ctx.response.body = JSON.stringify({
                    status: 'ok',
                    user: config[i]
                }, '', 4)
            }
            else if (i == config.length - 1) {
                ctx.response.type = 'json'
                ctx.response.body = JSON.stringify({
                    status: 'wrong',
                    reason: 'Password Wrong'
                })
            }
        }
    }
})
router.get('/404', async ctx => {
    ctx.response.type = 'html'
    ctx.response.body = fs.createReadStream(path.join(__dirname, './pages/404.html'))
})
router.get('/502', async ctx => {
    ctx.response.type = 'html'
    ctx.response.body = fs.createReadStream(path.join(__dirname, './pages/502.html'))
})
router.get('/graphapi/person/:gradeid/:classid/:graphtype', async ctx => {
    ctx.response.type = 'html'
    let qses = qs.parse(ctx.querystring)
    let password = Buffer.from(qses.password, 'base64').toString()
    // let content = qses.content
    // try {
    let tpwdencoded = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${ctx.params.gradeid}/${ctx.params.classid}/password.json`))).password
    if (tpwdencoded == sha512.sha512(password)) {
        ctx.response.body = '<h3 stype="color: red">无数据</h3>'
        let deductions = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${ctx.params.gradeid}/${ctx.params.classid}/deduction.json`))).details
        // ctx.response.body = deductions
        let columns = ['个人', '扣分数']
        let rows = []
        let status = []
        let startse = []

        for (let i = 0; i in deductions; i++) {
            if (deductions[i].date >= parseInt(qses.start) && deductions[i].date <= parseInt(qses.end)) {
                let chk = false
                if (i == 0 || deductions[i - 1].date < parseInt(qses.start)) {
                    startse.push({
                        key: startse.length,
                        num: deductions[i].person,
                        ord: i
                    })
                    rows.push({
                        个人: String(deductions[i].person),
                        扣分数: deductions[i].deduction
                    })
                }
                else for (let j = 0; j in startse; j++) {
                    if (startse == []) {
                        startse.push({
                            key: startse.length,
                            num: deductions[i].person,
                            ord: i
                        })
                        rows.push({
                            个人: String(deductions[i].person),
                            扣分数: deductions[i].deduction
                        })
                        break
                    }
                    else {
                        if (startse[j].num == deductions[i].person && (chk == false)) {
                            chk = true
                            rows[startse[j].key].扣分数 += deductions[i].deduction
                            break
                        }
                        else if (startse.length - 1 == j && chk == false) {
                            startse.push({
                                key: startse.length,
                                num: deductions[i].person,
                                ord: i
                            })
                            rows.push({
                                个人: String(deductions[i].person),
                                扣分数: deductions[i].deduction
                            })
                            break
                        }
                    }
                }
                let conte = JSON.stringify({
                    columns,
                    rows
                })
                ctx.response.type = 'html'
                ctx.response.body = chartBase.replaceAll('<%=dat=>', conte).replaceAll('<%=tpe=>', ctx.params.graphtype).replaceAll('<%=tit=>', ctx.params.graphtype)
            }

        }
    }
    else {
        ctx.response.body = '密码错误'
    }
})
router.get('/graphapi/date/:gradeid/:classid/:graphtype', async ctx => {
    ctx.response.type = 'html'
    let qses = qs.parse(ctx.querystring)
    let password = Buffer.from(qses.password, 'base64').toString()
    // let content = qses.content
    // try {
    let tpwdencoded = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${ctx.params.gradeid}/${ctx.params.classid}/password.json`))).password
    if (tpwdencoded == sha512.sha512(password)) {
        ctx.response.body = '无数据'
        let deductions = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${ctx.params.gradeid}/${ctx.params.classid}/deduction.json`))).details
        // ctx.response.body = deductions
        let columns = ['日期', '扣分数']
        let rows = []
        let status = []
        let startse = []
        let oked = false
        for (let i = 0; i in deductions; i++) {
            if (deductions[i].date >= parseInt(qses.start) && deductions[i].date <= parseInt(qses.end)) {
                let chk = false
                let dt = new Date(deductions[i].date)
                if (i == 0 || deductions[i - 1].date < parseInt(qses.start)) {
                    startse.push({
                        key: startse.length,
                        num: `${String(dt.getFullYear())}年${String(dt.getMonth())}月${String(dt.getDate())}日`,
                        ord: i
                    })
                    rows.push({
                        日期: `${String(dt.getFullYear())}年${String(dt.getMonth())}月${String(dt.getDate())}日`,
                        扣分数: deductions[i].deduction
                    })
                    oked = true
                }
                else for (let j = 0; j in startse; j++) {
                    if (startse == []) {
                        startse.push({
                            key: startse.length,
                            num: `${String(dt.getFullYear())}年${String(dt.getMonth())}月${String(dt.getDate())}日`,
                            ord: i
                        })
                        rows.push({
                            日期: `${String(dt.getFullYear())}年${String(dt.getMonth())}月${String(dt.getDate())}日`,
                            扣分数: deductions[i].deduction
                        })
                        break
                    }
                    else {
                        if (startse[j].num == `${String(dt.getFullYear())}年${String(dt.getMonth())}月${String(dt.getDate())}日` && (chk == false)) {
                            chk = true
                            rows[startse[j].key].扣分数 += deductions[i].deduction
                            break
                        }
                        else if (startse.length - 1 == j && chk == false) {
                            startse.push({
                                key: startse.length,
                                num: `${String(dt.getFullYear())}年${String(dt.getMonth())}月${String(dt.getDate())}日`,
                                ord: i
                            })
                            rows.push({
                                日期: `${String(dt.getFullYear())}年${String(dt.getMonth())}月${String(dt.getDate())}日`,
                                扣分数: deductions[i].deduction
                            })
                            break
                        }
                    }
                }
                let conte = JSON.stringify({
                    columns,
                    rows
                })
                ctx.response.type = 'html'
                ctx.response.body = chartBase.replaceAll('<%=dat=>', conte).replaceAll('<%=tpe=>', ctx.params.graphtype).replaceAll('<%=tit=>', ctx.params.graphtype)

            }
        }
    }
    else {
        ctx.response.body = '密码错误'
    }
})
router.get('/graphapi/type/:gradeid/:classid/:graphtype', async ctx => {
    ctx.response.type = 'html'
    let qses = qs.parse(ctx.querystring)
    let password = Buffer.from(qses.password, 'base64').toString()

    // let content = qses.content
    // try {
    let tpwdencoded = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${ctx.params.gradeid}/${ctx.params.classid}/password.json`))).password
    if (tpwdencoded == sha512.sha512(password)) {
        ctx.response.body = '<h3 stype="color: red">无数据</h3>'
        let deductions = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${ctx.params.gradeid}/${ctx.params.classid}/deduction.json`))).details
        let columns = ['类型', '扣分数']
        let rows = []
        for (let i = 0; i in deductions; i++) {
            if (deductions[i].date >= parseInt(qses.start) && deductions[i].date <= parseInt(qses.end)) {
                if (rows[deductions[i].typical - 1] == undefined) {
                    rows.push({
                        类型: deductions[i].reason,
                        扣分数: deductions[i].deduction
                    })
                }
                else {
                    rows[deductions[i].typical - 1].扣分数 += deductions[i].deduction
                }
                let conte = JSON.stringify({
                    columns,
                    rows
                })
                ctx.response.type = 'html'
                ctx.response.body = chartBase.replaceAll('<%=dat=>', conte).replaceAll('<%=tpe=>', ctx.params.graphtype).replaceAll('<%=tit=>', ctx.params.graphtype)
            }

        }
    }
    else {
        ctx.response.body = '密码错误'
    }
    // } catch (e) {

    //     ctx.response.body = '班级不存在'

    // }
})
app.use(async (ctx, next) => {
    await next();
    if (parseInt(ctx.status) === 404) {
        ctx.type = 'html'
        ctx.body = fs.createReadStream(path.join(__dirname, './pages/404.html'))
    }
    else if (parseInt(ctx.status) < 550 && parseInt(ctx.status) >= 500) {
        ctx.type = 'html'
        ctx.body = fs.createReadStream(path.join(__dirname, './pages/502.html'))
    }
})
app.use(router.routes())
app._io.on('connection', socket => {
    let para
    if (url.parse(socket.request.url, true).query.type == 'class') {
        para = `class/${url.parse(socket.request.url, true).query.gradeid}/${url.parse(socket.request.url, true).query.classid}`
        socket.to(para).emit('logout')
        socket.join(para)
    }
    else if (url.parse(socket.request.url, true).query.type == 'member') {
        para = `member/${url.parse(socket.request.url, true).query.gradeid}/${url.parse(socket.request.url, true).query.classid}/${url.parse(socket.request.url, true).query.number}`
        socket.to(para).emit('logout')
        socket.join(para)
    }
    socket.on('classinfo', data => {
        let datadecoded = JSON.parse(Buffer.from(data, 'base64').toString()) // Parse user login data
        let yearg1
        let date = new Date()
        if (date.getMonth() < 9)
            yearg1 = date.getFullYear() - 1
        else if (date.getMonth >= 9)
            yearg1 = date.getFullYear()
        let classid = datadecoded.classid
        let gradeid = yearg1 - datadecoded.gradeid + 2 // Obtain class information through login data
        let password = Buffer.from(datadecoded.password, 'base64').toString() // Parse password
        let deductions = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/deduction.json`)))
        let rpasswordencoded = fs.readFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/password.json`)) // Read configs
        if (rpasswordencoded == '' || rpasswordencoded == '{}') { // is the file empty?
            let pwdlst = {
                password: sha512.sha512(password)
            }
            fs.writeFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/password.json`), JSON.stringify(pwdlst, '', 4))
        }
        else {
            let rpwde = JSON.parse(rpasswordencoded)
            if (rpwde.key == '') { // is the file empty?
                let pwdlst = {
                    password: sha512.sha512(password)
                }
                fs.writeFileSync(path.join(__dirname, `./data/${gradeid}/${classid}/password.json`), JSON.stringify(pwdlst, '', 4))
            }
            else {
                let encoded = sha512.sha512(password) // Use SHA512 to save, safer.
                if (encoded == rpwde.password)
                    socket.emit('pwdcrsl', 'success') // Right
                else
                    socket.emit('pwdcrsl', 'Password wrong.') // Wrong.

            }
        } // Check password
        socket.emit('deduction', deductions)
    })
    socket.on('new_callback', data => {
        // try {

        let configuration = JSON.parse(data)
        let cbs = JSON.parse(fs.readFileSync(path.join(__dirname, './data/callbacks.json')).toString())
        configuration.id = cbs.total
        cbs.callbacks.push(configuration)
        cbs.total++
        fs.writeFileSync(path.join(__dirname, './data/callbacks.json'), JSON.stringify(cbs, '', 4))
        try {

            socket.to('admin').to('ministor').to(`member/${String(configuration.numberDeductor)}`).emit('callback_feed_up', data)
        } catch (e) { }
        // } catch (e) {
        //     socket.emit('callback_result', 'failed.')
        // }
    })
    socket.on('feebacket', data => {
        // try {

        let configuration = data
        let cbs = JSON.parse(fs.readFileSync(path.join(__dirname, './data/feedbacks.json')).toString())
        cbs.feedbacks.push({
            content: configuration,
            from: para,
            id: cbs.total
        })
        cbs.total++
        fs.writeFileSync(path.join(__dirname, './data/feedbacks.json'), JSON.stringify(cbs, '', 4))
        try {

            socket.to('admin').to('ministor').emit('new_feedback', data)
        } catch (e) { }
    })
    socket.on('log', data => {
        console.log(data)
    })

    socket.on('newpwdmember', data => {
        try {
            let rnew = Buffer.from(JSON.parse(data).newpwd, 'base64').toString()
            let yyd = 0
            if (new Date().getMonth() + 1 >= 9) {
                yyd = new Date().getFullYear() + 1
            }
            else {
                yyd = new Date().getFullYear()
            }
            let rols = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${yyd - parseInt(url.parse(socket.request.url, true).query.gradeid)}/${url.parse(socket.request.url, true).query.classid}/member.json`)).toString())
            for (let i = 0; i in rols.details; i++) {
                if (rols.details[i].number == JSON.parse(data).numb) {
                    rols.details[i].password = sha512.sha512(rnew)
                    fs.writeFileSync(path.join(__dirname, `./data/${yyd - parseInt(url.parse(socket.request.url, true).query.gradeid)}/${url.parse(socket.request.url, true).query.classid}/member.json`), JSON.stringify(rols, '', 4))
                    socket.emit('newpwdstatus', JSON.stringify({
                        status: 'ok'
                    }))
                }
            }
        }
        catch (e) {
            socket.emit('newpwdstatus', JSON.stringify({
                status: 'err',
                content: new Error(e).message
            }))
        }
    })
    socket.on('newpwd', data => {
        // try {
        let rnew = Buffer.from(data, 'base64').toString()
        let yyd = 0
        if (new Date().getMonth() >= 9) {
            yyd = new Date().getFullYear() + 1
        }
        else {
            yyd = new Date().getFullYear()
        }
        let rols = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${yyd - parseInt(url.parse(socket.request.url, true).query.gradeid)}/${url.parse(socket.request.url, true).query.classid}/password.json`)).toString())
        rols.password = sha512.sha512(rnew)
        fs.writeFileSync(path.join(__dirname, `./data/${yyd - parseInt(url.parse(socket.request.url, true).query.gradeid)}/${url.parse(socket.request.url, true).query.classid}/password.json`), JSON.stringify(rols, '', 4))
        socket.emit('newpwdstatus', JSON.stringify({
            status: 'ok',
            grdid: url.parse(socket.request.url, true).query.gradeid,
            claid: url.parse(socket.request.url, true).query.classid,
            newpwd: Buffer.from(rnew).toString('base64')
        }))
        // }
        // catch (e) {
        //     socket.emit('newpwdstatus', JSON.stringify({
        //         status: 'err',
        //         content: e
        //     }))
        // }
    })
    socket.on('new_d', data => {
        let grai_d = Math.floor(JSON.parse(data).person / 10000)
        let clai_d = Math.floor(JSON.parse(data).person % 10000 / 100)
        let peri_d = Math.floor(JSON.parse(data).person % 100)
        let alldes = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/dudctiontotal.json`)).toString()).deductionMax
        let dat = JSON.parse(data)
        dat.id = alldes
        alldes++
        fs.writeFileSync(path.join(__dirname, `./data/dudctiontotal.json`), JSON.stringify({
            deductionMax: alldes
        }, '', 4))
        let det = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${grai_d}/${clai_d}/deduction.json`)).toString())
        // if (dat.type == 3) {
        //     for (let i = 0; i in det; i++) {
        //         if (det[i].person == dat.person) {
        //             if (Math.abs(det[i].date - dat.date) > 30000) {
        //                 break
        //             }
        //         }
        //         if (i == det.length - 1) {

        //         }
        //     }
        // }
        let dtotal = 0
        det.details.push(dat)
        fs.writeFileSync(path.join(__dirname, `./data/${grai_d}/${clai_d}/deduction.json`), JSON.stringify(det, '', 4))
        // 部内操作
        let clmemdat = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${grai_d}/${clai_d}/member.json`)).toString())
        for (let i = 0; i in clmemdat.details; i++) {
            if (dat.person == clmemdat.details[i].number) {
                clmemdat.details[i].totalviolation += dat.deduction
                fs.writeFileSync(path.join(__dirname, `./data/${grai_d}/${clai_d}/member.json`), JSON.stringify(clmemdat, '', 4))
            }
        }
        let dectrdat = {
            graide: Math.floor(JSON.parse(data).numberDeductor / 10000),
            claide: Math.floor(JSON.parse(data).numberDeductor % 10000 / 100),
            numide: Math.floor(JSON.parse(data).person % 100)
        }
        let dectrdatct = JSON.parse(fs.readFileSync(path.join(__dirname, `./data/${dectrdat.graide}/${dectrdat.claide}/member.json`)).toString())
        for (let i = 0; i in dectrdatct.details; i++) {
            if (dat.numberDeductor == dectrdatct.details[i].number) {
                dectrdatct.details[i].totaldeducted++
                dectrdatct.details[i].deducted.push(alldes)
                fs.writeFileSync(path.join(__dirname, `./data/${dectrdat.graide}/${dectrdat.claide}/member.json`), JSON.stringify(dectrdatct, '', 4))
            }
        }
        socket.emit('new_d_result')
    })
    socket.on('new_member', data => {
        try {

            let conf = JSON.parse(decodeURIComponent(Buffer.from(data, 'base64').toString()))
            let pth = path.join(__dirname, `./data/${conf.gradeid}/${conf.classid}/member.json`)
            let clcf = JSON.parse(fs.readFileSync(pth).toString())
            delete conf.gradeid
            delete conf.classid
            conf.password = sha512.sha512(conf.password)
            clcf.details.push(conf)
            fs.writeFileSync(pth, JSON.stringify(clcf, '', 4))
            socket.emit('new_m_result', 'ok')
        }
        catch (e) {
            socket.emit('new_m_result', new Error(e).message)
        }
    })
})
app.listen(1108)