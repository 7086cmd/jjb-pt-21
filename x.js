const fs = require('fs')
const path = require('path')
const { sha512 } = require('js-sha512')
for (let i = 2019; i <= 2021; i++) {
    for (let j = 1; j <= 15; j++) {
        fs.writeFileSync(path.join(__dirname, `./data/${i}/${j}/password.json`), JSON.stringify({
            password: sha512(String(j + i * 100))
        }, '', 4))
    }
}