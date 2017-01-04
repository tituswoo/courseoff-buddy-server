'use strict';

const Xray = require('x-ray');
const x = Xray();

x(
  'http://www.irp.gatech.edu/reports/grade_distributionsmry.php', 
  {
    terms: x(['#sv_TERM_CODE[]'])
  }
)((error, obj) => {
  console.log(obj);
});