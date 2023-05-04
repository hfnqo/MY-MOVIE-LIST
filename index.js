const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = [] //電影總清單
let filteredMovies = [] //搜尋清單

const MOVIES_PER_PAGE = 12
let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeSwitch = document.querySelector('#mode-switch')

let currentMode = dataPanel.dataset.mode
// const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

function renderAllMovies () {
  axios.get(INDEX_URL).then(res => {
    movies.push(...res.data.results)
    renderPaginator(movies.length)
    changeDisplayMode(currentMode, getMoviesByPage(currentPage))
  })
    .catch(err => console.log(err))
}

function renderMovieCard (data) {
  let rawHTML = ''
  
  data.forEach(item => {
    // title, image, id
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function renderMovieList (data) {
  let rawHTML = `<ul class="list-group col-sm-12">`

  data.forEach(item => {
    rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>
    `
  })
  rawHTML += `</ul>`
  dataPanel.innerHTML = rawHTML
}

function renderPaginator (amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ``

  for (let page = 1; page <= numberOfPages; page++) {
    if (page === currentPage) {
      rawHTML += `
        <li class="page-item"><a class="page-link active" href="#" data-page="${page}">${page}</a></li>
      `
    } else {
      rawHTML += `
        <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
      `
    }
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage (page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal (id) {
  // get element
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  
  // send request to show api
  axios.get(INDEX_URL + id).then(res => {
    const data = res.data.results

    // insert data into modal ui
    modalTitle.textContent = data.title
    modalDate.textContent = 'Release date:' + data.release_date
    modalDescription.textContent = data.description
    modalImage.innerHTML = `
    <img src="${POSTER_URL + data.image}" alt="movie poster" class="img-fluid">
    `
  })
}

function addToFavorite (id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  
  if (list.some(movie => movie.id === id))
    return alert('此電影已加入收藏清單中')

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function changeDisplayMode (displayMode, data) {
  currentMode = displayMode
  
  if (displayMode === 'card-mode') {
    return renderMovieCard(data)
  } else if (displayMode === 'list-mode') {
    return renderMovieList(data)
  }
}

// 監聽切換事件
modeSwitch.addEventListener('click', function onModeSwitchClicked (e) {
  const modeToggle = document.querySelector('#mode-switch .mode-toggle')

  modeToggle.classList.remove('mode-toggle')
  if (e.target.matches('.mode')) {
    e.target.classList.add('mode-toggle')
  }

  changeDisplayMode(e.target.id, getMoviesByPage(currentPage))
})

// listen to data panel
dataPanel.addEventListener('click', function onPanelClicked(e) {
  if (e.target.matches('.btn-show-movie')) {
    showMovieModal(Number(e.target.dataset.id))
  } else if (e.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(e.target.dataset.id))
  }
})

//listen to search form
searchForm.addEventListener('submit', function onSearchFormSubmitted(e) {
  e.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  )
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的的電影`)
  }

  currentPage = 1
  renderPaginator(filteredMovies.length)
  changeDisplayMode(currentMode, getMoviesByPage(currentPage))
})

// listen to paginator
paginator.addEventListener('click', function onPaginatorClicked(e) {
  if (e.target.tagName !== 'A') return

  const activePage = document.querySelector('#paginator .active')
  activePage.classList.remove('active')
  if (e.target.matches('.page-link')) {
    e.target.classList.add('active')
  }

  const page = Number(e.target.dataset.page)
  currentPage = page
  changeDisplayMode(currentMode, getMoviesByPage(currentPage))
})

renderAllMovies(movies)