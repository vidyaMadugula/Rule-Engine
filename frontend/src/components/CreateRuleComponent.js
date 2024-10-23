

import React, { useState } from 'react';
import axios from 'axios';

const CreateRuleComponent = ({ onRuleCreated }) => {
    const [ruleString, setRuleString] = useState('');
    const [rulePreview, setRulePreview] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setRuleString(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
    
        if (!ruleString.trim()) {
            alert('Rule string cannot be empty');
            return;
        }
    
        
        const regex = /^(?:\s*\(\s*[a-zA-Z]+\s*(?:>=|<=|>|<|==|!=)\s*['"]?[a-zA-Z0-9]+['"]?\s*(?:AND|OR)\s*[a-zA-Z]+\s*(?:>=|<=|>|<|==|!=)\s*['"]?[a-zA-Z0-9]+['"]?\s*\)\s*(?:AND|OR)\s*)*(?:\(\s*[a-zA-Z]+\s*(?:>=|<=|>|<|==|!=)\s*['"]?[a-zA-Z0-9]+['"]?\s*(?:AND|OR)?\s*[a-zA-Z]+\s*(?:>=|<=|>|<|==|!=)\s*['"]?[a-zA-Z0-9]+['"]?\s*\)|[a-zA-Z]+\s*(?:>=|<=|>|<|==|!=)\s*['"]?[a-zA-Z0-9]+['"]?)(?:\s*(?:AND|OR)\s*(?:\(\s*[a-zA-Z]+\s*(?:>=|<=|>|<|==|!=)\s*['"]?[a-zA-Z0-9]+['"]?\s*(?:AND|OR)\s*[a-zA-Z]+\s*(?:>=|<=|>|<|==|!=)\s*['"]?[a-zA-Z0-9]+['"]?\s*\)|[a-zA-Z]+\s*(?:>=|<=|>|<|==|!=)\s*['"]?[a-zA-Z0-9]+['"]?)*\s*)$/;

         console.log('Input:', ruleString);
        console.log('Matches regex:', regex.test(ruleString));
    
        if (!regex.test(ruleString)) {
            alert('Invalid rule format. Please ensure it follows the format: attribute operator value (AND/OR condition)');
            return;
        }
    
    
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/create-rule`,
                { ruleString },
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            console.log('Server response:', response.data); // Log the response data
            setRulePreview(response.data.ruleString);
            alert('Rule created successfully!');
            onRuleCreated(response.data); // Notify parent about the new rule
            setRuleString(''); // Clear input after submission
        } catch (error) {
            console.error('Error creating rule:', error);
            setError('An error occurred while creating the rule.');
        }
    };
     

    return (
        <div>
            <h2 className='heading'>Create Rule</h2>
            <form onSubmit={handleSubmit}>
                <label className='fields'>
                    Rule String:
                    <input
                        type="text"
                        value={ruleString}
                        onChange={handleChange}
                        placeholder="e.g., age > 30 AND department = 'HR'"
                        required
                        style={{
                            width: '300px',
                            height: '40px',
                            margin: '10px',
                            padding: '10px',
                            fontSize: '16px',
                        }}
                    />
                </label>
                <button type="submit" style={{
                    width: "220px",
                    height: "60px",
                    marginLeft: "40px",
                }}>Submit</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {rulePreview && (
                <div>
                    <h3 className='fields'>Rule Preview:</h3>
                    <p className='fields'>{rulePreview}</p>
                </div>
            )}
        </div>
    );
};

export default CreateRuleComponent;