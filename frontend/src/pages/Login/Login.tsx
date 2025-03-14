import './Login.css'
import { useNavigate } from 'react-router-dom'
import { ChangeEventHandler, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUsers } from '../../store/Slice/Users.slice'
import { RootState, AppDispatch } from '../../store/store'

function Login() {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { users } = useSelector((state: RootState) => state.user);
  const [loggedUser, setLoggedUser] = useState({ email: '', password: '' });

  useEffect(() => {
    dispatch(fetchUsers()); // Загружаем пользователей при монтировании
  }, [dispatch]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setLoggedUser({ ...loggedUser, [e.target.name]: e.target.value });
  };

  const handleSubmit: ChangeEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const user = users.find((u) => u.email === loggedUser.email && u.password === loggedUser.password);

    if (!user) {
      alert("Ошибка пароля или электронной почты. Повторите попытку.");
      return;
    }

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("userId", `${user.id}`);

    navigate("/");
  };

  return (
    <div className="login-page">
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit} className="login-forma">
        <input onChange={handleChange} name="email" type="text" placeholder="User email" />
        <input onChange={handleChange} name="password" type="password" placeholder="User password" />
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}

export default Login;
