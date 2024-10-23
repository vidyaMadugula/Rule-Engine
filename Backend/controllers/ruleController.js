const Node = require('../models/Node');
const Rule = require('../models/Rule');

const parseRuleStringToAST = (ruleString) => {
    const rules = [];
    let match;

    // Use regex to find all conditions and operators, including parentheses
    const rulePattern = /(\()|(\))|([a-zA-Z]+)\s*(>|<|>=|<=|==|!=)\s*["']?([a-zA-Z0-9]+)["']?\s*(AND|OR)?/g;

    while ((match = rulePattern.exec(ruleString)) !== null) {
        if (match[1]) {
            rules.push('('); // Add opening parenthesis to AST
        } else if (match[2]) {
            rules.push(')'); // Add closing parenthesis to AST
        } else {
            const rule = {
                attribute: match[3],
                operator: match[4],
                value: match[5]
            };
            rules.push(rule);

            // Check if there's a logical operator after the condition
            const logicalOperator = match[6];
            if (logicalOperator) {
                rules.push({ logicalOperator }); // Store logical operators separately if needed
            }
        }
    }

    if (rules.length === 0) {
        throw new Error('No valid conditions found.');
    }

    return rules;
};





// Combine multiple ASTs
// Combine multiple ASTs with optimization to reduce redundancy
const combineASTs = (rules) => {
    const uniqueRules = [...new Set(rules)];
    if (uniqueRules.length === 0) return null; // Early return if no rules to combine
    
    const combinedAST = { type: 'operator', operator: 'OR', left: null, right: null };
    uniqueRules.forEach((ruleString, index) => {
        const ast = parseRuleStringToAST(ruleString);
        if (index === 0) {
            combinedAST.left = ast;
        } else {
            // Combine more intelligently than just assigning right
            combinedAST.right = { type: 'operator', operator: 'OR', left: combinedAST.right || ast, right: ast };
        }
    });

    return combinedAST;
};



const createRule = async (req, res) => {
    console.log("Entered createRule endpoint");
    console.log("Received request to create rule:", req.body); // Check the body

    try {
        const { ruleString } = req.body;

        if (!ruleString) {
            throw new Error('Rule string is required');
        }

        let astRoot;
        try {
            astRoot = parseRuleStringToAST(ruleString); // Parse rule string to AST
        } catch (parseError) {
            console.error('Error parsing rule string:', parseError.message);
            return res.status(400).json({ error: 'Invalid rule string', details: parseError.message });
        }

        const newRule = new Rule({ ruleString, astRoot });
        await newRule.save();

        res.status(200).json(newRule);
    } catch (err) {
        console.error('Error in createRule controller:', err.message);
        res.status(400).json({ error: err.message });
    }
};

const evaluateCondition = (attribute, operator, value, data) => {
    const actualValue = data[attribute];
    
    // Handle numeric comparison
    if (!isNaN(parseFloat(actualValue))) {
        const comparisonValue = parseFloat(value);
        console.log(`actualValue: ${actualValue}, comparisonValue: ${comparisonValue}`);
        
        switch (operator) {
            case '>':
                return parseFloat(actualValue) > comparisonValue;
            case '<':
                return parseFloat(actualValue) < comparisonValue;
            case '>=':
                return parseFloat(actualValue) >= comparisonValue;
            case '<=':
                return parseFloat(actualValue) <= comparisonValue;
            case '==':
                return parseFloat(actualValue) == comparisonValue; // Loose equality check
            case '!=':
                return parseFloat(actualValue) != comparisonValue; // Loose inequality check
            default:
                throw new Error(`Unknown operator: ${operator}`);
        }
    } else {
        // Handle string comparison
        const stringValue = actualValue.trim(); // Trim spaces for string attributes
        const trimmedValue = value.trim(); // Trim spaces for the value being compared
        console.log(`actualValue: ${stringValue}, comparisonValue: ${trimmedValue}`);
        return stringValue === trimmedValue; // Use strict equality check for strings
    }
};

const evaluateAST = (ast, data) => {
    console.log('Received data for evaluation:', data); // Log the data received

    const stack = []; // Stack to handle parentheses and precedence
    let currentLogicalOperator = 'AND'; // Default to AND logic
    let tempResult = null; // To store intermediate results

    for (let i = 0; i < ast.length; i++) {
        const node = ast[i];

        if (node.attribute) {
            const attribute = node.attribute;
            const operator = node.operator;
            const value = node.value;

            // Evaluate the condition
            const conditionResult = evaluateCondition(attribute, operator, value, data);
            console.log(`Evaluating ${attribute} ${operator} ${value}: ${conditionResult}`);

            if (tempResult === null) {
                tempResult = conditionResult;
            } else {
                // Apply the current logical operator to combine results
                if (currentLogicalOperator === 'OR') {
                    tempResult = tempResult || conditionResult;
                } else if (currentLogicalOperator === 'AND') {
                    tempResult = tempResult && conditionResult;
                }
            }
        } else if (node.logicalOperator) {
            currentLogicalOperator = node.logicalOperator; // Update logical operator
        } else if (node === '(') {
            // Push the current result and logical operator to the stack
            stack.push({ result: tempResult, operator: currentLogicalOperator });
            tempResult = null; // Reset result for the group
            currentLogicalOperator = 'AND'; // Default to AND inside parentheses
        } else if (node === ')') {
            // Pop the stack and combine the result with the current result
            const { result: prevResult, operator } = stack.pop();

            // Combine the result of the parentheses with what was before it
            if (operator === 'OR') {
                tempResult = prevResult || tempResult;
            } else if (operator === 'AND') {
                tempResult = prevResult && tempResult;
            }
        }
    }

    // The final result after processing the entire AST
    console.log(`Final evaluation result: ${tempResult}`);
    return tempResult;
};



const validAttributes = ['age', 'department', 'salary', 'experience'];


const validateAttributes = (ruleString, data) => {
    const conditions = ruleString.split(/ AND | OR /);
    conditions.forEach((condition) => {
        const match = condition.match(/(\w+)\s*(>|<|=)\s*([\w\s]+)/);
        if (match) {
            const attribute = match[1].trim();
            if (!validAttributes.includes(attribute)) {
                throw new Error(`Invalid attribute used in rule: ${attribute} is not allowed`);
            }
            if (!(attribute in data)) {
                throw new Error(`Attribute "${attribute}" is missing from data.`);
            }
        } else {
            throw new Error(`Condition "${condition}" is not valid.`);
        }
    });
};






// API: Combine Rules
const combineRules = async (req, res) => {
    try {
        const { rules } = req.body; // List of rule strings
        const combinedAST = combineASTs(rules); // Combine rules into a single AST
        res.status(200).json(combinedAST);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const evaluateRule = async (req, res) => {
    console.log("Received request to evaluate rule:", req.body);
    console.log("Request data:", req.body.data);
    
    // Ensure that the AST is being parsed correctly from the incoming request
    let ast = req.body.ast;

    // Check if AST is an object and has a `value` property
    if (ast && typeof ast === 'object' && ast.value) {
        ast = parseRuleStringToAST(ast.value); // Parse it into an array if it's a string
    }

    console.log("Parsed AST:", ast);

    try {
        const result = evaluateAST(ast, req.body.data); // Pass the array of operands to evaluateAST
        res.status(200).json({ result });
    } catch (err) {
        console.error(err); // Log any errors
        res.status(400).json({ error: err.message });
    }
};






const getRuleById = async (req, res) => {
    try {
        const rule = await Rule.findById(req.params.id); // Fetch the rule by ID
        if (!rule) {
            return res.status(404).json({ error: 'Rule not found' });
        }
        res.status(200).json(rule); // Send the rule (including the AST) in response
    } catch (err) {
        res.status(500).json({ error: err.message }); // Handle errors
    }
};

// API: Modify an existing rule

const modifyRule = async (req, res) => {
    try {
        const { ruleId, newRuleString, data } = req.body; // Ensure data is included
        if (!data) {
            return res.status(400).json({ error: 'Data object is required.' });
        }
        const rule = await Rule.findById(ruleId);
        if (!rule) {
            return res.status(404).json({ error: 'Rule not found' });
        }

        validateAttributes(newRuleString, data); // Validate attributes before parsing
        const newAST = parseRuleStringToAST(newRuleString); // Parse the new rule
        rule.ruleString = newRuleString; // Update the rule string
        rule.astRoot = newAST; // Update the AST root
        await rule.save(); // Save changes
        res.status(200).json({ message: 'Rule updated successfully', rule });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const getAllRules = async (req, res) => {
    try {
        const rules = await Rule.find(); // Fetch all rules from the database
        if (!rules.length) {
            return res.status(404).json({ message: 'No rules found' }); // Handle no rules case
        }
        const rulesFormatted = rules.map(rule => ({
            id: rule._id,
            ruleString: rule.ruleString // Adjust this if your field name is different
        }));
        res.status(200).json(rulesFormatted); // Send the rules in response
    } catch (err) {
        res.status(500).json({ error: err.message }); // Handle errors
    }
};


module.exports = { createRule, combineRules, evaluateRule, getRuleById, modifyRule,getAllRules };