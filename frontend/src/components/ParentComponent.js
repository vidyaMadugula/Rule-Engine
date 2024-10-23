import React, { useState, useEffect } from 'react';
import CreateRuleComponent from './CreateRuleComponent';
import EvaluateRuleComponent from './EvaluateRuleComponent';
import axios from 'axios';

const ParentComponent = () => {
    const [allRules, setAllRules] = useState([]);

    const fetchAllRules = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/rules`);
            setAllRules(response.data);
        } catch (error) {
            console.error('Error fetching all rules:', error);
        }
    };

    useEffect(() => {
        fetchAllRules(); // Fetch rules on mount
    }, []);

    const handleRuleCreated = (newRule) => {
        setAllRules((prevRules) => [...prevRules, newRule]); // Update rules with the new rule
    };

    return (
        <div>
            <CreateRuleComponent onRuleCreated={handleRuleCreated} /> {/* Ensure this line is correct */}
            <EvaluateRuleComponent allRules={allRules} />
        </div>
    );
};

export default ParentComponent;


