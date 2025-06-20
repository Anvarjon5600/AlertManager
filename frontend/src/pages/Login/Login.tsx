import './Login.css';
import { useNavigate } from 'react-router-dom';
import { ChangeEventHandler, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { NutanixStyleParticles } from '../../components/NutanixStyleParticles/NutanixStyleParticles ';
import { Button, styled, TextField } from '@mui/material';
import { loginUser } from '../../store/Slice/Users.slice'; //


//! Стили для input 
const CssTextField = styled(TextField)({
  '& label': {
    color: '#fff',
    fontFamily: '"Rounded Mplus 1c", sans-serif',
    fontSize: '18px',
    fontWeight: 300,
    fontStyle: 'normal',
    letterSpacing: '2px',
    lineHeight: '24px',
  },
  '& label.Mui-focused': {
    color: '#fff',
    fontFamily: '"Rounded Mplus 1c", sans-serif',
    fontSize: '18px',
    fontWeight: 300,
    fontStyle: 'normal',
    letterSpacing: '2px',
    lineHeight: '24px',
  },
  '& .MuiInputBase-input': {
    color: '#fff',
    fontFamily: '"Rounded Mplus 1c", sans-serif',
    fontSize: '18px',
    fontWeight: 300,
    fontStyle: 'normal',
    letterSpacing: '2px',
    lineHeight: '24px',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#B2BAC2',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#E0E3E7',
    },
    '&:hover fieldset': {
      borderColor: '#B2BAC2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6F7E8C',
    },
    '&.Mui-focused .MuiInputBase-input': {
      color: '#fff' // Цвет текста при фокусе
    }
  },
});

//! Стили для кнопки
const SignInButton = styled(Button)({
  fontFamily: '"Rounded Mplus 1c", sans-serif',
  fontWeight: '400',
  fontSize: '16px',
  textTransform: 'none',
  marginTop: '24px',
  fontStyle: 'normal',
  letterSpacing: '2px',
  lineHeight: '24px',
  color: '#fff',
  backgroundColor: 'inherit',
  borderColor: '#fff',
  width: '200px',
  padding: '10px 20px',
});


function Login() {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.user);
  const [loggedUser, setLoggedUser] = useState({ name: '', password: '' });

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setLoggedUser({ ...loggedUser, [e.target.name]: e.target.value });
  };

  const handleSubmit: ChangeEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(loginUser(loggedUser));

      if (loginUser.fulfilled.match(resultAction)) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userId', `${resultAction.payload.id}`);
        navigate('/');
      } else {
        alert('Неверные учетные данные. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      alert('Ошибка входа. Попробуйте позже.');
    }
  };

  return (
    <div>
      <NutanixStyleParticles />
      <div className="login-page">
        <h1 className="login-page__title">ALERTS</h1>
        <form onSubmit={handleSubmit} className="login-forma" autoComplete="off">
          <CssTextField
            style={{ width: '400px' }}
            onChange={handleChange}
            name="name"
            label="username"
            variant="outlined"
          />
          <CssTextField
            style={{ width: '400px' }}
            onChange={handleChange}
            name="password"
            label="password"
            variant="outlined"
            type="password"
          />
          <SignInButton variant="outlined" type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Sign in'}
          </SignInButton>
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;
