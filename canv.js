class Color {
    static fromHex(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? new Color(
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ) : undefined;
    }

    static fromRef(ref) {
        const d = document.createElement("div");
        d.style.color = ref;
        d.style.display = "none";
        document.body.appendChild(d);
        const s = window.getComputedStyle(d).color
            .replace("(", "")
            .replace(")", "")
            .replace("rgb", "");
        document.body.removeChild(d);
        const c = s.split(", ").map(a => parseInt(a));
        return new Color(c[0], c[1], c[2]);
    }

    static random() {
        return new Color(
            Canv.random(0, 255),
            Canv.random(0, 255),
            Canv.random(0, 255)
        )
    }

    constructor() {
        if (arguments.length === 0) {
            this.r = 0;
            this.g = 0;
            this.b = 0;
            this.a = 0;
        } else if (arguments.length === 1) {
            if (arguments[0] instanceof Color) {
                this.r = arguments[0].r;
                this.g = arguments[0].g;
                this.b = arguments[0].b;
                this.a = arguments[0].a;
            } else if (typeof arguments[0] === "number") {
                //RGB
                this.r = arguments[0];
                this.g = arguments[0];
                this.b = arguments[0];
                this.a = 1;
            } else if (arguments[0].startsWith("#")) {
                //HEX
                return Color.fromHex(arguments[0]);
            } else {
                //REF
                return Color.fromRef(arguments[0])
            }
        } else if (arguments.length === 3) {
            //RGB
            this.r = arguments[0];
            this.g = arguments[1];
            this.b = arguments[2];
            this.a = 1;
        } else if (arguments.length === 4) {
            //RGBA
            this.r = arguments[0];
            this.g = arguments[1];
            this.b = arguments[2];
            this.a = arguments[3];
        }



        this.normalize();
    }

    toString(type = "rgba") {
        return type == "rgba" ?
            `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})` :
            `rgb(${this.r}, ${this.g}, ${this.b})`
    }

    normalize() {
        if (this.r > 255) {
            this.r = 255;
        }
        if (this.g > 255) {
            this.g = 255;
        }
        if (this.b > 255) {
            this.b = 255;
        }

        if (this.r < 0) {
            this.r = 0;
        }
        if (this.g < 0) {
            this.g = 0;
        }
        if (this.b < 0) {
            this.b = 0;
        }
        return this;
    }

    shade(n) {
        this.r = this.r + n;
        this.g = this.g + n;
        this.b = this.b + n;
        return this.normalize();
    }

    opacity(n) {
        this.a = n;
        return this;
    }

    invert() {
        this.r = 255 - this.r;
        this.g = 255 - this.g;
        this.b = 255 - this.b;
        return this;
    }

    greyscale() {
        const s = (this.r + this.g + this.b) / 3;
        this.r = s;
        this.g = s;
        this.b = s;
        return this;
    }

    sepia() {
        this.r = (0.393*this.r) + (0.769*this.g) + (0.189*this.b);
        this.g = (0.349*this.r) + (0.686*this.g) + (0.168*this.b);
        this.b = (0.272*this.r) + (0.534*this.g) + (0.131*this.b);
        return this;
    }

    randomize() {
        const c = Color.random();
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
        this.a = c.a;
        return this;
    }

    saturate(value) {
        var gray = 0.2989*this.r + 0.5870*this.g + 0.1140*this.b;
        this.r = -gray * value + this.r * (1+value);
        this.g = -gray * value + this.g * (1+value);
        this.b = -gray * value + this.b * (1+value);
        return this.normalize();
    }
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    add(v) {
        if(v instanceof Vector) {
            this.x += v.x;
            this.y += v.y;
        }
    }

    subtract(v) {
        if(v instanceof Vector) {
            this.x -= v.x;
            this.y -= v.y;
        }
    }

    moveX(n) {
        this.x += n;
    }

    moveY(n) {
        this.y += n;
    }
}

class ShapeEventListener {
    constructor() {
        this.events = {

        };
    }

    register(type, fn) {
        if(typeof type === "string" && typeof fn === "function") {
            if(!this.exists(type)) {
                this.events[type] = [];
            }

            this.events[type].push(fn);
        }
    }

    trigger(type, params) {
        if(this.exists(type)) {
            this.events[type].forEach(event => {
                if(params) {
                    event(...params)
                } else {
                    event();
                }
            });
        }
    }

