#!/usr/bin/env node

'use strict';

const commander = require('commander');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const packageJson = require('./package.json');

const HELP_MESSAGE = 'Usage: npx create-yisusapp <project-dirname>';
const INIT_MESSAGE = '-- Creating an awesome YisusApp --';
const CREATE_MESSAGE = 'Creating project...';
const CREATE_ERROR_MESSAGE = 'An error occurred while creating project';
const DEPS_MESSAGE = 'Installing dependencies...';
const DEPS_ERROR_MESSAGE = 'An error occurred while installing dependencies';
const RUN_MESSAGE = 'Building and running app...';
const RUN_ERROR_MESSAGE = 'An error occurred while building and running project';
const FINISH_MESSAGE = '-- YisusApp created successfully! --';

const copyContent = (from, to) => {
  const content = fs.readdirSync(from);

  content.forEach((file) => {
    const fromPath = from + '/' + file;
    const toPath = to + '/' + file;

    if (fs.statSync(fromPath).isDirectory()) {
      fs.mkdirSync(toPath);
      copyContent(fromPath, toPath);
    } else {
      fs.writeFileSync(toPath, fs.readFileSync(fromPath));
    }
  });
}

const createProject = (projectDirname) => {
  if (fs.existsSync(projectDirname)) {
    console.error(CREATE_ERROR_MESSAGE);
    process.exit(1);
  }
  fs.mkdirSync(projectDirname);
  copyContent(path.resolve(__dirname, 'template'), projectDirname);
};

const installDeps = (projectDirname) => {
  shell.cd(projectDirname);
  const result = shell.exec('yarn install');
  if (result.code !== 0) {
    console.error(DEPS_ERROR_MESSAGE);
    process.exit(1);
  }
}

const runProject = (projectDirname) => {
  shell.cd(projectDirname);
  const result = shell.exec('yarn start');
  if (result.code !== 0) {
    console.error(RUN_ERROR_MESSAGE);
    process.exit(1);
  }
}

(function() {
  let projectDirname;

  new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments('<project-dirname>')
    .action((dirname) => projectDirname = dirname)
    .on('--help', () => console.log(HELP_MESSAGE))
    .parse(process.argv);

  if (!projectDirname) {
    console.error(HELP_MESSAGE);
    process.exit(1);
  }

  console.log(INIT_MESSAGE);

  console.log(CREATE_MESSAGE);
  createProject(projectDirname);

  console.log(DEPS_MESSAGE);
  installDeps(projectDirname);

  console.log(RUN_MESSAGE);
  runProject(projectDirname);

  console.log(FINISH_MESSAGE);

  process.exit(0);
})();