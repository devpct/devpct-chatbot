import { useState, useEffect } from 'react';

export default function TypingAnimation({ message }) {

  const [typedMessage, setTypedMessage] = useState('');
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (index < message.length) {
        setTypedMessage(prevTypedMessage => prevTypedMessage + message.charAt(index));
        setIndex(prevIndex => prevIndex + 1);
        
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      } else {
        clearInterval(typingInterval);
      }
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 10);
  
    return () => clearInterval(typingInterval);
  }, [index, message]);

  const getMessageDirection = (message) => {
    let direction = 'text-left';
    const persianPattern = /[\u0600-\u06FF]/;
    for (let i = 0; i < message.length; i++) {
      const charCode = message.charCodeAt(i);
      if ((charCode >= 0x0041 && charCode <= 0x005A) || (charCode >= 0x0061 && charCode <= 0x007A)) {
        direction = 'left';
        break;
      } else if (persianPattern.test(message[i])) {
        direction = 'non-english-text';
        break; 
      }
    }
    return direction;
  };

  return (
    <>
      <div className={`flex gap-2  
        ${getMessageDirection(typedMessage) === 'left' ? 'justify-start' : 'justify-end'}`}
        >
        <span className={`${getMessageDirection(typedMessage)}`}>{typedMessage}</span>
      </div>
    </>
  );
}
