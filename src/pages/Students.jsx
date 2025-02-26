import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Lottie from "lottie-react";
import moment from 'moment-timezone';
import axios from 'axios';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import chatAnimation from "../assets/chat-animation.json";
import Man from '../assets/man.png'
import Custom from '../assets/custom.png'
import Secret from '../assets/secret.png'
import BellSound from '../assets/bell.mp3'
import Doodle from '../assets/doodle.png'
import { socket } from '../socket'

gsap.registerPlugin(useGSAP);

const Students = () => {
  const navigate = useNavigate();

  const chatContainerRef = useRef(null);
  const containerSend = useRef(null);
  const containerAuth = useRef(null);

  const [rooms, setRooms] = useState([]);
  const [chats, setChats] = useState([]);
  const [connection, setConnection] = useState(false);
  const [searchParams] = useSearchParams();

  const [client, setClient] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const [enableRoom, setEnableRoom] = useState(false);
  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState('student');
  const [password, setPassword] = useState('helpdeskstudent');
  const [token, setToken] = useState('46150');
  const [message, setMessage] = useState('');
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const Authentication = () => {
    const queryRoomParams = searchParams.get("room");
    const queryTokenParams = searchParams.get("token");
    const roomParams = queryRoomParams || 'anonymous';
    const tokenParams = queryTokenParams || '46150';
    const room = localStorage.getItem('HELPDESK:room');
    const account = localStorage.getItem('HELPDESK:account');
    setClient(roomParams)
    setToken(tokenParams)
    if (account) {
      if (!room) {
        localStorage.removeItem('HELPDESK:room');
        localStorage.removeItem('HELPDESK:account');
        setLogged(false);
        navigate('/')
      } else {
        const roomStorage = localStorage.getItem('HELPDESK:room');
        const roomActive = JSON.parse(roomStorage);
        getChats(roomActive, roomParams);
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

  const getChats = async (roomActive, roomParams) => {
    await axios.get(`https://helpdesk-backend.politekniklp3i-tasikmalaya.ac.id/chats/student/${roomActive.token}/${roomParams}`, {
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

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.log(error.message);
        }
      );
    }
  }

  const changeRoom = (name, token, type, secret) => {
    let data = {
      name: name,
      token: token,
      type: type,
      secret: secret,
    }
    localStorage.setItem('HELPDESK:room', JSON.stringify(data));
    Authentication();
  }

  const manualRoom = () => {
    const inputManual = prompt('TOKEN CUSTOM\nIsi token ruangan yang ingin diakses, contoh: 46155')
    if (inputManual) {
      let data = {
        name: 'Custom',
        token: inputManual,
        type: true,
        secret: false,
      }
      localStorage.setItem('HELPDESK:room', JSON.stringify(data));
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
      localStorage.setItem('HELPDESK:room', JSON.stringify(data));
      Authentication();
    }
  }

  const removeToken = () => {
    const logoutPrompt = confirm('Apakah anda yakin akan keluar?');
    if (logoutPrompt) {
      localStorage.removeItem('HELPDESK:room');
      localStorage.removeItem('HELPDESK:account');
      setLogged(false);
      navigate('/')
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault();
    const accountStringify = localStorage.getItem('HELPDESK:account');
    const roomStringify = localStorage.getItem('HELPDESK:room');
    if (accountStringify && roomStringify) {
      const accountParse = JSON.parse(accountStringify);
      const roomParse = JSON.parse(roomStringify);
      const dataChat = {
        client: client,
        name_room: roomParse.name,
        token: roomParse.token,
        not_save: roomParse.secret,
        uuid_sender: accountParse.uuid,
        name_sender: accountParse.name,
        role_sender: accountParse.role,
        message: message,
        reply: null,
        date: new Date(),
        latitude: latitude,
        longitude: longitude
      }
      setCanSendMessage(false);
      socket.emit('message', dataChat)
      setMessage('');
      setTimeout(() => {
        setCanSendMessage(true);
      }, 7000);
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
      const responseUser = await axios.post(`https://helpdesk-backend.politekniklp3i-tasikmalaya.ac.id/auth/login`, {
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

      localStorage.setItem('HELPDESK:room', JSON.stringify(dataHelpdeskRoom));
      localStorage.setItem('HELPDESK:account', JSON.stringify(dataHelpdeskAccount));
      setLogged(true);
      Authentication();
    } catch (err) {
      console.log(err);
      alert(err.response.data.message)
    }
  }

  useEffect(() => {
    Authentication();
    getLocation();

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
      const queryRoomParams = searchParams.get("room");
      const roomParams = queryRoomParams || 'anonymous';
      const roomStringify = localStorage.getItem('HELPDESK:room');
      if (roomStringify) {
        const roomParse = JSON.parse(roomStringify);
        if (message.token == roomParse.token && (message.reply == roomParams || message.client == roomParams)) {
          setChats(prevChat => [...prevChat, message]);
          setTimeout(() => {
            scrollToRef();
            if (message.role_sender == 'A') {
              bellPlay();
            } else {
              setTimeout(() => {
                let autoreply = {
                  client: 'Help BOT',
                  date: message.date,
                  id: 0,
                  message: "Informasi sudah diterima, mohon ditunggu ya!",
                  name_room: message.name_room,
                  name_sender: 'Help BOT',
                  reply: roomParams,
                  role_sender: 'A',
                  token: message.token,
                  uuid_sender: '0194818245'
                }
                setChats(prevChat => [...prevChat, autoreply]);
                setTimeout(() => {
                  scrollToRef();
                  bellPlay();
                }, 100);
              }, 3000);
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

  useEffect(() => {
    if (logged && containerSend.current) {
      gsap.from('#container-account', {
        duration: 3,
        y: -800,
        rotation: -180,
        delay: 0.5,
        ease: "elastic.out(1,0.3)"
      });
      gsap.from('#container-chat', {
        duration: 1,
        y: -800,
        opacity: 0,
        delay: 3,
      });
      gsap.from('#container-setting', {
        duration: 3,
        y: -800,
        rotation: -180,
        delay: 0.8,
        ease: "elastic.out(1,0.3)"
      });
      gsap.from('#container-message', {
        duration: 3,
        y: -2000,
        rotation: -180,
        delay: 1.1,
        ease: "elastic.out(1,0.3)"
      });
    }

    if (!logged && containerAuth.current) {
      gsap.fromTo('#auth-title', {
        opacity: 0,
        rotate: 50,
        y: -50,
        transformOrigin: 'left top'
      }, {
        opacity: 1,
        y: 0,
        duration: 2,
        rotate: 0,
        delay: 0,
        ease: "elastic.out(1,0.3)",
      });
      gsap.fromTo('#auth-description', {
        opacity: 0,
        rotate: 50,
        y: -50,
        transformOrigin: 'right top'
      }, {
        opacity: 1,
        y: 0,
        duration: 2,
        rotate: 0,
        delay: 0.2,
        ease: "elastic.out(1,0.3)"
      });
      gsap.fromTo('#auth-status', {
        opacity: 0,
        rotate: 60,
        y: -100,
        transformOrigin: 'center top'
      }, {
        opacity: 1,
        y: 0,
        duration: 2,
        rotate: 0,
        delay: 0.4,
        ease: "elastic.out(1,0.3)"
      });
      gsap.fromTo('#auth-form', {
        opacity: 0,
        y: -200,
        transformOrigin: 'center top'
      }, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.5,
      });
      gsap.fromTo('#copyright', {
        opacity: 0,
        y: -200,
        transformOrigin: 'center top'
      }, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.6,
      });
    }
  }, [logged]);

  return (
    <main className={`relative bg-[#EDEDED]`}>
      {
        logged ? (
          <section ref={containerSend} className='flex flex-col overflow-y-auto h-screen pt-26 py-54'>

            <div className="absolute inset-0 bg-cover bg-center opacity-3 z-0 h-screen" style={{ backgroundImage: `url(${Doodle})` }}></div>

            <div className='fixed w-11/12 flex justify-between gap-5 mx-auto z-10 top-5 left-0 right-0'>
              <div id='container-account' onClick={() => rooms.length > 0 && setEnableRoom(!enableRoom)} className={`${connection ? 'bg-emerald-500 border-emerald-700/30' : 'bg-red-500 border-red-700/30'} text-white drop-shadow  rounded-2xl border-b-4 px-5 py-3 flex items-center gap-2`}>
                <i className={`fi fi-rr-user-headset text-lg flex ${connection ? 'bg-emerald-600' : 'bg-red-600'} p-2 rounded-lg`}></i>
                <h1 className='font-bold text-sm'>{activeRoom.name}: {client}</h1>
                {
                  rooms.length > 0 &&
                  <i className="fi fi-rr-dropdown-select flex"></i>
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
                        className="w-auto flex flex-col items-center space-y-1 p-1 md:p-0"
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
                      className="w-auto flex flex-col items-center space-y-1 p-1 md:p-0"
                    >
                      <div className="w-full flex flex-col items-center justify-center gap-1">
                        <div className="w-10 h-10 bg-cover bg-center" style={{ backgroundImage: `url(${Custom})` }}></div>
                        <h4 className="text-xs text-gray-800 font-medium">Manual</h4>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={secretRoom}
                      className="w-auto flex flex-col items-center space-y-1 p-1 md:p-0"
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
                <button onClick={removeToken} type='button' className='text-sky-700 hover:text-sky-800'>
                  <i className="fi fi-rr-key"></i>
                </button>
                <button type='button' onClick={scrollToRef} className={`${connection ? 'text-emerald-500' : 'text-red-500'}`}>
                  <i className="fi fi-rr-wifi"></i>
                </button>
              </div>
            </div>

            <div ref={chatContainerRef} id='container-chat' className="px-5 flex flex-col gap-3">
              {chats.length > 0 && chats.map((chat, index) => (
                <div key={index}>
                  {chat.client.toLowerCase() === client.toLowerCase() ? (
                    <div className="flex justify-end">
                      <div className="relative w-10/12 md:w-7/12">
                        <div className='space-y-2'>
                          <div className='relative shadow bg-blue-500 p-4 pb-10 rounded-2xl'>
                            <p className='text-white text-sm'>{chat.message}</p>
                            <small className='absolute right-4 bottom-3 text-[11px] text-blue-400'>
                              {moment(chat.date).tz('Asia/Jakarta').format('llll')}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <div className="relative w-10/12">
                        <div className='space-y-2'>
                          <div className='relative bg-white shadow p-4 pb-10 rounded-2xl'>
                            <p className='text-gray-900 text-sm'>{chat.message}</p>
                            <small className='absolute right-4 bottom-3 text-[11px] text-gray-400'>
                              {moment(chat.date).tz('Asia/Jakarta').format('llll')}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div id='container-message' className='fixed bg-white border-b-8 border-sky-800 p-5 drop-shadow-xl w-11/12 md:w-1/3 mx-auto bottom-3 left-0 right-0 rounded-3xl space-y-3 flex flex-col items-center justify-center'>
              <form onSubmit={sendMessage} className="w-full flex gap-2 max-w-lg mx-auto">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <i className={`fi fi-rr-${canSendMessage ? 'comment' : 'stopwatch'} text-gray-500`}></i>
                  </div>
                  <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className={`${canSendMessage ? 'bg-gray-100' : 'bg-gray-200'} border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5`} placeholder={`${canSendMessage ? 'Tulis pesan disini...' : 'Tolong ditunggu selama 7 detik...'}`} required disabled={!canSendMessage} autoFocus={true} />
                </div>
                {
                  canSendMessage &&
                  <button type="submit" className="flex gap-2 items-center justify-center py-2.5 px-4 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
                    <i className="flex fi fi-rr-paper-plane"></i>
                  </button>
                }
              </form>
              <div className='w-full text-center max-w-sm space-y-2'>
                <div className='space-y-1'>
                  <h5 className='font-bold text-xs text-gray-600'>Catatan:</h5>
                  <p className='text-[11px] text-gray-500 text-center'>Harap berikan deskripsi masalah yang jelas kepada tim ICT kami, sehingga kami dapat memberikan solusi yang tepat.</p>
                </div>
                <Link to={`/license`} target='_blank' className='block text-[11px] text-gray-700'>© {new Date().getFullYear()} Lerian Febriana. All Rights Reserved.</Link>
              </div>
            </div>

          </section>
        ) : (
          <section ref={containerAuth} className='relative bg-sky-800 flex flex-col items-center justify-center h-screen'>
            <div className="absolute inset-0 bg-cover bg-center opacity-10 z-0" style={{ backgroundImage: `url(${Doodle})` }}></div>
            <Lottie animationData={chatAnimation} loop={true} className='w-1/3 md:w-1/6' />
            <div className='text-center space-y-5 z-10'>
              <div className='space-y-1'>
                <h2 id="auth-title" className='font-bold text-2xl text-white'>Helpdesk Chat {searchParams.get("room")}</h2>
                <p id="auth-description" className='text-sm text-sky-200'>Make simple chat for quick problem solving.</p>
              </div>
              <p id="auth-status" className={`${connection ? 'bg-emerald-500' : 'bg-red-500'} text-white text-xs py-2 rounded-xl`}>
                <i className="fi fi-rr-wifi text-[12px] mr-1"></i>
                <span>{`${connection ? 'Connected' : 'Disconnected'}`}</span>
              </p>
              <form id="auth-form" onSubmit={loginFunc} className='flex flex-col items-center gap-2'>
                <input type="text" id='username' value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Username' className='bg-sky-100 text-sky-900 text-sm rounded-xl block w-full px-4 py-2.5 border border-sky-800 focus:ring-sky-500 focus:border-sky-500' required />
                <input type="password" id='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' className='bg-sky-100 text-sky-900 text-sm rounded-xl block w-full px-4 py-2.5 border border-sky-800 focus:ring-sky-500 focus:border-sky-500' required />
                <input type="number" id='token' value={token} onChange={(e) => setToken(e.target.value)} placeholder='Token' className='bg-sky-100 text-sky-900 text-sm rounded-xl block w-full px-4 py-2.5 border border-sky-800 focus:ring-sky-500 focus:border-sky-500' required />
                <button type="submit" className="w-full flex gap-2 items-center justify-center py-2.5 px-3 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-all ease-in-out">
                  <span>Sign In</span>
                </button>
              </form>
              <Link to={`/license`} target='_blank' id='copyright' className='block text-xs text-sky-400'>© {new Date().getFullYear()} Lerian Febriana. All Rights Reserved.</Link>
            </div>
          </section>
        )
      }
    </main>
  )
}

export default Students