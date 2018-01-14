import fetch from 'isomorphic-fetch'

export const REQUEST_POSTS = 'REQUEST_POSTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const SELECT_SUBREDDIT = 'SELECT_SUBREDDIT'
export const INVALIDATE_SUBREDDIT = 'INVALIDATE_SUBREDDIT'
export const RECEIVE_SIZE = 'RECEIVE_SIZE'

export function selectSubreddit(subreddit) {
  return {
    type: SELECT_SUBREDDIT,
    subreddit
  }
}

export function selectSize(size) {
  return {
    type: RECEIVE_SIZE,
    size
  }
}

export function invalidateSubreddit(subreddit) {
  return {
    type: INVALIDATE_SUBREDDIT,
    subreddit
  }
}

function requestPosts(subreddit) {
  return {
    type: REQUEST_POSTS,
    subreddit
  }
}

function receivePosts(subreddit, size, json) {
  return {
    type: RECEIVE_POSTS,
    subreddit,
    size,
    posts: json.articles,
    receivedAt: Date.now()
  }
}

function fetchPosts(subreddit, size) {
  return dispatch => {
    dispatch(requestPosts(subreddit))
    return fetch(`https://newsapi.org/v2/everything?q=${subreddit}&pageSize=${size}&apiKey=1b82488a0e2145eea6c06d156187e078`)
      .then(response => response.json())
      .then(json => dispatch(receivePosts(subreddit, size, json)))
  }
}

function shouldFetchPosts(state, subreddit, size) {
  const posts = state.postsBySubreddit[subreddit]
  if (!posts || posts.length !== size) {
    return true
  } else if (posts.isFetching) {
    return false
  } else {
    return posts.didInvalidate
  }
}

export function fetchPostsIfNeeded(subreddit, size) {
  return (dispatch, getState) => {
    if (shouldFetchPosts(getState(), subreddit,size)) {
      return dispatch(fetchPosts(subreddit, size))
    }
  }
}