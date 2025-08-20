import { useState } from 'react';
       import axios from 'axios';
       import { useNavigate } from 'react-router-dom';

       function Signup() {
         const [username, setUsername] = useState('');
         const [password, setPassword] = useState('');
         const navigate = useNavigate();

         const handleSignup = async () => {
           try {
             await axios.post('http://localhost:3000/signup', { username, password });
             alert('User created');
             navigate('/signin');
           } catch (err) { alert(err.response?.data || 'Error'); }
         };

         return (
           <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
             <h2>Signup</h2>
             <input
               type="text"
               placeholder="Username"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
             />
             <input
               type="password"
               placeholder="Password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
             />
             <button onClick={handleSignup} style={{ padding: '8px 16px' }}>Signup</button>
           </div>
         );
       }

       export default Signup;