    exists(type) {
        return (type && this.events[type])
    }
}

class Shape {
    constructor(x, y) {
        this.$events = new ShapeEventListener();
        this.$mouseover = false;
        this.$mousedown = false;
        this.pos = new Vector(x, y);

        this.showFill = true;
        this.showStroke = false;

        this.angle = 0;

        this.color = new Color(0);
        this.stroke = new Color(0);
        this.dash = [];
        this.strokeWidth = 1;
    }

    set x(n) {
        this.pos.x = n;
    }

    set y(n) {
        this.pos.y = n;
    }

    get x() {
        return this.pos.x;
    }

    get y() {
        return this.pos.y;
    }

    noStroke() {
        this.showFill = true;
        this.showStroke = false;
        return this;
    }

    noFill() {
        this.showFill = false;
        this.showStroke = true;
        return this;
    }

    setPos(x, y) {
        this.pos.setPos(x, y);
        return this;
    }

    setDimensions(w, h) {
        this.width = w;
        this.height = h;
        return this;
    }

    setColor(n) {
        this.color = new Color(n);
        return this;
    }

    setStroke(n, s) {
        this.stroke = new Color(n);
        if(s) {
            this.setStrokeWidth(s);
        }
        this.showStroke = true;
        return this;
    }

    setStrokeWidth(n) {
        this.strokeWidth = n;
        return this;
    }

    moveX(n) {
        this.x += n;
        return this;
    }

    moveY(n) {
        this.y += n;
        return this;
    }

    rotate(n) {
        this.angle += n;
        return this;
    }

    setAngle(n) {
        this.angle = n;
        return this;
    }

    contains() {
        return false;
    }

    addEventListener(type, fn) {
        this.$events.register(type, fn);
    }

    trigger(event, params) {
        this.$events.trigger(event, params);
    }

    preRender(canv) {
        if(canv.mouseDown && this.contains(canv.mouseX, canv.mouseY)) {
            this.$mousedown = true;
            this.trigger("mousedown", [canv]);
        }

        if(this.contains(canv.mouseX, canv.mouseY) && this.$mousedown === true && !canv.mouseDown) {
            this.$mousedown = false;
            this.trigger("mouseup", [canv]);
            this.trigger("click", [canv]);
        }

        if(!this.contains(canv.mouseX, canv.mouseY)) {
            this.$mousedown = false;
        }

        if(this.contains(canv.mouseX, canv.mouseY)) {
            this.$mouseover = true;
            this.trigger("mouseover", [canv]);
        }

        if(this.$mouseover === true && !this.contains(canv.mouseX, canv.mouseY)) {
            this.$mouseover = false;
            this.trigger("mouseout", [canv]);
        }

        
    }

    renderRotation(canv) {
        let w = this.width,
            h = this.height,
            x = this.x,
            y = this.y;

        if (this.angle) {
            canv.ctx.translate(x + w / 2, y + h / 2);
            canv.ctx.rotate(this.angle * (Math.PI / 180));
            canv.ctx.translate(-(x + w / 2), -(y + h / 2));
        }
    }

}

class ShapeGroup {
    constructor(shapes = []) {
        Object.keys(shapes).forEach(shapeKey => {
            this[shapeKey] = shapes[shapeKey];
        })
        this.shapes = Object.values(shapes);
    }

    set color(x) {
        this.forEach(shape => shape.color = x);
    }

    setColor(x) {
        this.forEach(shape => shape.color = x);
        return this;
    }

    set strokeWidth(x) {
        this.forEach(shape => shape.strokeWidth = x);
    }

    set stroke(x) {
        this.forEach(shape => shape.stroke = x);
    }

    remove(i) {
        if(this[i]) {
            delete this[i];
        }

        this.shapes.splice(i, 1);
        return this;
    }
    
    forEach(fn) {
        if(typeof fn === "function") {
            for(let i = this.length-1; i >= 0; --i) {
                fn(this.shapes[i], i);
            }
        }
        return this;
    }

    map(fn) {
        if(typeof fn === "function") {
            for(let i = this.length-1; i >= 0; --i) {
                this.shapes[i] = fn(this.shapes[i], i);
            }
        }
        return this;
    }

