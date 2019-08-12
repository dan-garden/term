new Canv('canvas', {
    setup() {
        cmd.registerCommand("readable", args => {
            const r = args.shift();
            const number = parseInt(r);
            const readable = this.convert(number);
            
            cmd.newLine(readable);
        })
    },


    convert(labelValue) {
        // Nine Zeroes for Billions
        return Math.abs(Number(labelValue)) >= 1.0e+9

        ? Math.abs(Number(labelValue)) / 1.0e+9 + " billion"
        // Six Zeroes for Millions 
        : Math.abs(Number(labelValue)) >= 1.0e+6

        ? Math.abs(Number(labelValue)) / 1.0e+6 + " million"
        // Three Zeroes for Thousands
        : Math.abs(Number(labelValue)) >= 1.0e+3

        ? Math.abs(Number(labelValue)) / 1.0e+3 + " thousand"

        : Math.abs(Number(labelValue));

    }
})