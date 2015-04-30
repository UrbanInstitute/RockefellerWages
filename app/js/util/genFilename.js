var names = {
  "wages" : "avg_wkly_wage",
  "number" : "qtr_emp_lvl"
};

function genFilename(industry, variable) {
  return "./data/compressed/IND_" + industry + "_VAR_" + names[variable] + '.csv';
}

module.exports = genFilename;
