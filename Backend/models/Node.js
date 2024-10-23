const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
    type: { type: String, required: true },      // operator or operand
    operator: { type: String },                  // AND, OR (for operators)
    left: { type: mongoose.Schema.Types.Mixed }, // reference to left Node
    right: { type: mongoose.Schema.Types.Mixed },// reference to right Node
    value: { type: String }                      // condition for operands (e.g., "age > 30")
});

const Node = mongoose.model('Node', nodeSchema);
module.exports = Node;
