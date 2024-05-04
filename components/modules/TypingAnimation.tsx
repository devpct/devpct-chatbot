import { useState, useEffect } from 'react';

export default function TypingAnimation({ message }) {
  const [typedMessage, setTypedMessage] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(true);

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < message.length) {
        setTypedMessage(prevTypedMessage => prevTypedMessage + message.charAt(index));
        index++;
      } else {
        setIsTypingComplete(false);
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [message]);

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
      <div className={`flex gap-2 justify-end 
        ${getMessageDirection(typedMessage) === 'left' ? 'flex-row-reverse' : ''}`}
        >
        {isTypingComplete && (
          <div className="animated-circle mt-1"></div>
        )}
        <span className={`${getMessageDirection(typedMessage)}`}>{typedMessage}</span>
      </div>
    </>
  );
}
