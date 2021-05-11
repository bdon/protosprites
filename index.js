// https://github.com/mapbox/potpack
// ISC License
//
// Copyright (c) 2018, Mapbox
//
// Permission to use, copy, modify, and/or distribute this software for any purpose
// with or without fee is hereby granted, provided that the above copyright notice
// and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
// OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
// TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
// THIS SOFTWARE.
let potpack = boxes => {
    let area = 0
    let maxWidth = 0

    for (const box of boxes) {
        area += box.w * box.h
        maxWidth = Math.max(maxWidth, box.w)
    }
    boxes.sort((a, b) => b.h - a.h)
    const startWidth = Math.max(Math.ceil(Math.sqrt(area / 0.95)), maxWidth)
    const spaces = [{x: 0, y: 0, w: startWidth, h: Infinity}]

    let width = 0
    let height = 0

    for (const box of boxes) {
        for (let i = spaces.length - 1; i >= 0; i--) {
            const space = spaces[i]
            if (box.w > space.w || box.h > space.h) continue
            box.x = space.x
            box.y = space.y

            height = Math.max(height, box.y + box.h)
            width = Math.max(width, box.x + box.w)

            if (box.w === space.w && box.h === space.h) {
                const last = spaces.pop()
                if (i < spaces.length) spaces[i] = last

            } else if (box.h === space.h) {
                space.x += box.w
                space.w -= box.w

            } else if (box.w === space.w) {
                space.y += box.h
                space.h -= box.h

            } else {
                spaces.push({
                    x: space.x + box.w,
                    y: space.y,
                    w: space.w - box.w,
                    h: box.h
                })
                space.y += box.h
                space.h -= box.h
            }
            break
        }
    }

    return {
        w: width,
        h: height,
        fill: (area / (width * height)) || 0
    }
}

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
        this.src = src
        this.canvas = null
    }

    async load() {
        let src = this.src
        let scale = window.devicePixelRatio
        if (src.endsWith('.html')) {
            let c = await fetch(src)
            src = await c.text()
        }
        let tree = (new window.DOMParser()).parseFromString(src, "text/html")
        let icons = tree.body.children
        this.mapping = {}
        let boxes = []
        for (let ps of icons) {
            var svg64 = btoa(new XMLSerializer().serializeToString(ps))
            var image64 = 'data:image/svg+xml;base64,' + svg64
            let img = await mkimg(image64)
            boxes.push({w:img.width*scale,h:img.height*scale,img:img,id:ps.id})
        }

        let packresult = potpack(boxes)
        this.canvas = document.createElement('canvas')
        this.canvas.width = packresult.w
        this.canvas.height = packresult.h 
        let ctx = this.canvas.getContext('2d')

        for (let box of boxes) {
            ctx.drawImage(box.img,box.x,box.y,box.w,box.h)
            this.mapping[box.id] = {x:box.x,y:box.y,w:box.w,h:box.h}
        }
        return this
    }

    get(name) {
        let result = this.mapping[name]
        if (!result) throw new Error(name + " not found")
        result.canvas = this.canvas
        return result
    }
}
