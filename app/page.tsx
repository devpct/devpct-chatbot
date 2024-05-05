'use client'

import { useState, useRef, useEffect } from 'react';
import Input from '@/components/templates/Input'
import axios from 'axios';
import Link from 'next/link';

export default function Home() {
  const [userMessages, setUserMessages] = useState([]);
  const [botMessages, setBotMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBotResponding, setIsBotResponding] = useState(true);
  const [cancelClicked, setCancelClicked] = useState(false); 
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const lastMessageRef = useRef(null);
  const shouldScrollToBottom = useRef(true); 

  useEffect(() => {
    if (cancelClicked) {
      setCancelClicked(false); 
    }
  }, [cancelClicked]);

  useEffect(() => {
    if (lastMessageRef.current && shouldScrollToBottom.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, [userMessages, botMessages, isLoading, shouldScrollToBottom.current]); 

  const combinedMessages = [];
  for (let i = 0; i < Math.max(userMessages.length, botMessages.length); i++) {
    if (userMessages[i]) {
      combinedMessages.push({ sender: 'user', message: userMessages[i], index: i });
    }
    if (botMessages[i]) {
      combinedMessages.push({ sender: 'bot', message: botMessages[i], index: i }); 
    }
  }

  const getMessageDirection = (message) => {
    let direction = 'text-left';
    const persianPattern = /[\u0600-\u06FF]/;
    for (let i = 0; i < message.length; i++) {
        const charCode = message.charCodeAt(i);
        if ((charCode >= 0x0041 && charCode <= 0x005A) || (charCode >= 0x0061 && charCode <= 0x007A)) {
            direction = 'text-left';
            break;
        } else if (persianPattern.test(message[i])) {
            direction = 'text-right non-english-text';
            break; 
        }
    }
    return direction;
  };

  const copyToClipboard = (text, index) => { 
    navigator.clipboard.writeText(text)
    .then(() => {
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 5000); 
    })
  };

  const handleLoadingChange = (loading) => {
    shouldScrollToBottom.current = !loading;
    setIsLoading(loading);
  };

    const fetchBotReply = async (inputText) => {
      setIsLoading(true);
      setIsBotResponding(false);
      try {
        const response = await axios.post('api', {
          text: inputText
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        setIsLoading(false);
        setIsBotResponding(true);
        return response.data;
      } catch (error) {
        setIsLoading(false);
        setIsBotResponding(true);
        console.error('Error fetching bot reply:', error);
        return 'جواب با مشکل مواجه شد';
      }
  };

  return (
    <div className='h-screen'>
    <div  className='container mx-auto relative h-screen px-3 flex flex-col '>
      <div className='w-full bg-[#EDB836] py-3 sticky top-0 flex items-center gap-3 justify-center'>
        <img src="/bg.png" className='img w-[3.5rem]' alt="" />
        <h1 className='text-center text-[28px]'>Devpct Chatbot</h1>
      </div>

      <div className="w-full flex flex-col gap-3 text-white pb-3">
        {combinedMessages.map((msg, index) => (
          <div
            key={msg.index}
            ref={msg.index === combinedMessages.length - 1 ? lastMessageRef : null}
            className={`lg:w-[720px] w-full rounded-2xl ${msg.sender === 'user' ? 'bg-[#2B2B2B]' : 'bg-[rgb(243,243,243)]'} mx-auto p-3`}
            style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
          >
            <div className="flex gap-2 items-center">
              <img className={`${msg.sender === 'user' ? '' : 'border-2 rounded-full'}`} src={`/${msg.sender === 'user' ? 'user' : 'devpct'}.svg`} alt="" />
              <p className={`font-bold ${msg.sender === 'user' ? '' : 'text-[#2B2B2B]'}`}>{msg.sender === 'user' ? 'You' : 'Devpct'}</p>
            </div>
            <p className={`p-3 ${msg.sender === 'user' ? '' : 'text-[#2B2B2B]'} ${getMessageDirection(msg.message)}`}>
              {
              msg.message
              }
            </p>
            {msg.sender === 'bot' && (
              <div className="flex gap-3 items-center pl-1 py-1">
              <button onClick={() => copyToClipboard(msg.message, index)}>
                {copiedMessageIndex === index ? (
                  <svg width="15" height="15" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg width="15" height="15" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="13" height="13" x="9" y="9" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
              { index === combinedMessages.length -1 && (
                <button onClick={async () => {
                    const lastUserMessage = userMessages[userMessages.length - 1]; 
                    const lastBotMessage = botMessages[botMessages.length - 1]; 
                    setBotMessages(prevBotMessages => prevBotMessages.slice(0, -1));
                    
                    let botResponse = await fetchBotReply(lastUserMessage);
                    
                    if (botResponse.botReply === lastBotMessage) {
                      botResponse = await fetchBotReply(lastUserMessage); 
                    }
                    
                    setBotMessages(prevBotMessages => [...prevBotMessages, botResponse.botReply]); 
                  }}>

                  <svg width="15" height="15" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4v6h6"></path>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                </button>
            )}
              </div>
            )}
              {msg.sender !== 'bot' && (
                <button className="pl-1 py-1" onClick={() => copyToClipboard(msg.message, index)}>
                {copiedMessageIndex === index ? (
                  <svg width="15" height="15" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg width="15" height="15" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="13" height="13" x="9" y="9" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
              )}
          </div>
        ))}
        {isLoading && (
          <div className="lg:w-[720px] w-full h-[100px] rounded-2xl bg-[rgb(243,243,243)] mx-auto p-3">
            <div className="flex gap-2 items-center">
              <img className='border-2 rounded-full' src={`/devpct.svg`} alt="" />
              <p className='font-bold text-[#2B2B2B]'>Devpct</p>
            </div>
            <div className="animated-circle m-3"></div>
              </div>
        )}
        {combinedMessages.length === 0 && (
          <div className='shadow-2xl p-3 border rounded-lg border-[#2B2B2B] mx-auto sm:mt-[20vh] mt-[15vh]'>
          <img src="/bg.png" className='img w-[12rem]' alt="" />
          <ul className='mt-6 grid gap-3'>
          <Link href='https://github.com/devpct'>
          <li className='shadow-lg flex items-center gap-3 justify-center p-2 cursor-pointer border border-[#2B2B2B] rounded-lg'>
          <svg width="30" height="30" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.25 22.5v-3.865a3.361 3.361 0 0 0-.94-2.607c3.14-.35 6.44-1.538 6.44-6.99a5.43 5.43 0 0 0-1.5-3.746 5.058 5.058 0 0 0-.09-3.765s-1.18-.35-3.91 1.478a13.397 13.397 0 0 0-7 0C6.52 1.177 5.34 1.527 5.34 1.527a5.058 5.058 0 0 0-.09 3.765 5.43 5.43 0 0 0-1.5 3.775c0 5.413 3.3 6.602 6.44 6.991a3.366 3.366 0 0 0-.94 2.577V22.5"></path>
            <path d="M9.25 19.503c-5 1.498-5-2.496-7-2.996"></path>
          </svg>
          <p className='text-[20px] text-[#2B2B2B] font-bold'>Github</p>
          </li>
          </Link>
          <Link href='https://www.linkedin.com/in/devpct/'>
          <li className='shadow-lg  flex items-center gap-3 justify-center p-2 cursor-pointer border border-[#2B2B2B] rounded-lg'>
            <svg width="30" height="30" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <path d="M2 9h4v12H2z"></path>
            <path d="M4 2a2 2 0 1 0 0 4 2 2 0 1 0 0-4z"></path>
            </svg>

          <p className='text-[20px] text-[#2B2B2B] font-bold'>Linkedin</p>
          </li>
          </Link>
          </ul>
          </div>
        )}
      </div>
      
      <Input
        setIsLoading={handleLoadingChange}
        setIsBotResponding={setIsBotResponding}
        isBotResponding={isBotResponding}
        setUserMessages={setUserMessages}
        setBotMessages={setBotMessages}
        isLoading={isLoading}
        setCancelClicked={setCancelClicked}
      />
      
    </div>
    </div>
  );
}
