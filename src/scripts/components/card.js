const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

export const createCardElement = (
  data,
  userId,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  likeCount.textContent = data.likes.length;

  if (data.likes.some((user) => user._id === userId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (data.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(cardElement, data._id);
    });
  }

  cardElement
    .querySelector(".card__control-button_type_info")
    .addEventListener("click", () => {
      onInfoClick(data._id);
    });

  likeButton.addEventListener("click", () => {
    onLikeIcon(data._id, likeButton, likeCount);
  });

  cardImage.addEventListener("click", () => {
    onPreviewPicture({ name: data.name, link: data.link });
  });

  return cardElement;
};
