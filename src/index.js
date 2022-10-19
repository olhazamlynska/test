import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { createMarkup } from './js/createMarkup';
import { pixabayAPI } from './js/PixabayAPI';
import { refs } from './js/refs';

refs.btnLoadMore.classList.add('is-hidden');

const pixaby = new pixabayAPI();

let options = {
  root: null,
  rootMargin: '100px',
  threshold: 1.0,
};

let callback = async function (entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      pixaby.incrementPage();
      observer.unobserve(entry.target);

      try {
        const { hits } = await pixaby.getPhotos();
        const markup = createMarkup(hits).join('');
        refs.gallery.insertAdjacentHTML('beforeend', markup);

        if (pixaby.isShowLoadMore) {
          const target = document.querySelector('.gallery a:last-child');
          observer.observe(target);
        } else
          Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
        modalGallery.refresh();
        scrollPage();
      } catch (error) {
        Notify.failure(error.message, 'Something went wrong!');
        clearPage();
      }
    }
  });
};

let observer = new IntersectionObserver(callback, options);

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
    observer.observe(refs.sentinel);
    if (pixaby.isShowLoadMore) {
      //   refs.btnLoadMore.classList.remove('is-hidden');

      const target = document.querySelector('.gallery a:last-child');
      observer.observe(target);
    }

    scrollPage();
    modalGallery.refresh();
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

    scrollPage();
    modalGallery.refresh();
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
