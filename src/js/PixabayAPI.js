import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';
const API_KEY = '30707124-090c2c800eff03e7656171a71';

export class pixabayAPI {
  #page = 1;
  #perPage = 40;
  #query = '';
  #totalPages = 0;
  #params = {
    params: {
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
    },
  };
  async getPhotos() {
    const urlAXIOS = `?key=${API_KEY}&q=${this.#query}&page=${
      this.#page
    }&per_page=${this.#perPage}`;
    const { data } = await axios.get(urlAXIOS, this.#params);
    return data;
  }

  incrementPage() {
    this.#page += 1;
  }
  resetPage() {
    this.#page = 1;
  }
  set query(newQuery) {
    this.#query = newQuery;
  }
  get query() {
    this.#query;
  }
  calculateTotalPages(total) {
    this.#totalPages = Math.ceil(total / this.#perPage);
  }
  get isShowLoadMore() {
    return this.#page < this.#totalPages;
  }
}
