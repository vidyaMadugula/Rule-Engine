


import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EvaluateRuleComponent = ({ allRules }) => {
    const [data, setData] = useState({ age: '', department: '', salary: '', experience: '' });
    const [result, setResult] = useState(null);
    const [ruleId, setRuleId] = useState('');
    const [ast, setAst] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAllRules, setShowAllRules] = useState(false); // State to manage showing all rules

    useEffect(() => {
        if (ruleId) {
            fetchRule();
        }
    }, [ruleId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const fetchRule = async () => {
        if (!ruleId) return;
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/rule/${ruleId}`);
            setAst(response.data.astRoot);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error fetching rule:', error);
        }
    };

    const evaluateRule = async () => {
        if (!ast) {
            alert('AST not found. Please fetch the rule first.');
            return;
        }

        setResult(null); // Clear previous result before evaluating
        console.log('Data being sent for evaluation:', data);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/evaluate-rule`, { ast, data });
            setResult(response.data.result ? 'User is eligible' : 'User is not eligible');
        } catch (error) {
            console.error('Error evaluating rule:', error);
        }
    };

    const inputStyle = {
        width: '300px',
        height: '20px',
        margin: '10px',
        padding: '10px',
        fontSize: '16px',
    };

    const buttonStyle = {
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
    };

    return (
        <div>
            <h2 className='heading'>Evaluate Rule</h2>
            <div className='container'>
            <div>
                <label className='fields' style={{marginRight:"50px",}}>Select Rule:</label>
                <select
                    value={ruleId}
                    style={{ width: '400px', height: '40px', margin: '10px' }}
                    onChange={(e) => setRuleId(e.target.value)}
                >
                    <option value="">select rule</option>
                    {allRules.map(rule => (
                        <option key={`${rule.id}-${rule.ruleString}`} value={rule.id}>
                            {rule.ruleString}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className='fields' style={{marginRight:"97px",}}>Age: </label>
                <input type="number" name="age" value={data.age} onChange={handleInputChange} style={inputStyle} />
            </div>
            <div>
                <label className='fields' style={{marginRight:"43px",}}>Department: </label>
                <input type="text" name="department" value={data.department} onChange={handleInputChange} style={inputStyle} />
            </div>
            <div>
                <label className='fields' style={{marginRight:"85px",}}>Salary: </label>
                <input type="number" name="salary" value={data.salary} onChange={handleInputChange} style={inputStyle} />
            </div>
            <div>
                <label className='fields' style={{marginRight:"50px",}}>Experience: </label>
                <input type="number" name="experience" value={data.experience} onChange={handleInputChange} style={inputStyle} />
            </div>
            </div>

            <button onClick={evaluateRule} disabled={loading} style={{
                width:"300px",
                height:"40px",
                marginleft:"40px",
                marginRight:"1200px",
                marginBottom:"20px",
            }}>Evaluate Rule</button>
            {loading && <p>Loading...</p>}
            {result && <p>{result}</p>}

            {ast && (
                <div>
                    <h3 className='heading'>Fetched Rule AST:</h3>
                    <pre>{JSON.stringify(ast, null, 2)}</pre>
                </div>
            )}

            {/* Show All Rules Button */}
            <button onClick={() => setShowAllRules(!showAllRules)} style={{
                width:"300px",
                height:"40px",
                marginleft:"40px",
                marginRight:"1200px",
                marginBottom:"20px",
            }} >
                {showAllRules ? 'Hide All Rules' : 'Show All Rules'}
            </button>

            {/* Display All Rules */}
            {showAllRules && (
                <div>
                    <h3 className='heading'>All Rules:</h3>
                    <ul>
                        {allRules.map(rule => (
                            <li key={rule.id}>
                                {rule.ruleString}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default EvaluateRuleComponent;