    filter(fn) {
        if(typeof fn === "function") {
            for(let i = this.length-1; i >= 0; --i) {
                let f = fn(this.shapes[i], i);
                if(!f) {
                    this.remove(i);                           
                }
            }
        }
        return this;
    }

    noStroke() {
        this.forEach(shape => shape.noStroke());
    }

    noFill() {
        this.forEach(shape => shape.noFill());
    }

    render(canv) {
        this.forEach(shape => shape.render(canv));
    }

    contains(x, y) {
        return Object.values(this.shapes).map(shape => {
            return shape.contains ? shape.contains(x, y) : false
        }).some(contains => contains == true);
    }

    add(n) {
        this.shapes.unshift(n);
        // this.shapes.push(n);
        return this;
    }

    clear() {
        this.shapes = [];
        return this;
    }

    moveX(n) {
        this.forEach(s => {
            s.moveX(n)
        })
    }

    moveY(n) {
        this.forEach(s => {
            s.moveY(n)
        })
    }

    shrink(n=1) {
        this.forEach(s => s.size -= n)
    }

    grow(n=1) {
        this.forEach(s => s.size += n)
    }

    rotate(n=1) {
        this.forEach(shape => shape.angle += n);
        return this;
    }

    get length() {
        return this.shapes.length;
    }
}

class Pic extends Shape {
    constructor(src, x = 0, y = 0, width, height, fn) {
        super(x, y);
        this.image = new Image();
        this.src = src;

        this.$pixels = false;

        this.width = width;
        this.height = height;


        this.image.onload = () => {
            this.loaded = true;
            if (!this.width) {
                this.width = this.image.naturalWidth;
            }
            if (!this.height) {
                this.height = this.image.naturalHeight;
            }
            if (typeof fn === "function") {
                fn(this);
            }
        };
    }

    contains(x, y) {
        return (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height);
    }

    set src(n) {
        this.image.src = n;
    }

    get src() {
        return this.image.src;
    }


    getPixels(x=0, y=0, w=this.width, h=this.height) {
        const px = [];
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.image, 0, 0, w, h);
        const data = ctx.getImageData(x, y, w, h).data;
        const l = w * h;
        for (let i = 0; i < l; i++) {
            let r = data[i * 4]; // Red
            let g = data[i * 4 + 1]; // Green
            let b = data[i * 4 + 2]; // Blue
            let a = data[i * 4 + 3]; // Alpha
            let yc = parseInt(i / w, 10);
            if (!px[yc]) {
                px[yc] = [];
            }
            let xc = i - yc * w;
            let color = new Color(r, g, b, a);
            px[yc][xc] = color;
        }

