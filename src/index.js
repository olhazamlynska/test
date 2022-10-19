import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { createMarkup } from './js/createMarkup';
import { pixabayAPI } from './js/PixabayAPI';
import { refs } from './js/refs';

const pixaby = new pixabayAPI();
refs.btnLoadMore.classList.add('is-hidden');

const handleSubmit = async event => {
  event.preventDefault();

  const {
    elements: { searchQuery },
  } = event.currentTarget;

  const searchquery = searchQuery.value.trim().toLowerCase();

  if (!searchquery) {
    Notify.info('Enter data to search!');
    return;
  }

  pixaby.query = searchquery;

  clearPage();

  try {
    const { hits, total } = await pixaby.getPhotos();

    if (hits.length === 0) {
      Notify.failure(
        `Sorry, there are no images matching your ${searchquery}. Please try again.`
      );
      return;
    }

    const markup = createMarkup(hits).join('');
    refs.gallery.insertAdjacentHTML('beforeend', markup);
    pixaby.calculateTotalPages(total);
    Notify.success(`Hooray! We found ${total} images.`);

    if (pixaby.isShowLoadMore) {
      refs.btnLoadMore.classList.remove('is-hidden');
    }
    modalGallery.refresh();
    scrollPage();
  } catch (error) {
    Notify.failure(error.message, 'Something went wrong!');
    clearPage();
  }
};

const onLoadMore = async () => {
  pixaby.incrementPage();

  if (!pixaby.isShowLoadMore) {
    refs.btnLoadMore.classList.add('is-hidden');
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
  try {
    const { hits } = await pixaby.getPhotos();
    const markup = createMarkup(hits).join('');
    refs.gallery.insertAdjacentHTML('beforeend', markup);

    modalGallery.refresh();
    scrollPage();
  } catch (error) {
    Notify.failure(error.message, 'Something went wrong!');
    clearPage();
  }
};

function clearPage() {
  pixaby.resetPage();
  refs.gallery.innerHTML = '';
  refs.btnLoadMore.classList.add('is-hidden');
}

refs.form.addEventListener('submit', handleSubmit);
refs.btnLoadMore.addEventListener('click', onLoadMore);

const modalGallery = new SimpleLightbox('.gallery a');

function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
