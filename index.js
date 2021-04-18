
let mkimg = src => {
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export default class Protosprites {
    constructor(src) {
        this.canvas = this.createCanvas(src)
    }

    async createCanvas(src) {
        let canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 512
        let ctx = canvas.getContext('2d')

        let tree
        if (src.endsWith('.psprites')) {
            let c = await fetch(src)
            let str = await c.text()
            tree = (new window.DOMParser()).parseFromString(str, "text/html")
        }

        this.mapping = {}

        let x = 0
        // this happens in series, probably nothing to be gained from Promise.all
        for (let ps of tree.body.children) {
            var svg64 = btoa(new XMLSerializer().serializeToString(ps))
            var image64 = 'data:image/svg+xml;base64,' + svg64
            let img = await mkimg(image64)
            ctx.drawImage(img,x,0)
            this.mapping[ps.id] = {x:x,y:0,width:img.width,height:img.height}
            x += img.width
        }
        return canvas
    }

    async get(name) {
        let canvas = await this.canvas
        let result = this.mapping[name]
        result.canvas = canvas
        return result
    }
}


