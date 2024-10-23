const { expect } = require('chai');
const { parseRuleStringToAST, evaluateAST } = require('../controllers/ruleController.js'); 

describe('Rule Engine Tests', () => {
    it('should correctly parse a complex rule string to AST', () => {
        const ruleString = "(age > 30 AND (department = 'Sales' OR department = 'Marketing'))";
        const ast = parseRuleStringToAST(ruleString);
        expect(ast).to.have.property('type', 'operator');
        expect(ast).to.have.property('operator', 'AND');
        expect(ast.left).to.have.property('value', 'age > 30');
        expect(ast.right).to.have.property('type', 'operator');
        expect(ast.right).to.have.property('operator', 'OR');
    });

    it('should correctly evaluate nested conditions in the AST against user data', () => {
        const ast = {
            type: 'operator',
            operator: 'AND',
            left: { type: 'operand', value: 'age > 30' },
            right: {
                type: 'operator',
                operator: 'OR',
                left: { type: 'operand', value: "department = 'Sales'" },
                right: { type: 'operand', value: "department = 'Marketing'" }
            }
        };
        const data = { age: 35, department: 'Marketing' };
        const result = evaluateAST(ast, data);
        expect(result).to.be.true;
    });

    // Additional tests for performance and optimization
    it('should efficiently evaluate large rule sets', () => {
        // Simulate large rules and check for performance metrics
    });
});