        this.$pixels = px;
        return px;
    }

    render(canv) {
        if (!this.loaded) {
            setTimeout(() => this.render(canv), 0);
        } else {
            this.preRender(canv);
            canv.ctx.save();
            canv.ctx.beginPath();
            this.renderRotation(canv);
            if (this.showStroke) {
                canv.ctx.lineWidth = this.strokeWidth;
                canv.ctx.strokeStyle = this.stroke.toString();
                canv.ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
            if (this.showFill) {
                canv.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
            canv.ctx.closePath();
            canv.ctx.restore();
        }
    }
}

class Sprite extends ShapeGroup {
    constructor() {super(...arguments)}
    getString(width=100, height=100) {
        const canv = document.createElement("canvas");
        const id = "sprite-" + Canv.random(10000, 99999);
        canv.id = id;
        document.body.append(canv);
        const c = new Canv("#"+id, {
            width,
            height,
            fullscreen: false,
            createSprite(spr) {
                this.add(spr);
                return this.snapshot();
            }
        });
        let sprite = c.createSprite(this);
        document.body.removeChild(canv);
        return sprite;
    }
}

class Point extends Shape {
    constructor(x, y) {
        super(x, y);
    }

    render(canv) {
        this.preRender(canv);
        canv.ctx.beginPath();
        canv.ctx.strokeStyle = this.color.toString();
        canv.ctx.strokeRect(this.x, this.y, 1, 1);
        canv.ctx.closePath();
    }
}

class Line extends Shape {
    constructor(x1, y1, x2, y2) {
        super();

        if (x1 instanceof Vector && y1 instanceof Vector) {
            this.pos = x1;
            this.pos2 = y1;
        } else {
            this.pos = new Vector(x1, y1);
            this.pos2 = new Vector(x2, y2);
        }

        this.lineCap = "round";
    }

    moveX(n) {
        this.pos.moveX(n);
        this.pos2.moveX(n);
    }

    moveY(n) {
        this.pos.moveY(n);
        this.pos2.moveY(n);
    }

    get x1() {
        return this.x;
    }

    set x1(n) {
        this.x = n;
    }

    get y1() {
        return this.y;
    }

    set y1(n) {
        this.y = n;
    }

    set width(n) {
        this.strokeWidth = n;
    }

    get width() {
        return this.strokeWidth;
    }

    set size(n) {
        this.strokeWidth = n;
    }

    get size() {
        return this.strokeWidth;
    }

    get length() {
        return new Vector(
            this.x2 - this.x1,
            this.y2 - this.y1
        );
    }

    contains(x, y) {
        return false;
    }

    render(canv) {
        this.preRender(canv);
        canv.ctx.beginPath();
        canv.ctx.lineWidth = this.strokeWidth;
        canv.ctx.lineCap = this.lineCap;
        canv.ctx.strokeStyle = this.color.toString();
        canv.ctx.moveTo(this.pos.x, this.pos.y);
        canv.ctx.lineTo(this.pos2.x, this.pos2.y);
        canv.ctx.stroke();
        canv.ctx.closePath();
    }
}

class Rect extends Shape {
    constructor(x = 0, y = 0, w = 5, h = 5) {
        super(x, y);
        this.width = w;
        this.height = h;

        this.str = false;
    }

    set text(n) {
        if(!n) {
            this.str = false;
        } else {
            if(this.str) {
                this.str.string = n;
            } else {
                this.str = new Text(n);
                this.str.textAlign = "center";
            }
        }
    }

    get text() {
        return this.str?this.str.string:false;
    }

    renderText(canv) {
        this.str.setPos(this.x + (this.width / 2), this.y + (this.height / 2));
        this.str.render(canv);
    }

    render(canv) {
        this.preRender(canv);
        canv.ctx.save();
        canv.ctx.beginPath();
        this.renderRotation(canv);
        if (this.showStroke) {
            canv.ctx.lineWidth = this.strokeWidth;
            canv.ctx.strokeStyle = this.stroke.toString();
            canv.ctx.strokeRect(this.x, this.y, this.width, this.height);
        }

        if (this.showFill) {
            canv.ctx.fillStyle = this.color.toString();
            canv.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        canv.ctx.closePath();
        canv.ctx.restore();
        if(this.str) {
            this.renderText(canv);
        }
    }

    contains(x, y) {
        return (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height);
    }
}

class Circle extends Shape {
    constructor(x = 0, y = 0, radius = 5) {
        super(x, y);
        this.size = radius;
    }

    set radius(n) {
        this.size = n;
    }

    setRadius(n) {
        this.size = n;
        return this;
    }

    get radius() {
        return this.size;
    }

    shrink(n) {
        this.size -= n;
    }

    grow(n) {
        this.size += n;
    }

    contains(x, y) {
        return ((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) <= this.radius * this.radius);
    }

    render(canv) {
        this.preRender(canv);
        if(this.size >= 0) {
            canv.ctx.beginPath();
            if (this.showStroke) {
                canv.ctx.lineWidth = this.strokeWidth;
                canv.ctx.strokeStyle = this.stroke.toString();
                canv.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
                canv.ctx.stroke();
            }

            if (this.showFill) {
                canv.ctx.fillStyle = this.color.toString();
                canv.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
                canv.ctx.fill();
            }
            canv.ctx.closePath();
        }
    }
}

class Triangle extends Shape {
    constructor(x1, y1, x2, y2, x3, y3) {
        super(x1, y1);
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
    }

    get x1() {
        return this.x;
    }

    get y1() {
        return this.y;
    }

    contains(x, y) {
        return false;
    }

    render(canv) {
        this.preRender(canv);
        canv.ctx.save();
        canv.ctx.beginPath();
        canv.ctx.moveTo(this.x1, this.y1);
        canv.ctx.lineTo(this.x2, this.y2);
        canv.ctx.lineTo(this.x3, this.y3);
        if (this.showStroke) {
            canv.ctx.lineWidth = this.strokeWidth;
            if (this.dash.length > 0) {
                canv.ctx.setLineDash(this.dash);
            }
            canv.ctx.strokeStyle = this.stroke.toString();
            canv.ctx.lineTo(this.x1, this.y1);
            canv.ctx.stroke();
        }

        if (this.showFill) {
            canv.ctx.fillStyle = this.color.toString();
            canv.ctx.fill();
        }
        canv.ctx.closePath();
        canv.ctx.restore();
    }
}

class BarGraph extends ShapeGroup {
    constructor(config) {
        super({
            bounds: config.bounds || new Rect(0, 0, 100, 100),
            steps: new ShapeGroup,
            bars: new ShapeGroup,
        });
        this.label = config.label || "No Label";
        this.step = config.step || 1;
        this.gap = config.gap === undefined ? 20 : config.gap;
        this.shadow = config.shadow === undefined ? 2 : config.shadow;
        this.lines = config.lines === undefined ? true : config.lines;
        this.fields = config.fields || [];
        this.max = config.max === undefined ? "calc" : config.max;


        this.update();
    }

    update() {
        this.highest = this.max === "calc" ? Math.max(...this.fields.map(f => f.number)) : this.max;

        this.steps.shapes = [];
        this.bars.shapes = [];
        this.bounds.showStroke = false;
        this.bounds.showFill = false;
        const len = this.fields.length;
        const step = this.bounds.height / (this.highest / (this.step));
        let j = 0;
        for (let i = 0; i <= this.highest; i += this.step) {
            let stepShape = new ShapeGroup;
            let stepLabel = new Text(
                i,
                this.bounds.x - 30,
                this.bounds.y + this.bounds.height - ((j * step))
            ).setSize(12).setFont("Verdana");
            stepShape.add(stepLabel);

            let stepMarker = new Rect(
                stepLabel.x + 20,
                stepLabel.y,
                10,
                1
            );
            stepShape.add(stepMarker);

            if (this.lines) {
                let stepLine = new Rect(
                    stepMarker.x,
                    stepMarker.y,
                    this.bounds.width + 20,
                    1
                ).setColor(200);
                stepShape.add(stepLine);
            }


            this.steps.add(stepShape);
            j++;
        }

        this.fields.map((field, i) => {
            let g = this.gap;
            let w = (this.bounds.width / len) - g;
            let h = field.number * (this.bounds.height / this.highest);
            let x = (g / 2) + this.bounds.x + (i * (w + g));
            let y = (this.bounds.height + this.bounds.y) - h;
            let c = field.color;
            const s = this.shadow;
            const bar = new ShapeGroup({
                shadow: new Rect(x + s, y - s, w, h + s).setColor(new Color(c).shade(-100)),
                bar: new Rect(x, y, w, h).setColor(c),
                text: field.label ? new Text(field.label, x, y - 2 - s).setSize(12).setFont("Verdana") : new Rect(-100, -100, 0, 0),
            });
            this.bars.add(bar);
        });
    }
}

class Grid extends ShapeGroup {
    constructor(x, y, width, height, rows, cols) {
        super([]);
        this.cells = [];

        const cw = width / cols;
        const ch = height / rows;
        const white = new Color(255);
        const black = new Color(0);

        for(let i = 0; i < cols; i++) {
            for(let j = 0; j < rows; j++) {
                const cx = x + (i * cw);
                const cy = y + (j * ch);
                const cell = new Rect(cx, cy, cw, ch);
                cell.posx = i;
                cell.posy = j;
                cell.color = white;
                cell.setStroke(1, black);
                this.cells.push(cell);
            }
        }
        this.shapes = this.cells;
    }
}

class Text extends Shape {
    constructor(string = "undefined", x = 0, y = 0, fontSize = 20) {
        super(x, y);

        this.string = string;

        this.textAlign = "left";
        this.fontSize = fontSize;
        this.fontFamily = "Comic Sans MS";
    }

    get font() {
        return `${this.fontSize}px ${this.fontFamily}`;
    }

    setSize(n) {
        this.fontSize = n;
        return this;
    }

    setFont(n) {
        this.fontFamily = n;
        return this;
    }

    setAlign(n) {
        this.textAlign = n;
        return this;
    }

    render(canv) {
        this.preRender(canv);
        canv.ctx.beginPath();
        canv.ctx.textAlign = this.textAlign;
        canv.ctx.font = this.font;
        this.renderRotation(canv);
        if (this.showStroke) {
            canv.ctx.lineWidth = this.strokeWidth;
            canv.ctx.strokeStyle = this.stroke.toString();
            canv.ctx.strokeText(this.string, this.x, this.fontSize + this.y);
        }

        if (this.showFill) {
            canv.ctx.fillStyle = this.color.toString();
            this.width = canv.ctx.measureText(this.string).width;
            canv.ctx.fillText(this.string, this.x, this.fontSize + this.y);
        }
        canv.ctx.closePath();
    }
}


class Canv {
    static random(min, max) {
        if (arguments.length === 1) {
            max = Math.floor(min);
            min = 0;
        } else if (arguments.length === 2) {
            min = Math.ceil(min);
            max = Math.floor(max);
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    map(n, start1, stop1, start2, stop2, withinBounds) {
        var newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
        if (!withinBounds) {
            return newval;
        }
        if (start2 < stop2) {
            return this.constrain(newval, start2, stop2);
        } else {
            return this.constrain(newval, stop2, start2);
        }
    };

    constrain(n, low, high) {
        return Math.max(Math.min(n, high), low);
    };

    set width(x) {
        this.canvas.width = x;
    }
    set height(x) {
        this.canvas.height = x;
    }
    set setup(x) {
        this.$setup = () => {
            x();
        };
    }
    set update(x) {
        this.$update = (n) => {
            x(n);
        };
    }
    set draw(x) {
        this.$draw = (n) => {
            x(n);
        };
    }

    get draw() {
        return this.$draw;
    }

    set background(n) {
        this.$background = new Color(n);
        if (this.$background) {
            let bg = new Rect(0, 0, this.width, this.height);
            bg.color = this.background;
            this.add(bg);
        }
    }

    get background() {
        return this.$background;
    }

    get width() {
        return this.canvas.width
    }
    get randomWidth() {
        return Canv.random(0, this.width);
    }
    get randomHeight() {
        return Canv.random(0, this.height);
    }
    get height() {
        return this.canvas.height
    }


    constructor(selector, config) {
        let noSelector = true;
        if (typeof selector === "object") {
            config = selector;
            this.canvas = document.createElement("canvas");
        } else {
            noSelector = false;
            this.canvas = document.querySelector(selector);
        }
        this.ctx = this.canvas.getContext('2d');

        this.frames = 0;
        this.$pixels = false;
        this.$running = false;

        this.$updateDelay = 0;
        this.$drawDelay = 0;

        this.keysDown = {};

        this.width = 100;
        this.height = 100;
        this.background = new Color(255);

        if (config && typeof config === "object") {
            if (!config.width && !config.height) {
                config.fullscreen = true;
            }

            const configKeys = Object.keys(config);
            configKeys.forEach(key => {
                if (key === "setup" || key === "update" || key === "draw") {
                    this["$" + key] = config[key].bind(this);
                } else {
                    this[key] = config[key];
                }
            })
        }

        this.binds();
        this.start();

        if (noSelector) {
            return this.canvas;
        }
    }

    binds() {
        this.canvas.addEventListener("mousedown", e => {
            this.mouseDown = true;
            this.mouseX = this.mouseOver ? e.layerX : false;
            this.mouseY = this.mouseOver ? e.layerY : false;
        })

        this.canvas.addEventListener("mouseup", e => {
            this.mouseDown = false;
        })

        this.canvas.addEventListener("mousemove", e => {
            this.mousePrevX = this.mouseX;
            this.mousePrevY = this.mouseY;
            this.mouseX = this.mouseOver ? e.layerX : false;
            this.mouseY = this.mouseOver ? e.layerY : false;
        });

        this.canvas.addEventListener("mouseover", e => {
            this.mouseOver = true;
        })

        this.canvas.addEventListener("mouseout", e => {
            this.mouseOver = true;
            this.mouseDown = false;
        });

        window.addEventListener("keyup", e => {
            if (this.keysDown[e.key]) {
                delete this.keysDown[e.key];
            }
        });

        window.addEventListener("keydown", e => {
            if (!this.keysDown[e.key]) {
                this.keysDown[e.key] = true;
            }
        })


        if (this.fullscreen) {
            this.resize();
            window.addEventListener("resize", e => this.resize());
        }
    }

    resize() {
        if(this.fullscreen) {
            this.width = document.body.clientWidth;
            this.height = document.body.clientHeight - 5;
        }
    }

    start() {
        if (!this.$running) {
            this.$running = true;
            if (this.$setup) this.$setup();
            if (this.$update || this.$draw) requestAnimationFrame(this.loop.bind(this));
        }
        return this;
    }

    keyDown(key) {
        return this.keysDown[key];
    }

    pressKey(keys, hold=10) {
        if(typeof keys === "string") {
            keys = [keys];
        }

        keys.forEach(key => {
            if (!this.keysDown[key]) {
                this.keysDown[key] = true;
                setTimeout(() => {
                    if (this.keysDown[key]) {
                        delete this.keysDown[key];
                    }
                }, hold);
            }
        });
    }

    stop() {
        if (this.$running) {
            this.$running = false;
        }
        return this;
    }

    write(str, x, y) {
        if (x === undefined) {
            x = this.halfWidth();
        }

        if (y === undefined) {
            y = this.halfHeight();
        }

        let txt = new Text(str, x, y);
        this.add(txt);
    }

    loop() {
        if (this.$running) {
            this.frames++;
            if (this.$update && (this.$updateDelay === 0 || this.frames % this.$updateDelay === 0)) {
                if (this.$update) this.$update(this.frames);
            }
            if (this.$draw && (this.$drawDelay === 0 || this.frames % this.$drawDelay === 0)) {
                if (this.$draw) this.$draw(this.frames);
            }
            requestAnimationFrame(this.loop.bind(this));
        }
    }

    set updateDelay(delay) {
        if (typeof delay === "number" && delay > 0) {
            this.$updateDelay = delay;
        } else {
            this.$updateDelay = 0;
        }
    }

    set drawDelay(delay) {
        if (typeof delay === "number" && delay > 0) {
            this.$drawDelay = delay;
        } else {
            this.$drawDelay = 0;
        }
    }

    filterPixels(filter) {
        if(typeof filter === "function") {
            const pixels = this.$pixels || this.getPixels();
            for(let y = 0; y < pixels.length; y++) {
                for(let x = 0; x < pixels[y].length; x++) {
                    const color = pixels[y][x];
                    const changed = filter(color, x, y);
                    if(color.toString()!==changed.toString()) {
                        pixels[y][x] = changed;
                    }
                }
            }
            this.setPixels(pixels);
        }
    }

    invert() {
        this.filterPixels(color => {return color.invert()});
    }

    toDataURL() {
        return this.canvas.toDataURL(...arguments);
    }

    snapshot() {
        return this.toDataURL(...arguments);
    }

    getPixels(x=0, y=0, w=this.width, h=this.height) {
        const px = [];
        const data = this.ctx.getImageData(x, y, w, h).data;
        const l = w * h;
        for (let i = 0; i < l; i++) {
            let r = data[i * 4]; // Red
            let g = data[i * 4 + 1]; // Green
            let b = data[i * 4 + 2]; // Blue
            let a = data[i * 4 + 3]; // Alpha
            let yc = parseInt(i / w, 10);
            if (!px[yc]) {
                px[yc] = [];
            }
            let xc = i - yc * w;
            let color = new Color(r, g, b, a);
            px[yc][xc] = color;
        }

        this.$pixels = px;
        return px;
    }

    setPixels(data, x=0, y=0, w=this.width, h=this.height) {
        const imageData = [];
        for(let xc = 0; xc < h; xc++) {
            for(let yc = 0; yc < w; yc++) {
                const color = data[xc][yc];
                imageData.push(color.r, color.g, color.b, color.a);
            }
        }
        const clamped = new Uint8ClampedArray(imageData);
        this.ctx.putImageData(new ImageData(clamped, w, h), x, y);
    }

    setDimensions(w, h) {
        this.width = w;
        this.height = h;
    }

    halfWidth(n) {
        return n ? (this.width / 2) - (n / 2) : this.width / 2
    }

    halfHeight(n) {
        return n ? (this.height / 2) - (n / 2) : this.height / 2
    }

    clear(x = 0, y = 0, w = this.width, h = this.height) {
        this.ctx.clearRect(x, y, w, h);
    }

    add(n) {
        if (n) {
            n.render(this);
        }
    }
}