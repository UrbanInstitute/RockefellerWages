var names = {
  "wages" : "wage_adj",
  "employment" : "pop_pct"
};

function genFilename(industry, variable) {
  return "./data/compressed/IND_" + industry + "_VAR_" + names[variable] + '.csv';
}

module.exports = genFilename;
