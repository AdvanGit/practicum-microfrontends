import React from 'react';
import { Route, Link } from 'react-router-dom';

// В корневом компоненте App описаны обработчики: onRegister, onLogin и onSignOut. Эти обработчики переданы в соответствующие компоненты: Register.js, Login.js, Header.js
function Header ({ email }) {
  function handleSignOut(){
      // при вызове обработчика onSignOut происходит удаление jwt
      localStorage.removeItem("jwt");
      //setIsLoggedIn(false);
      // После успешного вызова обработчика onSignOut происходит редирект на /signin
      history.push("/signin");
    }

  return (
    <header className="header page__section">
      <Route exact path="/">
        <div className="header__wrapper">
          <p className="header__user">{ email }</p>
          <button className="header__logout" onClick={handleSignOut}>Выйти</button>
        </div>
      </Route>
      <Route path="/signup">
        <Link className="header__auth-link" to="signin">Войти</Link>
      </Route>
      <Route path="/signin">
        <Link className="header__auth-link" to="signup">Регистрация</Link>
      </Route>
    </header>
  )
}

export default Header;
