import React, { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import './Home.less';
import { getStudents, postJoin, addGoogleStudent, getAllClassrooms } from '../../Utils/requests';
import { postUser, setUserSession, removeUserSession } from '../../Utils/AuthRequests';
import {GoogleLogin} from 'react-google-login';
import {gapi} from 'gapi-script';

const CLIENT_ID = "296846904571-jiau68kb1m5ovbjodmho8ei6fe69qbkv.apps.googleusercontent.com";
const API_KEY = "AIzaSyBH4GlSHNm7zUcrcINb-uKI82l36vbD4jA";
const SCOPES = "https://www.googleapis.com/auth/drive";

export default function HomeJoin(props) {
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [studentList, setStudentList] = useState([]);
  const [classroomList, setClassroomList] = useState([]);
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

  //connect to google API
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

  //get a list of all students in a classroom according to the join code
  useEffect(() => {
    getStudents(joinCode).then((res) => {
      if (res.data) {
        setStudentList(res.data);
      } /*else {
        message.error(res.err);
      }*/
    });
  }, [joinCode]);

  //get all classrooms, so we can return the one the join code is for
  useEffect(() => {
    getAllClassrooms().then((res) => {
      if(res.data) {
        setClassroomList(res.data);
      } else {
        message.error(res.err);
      }
    });
  }, [joinCode]);

  const handleStudentGoogleLogin = async (acct) => {
    setLoading(true);
    let ids = [];
    let googleId = acct.googleId;
    let firstName = acct.profileObj.givenName + ' ';
    let lastName = acct.profileObj.familyName + '.'; //convert it to a string because it's not already somehow?
    let name = firstName + lastName.charAt(0) + '.'; //get the google profile's name to search the classroom for it
    let character = "Char";
    let canLogin = false;
    //console.log(name);

    console.log(studentList.length);
    //if the name is found, return the corresponding id, then log in.
    for(let i = 0; i < studentList.length; i++)
    {
      //console.log(studentList[i].name + ' ' + googleId); 
      //due to limited functionality of studentList, it cannot provide googleId to be checked, so just names will be checked for now.

      if(studentList[i].name === name)
      {
        ids[0] = studentList[i].id;
        console.log(joinCode + ' ' + ids);
        
        //attempt to log the user in, otherwise return a null value
        const res = await postJoin(joinCode, ids)
        if(res.data)
        {
          console.log(res);
          setLoading(false);
          setUserSession(res.data.jwt, JSON.stringify(res.data.students));
          navigate('/student');
        }
        canLogin = true;
        break;
      }
    }

    //handle if a new account should be made if null
    if(!canLogin)
    {
      setLoading(false);
      message.error('Google account does not exist, creating one for you. Please login again.'); //student creation happens here
      let classroomId = null;  //get the classroom id
      for(let j = 0; j < classroomList.length; j++)
      {
        if(joinCode === classroomList[j].code) //if found, set the classroom & id
        {
          classroomId = classroomList[j].id;
        }
      }

      let newStudent = null;
      let body = { identifier: 'teacher', password: 'easypassword' };
      await postUser(body)
      .then((response) => {             //due to database limitations, temporarily login as a classroom manager
        setUserSession(response.data.jwt, JSON.stringify(response.data.user));  
        newStudent = addGoogleStudent(name, character, googleId, classroomId);  //then create a student with info
        removeUserSession();            //log out of the classroom manager so that the student can then login.
      });
      console.log(newStudent);          //output the new student object to the console to confirm it was created correctly.
    }
  };
  
  const onSucc = (res) => {
    console.log(res); //if google auth was successful, login
    handleStudentGoogleLogin(res);
  };
  
  const onFail = (res) => {
    console.log(res); //if not successful, do nothing
  };
  
  //login component to be returned to the website
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
