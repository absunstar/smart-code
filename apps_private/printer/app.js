module.exports = function init(site) {
    var printer = require('node-thermal-printer');

    printer.init({
        type: printer.printerTypes.EPSON, // 'star' or 'epson'
        interface: '/dev/usb/lp1', // Linux interface
        characterSet: 'UTF-8', // Printer character set
        removeSpecialCharacters: false, // Removes special characters - default: false
        replaceSpecialCharacters: true, // Replaces special characters listed in config files - default: true
    });

    printer.isPrinterConnected(function (connected) {
        console.log('Printer connected:', connected);
        if (connected) {
            printer.println('Hello World');
            printer.execute((result) => {
                console.log(result);
            });
        }
    });
};
