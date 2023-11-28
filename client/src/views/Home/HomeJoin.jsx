import React, { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import './Home.less';
import { getStudents, postJoin } from '../../Utils/requests';
import { setUserSession } from '../../Utils/AuthRequests';
import {GoogleLogin} from 'react-google-login';
import {gapi} from 'gapi-script';

const CLIENT_ID = "296846904571-jiau68kb1m5ovbjodmho8ei6fe69qbkv.apps.googleusercontent.com";
const API_KEY = "AIzaSyBH4GlSHNm7zUcrcINb-uKI82l36vbD4jA";
const SCOPES = "https://www.googleapis.com/auth/drive";

export default function HomeJoin(props) {
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [studentList, setStudentList] = useState([]);
  const navigate = useNavigate();
  
  const handleLogin = () => {
    setLoading(true);

    getStudents(joinCode).then((res) => {
      if (res.data) {
        setLoading(false);
        localStorage.setItem('join-code', joinCode);
        navigate('/login');
      } else {
        setLoading(false);
        message.error('Join failed. Please input a valid join code.');
      }
    });
  };

  useEffect(() => {
    function start() {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES
      })
    };
  
    gapi.load('client:auth2', start);
  });

  useEffect(() => {
    getStudents(2017).then((res) => { //hard coded for now, this is used to get the list of students.
      if (res.data) {
        setStudentList(res.data);
      } else {
        message.error(res.err);
      }
    });
  }, [joinCode]);

  const handleStudentGoogleLogin = async (acct) => {
    setLoading(true);
    let ids = [];
    ids[0] = 46;
    //console.log(acct.googleId);
    //ids[0] = acct.googleId;
    let joinCode = 2017;
    //console.log(ids);
    let res = null;
    for(let i = 0; i < studentList.length; i++)
    {
      console.log(studentList[i].id);
      if(ids[0] === studentList[i].id)
      {
        res = await postJoin(joinCode, ids);
      }
    }

    if (res.data) {
      setLoading(false);
      setUserSession(res.data.jwt, JSON.stringify(res.data.students));
      navigate('/student');
    }
    else {
      setLoading(false);
      message.error('Google account does not exist, creating one for you. Please login again.'); //student creation happens here
    }
  };
  
  const onSucc = (res) => {
    console.log(res);
    handleStudentGoogleLogin(res);
  };
  
  const onFail = (res) => {
    console.log(res);
  };
  
  function Login() {
    return (
        <div id="signInButton">
          <GoogleLogin
            className="googleButton"
            clientID={CLIENT_ID}
            buttonText="Google Sign-up"
            onSuccess={onSucc}
            onFailure={onFail}
            cookiePolicy={'single_host_origin'}
            isSignedIn={false}
          />
        </div>
    )
  }

  return (
    <div>
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
      <Login/>
    </div>
  );
}
