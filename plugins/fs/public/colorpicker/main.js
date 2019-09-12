class Colorpicker {
    constructor(dom) {
        this.canvas = document.querySelectorAll(dom)[0];
        this.ctx = this.canvas.getContext('2d');
        this.color_display = document.getElementById('color-display');

        this.canvas.addEventListener('click', e => this.handleMouseClick(e))
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.pixels = [];
    }

    handleFile(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const img = new Image();
            const reader = new FileReader();

            if (!file.type.startsWith('image/')){ continue }

            img.onload = (e) => {
                this.canvas.width = img.width;
                this.color_display.style.width = img.width+'px';
                this.canvas.height = img.height;
                this.canvas.classList.add('active');
                this.ctx.drawImage(img, 0, 0, img.width, img.height);
                this.pixels = this.ctx.getImageData(0, 0, img.width, img.height);

            };
           
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    getBrightness(color) {
        return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b; // per ITU-R BT.709
    }

    handleMouseClick(e) {
        this.color_display.classList.add('active');

        const colorIndex = e.layerY * (this.canvas.width * 4) + e.layerX * 4;
        const color = {
            r: this.pixels.data[colorIndex],
            g: this.pixels.data[colorIndex + 1],
            b: this.pixels.data[colorIndex + 2],
            a: this.pixels.data[colorIndex + 3] / 255
        };

        this.color_display.innerText = color.r+', '+color.g+', '+color.b;
        this.color_display.style.backgroundColor = `rgba(${color.r},${color.g},${color.b},${color.a})`;

        const brightness = this.getBrightness(color);
        this.color_display.style.color = brightness > 128 ? 'black' : 'white';
    }
}