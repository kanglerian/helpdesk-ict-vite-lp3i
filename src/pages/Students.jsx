import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import moment from 'moment-timezone';
import axios from 'axios';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Man from '../assets/man.png'
import Woman from '../assets/woman.png'
import Custom from '../assets/custom.png'
import Secret from '../assets/secret.png'
import BellSound from '../assets/bell.mp3'
import Doodle from '../assets/doodle.png'
import { socket } from '../socket'
import { jwtDecode } from 'jwt-decode';

gsap.registerPlugin(useGSAP);

const Students = () => {
  const navigate = useNavigate();

  const chatContainerRef = useRef(null);
  const containerSend = useRef(null);

  const [rooms, setRooms] = useState([]);
  const [chats, setChats] = useState([]);
  const [connection, setConnection] = useState(false);
  const [searchParams] = useSearchParams();

  const [client, setClient] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const [enableRoom, setEnableRoom] = useState(false);

  const [token, setToken] = useState(searchParams.get("token") || '46150');
  const [message, setMessage] = useState('');
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const Authentication = async () => {
    const token = localStorage.getItem('HELPDESK:account');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchProfile = async (token) => {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/users/profile`, {
        headers: {
          Authorization: token
        }
      });
      return response.data;
    };

    try {
      const profile = await fetchProfile(token);
      if (profile.role === 'S') {
        const queryRoomParams = searchParams.get("room");
        const queryTokenParams = searchParams.get("token");
        const tokenParams = queryTokenParams;
        const roomParams = queryRoomParams || 'Student';
        const room = localStorage.getItem('HELPDESK:room');
        const account = localStorage.getItem('HELPDESK:account');
        setToken(tokenParams);

        if (account) {
          if (!room) {
            localStorage.removeItem('HELPDESK:room');
            localStorage.removeItem('HELPDESK:account');
          } else {
            const roomStorage = localStorage.getItem('HELPDESK:room');
            const roomActive = JSON.parse(roomStorage);
            setClient(roomParams);
            getChats(roomActive, roomParams);
            setActiveRoom(roomActive);
            getRooms();
          }
        }
        navigate(`/student?room=${roomParams}`);
        return;
      } else if (profile.role === 'A') {
        const room = localStorage.getItem('HELPDESK:room');
        const account = localStorage.getItem('HELPDESK:account');
        if (account) {
          if (!room) {
            localStorage.removeItem('HELPDESK:room');
            localStorage.removeItem('HELPDESK:account');
          } else {
            const roomStorage = localStorage.getItem('HELPDESK:room');
            const roomActive = JSON.parse(roomStorage);
            getChats(roomActive);
            setActiveRoom(roomActive);
            getRooms();
          }
        }
        navigate('/admin');
        return;
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BACKEND}/auth/token`, {
            withCredentials: true,
          });

          const newToken = response.data;
          localStorage.setItem('HELPDESK:account', newToken);
          const profile = await fetchProfile(newToken);
          if (profile.role === 'S') {
            const queryRoomParams = searchParams.get("room");
            const queryTokenParams = searchParams.get("token");
            const tokenParams = queryTokenParams;
            const roomParams = queryRoomParams || 'Student';
            const room = localStorage.getItem('HELPDESK:room');
            const account = localStorage.getItem('HELPDESK:account');
            setToken(tokenParams);

            if (account) {
              if (!room) {
                localStorage.removeItem('HELPDESK:room');
                localStorage.removeItem('HELPDESK:account');
              } else {
                const roomStorage = localStorage.getItem('HELPDESK:room');
                const roomActive = JSON.parse(roomStorage);
                setClient(roomParams);
                getChats(roomActive, roomParams);
                setActiveRoom(roomActive);
                getRooms();
              }
            }
            navigate(`/student?room=${roomParams}`);
            return;
          } else if (profile.role === 'A') {
            const room = localStorage.getItem('HELPDESK:room');
            const account = localStorage.getItem('HELPDESK:account');
            if (account) {
              if (!room) {
                localStorage.removeItem('HELPDESK:room');
                localStorage.removeItem('HELPDESK:account');
              } else {
                const roomStorage = localStorage.getItem('HELPDESK:room');
                const roomActive = JSON.parse(roomStorage);
                getChats(roomActive);
                setActiveRoom(roomActive);
                getRooms();
              }
            }
            navigate('/admin');
            return;
          }
        } catch (error) {
          if (error.response && error.response.status === 403) {
            localStorage.removeItem('HELPDESK:room');
            localStorage.removeItem('HELPDESK:account');
            navigate('/');
          }

          if (error.response && error.response.status === 400) {
            localStorage.removeItem('HELPDESK:room');
            localStorage.removeItem('HELPDESK:account');
            navigate('/');
          }
        }
      } else {
        localStorage.removeItem('HELPDESK:room');
        localStorage.removeItem('HELPDESK:account');
        navigate('/');
      }
    }
  }

  const getRooms = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/rooms`, {
        headers: {
          'api-key': 'bdaeaa3274ac0f2d'
        }
      });

      setRooms(response.data);

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          console.error("Unauthorized: Invalid API Key.");
          alert("Access denied. Please check your API key.");
        } else if (status === 403) {
          console.error("Forbidden: You do not have permission to access this resource.");
          alert("You do not have permission to access this data.");
        } else if (status === 404) {
          console.error("Not Found: The rooms endpoint does not exist.");
          alert("Rooms data not found.");
        } else if (status >= 500) {
          console.error("Server error. Please try again later.");
          alert("Something went wrong on the server. Please try again later.");
        }
      } else if (error.request) {
        console.error("No response from server. Check your internet connection.");
        alert("Unable to connect to the server. Please check your internet connection.");
      } else {
        console.error("Error:", error.message);
        alert("An unexpected error occurred.");
      }
    }
  };

  const getChats = async (roomActive, roomParams) => {
    await axios.get(`${import.meta.env.VITE_BACKEND}/chats/student/${roomActive.token}/${roomParams}`, {
      headers: {
        'api-key': 'bdaeaa3274ac0f2d'
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

  const removeToken = async () => {
    const logoutPrompt = confirm('Apakah anda yakin akan keluar?');
    if (logoutPrompt) {
      try {
        const token = localStorage.getItem('HELPDESK:account');
        if (!token) {
          localStorage.removeItem('HELPDESK:room');
          navigate('/');
          return;
        }
        const responseData = await axios.delete(`${import.meta.env.VITE_BACKEND}/auth/logout`, {
          headers: {
            Authorization: token
          },
          withCredentials: true,
        });
        if (responseData) {
          alert(responseData.data.message);
          localStorage.removeItem('HELPDESK:room');
          localStorage.removeItem('HELPDESK:account');
          navigate('/')
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND}/auth/token`, {
              withCredentials: true,
            });

            const newToken = response.data;
            const responseData = await axios.delete(`${import.meta.env.VITE_BACKEND}/auth/logout`, {
              headers: {
                Authorization: newToken
              },
              withCredentials: true,
            });

            if (responseData) {
              alert(responseData.data.message);
              localStorage.removeItem('HELPDESK:room');
              localStorage.removeItem('HELPDESK:account');
              navigate('/')
            }
          } catch (error) {
            if (error.response && error.response.status === 403) {
              localStorage.removeItem('HELPDESK:room');
              localStorage.removeItem('HELPDESK:account');
              navigate('/');
            }

            if (error.response && error.response.status === 400) {
              localStorage.removeItem('HELPDESK:room');
              localStorage.removeItem('HELPDESK:account');
              navigate('/');
            }
          }
        } else {
          localStorage.removeItem('HELPDESK:room');
          localStorage.removeItem('HELPDESK:account');
          navigate('/');
        }
      }
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault();
    const accountStringify = localStorage.getItem('HELPDESK:account');
    const decoded = jwtDecode(accountStringify);
    const roomStringify = localStorage.getItem('HELPDESK:room');
    if (decoded.data && roomStringify) {
      const roomParse = JSON.parse(roomStringify);
      const dataChat = {
        client: client,
        name_room: roomParse.name,
        token: roomParse.token,
        not_save: roomParse.secret,
        uuid_sender: decoded.data.uuid,
        name_sender: decoded.data.name,
        role_sender: decoded.data.role,
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

  useEffect(() => {
    Authentication();
    getLocation();

    setTimeout(() => {
      scrollToRef();
    }, 500);

    function onConnect() {
      setConnection(true);
    }

    function onDisconnect() {
      setConnection(false);
    }

    function onMessage(message) {
      const queryRoomParams = searchParams.get("room");
      const roomParams = queryRoomParams || 'Student';
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
    let ctx = gsap.context(() => {
      gsap.from(containerSend.current.querySelector("#container-account"), {
        duration: 3,
        y: -800,
        rotation: -180,
        delay: 0.5,
        ease: "elastic.out(1,0.3)"
      });
      gsap.from(containerSend.current.querySelector("#container-chat"), {
        duration: 1,
        y: -800,
        opacity: 0,
        delay: 3,
      });
      gsap.from(containerSend.current.querySelector("#container-setting"), {
        duration: 3,
        y: -800,
        rotation: -180,
        delay: 0.8,
        ease: "elastic.out(1,0.3)"
      });
      gsap.from(containerSend.current.querySelector("#container-message"), {
        duration: 3,
        y: -2000,
        rotation: -180,
        delay: 1.1,
        ease: "elastic.out(1,0.3)"
      });
    }, containerSend);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerSend} className='flex flex-col overflow-y-auto h-screen pt-26 py-54'>

      <div className="absolute inset-0 bg-cover bg-center opacity-3 z-0 h-screen" style={{ backgroundImage: `url(${Doodle})` }}></div>


      <div id='container-account' onClick={() => rooms.length > 0 && setEnableRoom(!enableRoom)} className={`${connection ? 'bg-emerald-500 border-emerald-700/30' : 'bg-red-500 border-red-700/30'} text-white drop-shadow  rounded-2xl border-b-4 px-5 py-3 flex items-center gap-2 cursor-pointer fixed z-50 left-5 top-5`}>
        <i className={`fi fi-rr-user-headset text-sm flex ${connection ? 'bg-emerald-600' : 'bg-red-600'} p-2 rounded-lg`}></i>
        <h1 className='font-bold text-xs'>{activeRoom?.name}: <span className='capitalize'>{client}</span></h1>
        {
          rooms.length > 0 &&
          <i className="fi fi-rr-dropdown-select flex text-sm"></i>
        }
      </div>
      {
        rooms.length > 0 && enableRoom && (
          <div className={`max-w-xs absolute bg-white text-gray-900 drop-shadow rounded-2xl border-b-4 border-gray-300 px-5 py-3 flex flex-wrap justify-center items-center gap-3 top-22 left-5 z-50`}>
            {rooms.map((roomItem, index) => (
              <button
                key={roomItem.id}
                type="button"
                onClick={() => changeRoom(roomItem.name, roomItem.token, roomItem.type, roomItem.secret)}
                className="cursor-pointer w-auto flex flex-col items-center space-y-1 p-1 md:p-0"
              >
                <div className="w-full flex flex-col items-center justify-center gap-1">
                  <div
                    className="w-10 h-10 bg-cover bg-center"
                    style={{ backgroundImage: `url(${index % 2 === 0 ? Man : Woman})` }}
                  ></div>
                  <h4 className="text-xs text-gray-800 font-medium">{roomItem.name}</h4>
                </div>
              </button>
            ))}

            {/* <button
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
            </button> */}
          </div>
        )
      }

      <div id='container-setting' className='fixed z-50 right-5 top-5 bg-white border-b-4 border-gray-300 drop-shadow rounded-2xl px-5 py-3.5 flex flex-col justify-center items-center gap-3.5'>
        <button type='button' onClick={scrollToRef} className={`${connection ? 'text-emerald-500' : 'text-red-500'} cursor-pointer`}>
          <i className="fi fi-rr-wifi flex text-sm"></i>
        </button>
        <button onClick={removeToken} type='button' className='cursor-pointer text-red-700 hover:text-red-800'>
          <i className="fi fi-rr-sign-out-alt flex text-sm"></i>
        </button>
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

      <div id='container-message' className='fixed bg-white border-b-8 border-sky-800 p-5 drop-shadow-xl w-11/12 md:w-full max-w-lg mx-auto bottom-3 left-0 right-0 rounded-3xl space-y-3 flex flex-col items-center justify-center'>
        <form onSubmit={sendMessage} className="w-full flex gap-2 max-w-lg mx-auto">
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <i className={`fi fi-rr-${canSendMessage ? 'comment' : 'stopwatch'} text-gray-500`}></i>
            </div>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className={`${canSendMessage ? 'bg-gray-100' : 'bg-gray-200'} border border-gray-300 text-gray-900 text-xs rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5`} placeholder={`${canSendMessage ? 'Tulis pesan disini...' : 'Tolong ditunggu selama 7 detik...'}`} required disabled={!canSendMessage} autoFocus={true} />
          </div>
          {
            canSendMessage &&
            <button type="submit" className={`relative flex gap-2 items-center justify-center py-2.5 px-4 text-sm font-medium text-white rounded-xl bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300`}>
              <i className="flex fi fi-rr-paper-plane"></i>
            </button>
          }
        </form>
        <div className='w-full text-center max-w-sm space-y-2'>
          <p className='text-[11px] text-gray-500 text-center'>Harap berikan deskripsi masalah yang jelas kepada tim ICT kami, sehingga kami dapat memberikan solusi yang tepat.</p>
          <Link to={`/license`} target='_blank' className='block text-[11px] text-gray-700'>© {new Date().getFullYear()} Lerian Febriana. All Rights Reserved.</Link>
        </div>
      </div>
    </main>
  )
}

export default Students