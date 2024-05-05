'use client'

import { useState, useRef, useEffect } from 'react';
import Input from '@/components/templates/Input'
import TypingAnimation from '@/components/modules/TypingAnimation'

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

    if (isLoading) { 
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

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
    .catch((error) => console.error('Error copying message:', error));
  };

  const handleLoadingChange = (loading) => {
    shouldScrollToBottom.current = !loading; // If loading, don't scroll to bottom
    setIsLoading(loading);
  };


  return (
    <div className='h-screen'>
    <div  className='container mx-auto relative h-screen px-3'>
      <div className='w-full bg-[#EDB836] py-3 sticky top-0'>
        <h1 className='text-center text-[28px]'>Devpct Chatbot</h1>
      </div>

      <div className="w-full flex flex-col gap-3 text-white pb-[120px]">
        {combinedMessages.map((msg) => (
          <div
            key={msg.index}
            ref={msg.index === combinedMessages.length - 1 ? lastMessageRef : null}
            className={`lg:w-[720px] w-full rounded-2xl ${msg.sender === 'user' ? 'bg-[#2B2B2B]' : 'bg-[#636363]'} mx-auto p-3`}
            style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
          >
            <div className="flex gap-2 items-center">
              <img src={`/${msg.sender === 'user' ? 'user' : 'devpct'}.svg`} alt="" />
              <p className='font-bold'>{msg.sender === 'user' ? 'You' : 'Devpct'}</p>
            </div>
            <p className={`p-3 ${getMessageDirection(msg.message)}`}>
              {
              msg.sender === 'bot' ? (<TypingAnimation message={msg.message} />
            ) :( 
              msg.message)
            }
            </p>
            {msg.sender === 'bot' && (
              <button className="pl-1 pt-2" onClick={() => copyToClipboard(msg.message, msg.index)}>
                {copiedMessageIndex === msg.index ? (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="13" height="13" x="9" y="9" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="lg:w-[720px] w-full h-[100px] rounded-2xl bg-[#636363] mx-auto p-3">
            <div className="flex gap-2 items-center">
              <img src={`/devpct.svg`} alt="" />
              <p className='font-bold'>Devpct</p>
            </div>
            <div className="animated-circle m-3"></div>
              </div>
        )}
        {combinedMessages.length === 0 && (
          <img src="/bg.png" className='img w-[20rem] mx-auto mt-[20vh]' alt="" />
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
