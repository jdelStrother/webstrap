#!/usr/bin/env node

const program = require('commander')
const fs = require('fs')
const childProcess = require('child_process')
const ncp = require('ncp')
const path = require('path')
const replaceStream = require('replacestream')
const source = path.join(__dirname, 'template')

var projectName
program
  .arguments('<projectname>', 'directory/project-name to create')
  .action(function(p) { projectName = p })
  .parse(process.argv)

if (!projectName) {
  throw new Error('Please supply a project name')
}
createProject(projectName)

function createProject(name) {
  fs.mkdir(name, function(err) {
    if (err) {
      throw new Error(`Couldn't create ${name}: ${err}`)
    }

    ncp(source, name, {stopOnErr: true, transform: nameReplacer(name)}, function(err) {
      if (err) {
        throw new Error(`Couldn't copy template: ${err}`)
      }

      process.chdir(name)
      childProcess.execSync('git init .')
      childProcess.execSync('npm init -y')
      console.log('Installing packages...')
      childProcess.execSync('npm install --save-dev webpack webpack-dev-server babel-eslint eslint babel-loader babel-core babel-preset-es2015')
      console.log('Done!')
    })
  })
}

function nameReplacer(name) {
  return function(src, dst, file) {
    src.pipe(replaceStream(/\$PROJECTNAME/, name)).pipe(dst)
  }
}
