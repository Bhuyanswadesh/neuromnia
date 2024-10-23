import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const [domain, setDomain] = useState('');
  const [level, setLevel] = useState('');
  const [response, setResponse] = useState([]);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState(null);
  const [domains, setDomains] = useState([]); // State to store fetched domains
  const [levels, setLevels] = useState([]); // State to store fetched levels

  const validateMessage = () => {
    const error = {};
    if (!message) {
      error.message = 'Message Type is required!';
    }
    if (message === "Lookup Milestone" && !code) {
      error.code = 'Please enter a milestone!';
    }
    if (message === "List Domain") {
      if (!domain) {
        error.domain = 'Please select a domain!';
      }
      if (!level) {
        error.level = 'Please select a level!';
      }
    }

    setErrors(error);
    return Object.keys(error).length > 0;

  }
  const sendRequest = async () => {
    if (validateMessage()) {
      return;
    }
    const requestBody = {
      message: message,
      code,
      domain,
      level,
    };

    const res = await fetch('http://localhost:3001/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();
    if (res.ok) {
      console.log({ data })
      setResponse(data);
      setError(''); // Clear error on successful response
    } else {
      setResponse([]);
      setError(`Error: ${data.error}`);
    }
  };

  const fetchDomainsAndLevels = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/domainsAndLevels', {
        method: 'GET',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error('Failed to fetch domains and levels');
      }
      setDomains(data.domains);
      setLevels(data.levels);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDomainsAndLevels();
  }, []);

  const appStyles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px',
      maxWidth: '600px',
      margin: 'auto',
    },
    header: {
      fontSize: '2rem',
      color: '#333',
      marginBottom: '20px',
    },
    formControl: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '20px',
    },
    input: {
      padding: '10px',
      margin: '10px 0',
      width: '80%',
      fontSize: '1rem',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    select: {
      padding: '10px',
      margin: '10px 0',
      width: '80%',
      fontSize: '1rem',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    button: {
      backgroundColor: '#28a745',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '1rem',
    },
    resetbutton: {
      backgroundColor: 'rgb(203 25 58)',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '1rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
    },
    th: {
      borderBottom: '2px solid #ddd',
      padding: '10px',
      backgroundColor: '#f8f8f8',
    },
    td: {
      borderBottom: '1px solid #ddd',
      padding: '10px',
      textAlign: 'left',
    },
    flexbox: {
      display:"flex",
      justifyContent:"center",
      allignItems:"center",
      gap:5
    },
  };
  const handleChangeMessage = (e) => {
    setErrors(null);
    setMessage(e.target.value);
  }
  const handleReset= () => {
    setErrors(null);
    setMessage("");
    setCode("");
    setDomain("");
    setLevel("");
  }
  return (
    <div style={appStyles.container}>
      <h1 style={appStyles.header}>Milestone Lookup</h1>

      <div style={appStyles.formControl}>
        <label>Message Type:</label>
        <select
          style={appStyles.select}
          value={message}
          onChange={handleChangeMessage}
        >
          <option value="">Select Message Type</option>
          <option value="Lookup Milestone">Lookup Milestone</option>
          <option value="List Domain">List Domain</option>
        </select>
        {
          errors?.message && <p style={{ color: 'red', margin: '10px 0' }}>{errors?.message}</p>
        }
      </div>

      {message ?
        message === 'Lookup Milestone' ? (
          <div style={appStyles.formControl}>
            <input
              style={appStyles.input}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter milestone code"
            />
            {
              errors?.code && <p style={{ color: 'red', margin: '10px 0' }}>{errors?.code}</p>
            }
          </div>
        ) : (
          <div style={appStyles.formControl}>
            <label>Domain:</label>
            <select
              style={appStyles.select}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              <option value="">
                Select a domain
              </option>
              {domains.map((domainOption, index) => (
                <option key={index} value={domainOption}>
                  {domainOption}
                </option>
              ))}
            </select>

            {
              errors?.domain && <p style={{ color: 'red', margin: '10px 0' }}>{errors?.domain}</p>
            }

            <label>Level:</label>
            <select
              style={appStyles.select}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="">
                Select a level
              </option>
              {levels.map((levelOption, index) => (
                <option key={index} value={levelOption}>
                  {levelOption}
                </option>
              ))}
            </select>
            {
              errors?.level && <p style={{ color: 'red', margin: '10px 0' }}>{errors?.level}</p>
            }
          </div>
        )
        :
        <p>No Milestone selected</p>
      }
      <div style={appStyles.flexbox}>
      <button
        style={appStyles.button}
        onClick={sendRequest}
      >
        Send Request
      </button>
      <button
        style={appStyles.resetbutton}
        onClick={handleReset}
      >
        Reset
      </button>
      </div>

      <h2>Response</h2>

      {response.length > 0 ? (
        <table style={appStyles.table}>
          <thead>
            <tr>
              <th style={appStyles.th}>Skill Code</th>
              <th style={appStyles.th}>Level</th>
              <th style={appStyles.th}>Domain</th>
              <th style={appStyles.th}>Milestone</th>
            </tr>
          </thead>
          <tbody>
            {response.map((item, index) => (
              <tr key={index}>
                <td style={appStyles.td}>{item['Skill_Code']}</td>
                <td style={appStyles.td}>{item.Level}</td>
                <td style={appStyles.td}>{item.Domain}</td>
                <td style={appStyles.td}>{item.Milestone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <p>No data found</p>
      )}
    </div>
  );
}

export default App;
