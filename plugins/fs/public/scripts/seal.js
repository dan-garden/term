cmd.registerCommand("seal", args => {
    const type = args.shift();
    if(type && args.length) {
       const sealSource = 'https://seal.trustico.com/seal.js?info=';

       if(type === "encode") {

          let config = args.join(" ");
          config = eval('(' + config + ')');
          config = JSON.stringify(config);
          let base = base64_encode(config);
          const seal = document.createElement("script");
          seal.type = "text/javascript";
          seal.src = sealSource + base;
          console.log(seal.outerHTML);         

       } else if(type === "decode") {
       
          let script = args.join(" ");
          script = script.split("'").join('"');
          let src = script.split('src="')[1].split('"')[0];
          let base = src.replace(sealSource, '');
          window.seal = JSON.parse(base64_decode(base));
          cmd.run('window.seal', null);

       }
    } else if(window.seal) {
       cmd.run('window.seal', null);
    }
})