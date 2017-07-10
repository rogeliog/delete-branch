const spawnSync = require('child_process').spawnSync;
const inquirer = require('inquirer');
const chalk = require('chalk');

const spaces = new Array(30).fill(' ');

const getCommit = (ref, format) =>
  spawnSync('git', ['log', ref, '-1', `--pretty=${format}`])
      .stdout
      .toString()
      .replace(/\n/g,'');

const branches = spawnSync('git', ['branch'])
  .stdout
  .toString()
  .split('\n')
  .map(branch => branch.trim())
  .map(branch => branch.replace(/^\* /, ''))
  .filter(branch => branch !== '')
  .map((ref) => {
    const message = chalk.dim.italic(getCommit(ref, '%B'));
    const ago = chalk.dim.yellow(getCommit(ref, '%ar'));
    return {
      name: `${ref}${spaces.slice(0, 30 - ref.length).join('')}${ago} ${message}`,
      value: ref,
    }
  });

inquirer.prompt({
  type: 'checkbox',
  message: 'Select branches to delete',
  name: 'branchesToDelete',
  pageSize: 20,
  choices: branches,
  validate: (answer) => {
    if (answer.length < 1) {
      return 'You must choose at lease one branch';
    }

    return true;
  },
}).then(({ branchesToDelete }) => {
  spawnSync('git', ['branch', '-D'].concat(branchesToDelete), {
    stdio: 'inherit',
  })
});