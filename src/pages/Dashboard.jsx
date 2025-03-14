import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios';
import moment from 'moment-timezone';
import Man from '../assets/man.png'
import Woman from '../assets/woman.png'
import Custom from '../assets/custom.png'
import Secret from '../assets/secret.png'
import BellSound from '../assets/bell.mp3'
import Doodle from '../assets/doodle.png'
import { socket } from '../socket'
import gsap from 'gsap';

const Dashboard = () => {
  const navigate = useNavigate();

  const containerSend = useRef(null);

  const [rooms, setRooms] = useState([]);
  const [chats, setChats] = useState([]);
  const [connection, setConnection] = useState(false);
  const [searchParams] = useSearchParams();

  const [activeRoom, setActiveRoom] = useState({
    name: 'Loading...'
  });

  const [enableRoom, setEnableRoom] = useState(false);

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
        const roomParams = queryRoomParams || 'Student';
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
        navigate('/dashboard');
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
            const roomParams = queryRoomParams || 'Student';
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
            navigate('/dashboard');
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

  const getChats = async (roomActive) => {
    await axios.get(`${import.meta.env.VITE_BACKEND}/chats/dashboard/${roomActive.token}`, {
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
    const inputManual = prompt('TOKEN CUSTOM\nIsi token ruangan yang ingin diakses, contoh: 46155');
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

    setTimeout(() => {
      scrollToRef();
    }, 1000);

    function onConnect() {
      setConnection(true);
    }

    function onDisconnect() {
      setConnection(false);
    }

    function onMessage(message) {
      const roomStringify = localStorage.getItem('HELPDESK:room');
      if (roomStringify) {
        const roomParse = JSON.parse(roomStringify);
        if (message.token == roomParse.token) {
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

  // useEffect(() => {
  //   let ctx = gsap.context(() => {
  //     gsap.from(containerSend.current.querySelector("#container-account"), {
  //       duration: 3,
  //       y: -800,
  //       rotation: -180,
  //       delay: 0.5,
  //       ease: "elastic.out(1,0.3)"
  //     });
  //     gsap.from(containerSend.current.querySelector("#container-setting"), {
  //       duration: 3,
  //       y: -800,
  //       rotation: -180,
  //       delay: 0.8,
  //       ease: "elastic.out(1,0.3)"
  //     });
  //   }, containerSend);

  //   return () => ctx.revert();
  // }, []);

  return (
    <main ref={containerSend} className='flex flex-col overflow-y-auto h-screen px-8 pt-28 pb-10'>
      <div className="absolute inset-0 bg-cover bg-center opacity-3 z-0 h-screen" style={{ backgroundImage: `url(${Doodle})` }}></div>

      <div id='container-account' onClick={() => rooms.length > 0 && setEnableRoom(!enableRoom)} className={`${connection ? 'bg-emerald-500 border-emerald-700/30' : 'bg-red-500 border-red-700/30'} text-white drop-shadow  rounded-2xl border-b-4 px-5 py-3 flex items-center gap-2 cursor-pointer fixed z-50 top-10 left-10`}>
        <i className={`fi fi-rr-user-headset text-base flex ${connection ? 'bg-emerald-600' : 'bg-red-600'} p-2 rounded-lg`}></i>
        <h1 className='font-bold text-lg'>Dashboard {activeRoom.name}</h1>
        {
          rooms.length > 0 &&
          <i className="fi fi-rr-dropdown-select flex text-sm"></i>
        }
      </div>
      {
        rooms.length > 0 && enableRoom && (
          <div className={`max-w-xs absolute bg-white text-gray-900 drop-shadow rounded-2xl border-b-4 border-gray-300 px-5 py-3 flex flex-wrap justify-center items-center gap-3 top-28 left-10 z-50`}>
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

      <div id='container-setting' className='fixed z-50 top-10 right-10 bg-white border-b-4 border-gray-300 drop-shadow rounded-2xl px-5 py-3 flex items-center gap-5'>
        <button onClick={removeToken} type='button' className='cursor-pointer text-red-700 hover:text-red-800'>
          <i className="fi fi-rr-sign-out-alt"></i>
        </button>
        <button onClick={() => bellPlay()} type='button' className='cursor-pointer text-sky-700 hover:text-sky-800'>
          <i className="fi fi-rr-bell-ring"></i>
        </button>
        <a href={`${import.meta.env.VITE_BACKEND}/chats/download/${activeRoom.token}`} target='_blank' className='cursor-pointer text-sky-700 hover:text-sky-800'>
          <i className="fi fi-rr-download"></i>
        </a>
        <button onClick={() => navigate('/admin')} type='button' className='cursor-pointer text-sky-700 hover:text-sky-800'>
          <i className="fi fi-rr-mobile-notch flex text-sm"></i>
        </button>
        <button type='button' onClick={scrollToRef} className={`${connection ? 'text-emerald-500' : 'text-red-500'} cursor-pointer`}>
          <i className="fi fi-rr-wifi"></i>
        </button>
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
    </main>
  )
}

export default Dashboard