import { useState, useEffect } from 'react';
       import axios from 'axios';
       import { useNavigate } from 'react-router-dom';

       function Dashboard() {
         const [news, setNews] = useState([]);
         const [topics, setTopics] = useState([]);
         const [newTopic, setNewTopic] = useState('');
         const navigate = useNavigate();

         useEffect(() => {
           const token = localStorage.getItem('token');
           if (!token) navigate('/signin');
           axios.get('http://localhost:3000/topics', { headers: { Authorization: `Bearer ${token}` } })
             .then(res => setTopics(res.data))
             .catch(() => navigate('/signin'));
           axios.get('http://localhost:3000/news', { headers: { Authorization: `Bearer ${token}` } })
             .then(res => setNews(res.data));
         }, [navigate]);

         const handleSaveTopics = async () => {
           const token = localStorage.getItem('token');
           await axios.post('http://localhost:3000/topics', { topics: [...topics, newTopic] }, {
             headers: { Authorization: `Bearer ${token}` }
           });
           setTopics([...topics, newTopic]);
           setNewTopic('');
         };

         const handleLogout = () => {
           localStorage.removeItem('token');
           navigate('/signin');
         };

         return (
           <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
             <h2>Dashboard</h2>
             <button onClick={handleLogout} style={{ padding: '8px 16px', marginBottom: '20px' }}>Logout</button>
             <div>
               <h3>Select Topics</h3>
               <input
                 type="text"
                 placeholder="Add topic (e.g., tech)"
                 value={newTopic}
                 onChange={(e) => setNewTopic(e.target.value)}
                 style={{ padding: '8px', marginRight: '10px' }}
               />
               <button onClick={handleSaveTopics} style={{ padding: '8px 16px' }}>Add Topic</button>
               <p>Topics: {topics.join(', ')}</p>
             </div>
             <h3>Latest News</h3>
             {news.map((article, i) => (
               <div key={i} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                 <h4>{article.title}</h4>
                 <p>{article.description}</p>
                 <a href={article.url} target="_blank" rel="noopener noreferrer">Read more</a>
               </div>
             ))}
           </div>
         );
       }

       export default Dashboard;
