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
  const infoButton = cardElement.querySelector(
    ".card__control-button_type_info"
  );
  const cardImage = cardElement.querySelector(".card__image");

  cardElement.dataset.cardId = data._id;
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  likeCount.textContent = data.likes.length;

  const isLiked = data.likes.some((user) => user._id === userId);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (data.owner._id !== userId) {
    deleteButton.remove();
  } else if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
  }

  if (onInfoClick && infoButton) {
    infoButton.addEventListener("click", () => onInfoClick(data._id));
  }

  likeButton.addEventListener("click", () =>
    onLikeIcon(data._id, likeButton, likeCount)
  );

  cardImage.addEventListener("click", () =>
    onPreviewPicture({ name: data.name, link: data.link })
  );

  return cardElement;
};
