import { useEffect, useState, useRef } from 'react';
import './App.css';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  margin: 0;
  padding: 0;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  flex-grow: 1;
  padding: 2rem;
  gap: 20px;
`;

const MessageContainer = styled.div`
  width: 100%;
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: sticky;
  bottom: 0;
`;

const StyledInput = styled.input`
  padding: 12px 20px;
  border-radius: 25px;
  border: none;
  flex-grow: 1;
  font-size: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    transform: scale(1.02);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  }
`;

const SendButton = styled.button`
  padding: 12px 30px;
  border-radius: 25px;
  border: none;
  background: linear-gradient(45deg, #22c55e, #10b981);
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${pulseAnimation} 2s infinite;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  }
`;

const Message = styled.div<{ sender: string }>`
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 25px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.5s ease-out;
  max-width: 80%;
  word-wrap: break-word;
  align-self: ${({ sender }) => (sender === 'me' ? 'flex-end' : 'flex-start')};
  background: ${({ sender }) => (sender === 'me' ? '#22c55e' : '#4b4b4b')};
`;

const LoadingText = styled.div`
  font-size: 24px;
  color: white;
  animation: ${pulseAnimation} 1.5s infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  // Reference to the last message in the container
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:8080');
    newSocket.onopen = () => {
      console.log('Connection established');
      newSocket.send('Hello Server!');
      setSocket(newSocket);
    };
    newSocket.onmessage = (message) => {
      console.log('Message received:', message.data);
      setMessages((prev) => [...prev, { text: message.data, sender: 'server' }]);
    };

    return () => newSocket.close();
  }, []);

  // Scroll to bottom whenever messages are updated
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendClick = () => {
    if (socket && inputValue) {
      const newMessage = { text: inputValue, sender: 'me' };
      setMessages((prev) => [...prev, newMessage]); // Add the sent message to the UI
      socket.send(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  };

  if (!socket) {
    return (
      <Container>
        <LoadingText>Connecting to socket server...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      <ContentWrapper>
        <MessageContainer ref={messageContainerRef}>
          {messages.map((message, index) => (
            <Message key={index} sender={message.sender}>
              {message.text}
            </Message>
          ))}
        </MessageContainer>
        <InputContainer>
          <StyledInput
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
          />
          <SendButton onClick={handleSendClick}>Send</SendButton>
        </InputContainer>
      </ContentWrapper>
    </Container>
  );
}

export default App;
