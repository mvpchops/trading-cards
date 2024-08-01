const fs = require('fs');
const yaml = require('js-yaml');
const SwaggerParser = require("@apidevtools/swagger-parser");

SwaggerParser.dereference('./api.yaml', (err, deRefedApi) => {
    if (err) {
        console.error(err);
        return;
    }

    const deRefedApiStr = yaml.dump(deRefedApi, {noRefs: true, noCompatMode: true});
    // console.log(deRefedApiStr);

    fs.writeFile('./api-derefed.yaml', deRefedApiStr, (err) => {
        if (err) {
            throw err;
            console.log("Data has been written to file successfully.");
        }
    });
});
