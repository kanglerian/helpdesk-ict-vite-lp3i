import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Lottie from "lottie-react";
import axios from 'axios';
import moment from 'moment-timezone';
import chatAnimation from "../assets/chat-animation.json";
import Man from '../assets/man.png'
import Custom from '../assets/custom.png'
import Secret from '../assets/secret.png'
import BellSound from '../assets/bell.mp3'
import Doodle from '../assets/doodle.png'
import { socket } from '../socket'

const Dashboard = () => {
  const navigate = useNavigate();

  const containerSend = useRef(null);
  const chatContainerRef = useRef(null);

  const [rooms, setRooms] = useState([]);
  const [chats, setChats] = useState([]);
  const [connection, setConnection] = useState(false);

  const [activeRoom, setActiveRoom] = useState({
    name: 'Loading...'
  });

  const [enableRoom, setEnableRoom] = useState(false);
  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('46150');

  const Authentication = () => {
    const room = localStorage.getItem('HELPDESK:room_dashboard');
    const account = localStorage.getItem('HELPDESK:account_dashboard');
    if (account) {
      if (!room) {
        localStorage.removeItem('HELPDESK:room_dashboard');
        localStorage.removeItem('HELPDESK:account_dashboard');
        setLogged(false);
        navigate('/admin')
      } else {
        const roomStorage = localStorage.getItem('HELPDESK:room_dashboard');
        const roomActive = JSON.parse(roomStorage);
        getChats(roomActive);
        setActiveRoom(roomActive);
        getRooms();
        setLogged(true)
      }
    }
  }

  const getRooms = async () => {
    await axios.get('https://helpdesk-backend.politekniklp3i-tasikmalaya.ac.id/rooms', {
      headers: {
        'lp3i-api-key': 'bdaeaa3274ac0f2d'
      }
    })
      .then((response) => {
        setRooms(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  const getChats = async (roomActive) => {
    await axios.get(`https://helpdesk-backend.politekniklp3i-tasikmalaya.ac.id/chats/dashboard/${roomActive.token}`, {
      headers: {
        'lp3i-api-key': 'bdaeaa3274ac0f2d'
      }
    })
      .then((response) => {
        const responseChat = response.data;
        setChats(responseChat);
      })
      .catch((error) => {
        if (error.response.status == 404) {
          setChats([]);
        }
      })
  }

  const changeRoom = (name, token, type, secret) => {
    let data = {
      name: name,
      token: token,
      type: type,
      secret: secret,
    }
    localStorage.setItem('HELPDESK:room_dashboard', JSON.stringify(data));
    Authentication();
  }

  const manualRoom = () => {
    const inputManual = prompt('TOKEN CUSTOM\nIsi token ruangan yang ingin diakses, contoh: 46155');
    if (inputManual) {
      let data = {
        name: 'Custom',
        token: inputManual,
        type: true,
        secret: false,
      }
      localStorage.setItem('HELPDESK:room_dashboard', JSON.stringify(data));
      Authentication();
    }
  }

  const secretRoom = () => {
    const inputManual = prompt('TOKEN SECRET\nIsi token ruangan yang ingin diakses, contoh: 46122')
    if (inputManual) {
      let data = {
        name: 'Secret',
        token: inputManual,
        type: true,
        secret: true,
      }
      localStorage.setItem('HELPDESK:room_dashboard', JSON.stringify(data));
      Authentication();
    }
  }

  const removeToken = () => {
    const logoutPrompt = confirm('Apakah anda yakin akan keluar?');
    if (logoutPrompt) {
      localStorage.removeItem('HELPDESK:room_dashboard');
      localStorage.removeItem('HELPDESK:account_dashboard');
      setLogged(false);
      navigate('/dashboard')
    }
  }

  const scrollToRef = () => {
    if (containerSend.current) {
      setTimeout(() => {
        containerSend.current.scrollTo({
          top: containerSend.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  const bellPlay = () => {
    let audio = new Audio(BellSound);
    audio.play();
  }

  const loginFunc = async (e) => {
    e.preventDefault();
    try {
      const responseUser = await axios.post(`https://helpdesk-backend.politekniklp3i-tasikmalaya.ac.id/auth/admin/login`, {
        username: username,
        password: password
      }, {
        headers: {
          'lp3i-api-key': 'bdaeaa3274ac0f2d'
        }
      });
      const responseRoom = await axios.get(`https://helpdesk-backend.politekniklp3i-tasikmalaya.ac.id/rooms/${token}`, {
        headers: {
          'lp3i-api-key': 'bdaeaa3274ac0f2d'
        }
      });
      const dataUser = responseUser.data;
      const dataRoom = responseRoom.data;

      let dataHelpdeskRoom = {
        name: dataRoom.name,
        token: dataRoom.token,
        type: dataRoom.type,
        secret: dataRoom.secret,
      }

      let dataHelpdeskAccount = {
        name: dataUser.name,
        uuid: dataUser.uuid,
        role: dataUser.role
      }

      localStorage.setItem('HELPDESK:room_dashboard', JSON.stringify(dataHelpdeskRoom));
      localStorage.setItem('HELPDESK:account_dashboard', JSON.stringify(dataHelpdeskAccount));
      setLogged(true);
      Authentication();
    } catch (err) {
      console.log(err);
      alert(err.response.data.message);
    }
  }

  useEffect(() => {
    Authentication();

    setTimeout(() => {
      scrollToRef();
    }, 500);

    function onConnect() {
      console.log('Connected!');
      setConnection(true);
    }

    function onDisconnect() {
      console.log('Disconnected!');
      setConnection(false);
    }

    function onMessage(message) {
      const roomStringify = localStorage.getItem('HELPDESK:room_dashboard');
      if (roomStringify) {
        const roomParse = JSON.parse(roomStringify);
        if (message.token == roomParse.token && message.role_sender == 'S') {
          setChats(prevChat => [...prevChat, message]);
          setTimeout(() => {
            scrollToRef();
            if (message.role_sender == 'S') {
              bellPlay();
            }
          }, 100);
        }
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message', onMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', onMessage);
    };
  }, []);

  return (
    <main className={`relative bg-[#EDEDED]`}>
      {
        logged ? (
          <section ref={containerSend} className='flex flex-col overflow-y-auto h-screen px-8 py-10'>
            <div className="absolute inset-0 bg-cover bg-center opacity-3 z-0 h-screen" style={{ backgroundImage: `url(${Doodle})` }}></div>

            <div className='fixed w-11/12 flex justify-between gap-5 mx-auto z-10 top-10 left-0 right-0'>
              <div id='container-account' onClick={() => rooms.length > 0 && setEnableRoom(!enableRoom)} className={`${connection ? 'bg-emerald-500 border-emerald-700/30' : 'bg-red-500 border-red-700/30'} text-white drop-shadow  rounded-2xl border-b-4 px-5 py-3 flex items-center gap-2 cursor-pointer`}>
                <i className={`fi fi-rr-user-headset text-lg flex ${connection ? 'bg-emerald-600' : 'bg-red-600'} p-2 rounded-lg`}></i>
                <h1 className='font-bold text-lg'>Dashboard {activeRoom.name}</h1>
                {
                  rooms.length > 0 &&
                  <i className="fi fi-rr-dropdown-select flex text-sm"></i>
                }
              </div>
              {
                rooms.length > 0 && enableRoom && (
                  <div className={`absolute bg-white text-gray-900 drop-shadow  rounded-2xl border-b-4 border-gray-300 px-5 py-3 flex items-center gap-2 top-18`}>
                    {rooms.map((roomItem) => (
                      <button
                        key={roomItem.id}
                        type="button"
                        onClick={() => changeRoom(roomItem.name, roomItem.token, roomItem.type, roomItem.secret)}
                        className="cursor-pointer w-auto flex flex-col items-center space-y-1 p-1 md:p-0"
                      >
                        <div className="w-full flex flex-col items-center justify-center gap-1">
                          <div
                            className="w-10 h-10 bg-cover bg-center"
                            style={{ backgroundImage: `url(${Man})` }}
                          ></div>
                          <h4 className="text-xs text-gray-800 font-medium">{roomItem.name}</h4>
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={manualRoom}
                      className="cursor-pointer w-auto flex flex-col items-center space-y-1 p-1 md:p-0"
                    >
                      <div className="w-full flex flex-col items-center justify-center gap-1">
                        <div className="w-10 h-10 bg-cover bg-center" style={{ backgroundImage: `url(${Custom})` }}></div>
                        <h4 className="text-xs text-gray-800 font-medium">Manual</h4>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={secretRoom}
                      className="cursor-pointer w-auto flex flex-col items-center space-y-1 p-1 md:p-0"
                    >
                      <div className="w-full flex flex-col items-center justify-center gap-1">
                        <div className="w-10 h-10 bg-cover bg-center" style={{ backgroundImage: `url(${Secret})` }}></div>
                        <h4 className="text-xs text-gray-800 font-medium">Secret</h4>
                      </div>
                    </button>
                  </div>
                )
              }

              <div id='container-setting' className='bg-white border-b-4 border-gray-300 drop-shadow rounded-2xl px-5 py-3 flex items-center gap-4'>
                <button onClick={removeToken} type='button' className='cursor-pointer text-sky-700 hover:text-sky-800'>
                  <i className="fi fi-rr-key"></i>
                </button>
                <button onClick={() => bellPlay()} type='button' className='cursor-pointer text-sky-700 hover:text-sky-800'>
                  <i className="fi fi-rr-bell-ring"></i>
                </button>
                <a href={`https://helpdesk-backend.politekniklp3i-tasikmalaya.ac.id/chats/download/${activeRoom.token}`} target='_blank' className='cursor-pointer text-sky-700 hover:text-sky-800'>
                  <i className="fi fi-rr-download"></i>
                </a>
                <button type='button' onClick={scrollToRef} className={`${connection ? 'text-emerald-500' : 'text-red-500'} cursor-pointer`}>
                  <i className="fi fi-rr-wifi"></i>
                </button>
              </div>
            </div>

            <div id='container-chat' className="px-5 flex flex-col gap-3">
              {chats.length > 0 && chats.map((chat, index) => (
                <div key={index}>
                  <div className="w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-3xl shadow-sm p-8 drop-shadow-xl border-8 border-slate-800">
                    <div className="space-y-5 md:space-y-10">
                      <div className="space-y-1 md:space-y-3">
                        <h3 className="font-bold text-sm md:text-xl text-slate-300">Ruangan {chat.client}</h3>
                        <p className="text-base md:text-2xl text-slate-100">{chat.message}</p>
                      </div>
                      <div className='flex items-center justify-between'>
                        <a target='_blank' href={`https://google.com/maps?q=${chat.latitude},${chat.longitude}`} className="text-slate-500 hover:text-slate-600 flex items-center gap-1">
                          <span className="block text-base"><i className="fi fi-rr-marker flex"></i></span>
                          <span className="block text-base">{moment(chat.date).tz('Asia/Jakarta').format('LLLL')}</span>
                        </a>
                        <p className='flex items-center gap-1 text-base text-slate-500'>
                          <i className="fi fi-rr-circle-user flex"></i>
                          <span>{chat.name_sender}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </section>
        ) : (
          <section className='relative bg-sky-800 flex flex-col items-center justify-center h-screen'>
            <div className="absolute inset-0 bg-cover bg-center opacity-10 z-0" style={{ backgroundImage: `url(${Doodle})` }}></div>
            <Lottie animationData={chatAnimation} loop={true} className='w-1/3 md:w-1/6' />
            <div className='text-center space-y-5 z-10'>
              <div className='space-y-1'>
                <h2 className='font-bold text-2xl text-white'>Dashboard Helpdesk Chat</h2>
                <p className='text-sm text-sky-200'>Make simple chat for quick problem solving.</p>
              </div>
              <p className={`${connection ? 'bg-emerald-500' : 'bg-red-500'} text-white text-xs py-2 rounded-xl`}>
                <i className="fi fi-rr-wifi text-[12px] mr-1"></i>
                <span>{`${connection ? 'Connected' : 'Disconnected'}`}</span>
              </p>
              <form onSubmit={loginFunc} className='flex flex-col items-center gap-2'>
                <input type="text" id='username' value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Username' className='bg-sky-100 text-sky-900 text-sm rounded-xl block w-full px-4 py-2.5 border border-sky-800 focus:ring-sky-500 focus:border-sky-500' required />
                <input type="password" id='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' className='bg-sky-100 text-sky-900 text-sm rounded-xl block w-full px-4 py-2.5 border border-sky-800 focus:ring-sky-500 focus:border-sky-500' required />
                <input type="number" id='token' onChange={(e) => setToken(e.target.value)} placeholder='Token' className='bg-sky-100 text-sky-900 text-sm rounded-xl block w-full px-4 py-2.5 border border-sky-800 focus:ring-sky-500 focus:border-sky-500' required />
                <button type="submit" className="w-full flex gap-2 items-center justify-center py-2.5 px-3 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-all ease-in-out cursor-pointer">
                  <span>Sign In</span>
                </button>
              </form>
              <Link to={`/license`} target='_blank' className='block text-xs text-sky-400'>© {new Date().getFullYear()} Lerian Febriana. All Rights Reserved.</Link>
            </div>
          </section>
        )
      }
    </main>
  )
}

export default Dashboard