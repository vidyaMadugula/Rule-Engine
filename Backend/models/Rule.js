const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
    ruleString: { type: String, required: true },  // The rule string like "age > 30 AND salary > 50000"
    astRoot: { type: mongoose.Schema.Types.Mixed } // The AST representation of the rule
});

const Rule = mongoose.model('Rule', ruleSchema);
module.exports = Rule;