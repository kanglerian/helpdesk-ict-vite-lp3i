import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Lottie from "lottie-react";
import axios from 'axios';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import chatAnimation from "../assets/chat-animation.json";
import Doodle from '../assets/doodle.png'
import Google from '../assets/google.png'
import { socket } from '../socket'
import { jwtDecode } from 'jwt-decode';

gsap.registerPlugin(useGSAP);

const Auth = () => {
  const navigate = useNavigate();

  const containerSend = useRef(null);
  const containerAuth = useRef(null);

  const [connection, setConnection] = useState(false);
  const [searchParams] = useSearchParams();

  const roomParams = searchParams.get("room") || 'Student';
  const [username, setUsername] = useState(searchParams.get("username") || '');
  const [password, setPassword] = useState(searchParams.get("password") || '');
  const [token, setToken] = useState(searchParams.get("token") || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const Authentication = async () => {
    const token = localStorage.getItem('HELPDESK:account');

    if (!token) {
      console.error("No authentication token found.");
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/users/profile`, {
        headers: {
          Authorization: token
        }
      });

      if (response.data.role === 'S') {
        navigate(`/student?room=${roomParams}`);
      } else if (response.data.role === 'A') {
        navigate('/admin');
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem('HELPDESK:account');
          navigate('/login');
        } else if (status === 403) {
          alert("Access denied.");
        } else if (status === 404) {
          alert("User profile not found.");
        } else if (status >= 500) {
          alert("Something went wrong. Please try again later.");
        }
      } else if (error.request) {
        alert("Unable to connect to the server. Please check your internet.");
      } else {
        alert("An unexpected error occurred.");
      }
    }
  }

  const loginFunc = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const responseRoom = await axios.get(`${import.meta.env.VITE_BACKEND}/rooms/${token}`, {
        headers: {
          'api-key': 'bdaeaa3274ac0f2d'
        }
      });

      const dataRoom = responseRoom.data;

      if (!dataRoom) {
        alert("Room tidak ditemukan atau tidak valid.");
        setIsSubmitting(false);
        return;
      }

      const responseUser = await axios.post(`${import.meta.env.VITE_BACKEND}/auth/login`, {
        username: username,
        password: password
      }, {
        headers: {
          'api-key': 'bdaeaa3274ac0f2d'
        },
        withCredentials: true,
      });

      const dataUser = responseUser.data;

      const dataHelpdeskRoom = {
        name: dataRoom.name,
        token: dataRoom.token,
        type: dataRoom.type,
        secret: dataRoom.secret,
      };

      localStorage.setItem('HELPDESK:room', JSON.stringify(dataHelpdeskRoom));

      const decoded = jwtDecode(dataUser.token);
      localStorage.setItem('HELPDESK:account', dataUser.token);

      if (decoded.data.role === 'S') {
        navigate(`/student?room=${roomParams}`);
      } else if (decoded.data.role === 'A') {
        navigate('/admin');
      }
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Terjadi kesalahan saat memproses permintaan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    Authentication();

    function onConnect() {
      console.log('Connected!');
      setConnection(true);
    }

    function onDisconnect() {
      console.log('Disconnected!');
      setConnection(false);
    }


    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (containerSend.current) {
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

    if (containerAuth.current) {
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
      gsap.fromTo('#google', {
        opacity: 0,
        y: -200,
        transformOrigin: 'center top'
      }, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.6,
      });
      gsap.fromTo('#copyright', {
        opacity: 0,
        y: -200,
        transformOrigin: 'center top'
      }, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.7,
      });
    }
  }, [containerAuth]);

  return (
    <main ref={containerAuth} className='relative bg-sky-800 flex flex-col items-center justify-center h-screen'>
      <div className="absolute inset-0 bg-cover bg-center opacity-10 z-0" style={{ backgroundImage: `url(${Doodle})` }}></div>
      <Lottie animationData={chatAnimation} loop={true} className='w-40' />
      <div className='text-center space-y-5 z-10'>
        <div className='space-y-1'>
          <h2 id="auth-title" className='font-bold text-2xl text-white'>Helpdesk Chat <span className='capitalize'>{searchParams.get("room")}</span></h2>
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
          <button disabled={isSubmitting} type="submit" className="w-full flex gap-2 items-center justify-center py-2.5 px-3 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-all ease-in-out cursor-pointer">
            <span>Sign In</span>
          </button>
          <a href={`${import.meta.env.VITE_BACKEND}/download-apk`} id='google' download="helpdesk.apk">
            <img src={Google} alt="Google Play" className='w-32 bg-white/40 rounded-lg' />
          </a>
        </form>
        <Link to={`/license`} target='_blank' id='copyright' className='block text-xs text-sky-400'>© {new Date().getFullYear()} Lerian Febriana. All Rights Reserved.</Link>
      </div>
    </main>
  )
}

export default Auth