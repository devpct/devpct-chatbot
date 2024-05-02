'use client'

import { useState } from 'react';
import axios from 'axios';

enum Direction {
  LTR = 'ltr',
  RTL = 'rtl'
}

export default function Input({ setIsLoading, setIsBotResponding, isBotResponding, setUserMessages, 
    setBotMessages, isLoading }) {
    const [textareaHeight, setTextareaHeight] = useState('auto');
    const [direction, setDirection] = useState(Direction.LTR);
    const [userInput, setUserInput] = useState('');
  
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
          return null;
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
    };

  return (
    <>
    <div className='w-full bg-[#EDB836] p-3 fixed bottom-0 left-1'>
        <div className="w-full flex gap-3 items-end justify-center">
          <div className="border-black border sm:w-[665px] w-full max-h-[215px] overflow-auto px-3 pt-3 pb-2 rounded-2xl">
            <textarea
              placeholder='Message Devpct'
              className={`bg-transparent text-md focus:outline-none text-black resize-none placeholder-black overflow-hidden py-[6px] flex-1 w-full ${/[\u0600-\u06FF]/.test(userInput) ? 'non-english-text' : ''}`}
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
          <button className='w-[60px] h-[60px] bg-[#636363] rounded-full grid' onClick={handleSendMessage} disabled={!isBotResponding || isLoading}>
            <svg className='m-auto' width="28" height="28" fill="none" stroke="#EDB836" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 19V5"></path>
              <path d="m5 12 7-7 7 7"></path>
            </svg>
          </button>
        </div>
        <p className='text-center sm:text-[13px] text-[10px] text-[#404040] pt-2'>devpct chatbot created by Mohammad Abdollahzadeh in 2024</p>
      </div>
    </>
  );
}
