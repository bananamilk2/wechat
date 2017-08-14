var logger = require('tracer').colorConsole(
				{
					format : "<{{title}}> <{{file}}:{{line}}> {{message}} ",
					dateformat : "HH:MM:ss.L"
                });


module.exports.debug = logger.debug;
module.exports.error = logger.error;
module.exports.info  = logger.info;
