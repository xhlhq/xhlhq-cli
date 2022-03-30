'use strict';

const Command = require('@xhlhq-cli/command')
const log = require('@xhlhq-cli/log')

class InitCommand extends Command {
    init() {
        this.projectName = this._argv[0] || null
        this.force = !!this._argv[1].force;
        log.verbose('projectName',this.projectName)
        log.verbose('force',this.force)
    }
    exec() {

    }
}


function init(argv) {
    // TODO
    // console.log('projectName:',projectName,'Options:',Options,'cmdObj:',cmdObj)
    return new InitCommand(argv)
}


module.exports = init;
module.exports.InitCommand = InitCommand;