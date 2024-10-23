const express = require('express');
const { createRule, combineRules, evaluateRule,getRuleById ,modifyRule,getAllRules} = require('../controllers/ruleController');
const router = express.Router();

// router.post('/create-rule', createRule);
router.post('/create-rule', (req, res, next) => {
    console.log('Route /create-rule hit');
    next(); // Pass control to createRule function
}, createRule);

router.post('/combine-rules', combineRules);
router.post('/evaluate-rule', evaluateRule);
router.get('/rule/:id', getRuleById);
router.put('/modify-rule', modifyRule);
router.get('/rules', getAllRules); // New endpoint for getting all rules


module.exports = router;