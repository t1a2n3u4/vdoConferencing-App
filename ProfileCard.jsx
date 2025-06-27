import React, { useContext, useState } from 'react'
import '../styles/ProfileCard.css'
import EditIcon from '@mui/icons-material/Edit';
import { SocketContext } from "../context/SocketContext";


import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ProfileCard = () => {

  const {socket} = useContext(SocketContext);

  const username = localStorage.getItem('userName');
  const email = localStorage.getItem('userEmail');
  const userId = localStorage.getItem('userId');

  const [isUpdate, setIsUpdate] = useState(false);
  const [updateText, setUpdateText] = useState(username);
// eslint-disable-next-line no-unused-vars
  const [profileImg, setProfileImg] = useState('https://cdn.pixabay.com/photo/2013/07/13/11/44/penguin-158551_1280.png');

  const handleUpdate = async () =>{
    await socket.emit("update-username", {updateText, userId});
    setIsUpdate(false);
    console.log("userruu", updateText);
  }


  return (
    <div className='profile-card-body'>
        <button id="update-details-btn" onClick={()=>setIsUpdate(true)}>
          <EditIcon />
        </button>
        <div className="profile-data">

          <div className="profile-img">
            <img src={profileImg} alt="" />
          </div>

          {!isUpdate?
          
            <div className="profile-info">
              <p> Username: <span> {username} </span></p>
              <p>Email Id: <span> {email} </span></p>
            </div>
        
        :

        <div className="update-data">
          <input type="text" placeholder='Update your name' value={updateText} onChange={(e)=> setUpdateText(e.target.value)} />
          <button id='update-btn' onClick={handleUpdate}>Update</button>
        </div>
        }

        </div>


    </div>
  )
}

export default ProfileCard