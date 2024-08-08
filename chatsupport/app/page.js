'use client'
import { Box, Stack, TextField, Typography, Button } from "@mui/material";
import { useState } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#121212',
      paper: '#1d1d1d',
    },
  },
  typography: {
    fontFamily: 'Arial',
  },
});

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hello! I am your personal fitness assistant. How can I help you today?',
  }]);

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      {
        role: 'user',
        content: message,
      },
      { role: 'assistant', content: '' }
    ]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    const read = () => {
      reader.read().then(({ done, value }) => {
        if (done) {
          return;
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
        read();
      });
    };

    read();

    setMessage('');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box 
        width="100vw" 
        height="100vh" 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center"
        bgcolor="background.default"
        p={2}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
          width="600px"
          height="700px"
          bgcolor="background.paper"
          borderRadius={4}
          boxShadow={3}
          p={2}
        >
          <Typography variant="h6" gutterBottom>
            Total Fit Fitness
          </Typography>
          <Stack
            direction="column"
            width="100%"
            spacing={2}
            flexGrow={1}
            overflow="auto"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              >
                <Box
                  bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                  color="white"
                  borderRadius={16}
                  p={2}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            width="100%"
            mt={2}
          >
            <TextField
              label="Type your message..."
              fullWidth
              variant="outlined"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={sendMessage}>
              Send
            </Button>
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
