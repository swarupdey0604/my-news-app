import { useState } from 'react';
       import axios from 'axios';
       import { useNavigate } from 'react-router-dom';

       function Signin() {
         const [username, setUsername] = useState('');
         const [password, setPassword] = useState('');
         const navigate = useNavigate();

         const handleSignin = async () => {
           try {
             const res = await axios.post('http://localhost:3000/signin', { username, password });
             localStorage.setItem('token', res.data.token);
             navigate('/dashboard');
           } catch (err) { alert(err.response?.data || 'Error'); }
         };

         return (
           <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
             <h2>Signin</h2>
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
             <button onClick={handleSignin} style={{ padding: '8px 16px' }}>Signin</button>
           </div>
         );
       }

       export default Signin;
