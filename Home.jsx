import React, { useContext, useEffect, useState } from 'react';
import '../styles/home.css';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { CgEnter } from 'react-icons/cg';
import { RiVideoAddFill } from 'react-icons/ri';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Dropdown from 'react-bootstrap/Dropdown';
import Card from 'react-bootstrap/Card';

import Groups2Icon from '@mui/icons-material/Groups2';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import BoltIcon from '@mui/icons-material/Bolt';

import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

const Home = () => {
  const [roomName, setRoomName] = useState('');
  const [newMeetDate, setNewMeetDate] = useState('');
  const [newMeetTime, setNewMeetTime] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinRoomError, setJoinRoomError] = useState('');

  const { logout } = useContext(AuthContext);
  const { socket, setMyMeets, newMeetType, setNewMeetType } = useContext(SocketContext);

  const userId = localStorage.getItem('userId') || '';
  const userName = localStorage.getItem('userName') || '';
  const navigate = useNavigate();

  const handleLogIn = () => navigate('/login');
  const handleLogOut = (e) => { e.preventDefault(); logout(); };

  const handleCreateRoom = () => {
    if (!roomName || !newMeetType || newMeetType === 'Choose meet type') {
      alert('Please fill all required fields!');
      return;
    }
    if (newMeetType === 'scheduled' && (!newMeetDate || !newMeetTime)) {
      alert('Please select date and time for scheduled meeting');
      return;
    }
    if (!socket) {
      alert('Socket connection not available!');
      return;
    }
    socket.emit('create-room', {
  host: userId, // 👈 backend expects this
  roomName,
  meetType: newMeetType,
  meetDate: newMeetDate,
  meetTime: newMeetTime
});

      };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) {
      setJoinRoomError('Please enter a valid room code');
      return;
    }
    socket.emit('user-code-join', { roomId: joinRoomId });
    setJoinRoomError('');
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('room-created', ({ roomId }) => {
      navigate(`/meet/${roomId}`);
    });

    return () => {
      socket.off('room-created');
    };
  }, [socket, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.on('room-exists', ({ roomId }) => {
      navigate(`/meet/${roomId}`);
    });

    socket.on('room-not-exist', () => {
      setJoinRoomError("Room doesn't exist! Please try again.");
      setJoinRoomId('');
    });

    socket.emit('fetch-my-meets', { userId });

    socket.on('meets-fetched', ({ myMeets }) => {
      setMyMeets(myMeets);
    });

    return () => {
      socket.off('room-exists');
      socket.off('room-not-exist');
      socket.off('meets-fetched');
    };
  }, [socket, userId, setMyMeets, navigate]);

  return (
    <div className="homePage">
      <div className="homePage-hero">
        <div className="home-header">
          <div className="home-logo"><h2>Smart Meet</h2></div>
          {!userName || userName === 'null' ? (
            <div className="header-before-login"><button onClick={handleLogIn}>Login</button></div>

            
          ) : (
            <div className="header-after-login">
              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic">{userName}</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile" className="dropdown-options">Profile</Dropdown.Item>
                  <Dropdown.Item className="dropdown-options" onClick={handleLogOut}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}
        </div>

        <div className="home-container container">
          {!userName || userName === 'null' ? (
            <div className="home-app-intro">
              <h2>Unbounded <b>Connections:</b> Elevate Your Meetings with Free, Future-Forward <b>Video Conferencing!!</b></h2>
              <p>Revolutionize your meetings with crystal-clear audio, HD video, and seamless collaboration — all at <b>zero-cost..!!</b></p>
              <button onClick={handleLogIn}>Join Now..</button>
            </div>
          ):( 
            <>
              <div className="home-app-intro">
                <span className="welcome">Welcome!! {userName},</span>
                <h2>Unbounded Connections: Elevate Your Meetings with Free, Future-Forward Video Conferencing!!</h2>
              </div>

              <div className="home-meet-container">
                <div className="create-meet">
                  <input type="text" placeholder="Name your meet..." value={roomName} onChange={(e) => setRoomName(e.target.value)} />
                  <button data-bs-toggle="modal" data-bs-target="#staticBackdrop"><RiVideoAddFill /> New meet</button>
                </div>
                <p>or</p>
                <div className="join-meet">
                  <input type="text" placeholder="Enter code..." value={joinRoomId} onChange={(e) => setJoinRoomId(e.target.value)} />
                  <button onClick={handleJoinRoom}><CgEnter /> Join Meet</button>
                </div>
                <span>{joinRoomError}</span>
              </div>

              <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{ width: '30vw' }}>
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="staticBackdropLabel">Create New Meet</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <div className="form-floating mb-3">
                        <input type="text" className="form-control" id="floatingInput" placeholder="Name your meet" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
                        <label htmlFor="floatingInput">Meet name</label>
                      </div>
                      <select className="form-select" value={newMeetType} onChange={(e) => setNewMeetType(e.target.value)}>
                        <option>Choose meet type</option>
                        <option value="instant">Instant meet</option>
                        <option value="scheduled">Schedule for later</option>
                      </select>
                      {newMeetType === 'scheduled' && (
                        <>
                          <p className="mt-3">Meet Date:</p>
                          <input type="date" className="form-control" onChange={(e) => setNewMeetDate(e.target.value)} />
                          <p className="mt-3">Meet Time:</p>
                          <input type="time" className="form-control" onChange={(e) => setNewMeetTime(e.target.value)} />
                        </>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                      <button type="button" className="btn btn-primary" onClick={handleCreateRoom} data-bs-dismiss="modal">Create meet</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="about-app-container">
        <div className="box">
          <div className="box-inner">
            <div className="box-front">
              <h2>Connect Anytime, Anywhere!</h2>
              <p>Our video conference app brings people closer with easy connectivity and affordability.</p>
            </div>
            <div className="box-back">
              <h2>Your Passport to Seamless Communication!</h2>
              <p>Unlock the world of effortless connectivity with our video conference app.</p>
            </div>
          </div>
        </div>

        <div className="about-cards">
          {[{ icon: <Groups2Icon />, text: 'Easy Group Conference!!' },
            { icon: <CalendarMonthIcon />, text: 'Schedule Meets Any Time!!' },
            { icon: <CurrencyRupeeIcon />, text: 'Free of Cost!!' },
            { icon: <StopCircleIcon />, text: 'Preserve valuable discussions!' },
            { icon: <QuestionAnswerIcon />, text: 'In-Meet Chat Feature!' },
            { icon: <BoltIcon />, text: 'Fast & Reliable!' }]
            .map((item, i) => (
              <Card key={i} className="about-card-body">
                <Card.Body>
                  <Card.Title className="about-card-title"><span>{item.icon}</span></Card.Title>
                  <Card.Text className="about-card-text">{item.text}</Card.Text>
                </Card.Body>
              </Card>
            ))}
        </div>
      </div>

      <div className="footer">
        <h2>Contact us @:</h2>
        <div className="footer-social-media">
          <GoogleIcon /><FacebookIcon /><InstagramIcon /><TwitterIcon />
        </div>
      </div>
    </div>
  );
};

export default Home;
