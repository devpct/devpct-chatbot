'use client'
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

enum Direction {
  LTR = 'ltr',
  RTL = 'rtl'
}

export default function Home() {
  const [textareaHeight, setTextareaHeight] = useState('auto');
  const [direction, setDirection] = useState(Direction.LTR);
  const [userInput, setUserInput] = useState('');
  const [userMessages, setUserMessages] = useState([]);
  const [botMessages, setBotMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBotResponding, setIsBotResponding] = useState(true);
  const [cancelClicked, setCancelClicked] = useState(false); 
  const lastMessageRef = useRef(null);

  const handleFirstCharChange = (event) => {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setTextareaHeight(`${textarea.scrollHeight}px`);
    const firstChar = textarea.value.trim()[0];
    if (/[\u0600-\u06FF]/.test(firstChar)) {
      setDirection(Direction.RTL);
    } else {
      setDirection(Direction.LTR);
    }
  };

  const fetchBotReply = async (inputText) => {
    setIsLoading(true);
    setIsBotResponding(false);
    try {
      const response = await axios.post('http://localhost:3000/api', {
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
      return null;
    }
  };

  const handleSendMessage = async () => {
    const userMessage = userInput.trim();
    if (userMessage !== '' && isBotResponding) {
      setUserMessages(prevUserMessages => [...prevUserMessages, userMessage]); 
      setUserInput('');
      setIsBotResponding(false);

      const botResponse = await fetchBotReply(userMessage);
      if (botResponse) {
        setBotMessages(prevBotMessages => [...prevBotMessages, botResponse.botReply]);
        setIsBotResponding(true); 
      }
    }
  };

  
  const handleCancelClick = () => {
    setCancelClicked(true);
    setIsBotResponding(true); 
    setIsLoading(false); 
    setUserMessages(prevUserMessages => prevUserMessages.slice(0, -1));
  };
  

  useEffect(() => {
    if (cancelClicked) {
      setCancelClicked(false); 
    }
  }, [cancelClicked]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userMessages, botMessages]);

  const combinedMessages = [];
  for (let i = 0; i < Math.max(userMessages.length, botMessages.length); i++) {
    if (userMessages[i]) {
      combinedMessages.push({ sender: 'user', message: userMessages[i] });
    }
    if (botMessages[i]) {
      combinedMessages.push({ sender: 'bot', message: botMessages[i] });
    }
  }

  return (
    <>
    <div className='container mx-auto relative h-screen px-3'>
      <div className='w-full bg-[#EDB836] py-3 sticky top-0'>
        <h1 className='text-center text-[28px]'>Devpct Chatbot</h1>
      </div>

      <div className="w-full flex flex-col gap-3 text-white pb-[110px]">
        {combinedMessages.map((msg, index) => (
          <div
            key={index}
            ref={index === combinedMessages.length - 1 ? lastMessageRef : null}
            className={`lg:w-[720px] w-full rounded-2xl ${msg.sender === 'user' ? 'bg-[#2B2B2B]' : 'bg-[#636363]'} mx-auto p-3`}
            style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
          >
            <div className="flex gap-2 items-center">
              <img src={`/${msg.sender === 'user' ? 'user' : 'devpct'}.svg`} alt="" />
              <p className='font-bold'>{msg.sender === 'user' ? 'You' : 'Devpct'}</p>
            </div>
            <p className='p-3'>{msg.message}</p>
          </div>
        ))}
        {isLoading && (
          <div className="lg:w-[720px] w-full rounded-2xl bg-[#636363] mx-auto p-3">
            <p className='p-3'>Loading...</p>
            <button className="bg-red-500 text-white px-3 py-1 rounded-md mt-2" onClick={handleCancelClick}>Cancel</button>
          </div>
        )}
        {combinedMessages.length == 0 &&
          <img src="/bg.png" className='w-[20rem] mx-auto mt-[20vh]' alt="" />
        }
      </div>

      <div className='w-full bg-[#EDB836] p-3 fixed bottom-0 left-1'>
        <div className="w-full flex gap-3 items-end justify-center">
          <div className="border-black border sm:w-[665px] w-full max-h-[215px] overflow-auto px-3 pt-3 pb-2 rounded-2xl">
            <textarea
              placeholder='Message Devpct...'
              className="bg-transparent text-md focus:outline-none text-black resize-none placeholder-black flex-1 w-full"
              style={{ height: textareaHeight, direction: direction }}
              value={userInput}
              onChange={(e) => {
                handleFirstCharChange(e);
                setUserInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              disabled={!isBotResponding || isLoading}
            />
          </div>
          <button className='w-[48px] h-[48px] bg-[#636363] rounded-full grid' onClick={handleSendMessage} disabled={!isBotResponding || isLoading}>
            <svg className='m-auto' width="28" height="28" fill="none" stroke="#EDB836" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 19V5"></path>
              <path d="m5 12 7-7 7 7"></path>
            </svg>
          </button>
        </div>
        <p className='text-center sm:text-[13px] text-[10px] text-[#404040] pt-2'>devpct chatbot created by Mohammad Abdollahzadeh in 2024</p>
      </div>
    </div>
    </>
  );
}
