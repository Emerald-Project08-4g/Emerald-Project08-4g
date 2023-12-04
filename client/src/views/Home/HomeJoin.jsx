import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import './Home.less';
import { getStudents, getClassroom } from '../../Utils/requests';

export default function HomeJoin(props) {
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();
  const handleLogin = () => {
    setLoading(true);

    getClassroom(joinCode).then((res) => {
      if (res.data) {
        setLoading(false);
        localStorage.setItem('join-code', joinCode);
        navigate('/login');
      } else {
        setLoading(false);
        console.log("join code: " + joinCode);
        message.error('Join failed. Please input a valid join code.');
      }
    });
  };

  return (
    <div
      id='box'
      onKeyPress={(e) => {
        if (e.key === 'Enter') handleLogin();
      }}
    >
      <input
        type='text'
        value={joinCode}
        placeholder='Join Code'
        onChange={(e) => setJoinCode(e.target.value)}
      />
      <input
        type='button'
        value={loading ? 'Loading...' : 'Join'}
        onClick={handleLogin}
        disabled={loading}
      />
    </div>
  );
}
