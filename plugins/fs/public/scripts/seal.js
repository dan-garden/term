const sealSource = 'https://seal.trustico.com/seal.js?info=';

cmd.registerSuggestions([
   'seal encode {product: 42, size: "M", sealCode: "E4"}'
]);

cmd.registerCommand("seal decode", args => {
   if(args.length) {
      let script = args.join(" ");
      script = script.split("'").join('"');
      let src = script.split('src="')[1].split('"')[0];
      let base = src.replace(sealSource, '');
      window.seal = JSON.parse(base64_decode(base));
      cmd.run('window.seal', null);
   } else {
      throw new Error("No seal to decode");
   }
});

cmd.registerCommand("seal encode", args => {
   if(args.length) {
      let config = args.join(" ");
      config = eval('(' + config + ')');
      config = JSON.stringify(config);
      let base = base64_encode(config);
      const seal = document.createElement("script");
      seal.type = "text/javascript";
      seal.src = sealSource + base;
      window.seal = seal.outerHTML;
      cmd.run('window.seal', null);
   } else {
      throw new Error("No object to encode");
   }
});