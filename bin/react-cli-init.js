#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const program = require('commander');
const inquirer = require('inquirer');
const process = require('process');
const spawn = require('react-dev-utils/crossSpawn');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const download = require('../lib/download');
const generator = require('../lib/generator');

// 命令行交互
program
  .usage('<project-name>')
  .option('-t, --type [repository-type]', 'assign to repository type', 'github')
  .option(
    '-r, --repository [repository]',
    'assign to repository',
    'BozhongFE/react-template'
  )
  .parse(process.argv);

// 根据输入，获取项目名称
const projectName = program.args[0];

if (!projectName) {
  // project-name 必填,相当于执行命令的--help选项
  program.help();
  return;
}

(async () => {
  const filelist = glob.sync('*'); // 遍历当前目录
  const rootName = path.basename(process.cwd()); // 获取执行当前命令的文件夹名称字符串
  let projectRoot = '';

  if (filelist.length) {
    const isHadExit = filelist.some((name) => {
      const fileName = path.resolve(process.cwd(), name);
      const isDir = fs.statSync(fileName).isDirectory();
      return isDir && name === projectName;
    });
    if (isHadExit) {
      console.log(`项目${projectName}已经存在`);
      return;
    }
    projectRoot = !isHadExit ? projectName : '';
  } else if (rootName === projectName) {
    const message =
      '当前目录为空，目录名称和项目名称相同，是否在当前目录创建新项目？';
    const answer = await inquirer.prompt([
      {
        name: 'buildInCurrent',
        type: 'confirm',
        default: true,
        message,
      },
    ]);
    projectRoot = answer.buildInCurrent ? projectName : '.';
  } else {
    projectRoot = projectName;
  }
  try {
    const context = await downloadTemplate(projectRoot);
    const answer = await setInquirer(context);
    const res = await generator(
      answer.metadata,
      answer.target,
      path.parse(context.target).dir
    );
    handle(res);
  } catch (error) {
    console.error(
      logSymbols.error,
      chalk.red(`创建失败：${error.message}    ${error.toString()}`)
    );
  }
})();

async function downloadTemplate(projectRoot) {
  if (projectRoot !== '.') {
    fs.mkdirSync(projectRoot);
  }
  const target = await download(projectRoot, program.type, program.repository);

  return {
    name: projectRoot,
    root: projectRoot,
    target,
  };
}

async function setInquirer(context) {
  const answers = await inquirer.prompt([
    {
      name: 'name',
      message: 'Project name',
      default: context.name,
    },
    {
      name: 'version',
      message: 'Project version',
      default: '1.0.0',
    },
    {
      name: 'description',
      message: 'Project description',
      default: `A project named ${context.name}`,
    },
    {
      name: 'author',
      type: 'string',
      message: 'Author',
    },
    {
      name: 'less',
      type: 'confirm',
      message: 'Use less?',
      default: false,
    },
    {
      name: 'router',
      type: 'confirm',
      message: 'Use react-router?',
      default: false,
    },
    {
      when: (answer) => answer.router,
      name: 'routerHistoryMode',
      type: 'confirm',
      message: 'Use Router History Mode?',
      default: false,
    },
    {
      name: 'redux',
      type: 'confirm',
      message: 'Use redux?',
      default: false,
    },
    {
      name: 'source',
      type: 'list',
      message: 'Output to source repository?',
      choices: ['source', 'poco', 'not use'],
    },
  ]);
  return {
    ...context,
    metadata: { ...answers },
  };
}

async function handle(res) {
  const projectPath = path.resolve(res.dest);

  // let local_package = JSON.parse(
  //   fs.readFileSync(`${projectPath}/package.json`).toString()
  // );

  // 成功用绿色显示，给出积极的反馈
  console.log(logSymbols.success, chalk.green('创建成功'));
  try {
    process.chdir(projectName);
    const proc = spawn.sync('npm', ['install'], { stdio: 'inherit' });
    if (proc.status === 0) {
      console.log(`Success! Created ${projectName} at ${process.cwd()}`);
      console.log('Inside that directory, you can run several commands:');
      console.log();
      console.log(chalk.cyan(`  cd ${projectName}`));
      console.log(chalk.cyan(`  npm run dev`));
      console.log('    Starts the development server.');
      console.log();
      console.log(chalk.cyan(`  npm run build`));
      console.log('    Bundles the app into static files for production.');
    }
  } catch (err) {
    console.error(`chdir: ${err}`);
  }
}
