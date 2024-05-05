'use client'

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

enum Direction {
  LTR = 'ltr',
  RTL = 'rtl'
}

export default function Input({ setIsLoading, setIsBotResponding, isBotResponding, setUserMessages, 
    setBotMessages, isLoading, setCancelClicked }) {
    const [textareaHeight, setTextareaHeight] = useState('auto');
    const [direction, setDirection] = useState(Direction.LTR);
    const [userInput, setUserInput] = useState('');
    const textareaRef = useRef(null);

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

    const handleSendMessage = async () => {
    if(isLoading){
      setIsBotResponding(true); 
      setCancelClicked(true);
      setIsLoading(false); 
      setUserMessages(prevUserMessages => prevUserMessages.slice(0, -1));
    }else{
      const userMessage = userInput.trim();
      if (userMessage !== '' && isBotResponding) {
          setUserMessages(prevUserMessages => [...prevUserMessages, userMessage]); 
          setUserInput('');
          setDirection(Direction.LTR);
          setTextareaHeight('auto')
          setIsBotResponding(false);

          const botResponse = await fetchBotReply(userMessage);
          if (botResponse) {
          setBotMessages(prevBotMessages => [...prevBotMessages, botResponse.botReply]);
          setIsBotResponding(true); 
          }
      }
    }
    };


    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [isLoading]);

    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;
      const bottomThreshold = 100; // Adjust as needed
  
      if (scrollHeight - scrollTop - clientHeight < bottomThreshold) {
        setShowButton(false);
      } else {
        setShowButton(true);
      }
    };
  
    const scrollToBottom = () => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    }
    
  return (
    <>
    <div className='w-full sticky bottom-0 left-1 mt-auto'>
    {showButton && (
        <button
          className='w-fit bg-[#EDB836] border border-[#2B2B2B] p-1 rounded-full shadow-lg mx-auto mb-4 sticky left-[50%] bottom-[100px]'
          onClick={scrollToBottom}
        >
          <svg width="22" height="22" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14"></path>
            <path d="m19 12-7 7-7-7"></path>
          </svg>
        </button>
      )}
      <div className="bg-[#EDB836] py-2">
        <div className="w-full  flex gap-2 items-end justify-center">
          <div className="border-black border sm:w-[665px] w-[85%] max-h-[215px] overflow-auto px-4 py-2 rounded-2xl">
            <textarea
              ref={textareaRef}
              placeholder='Message Devpct'
              className={`bg-transparent text-md focus:outline-none text-black resize-none pt-1.5 placeholder-black overflow-hidden  flex-1 w-full ${/[\u0600-\u06FF]/.test(userInput) ? 'non-english-text' : ''}`}
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
          <button className='w-[55px]  h-[55px] bg-[#2B2B2B] rounded-full grid' onClick={handleSendMessage}>
            <svg className='m-auto' width="28" height="28" fill="none" stroke="#EDB836" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {!isLoading ?
            <>
            <path d="M12 19V5"></path>
            <path d="m5 12 7-7 7 7"></path>
            </>
            :
            <>
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"></path>
            <path d="M9 9h6v6H9z"></path>
            </>
            }
            </svg>
          </button>
        </div>
        <p className='text-center sm:text-[13px] text-[10px] text-[#404040] pt-2'>devpct chatbot (GPT-4)  created by Mohammad Abdollahzadeh in 2024</p>
      </div>
      </div>
    </>
  );
}
