import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard as deleteCardFromServer,
  changeLikeCardStatus,
} from "./components/api.js";
import { createCardElement, deleteCard } from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

let userId = "";

const placesList = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);
const profileSubmitButton = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardSubmitButton = cardForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
const removeCardSubmitButton = removeCardForm.querySelector(".popup__button");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalUsersList = cardInfoModalWindow.querySelector(".popup__list");

let cardToDelete = null;
let cardIdToDelete = "";

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.getElementById("popup-info-definition-template")
    .content;
  const infoItem = template
    .querySelector(".popup__info-item")
    .cloneNode(true);
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  return infoItem;
};

const createUserPreview = (user) => {
  const template = document.getElementById("popup-info-user-preview-template")
    .content;
  const listItem = template
    .querySelector(".popup__list-item")
    .cloneNode(true);
  listItem.textContent = user.name;
  listItem.style.backgroundImage = `url(${user.avatar})`;
  return listItem;
};

const getCardCallbacks = () => ({
  onPreviewPicture: handlePreviewPicture,
  onLikeIcon: handleLikeClick,
  onDeleteCard: handleDeleteCardOpen,
  onInfoClick: handleInfoClick,
});

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  profileSubmitButton.textContent = "Сохранение...";

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      profileSubmitButton.textContent = "Сохранить";
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  avatarSubmitButton.textContent = "Сохранение...";

  setUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      avatarSubmitButton.textContent = "Сохранить";
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  cardSubmitButton.textContent = "Создание...";

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesList.prepend(
        createCardElement(cardData, userId, getCardCallbacks())
      );
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      cardSubmitButton.textContent = "Создать";
    });
};

const handleDeleteCardOpen = (cardElement, cardId) => {
  cardToDelete = cardElement;
  cardIdToDelete = cardId;
  openModalWindow(removeCardModalWindow);
};

const handleRemoveCardSubmit = (evt) => {
  evt.preventDefault();
  removeCardSubmitButton.textContent = "Удаление...";

  deleteCardFromServer(cardIdToDelete)
    .then(() => {
      deleteCard(cardToDelete);
      closeModalWindow(removeCardModalWindow);
      cardToDelete = null;
      cardIdToDelete = "";
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      removeCardSubmitButton.textContent = "Да";
    });
};

const handleLikeClick = (cardId, likeButton, likeCount) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardId, isLiked)
    .then((cardData) => {
      likeCount.textContent = cardData.likes.length;
      const isLikedByUser = cardData.likes.some((user) => user._id === userId);
      likeButton.classList.toggle(
        "card__like-button_is-active",
        isLikedByUser
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) {
        return;
      }

      cardInfoModalTitle.textContent = "Информация о карточке";
      cardInfoModalText.textContent = "Кому понравилось:";
      cardInfoModalInfoList.replaceChildren();
      cardInfoModalUsersList.replaceChildren();

      cardInfoModalInfoList.append(
        createInfoString("Название:", cardData.name)
      );
      cardInfoModalInfoList.append(
        createInfoString("Автор:", cardData.owner.name)
      );
      cardInfoModalInfoList.append(
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt))
        )
      );
      cardInfoModalInfoList.append(
        createInfoString("Лайков:", String(cardData.likes.length))
      );

      cardData.likes.forEach((user) => {
        cardInfoModalUsersList.append(createUserPreview(user));
      });

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  [profileTitleInput, profileDescriptionInput].forEach((inputElement) => {
    inputElement.dispatchEvent(new Event("input", { bubbles: true }));
  });
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationConfig);

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    userId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesList.prepend(
        createCardElement(cardData, userId, getCardCallbacks())
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
