import React, { lazy } from "react";
import { Route, useHistory, Switch } from "react-router-dom";
import Main from "./Main";
import Footer from "./Footer";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import ProtectedRoute from "./ProtectedRoute";
import PopupWithForm from "./PopupWithForm";
import { useState } from "react";

function App() {
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
    const [selectedCard, setSelectedCard] = React.useState(null);
    const [cards, setCards] = React.useState([]);

    // В корневом компоненте App создана стейт-переменная currentUser. Она используется в качестве значения для провайдера контекста.
    const [currentUser, setCurrentUser] = React.useState({});

    const [isInfoToolTipOpen, setIsInfoToolTipOpen] = React.useState(false);
    const [tooltipStatus, setTooltipStatus] = React.useState("");

    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    //В компоненты добавлены новые стейт-переменные: email — в компонент App
    const [email, setEmail] = React.useState("");

    const history = useHistory();

    // Запрос к API за информацией о пользователе и массиве карточек выполняется единожды, при монтировании.
    React.useEffect(() => {
        api
            .getAppInfo()
            .then(([cardData, userData]) => {
                setCurrentUser(userData);
                setCards(cardData);
            })
            .catch((err) => console.log(err));
    }, []);

    // при монтировании App описан эффект, проверяющий наличие токена и его валидности

    const EditProfilePopup = lazy(() => import('users/EditProfilePopup').catch(() => {
        return { default: () => <div className='error'>Component is not available!</div> };
    }));
    const EditAvatarPopup = lazy(() => import('users/EditAvatarPopup').catch(() => {
        return { default: () => <div className='error'>Component is not available!</div> };
    }));
    const InfoTooltip = lazy(() => import('users/InfoTooltip').catch(() => {
        return { default: () => <div className='error'>Component is not available!</div> };
    }));
    const Register = lazy(() => import('users/Register').catch(() => {
        return { default: () => <div className='error'>Component is not available!</div> };
    }));
    const Login = lazy(() => import('users/Login').catch(() => {
        return { default: () => <div className='error'>Component is not available!</div> };
    }));
    const Header = lazy(() => import('users/Header').catch(() => {
        return { default: () => <div className='error'>Component is not available!</div> };
    }));

    const AddPlacePopup = lazy(() => import('places/AddPlacePopup').catch(() => {
        return { default: () => <div className='error'>Component is not available!</div> };
    }));
    const ImagePopup = lazy(() => import('places/ImagePopup').catch(() => {
        return { default: () => <div className='error'>Component is not available!</div> };
    }));

    function handleEditProfileClick() {
        setIsEditProfilePopupOpen(true);
    }

    function handleAddPlaceClick() {
        setIsAddPlacePopupOpen(true);
    }

    function handleEditAvatarClick() {
        setIsEditAvatarPopupOpen(true);
    }

    function closeAllPopups() {
        setIsEditProfilePopupOpen(false);
        setIsAddPlacePopupOpen(false);
        setIsEditAvatarPopupOpen(false);
        setIsInfoToolTipOpen(false);
        setSelectedCard(null);
    }

    function handleCardClick(card) {
        setSelectedCard(card);
    }

    function handleUpdateAvatar(avatarUpdate) {
        api
            .setUserAvatar(avatarUpdate)
            .then((newUserData) => {
                setCurrentUser(newUserData);
                closeAllPopups();
            })
            .catch((err) => console.log(err));
    }

    function handleCardLike(card) {
        const isLiked = card.likes.some((i) => i._id === currentUser._id);
        api
            .changeLikeCardStatus(card._id, !isLiked)
            .then((newCard) => {
                setCards((cards) =>
                    cards.map((c) => (c._id === card._id ? newCard : c))
                );
            })
            .catch((err) => console.log(err));
    }

    function handleCardDelete(card) {
        api
            .removeCard(card._id)
            .then(() => {
                setCards((cards) => cards.filter((c) => c._id !== card._id));
            })
            .catch((err) => console.log(err));
    }

    function handleAddPlaceSubmit(newCard) {
        api
            .addCard(newCard)
            .then((newCardFull) => {
                setCards([newCardFull, ...cards]);
                closeAllPopups();
            })
            .catch((err) => console.log(err));
    }

    function onRegister({ email, password }) {
        auth
            .register(email, password)
            .then((res) => {
                setTooltipStatus("success");
                setIsInfoToolTipOpen(true);
                history.push("/signin");
            })
            .catch((err) => {
                setTooltipStatus("fail");
                setIsInfoToolTipOpen(true);
            });
    }

    return (
        // В компонент App внедрён контекст через CurrentUserContext.Provider
        <CurrentUserContext.Provider value={currentUser}>
            <div className="page__content">
                <Header email={email}/>
                <Switch>
                    <ProtectedRoute
                        exact
                        path="/"
                        component={Main}
                        cards={cards}
                        onEditProfile={handleEditProfileClick}
                        onAddPlace={handleAddPlaceClick}
                        onEditAvatar={handleEditAvatarClick}
                        onCardClick={handleCardClick}
                        onCardLike={handleCardLike}
                        onCardDelete={handleCardDelete}
                        loggedIn={isLoggedIn}
                    />
                    <Route path="/signup">
                        <Register onRegister={onRegister} />
                    </Route>
                    <Route path="/signin">
                        <Login onLogin={onLogin} />
                    </Route>
                </Switch>
                <Footer />
                <EditProfilePopup
                    isOpen={isEditProfilePopupOpen}
                    onClose={closeAllPopups}
                />
                <AddPlacePopup
                    isOpen={isAddPlacePopupOpen}
                    onAddPlace={handleAddPlaceSubmit}
                    onClose={closeAllPopups}
                />
                <PopupWithForm title="Вы уверены?" name="remove-card" buttonText="Да" />
                <EditAvatarPopup
                    isOpen={isEditAvatarPopupOpen}
                    onUpdateAvatar={handleUpdateAvatar}
                    onClose={closeAllPopups}
                />
                <ImagePopup card={selectedCard} onClose={closeAllPopups} />
                <InfoTooltip
                    isOpen={isInfoToolTipOpen}
                    onClose={closeAllPopups}
                    status={tooltipStatus}
                />
            </div>
        </CurrentUserContext.Provider>
    );
}

export default App;
