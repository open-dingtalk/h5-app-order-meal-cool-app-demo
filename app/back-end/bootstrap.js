const WebFramework = require('@midwayjs/web').Framework;
const web = new WebFramework().configure({
  port: 7002,
});

const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.load(web).run();
